-- Migration: Fix missing search_path parameter in functions
-- Created: 2024-01-XX
-- Purpose: Add 'SET search_path = public' to functions missing this security parameter

-- =====================================================
-- FIX FUNCTIONS FROM 012_optimize_rls_policies.sql
-- =====================================================

-- Fix get_current_user_id function
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS UUID 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN auth.uid();
END;
$$ LANGUAGE plpgsql STABLE;

-- Fix get_user_project_ids function
CREATE OR REPLACE FUNCTION get_user_project_ids()
RETURNS TABLE(project_id UUID) 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT pm.project_id 
    FROM project_members pm 
    WHERE pm.user_id = get_current_user_id();
END;
$$ LANGUAGE plpgsql STABLE;

-- Fix get_user_admin_project_ids function
CREATE OR REPLACE FUNCTION get_user_admin_project_ids()
RETURNS TABLE(project_id UUID) 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT pm.project_id 
    FROM project_members pm 
    WHERE pm.user_id = get_current_user_id() 
    AND pm.role IN ('owner', 'admin');
END;
$$ LANGUAGE plpgsql STABLE;

-- Fix is_project_member function
CREATE OR REPLACE FUNCTION is_project_member(p_project_id UUID)
RETURNS BOOLEAN 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM project_members pm
        WHERE pm.project_id = p_project_id 
        AND pm.user_id = get_current_user_id()
    );
END;
$$ LANGUAGE plpgsql STABLE;

-- Fix is_project_admin function
CREATE OR REPLACE FUNCTION is_project_admin(p_project_id UUID)
RETURNS BOOLEAN 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM project_members pm
        WHERE pm.project_id = p_project_id 
        AND pm.user_id = get_current_user_id()
        AND pm.role IN ('owner', 'admin')
    );
END;
$$ LANGUAGE plpgsql STABLE;

-- Fix can_access_work_item function
CREATE OR REPLACE FUNCTION can_access_work_item(p_work_item_id UUID)
RETURNS BOOLEAN 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM work_items wi
        WHERE wi.id = p_work_item_id
        AND is_project_member(wi.project_id)
    );
END;
$$ LANGUAGE plpgsql STABLE;

-- =====================================================
-- FIX FUNCTIONS FROM 007_reporting_functions.sql
-- =====================================================

-- Fix get_velocity_trends function
CREATE OR REPLACE FUNCTION get_velocity_trends(p_project_id UUID, p_sprint_count INTEGER DEFAULT 10)
RETURNS TABLE (
  sprint_name TEXT,
  completed_points INTEGER,
  committed_points INTEGER
) 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.name,
    COALESCE(SUM(wi.estimate) FILTER (WHERE wi.status IN (
      SELECT name FROM workflow_states ws 
      JOIN workflows w ON ws.workflow_id = w.id 
      JOIN projects p ON p.workflow_id = w.id 
      WHERE p.id = p_project_id AND ws.category = 'done'
    )), 0)::INTEGER as completed_points,
    COALESCE(SUM(wi.estimate), 0)::INTEGER as committed_points
  FROM sprints s
  LEFT JOIN work_items wi ON wi.sprint_id = s.id
  WHERE s.project_id = p_project_id 
    AND s.status = 'completed'
  GROUP BY s.id, s.name, s.end_date
  ORDER BY s.end_date DESC
  LIMIT p_sprint_count;
END;
$$ LANGUAGE plpgsql;

-- Fix get_team_metrics function
CREATE OR REPLACE FUNCTION get_team_metrics(p_project_id UUID)
RETURNS TABLE (
  member_id UUID,
  member_name TEXT,
  completed_items INTEGER,
  average_cycle_time NUMERIC,
  workload INTEGER,
  utilization NUMERIC
) 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH member_stats AS (
    SELECT 
      pm.user_id,
      u.full_name,
      COUNT(wi.id) FILTER (WHERE wi.status IN (
        SELECT name FROM workflow_states ws 
        JOIN workflows w ON ws.workflow_id = w.id 
        JOIN projects p ON p.workflow_id = w.id 
        WHERE p.id = p_project_id AND ws.category = 'done'
      )) as completed_count,
      AVG(
        CASE 
          WHEN wi.status IN (
            SELECT name FROM workflow_states ws 
            JOIN workflows w ON ws.workflow_id = w.id 
            JOIN projects p ON p.workflow_id = w.id 
            WHERE p.id = p_project_id AND ws.category = 'done'
          ) 
          THEN EXTRACT(EPOCH FROM (wi.updated_at - wi.created_at)) / 86400.0
          ELSE NULL 
        END
      ) as avg_cycle_time,
      COUNT(wi.id) FILTER (WHERE wi.status NOT IN (
        SELECT name FROM workflow_states ws 
        JOIN workflows w ON ws.workflow_id = w.id 
        JOIN projects p ON p.workflow_id = w.id 
        WHERE p.id = p_project_id AND ws.category = 'done'
      )) as current_workload
    FROM project_members pm
    JOIN users u ON u.id = pm.user_id
    LEFT JOIN work_items wi ON wi.assignee_id = pm.user_id AND wi.project_id = p_project_id
    WHERE pm.project_id = p_project_id
    GROUP BY pm.user_id, u.full_name
  )
  SELECT 
    ms.user_id,
    COALESCE(ms.full_name, 'Unknown User'),
    ms.completed_count::INTEGER,
    COALESCE(ms.avg_cycle_time, 0)::NUMERIC,
    ms.current_workload::INTEGER,
    CASE 
      WHEN ms.current_workload + ms.completed_count > 0 
      THEN (ms.completed_count::NUMERIC / (ms.current_workload + ms.completed_count)) * 100
      ELSE 0 
    END::NUMERIC as utilization
  FROM member_stats ms;
END;
$$ LANGUAGE plpgsql;

-- Fix get_cycle_time_analytics function
CREATE OR REPLACE FUNCTION get_cycle_time_analytics(
  p_project_id UUID, 
  p_start_date TIMESTAMP DEFAULT NULL,
  p_end_date TIMESTAMP DEFAULT NULL
)
RETURNS TABLE (
  average_cycle_time NUMERIC,
  average_lead_time NUMERIC,
  throughput NUMERIC
) 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  start_date TIMESTAMP;
  end_date TIMESTAMP;
BEGIN
  -- Set default date range if not provided (last 30 days)
  start_date := COALESCE(p_start_date, NOW() - INTERVAL '30 days');
  end_date := COALESCE(p_end_date, NOW());

  RETURN QUERY
  WITH completed_items AS (
    SELECT 
      wi.*,
      EXTRACT(EPOCH FROM (wi.updated_at - wi.created_at)) / 86400.0 as cycle_time_days
    FROM work_items wi
    WHERE wi.project_id = p_project_id
      AND wi.status IN (
        SELECT name FROM workflow_states ws 
        JOIN workflows w ON ws.workflow_id = w.id 
        JOIN projects p ON p.workflow_id = w.id 
        WHERE p.id = p_project_id AND ws.category = 'done'
      )
      AND wi.updated_at BETWEEN start_date AND end_date
  )
  SELECT 
    COALESCE(AVG(ci.cycle_time_days), 0)::NUMERIC as avg_cycle_time,
    COALESCE(AVG(ci.cycle_time_days), 0)::NUMERIC as avg_lead_time,
    CASE 
      WHEN EXTRACT(DAYS FROM (end_date - start_date)) > 0 
      THEN (COUNT(*)::NUMERIC / EXTRACT(DAYS FROM (end_date - start_date)))
      ELSE 0 
    END::NUMERIC as throughput
  FROM completed_items ci;
END;
$$ LANGUAGE plpgsql;

-- Fix get_completion_rate_analytics function
CREATE OR REPLACE FUNCTION get_completion_rate_analytics(p_project_id UUID)
RETURNS TABLE (
  total_items INTEGER,
  completed_items INTEGER,
  completion_rate NUMERIC,
  completion_trend JSONB
) 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH completion_stats AS (
    SELECT 
      COUNT(*) as total_count,
      COUNT(*) FILTER (WHERE status IN (
        SELECT name FROM workflow_states ws 
        JOIN workflows w ON ws.workflow_id = w.id 
        JOIN projects p ON p.workflow_id = w.id 
        WHERE p.id = p_project_id AND ws.category = 'done'
      )) as completed_count
    FROM work_items wi
    WHERE wi.project_id = p_project_id
  ),
  weekly_completion AS (
    SELECT 
      date_trunc('week', wi.updated_at) as week,
      COUNT(*) as completed_weekly
    FROM work_items wi
    WHERE wi.project_id = p_project_id
      AND wi.status IN (
        SELECT name FROM workflow_states ws 
        JOIN workflows w ON ws.workflow_id = w.id 
        JOIN projects p ON p.workflow_id = w.id 
        WHERE p.id = p_project_id AND ws.category = 'done'
      )
      AND wi.updated_at >= NOW() - INTERVAL '8 weeks'
    GROUP BY date_trunc('week', wi.updated_at)
    ORDER BY week
  )
  SELECT 
    cs.total_count::INTEGER,
    cs.completed_count::INTEGER,
    CASE 
      WHEN cs.total_count > 0 
      THEN (cs.completed_count::NUMERIC / cs.total_count * 100)
      ELSE 0 
    END::NUMERIC as completion_rate,
    COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'week', wc.week,
          'completed', wc.completed_weekly
        ) ORDER BY wc.week
      ), '[]'::jsonb
    ) as completion_trend
  FROM completion_stats cs
  LEFT JOIN weekly_completion wc ON true
  GROUP BY cs.total_count, cs.completed_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FIX FUNCTIONS FROM 008_realtime_collaboration.sql
-- =====================================================

-- Fix update_updated_at_column function (from 008_realtime_collaboration.sql)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Fix create_notification function
CREATE OR REPLACE FUNCTION create_notification(
    p_type notification_type,
    p_title TEXT,
    p_message TEXT,
    p_user_id UUID,
    p_project_id UUID,
    p_work_item_id UUID DEFAULT NULL,
    p_sprint_id UUID DEFAULT NULL,
    p_comment_id UUID DEFAULT NULL,
    p_action_url TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    notification_id UUID;
BEGIN
    INSERT INTO notifications (
        type, title, message, user_id, project_id, 
        work_item_id, sprint_id, comment_id, action_url, metadata
    ) VALUES (
        p_type, p_title, p_message, p_user_id, p_project_id,
        p_work_item_id, p_sprint_id, p_comment_id, p_action_url, p_metadata
    ) RETURNING id INTO notification_id;
    
    RETURN notification_id;
END;
$$ LANGUAGE plpgsql;

-- Fix update_user_presence function
CREATE OR REPLACE FUNCTION update_user_presence(
    p_user_id UUID,
    p_project_id UUID,
    p_status TEXT DEFAULT 'online',
    p_current_page TEXT DEFAULT NULL,
    p_current_work_item UUID DEFAULT NULL,
    p_cursor_x INTEGER DEFAULT NULL,
    p_cursor_y INTEGER DEFAULT NULL
)
RETURNS VOID 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO user_presence (
        user_id, project_id, status, current_page, 
        current_work_item, cursor_x, cursor_y, last_seen
    ) VALUES (
        p_user_id, p_project_id, p_status, p_current_page,
        p_current_work_item, p_cursor_x, p_cursor_y, NOW()
    )
    ON CONFLICT (user_id, project_id) 
    DO UPDATE SET
        status = EXCLUDED.status,
        current_page = EXCLUDED.current_page,
        current_work_item = EXCLUDED.current_work_item,
        cursor_x = EXCLUDED.cursor_x,
        cursor_y = EXCLUDED.cursor_y,
        last_seen = NOW(),
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Fix join_collaborative_session function
CREATE OR REPLACE FUNCTION join_collaborative_session(
    p_work_item_id UUID,
    p_user_data JSONB
)
RETURNS VOID 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    current_users JSONB;
    updated_users JSONB;
BEGIN
    -- Get current active users
    SELECT active_users INTO current_users
    FROM collaborative_sessions
    WHERE work_item_id = p_work_item_id;
    
    -- If session doesn't exist, create it
    IF current_users IS NULL THEN
        INSERT INTO collaborative_sessions (work_item_id, active_users, last_activity)
        VALUES (p_work_item_id, jsonb_build_array(p_user_data), NOW());
    ELSE
        -- Remove user if already exists, then add updated user data
        SELECT jsonb_agg(user_obj)
        INTO updated_users
        FROM jsonb_array_elements(current_users) AS user_obj
        WHERE (user_obj->>'userId') != (p_user_data->>'userId');
        
        -- Add the new/updated user data
        updated_users = COALESCE(updated_users, '[]'::jsonb) || jsonb_build_array(p_user_data);
        
        -- Update the session
        UPDATE collaborative_sessions
        SET active_users = updated_users, last_activity = NOW()
        WHERE work_item_id = p_work_item_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Fix leave_collaborative_session function
CREATE OR REPLACE FUNCTION leave_collaborative_session(
    p_work_item_id UUID,
    p_user_id UUID
)
RETURNS VOID 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    current_users JSONB;
    updated_users JSONB;
BEGIN
    -- Get current active users
    SELECT active_users INTO current_users
    FROM collaborative_sessions
    WHERE work_item_id = p_work_item_id;
    
    IF current_users IS NOT NULL THEN
        -- Remove user from active users
        SELECT jsonb_agg(user_obj)
        INTO updated_users
        FROM jsonb_array_elements(current_users) AS user_obj
        WHERE (user_obj->>'userId') != p_user_id::text;
        
        -- Update or delete session
        IF jsonb_array_length(COALESCE(updated_users, '[]'::jsonb)) = 0 THEN
            DELETE FROM collaborative_sessions WHERE work_item_id = p_work_item_id;
        ELSE
            UPDATE collaborative_sessions
            SET active_users = updated_users, last_activity = NOW()
            WHERE work_item_id = p_work_item_id;
        END IF;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Fix cleanup_old_presence function
CREATE OR REPLACE FUNCTION cleanup_old_presence()
RETURNS VOID 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Mark users as offline if they haven't been seen for more than 5 minutes
    UPDATE user_presence
    SET status = 'offline'
    WHERE last_seen < NOW() - INTERVAL '5 minutes'
    AND status != 'offline';
    
    -- Delete presence records older than 24 hours
    DELETE FROM user_presence
    WHERE last_seen < NOW() - INTERVAL '24 hours';
    
    -- Clean up old collaborative sessions (inactive for more than 1 hour)
    DELETE FROM collaborative_sessions
    WHERE last_activity < NOW() - INTERVAL '1 hour';
    
    -- Clean up old notifications (older than 30 days)
    DELETE FROM notifications
    WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FIX FUNCTIONS FROM 006_retrospective_tables.sql
-- =====================================================

-- Fix vote_retrospective_feedback function
CREATE OR REPLACE FUNCTION vote_retrospective_feedback(
    feedback_id UUID,
    increment_vote BOOLEAN DEFAULT TRUE
)
RETURNS TABLE(
    id UUID,
    retrospective_id UUID,
    user_id UUID,
    category feedback_category,
    content TEXT,
    votes INTEGER,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
)
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE public.retrospective_feedback
    SET votes = CASE 
        WHEN increment_vote THEN votes + 1
        ELSE GREATEST(votes - 1, 0)
    END,
    updated_at = NOW()
    WHERE retrospective_feedback.id = feedback_id;
    
    RETURN QUERY
    SELECT rf.id, rf.retrospective_id, rf.user_id, rf.category, rf.content, rf.votes, rf.created_at, rf.updated_at
    FROM public.retrospective_feedback rf
    WHERE rf.id = feedback_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FIX FUNCTIONS FROM 010_fix_get_project_metrics_function.sql
-- =====================================================

-- Fix get_project_metrics function
CREATE OR REPLACE FUNCTION get_project_metrics(p_project_id UUID)
RETURNS TABLE (
  total_work_items INTEGER,
  completed_work_items INTEGER,
  average_cycle_time NUMERIC,
  average_lead_time NUMERIC,
  throughput NUMERIC
) 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH work_item_stats AS (
    SELECT 
      COUNT(*) as total_items,
      COUNT(*) FILTER (WHERE status IN (
        SELECT name FROM workflow_states ws 
        JOIN workflows w ON ws.workflow_id = w.id 
        JOIN projects p ON p.workflow_id = w.id 
        WHERE p.id = p_project_id AND ws.category = 'done'
      )) as completed_items,
      AVG(
        CASE 
          WHEN status IN (
            SELECT name FROM workflow_states ws 
            JOIN workflows w ON ws.workflow_id = w.id 
            JOIN projects p ON p.workflow_id = w.id 
            WHERE p.id = p_project_id AND ws.category = 'done'
          ) 
          THEN EXTRACT(EPOCH FROM (updated_at - created_at)) / 86400.0 -- Convert to days
          ELSE NULL 
        END
      ) as avg_cycle_time,
      AVG(
        CASE 
          WHEN status IN (
            SELECT name FROM workflow_states ws 
            JOIN workflows w ON ws.workflow_id = w.id 
            JOIN projects p ON p.workflow_id = w.id 
            WHERE p.id = p_project_id AND ws.category = 'done'
          ) 
          THEN EXTRACT(EPOCH FROM (updated_at - created_at)) / 86400.0 -- Convert to days
          ELSE NULL 
        END
      ) as avg_lead_time
    FROM work_items 
    WHERE project_id = p_project_id
  ),
  throughput_stats AS (
    SELECT 
      COUNT(*) / GREATEST(1, EXTRACT(DAYS FROM (MAX(updated_at) - MIN(updated_at)))) as daily_throughput
    FROM work_items 
    WHERE project_id = p_project_id 
      AND status IN (
        SELECT name FROM workflow_states ws 
        JOIN workflows w ON ws.workflow_id = w.id 
        JOIN projects p ON p.workflow_id = w.id 
        WHERE p.id = p_project_id AND ws.category = 'done'
      )
      AND updated_at >= NOW() - INTERVAL '30 days'
  )
  SELECT 
    ws.total_items::INTEGER,
    ws.completed_items::INTEGER,
    COALESCE(ws.avg_cycle_time, 0)::NUMERIC,
    COALESCE(ws.avg_lead_time, 0)::NUMERIC,
    COALESCE(ts.daily_throughput, 0)::NUMERIC
  FROM work_item_stats ws
  CROSS JOIN throughput_stats ts;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

-- Grant execute permissions to authenticated users for all functions
GRANT EXECUTE ON FUNCTION get_current_user_id() TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_project_ids() TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_admin_project_ids() TO authenticated;
GRANT EXECUTE ON FUNCTION is_project_member(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION is_project_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION can_access_work_item(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_velocity_trends(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_team_metrics(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_cycle_time_analytics(UUID, TIMESTAMP, TIMESTAMP) TO authenticated;
GRANT EXECUTE ON FUNCTION get_completion_rate_analytics(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION create_notification(notification_type, TEXT, TEXT, UUID, UUID, UUID, UUID, UUID, TEXT, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION update_user_presence(UUID, UUID, TEXT, TEXT, UUID, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION join_collaborative_session(UUID, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION leave_collaborative_session(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_old_presence() TO authenticated;
GRANT EXECUTE ON FUNCTION vote_retrospective_feedback(UUID, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION get_project_metrics(UUID) TO authenticated;

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON FUNCTION get_current_user_id() IS 'Returns the current authenticated user ID with proper search path security';
COMMENT ON FUNCTION get_user_project_ids() IS 'Returns all project IDs for the current user with proper search path security';
COMMENT ON FUNCTION get_user_admin_project_ids() IS 'Returns project IDs where current user is owner/admin with proper search path security';
COMMENT ON FUNCTION is_project_member(UUID) IS 'Checks if current user is a member of specified project with proper search path security';
COMMENT ON FUNCTION is_project_admin(UUID) IS 'Checks if current user is admin/owner of specified project with proper search path security';
COMMENT ON FUNCTION can_access_work_item(UUID) IS 'Checks if current user can access specified work item with proper search path security';
COMMENT ON FUNCTION get_velocity_trends(UUID, INTEGER) IS 'Returns velocity trends for recent sprints with proper search path security';
COMMENT ON FUNCTION get_team_metrics(UUID) IS 'Returns team member metrics with proper search path security';
COMMENT ON FUNCTION get_cycle_time_analytics(UUID, TIMESTAMP, TIMESTAMP) IS 'Returns cycle time analytics for date range with proper search path security';
COMMENT ON FUNCTION get_completion_rate_analytics(UUID) IS 'Returns completion rate analytics with proper search path security';
COMMENT ON FUNCTION create_notification(notification_type, TEXT, TEXT, UUID, UUID, UUID, UUID, UUID, TEXT, JSONB) IS 'Creates a new notification with proper search path security';
COMMENT ON FUNCTION update_user_presence(UUID, UUID, TEXT, TEXT, UUID, INTEGER, INTEGER) IS 'Updates user presence information with proper search path security';
COMMENT ON FUNCTION join_collaborative_session(UUID, JSONB) IS 'Joins a collaborative session with proper search path security';
COMMENT ON FUNCTION leave_collaborative_session(UUID, UUID) IS 'Leaves a collaborative session with proper search path security';
COMMENT ON FUNCTION cleanup_old_presence() IS 'Cleans up old presence data and collaborative sessions with proper search path security';
COMMENT ON FUNCTION vote_retrospective_feedback(UUID, BOOLEAN) IS 'Votes on retrospective feedback with proper search path security';
COMMENT ON FUNCTION get_project_metrics(UUID) IS 'Returns comprehensive project metrics with proper search path security';
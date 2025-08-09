-- Migration: Add reporting and analytics database functions
-- Created: 2024-01-XX

-- NOTE: get_project_metrics function is defined in migration 010_fix_get_project_metrics_function.sql
-- to resolve conflict with existing function from migration 004_database_functions.sql

/*
-- Function to get comprehensive project metrics (COMMENTED OUT - see migration 010)
CREATE OR REPLACE FUNCTION get_project_metrics(p_project_id UUID)
RETURNS TABLE (
  total_work_items INTEGER,
  completed_work_items INTEGER,
  average_cycle_time NUMERIC,
  average_lead_time NUMERIC,
  throughput NUMERIC
) AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;
*/

-- Function to get velocity trends for recent sprints
CREATE OR REPLACE FUNCTION get_velocity_trends(p_project_id UUID, p_sprint_count INTEGER DEFAULT 10)
RETURNS TABLE (
  sprint_name TEXT,
  completed_points INTEGER,
  committed_points INTEGER
) AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get team member metrics
CREATE OR REPLACE FUNCTION get_team_metrics(p_project_id UUID)
RETURNS TABLE (
  member_id UUID,
  member_name TEXT,
  completed_items INTEGER,
  average_cycle_time NUMERIC,
  workload INTEGER,
  utilization NUMERIC
) AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get cycle time analytics for a date range
CREATE OR REPLACE FUNCTION get_cycle_time_analytics(
  p_project_id UUID, 
  p_start_date TIMESTAMP DEFAULT NULL,
  p_end_date TIMESTAMP DEFAULT NULL
)
RETURNS TABLE (
  average_cycle_time NUMERIC,
  average_lead_time NUMERIC,
  throughput NUMERIC
) AS $$
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
    COALESCE(AVG(ci.cycle_time_days), 0)::NUMERIC as average_cycle_time,
    COALESCE(AVG(ci.cycle_time_days), 0)::NUMERIC as average_lead_time, -- Same as cycle time for now
    COALESCE(
      COUNT(*)::NUMERIC / GREATEST(1, EXTRACT(DAYS FROM (end_date - start_date))), 
      0
    )::NUMERIC as throughput
  FROM completed_items ci;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get completion rate analytics with trend data
CREATE OR REPLACE FUNCTION get_completion_rate_analytics(p_project_id UUID)
RETURNS TABLE (
  total_items INTEGER,
  completed_items INTEGER,
  completion_rate NUMERIC,
  completion_trend JSONB
) AS $$
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
    FROM work_items 
    WHERE project_id = p_project_id
  ),
  daily_completion AS (
    SELECT 
      DATE(updated_at) as completion_date,
      COUNT(*) as daily_completed,
      COUNT(*) OVER (ORDER BY DATE(updated_at) ROWS UNBOUNDED PRECEDING) as cumulative_completed
    FROM work_items 
    WHERE project_id = p_project_id
      AND status IN (
        SELECT name FROM workflow_states ws 
        JOIN workflows w ON ws.workflow_id = w.id 
        JOIN projects p ON p.workflow_id = w.id 
        WHERE p.id = p_project_id AND ws.category = 'done'
      )
      AND updated_at >= NOW() - INTERVAL '30 days'
    GROUP BY DATE(updated_at)
    ORDER BY completion_date
  ),
  trend_data AS (
    SELECT 
      jsonb_agg(
        jsonb_build_object(
          'date', dc.completion_date,
          'completed', dc.cumulative_completed,
          'total', cs.total_count
        ) ORDER BY dc.completion_date
      ) as trend_json
    FROM daily_completion dc
    CROSS JOIN completion_stats cs
  )
  SELECT 
    cs.total_count::INTEGER,
    cs.completed_count::INTEGER,
    CASE 
      WHEN cs.total_count > 0 
      THEN (cs.completed_count::NUMERIC / cs.total_count * 100)
      ELSE 0 
    END::NUMERIC as completion_rate,
    COALESCE(td.trend_json, '[]'::JSONB) as completion_trend
  FROM completion_stats cs
  CROSS JOIN trend_data td;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated users
-- NOTE: get_project_metrics permissions are granted in migration 010_fix_get_project_metrics_function.sql
GRANT EXECUTE ON FUNCTION get_velocity_trends(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_team_metrics(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_cycle_time_analytics(UUID, TIMESTAMP, TIMESTAMP) TO authenticated;
GRANT EXECUTE ON FUNCTION get_completion_rate_analytics(UUID) TO authenticated;

-- Add indexes for better performance on reporting queries
CREATE INDEX IF NOT EXISTS idx_work_items_project_status ON work_items(project_id, status);
CREATE INDEX IF NOT EXISTS idx_work_items_assignee_project ON work_items(assignee_id, project_id);
CREATE INDEX IF NOT EXISTS idx_work_items_updated_at ON work_items(updated_at);
CREATE INDEX IF NOT EXISTS idx_sprints_project_status ON sprints(project_id, status);
CREATE INDEX IF NOT EXISTS idx_sprints_end_date ON sprints(end_date);
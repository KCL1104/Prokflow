-- =====================================================
-- FIX REMAINING FUNCTION SEARCH PATH WARNINGS
-- =====================================================
-- This migration fixes the remaining database functions that still need
-- proper search_path security settings to address Supabase linter warnings.
--
-- Functions fixed:
-- - calculate_sprint_velocity
-- - get_sprint_burndown
-- - check_wip_limit
-- - generate_burndown_data
-- - add_project_owner_as_member
-- - validate_work_item_status_change
-- - validate_workflow_transition
-- Note: get_available_transitions is handled in migration 022_fix_function_return_type_error.sql
-- =====================================================

-- Fix calculate_sprint_velocity function
CREATE OR REPLACE FUNCTION calculate_sprint_velocity(
    p_project_id UUID,
    p_sprint_count INTEGER DEFAULT 5
)
RETURNS NUMERIC 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    avg_velocity NUMERIC;
BEGIN
    -- Calculate average velocity from completed sprints
    SELECT AVG(sprint_points) INTO avg_velocity
    FROM (
        SELECT SUM(COALESCE(wi.estimate, 0)) as sprint_points
        FROM sprints s
        LEFT JOIN work_items wi ON wi.sprint_id = s.id
        JOIN workflow_states ws ON ws.name = wi.status
        JOIN workflows w ON ws.workflow_id = w.id 
        JOIN projects p ON p.workflow_id = w.id 
        WHERE s.project_id = p_project_id
        AND s.status = 'completed'
        AND ws.category = 'done'
        AND p.id = p_project_id
        GROUP BY s.id
        ORDER BY s.end_date DESC
        LIMIT p_sprint_count
    ) recent_sprints;
    
    RETURN COALESCE(avg_velocity, 0);
END;
$$ LANGUAGE plpgsql STABLE;

-- Fix get_sprint_burndown function
CREATE OR REPLACE FUNCTION get_sprint_burndown(p_sprint_id UUID)
RETURNS TABLE(
    date DATE,
    remaining_points INTEGER,
    ideal_remaining INTEGER
) 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    sprint_start DATE;
    sprint_end DATE;
    total_points INTEGER;
    sprint_days INTEGER;
BEGIN
    -- Get sprint details
    SELECT s.start_date, s.end_date INTO sprint_start, sprint_end
    FROM sprints s WHERE s.id = p_sprint_id;
    
    -- Calculate total points
    SELECT COALESCE(SUM(wi.estimate), 0) INTO total_points
    FROM work_items wi WHERE wi.sprint_id = p_sprint_id;
    
    -- Calculate working days
    sprint_days := (sprint_end - sprint_start);
    
    -- Return burndown data (simplified - in real implementation, you'd track daily changes)
    RETURN QUERY
    WITH RECURSIVE date_series AS (
        SELECT sprint_start as date, total_points as remaining, total_points as ideal
        UNION ALL
        SELECT 
            date + 1,
            remaining - CASE 
                WHEN EXTRACT(DOW FROM date + 1) BETWEEN 1 AND 5 
                THEN (total_points / sprint_days)::INTEGER 
                ELSE 0 
            END,
            ideal - CASE 
                WHEN EXTRACT(DOW FROM date + 1) BETWEEN 1 AND 5 
                THEN (total_points / sprint_days)::INTEGER 
                ELSE 0 
            END
        FROM date_series
        WHERE date < sprint_end
    )
    SELECT date_series.date, date_series.remaining, date_series.ideal
    FROM date_series;
END;
$$ LANGUAGE plpgsql STABLE;

-- Fix check_wip_limit function
CREATE OR REPLACE FUNCTION check_wip_limit(
    p_project_id UUID,
    p_status TEXT
)
RETURNS BOOLEAN 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    current_count INTEGER;
    wip_limit INTEGER;
BEGIN
    -- Get the WIP limit for the status
    SELECT ws.wip_limit INTO wip_limit
    FROM projects p
    JOIN workflow_states ws ON ws.workflow_id = p.workflow_id
    WHERE p.id = p_project_id AND ws.name = p_status;
    
    -- If no WIP limit is set, allow the transition
    IF wip_limit IS NULL THEN
        RETURN TRUE;
    END IF;
    
    -- Count current work items in this status
    SELECT COUNT(*) INTO current_count
    FROM work_items wi
    WHERE wi.project_id = p_project_id AND wi.status = p_status;
    
    -- Check if adding one more would exceed the limit
    RETURN current_count < wip_limit;
END;
$$ LANGUAGE plpgsql STABLE;

-- Note: generate_burndown_data function is already properly defined in migration 014_analytics_functions.sql

-- Fix add_project_owner_as_member function
CREATE OR REPLACE FUNCTION add_project_owner_as_member()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Add the project owner as a member with 'owner' role
    INSERT INTO project_members (project_id, user_id, role, joined_at)
    VALUES (NEW.id, NEW.owner_id, 'owner', NOW())
    ON CONFLICT (project_id, user_id) DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Fix validate_work_item_status_change function
CREATE OR REPLACE FUNCTION validate_work_item_status_change()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    project_workflow_id UUID;
    transition_valid BOOLEAN;
    wip_check BOOLEAN;
BEGIN
    -- Get the project's workflow ID
    SELECT p.workflow_id INTO project_workflow_id
    FROM projects p WHERE p.id = NEW.project_id;
    
    -- If status hasn't changed, allow the update
    IF OLD.status = NEW.status THEN
        RETURN NEW;
    END IF;
    
    -- Validate the workflow transition
    SELECT validate_workflow_transition(
        project_workflow_id,
        OLD.status,
        NEW.status
    ) INTO transition_valid;
    
    IF NOT transition_valid THEN
        RAISE EXCEPTION 'Invalid workflow transition from % to %', OLD.status, NEW.status;
    END IF;
    
    -- Check WIP limits
    SELECT check_wip_limit(NEW.project_id, NEW.status) INTO wip_check;
    
    IF NOT wip_check THEN
        RAISE EXCEPTION 'WIP limit exceeded for status %', NEW.status;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Fix validate_workflow_transition function
CREATE OR REPLACE FUNCTION validate_workflow_transition(
    p_workflow_id UUID,
    p_from_state TEXT,
    p_to_state TEXT
)
RETURNS BOOLEAN 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    transition_exists BOOLEAN;
BEGIN
    -- Check if the transition exists in the workflow
    SELECT EXISTS (
        SELECT 1 FROM workflow_transitions wt
        JOIN workflow_states from_ws ON wt.from_state_id = from_ws.id
        JOIN workflow_states to_ws ON wt.to_state_id = to_ws.id
        WHERE wt.workflow_id = p_workflow_id
        AND from_ws.name = p_from_state
        AND to_ws.name = p_to_state
    ) INTO transition_exists;
    
    RETURN transition_exists;
END;
$$ LANGUAGE plpgsql STABLE;

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

GRANT EXECUTE ON FUNCTION calculate_sprint_velocity(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_sprint_burndown(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION check_wip_limit(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION add_project_owner_as_member() TO authenticated;
GRANT EXECUTE ON FUNCTION validate_work_item_status_change() TO authenticated;
GRANT EXECUTE ON FUNCTION validate_workflow_transition(UUID, TEXT, TEXT) TO authenticated;

-- =====================================================
-- DOCUMENTATION COMMENTS
-- =====================================================

COMMENT ON FUNCTION calculate_sprint_velocity(UUID, INTEGER) IS 'Calculates average sprint velocity for a project with proper search path security';
COMMENT ON FUNCTION get_sprint_burndown(UUID) IS 'Generates sprint burndown chart data with proper search path security';
COMMENT ON FUNCTION check_wip_limit(UUID, TEXT) IS 'Checks if WIP limit allows adding work item to status with proper search path security';
COMMENT ON FUNCTION add_project_owner_as_member() IS 'Trigger function to add project owner as member with proper search path security';
COMMENT ON FUNCTION validate_work_item_status_change() IS 'Trigger function to validate work item status changes with proper search path security';
COMMENT ON FUNCTION validate_workflow_transition(UUID, TEXT, TEXT) IS 'Validates workflow transitions between states with proper search path security';

-- =====================================================
-- MIGRATION SUMMARY
-- =====================================================
-- Fixed search_path security warnings for 6 remaining functions:
-- - Added 'SET search_path = public' to all functions
-- - Ensured all functions have SECURITY DEFINER
-- - Added proper GRANT EXECUTE permissions for authenticated users
-- - Added documentation comments for all functions
-- - Maintained existing function logic while improving security
-- Note: get_available_transitions is handled separately in migration 022
-- Note: generate_burndown_data is already properly defined in migration 014
-- =====================================================
-- =====================================================
-- FIX FUNCTION RETURN TYPE ERROR MIGRATION
-- =====================================================
-- This migration fixes the return type error for get_available_transitions
-- function by properly dropping and recreating it with the correct signature.
--
-- Issue: Cannot change return type of existing function (SQLSTATE 42P13)
-- Solution: Drop function first, then recreate with proper return type
-- =====================================================

-- Drop the existing function to avoid return type conflicts
DROP FUNCTION IF EXISTS get_available_transitions(UUID);

-- Recreate get_available_transitions function with original return type but security fixes
CREATE OR REPLACE FUNCTION get_available_transitions(p_work_item_id UUID)
RETURNS TABLE(
    state_name TEXT,
    state_color TEXT
)
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    p_workflow_id UUID;
BEGIN
    -- Get the workflow ID for the work item
    SELECT p.workflow_id INTO p_workflow_id
    FROM work_items wi
    JOIN projects p ON wi.project_id = p.id
    WHERE wi.id = p_work_item_id;

    -- Return available transitions with state name and color (original return type)
    RETURN QUERY
    SELECT ws.name as state_name, ws.color as state_color
    FROM workflow_transitions wt
    JOIN workflow_states from_ws ON wt.from_state_id = from_ws.id
    JOIN workflow_states ws ON wt.to_state_id = ws.id
    JOIN work_items wi ON wi.id = p_work_item_id
    WHERE wt.workflow_id = p_workflow_id
    AND from_ws.name = wi.status
    ORDER BY ws.position;
END;
$$ LANGUAGE plpgsql STABLE;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_available_transitions(UUID) TO authenticated;

-- Add documentation comment
COMMENT ON FUNCTION get_available_transitions(UUID) IS 'Returns available workflow transitions for a work item with state name and color, includes proper search path security';

-- =====================================================
-- MIGRATION SUMMARY
-- =====================================================
-- Fixed function return type error by:
-- - Dropping existing function to avoid type conflicts
-- - Recreating with original return type (state_name TEXT, state_color TEXT)
-- - Adding proper security settings (SECURITY DEFINER, SET search_path = public)
-- - Maintaining backward compatibility with existing code
-- - Adding proper permissions and documentation
-- =====================================================
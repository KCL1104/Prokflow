-- Migration: Fix get_project_metrics function return type conflict
-- Created: 2024-01-XX
-- Purpose: Resolve SQLSTATE 42P13 error by dropping and recreating function with correct return type

-- Drop the existing function to avoid return type conflict
DROP FUNCTION IF EXISTS get_project_metrics(UUID);

-- Recreate the function with the correct TABLE return type
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

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION get_project_metrics(UUID) TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION get_project_metrics(UUID) IS 'Returns comprehensive project metrics including work item counts, cycle times, and throughput';
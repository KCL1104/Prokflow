-- Analytics functions for the analytics-engine edge function

-- Function to generate burndown chart data
CREATE OR REPLACE FUNCTION generate_burndown_data(p_sprint_id UUID)
RETURNS TABLE(
    date DATE,
    remaining_points INTEGER,
    ideal_remaining INTEGER,
    completed_points INTEGER,
    total_points INTEGER
) 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE
    sprint_start DATE;
    sprint_end DATE;
    total_story_points INTEGER;
    sprint_days INTEGER;
    loop_date DATE;
BEGIN
    -- Get sprint details
    SELECT start_date, end_date INTO sprint_start, sprint_end
    FROM sprints WHERE id = p_sprint_id;
    
    -- Calculate total story points
    SELECT COALESCE(SUM(story_points), 0) INTO total_story_points
    FROM work_items 
    WHERE sprint_id = p_sprint_id;
    
    -- Calculate sprint duration in working days
    sprint_days := (sprint_end - sprint_start) + 1;
    
    -- Generate daily burndown data
    loop_date := sprint_start;
    WHILE loop_date <= sprint_end LOOP
        RETURN QUERY
        SELECT 
            loop_date as date,
            (total_story_points - COALESCE(SUM(CASE WHEN wi.completed_at::date <= loop_date THEN wi.story_points ELSE 0 END), 0))::INTEGER as remaining_points,
            GREATEST(0, total_story_points - ((loop_date - sprint_start) * total_story_points / sprint_days))::INTEGER as ideal_remaining,
            COALESCE(SUM(CASE WHEN wi.completed_at::date <= loop_date THEN wi.story_points ELSE 0 END), 0)::INTEGER as completed_points,
            total_story_points as total_points
        FROM work_items wi
        WHERE wi.sprint_id = p_sprint_id;
        
        loop_date := loop_date + 1;
    END LOOP;
END;
$$;

-- Function to analyze velocity
CREATE OR REPLACE FUNCTION analyze_velocity(p_project_id UUID, p_sprint_count INTEGER DEFAULT 10)
RETURNS TABLE(
    velocity_data JSONB,
    average_velocity DECIMAL,
    velocity_trend TEXT,
    consistency DECIMAL
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    WITH sprint_velocities AS (
        SELECT 
            s.name as sprint_name,
            ROW_NUMBER() OVER (ORDER BY s.start_date DESC) as sprint_number,
            COALESCE(SUM(wi.story_points), 0) as completed_points,
            s.planned_capacity as committed_points,
            CASE 
                WHEN s.planned_capacity > 0 THEN (COALESCE(SUM(wi.story_points), 0) * 100.0 / s.planned_capacity)
                ELSE 0 
            END as completion_rate,
            s.start_date::TEXT,
            s.end_date::TEXT
        FROM sprints s
        LEFT JOIN work_items wi ON s.id = wi.sprint_id AND wi.status = 'done'
        WHERE s.project_id = p_project_id 
        AND s.status = 'completed'
        ORDER BY s.start_date DESC
        LIMIT p_sprint_count
    )
    SELECT 
        jsonb_agg(
            jsonb_build_object(
                'sprintName', sprint_name,
                'sprintNumber', sprint_number,
                'completedPoints', completed_points,
                'committedPoints', committed_points,
                'completionRate', completion_rate,
                'startDate', start_date,
                'endDate', end_date
            )
        ),
        AVG(completed_points),
        CASE 
            WHEN COUNT(*) < 3 THEN 'stable'
            WHEN AVG(completed_points) FILTER (WHERE sprint_number <= 3) > AVG(completed_points) FILTER (WHERE sprint_number > 3) THEN 'up'
            WHEN AVG(completed_points) FILTER (WHERE sprint_number <= 3) < AVG(completed_points) FILTER (WHERE sprint_number > 3) THEN 'down'
            ELSE 'stable'
        END,
        CASE 
            WHEN COUNT(*) > 1 THEN (1 - (STDDEV(completed_points) / NULLIF(AVG(completed_points), 0))) * 100
            ELSE 100
        END
    FROM sprint_velocities;
END;
$$;
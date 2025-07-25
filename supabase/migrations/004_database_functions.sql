-- Function to validate workflow transitions
CREATE OR REPLACE FUNCTION validate_workflow_transition(
    p_workflow_id UUID,
    p_from_state TEXT,
    p_to_state TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    transition_exists BOOLEAN;
BEGIN
    SELECT EXISTS(
        SELECT 1 
        FROM workflow_transitions wt
        JOIN workflow_states from_ws ON wt.from_state_id = from_ws.id
        JOIN workflow_states to_ws ON wt.to_state_id = to_ws.id
        WHERE wt.workflow_id = p_workflow_id
        AND from_ws.name = p_from_state
        AND to_ws.name = p_to_state
    ) INTO transition_exists;
    
    RETURN transition_exists;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get available transitions for a work item
CREATE OR REPLACE FUNCTION get_available_transitions(p_work_item_id UUID)
RETURNS TABLE(state_name TEXT, state_color TEXT) AS $$
BEGIN
    RETURN QUERY
    SELECT ws.name, ws.color
    FROM work_items wi
    JOIN projects p ON wi.project_id = p.id
    JOIN workflow_transitions wt ON wt.workflow_id = p.workflow_id
    JOIN workflow_states from_ws ON wt.from_state_id = from_ws.id
    JOIN workflow_states ws ON wt.to_state_id = ws.id
    WHERE wi.id = p_work_item_id
    AND from_ws.name = wi.status
    ORDER BY ws.position;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check WIP limits
CREATE OR REPLACE FUNCTION check_wip_limit(
    p_project_id UUID,
    p_status TEXT
)
RETURNS BOOLEAN AS $$
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
    FROM work_items
    WHERE project_id = p_project_id AND status = p_status;
    
    -- Return true if under the limit
    RETURN current_count < wip_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate sprint velocity
CREATE OR REPLACE FUNCTION calculate_sprint_velocity(p_project_id UUID, p_sprint_count INTEGER DEFAULT 5)
RETURNS DECIMAL AS $$
DECLARE
    avg_velocity DECIMAL;
BEGIN
    SELECT AVG(sprint_points) INTO avg_velocity
    FROM (
        SELECT SUM(COALESCE(wi.estimate, 0)) as sprint_points
        FROM sprints s
        LEFT JOIN work_items wi ON wi.sprint_id = s.id
        JOIN workflow_states ws ON ws.name = wi.status
        WHERE s.project_id = p_project_id
        AND s.status = 'completed'
        AND ws.category = 'done'
        GROUP BY s.id
        ORDER BY s.end_date DESC
        LIMIT p_sprint_count
    ) recent_sprints;
    
    RETURN COALESCE(avg_velocity, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get sprint burndown data
CREATE OR REPLACE FUNCTION get_sprint_burndown(p_sprint_id UUID)
RETURNS TABLE(
    date DATE,
    remaining_points INTEGER,
    ideal_remaining INTEGER
) AS $$
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
    SELECT SUM(COALESCE(wi.estimate, 0)) INTO total_points
    FROM work_items wi WHERE wi.sprint_id = p_sprint_id;
    
    -- Calculate sprint duration in working days
    SELECT COUNT(*) INTO sprint_days
    FROM generate_series(sprint_start, sprint_end, '1 day'::interval) d
    WHERE EXTRACT(DOW FROM d) BETWEEN 1 AND 5; -- Monday to Friday
    
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
    SELECT 
        ds.date,
        GREATEST(ds.remaining, 0) as remaining_points,
        GREATEST(ds.ideal, 0) as ideal_remaining
    FROM date_series ds;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get project metrics
CREATE OR REPLACE FUNCTION get_project_metrics(p_project_id UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_work_items', (
            SELECT COUNT(*) FROM work_items WHERE project_id = p_project_id
        ),
        'completed_work_items', (
            SELECT COUNT(*) 
            FROM work_items wi
            JOIN projects p ON wi.project_id = p.id
            JOIN workflow_states ws ON ws.workflow_id = p.workflow_id AND ws.name = wi.status
            WHERE wi.project_id = p_project_id AND ws.category = 'done'
        ),
        'active_sprints', (
            SELECT COUNT(*) FROM sprints WHERE project_id = p_project_id AND status = 'active'
        ),
        'team_members', (
            SELECT COUNT(*) FROM project_members WHERE project_id = p_project_id
        ),
        'avg_velocity', calculate_sprint_velocity(p_project_id),
        'overdue_items', (
            SELECT COUNT(*) 
            FROM work_items 
            WHERE project_id = p_project_id 
            AND due_date < CURRENT_DATE
            AND status NOT IN (
                SELECT ws.name 
                FROM projects p
                JOIN workflow_states ws ON ws.workflow_id = p.workflow_id
                WHERE p.id = p_project_id AND ws.category = 'done'
            )
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle user registration (called by trigger)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create user profile on signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to automatically add project owner as member
CREATE OR REPLACE FUNCTION add_project_owner_as_member()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO project_members (project_id, user_id, role)
    VALUES (NEW.id, NEW.owner_id, 'owner');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to add project owner as member
CREATE TRIGGER on_project_created
    AFTER INSERT ON projects
    FOR EACH ROW EXECUTE FUNCTION add_project_owner_as_member();

-- Function to validate work item status transitions
CREATE OR REPLACE FUNCTION validate_work_item_status_change()
RETURNS TRIGGER AS $$
DECLARE
    project_workflow_id UUID;
    is_valid_transition BOOLEAN;
BEGIN
    -- Get the project's workflow
    SELECT workflow_id INTO project_workflow_id
    FROM projects WHERE id = NEW.project_id;
    
    -- If status hasn't changed, allow the update
    IF OLD.status = NEW.status THEN
        RETURN NEW;
    END IF;
    
    -- Validate the transition
    SELECT validate_workflow_transition(
        project_workflow_id,
        OLD.status,
        NEW.status
    ) INTO is_valid_transition;
    
    IF NOT is_valid_transition THEN
        RAISE EXCEPTION 'Invalid status transition from % to %', OLD.status, NEW.status;
    END IF;
    
    -- Check WIP limits
    IF NOT check_wip_limit(NEW.project_id, NEW.status) THEN
        RAISE EXCEPTION 'WIP limit exceeded for status %', NEW.status;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to validate work item status changes
CREATE TRIGGER validate_work_item_status
    BEFORE UPDATE ON work_items
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status)
    EXECUTE FUNCTION validate_work_item_status_change();
-- Insert default workflows for each methodology

-- Scrum workflow
INSERT INTO public.workflows (id, name, is_default, methodology) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'Default Scrum Workflow', true, 'scrum');

INSERT INTO public.workflow_states (workflow_id, name, category, color, position) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'To Do', 'todo', '#6B7280', 0),
    ('550e8400-e29b-41d4-a716-446655440001', 'In Progress', 'in_progress', '#3B82F6', 1),
    ('550e8400-e29b-41d4-a716-446655440001', 'In Review', 'in_progress', '#F59E0B', 2),
    ('550e8400-e29b-41d4-a716-446655440001', 'Done', 'done', '#10B981', 3);

-- Scrum workflow transitions
INSERT INTO public.workflow_transitions (workflow_id, from_state_id, to_state_id)
SELECT 
    '550e8400-e29b-41d4-a716-446655440001',
    from_state.id,
    to_state.id
FROM workflow_states from_state, workflow_states to_state
WHERE from_state.workflow_id = '550e8400-e29b-41d4-a716-446655440001'
  AND to_state.workflow_id = '550e8400-e29b-41d4-a716-446655440001'
  AND (
    (from_state.name = 'To Do' AND to_state.name = 'In Progress') OR
    (from_state.name = 'In Progress' AND to_state.name = 'In Review') OR
    (from_state.name = 'In Progress' AND to_state.name = 'To Do') OR
    (from_state.name = 'In Review' AND to_state.name = 'Done') OR
    (from_state.name = 'In Review' AND to_state.name = 'In Progress') OR
    (from_state.name = 'Done' AND to_state.name = 'In Progress')
  );

-- Kanban workflow
INSERT INTO public.workflows (id, name, is_default, methodology) VALUES
    ('550e8400-e29b-41d4-a716-446655440002', 'Default Kanban Workflow', true, 'kanban');

INSERT INTO public.workflow_states (workflow_id, name, category, color, wip_limit, position) VALUES
    ('550e8400-e29b-41d4-a716-446655440002', 'Backlog', 'todo', '#6B7280', NULL, 0),
    ('550e8400-e29b-41d4-a716-446655440002', 'Ready', 'todo', '#8B5CF6', NULL, 1),
    ('550e8400-e29b-41d4-a716-446655440002', 'In Progress', 'in_progress', '#3B82F6', 3, 2),
    ('550e8400-e29b-41d4-a716-446655440002', 'Review', 'in_progress', '#F59E0B', 2, 3),
    ('550e8400-e29b-41d4-a716-446655440002', 'Done', 'done', '#10B981', NULL, 4);

-- Kanban workflow transitions (more flexible)
INSERT INTO public.workflow_transitions (workflow_id, from_state_id, to_state_id)
SELECT 
    '550e8400-e29b-41d4-a716-446655440002',
    from_state.id,
    to_state.id
FROM workflow_states from_state, workflow_states to_state
WHERE from_state.workflow_id = '550e8400-e29b-41d4-a716-446655440002'
  AND to_state.workflow_id = '550e8400-e29b-41d4-a716-446655440002'
  AND from_state.position < to_state.position
  AND to_state.position - from_state.position <= 2; -- Allow skipping one state

-- Also allow backward transitions
INSERT INTO public.workflow_transitions (workflow_id, from_state_id, to_state_id)
SELECT 
    '550e8400-e29b-41d4-a716-446655440002',
    from_state.id,
    to_state.id
FROM workflow_states from_state, workflow_states to_state
WHERE from_state.workflow_id = '550e8400-e29b-41d4-a716-446655440002'
  AND to_state.workflow_id = '550e8400-e29b-41d4-a716-446655440002'
  AND from_state.position > to_state.position
  AND from_state.name != 'Done'; -- Can't go back from Done

-- Waterfall workflow
INSERT INTO public.workflows (id, name, is_default, methodology) VALUES
    ('550e8400-e29b-41d4-a716-446655440003', 'Default Waterfall Workflow', true, 'waterfall');

INSERT INTO public.workflow_states (workflow_id, name, category, color, position) VALUES
    ('550e8400-e29b-41d4-a716-446655440003', 'Requirements', 'todo', '#6B7280', 0),
    ('550e8400-e29b-41d4-a716-446655440003', 'Design', 'in_progress', '#8B5CF6', 1),
    ('550e8400-e29b-41d4-a716-446655440003', 'Implementation', 'in_progress', '#3B82F6', 2),
    ('550e8400-e29b-41d4-a716-446655440003', 'Testing', 'in_progress', '#F59E0B', 3),
    ('550e8400-e29b-41d4-a716-446655440003', 'Deployment', 'in_progress', '#EF4444', 4),
    ('550e8400-e29b-41d4-a716-446655440003', 'Maintenance', 'done', '#10B981', 5);

-- Waterfall workflow transitions (sequential)
INSERT INTO public.workflow_transitions (workflow_id, from_state_id, to_state_id)
SELECT 
    '550e8400-e29b-41d4-a716-446655440003',
    from_state.id,
    to_state.id
FROM workflow_states from_state, workflow_states to_state
WHERE from_state.workflow_id = '550e8400-e29b-41d4-a716-446655440003'
  AND to_state.workflow_id = '550e8400-e29b-41d4-a716-446655440003'
  AND to_state.position = from_state.position + 1;

-- Custom workflow template (empty, to be customized)
INSERT INTO public.workflows (id, name, is_default, methodology) VALUES
    ('550e8400-e29b-41d4-a716-446655440004', 'Custom Workflow Template', true, 'custom');

INSERT INTO public.workflow_states (workflow_id, name, category, color, position) VALUES
    ('550e8400-e29b-41d4-a716-446655440004', 'New', 'todo', '#6B7280', 0),
    ('550e8400-e29b-41d4-a716-446655440004', 'In Progress', 'in_progress', '#3B82F6', 1),
    ('550e8400-e29b-41d4-a716-446655440004', 'Complete', 'done', '#10B981', 2);

INSERT INTO public.workflow_transitions (workflow_id, from_state_id, to_state_id)
SELECT 
    '550e8400-e29b-41d4-a716-446655440004',
    from_state.id,
    to_state.id
FROM workflow_states from_state, workflow_states to_state
WHERE from_state.workflow_id = '550e8400-e29b-41d4-a716-446655440004'
  AND to_state.workflow_id = '550e8400-e29b-41d4-a716-446655440004'
  AND (
    (from_state.name = 'New' AND to_state.name = 'In Progress') OR
    (from_state.name = 'In Progress' AND to_state.name = 'Complete') OR
    (from_state.name = 'In Progress' AND to_state.name = 'New')
  );
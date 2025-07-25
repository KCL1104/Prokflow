-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE methodology_type AS ENUM ('scrum', 'kanban', 'waterfall', 'custom');
CREATE TYPE work_item_type AS ENUM ('story', 'task', 'bug', 'epic');
CREATE TYPE priority_type AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE sprint_status AS ENUM ('planning', 'active', 'completed');
CREATE TYPE workflow_state_category AS ENUM ('todo', 'in_progress', 'done');
CREATE TYPE project_role AS ENUM ('owner', 'admin', 'member', 'viewer');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    timezone TEXT DEFAULT 'UTC',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workflows table
CREATE TABLE public.workflows (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    methodology methodology_type NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workflow states table
CREATE TABLE public.workflow_states (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    category workflow_state_category NOT NULL,
    color TEXT DEFAULT '#6B7280',
    wip_limit INTEGER,
    position INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(workflow_id, name)
);

-- Workflow transitions table
CREATE TABLE public.workflow_transitions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE NOT NULL,
    from_state_id UUID REFERENCES workflow_states(id) ON DELETE CASCADE NOT NULL,
    to_state_id UUID REFERENCES workflow_states(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(workflow_id, from_state_id, to_state_id)
);

-- Projects table
CREATE TABLE public.projects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    methodology methodology_type NOT NULL,
    workflow_id UUID REFERENCES workflows(id) NOT NULL,
    owner_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project members table
CREATE TABLE public.project_members (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    role project_role NOT NULL DEFAULT 'member',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(project_id, user_id)
);

-- Sprints table
CREATE TABLE public.sprints (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    goal TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status sprint_status DEFAULT 'planning',
    capacity INTEGER DEFAULT 0,
    retrospective_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Work items table
CREATE TABLE public.work_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    type work_item_type NOT NULL,
    status TEXT NOT NULL, -- References workflow_states.name
    priority priority_type DEFAULT 'medium',
    assignee_id UUID REFERENCES users(id) ON DELETE SET NULL,
    reporter_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    estimate INTEGER,
    actual_time INTEGER,
    sprint_id UUID REFERENCES sprints(id) ON DELETE SET NULL,
    parent_id UUID REFERENCES work_items(id) ON DELETE CASCADE,
    due_date DATE,
    labels TEXT[] DEFAULT '{}',
    position INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Work item dependencies table
CREATE TABLE public.work_item_dependencies (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    work_item_id UUID REFERENCES work_items(id) ON DELETE CASCADE NOT NULL,
    depends_on_id UUID REFERENCES work_items(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(work_item_id, depends_on_id),
    CHECK (work_item_id != depends_on_id)
);

-- Comments table
CREATE TABLE public.comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    work_item_id UUID REFERENCES work_items(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Attachments table
CREATE TABLE public.attachments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    work_item_id UUID REFERENCES work_items(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    filename TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_projects_owner_id ON projects(owner_id);
CREATE INDEX idx_projects_workflow_id ON projects(workflow_id);
CREATE INDEX idx_project_members_project_id ON project_members(project_id);
CREATE INDEX idx_project_members_user_id ON project_members(user_id);
CREATE INDEX idx_sprints_project_id ON sprints(project_id);
CREATE INDEX idx_work_items_project_id ON work_items(project_id);
CREATE INDEX idx_work_items_sprint_id ON work_items(sprint_id);
CREATE INDEX idx_work_items_assignee_id ON work_items(assignee_id);
CREATE INDEX idx_work_items_reporter_id ON work_items(reporter_id);
CREATE INDEX idx_work_items_parent_id ON work_items(parent_id);
CREATE INDEX idx_work_items_status ON work_items(status);
CREATE INDEX idx_comments_work_item_id ON comments(work_item_id);
CREATE INDEX idx_attachments_work_item_id ON attachments(work_item_id);
CREATE INDEX idx_workflow_states_workflow_id ON workflow_states(workflow_id);
CREATE INDEX idx_workflow_transitions_workflow_id ON workflow_transitions(workflow_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_workflows_updated_at BEFORE UPDATE ON workflows FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sprints_updated_at BEFORE UPDATE ON sprints FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_work_items_updated_at BEFORE UPDATE ON work_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
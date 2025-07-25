-- Enable Row Level Security on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_transitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_item_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Workflows policies (default workflows are public, custom workflows are project-specific)
CREATE POLICY "Anyone can view default workflows" ON public.workflows
    FOR SELECT USING (is_default = true);

CREATE POLICY "Project members can view custom workflows" ON public.workflows
    FOR SELECT USING (
        is_default = false AND 
        EXISTS (
            SELECT 1 FROM projects p
            JOIN project_members pm ON p.id = pm.project_id
            WHERE p.workflow_id = workflows.id AND pm.user_id = auth.uid()
        )
    );

CREATE POLICY "Project owners can create custom workflows" ON public.workflows
    FOR INSERT WITH CHECK (
        is_default = false AND
        EXISTS (
            SELECT 1 FROM projects p
            WHERE p.owner_id = auth.uid()
        )
    );

-- Workflow states policies
CREATE POLICY "Users can view workflow states for accessible workflows" ON public.workflow_states
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM workflows w
            WHERE w.id = workflow_states.workflow_id AND (
                w.is_default = true OR
                EXISTS (
                    SELECT 1 FROM projects p
                    JOIN project_members pm ON p.id = pm.project_id
                    WHERE p.workflow_id = w.id AND pm.user_id = auth.uid()
                )
            )
        )
    );

-- Workflow transitions policies
CREATE POLICY "Users can view workflow transitions for accessible workflows" ON public.workflow_transitions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM workflows w
            WHERE w.id = workflow_transitions.workflow_id AND (
                w.is_default = true OR
                EXISTS (
                    SELECT 1 FROM projects p
                    JOIN project_members pm ON p.id = pm.project_id
                    WHERE p.workflow_id = w.id AND pm.user_id = auth.uid()
                )
            )
        )
    );

-- Projects policies
CREATE POLICY "Project members can view projects" ON public.projects
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM project_members pm
            WHERE pm.project_id = projects.id AND pm.user_id = auth.uid()
        )
    );

CREATE POLICY "Authenticated users can create projects" ON public.projects
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Project owners and admins can update projects" ON public.projects
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM project_members pm
            WHERE pm.project_id = projects.id 
            AND pm.user_id = auth.uid() 
            AND pm.role IN ('owner', 'admin')
        )
    );

CREATE POLICY "Project owners can delete projects" ON public.projects
    FOR DELETE USING (owner_id = auth.uid());

-- Project members policies
CREATE POLICY "Project members can view project membership" ON public.project_members
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM project_members pm
            WHERE pm.project_id = project_members.project_id AND pm.user_id = auth.uid()
        )
    );

CREATE POLICY "Project owners and admins can manage membership" ON public.project_members
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM project_members pm
            WHERE pm.project_id = project_members.project_id 
            AND pm.user_id = auth.uid() 
            AND pm.role IN ('owner', 'admin')
        )
    );

-- Sprints policies
CREATE POLICY "Project members can view sprints" ON public.sprints
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM project_members pm
            WHERE pm.project_id = sprints.project_id AND pm.user_id = auth.uid()
        )
    );

CREATE POLICY "Project members can create sprints" ON public.sprints
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM project_members pm
            WHERE pm.project_id = sprints.project_id 
            AND pm.user_id = auth.uid() 
            AND pm.role IN ('owner', 'admin', 'member')
        )
    );

CREATE POLICY "Project members can update sprints" ON public.sprints
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM project_members pm
            WHERE pm.project_id = sprints.project_id 
            AND pm.user_id = auth.uid() 
            AND pm.role IN ('owner', 'admin', 'member')
        )
    );

CREATE POLICY "Project owners and admins can delete sprints" ON public.sprints
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM project_members pm
            WHERE pm.project_id = sprints.project_id 
            AND pm.user_id = auth.uid() 
            AND pm.role IN ('owner', 'admin')
        )
    );

-- Work items policies
CREATE POLICY "Project members can view work items" ON public.work_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM project_members pm
            WHERE pm.project_id = work_items.project_id AND pm.user_id = auth.uid()
        )
    );

CREATE POLICY "Project members can create work items" ON public.work_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM project_members pm
            WHERE pm.project_id = work_items.project_id 
            AND pm.user_id = auth.uid() 
            AND pm.role IN ('owner', 'admin', 'member')
        )
    );

CREATE POLICY "Project members can update work items" ON public.work_items
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM project_members pm
            WHERE pm.project_id = work_items.project_id 
            AND pm.user_id = auth.uid() 
            AND pm.role IN ('owner', 'admin', 'member')
        )
    );

CREATE POLICY "Project owners and admins can delete work items" ON public.work_items
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM project_members pm
            WHERE pm.project_id = work_items.project_id 
            AND pm.user_id = auth.uid() 
            AND pm.role IN ('owner', 'admin')
        )
    );

-- Work item dependencies policies
CREATE POLICY "Project members can view work item dependencies" ON public.work_item_dependencies
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM work_items wi
            JOIN project_members pm ON pm.project_id = wi.project_id
            WHERE wi.id = work_item_dependencies.work_item_id AND pm.user_id = auth.uid()
        )
    );

CREATE POLICY "Project members can manage work item dependencies" ON public.work_item_dependencies
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM work_items wi
            JOIN project_members pm ON pm.project_id = wi.project_id
            WHERE wi.id = work_item_dependencies.work_item_id 
            AND pm.user_id = auth.uid() 
            AND pm.role IN ('owner', 'admin', 'member')
        )
    );

-- Comments policies
CREATE POLICY "Project members can view comments" ON public.comments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM work_items wi
            JOIN project_members pm ON pm.project_id = wi.project_id
            WHERE wi.id = comments.work_item_id AND pm.user_id = auth.uid()
        )
    );

CREATE POLICY "Project members can create comments" ON public.comments
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM work_items wi
            JOIN project_members pm ON pm.project_id = wi.project_id
            WHERE wi.id = comments.work_item_id 
            AND pm.user_id = auth.uid() 
            AND pm.role IN ('owner', 'admin', 'member')
        )
    );

CREATE POLICY "Users can update their own comments" ON public.comments
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments or project admins can delete any" ON public.comments
    FOR DELETE USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM work_items wi
            JOIN project_members pm ON pm.project_id = wi.project_id
            WHERE wi.id = comments.work_item_id 
            AND pm.user_id = auth.uid() 
            AND pm.role IN ('owner', 'admin')
        )
    );

-- Attachments policies
CREATE POLICY "Project members can view attachments" ON public.attachments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM work_items wi
            JOIN project_members pm ON pm.project_id = wi.project_id
            WHERE wi.id = attachments.work_item_id AND pm.user_id = auth.uid()
        )
    );

CREATE POLICY "Project members can create attachments" ON public.attachments
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM work_items wi
            JOIN project_members pm ON pm.project_id = wi.project_id
            WHERE wi.id = attachments.work_item_id 
            AND pm.user_id = auth.uid() 
            AND pm.role IN ('owner', 'admin', 'member')
        )
    );

CREATE POLICY "Users can delete their own attachments or project admins can delete any" ON public.attachments
    FOR DELETE USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM work_items wi
            JOIN project_members pm ON pm.project_id = wi.project_id
            WHERE wi.id = attachments.work_item_id 
            AND pm.user_id = auth.uid() 
            AND pm.role IN ('owner', 'admin')
        )
    );
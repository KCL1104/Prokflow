-- Migration to fix Auth RLS Initialization Plan warnings
-- Replaces auth.uid() with (select auth.uid()) for performance optimization
-- This prevents re-evaluation of auth functions for each row

-- Fix standup_reminders policies
DROP POLICY IF EXISTS "Users can view their own reminders" ON public.standup_reminders;
DROP POLICY IF EXISTS "standup_reminders_select" ON public.standup_reminders;
DROP POLICY IF EXISTS "standup_reminders_insert" ON public.standup_reminders;
DROP POLICY IF EXISTS "standup_reminders_update" ON public.standup_reminders;
DROP POLICY IF EXISTS "standup_reminders_delete" ON public.standup_reminders;

CREATE POLICY "standup_reminders_select" ON public.standup_reminders
  FOR SELECT USING (user_id = (select auth.uid()));

CREATE POLICY "standup_reminders_insert" ON public.standup_reminders
  FOR INSERT WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "standup_reminders_update" ON public.standup_reminders
  FOR UPDATE USING (user_id = (select auth.uid()));

CREATE POLICY "standup_reminders_delete" ON public.standup_reminders
  FOR DELETE USING (user_id = (select auth.uid()));

-- Fix user_email_preferences policies
DROP POLICY IF EXISTS "Users can view their own email preferences" ON public.user_email_preferences;
DROP POLICY IF EXISTS "Users can update their own email preferences" ON public.user_email_preferences;
DROP POLICY IF EXISTS "Users can insert their own email preferences" ON public.user_email_preferences;
DROP POLICY IF EXISTS "Users can delete their own email preferences" ON public.user_email_preferences;
DROP POLICY IF EXISTS "user_email_preferences_select" ON public.user_email_preferences;
DROP POLICY IF EXISTS "user_email_preferences_insert" ON public.user_email_preferences;
DROP POLICY IF EXISTS "user_email_preferences_update" ON public.user_email_preferences;
DROP POLICY IF EXISTS "user_email_preferences_delete" ON public.user_email_preferences;

CREATE POLICY "user_email_preferences_select" ON public.user_email_preferences
  FOR SELECT USING (user_id = (select auth.uid()));

CREATE POLICY "user_email_preferences_insert" ON public.user_email_preferences
  FOR INSERT WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "user_email_preferences_update" ON public.user_email_preferences
  FOR UPDATE USING (user_id = (select auth.uid()));

CREATE POLICY "user_email_preferences_delete" ON public.user_email_preferences
  FOR DELETE USING (user_id = (select auth.uid()));

-- Fix project_members policies
DROP POLICY IF EXISTS "project_members_comprehensive_select" ON public.project_members;
DROP POLICY IF EXISTS "project_members_comprehensive_insert" ON public.project_members;
DROP POLICY IF EXISTS "project_members_comprehensive_update" ON public.project_members;
DROP POLICY IF EXISTS "project_members_comprehensive_delete" ON public.project_members;

CREATE POLICY "project_members_comprehensive_select" ON public.project_members
  FOR SELECT USING (
    user_id = (select auth.uid()) OR 
    project_id IN (
      SELECT project_id FROM public.project_members 
      WHERE user_id = (select auth.uid()) AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "project_members_comprehensive_insert" ON public.project_members
  FOR INSERT WITH CHECK (
    -- Users can be added to projects by project owners/admins
    EXISTS (
      SELECT 1 FROM public.project_members pm
      WHERE pm.project_id = project_members.project_id 
      AND pm.user_id = (select auth.uid()) 
      AND pm.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "project_members_comprehensive_update" ON public.project_members
  FOR UPDATE USING (
    -- Users can update their own membership or project owners/admins can update any membership
    user_id = (select auth.uid()) OR 
    EXISTS (
      SELECT 1 FROM public.project_members 
      WHERE project_id = project_members.project_id 
      AND user_id = (select auth.uid()) 
      AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "project_members_comprehensive_delete" ON public.project_members
  FOR DELETE USING (
    -- Users can remove themselves or project owners/admins can remove any member
    user_id = (select auth.uid()) OR 
    EXISTS (
      SELECT 1 FROM public.project_members 
      WHERE project_id = project_members.project_id 
      AND user_id = (select auth.uid()) 
      AND role IN ('owner', 'admin')
    )
  );

-- Fix workflows policies
DROP POLICY IF EXISTS "workflows_comprehensive_select" ON public.workflows;
DROP POLICY IF EXISTS "workflows_comprehensive_insert" ON public.workflows;
DROP POLICY IF EXISTS "workflows_comprehensive_update" ON public.workflows;
DROP POLICY IF EXISTS "workflows_comprehensive_delete" ON public.workflows;

CREATE POLICY "workflows_comprehensive_select" ON public.workflows
  FOR SELECT USING (
    -- Users can view workflows that are used by projects they are members of, or default workflows
    is_default = true OR
    id IN (
      SELECT p.workflow_id FROM public.projects p
      INNER JOIN public.project_members pm ON p.id = pm.project_id
      WHERE pm.user_id = (select auth.uid())
    )
  );

CREATE POLICY "workflows_comprehensive_insert" ON public.workflows
  FOR INSERT WITH CHECK (
    -- Only authenticated users can create workflows (will be restricted by application logic)
    (select auth.uid()) IS NOT NULL
  );

CREATE POLICY "workflows_comprehensive_update" ON public.workflows
  FOR UPDATE USING (
    -- Users can update workflows if they are project owners/admins of projects using this workflow
    id IN (
      SELECT p.workflow_id FROM public.projects p
      INNER JOIN public.project_members pm ON p.id = pm.project_id
      WHERE pm.user_id = (select auth.uid()) AND pm.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "workflows_comprehensive_delete" ON public.workflows
  FOR DELETE USING (
    -- Users can delete workflows if they are project owners/admins of projects using this workflow
    -- and it's not a default workflow
    is_default = false AND
    id IN (
      SELECT p.workflow_id FROM public.projects p
      INNER JOIN public.project_members pm ON p.id = pm.project_id
      WHERE pm.user_id = (select auth.uid()) AND pm.role IN ('owner', 'admin')
    )
  );

-- Add comment for documentation
COMMENT ON TABLE public.standup_reminders IS 'RLS policies optimized for performance - auth.uid() wrapped in select';
COMMENT ON TABLE public.user_email_preferences IS 'RLS policies optimized for performance - auth.uid() wrapped in select';
COMMENT ON TABLE public.project_members IS 'RLS policies optimized for performance - auth.uid() wrapped in select';
COMMENT ON TABLE public.workflows IS 'RLS policies optimized for performance - auth.uid() wrapped in select';
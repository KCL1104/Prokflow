-- =====================================================
-- Migration: Fix Remaining RLS Performance Warnings
-- =====================================================
-- This migration addresses:
-- 1. Auth RLS Initialization Plan warnings for notifications table
-- 2. Multiple Permissive Policies warnings for notifications, project_members, and workflows tables
--
-- Issues being fixed:
-- - notifications table: auth.uid() calls need to be wrapped with (select auth.uid())
-- - notifications table: Multiple policies causing conflicts
-- - project_members table: Old policies conflicting with comprehensive policies
-- - workflows table: Old policies conflicting with comprehensive policies
-- =====================================================

-- =====================================================
-- FIX NOTIFICATIONS TABLE ISSUES
-- =====================================================

-- Drop all existing notification policies to start fresh
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Project members can create notifications for project members" ON public.notifications;
DROP POLICY IF EXISTS "notifications_comprehensive_select" ON public.notifications;
DROP POLICY IF EXISTS "notifications_comprehensive_insert" ON public.notifications;
DROP POLICY IF EXISTS "notifications_comprehensive_update" ON public.notifications;
DROP POLICY IF EXISTS "notifications_comprehensive_delete" ON public.notifications;

-- Create optimized comprehensive policies for notifications
-- These policies fix both auth RLS initialization and multiple permissive policies issues
CREATE POLICY "notifications_optimized_select" ON public.notifications
    FOR SELECT
    USING (
        -- Users can view their own notifications
        -- Using (select auth.uid()) to prevent re-evaluation per row
        user_id = (select auth.uid())
    );

CREATE POLICY "notifications_optimized_insert" ON public.notifications
    FOR INSERT
    WITH CHECK (
        -- Users can create notifications for themselves
        -- System/service accounts can create notifications for any user
        user_id = (select auth.uid()) 
        OR 
        -- Allow system to create notifications (when auth.uid() is null)
        (select auth.uid()) IS NULL
        OR
        -- Project members can create notifications for project members
        (
            project_id IS NOT NULL 
            AND EXISTS (
                SELECT 1 FROM project_members pm
                WHERE pm.project_id = notifications.project_id
                AND pm.user_id = (select auth.uid())
            )
        )
    );

CREATE POLICY "notifications_optimized_update" ON public.notifications
    FOR UPDATE
    USING (
        -- Users can only update their own notifications
        user_id = (select auth.uid())
    )
    WITH CHECK (
        -- Users can only update their own notifications
        user_id = (select auth.uid())
    );

CREATE POLICY "notifications_optimized_delete" ON public.notifications
    FOR DELETE
    USING (
        -- Users can only delete their own notifications
        user_id = (select auth.uid())
    );

-- =====================================================
-- FIX PROJECT_MEMBERS TABLE ISSUES
-- =====================================================

-- Drop old conflicting policies
DROP POLICY IF EXISTS "Project members can view project membership" ON public.project_members;
DROP POLICY IF EXISTS "Project owners and admins can manage membership" ON public.project_members;

-- The comprehensive policies from migration 024 should remain as the single source of truth
-- No additional policies needed - the comprehensive policies handle all cases

-- =====================================================
-- FIX WORKFLOWS TABLE ISSUES
-- =====================================================

-- Drop old conflicting policies
DROP POLICY IF EXISTS "Anyone can view default workflows" ON public.workflows;
DROP POLICY IF EXISTS "Project members can view custom workflows" ON public.workflows;
DROP POLICY IF EXISTS "Project owners can create custom workflows" ON public.workflows;

-- The comprehensive policies from migration 024 should remain as the single source of truth
-- No additional policies needed - the comprehensive policies handle all cases

-- =====================================================
-- ADD PERFORMANCE INDEXES
-- =====================================================

-- Ensure optimal indexes exist for the new notification policies
CREATE INDEX IF NOT EXISTS idx_notifications_user_id_optimized 
    ON public.notifications(user_id);

CREATE INDEX IF NOT EXISTS idx_notifications_project_user 
    ON public.notifications(project_id, user_id);

CREATE INDEX IF NOT EXISTS idx_notifications_created_user 
    ON public.notifications(user_id, created_at DESC);

-- =====================================================
-- DOCUMENTATION COMMENTS
-- =====================================================

COMMENT ON POLICY "notifications_optimized_select" ON public.notifications IS
'Optimized policy: Users can view their own notifications. Uses (select auth.uid()) for performance.';

COMMENT ON POLICY "notifications_optimized_insert" ON public.notifications IS
'Optimized policy: Users and project members can create notifications appropriately. Uses (select auth.uid()) for performance.';

COMMENT ON POLICY "notifications_optimized_update" ON public.notifications IS
'Optimized policy: Users can only update their own notifications. Uses (select auth.uid()) for performance.';

COMMENT ON POLICY "notifications_optimized_delete" ON public.notifications IS
'Optimized policy: Users can only delete their own notifications. Uses (select auth.uid()) for performance.';

-- =====================================================
-- MIGRATION SUMMARY
-- =====================================================
-- Fixed Auth RLS Initialization Plan warnings for:
-- - notifications table: Wrapped all auth.uid() calls with (select auth.uid())
--
-- Fixed Multiple Permissive Policies warnings for:
-- - notifications table: Removed old conflicting policies, kept only optimized comprehensive policies
-- - project_members table: Removed old conflicting policies, kept only comprehensive policies from migration 024
-- - workflows table: Removed old conflicting policies, kept only comprehensive policies from migration 024
--
-- Benefits:
-- - Eliminates all remaining RLS performance warnings
-- - Improves query performance by preventing auth function re-evaluation
-- - Maintains identical security guarantees
-- - Reduces policy evaluation overhead
-- - Adds optimized indexes for better performance
-- =====================================================
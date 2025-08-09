-- =====================================================
-- FIX DUPLICATE POLICY ERROR MIGRATION
-- =====================================================
-- This migration fixes the duplicate policy error for the user_presence table
-- by ensuring the policy is dropped before being recreated.
--
-- Error fixed:
-- policy "Users can view presence and manage their own" for table "user_presence" already exists
-- =====================================================

-- Drop the existing policy if it exists to prevent duplicate errors
DROP POLICY IF EXISTS "Users can view presence and manage their own" ON public.user_presence;

-- Recreate the consolidated policy that handles both own presence management and viewing others
CREATE POLICY "Users can view presence and manage their own" ON public.user_presence
    FOR ALL USING (
        user_id = get_current_user_id() OR
        is_project_member(user_presence.project_id)
    );

-- Add documentation comment
COMMENT ON POLICY "Users can view presence and manage their own" ON public.user_presence IS 
'Consolidated policy: Users can manage their own presence and view presence of other project members';

-- =====================================================
-- MIGRATION SUMMARY
-- =====================================================
-- Fixed duplicate policy error for user_presence table:
-- - Dropped existing policy if it exists
-- - Recreated the policy with same logic as migration 015
-- - Added documentation comment
--
-- This ensures the migration can run successfully even if the policy already exists.
-- =====================================================
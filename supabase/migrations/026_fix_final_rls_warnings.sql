-- =====================================================
-- Migration: Fix Final RLS Performance Warnings
-- =====================================================
-- This migration addresses:
-- 1. Multiple Permissive Policies warnings for standup_reminders table
-- 2. Duplicate index warnings for notifications table
--
-- Issues being fixed:
-- - standup_reminders table: Multiple policies causing conflicts
-- - notifications table: Duplicate indexes need to be removed
-- =====================================================

-- =====================================================
-- FIX STANDUP_REMINDERS TABLE ISSUES
-- =====================================================

-- Drop old conflicting policies for standup_reminders
DROP POLICY IF EXISTS "System can create reminders" ON public.standup_reminders;
DROP POLICY IF EXISTS "System can update reminders" ON public.standup_reminders;
DROP POLICY IF EXISTS "System can delete reminders" ON public.standup_reminders;

-- The comprehensive policies from migration 024 should remain as the single source of truth
-- No additional policies needed - the comprehensive policies handle all cases

-- =====================================================
-- FIX DUPLICATE INDEX ISSUES
-- =====================================================

-- Remove duplicate indexes for notifications table
-- Keep the newer optimized indexes and drop the older ones
DROP INDEX IF EXISTS public.idx_notifications_user_id;
DROP INDEX IF EXISTS public.idx_notifications_created_user;

-- The following indexes will remain:
-- - idx_notifications_user_id_optimized (from migration 025)
-- - idx_notifications_project_user (from migration 025)
-- - idx_notifications_user_created (from migration 020)

-- =====================================================
-- MIGRATION SUMMARY
-- =====================================================
-- Fixed Multiple Permissive Policies warnings for:
-- - standup_reminders table: Removed old conflicting policies, kept only comprehensive policies from migration 024
--
-- Fixed Duplicate Index warnings for:
-- - notifications table: Removed duplicate indexes, kept optimized ones
--
-- Benefits:
-- - Eliminates all remaining RLS performance warnings
-- - Reduces index storage overhead
-- - Maintains optimal query performance
-- - Keeps only the most efficient policies and indexes
-- =====================================================
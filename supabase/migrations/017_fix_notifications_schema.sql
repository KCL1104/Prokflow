-- =====================================================
-- FIX NOTIFICATIONS SCHEMA
-- Rename 'read' column to 'is_read' to match notification service expectations
-- =====================================================

-- Rename the 'read' column to 'is_read' in notifications table
ALTER TABLE public.notifications RENAME COLUMN read TO is_read;

-- Update the index to use the new column name
DROP INDEX IF EXISTS idx_notifications_read;
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

-- Update any existing functions that reference the old column name
-- (The notification service expects 'is_read' column)

-- Add comment for documentation
COMMENT ON COLUMN notifications.is_read IS 'Boolean flag indicating if the notification has been read by the user';
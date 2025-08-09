-- =====================================================
-- EMAIL PREFERENCES MIGRATION
-- Add user email preferences table and update notification types
-- =====================================================

-- Update notification types enum to include all types used in notification service
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'work_item_updated';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'sprint_started';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'sprint_ended';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'deadline_reminder';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'project_invitation';

-- Create user email preferences table
CREATE TABLE public.user_email_preferences (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    preferences JSONB DEFAULT '{}' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX idx_user_email_preferences_user_id ON user_email_preferences(user_id);

-- Enable RLS
ALTER TABLE user_email_preferences ENABLE ROW LEVEL SECURITY;

-- RLS policies for user email preferences
CREATE POLICY "Users can view their own email preferences" ON user_email_preferences
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own email preferences" ON user_email_preferences
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own email preferences" ON user_email_preferences
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own email preferences" ON user_email_preferences
    FOR DELETE USING (user_id = auth.uid());

-- Add updated_at trigger
CREATE TRIGGER update_user_email_preferences_updated_at 
    BEFORE UPDATE ON user_email_preferences 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to get or create user email preferences with defaults
CREATE OR REPLACE FUNCTION get_user_email_preferences(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
    user_prefs JSONB;
    default_prefs JSONB := '{
        "work_item_assigned": true,
        "work_item_updated": false,
        "sprint_started": true,
        "sprint_ended": true,
        "comment_added": false,
        "mention": true,
        "deadline_reminder": true,
        "project_invitation": true
    }';
BEGIN
    -- Try to get existing preferences
    SELECT preferences INTO user_prefs
    FROM user_email_preferences
    WHERE user_id = p_user_id;
    
    -- If no preferences exist, create them with defaults
    IF user_prefs IS NULL THEN
        INSERT INTO user_email_preferences (user_id, preferences)
        VALUES (p_user_id, default_prefs)
        ON CONFLICT (user_id) DO UPDATE SET preferences = default_prefs
        RETURNING preferences INTO user_prefs;
    END IF;
    
    -- Merge with defaults to ensure all keys exist
    RETURN default_prefs || user_prefs;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update user email preferences
CREATE OR REPLACE FUNCTION update_user_email_preferences(
    p_user_id UUID,
    p_preferences JSONB
)
RETURNS JSONB AS $$
DECLARE
    updated_prefs JSONB;
BEGIN
    -- Insert or update preferences
    INSERT INTO user_email_preferences (user_id, preferences)
    VALUES (p_user_id, p_preferences)
    ON CONFLICT (user_id) 
    DO UPDATE SET 
        preferences = EXCLUDED.preferences,
        updated_at = NOW()
    RETURNING preferences INTO updated_prefs;
    
    RETURN updated_prefs;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert default email preferences for existing users
INSERT INTO user_email_preferences (user_id, preferences)
SELECT 
    id,
    '{
        "work_item_assigned": true,
        "work_item_updated": false,
        "sprint_started": true,
        "sprint_ended": true,
        "comment_added": false,
        "mention": true,
        "deadline_reminder": true,
        "project_invitation": true
    }'::jsonb
FROM users
ON CONFLICT (user_id) DO NOTHING;

-- Enable realtime for email preferences
ALTER PUBLICATION supabase_realtime ADD TABLE user_email_preferences;

-- Add comments for documentation
COMMENT ON TABLE user_email_preferences IS 'Stores user email notification preferences';
COMMENT ON COLUMN user_email_preferences.preferences IS 'JSONB object containing email notification preferences for different notification types';
COMMENT ON FUNCTION get_user_email_preferences(UUID) IS 'Get user email preferences with defaults for missing keys';
COMMENT ON FUNCTION update_user_email_preferences(UUID, JSONB) IS 'Update user email preferences';
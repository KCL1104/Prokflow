-- =====================================================
-- FIX EMAIL PREFERENCES FUNCTIONS SEARCH PATH
-- Add SET search_path = public to email preferences functions
-- =====================================================

-- Fix get_user_email_preferences function search_path
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Fix update_user_email_preferences function search_path
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION get_user_email_preferences(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION update_user_email_preferences(UUID, JSONB) TO authenticated;

-- Add comments for documentation
COMMENT ON FUNCTION get_user_email_preferences(UUID) IS 'Get user email preferences with defaults for missing keys - Fixed search_path';
COMMENT ON FUNCTION update_user_email_preferences(UUID, JSONB) IS 'Update user email preferences - Fixed search_path';
-- =====================================================
-- REAL-TIME COLLABORATION MIGRATION
-- Add tables and functions for real-time collaboration features
-- =====================================================

-- Create notification types enum
CREATE TYPE notification_type AS ENUM (
  'work_item_updated',
  'work_item_assigned', 
  'comment_added',
  'mention',
  'sprint_updated'
);

-- Create notifications table
CREATE TABLE public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    type notification_type NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
    work_item_id UUID REFERENCES work_items(id) ON DELETE CASCADE,
    sprint_id UUID REFERENCES sprints(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    action_url TEXT,
    read BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create collaborative sessions table
CREATE TABLE public.collaborative_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    work_item_id UUID REFERENCES work_items(id) ON DELETE CASCADE NOT NULL,
    active_users JSONB DEFAULT '[]',
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(work_item_id)
);

-- Create user presence table
CREATE TABLE public.user_presence (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
    status TEXT DEFAULT 'online' CHECK (status IN ('online', 'away', 'offline')),
    current_page TEXT,
    current_work_item UUID REFERENCES work_items(id) ON DELETE SET NULL,
    cursor_x INTEGER,
    cursor_y INTEGER,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, project_id)
);

-- Create indexes for better performance
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_project_id ON notifications(project_id);
CREATE INDEX idx_notifications_work_item_id ON notifications(work_item_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

CREATE INDEX idx_collaborative_sessions_work_item_id ON collaborative_sessions(work_item_id);
CREATE INDEX idx_collaborative_sessions_last_activity ON collaborative_sessions(last_activity);

CREATE INDEX idx_user_presence_user_id ON user_presence(user_id);
CREATE INDEX idx_user_presence_project_id ON user_presence(project_id);
CREATE INDEX idx_user_presence_status ON user_presence(status);
CREATE INDEX idx_user_presence_last_seen ON user_presence(last_seen);

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaborative_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_presence ENABLE ROW LEVEL SECURITY;

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications" ON notifications
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Project members can create notifications for project members" ON notifications
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM project_members pm1
            WHERE pm1.project_id = notifications.project_id 
            AND pm1.user_id = auth.uid()
        ) AND
        EXISTS (
            SELECT 1 FROM project_members pm2
            WHERE pm2.project_id = notifications.project_id 
            AND pm2.user_id = notifications.user_id
        )
    );

-- Collaborative sessions policies
CREATE POLICY "Project members can view collaborative sessions" ON collaborative_sessions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM work_items wi
            JOIN project_members pm ON wi.project_id = pm.project_id
            WHERE wi.id = collaborative_sessions.work_item_id
            AND pm.user_id = auth.uid()
        )
    );

CREATE POLICY "Project members can manage collaborative sessions" ON collaborative_sessions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM work_items wi
            JOIN project_members pm ON wi.project_id = pm.project_id
            WHERE wi.id = collaborative_sessions.work_item_id
            AND pm.user_id = auth.uid()
        )
    );

-- User presence policies
CREATE POLICY "Users can manage their own presence" ON user_presence
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Project members can view presence of other project members" ON user_presence
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM project_members pm1, project_members pm2
            WHERE pm1.project_id = user_presence.project_id
            AND pm2.project_id = user_presence.project_id
            AND pm1.user_id = auth.uid()
            AND pm2.user_id = user_presence.user_id
        )
    );

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_notifications_updated_at 
    BEFORE UPDATE ON notifications 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_collaborative_sessions_updated_at 
    BEFORE UPDATE ON collaborative_sessions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_presence_updated_at 
    BEFORE UPDATE ON user_presence 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create notification
CREATE OR REPLACE FUNCTION create_notification(
    p_type notification_type,
    p_title TEXT,
    p_message TEXT,
    p_user_id UUID,
    p_project_id UUID,
    p_work_item_id UUID DEFAULT NULL,
    p_sprint_id UUID DEFAULT NULL,
    p_comment_id UUID DEFAULT NULL,
    p_action_url TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
    notification_id UUID;
BEGIN
    INSERT INTO notifications (
        type, title, message, user_id, project_id, 
        work_item_id, sprint_id, comment_id, action_url, metadata
    ) VALUES (
        p_type, p_title, p_message, p_user_id, p_project_id,
        p_work_item_id, p_sprint_id, p_comment_id, p_action_url, p_metadata
    ) RETURNING id INTO notification_id;
    
    RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update user presence
CREATE OR REPLACE FUNCTION update_user_presence(
    p_user_id UUID,
    p_project_id UUID,
    p_status TEXT DEFAULT 'online',
    p_current_page TEXT DEFAULT NULL,
    p_current_work_item UUID DEFAULT NULL,
    p_cursor_x INTEGER DEFAULT NULL,
    p_cursor_y INTEGER DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO user_presence (
        user_id, project_id, status, current_page, 
        current_work_item, cursor_x, cursor_y, last_seen
    ) VALUES (
        p_user_id, p_project_id, p_status, p_current_page,
        p_current_work_item, p_cursor_x, p_cursor_y, NOW()
    )
    ON CONFLICT (user_id, project_id) 
    DO UPDATE SET
        status = EXCLUDED.status,
        current_page = EXCLUDED.current_page,
        current_work_item = EXCLUDED.current_work_item,
        cursor_x = EXCLUDED.cursor_x,
        cursor_y = EXCLUDED.cursor_y,
        last_seen = NOW(),
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to join collaborative session
CREATE OR REPLACE FUNCTION join_collaborative_session(
    p_work_item_id UUID,
    p_user_data JSONB
)
RETURNS VOID AS $$
DECLARE
    current_users JSONB;
    updated_users JSONB;
BEGIN
    -- Get current active users
    SELECT active_users INTO current_users
    FROM collaborative_sessions
    WHERE work_item_id = p_work_item_id;
    
    -- If session doesn't exist, create it
    IF current_users IS NULL THEN
        INSERT INTO collaborative_sessions (work_item_id, active_users, last_activity)
        VALUES (p_work_item_id, jsonb_build_array(p_user_data), NOW());
    ELSE
        -- Remove user if already exists, then add updated user data
        SELECT jsonb_agg(user_obj)
        INTO updated_users
        FROM jsonb_array_elements(current_users) AS user_obj
        WHERE (user_obj->>'userId') != (p_user_data->>'userId');
        
        -- Add the new/updated user data
        updated_users = COALESCE(updated_users, '[]'::jsonb) || jsonb_build_array(p_user_data);
        
        -- Update the session
        UPDATE collaborative_sessions
        SET active_users = updated_users, last_activity = NOW()
        WHERE work_item_id = p_work_item_id;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to leave collaborative session
CREATE OR REPLACE FUNCTION leave_collaborative_session(
    p_work_item_id UUID,
    p_user_id UUID
)
RETURNS VOID AS $$
DECLARE
    current_users JSONB;
    updated_users JSONB;
BEGIN
    -- Get current active users
    SELECT active_users INTO current_users
    FROM collaborative_sessions
    WHERE work_item_id = p_work_item_id;
    
    IF current_users IS NOT NULL THEN
        -- Remove user from active users
        SELECT jsonb_agg(user_obj)
        INTO updated_users
        FROM jsonb_array_elements(current_users) AS user_obj
        WHERE (user_obj->>'userId') != p_user_id::text;
        
        -- Update or delete session
        IF jsonb_array_length(COALESCE(updated_users, '[]'::jsonb)) = 0 THEN
            DELETE FROM collaborative_sessions WHERE work_item_id = p_work_item_id;
        ELSE
            UPDATE collaborative_sessions
            SET active_users = updated_users, last_activity = NOW()
            WHERE work_item_id = p_work_item_id;
        END IF;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up old presence data
CREATE OR REPLACE FUNCTION cleanup_old_presence()
RETURNS VOID AS $$
BEGIN
    -- Mark users as offline if they haven't been seen for more than 5 minutes
    UPDATE user_presence
    SET status = 'offline'
    WHERE last_seen < NOW() - INTERVAL '5 minutes'
    AND status != 'offline';
    
    -- Delete presence records older than 24 hours
    DELETE FROM user_presence
    WHERE last_seen < NOW() - INTERVAL '24 hours';
    
    -- Clean up old collaborative sessions (inactive for more than 1 hour)
    DELETE FROM collaborative_sessions
    WHERE last_activity < NOW() - INTERVAL '1 hour';
    
    -- Clean up old notifications (older than 30 days)
    DELETE FROM notifications
    WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- REALTIME PUBLICATION
-- =====================================================

-- Enable realtime for the new tables
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE collaborative_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE user_presence;

-- =====================================================
-- SCHEDULED CLEANUP
-- =====================================================

-- Note: In a production environment, you would set up a cron job or 
-- scheduled function to run cleanup_old_presence() periodically.
-- For now, this is just the function definition.

COMMENT ON FUNCTION cleanup_old_presence() IS 'Clean up old presence data and collaborative sessions. Should be run periodically via cron job.';
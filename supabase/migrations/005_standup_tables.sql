-- Create standup status enum
CREATE TYPE standup_status AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled');

-- Create standup participation status enum
CREATE TYPE standup_participation_status AS ENUM ('pending', 'submitted', 'skipped');

-- Create standups table
CREATE TABLE standups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    sprint_id UUID REFERENCES sprints(id) ON DELETE SET NULL,
    scheduled_date TIMESTAMPTZ NOT NULL,
    status standup_status NOT NULL DEFAULT 'scheduled',
    facilitator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    participants UUID[] NOT NULL DEFAULT '{}',
    duration INTEGER, -- in minutes
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create standup_participations table
CREATE TABLE standup_participations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    standup_id UUID NOT NULL REFERENCES standups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    yesterday TEXT NOT NULL DEFAULT '',
    today TEXT NOT NULL DEFAULT '',
    blockers TEXT NOT NULL DEFAULT '',
    status standup_participation_status NOT NULL DEFAULT 'pending',
    submitted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(standup_id, user_id)
);

-- Create standup_reminders table
CREATE TABLE standup_reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    standup_id UUID NOT NULL REFERENCES standups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reminder_type TEXT NOT NULL CHECK (reminder_type IN ('initial', 'follow_up', 'final')),
    scheduled_at TIMESTAMPTZ NOT NULL,
    sent_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_standups_project_id ON standups(project_id);
CREATE INDEX idx_standups_sprint_id ON standups(sprint_id);
CREATE INDEX idx_standups_scheduled_date ON standups(scheduled_date);
CREATE INDEX idx_standups_status ON standups(status);
CREATE INDEX idx_standups_facilitator_id ON standups(facilitator_id);

CREATE INDEX idx_standup_participations_standup_id ON standup_participations(standup_id);
CREATE INDEX idx_standup_participations_user_id ON standup_participations(user_id);
CREATE INDEX idx_standup_participations_status ON standup_participations(status);

CREATE INDEX idx_standup_reminders_standup_id ON standup_reminders(standup_id);
CREATE INDEX idx_standup_reminders_user_id ON standup_reminders(user_id);
CREATE INDEX idx_standup_reminders_scheduled_at ON standup_reminders(scheduled_at);
CREATE INDEX idx_standup_reminders_status ON standup_reminders(status);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_standups_updated_at BEFORE UPDATE ON standups
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_standup_participations_updated_at BEFORE UPDATE ON standup_participations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE standups ENABLE ROW LEVEL SECURITY;
ALTER TABLE standup_participations ENABLE ROW LEVEL SECURITY;
ALTER TABLE standup_reminders ENABLE ROW LEVEL SECURITY;

-- RLS Policies for standups table
CREATE POLICY "Users can view standups for projects they are members of" ON standups
    FOR SELECT USING (
        project_id IN (
            SELECT project_id FROM project_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Project members can create standups" ON standups
    FOR INSERT WITH CHECK (
        project_id IN (
            SELECT project_id FROM project_members 
            WHERE user_id = auth.uid() 
            AND role IN ('owner', 'admin', 'member')
        )
    );

CREATE POLICY "Facilitators and project admins can update standups" ON standups
    FOR UPDATE USING (
        facilitator_id = auth.uid() OR
        project_id IN (
            SELECT project_id FROM project_members 
            WHERE user_id = auth.uid() 
            AND role IN ('owner', 'admin')
        )
    );

CREATE POLICY "Facilitators and project admins can delete standups" ON standups
    FOR DELETE USING (
        facilitator_id = auth.uid() OR
        project_id IN (
            SELECT project_id FROM project_members 
            WHERE user_id = auth.uid() 
            AND role IN ('owner', 'admin')
        )
    );

-- RLS Policies for standup_participations table
CREATE POLICY "Users can view participations for standups they can access" ON standup_participations
    FOR SELECT USING (
        standup_id IN (
            SELECT id FROM standups 
            WHERE project_id IN (
                SELECT project_id FROM project_members 
                WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can create their own participation" ON standup_participations
    FOR INSERT WITH CHECK (
        user_id = auth.uid() AND
        standup_id IN (
            SELECT id FROM standups 
            WHERE project_id IN (
                SELECT project_id FROM project_members 
                WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can update their own participation" ON standup_participations
    FOR UPDATE USING (
        user_id = auth.uid()
    );

CREATE POLICY "Users can delete their own participation" ON standup_participations
    FOR DELETE USING (
        user_id = auth.uid()
    );

-- RLS Policies for standup_reminders table
CREATE POLICY "Users can view their own reminders" ON standup_reminders
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can create reminders" ON standup_reminders
    FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update reminders" ON standup_reminders
    FOR UPDATE USING (true);

CREATE POLICY "System can delete reminders" ON standup_reminders
    FOR DELETE USING (true);
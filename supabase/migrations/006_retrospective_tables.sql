-- =====================================================
-- RETROSPECTIVE TABLES MIGRATION
-- Add tables for retrospective and review functionality
-- =====================================================

-- Create retrospective status enum
CREATE TYPE retrospective_status AS ENUM ('draft', 'in_progress', 'completed');

-- Create retrospective feedback category enum
CREATE TYPE feedback_category AS ENUM ('went_well', 'needs_improvement', 'action_items');

-- Create action item status enum
CREATE TYPE action_item_status AS ENUM ('open', 'in_progress', 'completed', 'cancelled');

-- Retrospective templates table (must be created first due to foreign key reference)
CREATE TABLE public.retrospective_templates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    categories JSONB NOT NULL DEFAULT '[]',
    is_default BOOLEAN DEFAULT FALSE,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Retrospectives table
CREATE TABLE public.retrospectives (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    sprint_id UUID NOT NULL REFERENCES public.sprints(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    status retrospective_status DEFAULT 'draft',
    facilitator_id UUID NOT NULL REFERENCES public.users(id),
    participants UUID[] DEFAULT '{}',
    template_id UUID REFERENCES public.retrospective_templates(id),
    scheduled_date TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Retrospective feedback table
CREATE TABLE public.retrospective_feedback (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    retrospective_id UUID NOT NULL REFERENCES public.retrospectives(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id),
    category feedback_category NOT NULL,
    content TEXT NOT NULL,
    votes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Retrospective action items table
CREATE TABLE public.retrospective_action_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    retrospective_id UUID NOT NULL REFERENCES public.retrospectives(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    assignee_id UUID REFERENCES public.users(id),
    priority priority_type DEFAULT 'medium',
    status action_item_status DEFAULT 'open',
    due_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_retrospectives_project_id ON public.retrospectives(project_id);
CREATE INDEX idx_retrospectives_sprint_id ON public.retrospectives(sprint_id);
CREATE INDEX idx_retrospectives_status ON public.retrospectives(status);
CREATE INDEX idx_retrospective_feedback_retrospective_id ON public.retrospective_feedback(retrospective_id);
CREATE INDEX idx_retrospective_feedback_category ON public.retrospective_feedback(category);
CREATE INDEX idx_retrospective_action_items_retrospective_id ON public.retrospective_action_items(retrospective_id);
CREATE INDEX idx_retrospective_action_items_status ON public.retrospective_action_items(status);
CREATE INDEX idx_retrospective_templates_is_default ON public.retrospective_templates(is_default);

-- Add updated_at triggers
CREATE TRIGGER update_retrospectives_updated_at
    BEFORE UPDATE ON public.retrospectives
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_retrospective_feedback_updated_at
    BEFORE UPDATE ON public.retrospective_feedback
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_retrospective_action_items_updated_at
    BEFORE UPDATE ON public.retrospective_action_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to vote on feedback
CREATE OR REPLACE FUNCTION vote_retrospective_feedback(
    feedback_id UUID,
    increment_vote BOOLEAN DEFAULT TRUE
)
RETURNS TABLE(
    id UUID,
    retrospective_id UUID,
    user_id UUID,
    category feedback_category,
    content TEXT,
    votes INTEGER,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.retrospective_feedback
    SET votes = CASE 
        WHEN increment_vote THEN votes + 1
        ELSE GREATEST(votes - 1, 0)
    END,
    updated_at = NOW()
    WHERE retrospective_feedback.id = feedback_id;
    
    RETURN QUERY
    SELECT rf.id, rf.retrospective_id, rf.user_id, rf.category, rf.content, rf.votes, rf.created_at, rf.updated_at
    FROM public.retrospective_feedback rf
    WHERE rf.id = feedback_id;
END;
$$;

-- Insert default retrospective templates
INSERT INTO public.retrospective_templates (name, description, categories, is_default, created_by) VALUES
(
    'Start, Stop, Continue',
    'Classic retrospective format focusing on what to start doing, stop doing, and continue doing',
    '[
        {"name": "Start", "description": "What should we start doing?", "color": "#10B981"},
        {"name": "Stop", "description": "What should we stop doing?", "color": "#EF4444"},
        {"name": "Continue", "description": "What should we continue doing?", "color": "#3B82F6"}
    ]'::jsonb,
    true,
    NULL
),
(
    'What Went Well, What Didn''t, Action Items',
    'Standard retrospective format with three categories',
    '[
        {"name": "What Went Well", "description": "Positive aspects of the sprint", "color": "#10B981"},
        {"name": "What Didn''t Go Well", "description": "Areas that need improvement", "color": "#F59E0B"},
        {"name": "Action Items", "description": "Specific actions to take", "color": "#8B5CF6"}
    ]'::jsonb,
    true,
    NULL
),
(
    'Mad, Sad, Glad',
    'Emotional retrospective format focusing on team feelings',
    '[
        {"name": "Mad", "description": "What frustrated the team?", "color": "#EF4444"},
        {"name": "Sad", "description": "What disappointed the team?", "color": "#F59E0B"},
        {"name": "Glad", "description": "What made the team happy?", "color": "#10B981"}
    ]'::jsonb,
    true,
    NULL
);
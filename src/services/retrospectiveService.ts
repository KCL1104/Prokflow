import type {
  Retrospective,
  RetrospectiveFeedback,
  RetrospectiveActionItem,
  RetrospectiveTemplate,
  CreateRetrospectiveRequest,
  UpdateRetrospectiveRequest,
  CreateRetrospectiveFeedbackRequest,
  UpdateRetrospectiveFeedbackRequest,
  CreateRetrospectiveActionItemRequest,
  UpdateRetrospectiveActionItemRequest,
  CreateRetrospectiveTemplateRequest,
  ApiResponse
} from '../types';
import { supabase } from '../lib/supabase';
import { getCurrentUserId } from '../lib/supabase';
import type { Database } from '../types/database';

// Database type aliases
type RetrospectiveRow = Database['public']['Tables']['retrospectives']['Row'];
type RetrospectiveInsert = Database['public']['Tables']['retrospectives']['Insert'];
type RetrospectiveUpdate = Database['public']['Tables']['retrospectives']['Update'];
type RetrospectiveFeedbackRow = Database['public']['Tables']['retrospective_feedback']['Row'];
type RetrospectiveFeedbackInsert = Database['public']['Tables']['retrospective_feedback']['Insert'];
type RetrospectiveFeedbackUpdate = Database['public']['Tables']['retrospective_feedback']['Update'];
type RetrospectiveActionItemRow = Database['public']['Tables']['retrospective_action_items']['Row'];
type RetrospectiveActionItemInsert = Database['public']['Tables']['retrospective_action_items']['Insert'];
type RetrospectiveActionItemUpdate = Database['public']['Tables']['retrospective_action_items']['Update'];
type RetrospectiveTemplateRow = Database['public']['Tables']['retrospective_templates']['Row'];
type RetrospectiveTemplateInsert = Database['public']['Tables']['retrospective_templates']['Insert'];

// Transform functions
function transformRetrospectiveFromDb(row: RetrospectiveRow): Retrospective {
  return {
    id: row.id,
    projectId: row.project_id,
    sprintId: row.sprint_id || '',
    title: `Retrospective for ${row.project_id}`, // Default title since it's not in DB
    status: row.status,
    facilitatorId: row.facilitator_id,
    participants: row.participants || [],
    templateId: row.template_id || undefined,
    scheduledDate: row.scheduled_date ? new Date(row.scheduled_date) : undefined,
    completedAt: row.completed_at ? new Date(row.completed_at) : undefined,
    createdAt: new Date(row.created_at || ''),
    updatedAt: new Date(row.updated_at || '')
  };
}

function transformRetrospectiveToDb(data: Partial<Retrospective>): Partial<RetrospectiveInsert | RetrospectiveUpdate> {
  const result: Partial<RetrospectiveInsert | RetrospectiveUpdate> = {};
  
  if (data.projectId !== undefined) result.project_id = data.projectId;
  if (data.sprintId !== undefined) result.sprint_id = data.sprintId;
  if (data.status !== undefined) result.status = data.status;
  if (data.facilitatorId !== undefined) result.facilitator_id = data.facilitatorId;
  if (data.participants !== undefined) result.participants = data.participants;
  if (data.templateId !== undefined) result.template_id = data.templateId;
  if (data.scheduledDate !== undefined) result.scheduled_date = data.scheduledDate?.toISOString();
  if (data.completedAt !== undefined) result.completed_at = data.completedAt?.toISOString();
  
  return result;
}

function transformFeedbackFromDb(row: RetrospectiveFeedbackRow): RetrospectiveFeedback {
  return {
    id: row.id,
    retrospectiveId: row.retrospective_id,
    userId: row.user_id,
    category: row.category,
    content: row.content,
    votes: row.votes || 0,
    createdAt: new Date(row.created_at || ''),
    updatedAt: new Date(row.updated_at || '')
  };
}

function transformFeedbackToDb(data: Partial<RetrospectiveFeedback>): Partial<RetrospectiveFeedbackInsert | RetrospectiveFeedbackUpdate> {
  const result: Partial<RetrospectiveFeedbackInsert | RetrospectiveFeedbackUpdate> = {};
  
  if (data.retrospectiveId !== undefined) result.retrospective_id = data.retrospectiveId;
  if (data.userId !== undefined) result.user_id = data.userId;
  if (data.category !== undefined) result.category = data.category;
  if (data.content !== undefined) result.content = data.content;
  if (data.votes !== undefined) result.votes = data.votes;
  
  return result;
}

function transformActionItemFromDb(row: RetrospectiveActionItemRow): RetrospectiveActionItem {
  return {
    id: row.id,
    retrospectiveId: row.retrospective_id,
    title: row.title,
    description: row.description,
    assigneeId: row.assignee_id || undefined,
    priority: 'medium', // Default since priority is not in DB schema
    status: row.status,
    dueDate: row.due_date ? new Date(row.due_date) : undefined,
    createdAt: new Date(row.created_at || ''),
    updatedAt: new Date(row.updated_at || '')
  };
}

function transformActionItemToDb(data: Partial<RetrospectiveActionItem>): RetrospectiveActionItemInsert {
  if (!data.retrospectiveId) {
    throw new Error('retrospectiveId is required');
  }
  if (!data.title) {
    throw new Error('title is required');
  }
  if (!data.description) {
    throw new Error('description is required');
  }
  
  return {
    retrospective_id: data.retrospectiveId,
    title: data.title,
    description: data.description,
    assignee_id: data.assigneeId || null,
    status: data.status || 'open',
    due_date: data.dueDate?.toISOString() || null
  };
}

function transformActionItemUpdateToDb(data: Partial<RetrospectiveActionItem>): Partial<RetrospectiveActionItemUpdate> {
  const result: Partial<RetrospectiveActionItemUpdate> = {};
  
  if (data.title !== undefined) result.title = data.title;
  if (data.description !== undefined) result.description = data.description;
  if (data.assigneeId !== undefined) result.assignee_id = data.assigneeId;
  if (data.status !== undefined) result.status = data.status;
  if (data.dueDate !== undefined) result.due_date = data.dueDate?.toISOString();
  
  return result;
}

function transformTemplateFromDb(row: RetrospectiveTemplateRow): RetrospectiveTemplate {
  return {
    id: row.id,
    name: row.name,
    description: row.description || '',
    categories: row.categories as RetrospectiveTemplate['categories'], // JSON field
    isDefault: row.is_default || false,
    createdBy: 'system', // Default since not in DB schema
    createdAt: new Date(row.created_at || '')
  };
}

function transformTemplateToDb(data: Partial<RetrospectiveTemplate>): RetrospectiveTemplateInsert {
  if (!data.name) {
    throw new Error('name is required');
  }
  if (!data.categories) {
    throw new Error('categories is required');
  }
  
  return {
    name: data.name,
    description: data.description || null,
    categories: data.categories,
    is_default: data.isDefault || false
  };
}

// Error handling
class RetrospectiveServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public operation: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'RetrospectiveServiceError';
  }
}

function withErrorHandling<T extends unknown[], R>(
  fn: (...args: T) => Promise<R>,
  operation: string
) {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error) {
      if (error instanceof RetrospectiveServiceError) {
        throw error;
      }
      throw new RetrospectiveServiceError(
        `Failed to ${operation}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'UNKNOWN_ERROR',
        operation,
        error instanceof Error ? error : undefined
      );
    }
  };
}

export const retrospectiveService = {
  // Retrospective CRUD operations
  createRetrospective: withErrorHandling(async (data: CreateRetrospectiveRequest): Promise<ApiResponse<Retrospective>> => {
    const currentUserId = await getCurrentUserId();
    if (!currentUserId) {
      throw new RetrospectiveServiceError('User not authenticated', 'UNAUTHORIZED', 'create retrospective');
    }

    const insertData: RetrospectiveInsert = {
      project_id: data.projectId,
      sprint_id: data.sprintId,
      status: data.status || 'draft',
      facilitator_id: data.facilitatorId,
      participants: data.participants || [],
      template_id: data.templateId,
      scheduled_date: data.scheduledDate?.toISOString()
    };

    const { data: retrospectiveRow, error } = await supabase
      .from('retrospectives')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      throw new RetrospectiveServiceError(`Failed to create retrospective: ${error.message}`, 'DATABASE_ERROR', 'create retrospective', error);
    }

    return {
      data: transformRetrospectiveFromDb(retrospectiveRow),
      success: true,
      message: 'Retrospective created successfully'
    };
  }, 'create retrospective'),

  getRetrospective: withErrorHandling(async (id: string): Promise<ApiResponse<Retrospective>> => {
    const { data: retrospectiveRow, error } = await supabase
      .from('retrospectives')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new RetrospectiveServiceError('Retrospective not found', 'NOT_FOUND', 'get retrospective');
      }
      throw new RetrospectiveServiceError(`Failed to get retrospective: ${error.message}`, 'DATABASE_ERROR', 'get retrospective', error);
    }

    return {
      data: transformRetrospectiveFromDb(retrospectiveRow),
      success: true
    };
  }, 'get retrospective'),

  getProjectRetrospectives: withErrorHandling(async (projectId: string): Promise<ApiResponse<Retrospective[]>> => {
    const { data: retrospectiveRows, error } = await supabase
      .from('retrospectives')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new RetrospectiveServiceError(`Failed to get project retrospectives: ${error.message}`, 'DATABASE_ERROR', 'get project retrospectives', error);
    }

    return {
      data: retrospectiveRows.map(transformRetrospectiveFromDb),
      success: true
    };
  }, 'get project retrospectives'),

  updateRetrospective: withErrorHandling(async (id: string, data: UpdateRetrospectiveRequest): Promise<ApiResponse<Retrospective>> => {
    const updateData = transformRetrospectiveToDb(data);

    const { data: retrospectiveRow, error } = await supabase
      .from('retrospectives')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new RetrospectiveServiceError('Retrospective not found', 'NOT_FOUND', 'update retrospective');
      }
      throw new RetrospectiveServiceError(`Failed to update retrospective: ${error.message}`, 'DATABASE_ERROR', 'update retrospective', error);
    }

    return {
      data: transformRetrospectiveFromDb(retrospectiveRow),
      success: true,
      message: 'Retrospective updated successfully'
    };
  }, 'update retrospective'),

  deleteRetrospective: withErrorHandling(async (id: string): Promise<ApiResponse<void>> => {
    const { error } = await supabase
      .from('retrospectives')
      .delete()
      .eq('id', id);

    if (error) {
      throw new RetrospectiveServiceError(`Failed to delete retrospective: ${error.message}`, 'DATABASE_ERROR', 'delete retrospective', error);
    }

    return {
      data: undefined,
      success: true,
      message: 'Retrospective deleted successfully'
    };
  }, 'delete retrospective'),

  // Feedback operations
  createFeedback: withErrorHandling(async (data: CreateRetrospectiveFeedbackRequest): Promise<ApiResponse<RetrospectiveFeedback>> => {
    const insertData: RetrospectiveFeedbackInsert = {
      retrospective_id: data.retrospectiveId,
      category: data.category,
      content: data.content,
      user_id: data.userId,
      votes: 0
    };

    const { data: feedbackRow, error } = await supabase
      .from('retrospective_feedback')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      throw new RetrospectiveServiceError(`Failed to create feedback: ${error.message}`, 'DATABASE_ERROR', 'create feedback', error);
    }

    return {
      data: transformFeedbackFromDb(feedbackRow),
      success: true,
      message: 'Feedback created successfully'
    };
  }, 'create feedback'),

  updateFeedback: withErrorHandling(async (id: string, data: UpdateRetrospectiveFeedbackRequest): Promise<ApiResponse<RetrospectiveFeedback>> => {
    const updateData = transformFeedbackToDb(data);

    const { data: feedbackRow, error } = await supabase
      .from('retrospective_feedback')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new RetrospectiveServiceError('Feedback not found', 'NOT_FOUND', 'update feedback');
      }
      throw new RetrospectiveServiceError(`Failed to update feedback: ${error.message}`, 'DATABASE_ERROR', 'update feedback', error);
    }

    return {
      data: transformFeedbackFromDb(feedbackRow),
      success: true,
      message: 'Feedback updated successfully'
    };
  }, 'update feedback'),

  deleteFeedback: withErrorHandling(async (id: string): Promise<ApiResponse<void>> => {
    const { error } = await supabase
      .from('retrospective_feedback')
      .delete()
      .eq('id', id);

    if (error) {
      throw new RetrospectiveServiceError(`Failed to delete feedback: ${error.message}`, 'DATABASE_ERROR', 'delete feedback', error);
    }

    return {
      data: undefined,
      success: true,
      message: 'Feedback deleted successfully'
    };
  }, 'delete feedback'),

  voteFeedback: withErrorHandling(async (id: string, increment: boolean = true): Promise<ApiResponse<RetrospectiveFeedback>> => {
    const currentUserId = await getCurrentUserId();
    if (!currentUserId) {
      throw new RetrospectiveServiceError('User not authenticated', 'UNAUTHORIZED', 'vote feedback');
    }

    // Use the database function for voting
    const { error: voteError } = await supabase.rpc('vote_retrospective_feedback', {
      feedback_id: id,
      user_id: currentUserId
    });

    if (voteError) {
      throw new RetrospectiveServiceError(`Failed to vote feedback: ${voteError.message}`, 'DATABASE_ERROR', 'vote feedback', voteError);
    }

    // Fetch the updated feedback
    const { data: feedbackRow, error: fetchError } = await supabase
      .from('retrospective_feedback')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) {
      throw new RetrospectiveServiceError(`Failed to fetch updated feedback: ${fetchError.message}`, 'DATABASE_ERROR', 'vote feedback', fetchError);
    }

    return {
      data: transformFeedbackFromDb(feedbackRow),
      success: true,
      message: increment ? 'Vote added' : 'Vote removed'
    };
  }, 'vote feedback'),

  // Action item operations
  createActionItem: withErrorHandling(async (data: CreateRetrospectiveActionItemRequest): Promise<ApiResponse<RetrospectiveActionItem>> => {
    const currentUserId = await getCurrentUserId();
    if (!currentUserId) {
      throw new RetrospectiveServiceError('User not authenticated', 'UNAUTHORIZED', 'create action item');
    }

    const insertData = transformActionItemToDb({
      ...data,
      status: 'open'
    });

    const { data: actionItemRows, error } = await supabase
      .from('retrospective_action_items')
      .insert([insertData])
      .select();

    if (error) {
      throw new RetrospectiveServiceError(`Failed to create action item: ${error.message}`, 'DATABASE_ERROR', 'create action item', error);
    }

    if (!actionItemRows || actionItemRows.length === 0) {
      throw new RetrospectiveServiceError('No action item data returned', 'DATABASE_ERROR', 'create action item');
    }

    const actionItemRow = actionItemRows[0];

    return {
      data: transformActionItemFromDb(actionItemRow),
      success: true,
      message: 'Action item created successfully'
    };
  }, 'create action item'),

  updateActionItem: withErrorHandling(async (id: string, data: UpdateRetrospectiveActionItemRequest): Promise<ApiResponse<RetrospectiveActionItem>> => {
    const updateData = transformActionItemUpdateToDb(data);

    const { data: actionItemRow, error } = await supabase
      .from('retrospective_action_items')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new RetrospectiveServiceError('Action item not found', 'NOT_FOUND', 'update action item');
      }
      throw new RetrospectiveServiceError(`Failed to update action item: ${error.message}`, 'DATABASE_ERROR', 'update action item', error);
    }

    return {
      data: transformActionItemFromDb(actionItemRow),
      success: true,
      message: 'Action item updated successfully'
    };
  }, 'update action item'),

  deleteActionItem: withErrorHandling(async (id: string): Promise<ApiResponse<void>> => {
    const { error } = await supabase
      .from('retrospective_action_items')
      .delete()
      .eq('id', id);

    if (error) {
      throw new RetrospectiveServiceError(`Failed to delete action item: ${error.message}`, 'DATABASE_ERROR', 'delete action item', error);
    }

    return {
      data: undefined,
      success: true,
      message: 'Action item deleted successfully'
    };
  }, 'delete action item'),

  // Template operations
  getTemplates: withErrorHandling(async (): Promise<ApiResponse<RetrospectiveTemplate[]>> => {
    const { data: templateRows, error } = await supabase
      .from('retrospective_templates')
      .select('*')
      .order('is_default', { ascending: false })
      .order('name');

    if (error) {
      throw new RetrospectiveServiceError(`Failed to fetch templates: ${error.message}`, 'DATABASE_ERROR', 'get templates', error);
    }

    return {
      data: templateRows.map(transformTemplateFromDb),
      success: true,
      message: 'Templates retrieved successfully'
    };
  }, 'get templates'),

  createTemplate: withErrorHandling(async (data: CreateRetrospectiveTemplateRequest): Promise<ApiResponse<RetrospectiveTemplate>> => {
    const currentUserId = await getCurrentUserId();
    if (!currentUserId) {
      throw new RetrospectiveServiceError('User not authenticated', 'UNAUTHORIZED', 'create template');
    }

    const insertData = transformTemplateToDb({
      ...data,
      isDefault: false
    });

    const { data: templateRows, error } = await supabase
      .from('retrospective_templates')
      .insert([insertData])
      .select();

    if (error) {
      throw new RetrospectiveServiceError(`Failed to create template: ${error.message}`, 'DATABASE_ERROR', 'create template', error);
    }

    if (!templateRows || templateRows.length === 0) {
      throw new RetrospectiveServiceError('No template data returned', 'DATABASE_ERROR', 'create template');
    }

    const templateRow = templateRows[0];

    return {
      data: transformTemplateFromDb(templateRow),
      success: true,
      message: 'Template created successfully'
    };
  }, 'create template')
};
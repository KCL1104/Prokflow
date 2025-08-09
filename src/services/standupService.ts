import { supabase, getCurrentUserId } from '../lib/supabase';
import { getErrorMessage } from '../utils/errorHandling';
import type { 
  Standup, 
  StandupParticipation,
  CreateStandupRequest,
  UpdateStandupRequest,
  CreateStandupParticipationRequest,
  UpdateStandupParticipationRequest
} from '../types';
import type { Database } from '../types/database';

type StandupRow = Database['public']['Tables']['standups']['Row'];
type StandupInsert = Database['public']['Tables']['standups']['Insert'];
type StandupParticipationRow = Database['public']['Tables']['standup_participations']['Row'];
type StandupParticipationInsert = Database['public']['Tables']['standup_participations']['Insert'];

// Transform functions to convert between database and domain models
const transformStandupFromDb = (row: StandupRow): Standup => ({
  id: row.id,
  projectId: row.project_id,
  sprintId: row.sprint_id || undefined,
  scheduledDate: new Date(row.scheduled_date),
  status: row.status,
  facilitatorId: row.facilitator_id,
  participants: row.participants || [],
  duration: row.duration || undefined,
  notes: row.notes || undefined,
  createdAt: new Date(row.created_at || ''),
  updatedAt: new Date(row.updated_at || '')
});

const transformStandupToDb = (standup: Partial<Standup>): StandupInsert => {
  if (!standup.projectId) {
    throw new Error('projectId is required');
  }
  if (!standup.facilitatorId) {
    throw new Error('facilitatorId is required');
  }
  if (!standup.scheduledDate) {
    throw new Error('scheduledDate is required');
  }
  
  return {
    project_id: standup.projectId,
    sprint_id: standup.sprintId || null,
    scheduled_date: standup.scheduledDate.toISOString(),
    status: standup.status || 'scheduled',
    facilitator_id: standup.facilitatorId,
    participants: standup.participants || null,
    duration: standup.duration || null,
    notes: standup.notes || null
  };
};

const transformParticipationFromDb = (row: StandupParticipationRow): StandupParticipation => ({
  id: row.id,
  standupId: row.standup_id,
  userId: row.user_id,
  yesterday: row.progress || '',
  today: row.plans || '',
  blockers: row.blockers || '',
  status: row.status,
  submittedAt: row.submitted_at ? new Date(row.submitted_at) : undefined,
  createdAt: new Date(row.created_at || ''),
  updatedAt: new Date(row.updated_at || '')
});

const transformParticipationToDb = (participation: Partial<StandupParticipation>): StandupParticipationInsert => {
  if (!participation.standupId) {
    throw new Error('standupId is required');
  }
  if (!participation.userId) {
    throw new Error('userId is required');
  }
  
  return {
    standup_id: participation.standupId,
    user_id: participation.userId,
    progress: participation.yesterday || null,
    plans: participation.today || null,
    blockers: participation.blockers || null,
    status: participation.status || 'pending',
    submitted_at: participation.submittedAt?.toISOString() || null
  };
};

// Enhanced error types for better error handling
export class StandupServiceError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly operation: string,
    public readonly originalError?: unknown
  ) {
    super(message);
    this.name = 'StandupServiceError';
  }
}

// Service wrapper for consistent error handling with typed errors
const withErrorHandling = <T extends unknown[], R>(
  operation: (...args: T) => Promise<R> | R,
  operationName: string
) => {
  return async (...args: T): Promise<R> => {
    try {
      return await operation(...args);
    } catch (error) {
      // Re-throw StandupServiceError as-is
      if (error instanceof StandupServiceError) {
        throw error;
      }
      
      // Wrap other errors in StandupServiceError
      const errorMessage = getErrorMessage(error);
      throw new StandupServiceError(
        `Failed to ${operationName}: ${errorMessage}`,
        'OPERATION_FAILED',
        operationName,
        error
      );
    }
  };
};

export const standupService = {
  // Create a new standup
  createStandup: withErrorHandling(async (data: CreateStandupRequest): Promise<Standup> => {
    // Input validation
    if (!data.projectId?.trim()) {
      throw new StandupServiceError('Project ID is required', 'VALIDATION_ERROR', 'create standup');
    }
    if (!data.facilitatorId?.trim()) {
      throw new StandupServiceError('Facilitator ID is required', 'VALIDATION_ERROR', 'create standup');
    }
    if (!data.scheduledDate || data.scheduledDate < new Date()) {
      throw new StandupServiceError('Scheduled date must be in the future', 'VALIDATION_ERROR', 'create standup');
    }
    if (!Array.isArray(data.participants) || data.participants.length === 0) {
      throw new StandupServiceError('At least one participant is required', 'VALIDATION_ERROR', 'create standup');
    }

    const standupData = transformStandupToDb({
      projectId: data.projectId,
      sprintId: data.sprintId,
      scheduledDate: data.scheduledDate,
      status: 'scheduled',
      facilitatorId: data.facilitatorId,
      participants: data.participants,
      duration: data.duration,
      notes: data.notes
    });

    const { data: standupRows, error } = await supabase
      .from('standups')
      .insert([standupData])
      .select();

    if (error) {
      throw new StandupServiceError(`Failed to create standup: ${error.message}`, 'DATABASE_ERROR', 'create standup', error);
    }

    if (!standupRows || standupRows.length === 0) {
      throw new StandupServiceError('No standup data returned', 'DATABASE_ERROR', 'create standup');
    }

    const standupRow = standupRows[0];

    return transformStandupFromDb(standupRow);
  }, 'create standup'),

  // Get standup by ID
  getStandup: withErrorHandling(async (id: string): Promise<Standup> => {
    const { data: standupRow, error } = await supabase
      .from('standups')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new StandupServiceError('Standup not found', 'NOT_FOUND', 'get standup');
      }
      throw new StandupServiceError(`Failed to get standup: ${error.message}`, 'DATABASE_ERROR', 'get standup', error);
    }

    return transformStandupFromDb(standupRow);
  }, 'get standup'),

  // Get standups for a project
  getProjectStandups: withErrorHandling(async (projectId: string): Promise<Standup[]> => {
    const { data: standupRows, error } = await supabase
      .from('standups')
      .select('*')
      .eq('project_id', projectId)
      .order('scheduled_date', { ascending: false });

    if (error) {
      throw new StandupServiceError(`Failed to get project standups: ${error.message}`, 'DATABASE_ERROR', 'get project standups', error);
    }

    return standupRows.map(transformStandupFromDb);
  }, 'get project standups'),

  // Get standups for a sprint
  getSprintStandups: withErrorHandling(async (sprintId: string): Promise<Standup[]> => {
    const { data: standupRows, error } = await supabase
      .from('standups')
      .select('*')
      .eq('sprint_id', sprintId)
      .order('scheduled_date', { ascending: false });

    if (error) {
      throw new StandupServiceError(`Failed to get sprint standups: ${error.message}`, 'DATABASE_ERROR', 'get sprint standups', error);
    }

    return standupRows.map(transformStandupFromDb);
  }, 'get sprint standups'),

  // Update standup
  updateStandup: withErrorHandling(async (id: string, data: UpdateStandupRequest): Promise<Standup> => {
    const updateData: Partial<StandupInsert> = {
      scheduled_date: data.scheduledDate?.toISOString(),
      status: data.status,
      participants: data.participants,
      duration: data.duration,
      notes: data.notes
    };

    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key as keyof typeof updateData] === undefined) {
        delete updateData[key as keyof typeof updateData];
      }
    });

    const { data: standupRow, error } = await supabase
      .from('standups')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new StandupServiceError('Standup not found', 'NOT_FOUND', 'update standup');
      }
      throw new StandupServiceError(`Failed to update standup: ${error.message}`, 'DATABASE_ERROR', 'update standup', error);
    }

    return transformStandupFromDb(standupRow);
  }, 'update standup'),

  // Delete standup
  deleteStandup: withErrorHandling(async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('standups')
      .delete()
      .eq('id', id);

    if (error) {
      throw new StandupServiceError(`Failed to delete standup: ${error.message}`, 'DATABASE_ERROR', 'delete standup', error);
    }
  }, 'delete standup'),

  // Create standup participation
  createStandupParticipation: withErrorHandling(async (data: CreateStandupParticipationRequest): Promise<StandupParticipation> => {
    const currentUserId = await getCurrentUserId();
    if (!currentUserId) {
      throw new StandupServiceError('User not authenticated', 'UNAUTHORIZED', 'create standup participation');
    }

    const participationData = transformParticipationToDb({
      standupId: data.standupId,
      userId: currentUserId,
      yesterday: data.yesterday,
      today: data.today,
      blockers: data.blockers,
      status: 'submitted',
      submittedAt: new Date()
    });

    const { data: participationRows, error } = await supabase
      .from('standup_participations')
      .insert([participationData])
      .select();

    if (error) {
      throw new StandupServiceError(`Failed to create standup participation: ${error.message}`, 'DATABASE_ERROR', 'create standup participation', error);
    }

    if (!participationRows || participationRows.length === 0) {
      throw new StandupServiceError('No participation data returned', 'DATABASE_ERROR', 'create standup participation');
    }

    const participationRow = participationRows[0];

    return transformParticipationFromDb(participationRow);
  }, 'create standup participation'),

  // Get standup participation by standup ID
  getStandupParticipations: withErrorHandling(async (standupId: string): Promise<StandupParticipation[]> => {
    const { data: participationRows, error } = await supabase
      .from('standup_participations')
      .select('*')
      .eq('standup_id', standupId);

    if (error) {
      throw new StandupServiceError(`Failed to get standup participations: ${error.message}`, 'DATABASE_ERROR', 'get standup participations', error);
    }

    return participationRows.map(transformParticipationFromDb);
  }, 'get standup participations'),

  // Get user's participation for a standup
  getUserStandupParticipation: withErrorHandling(async (standupId: string, userId?: string): Promise<StandupParticipation | null> => {
    const currentUserId = userId || await getCurrentUserId();
    
    if (!currentUserId) {
      throw new StandupServiceError('User not authenticated', 'UNAUTHORIZED', 'get user standup participation');
    }

    const { data: participationRow, error } = await supabase
      .from('standup_participations')
      .select('*')
      .eq('standup_id', standupId)
      .eq('user_id', currentUserId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No participation found
      }
      throw new StandupServiceError(`Failed to get user standup participation: ${error.message}`, 'DATABASE_ERROR', 'get user standup participation', error);
    }

    return transformParticipationFromDb(participationRow);
  }, 'get user standup participation'),

  // Update standup participation
  updateStandupParticipation: withErrorHandling(async (id: string, data: UpdateStandupParticipationRequest): Promise<StandupParticipation> => {
    const updateData: Partial<StandupParticipationInsert> = {
      progress: data.yesterday || null,
      plans: data.today || null,
      blockers: data.blockers || null,
      status: data.status || undefined,
      submitted_at: data.status === 'submitted' ? new Date().toISOString() : undefined
    };

    const { data: participationRow, error } = await supabase
      .from('standup_participations')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new StandupServiceError('Participation not found', 'NOT_FOUND', 'update standup participation');
      }
      throw new StandupServiceError(`Failed to update standup participation: ${error.message}`, 'DATABASE_ERROR', 'update standup participation', error);
    }

    return transformParticipationFromDb(participationRow);
  }, 'update standup participation'),

  // Get upcoming standups for a user
  getUpcomingStandups: withErrorHandling(async (userId?: string): Promise<Standup[]> => {
    const currentUserId = userId || await getCurrentUserId();
    
    if (!currentUserId) {
      throw new StandupServiceError('User not authenticated', 'UNAUTHORIZED', 'get upcoming standups');
    }

    const now = new Date().toISOString();
    const { data: standupRows, error } = await supabase
      .from('standups')
      .select('*')
      .contains('participants', [currentUserId])
      .gte('scheduled_date', now)
      .in('status', ['scheduled', 'in_progress'])
      .order('scheduled_date', { ascending: true })
      .limit(10);

    if (error) {
      throw new StandupServiceError(`Failed to get upcoming standups: ${error.message}`, 'DATABASE_ERROR', 'get upcoming standups', error);
    }

    return standupRows.map(transformStandupFromDb);
  }, 'get upcoming standups'),

  // Get standup history for a project
  getStandupHistory: withErrorHandling(async (projectId: string, limit: number = 20): Promise<Standup[]> => {
    const { data: standupRows, error } = await supabase
      .from('standups')
      .select('*')
      .eq('project_id', projectId)
      .eq('status', 'completed')
      .order('scheduled_date', { ascending: false })
      .limit(limit);

    if (error) {
      throw new StandupServiceError(`Failed to get standup history: ${error.message}`, 'DATABASE_ERROR', 'get standup history', error);
    }

    return standupRows.map(transformStandupFromDb);
  }, 'get standup history'),

  // Start a standup
  startStandup: withErrorHandling(async (standupId: string): Promise<Standup> => {
    const { data: standupRow, error: fetchError } = await supabase
      .from('standups')
      .select('*')
      .eq('id', standupId)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        throw new StandupServiceError('Standup not found', 'NOT_FOUND', 'start standup');
      }
      throw new StandupServiceError(`Failed to fetch standup: ${fetchError.message}`, 'DATABASE_ERROR', 'start standup', fetchError);
    }

    if (standupRow.status !== 'scheduled') {
      throw new StandupServiceError('Standup cannot be started', 'INVALID_STATUS', 'start standup');
    }

    const { data: updatedRow, error: updateError } = await supabase
      .from('standups')
      .update({
        status: 'in_progress',
        updated_at: new Date().toISOString()
      })
      .eq('id', standupId)
      .select()
      .single();

    if (updateError) {
      throw new StandupServiceError(`Failed to start standup: ${updateError.message}`, 'DATABASE_ERROR', 'start standup', updateError);
    }

    return transformStandupFromDb(updatedRow);
  }, 'start standup'),

  // Complete a standup
  completeStandup: withErrorHandling(async (standupId: string, notes?: string, duration?: number): Promise<Standup> => {
    const { data: standupRow, error: fetchError } = await supabase
      .from('standups')
      .select('*')
      .eq('id', standupId)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        throw new StandupServiceError('Standup not found', 'NOT_FOUND', 'complete standup');
      }
      throw new StandupServiceError(`Failed to fetch standup: ${fetchError.message}`, 'DATABASE_ERROR', 'complete standup', fetchError);
    }

    if (standupRow.status !== 'in_progress') {
      throw new StandupServiceError('Standup cannot be completed', 'INVALID_STATUS', 'complete standup');
    }

    const updateData: Partial<StandupInsert> = {
      status: 'completed',
      updated_at: new Date().toISOString()
    };

    if (notes !== undefined) {
      updateData.notes = notes;
    }
    if (duration !== undefined) {
      updateData.duration = duration;
    }

    const { data: updatedRow, error: updateError } = await supabase
      .from('standups')
      .update(updateData)
      .eq('id', standupId)
      .select()
      .single();

    if (updateError) {
      throw new StandupServiceError(`Failed to complete standup: ${updateError.message}`, 'DATABASE_ERROR', 'complete standup', updateError);
    }

    return transformStandupFromDb(updatedRow);
  }, 'complete standup'),

  // Cancel a standup
  cancelStandup: withErrorHandling(async (standupId: string): Promise<Standup> => {
    const { data: standupRow, error: fetchError } = await supabase
      .from('standups')
      .select('*')
      .eq('id', standupId)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        throw new StandupServiceError('Standup not found', 'NOT_FOUND', 'cancel standup');
      }
      throw new StandupServiceError(`Failed to fetch standup: ${fetchError.message}`, 'DATABASE_ERROR', 'cancel standup', fetchError);
    }

    if (standupRow.status === 'completed' || standupRow.status === 'cancelled') {
      throw new StandupServiceError('Standup cannot be cancelled', 'INVALID_STATUS', 'cancel standup');
    }

    const { data: updatedRow, error: updateError } = await supabase
      .from('standups')
      .update({
        status: 'cancelled'
      })
      .eq('id', standupId)
      .select()
      .single();

    if (updateError) {
      throw new StandupServiceError(`Failed to cancel standup: ${updateError.message}`, 'DATABASE_ERROR', 'cancel standup', updateError);
    }

    return transformStandupFromDb(updatedRow);
  }, 'cancel standup'),
};
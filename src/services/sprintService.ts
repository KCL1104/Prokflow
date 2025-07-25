import { supabase } from '../lib/supabase';
import type { Sprint, Database, BurndownData, CreateSprintRequest, UpdateSprintRequest } from '../types';

type DbSprint = Database['public']['Tables']['sprints']['Row'];

export interface SprintService {
  createSprint(data: CreateSprintRequest): Promise<Sprint>;
  getSprint(id: string): Promise<Sprint>;
  updateSprint(id: string, data: UpdateSprintRequest): Promise<Sprint>;
  getProjectSprints(projectId: string): Promise<Sprint[]>;
  getActiveSprint(projectId: string): Promise<Sprint | null>;
  startSprint(id: string): Promise<Sprint>;
  completeSprint(id: string, retrospectiveNotes?: string): Promise<Sprint>;
  addWorkItemToSprint(sprintId: string, workItemId: string): Promise<void>;
  removeWorkItemFromSprint(sprintId: string, workItemId: string): Promise<void>;
  calculateSprintCapacity(projectId: string): Promise<number>;
  getSprintBurndown(sprintId: string): Promise<BurndownData[]>;
  getSprintWorkItemIds(sprintId: string): Promise<string[]>;
}

// Helper function to transform database sprint to domain model
function transformDbSprint(dbSprint: DbSprint): Sprint {
  return {
    id: dbSprint.id,
    projectId: dbSprint.project_id,
    name: dbSprint.name,
    goal: dbSprint.goal || '',
    startDate: new Date(dbSprint.start_date),
    endDate: new Date(dbSprint.end_date),
    status: dbSprint.status,
    capacity: dbSprint.capacity,
    workItems: [], // Will be populated separately
    retrospectiveNotes: dbSprint.retrospective_notes || undefined,
    createdAt: new Date(dbSprint.created_at)
  };
}

export const sprintService: SprintService = {
  async createSprint(data: CreateSprintRequest): Promise<Sprint> {
    const capacity = data.capacity || await this.calculateSprintCapacity(data.projectId);

    const { data: sprint, error } = await supabase
      .from('sprints')
      .insert({
        project_id: data.projectId,
        name: data.name,
        goal: data.goal,
        start_date: data.startDate.toISOString(),
        end_date: data.endDate.toISOString(),
        capacity,
        status: 'planning'
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create sprint: ${error.message}`);
    }

    const result = transformDbSprint(sprint);
    result.workItems = await this.getSprintWorkItemIds(result.id);
    return result;
  },

  async getSprint(id: string): Promise<Sprint> {
    const { data: sprint, error } = await supabase
      .from('sprints')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Failed to get sprint: ${error.message}`);
    }

    if (!sprint) {
      throw new Error('Sprint not found');
    }

    const result = transformDbSprint(sprint);
    result.workItems = await this.getSprintWorkItemIds(result.id);
    return result;
  },

  async updateSprint(id: string, data: UpdateSprintRequest): Promise<Sprint> {
    const { data: sprint, error } = await supabase
      .from('sprints')
      .update({
        name: data.name,
        goal: data.goal,
        start_date: data.startDate?.toISOString(),
        end_date: data.endDate?.toISOString(),
        capacity: data.capacity,
        status: data.status,
        retrospective_notes: data.retrospectiveNotes,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update sprint: ${error.message}`);
    }

    if (!sprint) {
      throw new Error('Sprint not found');
    }

    const result = transformDbSprint(sprint);
    result.workItems = await this.getSprintWorkItemIds(result.id);
    return result;
  },

  async getProjectSprints(projectId: string): Promise<Sprint[]> {
    const { data: sprints, error } = await supabase
      .from('sprints')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to get project sprints: ${error.message}`);
    }

    const results = (sprints || []).map(transformDbSprint);

    // Get work items for each sprint
    for (const sprint of results) {
      sprint.workItems = await this.getSprintWorkItemIds(sprint.id);
    }

    return results;
  },

  async getActiveSprint(projectId: string): Promise<Sprint | null> {
    const { data: sprint, error } = await supabase
      .from('sprints')
      .select('*')
      .eq('project_id', projectId)
      .eq('status', 'active')
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      throw new Error(`Failed to get active sprint: ${error.message}`);
    }

    if (!sprint) {
      return null;
    }

    const result = transformDbSprint(sprint);
    result.workItems = await this.getSprintWorkItemIds(result.id);
    return result;
  },

  async startSprint(id: string): Promise<Sprint> {
    // Check if there's already an active sprint in the project
    const { data: sprint } = await supabase
      .from('sprints')
      .select('project_id')
      .eq('id', id)
      .single();

    if (!sprint) {
      throw new Error('Sprint not found');
    }

    const activeSprint = await this.getActiveSprint(sprint.project_id);
    if (activeSprint) {
      throw new Error('Cannot start sprint: another sprint is already active');
    }

    return this.updateSprint(id, { status: 'active' });
  },

  async completeSprint(id: string, retrospectiveNotes?: string): Promise<Sprint> {
    // Move incomplete work items back to backlog
    const { error: moveError } = await supabase
      .from('work_items')
      .update({ sprint_id: null })
      .eq('sprint_id', id)
      .neq('status', 'Done'); // Assuming 'Done' is the completed status

    if (moveError) {
      throw new Error(`Failed to move incomplete items to backlog: ${moveError.message}`);
    }

    return this.updateSprint(id, {
      status: 'completed',
      retrospectiveNotes
    });
  },

  async addWorkItemToSprint(sprintId: string, workItemId: string): Promise<void> {
    const { error } = await supabase
      .from('work_items')
      .update({ sprint_id: sprintId })
      .eq('id', workItemId);

    if (error) {
      throw new Error(`Failed to add work item to sprint: ${error.message}`);
    }
  },

  async removeWorkItemFromSprint(sprintId: string, workItemId: string): Promise<void> {
    const { error } = await supabase
      .from('work_items')
      .update({ sprint_id: null })
      .eq('id', workItemId)
      .eq('sprint_id', sprintId);

    if (error) {
      throw new Error(`Failed to remove work item from sprint: ${error.message}`);
    }
  },

  async calculateSprintCapacity(projectId: string): Promise<number> {
    try {
      const { data: velocity, error } = await supabase.rpc('calculate_sprint_velocity', {
        p_project_id: projectId,
        p_sprint_count: 3 // Use last 3 sprints for velocity calculation
      });

      if (error) {
        console.warn('Failed to calculate velocity, using default capacity:', error.message);
        return 20; // Default capacity
      }

      return Math.max(velocity || 20, 10); // Minimum capacity of 10
    } catch (error) {
      console.warn('Error calculating sprint capacity:', error);
      return 20; // Default capacity
    }
  },

  async getSprintBurndown(sprintId: string): Promise<BurndownData[]> {
    try {
      const { data: burndownData, error } = await supabase.rpc('get_sprint_burndown', {
        p_sprint_id: sprintId
      });

      if (error) {
        throw new Error(`Failed to get sprint burndown: ${error.message}`);
      }

      return (burndownData || []).map((item: any) => ({
        date: item.date,
        remainingPoints: item.remaining_points,
        idealRemaining: item.ideal_remaining
      }));
    } catch (error) {
      console.warn('Error getting sprint burndown:', error);
      return [];
    }
  },

  // Helper method to get work item IDs for a sprint
  async getSprintWorkItemIds(sprintId: string): Promise<string[]> {
    const { data: workItems, error } = await supabase
      .from('work_items')
      .select('id')
      .eq('sprint_id', sprintId);

    if (error) {
      console.warn('Failed to get sprint work items:', error.message);
      return [];
    }

    return (workItems || []).map(item => item.id);
  }
};
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
<<<<<<< HEAD
=======
  addWorkItemsToSprint(sprintId: string, workItemIds: string[]): Promise<{ id: string; work_items: string[] }>;
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
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
<<<<<<< HEAD
    capacity: dbSprint.capacity,
    workItems: [], // Will be populated separately
    retrospectiveNotes: dbSprint.retrospective_notes || undefined,
    createdAt: new Date(dbSprint.created_at)
=======
    capacity: dbSprint.capacity || 0,
    workItems: [], // Will be populated separately
    retrospectiveNotes: dbSprint.retrospective_notes || undefined,
    createdAt: new Date(dbSprint.created_at || '')
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
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
<<<<<<< HEAD
      const { data: velocity, error } = await supabase.rpc('calculate_sprint_velocity', {
=======
      const { data: velocity, error: dbError } = await supabase.rpc('calculate_sprint_velocity', {
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
        p_project_id: projectId,
        p_sprint_count: 3 // Use last 3 sprints for velocity calculation
      });

<<<<<<< HEAD
      if (error) {
        console.warn('Failed to calculate velocity, using default capacity:', error.message);
=======
      if (dbError?.message) {
        console.warn('Failed to calculate velocity, using default capacity:', dbError.message);
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
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
<<<<<<< HEAD
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
=======
      // Get sprint details
      const { data: sprint, error: sprintError } = await supabase
        .from('sprints')
        .select('start_date, end_date')
        .eq('id', sprintId)
        .single();

      if (sprintError || !sprint) {
        throw new Error(`Failed to get sprint details: ${sprintError?.message}`);
      }

      // Get all work items in the sprint with their estimates
      const { data: workItems, error: workItemsError } = await supabase
        .from('work_items')
        .select('estimate, status, updated_at')
        .eq('sprint_id', sprintId);

      if (workItemsError) {
        throw new Error(`Failed to get sprint work items: ${workItemsError.message}`);
      }

      const startDate = new Date(sprint.start_date);
      const endDate = new Date(sprint.end_date);
      const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const totalPoints = (workItems || []).reduce((sum, item) => sum + (item.estimate || 0), 0);

      const burndownData: BurndownData[] = [];
      
      // Generate burndown data for each day
      for (let day = 0; day <= totalDays; day++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + day);
        
        // Calculate remaining points for this date
        const completedPoints = (workItems || [])
          .filter(item => {
            const updatedAt = new Date(item.updated_at || '');
            return item.status === 'Done' && updatedAt <= currentDate;
          })
          .reduce((sum, item) => sum + (item.estimate || 0), 0);
        
        const remainingPoints = totalPoints - completedPoints;
        const idealRemaining = totalPoints - (totalPoints * day / totalDays);
        
        burndownData.push({
          date: currentDate.toISOString().split('T')[0],
          remainingPoints,
          idealRemaining: Math.max(0, idealRemaining)
        });
      }

      return burndownData;
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
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
<<<<<<< HEAD
=======
  },

  async addWorkItemsToSprint(sprintId: string, workItemIds: string[]): Promise<{ id: string; work_items: string[] }> {
    // Update the sprint with the work items
    const { data: _sprint, error: sprintError } = await supabase
      .from('sprints')
      .update({
        work_items: workItemIds,
        updated_at: new Date().toISOString()
      })
      .eq('id', sprintId)
      .select()
      .single();

    if (sprintError) {
      throw new Error(`Failed to update sprint: ${sprintError.message}`);
    }

    // Update work items to reference the sprint
    const { error: workItemError } = await supabase
      .from('work_items')
      .update({
        sprint_id: sprintId,
        updated_at: new Date().toISOString()
      })
      .in('id', workItemIds);

    if (workItemError) {
      throw new Error(`Failed to update work items: ${workItemError.message}`);
    }

    return {
      id: sprintId,
      work_items: workItemIds
    };
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
  }
};
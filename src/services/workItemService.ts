import { supabase, getCurrentUserId } from '../lib/supabase';
<<<<<<< HEAD
=======
import { handleSupabaseError, UnauthorizedError, NotFoundError } from '../utils/errors';
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
import type { 
  WorkItem, 
  CreateWorkItemRequest, 
  UpdateWorkItemRequest,
  Database 
} from '../types';

type DbWorkItem = Database['public']['Tables']['work_items']['Row'];

export interface TaskService {
  createWorkItem(data: CreateWorkItemRequest): Promise<WorkItem>;
  updateWorkItem(id: string, data: UpdateWorkItemRequest): Promise<WorkItem>;
  getWorkItem(id: string): Promise<WorkItem>;
  getProjectBacklog(projectId: string): Promise<WorkItem[]>;
  getSprintWorkItems(sprintId: string): Promise<WorkItem[]>;
  moveWorkItem(id: string, newStatus: string): Promise<WorkItem>;
  assignWorkItem(id: string, assigneeId: string): Promise<WorkItem>;
  addDependency(workItemId: string, dependsOnId: string): Promise<void>;
  removeDependency(workItemId: string, dependsOnId: string): Promise<void>;
  getWorkItemDependencies(workItemId: string): Promise<string[]>;
  searchWorkItems(projectId: string, query: string): Promise<WorkItem[]>;
  filterWorkItems(projectId: string, filters: {
    status?: string[];
    assignee?: string[];
    priority?: string[];
    type?: string[];
    labels?: string[];
  }): Promise<WorkItem[]>;
<<<<<<< HEAD
=======
  bulkUpdateWorkItems(workItemIds: string[], updateData: Partial<UpdateWorkItemRequest>): Promise<WorkItem[]>;
  updateWorkItemDependencies(workItemId: string, dependencies: string[]): Promise<WorkItem>;
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
}

// Helper function to transform database work item to domain model
function transformDbWorkItem(dbWorkItem: DbWorkItem): WorkItem {
  return {
    id: dbWorkItem.id,
    projectId: dbWorkItem.project_id,
    title: dbWorkItem.title,
    description: dbWorkItem.description || '',
    type: dbWorkItem.type,
    status: dbWorkItem.status,
    priority: dbWorkItem.priority,
    assigneeId: dbWorkItem.assignee_id || undefined,
    reporterId: dbWorkItem.reporter_id,
    estimate: dbWorkItem.estimate || undefined,
    actualTime: dbWorkItem.actual_time || undefined,
    sprintId: dbWorkItem.sprint_id || undefined,
    parentId: dbWorkItem.parent_id || undefined,
    dependencies: [], // Will be populated separately
    labels: dbWorkItem.labels || [],
    dueDate: dbWorkItem.due_date ? new Date(dbWorkItem.due_date) : undefined,
<<<<<<< HEAD
    createdAt: new Date(dbWorkItem.created_at),
    updatedAt: new Date(dbWorkItem.updated_at)
=======
    createdAt: new Date(dbWorkItem.created_at || new Date().toISOString()),
    updatedAt: new Date(dbWorkItem.updated_at || new Date().toISOString())
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
  };
}

export const workItemService: TaskService = {
  async createWorkItem(data: CreateWorkItemRequest): Promise<WorkItem> {
    const currentUserId = await getCurrentUserId();
    if (!currentUserId) {
<<<<<<< HEAD
      throw new Error('User must be authenticated to create work items');
=======
      throw new UnauthorizedError('User must be authenticated to create work items');
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
    }

    // Get the next position for the work item
    const { data: maxPosition } = await supabase
      .from('work_items')
      .select('position')
      .eq('project_id', data.projectId)
      .order('position', { ascending: false })
      .limit(1);

    const nextPosition = (maxPosition?.[0]?.position || 0) + 1;

    // Get default status from project workflow
    const { data: project } = await supabase
      .from('projects')
      .select('workflow_id')
      .eq('id', data.projectId)
      .single();

    if (!project) {
<<<<<<< HEAD
      throw new Error('Project not found');
=======
      throw new NotFoundError('Project');
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
    }

    const { data: defaultState } = await supabase
      .from('workflow_states')
      .select('name')
      .eq('workflow_id', project.workflow_id)
      .eq('category', 'todo')
      .order('position')
      .limit(1);

    const defaultStatus = defaultState?.[0]?.name || 'To Do';

    const { data: workItem, error } = await supabase
      .from('work_items')
      .insert({
        project_id: data.projectId,
        title: data.title,
        description: data.description,
        type: data.type,
        priority: data.priority,
        assignee_id: data.assigneeId,
        reporter_id: currentUserId,
        estimate: data.estimate,
        parent_id: data.parentId,
        labels: data.labels || [],
        due_date: data.dueDate?.toISOString(),
        status: defaultStatus,
        position: nextPosition
      })
      .select()
      .single();

    if (error) {
<<<<<<< HEAD
      throw new Error(`Failed to create work item: ${error.message}`);
=======
      handleSupabaseError(error, 'Failed to create work item');
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
    }

    const result = transformDbWorkItem(workItem);
    result.dependencies = await this.getWorkItemDependencies(result.id);
    return result;
  },

  async updateWorkItem(id: string, data: UpdateWorkItemRequest): Promise<WorkItem> {
    const { data: workItem, error } = await supabase
      .from('work_items')
      .update({
        title: data.title,
        description: data.description,
        status: data.status,
        priority: data.priority,
        assignee_id: data.assigneeId,
        estimate: data.estimate,
        labels: data.labels,
        due_date: data.dueDate?.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update work item: ${error.message}`);
    }

    if (!workItem) {
      throw new Error('Work item not found');
    }

    const result = transformDbWorkItem(workItem);
    result.dependencies = await this.getWorkItemDependencies(result.id);
    return result;
  },

  async getWorkItem(id: string): Promise<WorkItem> {
    const { data: workItem, error } = await supabase
      .from('work_items')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Failed to get work item: ${error.message}`);
    }

    if (!workItem) {
      throw new Error('Work item not found');
    }

    const result = transformDbWorkItem(workItem);
    result.dependencies = await this.getWorkItemDependencies(result.id);
    return result;
  },

  async getProjectBacklog(projectId: string): Promise<WorkItem[]> {
    const { data: workItems, error } = await supabase
      .from('work_items')
      .select('*')
      .eq('project_id', projectId)
      .is('sprint_id', null)
      .order('position');

    if (error) {
      throw new Error(`Failed to get project backlog: ${error.message}`);
    }

    const results = (workItems || []).map(transformDbWorkItem);
    
    // Get dependencies for each work item
    for (const workItem of results) {
      workItem.dependencies = await this.getWorkItemDependencies(workItem.id);
    }

    return results;
  },

  async getSprintWorkItems(sprintId: string): Promise<WorkItem[]> {
    const { data: workItems, error } = await supabase
      .from('work_items')
      .select('*')
      .eq('sprint_id', sprintId)
      .order('position');

    if (error) {
      throw new Error(`Failed to get sprint work items: ${error.message}`);
    }

    const results = (workItems || []).map(transformDbWorkItem);
    
    // Get dependencies for each work item
    for (const workItem of results) {
      workItem.dependencies = await this.getWorkItemDependencies(workItem.id);
    }

    return results;
  },

  async moveWorkItem(id: string, newStatus: string): Promise<WorkItem> {
    // Validate the transition using the workflow
    const { data: workItem } = await supabase
      .from('work_items')
      .select('project_id, status')
      .eq('id', id)
      .single();

    if (!workItem) {
      throw new Error('Work item not found');
    }

    const { data: project } = await supabase
      .from('projects')
      .select('workflow_id')
      .eq('id', workItem.project_id)
      .single();

    if (!project) {
      throw new Error('Project not found');
    }

    // Validate transition using database function
    const { data: isValidTransition } = await supabase.rpc('validate_workflow_transition', {
      p_workflow_id: project.workflow_id,
      p_from_state: workItem.status,
      p_to_state: newStatus
    });

    if (!isValidTransition) {
      throw new Error(`Invalid status transition from ${workItem.status} to ${newStatus}`);
    }

    return this.updateWorkItem(id, { status: newStatus });
  },

  async assignWorkItem(id: string, assigneeId: string): Promise<WorkItem> {
    return this.updateWorkItem(id, { assigneeId });
  },

  async addDependency(workItemId: string, dependsOnId: string): Promise<void> {
    const { error } = await supabase
      .from('work_item_dependencies')
      .insert({
        work_item_id: workItemId,
        depends_on_id: dependsOnId
      });

    if (error) {
      throw new Error(`Failed to add dependency: ${error.message}`);
    }
  },

  async removeDependency(workItemId: string, dependsOnId: string): Promise<void> {
    const { error } = await supabase
      .from('work_item_dependencies')
      .delete()
      .eq('work_item_id', workItemId)
      .eq('depends_on_id', dependsOnId);

    if (error) {
      throw new Error(`Failed to remove dependency: ${error.message}`);
    }
  },

  async getWorkItemDependencies(workItemId: string): Promise<string[]> {
    const { data: dependencies, error } = await supabase
      .from('work_item_dependencies')
      .select('depends_on_id')
      .eq('work_item_id', workItemId);

    if (error) {
      throw new Error(`Failed to get work item dependencies: ${error.message}`);
    }

    return (dependencies || []).map(dep => dep.depends_on_id);
  },

  async searchWorkItems(projectId: string, query: string): Promise<WorkItem[]> {
    const { data: workItems, error } = await supabase
      .from('work_items')
      .select('*')
      .eq('project_id', projectId)
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .order('position');

    if (error) {
      throw new Error(`Failed to search work items: ${error.message}`);
    }

    const results = (workItems || []).map(transformDbWorkItem);
    
    // Get dependencies for each work item
    for (const workItem of results) {
      workItem.dependencies = await this.getWorkItemDependencies(workItem.id);
    }

    return results;
  },

  async filterWorkItems(projectId: string, filters: {
    status?: string[];
    assignee?: string[];
<<<<<<< HEAD
    priority?: string[];
    type?: string[];
=======
    priority?: ('low' | 'medium' | 'high' | 'critical')[];
    type?: ('story' | 'task' | 'bug' | 'epic')[];
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
    labels?: string[];
  }): Promise<WorkItem[]> {
    let query = supabase
      .from('work_items')
      .select('*')
      .eq('project_id', projectId);

    if (filters.status && filters.status.length > 0) {
      query = query.in('status', filters.status);
    }

    if (filters.assignee && filters.assignee.length > 0) {
      query = query.in('assignee_id', filters.assignee);
    }

    if (filters.priority && filters.priority.length > 0) {
<<<<<<< HEAD
      query = query.in('priority', filters.priority as any);
    }

    if (filters.type && filters.type.length > 0) {
      query = query.in('type', filters.type as any);
=======
      query = query.in('priority', filters.priority);
    }

    if (filters.type && filters.type.length > 0) {
      query = query.in('type', filters.type);
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
    }

    if (filters.labels && filters.labels.length > 0) {
      query = query.overlaps('labels', filters.labels);
    }

    const { data: workItems, error } = await query.order('position');

    if (error) {
      throw new Error(`Failed to filter work items: ${error.message}`);
    }

    const results = (workItems || []).map(transformDbWorkItem);
    
    // Get dependencies for each work item
    for (const workItem of results) {
      workItem.dependencies = await this.getWorkItemDependencies(workItem.id);
    }

    return results;
<<<<<<< HEAD
=======
  },

  async bulkUpdateWorkItems(workItemIds: string[], updateData: Partial<UpdateWorkItemRequest>): Promise<WorkItem[]> {
    const { data: workItems, error } = await supabase
      .from('work_items')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .in('id', workItemIds)
      .select();

    if (error) {
      throw new Error(`Failed to bulk update work items: ${error.message}`);
    }

    const results = (workItems || []).map(transformDbWorkItem);
    
    // Get dependencies for each work item
    for (const workItem of results) {
      workItem.dependencies = await this.getWorkItemDependencies(workItem.id);
    }

    return results;
  },

  async updateWorkItemDependencies(workItemId: string, dependencies: string[]): Promise<WorkItem> {
    const { data: workItem, error } = await supabase
      .from('work_items')
      .update({
        dependencies,
        updated_at: new Date().toISOString()
      })
      .eq('id', workItemId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update work item dependencies: ${error.message}`);
    }

    if (!workItem) {
      throw new Error('Work item not found');
    }

    const result = transformDbWorkItem(workItem);
    result.dependencies = dependencies;
    return result;
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
  }
};
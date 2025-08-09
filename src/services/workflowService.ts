import { supabase } from '../lib/supabase';
import type { Workflow, CreateWorkflowRequest, WorkflowState, WorkflowTransition, Database } from '../types';

type DbWorkflow = Database['public']['Tables']['workflows']['Row'];
type DbWorkflowState = Database['public']['Tables']['workflow_states']['Row'];
type DbWorkflowTransition = Database['public']['Tables']['workflow_transitions']['Row'];

export interface WorkflowService {
  getWorkflow(id: string): Promise<Workflow>;
  createCustomWorkflow(data: CreateWorkflowRequest): Promise<Workflow>;
  validateTransition(workflowId: string, from: string, to: string): Promise<boolean>;
  getAvailableTransitions(workflowId: string, currentState: string): Promise<string[]>;
  getDefaultWorkflows(): Promise<Workflow[]>;
  getWorkflowStates(workflowId: string): Promise<WorkflowState[]>;
  createWorkflowState(workflowId: string, state: Omit<WorkflowState, 'id'>): Promise<WorkflowState>;
  updateWorkflowState(stateId: string, data: Partial<WorkflowState>): Promise<WorkflowState>;
  deleteWorkflowState(stateId: string): Promise<void>;
  createWorkflowTransition(workflowId: string, fromStateId: string, toStateId: string): Promise<void>;
  deleteWorkflowTransition(workflowId: string, fromStateId: string, toStateId: string): Promise<void>;
}

// Helper function to transform database workflow to domain model
function transformDbWorkflow(dbWorkflow: DbWorkflow, states: WorkflowState[] = [], transitions: WorkflowTransition[] = []): Workflow {
  return {
    id: dbWorkflow.id,
    name: dbWorkflow.name,
<<<<<<< HEAD
    isDefault: dbWorkflow.is_default,
=======
    isDefault: dbWorkflow.is_default || false,
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
    methodology: dbWorkflow.methodology,
    states,
    transitions
  };
}

// Helper function to transform database workflow state to domain model
function transformDbWorkflowState(dbState: DbWorkflowState): WorkflowState {
  return {
    id: dbState.id,
    name: dbState.name,
    category: dbState.category,
<<<<<<< HEAD
    color: dbState.color,
=======
    color: dbState.color || '#6B7280',
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
    wipLimit: dbState.wip_limit || undefined
  };
}

// Helper function to transform database workflow transition to domain model
function transformDbWorkflowTransition(_dbTransition: DbWorkflowTransition, fromStateName: string, toStateName: string): WorkflowTransition {
  return {
    from: fromStateName,
    to: toStateName,
    conditions: [] // Conditions not implemented yet
  };
}

export const workflowService: WorkflowService = {
  async getWorkflow(id: string): Promise<Workflow> {
    const { data: workflow, error } = await supabase
      .from('workflows')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Failed to get workflow: ${error.message}`);
    }

    if (!workflow) {
      throw new Error('Workflow not found');
    }

    // Get workflow states
    const states = await this.getWorkflowStates(id);

    // Get workflow transitions
    const { data: dbTransitions, error: transitionsError } = await supabase
      .from('workflow_transitions')
      .select(`
        *,
        from_state:workflow_states!workflow_transitions_from_state_id_fkey(name),
        to_state:workflow_states!workflow_transitions_to_state_id_fkey(name)
      `)
      .eq('workflow_id', id);

    if (transitionsError) {
      throw new Error(`Failed to get workflow transitions: ${transitionsError.message}`);
    }

    const transitions = (dbTransitions || []).map(t => 
      transformDbWorkflowTransition(
        t, 
<<<<<<< HEAD
        (t.from_state as any)?.name || '', 
        (t.to_state as any)?.name || ''
=======
        (t.from_state as { name: string })?.name || '', 
        (t.to_state as { name: string })?.name || ''
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
      )
    );

    return transformDbWorkflow(workflow, states, transitions);
  },

  async createCustomWorkflow(data: CreateWorkflowRequest): Promise<Workflow> {
    // Create the workflow
    const { data: workflow, error: workflowError } = await supabase
      .from('workflows')
      .insert({
        name: data.name,
<<<<<<< HEAD
        methodology: data.methodology as any,
=======
        methodology: data.methodology,
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
        is_default: false
      })
      .select()
      .single();

    if (workflowError) {
      throw new Error(`Failed to create workflow: ${workflowError.message}`);
    }

    // Create workflow states
    const stateIds: Record<string, string> = {};
    for (let i = 0; i < data.states.length; i++) {
      const state = data.states[i];
      const { data: createdState, error: stateError } = await supabase
        .from('workflow_states')
        .insert({
          workflow_id: workflow.id,
          name: state.name,
          category: state.category,
          color: state.color,
          wip_limit: state.wipLimit,
          position: i
        })
        .select()
        .single();

      if (stateError) {
        throw new Error(`Failed to create workflow state: ${stateError.message}`);
      }

      stateIds[state.name] = createdState.id;
    }

    // Create workflow transitions
    for (const transition of data.transitions) {
      const fromStateId = stateIds[transition.from];
      const toStateId = stateIds[transition.to];

      if (fromStateId && toStateId) {
        await this.createWorkflowTransition(workflow.id, fromStateId, toStateId);
      }
    }

    return this.getWorkflow(workflow.id);
  },

  async validateTransition(workflowId: string, from: string, to: string): Promise<boolean> {
    try {
<<<<<<< HEAD
      const { data: isValid, error } = await supabase.rpc('validate_workflow_transition', {
        p_workflow_id: workflowId,
        p_from_state: from,
        p_to_state: to
      });

      if (error) {
        console.warn('Failed to validate transition:', error.message);
        return false;
      }

      return isValid || false;
=======
      // Get the from state ID
      const { data: fromState, error: fromError } = await supabase
        .from('workflow_states')
        .select('id')
        .eq('workflow_id', workflowId)
        .eq('name', from)
        .single();

      if (fromError || !fromState) {
        console.warn('Failed to get from state:', fromError?.message);
        return false;
      }

      // Get the to state ID
      const { data: toState, error: toError } = await supabase
        .from('workflow_states')
        .select('id')
        .eq('workflow_id', workflowId)
        .eq('name', to)
        .single();

      if (toError || !toState) {
        console.warn('Failed to get to state:', toError?.message);
        return false;
      }

      // Check if transition exists
      const { data: transition, error: transitionError } = await supabase
        .from('workflow_transitions')
        .select('id')
        .eq('workflow_id', workflowId)
        .eq('from_state_id', fromState.id)
        .eq('to_state_id', toState.id)
        .single();

      if (transitionError) {
        // If no transition found, it's invalid
        return false;
      }

      return !!transition;
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
    } catch (error) {
      console.warn('Error validating transition:', error);
      return false;
    }
  },

  async getAvailableTransitions(workflowId: string, currentState: string): Promise<string[]> {
    // First get the current state ID
    const { data: stateData, error: stateError } = await supabase
      .from('workflow_states')
      .select('id')
      .eq('workflow_id', workflowId)
      .eq('name', currentState)
      .single();

    if (stateError || !stateData) {
      console.warn('Failed to get current state:', stateError?.message);
      return [];
    }

    // Then get available transitions
    const { data: transitions, error } = await supabase
      .from('workflow_transitions')
      .select(`
        to_state:workflow_states!workflow_transitions_to_state_id_fkey(name)
      `)
      .eq('workflow_id', workflowId)
      .eq('from_state_id', stateData.id);

    if (error) {
      console.warn('Failed to get available transitions:', error.message);
      return [];
    }

    return (transitions || [])
<<<<<<< HEAD
      .map(t => (t.to_state as any)?.name)
=======
      .map(t => (t.to_state as { name: string })?.name)
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
      .filter(Boolean);
  },

  async getDefaultWorkflows(): Promise<Workflow[]> {
    const { data: workflows, error } = await supabase
      .from('workflows')
      .select('*')
      .eq('is_default', true)
      .order('methodology');

    if (error) {
      throw new Error(`Failed to get default workflows: ${error.message}`);
    }

    const results: Workflow[] = [];
    for (const workflow of workflows || []) {
      const states = await this.getWorkflowStates(workflow.id);
      results.push(transformDbWorkflow(workflow, states, []));
    }

    return results;
  },

  async getWorkflowStates(workflowId: string): Promise<WorkflowState[]> {
    const { data: states, error } = await supabase
      .from('workflow_states')
      .select('*')
      .eq('workflow_id', workflowId)
      .order('position');

    if (error) {
      throw new Error(`Failed to get workflow states: ${error.message}`);
    }

    return (states || []).map(transformDbWorkflowState);
  },

  async createWorkflowState(workflowId: string, state: Omit<WorkflowState, 'id'>): Promise<WorkflowState> {
    // Get the next position
    const { data: maxPosition } = await supabase
      .from('workflow_states')
      .select('position')
      .eq('workflow_id', workflowId)
      .order('position', { ascending: false })
      .limit(1);

    const nextPosition = (maxPosition?.[0]?.position || 0) + 1;

    const { data: createdState, error } = await supabase
      .from('workflow_states')
      .insert({
        workflow_id: workflowId,
        name: state.name,
        category: state.category,
        color: state.color,
        wip_limit: state.wipLimit,
        position: nextPosition
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create workflow state: ${error.message}`);
    }

    return transformDbWorkflowState(createdState);
  },

  async updateWorkflowState(stateId: string, data: Partial<WorkflowState>): Promise<WorkflowState> {
    const { data: updatedState, error } = await supabase
      .from('workflow_states')
      .update({
        name: data.name,
        category: data.category,
        color: data.color,
        wip_limit: data.wipLimit
      })
      .eq('id', stateId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update workflow state: ${error.message}`);
    }

    if (!updatedState) {
      throw new Error('Workflow state not found');
    }

    return transformDbWorkflowState(updatedState);
  },

  async deleteWorkflowState(stateId: string): Promise<void> {
    const { error } = await supabase
      .from('workflow_states')
      .delete()
      .eq('id', stateId);

    if (error) {
      throw new Error(`Failed to delete workflow state: ${error.message}`);
    }
  },

  async createWorkflowTransition(workflowId: string, fromStateId: string, toStateId: string): Promise<void> {
    const { error } = await supabase
      .from('workflow_transitions')
      .insert({
        workflow_id: workflowId,
        from_state_id: fromStateId,
        to_state_id: toStateId
      });

    if (error) {
      throw new Error(`Failed to create workflow transition: ${error.message}`);
    }
  },

  async deleteWorkflowTransition(workflowId: string, fromStateId: string, toStateId: string): Promise<void> {
    const { error } = await supabase
      .from('workflow_transitions')
      .delete()
      .eq('workflow_id', workflowId)
      .eq('from_state_id', fromStateId)
      .eq('to_state_id', toStateId);

    if (error) {
      throw new Error(`Failed to delete workflow transition: ${error.message}`);
    }
  }
};
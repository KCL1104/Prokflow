// Setup type definitions for built-in Supabase Runtime APIs
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'

// Supabase Edge Function for workflow management
// This function handles workflow-related operations including state transitions and validations

import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WorkflowRequest {
  action: 'get' | 'create' | 'validate-transition' | 'get-transitions' | 'get-defaults' | 'create-state' | 'update-state' | 'delete-state';
  workflowId?: string;
  stateId?: string;
  data?: {
    name?: string;
    methodology?: 'scrum' | 'kanban' | 'waterfall' | 'custom';
    states?: WorkflowStateData[];
    transitions?: WorkflowTransitionData[];
    from?: string;
    to?: string;
    currentState?: string;
    state?: Omit<WorkflowStateData, 'id'>;
    updates?: Partial<WorkflowStateData>;
  };
}

interface WorkflowStateData {
  id?: string;
  name: string;
  category: 'todo' | 'in_progress' | 'done';
  color: string;
  wipLimit?: number;
}

interface WorkflowTransitionData {
  from: string;
  to: string;
  conditions?: TransitionConditionData[];
}

interface TransitionConditionData {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains';
  value: string | number | boolean | string[];
}

interface WorkflowResponse {
  id: string;
  name: string;
  isDefault: boolean;
  methodology: string;
  states: WorkflowStateData[];
  transitions: WorkflowTransitionData[];
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Parse request body
    const { action, workflowId, stateId, data }: WorkflowRequest = await req.json()

    if (!action) {
      return new Response(
        JSON.stringify({ error: 'Missing required action parameter' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    let result: unknown;
    
    switch (action) {
      case 'get':
        if (!workflowId) {
          return new Response(
            JSON.stringify({ error: 'Missing workflowId for get action' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        result = await getWorkflow(supabaseClient, workflowId);
        break;
        
      case 'create':
        if (!data?.name || !data?.methodology || !data?.states || !data?.transitions) {
          return new Response(
            JSON.stringify({ error: 'Missing required data for create action' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        result = await createCustomWorkflow(supabaseClient, {
          name: data.name,
          methodology: data.methodology,
          states: data.states,
          transitions: data.transitions
        });
        break;
        
      case 'validate-transition':
        if (!workflowId || !data?.from || !data?.to) {
          return new Response(
            JSON.stringify({ error: 'Missing required parameters for validate-transition action' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        result = await validateTransition(supabaseClient, workflowId, data.from, data.to);
        break;
        
      case 'get-transitions':
        if (!workflowId || !data?.currentState) {
          return new Response(
            JSON.stringify({ error: 'Missing required parameters for get-transitions action' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        result = await getAvailableTransitions(supabaseClient, workflowId, data.currentState);
        break;
        
      case 'get-defaults':
        result = await getDefaultWorkflows(supabaseClient);
        break;
        
      case 'create-state':
        if (!workflowId || !data?.state) {
          return new Response(
            JSON.stringify({ error: 'Missing required parameters for create-state action' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        result = await createWorkflowState(supabaseClient, workflowId, data.state);
        break;
        
      case 'update-state':
        if (!stateId || !data?.updates) {
          return new Response(
            JSON.stringify({ error: 'Missing required parameters for update-state action' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        result = await updateWorkflowState(supabaseClient, stateId, data.updates);
        break;
        
      case 'delete-state':
        if (!stateId) {
          return new Response(
            JSON.stringify({ error: 'Missing stateId for delete-state action' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        result = await deleteWorkflowState(supabaseClient, stateId);
        break;
        
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
    }

    return new Response(
      JSON.stringify({ data: result, success: true }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json'
        } 
      }
    );

  } catch (error) {
    console.error('Workflow service error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

// Helper functions for workflow operations
async function getWorkflow(supabase: ReturnType<typeof createClient>, workflowId: string): Promise<WorkflowResponse> {
  const { data: workflow, error: workflowError } = await supabase
    .from('workflows')
    .select('*')
    .eq('id', workflowId)
    .single();
    
  if (workflowError) throw workflowError;
  
  const { data: states, error: statesError } = await supabase
    .from('workflow_states')
    .select('*')
    .eq('workflow_id', workflowId)
    .order('name');
    
  if (statesError) throw statesError;
  
  const { data: transitions, error: transitionsError } = await supabase
    .from('workflow_transitions')
    .select('*')
    .eq('workflow_id', workflowId);
    
  if (transitionsError) throw transitionsError;
  
  return {
    id: workflow.id,
    name: workflow.name,
    isDefault: workflow.is_default,
    methodology: workflow.methodology,
    states: states || [],
    transitions: transitions || []
  };
}

async function createCustomWorkflow(supabase: ReturnType<typeof createClient>, data: {
  name: string;
  methodology: string;
  states: WorkflowStateData[];
  transitions: WorkflowTransitionData[];
}): Promise<WorkflowResponse> {
  // Create workflow
  const { data: workflow, error: workflowError } = await supabase
    .from('workflows')
    .insert({
      name: data.name,
      methodology: data.methodology,
      is_default: false
    })
    .select()
    .single();
    
  if (workflowError) throw workflowError;
  
  // Create states
  const statesWithWorkflowId = data.states.map(state => ({
    ...state,
    workflow_id: workflow.id,
    wip_limit: state.wipLimit
  }));
  
  const { data: createdStates, error: statesError } = await supabase
    .from('workflow_states')
    .insert(statesWithWorkflowId)
    .select();
    
  if (statesError) throw statesError;
  
  // Create transitions
  const transitionsWithWorkflowId = data.transitions.map(transition => ({
    ...transition,
    workflow_id: workflow.id,
    from_state: transition.from,
    to_state: transition.to
  }));
  
  const { data: createdTransitions, error: transitionsError } = await supabase
    .from('workflow_transitions')
    .insert(transitionsWithWorkflowId)
    .select();
    
  if (transitionsError) throw transitionsError;
  
  return {
    id: workflow.id,
    name: workflow.name,
    isDefault: workflow.is_default,
    methodology: workflow.methodology,
    states: createdStates || [],
    transitions: createdTransitions || []
  };
}

async function validateTransition(supabase: ReturnType<typeof createClient>, workflowId: string, from: string, to: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('workflow_transitions')
    .select('*')
    .eq('workflow_id', workflowId)
    .eq('from_state', from)
    .eq('to_state', to)
    .single();
    
  if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "not found"
  
  return !!data;
}

async function getAvailableTransitions(supabase: ReturnType<typeof createClient>, workflowId: string, currentState: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('workflow_transitions')
    .select('to_state')
    .eq('workflow_id', workflowId)
    .eq('from_state', currentState);
    
  if (error) throw error;
  
  return data?.map((t: { to_state: string }) => t.to_state) || [];
}

async function getDefaultWorkflows(supabase: ReturnType<typeof createClient>): Promise<WorkflowResponse[]> {
  const { data: workflows, error: workflowsError } = await supabase
    .from('workflows')
    .select('*')
    .eq('is_default', true)
    .order('name');
    
  if (workflowsError) throw workflowsError;
  
  const workflowsWithDetails = await Promise.all(
    (workflows || []).map(async (workflow: { id: string; name: string; is_default: boolean; methodology: string }) => {
      const { data: states } = await supabase
        .from('workflow_states')
        .select('*')
        .eq('workflow_id', workflow.id)
        .order('name');
        
      const { data: transitions } = await supabase
        .from('workflow_transitions')
        .select('*')
        .eq('workflow_id', workflow.id);
        
      return {
        id: workflow.id,
        name: workflow.name,
        isDefault: workflow.is_default,
        methodology: workflow.methodology,
        states: states || [],
        transitions: transitions || []
      };
    })
  );
  
  return workflowsWithDetails;
}

async function createWorkflowState(supabase: ReturnType<typeof createClient>, workflowId: string, state: Omit<WorkflowStateData, 'id'>): Promise<WorkflowStateData> {
  const { data, error } = await supabase
    .from('workflow_states')
    .insert({
      ...state,
      workflow_id: workflowId,
      wip_limit: state.wipLimit
    })
    .select()
    .single();
    
  if (error) throw error;
  
  return {
    id: data.id,
    name: data.name,
    category: data.category,
    color: data.color,
    wipLimit: data.wip_limit
  };
}

async function updateWorkflowState(supabase: ReturnType<typeof createClient>, stateId: string, updates: Partial<WorkflowStateData>): Promise<WorkflowStateData> {
  const updateData: Record<string, unknown> = { ...updates };
  if (updates.wipLimit !== undefined) {
    updateData.wip_limit = updates.wipLimit;
    delete updateData.wipLimit;
  }
  
  const { data, error } = await supabase
    .from('workflow_states')
    .update(updateData)
    .eq('id', stateId)
    .select()
    .single();
    
  if (error) throw error;
  
  return {
    id: data.id,
    name: data.name,
    category: data.category,
    color: data.color,
    wipLimit: data.wip_limit
  };
}

async function deleteWorkflowState(supabase: ReturnType<typeof createClient>, stateId: string): Promise<void> {
  const { error } = await supabase
    .from('workflow_states')
    .delete()
    .eq('id', stateId);
    
  if (error) throw error;
}
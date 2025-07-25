import { supabase } from '../lib/supabase'
import type { Database } from '../types/database'

type Workflow = Database['public']['Tables']['workflows']['Row']
type WorkflowState = Database['public']['Tables']['workflow_states']['Row']

export class DatabaseService {
  /**
   * Test database connection and basic functionality
   */
  static async testConnection(): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('workflows')
        .select('id, name')
        .limit(1)

      if (error) {
        console.error('Database connection test failed:', error)
        return false
      }

      console.log('Database connection successful')
      return true
    } catch (error) {
      console.error('Database connection test error:', error)
      return false
    }
  }

  /**
   * Get default workflows for project creation
   */
  static async getDefaultWorkflows(): Promise<Workflow[]> {
    try {
      const { data, error } = await supabase
        .from('workflows')
        .select('*')
        .eq('is_default', true)
        .order('methodology')

      if (error) {
        console.error('Error fetching default workflows:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getDefaultWorkflows:', error)
      return []
    }
  }

  /**
   * Get workflow states for a specific workflow
   */
  static async getWorkflowStates(workflowId: string): Promise<WorkflowState[]> {
    try {
      const { data, error } = await supabase
        .from('workflow_states')
        .select('*')
        .eq('workflow_id', workflowId)
        .order('position')

      if (error) {
        console.error('Error fetching workflow states:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getWorkflowStates:', error)
      return []
    }
  }

  /**
   * Test workflow transition validation function
   */
  static async testWorkflowTransition(
    workflowId: string,
    fromState: string,
    toState: string
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('validate_workflow_transition', {
        p_workflow_id: workflowId,
        p_from_state: fromState,
        p_to_state: toState
      })

      if (error) {
        console.error('Error testing workflow transition:', error)
        return false
      }

      return data || false
    } catch (error) {
      console.error('Error in testWorkflowTransition:', error)
      return false
    }
  }

  /**
   * Test project metrics function
   */
  static async testProjectMetrics(projectId: string) {
    try {
      const { data, error } = await supabase.rpc('get_project_metrics', {
        p_project_id: projectId
      })

      if (error) {
        console.error('Error testing project metrics:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in testProjectMetrics:', error)
      return null
    }
  }

  /**
   * Test sprint velocity calculation
   */
  static async testSprintVelocity(projectId: string, sprintCount: number = 5) {
    try {
      const { data, error } = await supabase.rpc('calculate_sprint_velocity', {
        p_project_id: projectId,
        p_sprint_count: sprintCount
      })

      if (error) {
        console.error('Error testing sprint velocity:', error)
        return 0
      }

      return data || 0
    } catch (error) {
      console.error('Error in testSprintVelocity:', error)
      return 0
    }
  }

  /**
   * Test WIP limit checking
   */
  static async testWipLimit(projectId: string, status: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('check_wip_limit', {
        p_project_id: projectId,
        p_status: status
      })

      if (error) {
        console.error('Error testing WIP limit:', error)
        return true // Default to allowing if error
      }

      return data || true
    } catch (error) {
      console.error('Error in testWipLimit:', error)
      return true
    }
  }

  /**
   * Get available transitions for a work item
   */
  static async getAvailableTransitions(workItemId: string) {
    try {
      const { data, error } = await supabase.rpc('get_available_transitions', {
        p_work_item_id: workItemId
      })

      if (error) {
        console.error('Error getting available transitions:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getAvailableTransitions:', error)
      return []
    }
  }

  /**
   * Run comprehensive database tests
   */
  static async runDatabaseTests(): Promise<{
    connection: boolean
    workflows: boolean
    functions: boolean
    errors: string[]
  }> {
    const results = {
      connection: false,
      workflows: false,
      functions: false,
      errors: [] as string[]
    }

    try {
      // Test connection
      results.connection = await this.testConnection()
      if (!results.connection) {
        results.errors.push('Database connection failed')
      }

      // Test workflows
      const workflows = await this.getDefaultWorkflows()
      results.workflows = workflows.length > 0
      if (!results.workflows) {
        results.errors.push('No default workflows found')
      }

      // Test functions (using first workflow if available)
      if (workflows.length > 0) {
        const firstWorkflow = workflows[0]
        const states = await this.getWorkflowStates(firstWorkflow.id)
        
        if (states.length >= 2) {
          const transitionTest = await this.testWorkflowTransition(
            firstWorkflow.id,
            states[0].name,
            states[1].name
          )
          results.functions = transitionTest
          if (!results.functions) {
            results.errors.push('Database functions test failed')
          }
        } else {
          results.errors.push('Insufficient workflow states for function testing')
        }
      }

      console.log('Database tests completed:', results)
      return results
    } catch (error) {
      console.error('Error running database tests:', error)
      results.errors.push(`Test execution error: ${error}`)
      return results
    }
  }
}
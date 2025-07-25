import { useState, useEffect } from 'react';
import { workflowService } from '../services';
import type { Workflow, WorkflowState } from '../types';

export function useWorkflow(workflowId?: string) {
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [workflowStates, setWorkflowStates] = useState<WorkflowState[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (workflowId) {
      fetchWorkflow(workflowId);
    }
  }, [workflowId]);

  const fetchWorkflow = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const workflowData = await workflowService.getWorkflow(id);
      setWorkflow(workflowData);
      setWorkflowStates(workflowData.states || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch workflow');
    } finally {
      setLoading(false);
    }
  };

  return {
    workflow,
    workflowStates,
    loading,
    error,
    refetch: workflowId ? () => fetchWorkflow(workflowId) : undefined,
  };
}
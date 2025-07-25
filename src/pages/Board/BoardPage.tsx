import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loading } from '../../components/common/Loading';
import { Icon } from '../../components/common/Icon';
import { Button } from '../../components/common/Button';
import { KanbanBoard } from '../../components/board/KanbanBoard';
import { useProject } from '../../hooks/useProject';
import { useWorkflow } from '../../hooks/useWorkflow';
import type { WorkItem } from '../../types';

export const BoardPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { project, loading: projectLoading } = useProject(projectId);
  const { workflowStates, loading: workflowLoading, error: workflowError } = useWorkflow(project?.workflowId);

  const handleWorkItemUpdated = (workItem: WorkItem) => {
    // Handle work item updates if needed
    console.log('Work item updated:', workItem);
  };

  if (projectLoading || workflowLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loading size="large" />
      </div>
    );
  }

  if (!project || !projectId) {
    return (
      <div className="text-center py-12">
        <Icon name="alert-circle" className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Project not found</h3>
        <p className="text-gray-600 mb-6">The requested project could not be found.</p>
        <Button onClick={() => navigate('/dashboard')}>
          Return to Dashboard
        </Button>
      </div>
    );
  }

  if (workflowError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex items-center">
          <Icon name="alert-circle" className="h-5 w-5 text-red-400 mr-2" />
          <p className="text-red-800">Failed to load workflow: {workflowError}</p>
        </div>
      </div>
    );
  }

  if (!workflowStates || workflowStates.length === 0) {
    return (
      <div className="text-center py-12">
        <Icon name="settings" className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No workflow configured</h3>
        <p className="text-gray-600 mb-6">
          This project needs a workflow with states to display the board view.
        </p>
        <Button onClick={() => navigate(`/projects/${projectId}/settings`)}>
          Configure Workflow
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <KanbanBoard
        projectId={projectId}
        workflowStates={workflowStates}
        onWorkItemUpdated={handleWorkItemUpdated}
      />
    </div>
  );
};
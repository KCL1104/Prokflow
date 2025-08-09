<<<<<<< HEAD
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loading } from '../../components/common/Loading';
import { Icon } from '../../components/common/Icon';
import { Button } from '../../components/common/Button';
import { KanbanBoard } from '../../components/board/KanbanBoard';
=======
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loading } from '../../components/common/Loading';
import { Icon } from '../../components/common/Icon';
import { Button } from '../../components/ui/button';
import { KanbanBoard } from '../../components/board/KanbanBoard';
import { ScrumBoard } from '../../components/board/ScrumBoard';
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
import { useProject } from '../../hooks/useProject';
import { useWorkflow } from '../../hooks/useWorkflow';
import type { WorkItem } from '../../types';

<<<<<<< HEAD
=======
type BoardView = 'kanban' | 'scrum';

>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
export const BoardPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { project, loading: projectLoading } = useProject(projectId);
  const { workflowStates, loading: workflowLoading, error: workflowError } = useWorkflow(project?.workflowId);
<<<<<<< HEAD
=======
  const [boardView, setBoardView] = useState<BoardView>(() => {
    // Default to Scrum board for Scrum projects, Kanban for others
    return project?.methodology === 'scrum' ? 'scrum' : 'kanban';
  });
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)

  const handleWorkItemUpdated = (workItem: WorkItem) => {
    // Handle work item updates if needed
    console.log('Work item updated:', workItem);
  };

  if (projectLoading || workflowLoading) {
    return (
      <div className="flex items-center justify-center py-12">
<<<<<<< HEAD
        <Loading size="large" />
=======
        <div className="bg-white dark:bg-slate-900 rounded-md shadow-xs p-8">
          <Loading size="large" />
        </div>
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
      </div>
    );
  }

  if (!project || !projectId) {
    return (
      <div className="text-center py-12">
<<<<<<< HEAD
        <Icon name="alert-circle" className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Project not found</h3>
        <p className="text-gray-600 mb-6">The requested project could not be found.</p>
        <Button onClick={() => navigate('/dashboard')}>
          Return to Dashboard
        </Button>
=======
        <div className="bg-white dark:bg-slate-900 rounded-md shadow-xs p-8 max-w-md mx-auto">
          <Icon name="alert-circle" className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">Project not found</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-6">The requested project could not be found.</p>
          <Button variant="primary" onClick={() => navigate('/dashboard')}>
            Return to Dashboard
          </Button>
        </div>
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
      </div>
    );
  }

  if (workflowError) {
    return (
<<<<<<< HEAD
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex items-center">
          <Icon name="alert-circle" className="h-5 w-5 text-red-400 mr-2" />
          <p className="text-red-800">Failed to load workflow: {workflowError}</p>
=======
      <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-md p-6 shadow-xs">
        <div className="flex items-center">
          <Icon name="alert-circle" className="h-5 w-5 text-red-500 mr-3" />
          <p className="text-red-800 dark:text-red-200 font-medium">Failed to load workflow: {workflowError}</p>
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
        </div>
      </div>
    );
  }

  if (!workflowStates || workflowStates.length === 0) {
    return (
      <div className="text-center py-12">
<<<<<<< HEAD
        <Icon name="settings" className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No workflow configured</h3>
        <p className="text-gray-600 mb-6">
          This project needs a workflow with states to display the board view.
        </p>
        <Button onClick={() => navigate(`/projects/${projectId}/settings`)}>
          Configure Workflow
        </Button>
=======
        <div className="bg-white dark:bg-slate-900 rounded-md shadow-xs p-8 max-w-md mx-auto">
          <Icon name="settings" className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">No workflow configured</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            This project needs a workflow with states to display the board view.
          </p>
          <Button variant="primary" onClick={() => navigate(`/projects/${projectId}/settings`)}>
            Configure Workflow
          </Button>
        </div>
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
      </div>
    );
  }

  return (
<<<<<<< HEAD
    <div className="space-y-6">
      <KanbanBoard
        projectId={projectId}
        workflowStates={workflowStates}
        onWorkItemUpdated={handleWorkItemUpdated}
      />
=======
    <div className="p-6 space-y-6 h-full overflow-auto">
      {/* Board View Toggle */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 rounded-md p-4 shadow-xs border border-slate-200 dark:border-slate-700">
        <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 rounded-md p-1.5">
          <button
            onClick={() => setBoardView('kanban')}
            className={`px-4 py-2.5 text-sm font-medium rounded-md transition-colors duration-150 flex items-center ${
              boardView === 'kanban'
                ? 'bg-primary-500 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-white dark:hover:bg-slate-700'
            }`}
          >
            <Icon name="list" className="h-4 w-4 mr-2" />
            Kanban Board
          </button>
          <button
            onClick={() => setBoardView('scrum')}
            className={`px-4 py-2.5 text-sm font-medium rounded-md transition-colors duration-150 flex items-center ${
              boardView === 'scrum'
                ? 'bg-primary-500 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-white dark:hover:bg-slate-700'
            }`}
          >
            <Icon name="target" className="h-4 w-4 mr-2" />
            Scrum Board
          </button>
        </div>
        
        <div className="text-sm text-slate-600 dark:text-slate-400 flex items-center">
          <span className="font-medium text-slate-700 dark:text-slate-300">Project:</span>
          <span className="ml-2 font-semibold text-slate-800 dark:text-slate-200">{project.name}</span>
          {project.methodology && (
            <span className="ml-3 px-3 py-1.5 bg-primary-50 dark:bg-primary-900 text-primary-800 dark:text-primary-200 rounded-md text-xs font-medium capitalize">
              {project.methodology}
            </span>
          )}
        </div>
      </div>

      {/* Board Content */}
      <div className="bg-white dark:bg-slate-900 rounded-md shadow-xs border border-slate-200 dark:border-slate-700 overflow-hidden">
        {boardView === 'kanban' ? (
          <KanbanBoard
            projectId={projectId}
            workflowStates={workflowStates}
            onWorkItemUpdated={handleWorkItemUpdated}
          />
        ) : (
          <ScrumBoard
            projectId={projectId}
            workflowStates={workflowStates}
            onWorkItemUpdated={handleWorkItemUpdated}
          />
        )}
      </div>
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
    </div>
  );
};
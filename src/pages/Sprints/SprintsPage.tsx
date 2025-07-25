import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { Icon } from '../../components/common/Icon';
import { Loading } from '../../components/common/Loading';
import { SprintList } from '../../components/sprints/SprintList';
import { SprintDashboard } from '../../components/sprints/SprintDashboard';
import { SprintBacklog } from '../../components/sprints/SprintBacklog';
import { useSprints } from '../../hooks/useSprints';
import { useProject } from '../../hooks/useProject';
import { sprintService } from '../../services';
import type { Sprint } from '../../types';

type ViewMode = 'list' | 'active' | 'planning';

export const SprintsPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedSprint, setSelectedSprint] = useState<Sprint | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { project, loading: projectLoading } = useProject(projectId);
  const { sprints, activeSprint, loading, error: sprintsError, fetchSprints } = useSprints(projectId);

  useEffect(() => {
    if (!projectId) {
      navigate('/dashboard');
      return;
    }

    // Auto-select view mode based on active sprint
    if (activeSprint) {
      setViewMode('active');
      setSelectedSprint(activeSprint);
    } else if (sprints.length > 0) {
      // Check if there's a planning sprint
      const planningSprint = sprints.find(s => s.status === 'planning');
      if (planningSprint) {
        setViewMode('planning');
        setSelectedSprint(planningSprint);
      }
    }
  }, [projectId, activeSprint, sprints, navigate]);

  const handleSprintCreated = (sprint: Sprint) => {
    fetchSprints(projectId!);
    setSelectedSprint(sprint);
    setViewMode('planning');
  };

  const handleSprintUpdated = (sprint: Sprint) => {
    fetchSprints(projectId!);
    setSelectedSprint(sprint);
  };

  const handleSprintStarted = async (sprint: Sprint) => {
    setError(null);
    try {
      const startedSprint = await sprintService.startSprint(sprint.id);
      fetchSprints(projectId!);
      setSelectedSprint(startedSprint);
      setViewMode('active');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start sprint');
    }
  };

  const handleSprintCompleted = async () => {
    setError(null);
    try {
      await fetchSprints(projectId!);
      setViewMode('list');
      setSelectedSprint(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh sprints');
    }
  };

  const handleSprintSelected = (sprint: Sprint) => {
    setSelectedSprint(sprint);
    if (sprint.status === 'active') {
      setViewMode('active');
    } else if (sprint.status === 'planning') {
      setViewMode('planning');
    } else {
      setViewMode('list');
    }
  };

  if (projectLoading || !project) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loading size="large" />
      </div>
    );
  }

  if (!projectId) {
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

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex items-center">
            <Icon name="alert-circle" className="h-5 w-5 text-red-400 mr-2" />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => {
              setViewMode('list');
              setSelectedSprint(null);
            }}
            className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              viewMode === 'list'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Icon name="list" className="h-4 w-4 mr-1 inline" />
            All Sprints
          </button>
          
          {activeSprint && (
            <button
              onClick={() => {
                setViewMode('active');
                setSelectedSprint(activeSprint);
              }}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                viewMode === 'active'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon name="play" className="h-4 w-4 mr-1 inline" />
              Active Sprint
            </button>
          )}
          
          {selectedSprint && selectedSprint.status === 'planning' && (
            <button
              onClick={() => {
                setViewMode('planning');
              }}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                viewMode === 'planning'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon name="calendar" className="h-4 w-4 mr-1 inline" />
              Sprint Planning
            </button>
          )}
        </nav>
      </div>

      {/* Content */}
      {viewMode === 'list' && (
        <SprintList
          projectId={projectId}
          sprints={sprints}
          loading={loading}
          error={sprintsError}
          onSprintCreated={handleSprintCreated}
          onSprintUpdated={handleSprintUpdated}
          onSprintStarted={handleSprintStarted}
          onSprintCompleted={handleSprintCompleted}
          onSprintSelected={handleSprintSelected}
        />
      )}

      {viewMode === 'active' && selectedSprint && (
        <SprintDashboard
          sprint={selectedSprint}
          onComplete={handleSprintCompleted}
        />
      )}

      {viewMode === 'planning' && selectedSprint && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{selectedSprint.name}</h2>
                <p className="text-gray-600 mt-1">Sprint Planning</p>
              </div>
              <Button
                onClick={() => handleSprintStarted(selectedSprint)}
                disabled={selectedSprint.workItems.length === 0}
              >
                <Icon name="play" className="h-4 w-4 mr-2" />
                Start Sprint
              </Button>
            </div>
            
            {selectedSprint.goal && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
                <p className="text-sm font-medium text-blue-900 mb-1">Sprint Goal</p>
                <p className="text-blue-800">{selectedSprint.goal}</p>
              </div>
            )}
          </div>

          <SprintBacklog
            sprint={selectedSprint}
            projectId={projectId}
            onWorkItemsChanged={() => fetchSprints(projectId)}
          />
        </div>
      )}
    </div>
  );
};
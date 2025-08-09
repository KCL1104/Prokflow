<<<<<<< HEAD
import React from 'react';

export const GanttPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Gantt Chart
        </h1>
        <p className="text-gray-600 mb-4">
          Timeline and dependency visualization will be implemented here.
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <p className="text-blue-800 text-sm">
            🚧 This page is under construction. Gantt chart functionality will be added in upcoming tasks.
          </p>
        </div>
      </div>
=======
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { GanttChart } from '../../components/charts/GanttChart';
import { ResourceAllocationSection } from '../../components/charts/ResourceAllocationSection';
import { Loading } from '../../components/common/Loading';
import { Icon } from '../../components/common/Icon';
import { Button } from '../../components/ui/button';
import { useWorkItems } from '../../hooks/useWorkItems';
import { useProject } from '../../hooks/useProject';
import type { WorkItem } from '../../types';

export const GanttPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { workItems, loading: workItemsLoading, error: workItemsError, fetchBacklog } = useWorkItems(projectId!);
  const { project, loading: projectLoading, error: projectError } = useProject(projectId!);
  const [selectedWorkItem, setSelectedWorkItem] = useState<WorkItem | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    showCompleted: true,
    showOnlyWithDueDates: true,
    assignee: '',
    priority: '',
  });

  useEffect(() => {
    if (projectId) {
      fetchBacklog(projectId);
    }
  }, [projectId, fetchBacklog]);

  // Filter work items based on current filters
  const filteredWorkItems = workItems.filter(item => {
    if (!filters.showCompleted && item.status === 'Done') return false;
    if (filters.showOnlyWithDueDates && !item.dueDate) return false;
    if (filters.assignee && item.assigneeId !== filters.assignee) return false;
    if (filters.priority && item.priority !== filters.priority) return false;
    return true;
  });

  const handleWorkItemClick = (workItem: WorkItem) => {
    setSelectedWorkItem(workItem);
  };

  const handleMemberClick = (memberId: string) => {
    // TODO: Implement member details view
    console.log('Member clicked:', memberId);
  };

  const handleDependencyEdit = (workItemId: string, dependencies: string[]) => {
    // TODO: Implement dependency editing
    console.log('Edit dependencies for', workItemId, dependencies);
  };

  const loading = workItemsLoading || projectLoading;
  const error = workItemsError || projectError;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loading size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex items-center">
          <Icon name="alert-circle" className="h-5 w-5 text-red-400 mr-2" />
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <Icon name="folder" className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Project not found</h3>
        <p className="text-gray-600">The requested project could not be found.</p>
      </div>
    );
  }

  const workItemsWithDueDates = filteredWorkItems.filter(item => item.dueDate);
  const totalWorkItems = filteredWorkItems.length;
  const completedWorkItems = filteredWorkItems.filter(item => item.status === 'Done').length;
  const progressPercentage = totalWorkItems > 0 ? (completedWorkItems / totalWorkItems) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-md border border-gray-200 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {project.name} - Gantt Chart
            </h1>
            <p className="text-gray-600">
              Project timeline and task dependencies visualization
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Icon name="filter" className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => fetchBacklog(projectId!)}
            >
              <Icon name="refresh" className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Project Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-md p-4">
            <div className="flex items-center">
              <Icon name="list" className="h-5 w-5 text-gray-400 mr-2" />
              <div>
                <p className="text-sm text-gray-600">Total Tasks</p>
                <p className="text-lg font-semibold text-gray-900">{totalWorkItems}</p>
              </div>
            </div>
          </div>
          <div className="bg-primary-50 rounded-md p-4">
            <div className="flex items-center">
              <Icon name="check-circle" className="h-5 w-5 text-primary-500 mr-2" />
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-lg font-semibold text-gray-900">{completedWorkItems}</p>
              </div>
            </div>
          </div>
          <div className="bg-primary-50 rounded-md p-4">
            <div className="flex items-center">
              <Icon name="calendar" className="h-5 w-5 text-primary-500 mr-2" />
              <div>
                <p className="text-sm text-gray-600">With Due Dates</p>
                <p className="text-lg font-semibold text-gray-900">{workItemsWithDueDates.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-primary-50 rounded-md p-4">
            <div className="flex items-center">
              <Icon name="trending-up" className="h-5 w-5 text-primary-500 mr-2" />
              <div>
                <p className="text-sm text-gray-600">Progress</p>
                <p className="text-lg font-semibold text-gray-900">{Math.round(progressPercentage)}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white rounded-md border border-gray-200 p-6 shadow-xs">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.showCompleted}
                  onChange={(e) => setFilters(prev => ({ ...prev, showCompleted: e.target.checked }))}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700">Show completed tasks</span>
              </label>
            </div>
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.showOnlyWithDueDates}
                  onChange={(e) => setFilters(prev => ({ ...prev, showOnlyWithDueDates: e.target.checked }))}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700">Only tasks with due dates</span>
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={filters.priority}
                onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All priorities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setFilters({
                  showCompleted: true,
                  showOnlyWithDueDates: true,
                  assignee: '',
                  priority: '',
                })}
              >
                Reset Filters
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Gantt Chart */}
      <GanttChart
        projectId={projectId!}
        workItems={filteredWorkItems}
        onWorkItemClick={handleWorkItemClick}
        onDependencyEdit={handleDependencyEdit}
      />

      {/* Resource Allocation Section */}
      <ResourceAllocationSection
        projectId={projectId!}
        workItems={filteredWorkItems}
        onMemberClick={handleMemberClick}
      />

      {/* Work Item Details Modal */}
      {selectedWorkItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-md max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-lg">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Task Details</h3>
                <button
                  onClick={() => setSelectedWorkItem(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <Icon name="x" className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900">{selectedWorkItem.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{selectedWorkItem.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Status</p>
                    <p className="text-sm text-gray-900">{selectedWorkItem.status}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Priority</p>
                    <p className="text-sm text-gray-900 capitalize">{selectedWorkItem.priority}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Estimate</p>
                    <p className="text-sm text-gray-900">{selectedWorkItem.estimate || 'Not set'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Actual Time</p>
                    <p className="text-sm text-gray-900">{selectedWorkItem.actualTime || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Due Date</p>
                    <p className="text-sm text-gray-900">
                      {selectedWorkItem.dueDate ? selectedWorkItem.dueDate.toLocaleDateString() : 'Not set'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Dependencies</p>
                    <p className="text-sm text-gray-900">
                      {selectedWorkItem.dependencies.length > 0 
                        ? `${selectedWorkItem.dependencies.length} dependencies`
                        : 'None'
                      }
                    </p>
                  </div>
                </div>
                
                {selectedWorkItem.labels.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Labels</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedWorkItem.labels.map(label => (
                        <span
                          key={label}
                          className="px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-md"
                        >
                          {label}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredWorkItems.length === 0 && (
        <div className="bg-white rounded-md border border-gray-200 p-12 shadow-xs">
          <div className="text-center">
            <Icon name="calendar" className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks to display</h3>
            <p className="text-gray-600 mb-6">
              {workItems.length === 0 
                ? 'Create some work items to see them in the Gantt chart.'
                : 'Add due dates to your work items or adjust your filters to see the timeline.'
              }
            </p>
            <Button onClick={() => window.location.href = `/projects/${projectId}/backlog`}>
              Go to Backlog
            </Button>
          </div>
        </div>
      )}
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
    </div>
  );
};
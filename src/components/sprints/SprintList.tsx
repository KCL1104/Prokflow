import React, { useState } from 'react';
import { Button } from '../common/Button';
import { Icon } from '../common/Icon';
import { Loading } from '../common/Loading';
import { SprintCard } from './SprintCard';
import { SprintForm } from './SprintForm';
import type { Sprint } from '../../types';

interface SprintListProps {
  projectId: string;
  sprints: Sprint[];
  loading?: boolean;
  error?: string | null;
  onSprintCreated?: (sprint: Sprint) => void;
  onSprintUpdated?: (sprint: Sprint) => void;
  onSprintStarted?: (sprint: Sprint) => void;
  onSprintCompleted?: (sprint: Sprint) => void;
  onSprintSelected?: (sprint: Sprint) => void;
}

export const SprintList: React.FC<SprintListProps> = ({
  projectId,
  sprints,
  loading = false,
  error = null,
  onSprintCreated,
  onSprintUpdated,
  onSprintStarted,
  onSprintCompleted,
  onSprintSelected
}) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingSprint, setEditingSprint] = useState<Sprint | null>(null);
  const [filter, setFilter] = useState<'all' | 'planning' | 'active' | 'completed'>('all');

  const filteredSprints = sprints.filter(sprint => {
    if (filter === 'all') return true;
    return sprint.status === filter;
  });

  const sortedSprints = [...filteredSprints].sort((a, b) => {
    // Sort by status priority (active > planning > completed) then by date
    const statusPriority = { active: 3, planning: 2, completed: 1 };
    const aPriority = statusPriority[a.status];
    const bPriority = statusPriority[b.status];
    
    if (aPriority !== bPriority) {
      return bPriority - aPriority;
    }
    
    // If same status, sort by start date (newest first for planning/active, oldest first for completed)
    if (a.status === 'completed') {
      return a.startDate.getTime() - b.startDate.getTime();
    }
    return b.startDate.getTime() - a.startDate.getTime();
  });

  const handleCreateSprint = (sprint: Sprint) => {
    onSprintCreated?.(sprint);
    setIsCreateModalOpen(false);
  };

  const handleUpdateSprint = (sprint: Sprint) => {
    onSprintUpdated?.(sprint);
    setEditingSprint(null);
  };

  const getFilterCount = (status: typeof filter) => {
    if (status === 'all') return sprints.length;
    return sprints.filter(sprint => sprint.status === status).length;
  };

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Sprints</h2>
          <p className="text-gray-600 mt-1">
            Manage your project sprints and track progress
          </p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center"
        >
          <Icon name="plus" className="h-4 w-4 mr-2" />
          Create Sprint
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'all', label: 'All Sprints' },
            { key: 'active', label: 'Active' },
            { key: 'planning', label: 'Planning' },
            { key: 'completed', label: 'Completed' }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key as typeof filter)}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                filter === key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {label}
              <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                {getFilterCount(key as typeof filter)}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Sprint List */}
      {sortedSprints.length === 0 ? (
        <div className="text-center py-12">
          <Icon name="calendar" className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {filter === 'all' ? 'No sprints yet' : `No ${filter} sprints`}
          </h3>
          <p className="text-gray-600 mb-6">
            {filter === 'all' 
              ? 'Create your first sprint to start organizing your work into iterations.'
              : `There are no ${filter} sprints at the moment.`
            }
          </p>
          {filter === 'all' && (
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Icon name="plus" className="h-4 w-4 mr-2" />
              Create Your First Sprint
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sortedSprints.map(sprint => (
            <SprintCard
              key={sprint.id}
              sprint={sprint}
              onEdit={setEditingSprint}
              onStart={onSprintStarted}
              onComplete={onSprintCompleted}
              onViewDetails={onSprintSelected}
            />
          ))}
        </div>
      )}

      {/* Create Sprint Modal */}
      <SprintForm
        projectId={projectId}
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateSprint}
      />

      {/* Edit Sprint Modal */}
      {editingSprint && (
        <SprintForm
          projectId={projectId}
          sprint={editingSprint}
          isOpen={true}
          onClose={() => setEditingSprint(null)}
          onSubmit={handleUpdateSprint}
        />
      )}
    </div>
  );
};
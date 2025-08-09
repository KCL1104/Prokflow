import React, { useState } from 'react';
import { useSprints } from '../../hooks/useSprints';
import { Button } from '../ui/button';
import { Icon } from '../common/Icon';
import { Loading } from '../common/Loading';
import type { Sprint } from '../../types';

interface SprintReviewListProps {
  projectId: string;
  onSprintSelect?: (sprint: Sprint) => void;
}

export const SprintReviewList: React.FC<SprintReviewListProps> = ({
  projectId,
  onSprintSelect
}) => {
  const { sprints, loading: sprintsLoading, error: sprintsError } = useSprints(projectId);
  const [filter, setFilter] = useState<'all' | 'completed' | 'active'>('all');

  const filteredSprints = sprints.filter(sprint => {
    if (filter === 'completed') return sprint.status === 'completed';
    if (filter === 'active') return sprint.status === 'active';
    return true;
  }).sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime());

  const getStatusColor = (status: Sprint['status']) => {
    switch (status) {
      case 'planning':
        return 'text-gray-600 bg-gray-100';
      case 'active':
        return 'text-blue-600 bg-blue-100';
      case 'completed':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getSprintDuration = (startDate: Date, endDate: Date) => {
    const duration = Math.ceil(
      (new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)
    );
    return `${duration} days`;
  };

  if (sprintsLoading) {
    return <Loading />;
  }

  if (sprintsError) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">Error loading sprints: {sprintsError}</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Sprint Reviews</h2>
        
        {/* Filter Buttons */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All Sprints
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              filter === 'completed'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Completed
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              filter === 'active'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Active
          </button>
        </div>
      </div>

      {filteredSprints.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Icon name="calendar" size="lg" className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {filter === 'completed' 
              ? 'No completed sprints yet'
              : filter === 'active'
              ? 'No active sprints'
              : 'No sprints found'
            }
          </h3>
          <p className="text-gray-600">
            {filter === 'completed' 
              ? 'Complete some sprints to see their reviews here.'
              : filter === 'active'
              ? 'Start a sprint to see it here.'
              : 'Create sprints to review their progress and outcomes.'
            }
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredSprints.map((sprint) => (
            <div
              key={sprint.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {sprint.name}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>
                      {formatDate(sprint.startDate)} - {formatDate(sprint.endDate)}
                    </span>
                    <span>•</span>
                    <span>{getSprintDuration(sprint.startDate, sprint.endDate)}</span>
                    {sprint.capacity && (
                      <>
                        <span>•</span>
                        <span>Capacity: {sprint.capacity} points</span>
                      </>
                    )}
                  </div>
                  {sprint.goal && (
                    <div className="mt-2 p-2 bg-blue-50 rounded text-sm text-blue-800">
                      <span className="font-medium">Goal:</span> {sprint.goal}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(sprint.status)}`}>
                    {sprint.status}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  Created {formatDate(sprint.createdAt)}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onSprintSelect?.(sprint)}
                    className="flex items-center gap-2"
                  >
                    <Icon name="eye" size="sm" />
                    Review Sprint
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

<<<<<<< HEAD
import React from 'react';
import { Button } from '../common/Button';
=======
import React, { useMemo } from 'react';
import { Button } from '../ui/button';
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
import { Icon } from '../common/Icon';
import type { Sprint } from '../../types';

interface SprintCardProps {
  sprint: Sprint;
  onEdit?: (sprint: Sprint) => void;
  onStart?: (sprint: Sprint) => void;
  onComplete?: (sprint: Sprint) => void;
  onViewDetails?: (sprint: Sprint) => void;
  showActions?: boolean;
}

export const SprintCard: React.FC<SprintCardProps> = React.memo(({
  sprint,
  onEdit,
  onStart,
  onComplete,
  onViewDetails,
  showActions = true
}) => {
<<<<<<< HEAD
  const getStatusColor = (status: Sprint['status']) => {
    switch (status) {
      case 'planning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'completed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: Sprint['status']) => {
    switch (status) {
      case 'planning':
        return 'clock';
      case 'active':
        return 'play';
      case 'completed':
        return 'check';
      default:
        return 'clock';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const calculateProgress = () => {
    const now = new Date();
    const start = sprint.startDate;
    const end = sprint.endDate;
    
    if (now < start) return 0;
    if (now > end) return 100;
    
    const total = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    return Math.round((elapsed / total) * 100);
  };

  const getDaysRemaining = () => {
    const now = new Date();
    const end = sprint.endDate;
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const progress = calculateProgress();
  const daysRemaining = getDaysRemaining();
  const isActive = sprint.status === 'active';


  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
=======
  // Memoize status-related calculations
  const statusConfig = useMemo(() => {
    const configs = {
      planning: {
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: 'clock' as const
      },
      active: {
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: 'play' as const
      },
      completed: {
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        icon: 'check' as const
      }
    };
    
    return configs[sprint.status] || configs.planning;
  }, [sprint.status]);

  // Memoize expensive calculations
  const { formattedStartDate, formattedEndDate, progress, daysRemaining, isActive } = useMemo(() => {
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    };

    const calculateProgress = () => {
      const now = new Date();
      const start = sprint.startDate;
      const end = sprint.endDate;
      
      if (now < start) return 0;
      if (now > end) return 100;
      
      const total = end.getTime() - start.getTime();
      const elapsed = now.getTime() - start.getTime();
      return Math.round((elapsed / total) * 100);
    };

    const getDaysRemaining = () => {
      const now = new Date();
      const end = sprint.endDate;
      const diffTime = end.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    };

    return {
      formattedStartDate: formatDate(sprint.startDate),
      formattedEndDate: formatDate(sprint.endDate),
      progress: calculateProgress(),
      daysRemaining: getDaysRemaining(),
      isActive: sprint.status === 'active'
    };
  }, [sprint.startDate, sprint.endDate, sprint.status]);


  return (
    <div className="bg-white rounded-lg border-2 border-gray-300 shadow-sm hover:shadow-md transition-shadow">
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">{sprint.name}</h3>
<<<<<<< HEAD
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(sprint.status)}`}>
                <Icon name={getStatusIcon(sprint.status)} className="h-3 w-3 mr-1" />
=======
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusConfig.color}`}>
                <Icon name={statusConfig.icon} className="h-3 w-3 mr-1" />
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
                {sprint.status.charAt(0).toUpperCase() + sprint.status.slice(1)}
              </span>
            </div>
            {sprint.goal && (
              <p className="text-sm text-gray-600 mb-3">{sprint.goal}</p>
            )}
          </div>
          
          {showActions && (
            <div className="flex items-center space-x-2 ml-4">
              {onEdit && (
                <Button
                  variant="secondary"
<<<<<<< HEAD
                  size="small"
=======
                  size="sm"
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
                  onClick={() => onEdit(sprint)}
                  disabled={isActive}
                  aria-label="Edit sprint"
                >
                  <Icon name="edit" className="h-4 w-4" />
                </Button>
              )}
              {onViewDetails && (
                <Button
                  variant="secondary"
<<<<<<< HEAD
                  size="small"
=======
                  size="sm"
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
                  onClick={() => onViewDetails(sprint)}
                  aria-label="View sprint details"
                >
                  <Icon name="eye" className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Sprint Info */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Duration</p>
            <p className="text-sm text-gray-900">
<<<<<<< HEAD
              {formatDate(sprint.startDate)} - {formatDate(sprint.endDate)}
=======
              {formattedStartDate} - {formattedEndDate}
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Capacity</p>
            <p className="text-sm text-gray-900">{sprint.capacity} story points</p>
          </div>
        </div>

        {/* Progress Bar (for active sprints) */}
        {isActive && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Progress</p>
              <p className="text-xs text-gray-600">
                {daysRemaining > 0 ? `${daysRemaining} days remaining` : 'Sprint ended'}
              </p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-600 mt-1">{progress}% complete</p>
          </div>
        )}

        {/* Work Items Count */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Icon name="list" className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">
                {sprint.workItems.length} work items
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        {showActions && (
<<<<<<< HEAD
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
=======
          <div className="flex items-center justify-between pt-4 border-t-2 border-gray-200">
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
            <div className="flex space-x-2">
              {sprint.status === 'planning' && onStart && (
                <Button
                  variant="primary"
<<<<<<< HEAD
                  size="small"
=======
                  size="sm"
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
                  onClick={() => onStart(sprint)}
                >
                  <Icon name="play" className="h-4 w-4 mr-1" />
                  Start Sprint
                </Button>
              )}
              {sprint.status === 'active' && onComplete && (
                <Button
                  variant="secondary"
<<<<<<< HEAD
                  size="small"
=======
                  size="sm"
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
                  onClick={() => onComplete(sprint)}
                >
                  <Icon name="check" className="h-4 w-4 mr-1" />
                  Complete Sprint
                </Button>
              )}
            </div>
            
            {onViewDetails && (
              <Button
                variant="secondary"
<<<<<<< HEAD
                size="small"
=======
                size="sm"
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
                onClick={() => onViewDetails(sprint)}
              >
                View Details
                <Icon name="arrow-right" className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
<<<<<<< HEAD
});
=======
});
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)

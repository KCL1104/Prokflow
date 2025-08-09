import React, { useMemo } from 'react';
import { Icon } from '../common/Icon';
import type { Sprint } from '../../types';

interface SprintMetrics {
  totalItems: number;
  completedItems: number;
  totalPoints: number;
  completedPoints: number;
  remainingPoints: number;
  progressPercentage: number;
}

interface SprintProgressIndicatorProps {
  sprint: Sprint;
  metrics: SprintMetrics;
}

export const SprintProgressIndicator: React.FC<SprintProgressIndicatorProps> = ({
  sprint,
  metrics
}) => {
  // Memoize expensive date calculations
  const timeMetrics = useMemo(() => {
    const today = new Date();
    const endDate = new Date(sprint.endDate);
    const startDate = new Date(sprint.startDate);
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
    const daysElapsed = totalDays - daysRemaining;
    const timeProgressPercentage = totalDays > 0 ? (daysElapsed / totalDays) * 100 : 0;
    
    return { today, endDate, startDate, totalDays, daysRemaining, daysElapsed, timeProgressPercentage };
  }, [sprint.startDate, sprint.endDate]);

  // Determine if sprint is on track
  const isAhead = metrics.progressPercentage > timeMetrics.timeProgressPercentage + 10;
  const isBehind = metrics.progressPercentage < timeMetrics.timeProgressPercentage - 10;

  const getStatusColor = () => {
    if (isAhead) return 'text-green-600 bg-green-100';
    if (isBehind) return 'text-red-600 bg-red-100';
    return 'text-blue-600 bg-blue-100';
  };

  const getStatusIcon = () => {
    if (isAhead) return 'trending-up';
    if (isBehind) return 'trending-down';
    return 'target';
  };

  const getStatusText = () => {
    if (isAhead) return 'Ahead of Schedule';
    if (isBehind) return 'Behind Schedule';
    return 'On Track';
  };

  return (
    <div className="space-y-4">
      {/* Sprint Timeline */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center">
          <Icon name="calendar" className="h-4 w-4 mr-2" />
          <span>
            {timeMetrics.startDate.toLocaleDateString()} - {timeMetrics.endDate.toLocaleDateString()}
          </span>
        </div>
        <div className="flex items-center">
          <Icon name="clock" className="h-4 w-4 mr-2" />
          <span>
            {timeMetrics.daysRemaining} {timeMetrics.daysRemaining === 1 ? 'day' : 'days'} remaining
          </span>
        </div>
      </div>

      {/* Progress Bars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Work Progress */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Work Progress</span>
            <span className="text-sm text-gray-600">
              {metrics.completedItems}/{metrics.totalItems} items
            </span>
          </div>
          <div 
            className="w-full bg-gray-200 rounded-full h-3"
            role="progressbar"
            aria-valuenow={Math.round(metrics.progressPercentage)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Work progress: ${Math.round(metrics.progressPercentage)}% complete`}
          >
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(metrics.progressPercentage, 100)}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-1 text-xs text-gray-500">
            <span>{metrics.completedPoints} pts completed</span>
            <span>{metrics.remainingPoints} pts remaining</span>
          </div>
        </div>

        {/* Time Progress */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Time Progress</span>
            <span className="text-sm text-gray-600">
              {timeMetrics.daysElapsed}/{timeMetrics.totalDays} days
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gray-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(timeMetrics.timeProgressPercentage, 100)}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-1 text-xs text-gray-500">
            <span>{Math.round(timeMetrics.timeProgressPercentage)}% elapsed</span>
            <span>{timeMetrics.daysRemaining} days left</span>
          </div>
        </div>
      </div>

      {/* Status Indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor()}`}>
            <Icon name={getStatusIcon()} className="h-4 w-4 mr-2" />
            {getStatusText()}
          </div>
          
          {/* Sprint Capacity */}
          <div className="flex items-center text-sm text-gray-600">
            <Icon name="users" className="h-4 w-4 mr-2" />
            <span>Capacity: {sprint.capacity} pts</span>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="flex items-center space-x-6 text-sm">
          <div className="text-center">
            <div className="font-semibold text-gray-900">{metrics.totalPoints}</div>
            <div className="text-gray-500">Total Points</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-green-600">{metrics.completedPoints}</div>
            <div className="text-gray-500">Completed</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-orange-600">{metrics.remainingPoints}</div>
            <div className="text-gray-500">Remaining</div>
          </div>
        </div>
      </div>

      {/* Velocity Indicator */}
      {metrics.totalPoints > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Sprint Velocity</h4>
              <p className="text-xs text-gray-600 mt-1">
                Current pace: {Math.round((metrics.completedPoints / Math.max(timeMetrics.daysElapsed, 1)) * 10) / 10} pts/day
              </p>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold text-gray-900">
                {Math.round(metrics.progressPercentage)}%
              </div>
              <div className="text-xs text-gray-500">Complete</div>
            </div>
          </div>
          
          {/* Projected completion */}
          {metrics.remainingPoints > 0 && timeMetrics.daysElapsed > 0 && (
            <div className="mt-2 pt-2 border-t border-gray-200">
              <div className="text-xs text-gray-600">
                {(() => {
                  const currentVelocity = metrics.completedPoints / timeMetrics.daysElapsed;
                  const projectedDaysToComplete = currentVelocity > 0 ? Math.ceil(metrics.remainingPoints / currentVelocity) : Infinity;
                  
                  if (projectedDaysToComplete <= timeMetrics.daysRemaining) {
                    return `Projected to complete ${projectedDaysToComplete} days early`;
                  } else if (projectedDaysToComplete === Infinity) {
                    return 'No progress detected - review sprint scope';
                  } else {
                    return `Projected to complete ${projectedDaysToComplete - timeMetrics.daysRemaining} days late`;
                  }
                })()}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
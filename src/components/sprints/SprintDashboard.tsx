import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '../common/Button';
import { Icon } from '../common/Icon';
import { Loading } from '../common/Loading';
import { Modal } from '../common/Modal';
import { MetricCard } from './MetricCard';
import { BurndownChart } from '../charts/BurndownChart';
import { sprintService } from '../../services';
import type { Sprint, BurndownData } from '../../types';

interface SprintDashboardProps {
  sprint: Sprint;
  onComplete?: (sprint: Sprint) => void;
}

export const SprintDashboard: React.FC<SprintDashboardProps> = ({
  sprint,
  onComplete
}) => {
  const [burndownData, setBurndownData] = useState<BurndownData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [retrospectiveNotes, setRetrospectiveNotes] = useState('');

  const fetchBurndownData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await sprintService.getSprintBurndown(sprint.id);
      setBurndownData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch burndown data');
    } finally {
      setLoading(false);
    }
  }, [sprint.id]);

  useEffect(() => {
    let isMounted = true;
    
    if (sprint.status === 'active') {
      fetchBurndownData().catch(err => {
        if (isMounted) {
          console.error('Failed to fetch burndown data:', err);
        }
      });
    }
    
    return () => {
      isMounted = false;
    };
  }, [sprint.id, sprint.status, fetchBurndownData]);

  // Split complex calculations into focused hooks
  const sprintProgress = useMemo(() => {
    const now = new Date();
    const start = sprint.startDate;
    const end = sprint.endDate;
    
    let progress = 0;
    if (now >= start && now <= end) {
      const total = end.getTime() - start.getTime();
      const elapsed = now.getTime() - start.getTime();
      progress = Math.round((elapsed / total) * 100);
    } else if (now > end) {
      progress = 100;
    }
    
    const diffTime = end.getTime() - now.getTime();
    const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    const isOverdue = daysRemaining === 0 && sprint.status === 'active';
    
    return { progress, daysRemaining, isOverdue };
  }, [sprint.startDate, sprint.endDate, sprint.status]);

  const currentBurndown = useMemo(() => 
    burndownData.length > 0 ? burndownData[burndownData.length - 1] : null,
    [burndownData]
  );

  const sprintHealth = useMemo(() => {
    const { isOverdue } = sprintProgress;
    const isBehindSchedule = currentBurndown && currentBurndown.remainingPoints > currentBurndown.idealRemaining;
    
    if (isOverdue) {
      return {
        status: 'at-risk' as const,
        color: 'text-red-600',
        icon: 'alert-triangle' as const,
        message: 'Sprint is overdue'
      };
    }
    
    if (isBehindSchedule) {
      return {
        status: 'behind' as const,
        color: 'text-yellow-600',
        icon: 'trending-up' as const,
        message: 'Behind ideal pace'
      };
    }
    
    return {
      status: 'on-track' as const,
      color: 'text-green-600',
      icon: 'check-circle' as const,
      message: 'Meeting expectations'
    };
  }, [sprintProgress, currentBurndown]);

  const handleCompleteSprint = async () => {
    if (!onComplete || isCompleting) return;
    
    setIsCompleting(true);
    setError(null);
    
    try {
      const completedSprint = await sprintService.completeSprint(sprint.id, retrospectiveNotes);
      onComplete(completedSprint);
      setShowCompleteModal(false);
      setRetrospectiveNotes(''); // Reset form
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to complete sprint';
      setError(errorMessage);
      console.error('Sprint completion error:', err);
    } finally {
      setIsCompleting(false);
    }
  };

  const handleRetryBurndown = useCallback(() => {
    fetchBurndownData();
  }, [fetchBurndownData]);

  const { progress, daysRemaining, isOverdue } = sprintProgress;
  const { status: healthStatus, color: healthColor, icon: healthIcon, message: healthMessage } = sprintHealth;

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Icon name="alert-circle" className="h-5 w-5 text-red-400 mr-2" />
              <p className="text-red-800">{error}</p>
            </div>
            {error.includes('burndown') && (
              <Button
                variant="secondary"
                size="small"
                onClick={handleRetryBurndown}
                disabled={loading}
              >
                Retry
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Sprint Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{sprint.name}</h1>
            {sprint.goal && (
              <p className="text-gray-600 mb-4">{sprint.goal}</p>
            )}
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center">
                <Icon name="calendar" className="h-4 w-4 mr-1" />
                {sprint.startDate.toLocaleDateString()} - {sprint.endDate.toLocaleDateString()}
              </div>
              <div className="flex items-center">
                <Icon name="target" className="h-4 w-4 mr-1" />
                {sprint.capacity} story points capacity
              </div>
              <div className="flex items-center">
                <Icon name="list" className="h-4 w-4 mr-1" />
                {sprint.workItems.length} work items
              </div>
            </div>
          </div>
          
          {sprint.status === 'active' && onComplete && (
            <Button
              variant="secondary"
              onClick={() => setShowCompleteModal(true)}
            >
              <Icon name="check" className="h-4 w-4 mr-2" />
              Complete Sprint
            </Button>
          )}
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Sprint Progress</span>
            <span className={`font-medium ${isOverdue ? 'text-red-600' : 'text-gray-900'}`}>
              {isOverdue ? 'Overdue' : `${daysRemaining} days remaining`}
            </span>
          </div>
          <div 
            className="w-full bg-gray-200 rounded-full h-3"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Sprint progress: ${progress}% complete`}
          >
            <div
              className={`h-3 rounded-full transition-all duration-300 ${
                isOverdue ? 'bg-red-500' : 'bg-blue-600'
              }`}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <div className="text-xs text-gray-500">
            {progress}% of sprint duration completed
          </div>
        </div>
      </div>

      {/* Sprint Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Remaining Work"
          value={currentBurndown?.remainingPoints ?? '--'}
          subtitle={currentBurndown ? 'story points' : 'No data available'}
          icon="trending-down"
          iconColor="text-blue-600"
          additionalInfo={currentBurndown ? `Ideal: ${currentBurndown.idealRemaining} points` : undefined}
        />

        <MetricCard
          title="Current Velocity"
          value={sprint.capacity - (currentBurndown?.remainingPoints || sprint.capacity)}
          subtitle="points completed"
          icon="zap"
          iconColor="text-yellow-600"
          additionalInfo={`${Math.round(((sprint.capacity - (currentBurndown?.remainingPoints || sprint.capacity)) / sprint.capacity) * 100)}% of capacity`}
        />

        <MetricCard
          title="Sprint Health"
          value={healthStatus === 'at-risk' ? 'At Risk' : healthStatus === 'behind' ? 'Behind' : 'On Track'}
          subtitle={healthMessage}
          icon={healthIcon}
          iconColor={healthColor}
          valueColor={healthColor}
        />
      </div>

      {/* Burndown Chart */}
      {loading ? (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Burndown Chart</h3>
          <div className="flex items-center justify-center py-12">
            <Loading size="large" />
          </div>
        </div>
      ) : (
        <BurndownChart 
          data={burndownData} 
          sprintName={sprint.name}
        />
      )}

      {/* Complete Sprint Modal */}
      <Modal
        isOpen={showCompleteModal}
        onClose={() => setShowCompleteModal(false)}
        title="Complete Sprint"
        size="medium"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to complete this sprint? Incomplete work items will be moved back to the product backlog.
          </p>
          
          <div>
            <label htmlFor="retrospective" className="block text-sm font-medium text-gray-700 mb-2">
              Retrospective Notes (Optional)
            </label>
            <textarea
              id="retrospective"
              value={retrospectiveNotes}
              onChange={(e) => setRetrospectiveNotes(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="What went well? What could be improved? Key learnings..."
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button
              variant="secondary"
              onClick={() => setShowCompleteModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCompleteSprint}
              loading={isCompleting}
              disabled={isCompleting}
            >
              Complete Sprint
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
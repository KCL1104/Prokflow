import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSprints } from '../../hooks/useSprints';
import { useWorkItems } from '../../hooks/useWorkItems';
import { Button } from '../ui/button';
import { Icon } from '../common/Icon';
import { Loading } from '../common/Loading';
import { BurndownChart } from '../charts/BurndownChart';
import { WorkItemCard } from '../work-items/WorkItemCard';
import type { Sprint, WorkItem } from '../../types';

interface SprintReviewProps {
  sprintId: string;
  onClose?: () => void;
}

type TabType = 'overview' | 'completed' | 'incomplete' | 'metrics';

export const SprintReview: React.FC<SprintReviewProps> = React.memo(({
  sprintId,
  onClose
}) => {
  const { getSprint } = useSprints();
  const { getSprintWorkItems } = useWorkItems();
  
  const [sprint, setSprint] = useState<Sprint | null>(null);
  const [workItems, setWorkItems] = useState<WorkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const fetchSprintData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [sprintData, workItemsData] = await Promise.all([
        getSprint(sprintId),
        getSprintWorkItems(sprintId)
      ]);
      
      setSprint(sprintData);
      setWorkItems(workItemsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sprint data');
    } finally {
      setLoading(false);
    }
  }, [sprintId, getSprint, getSprintWorkItems]);

  useEffect(() => {
    fetchSprintData();
  }, [fetchSprintData]);

  // Memoized calculations for performance
  const sprintMetrics = useMemo(() => {
    if (!sprint || workItems.length === 0) {
      return {
        completedItems: [],
        incompleteItems: [],
        totalStoryPoints: 0,
        completedStoryPoints: 0,
        completionRate: 0,
        sprintDuration: 0,
        velocity: 0
      };
    }

    const completedItems = workItems.filter(item => 
      item.status === 'Done' || item.status === 'done' || item.status === 'completed'
    );
    const incompleteItems = workItems.filter(item => 
      item.status !== 'Done' && item.status !== 'done' && item.status !== 'completed'
    );

    const totalStoryPoints = workItems.reduce((sum, item) => sum + (item.estimate || 0), 0);
    const completedStoryPoints = completedItems.reduce((sum, item) => sum + (item.estimate || 0), 0);
    const completionRate = totalStoryPoints > 0 ? (completedStoryPoints / totalStoryPoints) * 100 : 0;

    const sprintDuration = Math.ceil(
      (new Date(sprint.endDate).getTime() - new Date(sprint.startDate).getTime()) / (1000 * 60 * 60 * 24)
    );

    const velocity = completedStoryPoints;

    return {
      completedItems,
      incompleteItems,
      totalStoryPoints,
      completedStoryPoints,
      completionRate,
      sprintDuration,
      velocity
    };
  }, [sprint, workItems]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loading size="large" />
      </div>
    );
  }

  if (error || !sprint) {
    return (
      <div className="text-center py-8">
        <div className="flex items-center justify-center mb-4">
          <Icon name="alert-circle" className="h-8 w-8 text-red-400 mr-2" />
          <p className="text-red-600">Error loading sprint review: {error}</p>
        </div>
        {onClose && (
          <Button variant="secondary" onClick={onClose}>
            <Icon name="x" className="h-4 w-4 mr-2" />
            Close
          </Button>
        )}
      </div>
    );
  }

  const { 
    completedItems, 
    incompleteItems, 
    totalStoryPoints, 
    completedStoryPoints, 
    completionRate, 
    sprintDuration, 
    velocity 
  } = sprintMetrics;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Sprint Review: {sprint.name}
              </h1>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>
                  {new Date(sprint.startDate).toLocaleDateString()} - {new Date(sprint.endDate).toLocaleDateString()}
                </span>
                <span>•</span>
                <span>{sprintDuration} days</span>
                <span>•</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  sprint.status === 'completed' 
                    ? 'text-green-600 bg-green-100'
                    : sprint.status === 'active'
                    ? 'text-blue-600 bg-blue-100'
                    : 'text-gray-600 bg-gray-100'
                }`}>
                  {sprint.status}
                </span>
              </div>
              {sprint.goal && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-900 mb-1">Sprint Goal</p>
                  <p className="text-sm text-blue-800">{sprint.goal}</p>
                </div>
              )}
            </div>
            {onClose && (
              <Button variant="secondary" onClick={onClose}>
                <Icon name="x" className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'completed'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Completed ({completedItems.length})
            </button>
            <button
              onClick={() => setActiveTab('incomplete')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'incomplete'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Incomplete ({incompleteItems.length})
            </button>
            <button
              onClick={() => setActiveTab('metrics')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'metrics'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Metrics
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600">Total Items</p>
                      <p className="text-2xl font-bold text-blue-900">{workItems.length}</p>
                    </div>
                    <Icon name="list" className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600">Completed</p>
                      <p className="text-2xl font-bold text-green-900">{completedItems.length}</p>
                    </div>
                    <Icon name="check-circle" className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                
                <div className="bg-yellow-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-yellow-600">Story Points</p>
                      <p className="text-2xl font-bold text-yellow-900">
                        {completedStoryPoints}/{totalStoryPoints}
                      </p>
                    </div>
                    <Icon name="target" className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
                
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-600">Completion</p>
                      <p className="text-2xl font-bold text-purple-900">{Math.round(completionRate)}%</p>
                    </div>
                    <Icon name="bar-chart" className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </div>

              {/* Sprint Summary */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Sprint Highlights</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <Icon name="check-circle" className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium text-green-900">
                          {completedItems.length} items completed
                        </p>
                        <p className="text-sm text-green-700">
                          {completedStoryPoints} story points delivered
                        </p>
                      </div>
                    </div>
                    
                    {incompleteItems.length > 0 && (
                      <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                        <Icon name="clock" className="h-5 w-5 text-yellow-600" />
                        <div>
                          <p className="font-medium text-yellow-900">
                            {incompleteItems.length} items incomplete
                          </p>
                          <p className="text-sm text-yellow-700">
                            {totalStoryPoints - completedStoryPoints} story points remaining
                          </p>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                      <Icon name="trending-up" className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-blue-900">
                          Velocity: {velocity} points
                        </p>
                        <p className="text-sm text-blue-700">
                          Team delivered {velocity} story points this sprint
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Work Item Breakdown</h3>
                  <div className="space-y-2">
                    {['story', 'task', 'bug', 'epic'].map(type => {
                      const typeItems = workItems.filter(item => item.type === type);
                      const completedTypeItems = completedItems.filter(item => item.type === type);
                      
                      if (typeItems.length === 0) return null;
                      
                      return (
                        <div key={type} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="capitalize font-medium text-gray-700">{type}s</span>
                          <span className="text-sm text-gray-600">
                            {completedTypeItems.length}/{typeItems.length} completed
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'completed' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Completed Work ({completedItems.length} items)
              </h3>
              {completedItems.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <Icon name="check-circle" className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No completed items</h4>
                  <p className="text-gray-600">
                    No work items were completed in this sprint.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {completedItems.map((item) => (
                    <WorkItemCard
                      key={item.id}
                      workItem={item}
                      showActions={false}
                      compact={true}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'incomplete' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Incomplete Work ({incompleteItems.length} items)
              </h3>
              {incompleteItems.length === 0 ? (
                <div className="text-center py-12 bg-green-50 rounded-lg">
                  <Icon name="check-circle" className="h-12 w-12 mx-auto text-green-600 mb-4" />
                  <h4 className="text-lg font-medium text-green-900 mb-2">All work completed!</h4>
                  <p className="text-green-700">
                    Congratulations! All planned work for this sprint was completed.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon name="alert-triangle" className="h-5 w-5 text-yellow-600" />
                      <h4 className="font-medium text-yellow-900">Incomplete Items</h4>
                    </div>
                    <p className="text-sm text-yellow-800">
                      These items were not completed during the sprint and may need to be moved to the next sprint or back to the backlog.
                    </p>
                  </div>
                  
                  <div className="grid gap-4">
                    {incompleteItems.map((item) => (
                      <WorkItemCard
                        key={item.id}
                        workItem={item}
                        showActions={false}
                        compact={true}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'metrics' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Sprint Metrics</h3>
              
              {/* Burndown Chart */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="text-md font-medium text-gray-900 mb-4">Burndown Chart</h4>
                <BurndownChart sprintId={sprintId} sprintName={sprint.name} />
              </div>

              {/* Detailed Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="text-md font-medium text-gray-900 mb-4">Sprint Statistics</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sprint Duration:</span>
                      <span className="font-medium">{sprintDuration} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Planned Story Points:</span>
                      <span className="font-medium">{totalStoryPoints}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Completed Story Points:</span>
                      <span className="font-medium text-green-600">{completedStoryPoints}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Velocity:</span>
                      <span className="font-medium">{velocity} points</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Completion Rate:</span>
                      <span className="font-medium">{Math.round(completionRate)}%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="text-md font-medium text-gray-900 mb-4">Work Item Analysis</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Items:</span>
                      <span className="font-medium">{workItems.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Completed Items:</span>
                      <span className="font-medium text-green-600">{completedItems.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Incomplete Items:</span>
                      <span className="font-medium text-yellow-600">{incompleteItems.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Average Points per Item:</span>
                      <span className="font-medium">
                        {workItems.length > 0 ? Math.round((totalStoryPoints / workItems.length) * 10) / 10 : 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

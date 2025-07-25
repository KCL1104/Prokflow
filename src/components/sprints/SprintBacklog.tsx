import React, { useState, useEffect } from 'react';
import { Button } from '../common/Button';
import { Icon } from '../common/Icon';
import { Loading } from '../common/Loading';
import { WorkItemList } from '../work-items/WorkItemList';
import { useWorkItems } from '../../hooks/useWorkItems';
import { sprintService } from '../../services';
import type { Sprint, WorkItem } from '../../types';

interface SprintBacklogProps {
  sprint: Sprint;
  projectId: string;
  onWorkItemsChanged?: () => void;
}

export const SprintBacklog: React.FC<SprintBacklogProps> = ({
  sprint,
  projectId,
  onWorkItemsChanged
}) => {
  const [availableWorkItems, setAvailableWorkItems] = useState<WorkItem[]>([]);
  const [sprintWorkItems, setSprintWorkItems] = useState<WorkItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  const { workItems: allWorkItems, loading: workItemsLoading } = useWorkItems(projectId);

  useEffect(() => {
    if (allWorkItems.length > 0) {
      // Separate work items into sprint and available (backlog)
      const sprintItems = allWorkItems.filter(item => item.sprintId === sprint.id);
      const backlogItems = allWorkItems.filter(item => !item.sprintId);
      
      setSprintWorkItems(sprintItems);
      setAvailableWorkItems(backlogItems);
    }
  }, [allWorkItems, sprint.id]);

  const handleAddToSprint = async (workItemIds: string[]) => {
    setLoading(true);
    setError(null);
    
    try {
      // Add selected items to sprint
      await Promise.all(
        workItemIds.map(id => sprintService.addWorkItemToSprint(sprint.id, id))
      );

      // Move items from available to sprint
      const itemsToMove = availableWorkItems.filter(item => workItemIds.includes(item.id));
      const updatedItems = itemsToMove.map(item => ({ ...item, sprintId: sprint.id }));
      
      setSprintWorkItems(prev => [...prev, ...updatedItems]);
      setAvailableWorkItems(prev => prev.filter(item => !workItemIds.includes(item.id)));
      setSelectedItems(new Set());
      
      onWorkItemsChanged?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add items to sprint');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromSprint = async (workItemIds: string[]) => {
    setLoading(true);
    setError(null);
    
    try {
      // Remove selected items from sprint
      await Promise.all(
        workItemIds.map(id => sprintService.removeWorkItemFromSprint(sprint.id, id))
      );

      // Move items from sprint to available
      const itemsToMove = sprintWorkItems.filter(item => workItemIds.includes(item.id));
      const updatedItems = itemsToMove.map(item => ({ ...item, sprintId: undefined }));
      
      setAvailableWorkItems(prev => [...prev, ...updatedItems]);
      setSprintWorkItems(prev => prev.filter(item => !workItemIds.includes(item.id)));
      
      onWorkItemsChanged?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove items from sprint');
    } finally {
      setLoading(false);
    }
  };

  const calculateSprintPoints = () => {
    return sprintWorkItems.reduce((total, item) => total + (item.estimate || 0), 0);
  };

  const isOverCapacity = () => {
    return calculateSprintPoints() > sprint.capacity;
  };

  const canAddItems = sprint.status === 'planning' || sprint.status === 'active';
  const canRemoveItems = sprint.status === 'planning' || sprint.status === 'active';

  if (workItemsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loading size="large" />
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

      {/* Sprint Capacity Overview */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Sprint Capacity</h3>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              <span className="font-medium">{calculateSprintPoints()}</span> / {sprint.capacity} story points
            </div>
            {isOverCapacity() && (
              <div className="flex items-center text-red-600">
                <Icon name="alert-triangle" className="h-4 w-4 mr-1" />
                <span className="text-sm font-medium">Over capacity</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-300 ${
              isOverCapacity() ? 'bg-red-500' : 'bg-blue-600'
            }`}
            style={{ 
              width: `${Math.min((calculateSprintPoints() / sprint.capacity) * 100, 100)}%` 
            }}
          />
        </div>
        
        {isOverCapacity() && (
          <p className="text-sm text-red-600 mt-2">
            Sprint is over capacity by {calculateSprintPoints() - sprint.capacity} story points
          </p>
        )}
      </div>

      {/* Sprint Work Items */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Sprint Backlog ({sprintWorkItems.length} items)
            </h3>
            {canRemoveItems && sprintWorkItems.length > 0 && (
              <Button
                variant="secondary"
                size="small"
                onClick={() => {
                  const selectedIds = Array.from(selectedItems);
                  if (selectedIds.length > 0) {
                    handleRemoveFromSprint(selectedIds);
                  }
                }}
                disabled={selectedItems.size === 0 || loading}
              >
                <Icon name="minus" className="h-4 w-4 mr-1" />
                Remove Selected
              </Button>
            )}
          </div>
        </div>
        
        <div className="p-6">
          {sprintWorkItems.length === 0 ? (
            <div className="text-center py-8">
              <Icon name="list" className="h-8 w-8 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No work items in this sprint yet</p>
              <p className="text-sm text-gray-500 mt-1">
                Add items from the product backlog below
              </p>
            </div>
          ) : (
            <WorkItemList
              workItems={sprintWorkItems}
              onSelectionChange={setSelectedItems}
              selectedItems={selectedItems}
              showSelection={canRemoveItems}
              showDragHandle={false}
            />
          )}
        </div>
      </div>

      {/* Available Work Items (Product Backlog) */}
      {canAddItems && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Product Backlog ({availableWorkItems.length} items)
              </h3>
              {availableWorkItems.length > 0 && (
                <Button
                  onClick={() => {
                    const selectedIds = Array.from(selectedItems);
                    if (selectedIds.length > 0) {
                      handleAddToSprint(selectedIds);
                    }
                  }}
                  disabled={selectedItems.size === 0 || loading}
                  loading={loading}
                >
                  <Icon name="plus" className="h-4 w-4 mr-1" />
                  Add Selected to Sprint
                </Button>
              )}
            </div>
          </div>
          
          <div className="p-6">
            {availableWorkItems.length === 0 ? (
              <div className="text-center py-8">
                <Icon name="check-circle" className="h-8 w-8 text-green-400 mx-auto mb-3" />
                <p className="text-gray-600">All backlog items are assigned to sprints</p>
                <p className="text-sm text-gray-500 mt-1">
                  Create new work items to add them to this sprint
                </p>
              </div>
            ) : (
              <WorkItemList
                workItems={availableWorkItems}
                onSelectionChange={setSelectedItems}
                selectedItems={selectedItems}
                showSelection={true}
                showDragHandle={false}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};
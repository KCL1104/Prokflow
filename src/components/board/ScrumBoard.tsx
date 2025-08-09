import React, { useState, useMemo } from 'react';
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import type {
  DragEndEvent,
  DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Loading } from '../common/Loading';
import { Icon } from '../common/Icon';
import { Button } from '../ui/button';
import { BoardColumn } from './BoardColumn';
import { BoardFilters } from './BoardFilters';
import { SprintProgressIndicator } from './SprintProgressIndicator';
import { BurndownChart } from '../charts/BurndownChart';
import { useWorkItems } from '../../hooks/useWorkItems';
import { useSprints } from '../../hooks/useSprints';
import { useBoardFiltering } from '../../hooks/useBoardFiltering';
import { workItemService } from '../../services';
import { BoardWipLimitChecker } from '../../utils/wipLimitStrategy';
import { ErrorHandler } from '../../utils/errorHandling';
import type { WorkItem, WorkflowState } from '../../types';

// Constants for better maintainability
const DRAG_ACTIVATION_DISTANCE = 8;

interface ScrumBoardProps {
  projectId: string;
  workflowStates: WorkflowState[];
  onWorkItemUpdated?: (workItem: WorkItem) => void;
}

interface FilterOptions {
  assignee?: string[];
  priority?: WorkItem['priority'][];
  type?: WorkItem['type'][];
  labels?: string[];
  search?: string;
}

export const ScrumBoard: React.FC<ScrumBoardProps> = ({
  projectId,
  workflowStates,
  onWorkItemUpdated
}) => {
  const { workItems, loading: workItemsLoading, error: workItemsError, fetchBacklog } = useWorkItems(projectId);
  const { activeSprint, loading: sprintLoading, error: sprintError } = useSprints(projectId);
  const [draggedItem, setDraggedItem] = useState<WorkItem | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [showBurndown, setShowBurndown] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: DRAG_ACTIVATION_DISTANCE,
      },
    })
  );

  // Filter work items to only show those in the active sprint
  const sprintWorkItems = useMemo(() => {
    if (!activeSprint) return [];
    return workItems.filter(item =>
      activeSprint.workItems.includes(item.id)
    );
  }, [workItems, activeSprint]);

  // Use the shared filtering hook
  const { filteredWorkItems } = useBoardFiltering({
    workItems: sprintWorkItems,
    filters
  });

  // Group work items by status
  const workItemsByStatus = useMemo(() => {
    const grouped: Record<string, WorkItem[]> = {};

    // Initialize all workflow states
    workflowStates.forEach(state => {
      grouped[state.name] = [];
    });

    // Group filtered work items
    filteredWorkItems.forEach(item => {
      if (grouped[item.status]) {
        grouped[item.status].push(item);
      }
    });

    return grouped;
  }, [filteredWorkItems, workflowStates]);

  // Memoize done states to avoid recalculation
  const doneStates = useMemo(() =>
    workflowStates.filter(state => state.category === 'done').map(state => state.name),
    [workflowStates]
  );

  // Calculate sprint progress metrics
  const sprintMetrics = useMemo(() => {
    if (!activeSprint || sprintWorkItems.length === 0) {
      return {
        totalItems: 0,
        completedItems: 0,
        totalPoints: 0,
        completedPoints: 0,
        remainingPoints: 0,
        progressPercentage: 0
      };
    }

    const completedItems = sprintWorkItems.filter(item => doneStates.includes(item.status));

    const totalPoints = sprintWorkItems.reduce((sum, item) => sum + (item.estimate || 0), 0);
    const completedPoints = completedItems.reduce((sum, item) => sum + (item.estimate || 0), 0);
    const remainingPoints = totalPoints - completedPoints;
    const progressPercentage = totalPoints > 0 ? (completedPoints / totalPoints) * 100 : 0;

    return {
      totalItems: sprintWorkItems.length,
      completedItems: completedItems.length,
      totalPoints,
      completedPoints,
      remainingPoints,
      progressPercentage
    };
  }, [sprintWorkItems, doneStates, activeSprint]);

  // WIP limit checker
  const wipLimitChecker = useMemo(() =>
    new BoardWipLimitChecker(workflowStates, workItemsByStatus),
    [workflowStates, workItemsByStatus]
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const workItem = sprintWorkItems.find(item => item.id === active.id);
    setDraggedItem(workItem || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setDraggedItem(null);

    if (!over || active.id === over.id) return;

    const workItemId = active.id as string;
    const newStatus = over.id as string;

    // Find the work item being moved
    const workItem = sprintWorkItems.find(item => item.id === workItemId);
    if (!workItem || workItem.status === newStatus) return;

    // Check WIP limits before moving
    if (!wipLimitChecker.canAddItem(newStatus)) {
      const errorInfo = ErrorHandler.handleDragDropError(
        new Error('WIP limit exceeded'),
        workItemId,
        newStatus
      );
      console.warn(errorInfo.message);
      return;
    }

    setIsUpdating(true);
    try {
      const updatedItem = await workItemService.updateWorkItem(workItemId, {
        status: newStatus
      });

      onWorkItemUpdated?.(updatedItem);
      await fetchBacklog(projectId);
    } catch (error) {
      const errorInfo = ErrorHandler.handleDragDropError(error, workItemId, newStatus);
      console.error(errorInfo.message);
      // Could show a toast notification here
    } finally {
      setIsUpdating(false);
    }
  };

  const loading = workItemsLoading || sprintLoading;
  const error = workItemsError || sprintError;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loading size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4 shadow-xs">
        <div className="flex items-center">
          <Icon name="alert-circle" className="h-5 w-5 text-red-400 mr-2" />
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  if (!activeSprint) {
    return (
      <div className="text-center py-12">
        <Icon name="calendar" className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Sprint</h3>
        <p className="text-gray-600 mb-6">
          Create and start a sprint to use the Scrum board view.
        </p>
        <Button onClick={() => window.location.href = `/projects/${projectId}/sprints`}>
          Manage Sprints
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sprint Header */}
      <div className="bg-white border border-gray-200 rounded-md p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{activeSprint.name}</h2>
            <p className="text-gray-600 mt-1">{activeSprint.goal}</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowBurndown(!showBurndown)}
            >
              <Icon name="bar-chart" className="h-4 w-4 mr-2" />
              {showBurndown ? 'Hide' : 'Show'} Burndown
            </Button>
            {isUpdating && (
              <div className="flex items-center text-primary-600">
                <Loading size="small" />
                <span className="text-sm">Updating...</span>
              </div>
            )}
            <button
              onClick={() => fetchBacklog(projectId)}
              className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-150"
            >
              <Icon name="refresh" className="h-4 w-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {/* Sprint Progress Indicator */}
        <SprintProgressIndicator
          sprint={activeSprint}
          metrics={sprintMetrics}
        />
      </div>

      {/* Burndown Chart */}
      {showBurndown && (
        <div className="bg-white border border-gray-200 rounded-md p-6 shadow-xs">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sprint Burndown</h3>
          <BurndownChart
            sprintId={activeSprint.id}
            sprintName={activeSprint.name}
          />
        </div>
      )}

      {/* Filters */}
      <BoardFilters
        filters={filters}
        onFiltersChange={setFilters}
        workItems={sprintWorkItems}
      />

      {/* Scrum Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex space-x-6 overflow-x-auto pb-6">
          {workflowStates.map(state => (
            <SortableContext
              key={state.id}
              id={state.name}
              items={workItemsByStatus[state.name]?.map(item => item.id) || []}
              strategy={verticalListSortingStrategy}
            >
              <BoardColumn
                state={state}
                workItems={workItemsByStatus[state.name] || []}
                wipLimitStatus={wipLimitChecker.checkStatus(state.name)}
                isDraggedOver={draggedItem !== null}
              />
            </SortableContext>
          ))}
        </div>
      </DndContext>

      {/* Empty State */}
      {filteredWorkItems.length === 0 && (
        <div className="text-center py-12">
          <Icon name="list" className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {sprintWorkItems.length === 0 ? 'No work items in sprint' : 'No matching items'}
          </h3>
          <p className="text-gray-600 mb-6">
            {sprintWorkItems.length === 0
              ? 'Add work items to this sprint from the backlog.'
              : 'Try adjusting your filters to see more items.'
            }
          </p>
          {sprintWorkItems.length === 0 && (
            <Button onClick={() => window.location.href = `/projects/${projectId}/backlog`}>
              Go to Backlog
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
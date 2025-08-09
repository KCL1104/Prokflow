import React, { useState, useMemo } from 'react';
import {
  DndContext,
<<<<<<< HEAD
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import type {
  DragEndEvent,
  DragStartEvent,
} from '@dnd-kit/core';
=======
  closestCorners,
} from '@dnd-kit/core';
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Loading } from '../common/Loading';
import { Icon } from '../common/Icon';
import { BoardColumn } from './BoardColumn';
import { BoardFilters } from './BoardFilters';
import { useWorkItems } from '../../hooks/useWorkItems';
<<<<<<< HEAD
import { workItemService } from '../../services';
import type { WorkItem, WorkflowState } from '../../types';

// Constants for better maintainability
const DRAG_ACTIVATION_DISTANCE = 8;
const WIP_LIMIT_STATUS = {
  NORMAL: 'normal',
  AT_LIMIT: 'at-limit',
  EXCEEDED: 'exceeded',
} as const;

=======
import { useBoardFiltering } from '../../hooks/useBoardFiltering';
import { useBoardDragDrop } from '../../hooks/useBoardDragDrop';
import type { WorkItem, WorkflowState } from '../../types';

>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
interface KanbanBoardProps {
  projectId: string;
  workflowStates: WorkflowState[];
  onWorkItemUpdated?: (workItem: WorkItem) => void;
}

interface FilterOptions {
  assignee?: string[];
<<<<<<< HEAD
  priority?: string[];
  type?: string[];
=======
  priority?: WorkItem['priority'][];
  type?: WorkItem['type'][];
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
  labels?: string[];
  search?: string;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  projectId,
  workflowStates,
  onWorkItemUpdated
}) => {
  const { workItems, loading, error, fetchBacklog } = useWorkItems(projectId);
<<<<<<< HEAD
  const [draggedItem, setDraggedItem] = useState<WorkItem | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [isUpdating, setIsUpdating] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: DRAG_ACTIVATION_DISTANCE,
      },
    })
  );

  // Optimized filtering with early returns and memoized filter functions
  const filterFunctions = useMemo(() => {
    const searchFilter = (item: WorkItem): boolean => {
      if (!filters.search) return true;
      const searchLower = filters.search.toLowerCase();
      return item.title.toLowerCase().includes(searchLower) ||
             (item.description?.toLowerCase().includes(searchLower) ?? false);
    };

    const assigneeFilter = (item: WorkItem): boolean => {
      return !filters.assignee?.length || 
             (item.assigneeId && filters.assignee.includes(item.assigneeId));
    };

    const priorityFilter = (item: WorkItem): boolean => {
      return !filters.priority?.length || filters.priority.includes(item.priority);
    };

    const typeFilter = (item: WorkItem): boolean => {
      return !filters.type?.length || filters.type.includes(item.type);
    };

    const labelsFilter = (item: WorkItem): boolean => {
      return !filters.labels?.length || 
             filters.labels.some(label => item.labels.includes(label));
    };

    return { searchFilter, assigneeFilter, priorityFilter, typeFilter, labelsFilter };
  }, [filters]);

  const filteredWorkItems = useMemo(() => {
    const { searchFilter, assigneeFilter, priorityFilter, typeFilter, labelsFilter } = filterFunctions;
    
    return workItems.filter(item =>
      searchFilter(item) &&
      assigneeFilter(item) &&
      priorityFilter(item) &&
      typeFilter(item) &&
      labelsFilter(item)
    );
  }, [workItems, filterFunctions]);

  // Group work items by status
  const workItemsByStatus = useMemo(() => {
    const grouped: Record<string, WorkItem[]> = {};
    
=======
  const [filters, setFilters] = useState<FilterOptions>({});

  // Use the shared filtering hook
  const { filteredWorkItems } = useBoardFiltering({
    workItems,
    filters
  });

  // Group work items by status with optimized grouping
  const workItemsByStatus = useMemo(() => {
    const grouped: Record<string, WorkItem[]> = {};

>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
    // Initialize all workflow states
    workflowStates.forEach(state => {
      grouped[state.name] = [];
    });

<<<<<<< HEAD
    // Group filtered work items
    filteredWorkItems.forEach(item => {
      if (grouped[item.status]) {
        grouped[item.status].push(item);
=======
    // Group filtered work items in single pass
    filteredWorkItems.forEach(item => {
      const statusGroup = grouped[item.status];
      if (statusGroup) {
        statusGroup.push(item);
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
      }
    });

    return grouped;
  }, [filteredWorkItems, workflowStates]);

<<<<<<< HEAD
  // Check WIP limits
  const getWipLimitStatus = (stateName: string) => {
    const state = workflowStates.find(s => s.name === stateName);
    if (!state?.wipLimit) return WIP_LIMIT_STATUS.NORMAL;
    
    const itemCount = workItemsByStatus[stateName]?.length || 0;
    if (itemCount > state.wipLimit) return WIP_LIMIT_STATUS.EXCEEDED;
    if (itemCount === state.wipLimit) return WIP_LIMIT_STATUS.AT_LIMIT;
    return WIP_LIMIT_STATUS.NORMAL;
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const workItem = workItems.find(item => item.id === active.id);
    setDraggedItem(workItem || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setDraggedItem(null);

    if (!over || active.id === over.id) return;

    const workItemId = active.id as string;
    const newStatus = over.id as string;

    // Find the work item being moved
    const workItem = workItems.find(item => item.id === workItemId);
    if (!workItem || workItem.status === newStatus) return;

    // Check WIP limits before moving
    const targetState = workflowStates.find(s => s.name === newStatus);
    if (targetState?.wipLimit) {
      const currentCount = workItemsByStatus[newStatus]?.length || 0;
      if (currentCount >= targetState.wipLimit) {
        // Show error or warning about WIP limit
        console.warn(`Cannot move item: WIP limit (${targetState.wipLimit}) reached for ${newStatus}`);
        return;
      }
    }

    setIsUpdating(true);
    try {
      const updatedItem = await workItemService.updateWorkItem(workItemId, {
        status: newStatus
      });
      
      onWorkItemUpdated?.(updatedItem);
      await fetchBacklog(projectId);
    } catch (error) {
      console.error('Failed to update work item status:', error);
      // Could show a toast notification here
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDragOver = () => {
    // This can be used for visual feedback during drag
  };
=======
  // Use shared drag-and-drop logic
  const {
    sensors,
    draggedItem,
    isUpdating,
    wipLimitChecker,
    handleDragStart,
    handleDragEnd
  } = useBoardDragDrop({
    workItems,
    workflowStates,
    workItemsByStatus,
    onWorkItemUpdated,
    onRefresh: () => fetchBacklog(projectId)
  });
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loading size="large" />
      </div>
    );
  }

  if (error) {
    return (
<<<<<<< HEAD
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
=======
      <div className="bg-red-50 border-2 border-red-300 rounded-md p-4">
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
        <div className="flex items-center">
          <Icon name="alert-circle" className="h-5 w-5 text-red-400 mr-2" />
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Board Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Kanban Board</h2>
          <p className="text-gray-600 mt-1">
            Drag and drop work items to update their status
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {isUpdating && (
            <div className="flex items-center text-blue-600">
              <Loading size="small" />
              <span className="text-sm">Updating...</span>
            </div>
          )}
          <button
            onClick={() => fetchBacklog(projectId)}
            className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <Icon name="refresh" className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <BoardFilters
        filters={filters}
        onFiltersChange={setFilters}
        workItems={workItems}
      />

      {/* Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
<<<<<<< HEAD
        onDragOver={handleDragOver}
=======
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
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
<<<<<<< HEAD
                wipLimitStatus={getWipLimitStatus(state.name)}
=======
                wipLimitStatus={wipLimitChecker.checkStatus(state.name)}
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
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
            {workItems.length === 0 ? 'No work items yet' : 'No matching items'}
          </h3>
          <p className="text-gray-600 mb-6">
<<<<<<< HEAD
            {workItems.length === 0 
=======
            {workItems.length === 0
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
              ? 'Create work items in the backlog to see them on the board.'
              : 'Try adjusting your filters to see more items.'
            }
          </p>
        </div>
      )}
    </div>
  );
};
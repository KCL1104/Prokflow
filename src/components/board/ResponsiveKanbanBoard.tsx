import { useState, useMemo } from 'react';
import {
  DndContext,
  closestCorners,
  DragOverlay,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Loading } from '../common/Loading';
import { Icon } from '../common/Icon';
import { Button } from '../ui/button';
import { BoardColumn } from './BoardColumn';
import { BoardCard } from './BoardCard';
import { BoardFilters } from './BoardFilters';
import { useWorkItems } from '../../hooks/useWorkItems';
import { useBoardFiltering } from '../../hooks/useBoardFiltering';
import { useBoardDragDrop } from '../../hooks/useBoardDragDrop';
import { useResponsive, useTouchDevice } from '../../hooks/useResponsive';
import { ResponsiveContainer, ResponsiveStack } from '../layout/ResponsiveLayout';
import type { WorkItem, WorkflowState } from '../../types';

interface ResponsiveKanbanBoardProps {
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

export function ResponsiveKanbanBoard({
  projectId,
  workflowStates,
  onWorkItemUpdated
}: ResponsiveKanbanBoardProps) {
  const { workItems, loading, error, fetchBacklog } = useWorkItems(projectId);
  const { isMobile, isTablet } = useResponsive();
  const isTouchDevice = useTouchDevice();
  const [filters, setFilters] = useState<FilterOptions>({});
  const [selectedColumn, setSelectedColumn] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Use the shared filtering hook
  const { filteredWorkItems } = useBoardFiltering({
    workItems,
    filters
  });

  // Group work items by status
  const workItemsByStatus = useMemo(() => {
    const grouped: Record<string, WorkItem[]> = {};

    workflowStates.forEach(state => {
      grouped[state.name] = [];
    });

    filteredWorkItems.forEach(item => {
      const statusGroup = grouped[item.status];
      if (statusGroup) {
        statusGroup.push(item);
      }
    });

    return grouped;
  }, [filteredWorkItems, workflowStates]);

  // Use shared drag-and-drop logic with touch optimizations
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

  if (loading) {
    return (
      <ResponsiveContainer>
        <div className="flex items-center justify-center py-12">
          <Loading size="large" />
        </div>
      </ResponsiveContainer>
    );
  }

  if (error) {
    return (
      <ResponsiveContainer>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex items-center">
            <Icon name="alert-circle" className="h-5 w-5 text-red-400 mr-2" />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      </ResponsiveContainer>
    );
  }

  // Mobile view with column selection
  if (isMobile) {
    return (
      <div className="space-y-4">
        {/* Mobile Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Board</h2>
            <p className="text-sm text-gray-600">
              {filteredWorkItems.length} items
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center"
            >
              <Icon name="filter" size="sm" className="mr-1" />
              Filter
            </Button>
            
            <Button
              variant="secondary"
              size="sm"
              onClick={() => fetchBacklog(projectId)}
              disabled={isUpdating}
            >
              <Icon name="refresh" size="sm" />
            </Button>
          </div>
        </div>

        {/* Mobile Filters */}
        {showFilters && (
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <BoardFilters
              filters={filters}
              onFiltersChange={setFilters}
              workItems={workItems}
              compact={true}
            />
          </div>
        )}

        {/* Column Selector */}
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {workflowStates.map(state => {
            const itemCount = workItemsByStatus[state.name]?.length || 0;
            const isSelected = selectedColumn === state.name;
            
            return (
              <button
                key={state.id}
                onClick={() => setSelectedColumn(isSelected ? null : state.name)}
                className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isSelected
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: state.color }}
                  />
                  <span>{state.name}</span>
                  <span className={`px-2 py-0.5 text-xs rounded-full ${
                    isSelected ? 'bg-blue-500' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {itemCount}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Column Content */}
        {selectedColumn ? (
          <div className="space-y-3">
            {workItemsByStatus[selectedColumn]?.map(workItem => (
              <div key={workItem.id} className="bg-white rounded-lg border border-gray-200">
                <BoardCard workItem={workItem} />
              </div>
            ))}
            
            {workItemsByStatus[selectedColumn]?.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Icon name="folder" size="lg" className="mx-auto mb-2 text-gray-300" />
                <p>No items in this column</p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Icon name="layers" size="lg" className="mx-auto mb-2 text-gray-300" />
            <p>Select a column to view items</p>
          </div>
        )}
      </div>
    );
  }

  // Tablet and Desktop view
  return (
    <div className="space-y-6">
      {/* Board Header */}
      <ResponsiveStack
        direction={{ base: 'column', md: 'row' }}
        justify="between"
        align="start"
        spacing={4}
      >
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Kanban Board</h2>
          <p className="text-gray-600 mt-1">
            {isTouchDevice ? 'Tap and hold to drag items' : 'Drag and drop work items to update their status'}
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          {isUpdating && (
            <div className="flex items-center text-blue-600">
              <Loading size="small" />
              <span className="text-sm ml-2">Updating...</span>
            </div>
          )}
          <Button
            variant="secondary"
            onClick={() => fetchBacklog(projectId)}
            className="flex items-center"
          >
            <Icon name="refresh" className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </ResponsiveStack>

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
      >
        <div className={`
          flex gap-6 overflow-x-auto pb-6
          ${isTablet ? 'gap-4' : 'gap-6'}
        `}>
          {workflowStates.map(state => (
            <SortableContext
              key={state.id}
              id={state.name}
              items={workItemsByStatus[state.name]?.map(item => item.id) || []}
              strategy={verticalListSortingStrategy}
            >
              <div className={isTablet ? 'min-w-72' : 'min-w-80'}>
                <BoardColumn
                  state={state}
                  workItems={workItemsByStatus[state.name] || []}
                  wipLimitStatus={wipLimitChecker.checkStatus(state.name)}
                  isDraggedOver={draggedItem !== null}
                  compact={isTablet}
                />
              </div>
            </SortableContext>
          ))}
        </div>

        {/* Drag Overlay */}
        <DragOverlay
          dropAnimation={{
            sideEffects: defaultDropAnimationSideEffects({
              styles: {
                active: {
                  opacity: '0.5',
                },
              },
            }),
          }}
        >
          {draggedItem && <BoardCard workItem={draggedItem} isDragging />}
        </DragOverlay>
      </DndContext>

      {/* Empty State */}
      {filteredWorkItems.length === 0 && (
        <div className="text-center py-12">
          <Icon name="list" className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {workItems.length === 0 ? 'No work items yet' : 'No matching items'}
          </h3>
          <p className="text-gray-600 mb-6">
            {workItems.length === 0
              ? 'Create work items in the backlog to see them on the board.'
              : 'Try adjusting your filters to see more items.'
            }
          </p>
        </div>
      )}
    </div>
  );
}
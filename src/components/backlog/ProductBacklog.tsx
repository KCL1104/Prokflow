import React, { useState, useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import {
  restrictToVerticalAxis,
  restrictToParentElement,
} from '@dnd-kit/modifiers';
import { CSS } from '@dnd-kit/utilities';
import { WorkItemCard } from '../work-items/WorkItemCard';
import { WorkItemForm } from '../work-items/WorkItemForm';
<<<<<<< HEAD
import { Button } from '../common/Button';
=======
import { Button } from '../ui/button';
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
import { Modal } from '../common/Modal';
import { Loading } from '../common/Loading';
import { BulkEditModal } from './BulkEditModal';
import { EstimationModal } from './EstimationModal';
import { BacklogFilterBar } from './BacklogFilterBar';
import { useBacklogFiltering } from '../../hooks/useBacklogFiltering';
import { useBacklogModals } from '../../hooks/useBacklogModals';
import { useBacklogOperations } from '../../hooks/useBacklogOperations';

import type { WorkItem, TeamMember, WorkItemFormData } from '../../types';

interface ProductBacklogProps {
  projectId: string;
  workItems: WorkItem[];
  teamMembers: TeamMember[];
  isLoading?: boolean;
  onCreateWorkItem: (data: WorkItemFormData) => Promise<void>;
  onUpdateWorkItem: (id: string, data: Partial<WorkItem>) => Promise<void>;
  onDeleteWorkItem: (id: string) => Promise<void>;
  onReorderWorkItems: (workItemIds: string[]) => Promise<void>;
  onBulkUpdate: (workItemIds: string[], updates: Partial<WorkItem>) => Promise<void>;
}





export const ProductBacklog: React.FC<ProductBacklogProps> = ({
  projectId,
  workItems,
  teamMembers,
  isLoading = false,
  onCreateWorkItem,
  onUpdateWorkItem,
  onDeleteWorkItem,
  onReorderWorkItems,
  onBulkUpdate
}) => {
  // Custom hooks for separation of concerns
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const modals = useBacklogModals();
  const { filteredWorkItems, filterState, filterActions } = useBacklogFiltering({ workItems });
  const operations = useBacklogOperations({
    onReorderWorkItems,
    onBulkUpdate,
    onUpdateWorkItem,
    onDeleteWorkItem
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Event handlers
  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    await operations.handleDragEnd(event, filteredWorkItems);
  }, [operations, filteredWorkItems]);

  const handleSelectItem = useCallback((itemId: string, selected: boolean) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(itemId);
      } else {
        newSet.delete(itemId);
      }
      return newSet;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedItems.size === filteredWorkItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredWorkItems.map(item => item.id)));
    }
  }, [filteredWorkItems, selectedItems.size]);

  const handleBulkEdit = useCallback(async (updates: Partial<WorkItem>) => {
    try {
      await onBulkUpdate(Array.from(selectedItems), updates);
      setSelectedItems(new Set());
      modals.closeBulkEditModal();
    } catch (error) {
      console.error('Failed to bulk update work items:', error);
    }
  }, [selectedItems, onBulkUpdate, modals]);

  const handleEstimateStoryPoints = useCallback((workItem: WorkItem) => {
    modals.openEstimationModal(workItem);
  }, [modals]);

  const handleEstimationSubmit = useCallback(async (estimate: number) => {
    if (!modals.estimationWorkItem) return;

    try {
      await onUpdateWorkItem(modals.estimationWorkItem.id, { estimate });
      modals.closeEstimationModal();
    } catch (error) {
      console.error('Failed to update story points:', error);
    }
<<<<<<< HEAD
  }, [modals.estimationWorkItem, onUpdateWorkItem, modals]);
=======
  }, [onUpdateWorkItem, modals]);
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)

  const handleDeleteItem = useCallback(async (workItem: WorkItem) => {
    if (window.confirm(`Are you sure you want to delete "${workItem.title}"?`)) {
      try {
        await onDeleteWorkItem(workItem.id);
      } catch (error) {
        console.error('Failed to delete work item:', error);
      }
    }
  }, [onDeleteWorkItem]);

  // Early return for loading state
  if (isLoading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-center">
          <Loading />
        </div>
      </div>
    );
  }

  return (
<<<<<<< HEAD
    <div className="bg-white shadow rounded-lg">
=======
    <div className="bg-white shadow-xs rounded-md">
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium text-gray-900">Product Backlog</h2>
            <p className="mt-1 text-sm text-gray-600">
              {filteredWorkItems.length} of {workItems.length} items
              {selectedItems.size > 0 && ` • ${selectedItems.size} selected`}
            </p>
          </div>
          <div className="flex space-x-3">
            {selectedItems.size > 0 && (
              <Button
                variant="secondary"
                onClick={modals.openBulkEditModal}
              >
                Bulk Edit ({selectedItems.size})
              </Button>
            )}
            <Button
              variant="primary"
              onClick={modals.openCreateModal}
            >
              Add Work Item
            </Button>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <BacklogFilterBar
        searchTerm={filterState.searchTerm}
        typeFilter={filterState.typeFilter}
        priorityFilter={filterState.priorityFilter}
        assigneeFilter={filterState.assigneeFilter}
        teamMembers={teamMembers}
        onSearchChange={filterActions.setSearchTerm}
        onTypeFilterChange={filterActions.setTypeFilter}
        onPriorityFilterChange={filterActions.setPriorityFilter}
        onAssigneeFilterChange={filterActions.setAssigneeFilter}
        selectedCount={selectedItems.size}
        totalCount={filteredWorkItems.length}
        onSelectAll={handleSelectAll}
        isAllSelected={selectedItems.size === filteredWorkItems.length && filteredWorkItems.length > 0}
      />

      {/* Backlog Items */}
      <div className="p-6">
        {filteredWorkItems.length === 0 ? (
          <EmptyState
            hasFilters={!!filterState.searchTerm || filterState.typeFilter !== 'all' || filterState.priorityFilter !== 'all' || filterState.assigneeFilter !== 'all'}
            onCreateNew={modals.openCreateModal}
          />
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToVerticalAxis, restrictToParentElement]}
          >
            <SortableContext
              items={filteredWorkItems.map(item => item.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {filteredWorkItems.map((workItem) => (
                  <BacklogItemCard
                    key={workItem.id}
                    workItem={workItem}
                    teamMembers={teamMembers}
                    isSelected={selectedItems.has(workItem.id)}
                    onSelect={(selected) => handleSelectItem(workItem.id, selected)}
                    onEdit={(item) => onUpdateWorkItem(workItem.id, item)}
                    onDelete={() => handleDeleteItem(workItem)}
                    onEstimate={() => handleEstimateStoryPoints(workItem)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Modals */}
      <Modal
        isOpen={modals.isCreateModalOpen}
        onClose={modals.closeCreateModal}
        title="Create Work Item"
        size="large"
      >
        <WorkItemForm
          projectId={projectId}
          teamMembers={teamMembers}
          onSubmit={onCreateWorkItem}
          onCancel={modals.closeCreateModal}
          submitLabel="Create Work Item"
        />
      </Modal>

      <BulkEditModal
        isOpen={modals.isBulkEditModalOpen}
        onClose={modals.closeBulkEditModal}
        selectedCount={selectedItems.size}
        teamMembers={teamMembers}
        onSubmit={handleBulkEdit}
      />

      <EstimationModal
        isOpen={modals.isEstimationModalOpen}
        onClose={modals.closeEstimationModal}
        workItem={modals.estimationWorkItem}
        onSubmit={handleEstimationSubmit}
      />
    </div>
  );
};

// Extracted Empty State Component for better readability
interface EmptyStateProps {
  hasFilters: boolean;
  onCreateNew: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ hasFilters, onCreateNew }) => (
  <div className="text-center py-8">
    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
    <h3 className="mt-2 text-sm font-medium text-gray-900">
      {hasFilters ? 'No matching items' : 'No backlog items'}
    </h3>
    <p className="mt-1 text-sm text-gray-500">
      {hasFilters
        ? 'Try adjusting your search or filters.'
        : 'Get started by creating your first work item.'
      }
    </p>
    {!hasFilters && (
      <div className="mt-6">
        <Button variant="primary" onClick={onCreateNew}>
          Add Work Item
        </Button>
      </div>
    )}
  </div>
);

// Separate component for individual backlog item cards
interface BacklogItemCardProps {
  workItem: WorkItem;
  teamMembers: TeamMember[];
  isSelected: boolean;
  onSelect: (selected: boolean) => void;
  onEdit: (workItem: Partial<WorkItem>) => void;
  onDelete: () => void;
  onEstimate: () => void;
}

const BacklogItemCard: React.FC<BacklogItemCardProps> = React.memo(({
  workItem,
  teamMembers,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  onEstimate
}) => {
  return (
    <SortableBacklogItem
      id={workItem.id}
      workItem={workItem}
      teamMembers={teamMembers}
      isSelected={isSelected}
      onSelect={onSelect}
      onEdit={onEdit}
      onDelete={onDelete}
      onEstimate={onEstimate}
    />
  );
});

BacklogItemCard.displayName = 'BacklogItemCard';

// Sortable wrapper component
interface SortableBacklogItemProps extends BacklogItemCardProps {
  id: string;
}

const SortableBacklogItem: React.FC<SortableBacklogItemProps> = ({
  id,
  workItem,
  teamMembers,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  onEstimate
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white border rounded-lg p-4 hover:shadow-md transition-shadow ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
        } ${isDragging ? 'shadow-lg opacity-50' : ''}`}
    >
      <div className="flex items-start space-x-3">
        {/* Selection checkbox */}
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onSelect(e.target.checked)}
          className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />

        {/* Drag handle */}
        <div
          {...attributes}
          {...listeners}
          className="mt-1 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
          role="button"
          aria-label={`Drag to reorder ${workItem.title}. Use arrow keys to move up or down.`}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              // Handle keyboard activation
            }
          }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
          </svg>
        </div>

        {/* Work item content */}
        <div className="flex-1 min-w-0">
          <WorkItemCard
            workItem={workItem}
            teamMembers={teamMembers}
            onEdit={() => onEdit(workItem)}
            onDelete={onDelete}
            showActions={true}
            compact={false}
          />

          {/* Estimation button for stories */}
          {workItem.type === 'story' && (
            <div className="mt-2 flex items-center space-x-2">
              <Button
                variant="secondary"
<<<<<<< HEAD
                size="small"
=======
                size="sm"
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
                onClick={onEstimate}
              >
                {workItem.estimate ? `${workItem.estimate} points` : 'Estimate'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
<<<<<<< HEAD
};    
=======
};
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)

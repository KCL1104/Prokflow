import { useCallback } from 'react';
import { arrayMove } from '@dnd-kit/sortable';
import type { DragEndEvent } from '@dnd-kit/core';
import type { WorkItem } from '../types';

interface UseBacklogOperationsProps {
  workItems: WorkItem[];
  onReorderWorkItems: (workItemIds: string[]) => Promise<void>;
  onBulkUpdate: (workItemIds: string[], updates: Partial<WorkItem>) => Promise<void>;
  onUpdateWorkItem: (id: string, data: Partial<WorkItem>) => Promise<void>;
  onDeleteWorkItem: (id: string) => Promise<void>;
}

export const useBacklogOperations = ({
  onReorderWorkItems,
  onBulkUpdate,
  onUpdateWorkItem,
  onDeleteWorkItem
}: Omit<UseBacklogOperationsProps, 'workItems'>) => {
  const handleDragEnd = useCallback(async (event: DragEndEvent, filteredWorkItems: WorkItem[]) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeId = String(active.id);
    const overId = String(over.id);
    const oldIndex = filteredWorkItems.findIndex(item => item.id === activeId);
    const newIndex = filteredWorkItems.findIndex(item => item.id === overId);

    if (oldIndex === -1 || newIndex === -1) return;

    const reorderedItems = arrayMove(filteredWorkItems, oldIndex, newIndex);
    const newOrder = reorderedItems.map(item => item.id);

    try {
      await onReorderWorkItems(newOrder);
    } catch (error) {
      console.error('Failed to reorder work items:', error);
    }
  }, [onReorderWorkItems]);

  const handleBulkEdit = useCallback(async (selectedItems: Set<string>, updates: Partial<WorkItem>) => {
    try {
      await onBulkUpdate(Array.from(selectedItems), updates);
    } catch (error) {
      console.error('Failed to bulk update work items:', error);
      throw error;
    }
  }, [onBulkUpdate]);

  const handleEstimationSubmit = useCallback(async (workItem: WorkItem, estimate: number) => {
    try {
      await onUpdateWorkItem(workItem.id, { estimate });
    } catch (error) {
      console.error('Failed to update story points:', error);
      throw error;
    }
  }, [onUpdateWorkItem]);

  const handleDeleteItem = useCallback(async (workItem: WorkItem) => {
    if (window.confirm(`Are you sure you want to delete "${workItem.title}"?`)) {
      try {
        await onDeleteWorkItem(workItem.id);
      } catch (error) {
        console.error('Failed to delete work item:', error);
      }
    }
  }, [onDeleteWorkItem]);

  return {
    handleDragEnd,
    handleBulkEdit,
    handleEstimationSubmit,
    handleDeleteItem
  };
};
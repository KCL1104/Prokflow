import { useState } from 'react';
import { useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { workItemService } from '../services';
import { BoardWipLimitChecker } from '../utils/wipLimitStrategy';
import { ErrorHandler } from '../utils/errorHandling';
import type { WorkItem, WorkflowState } from '../types';

// Constants for better maintainability
const DRAG_ACTIVATION_DISTANCE = 8;

interface UseBoardDragDropProps {
  workItems: WorkItem[];
  workflowStates: WorkflowState[];
  workItemsByStatus: Record<string, WorkItem[]>;
  onWorkItemUpdated?: (workItem: WorkItem) => void;
  onRefresh: () => Promise<void>;
}

export const useBoardDragDrop = ({
  workItems,
  workflowStates,
  workItemsByStatus,
  onWorkItemUpdated,
  onRefresh
}: Omit<UseBoardDragDropProps, 'projectId'>) => {
  const [draggedItem, setDraggedItem] = useState<WorkItem | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: DRAG_ACTIVATION_DISTANCE,
      },
    })
  );

  const wipLimitChecker = new BoardWipLimitChecker(workflowStates, workItemsByStatus);

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
      await onRefresh();
    } catch (error) {
      const errorInfo = ErrorHandler.handleDragDropError(error, workItemId, newStatus);
      console.error(errorInfo.message);
      // Could show a toast notification here
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    sensors,
    draggedItem,
    isUpdating,
    wipLimitChecker,
    handleDragStart,
    handleDragEnd
  };
};
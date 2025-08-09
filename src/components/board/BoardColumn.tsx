import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Icon } from '../common/Icon';
import { BoardCard } from './BoardCard';
import type { WorkflowState, WorkItem } from '../../types';

interface BoardColumnProps {
  state: WorkflowState;
  workItems: WorkItem[];
  wipLimitStatus: 'normal' | 'at-limit' | 'exceeded';
  isDraggedOver: boolean;
<<<<<<< HEAD
=======
  compact?: boolean;
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
}

export const BoardColumn: React.FC<BoardColumnProps> = ({
  state,
  workItems,
  wipLimitStatus,
  isDraggedOver
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: state.name,
  });

  const getColumnHeaderColor = () => {
    if (wipLimitStatus === 'exceeded') return 'bg-red-100 border-red-300';
    if (wipLimitStatus === 'at-limit') return 'bg-yellow-100 border-yellow-300';
<<<<<<< HEAD
    return 'bg-gray-50 border-gray-200';
=======
    return 'bg-white border-gray-300';
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
  };

  const getWipLimitColor = () => {
    if (wipLimitStatus === 'exceeded') return 'text-red-600';
    if (wipLimitStatus === 'at-limit') return 'text-yellow-600';
    return 'text-gray-500';
  };

  const getWipLimitIcon = () => {
    if (wipLimitStatus === 'exceeded') return 'alert-triangle';
    if (wipLimitStatus === 'at-limit') return 'alert-circle';
    return 'info';
  };

  return (
    <div className="flex-shrink-0 w-80">
      {/* Column Header */}
      <div className={`p-4 rounded-t-lg border-2 ${getColumnHeaderColor()}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <div
              className="w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: state.color }}
            />
            <h3 className="font-semibold text-gray-900">{state.name}</h3>
          </div>
          <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded-full">
            {workItems.length}
          </span>
        </div>

        {/* WIP Limit Indicator */}
        {state.wipLimit && (
          <div className={`flex items-center text-xs ${getWipLimitColor()}`}>
            <Icon name={getWipLimitIcon()} className="h-3 w-3 mr-1" />
            <span>
              WIP Limit: {workItems.length}/{state.wipLimit}
              {wipLimitStatus === 'exceeded' && ' (Exceeded!)'}
              {wipLimitStatus === 'at-limit' && ' (At Limit)'}
            </span>
          </div>
        )}
      </div>

      {/* Column Content */}
      <div
        ref={setNodeRef}
<<<<<<< HEAD
        className={`min-h-96 p-4 bg-gray-50 border-2 border-t-0 rounded-b-lg transition-colors ${
          isOver ? 'bg-blue-50 border-blue-300' : 'border-gray-200'
=======
        className={`min-h-96 p-4 bg-white border-2 border-t-0 rounded-b-lg transition-colors ${
          isOver ? 'bg-blue-50 border-blue-300' : 'border-gray-300'
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
        }`}
      >
        <SortableContext
          items={workItems.map(item => item.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {workItems.map(workItem => (
              <BoardCard
                key={workItem.id}
                workItem={workItem}
                isDragging={false}
              />
            ))}
          </div>
        </SortableContext>

        {/* Empty State */}
        {workItems.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-gray-400">
            <Icon name="plus-circle" className="h-8 w-8 mb-2" />
            <p className="text-sm">Drop items here</p>
          </div>
        )}

        {/* Drop Zone Indicator */}
        {isOver && isDraggedOver && (
          <div className="mt-3 p-3 border-2 border-dashed border-blue-300 rounded-md bg-blue-50">
            <p className="text-sm text-blue-600 text-center">
              Drop to move to {state.name}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
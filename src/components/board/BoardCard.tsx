import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Icon, type IconName } from '../common/Icon';
import type { WorkItem } from '../../types';

interface BoardCardProps {
  workItem: WorkItem;
  isDragging?: boolean;
}

export const BoardCard: React.FC<BoardCardProps> = ({
  workItem,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: workItem.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getPriorityColor = (priority: WorkItem['priority']): string => {
    const priorityColors = {
      critical: 'text-red-600 bg-red-100',
      high: 'text-orange-600 bg-orange-100',
      medium: 'text-yellow-600 bg-yellow-100',
      low: 'text-green-600 bg-green-100',
    } as const;
    
    return priorityColors[priority] || 'text-gray-600 bg-gray-100';
  };

  const getTypeIcon = (type: WorkItem['type']): IconName => {
    const typeIcons = {
      story: 'book-open',
      task: 'check-square',
      bug: 'bug',
      epic: 'layers',
    } as const;
    
    return typeIcons[type] || 'circle';
  };

  const getTypeColor = (type: WorkItem['type']): string => {
    const typeColors = {
      story: 'text-blue-600',
      task: 'text-green-600',
      bug: 'text-red-600',
      epic: 'text-purple-600',
    } as const;
    
    return typeColors[type] || 'text-gray-600';
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
<<<<<<< HEAD
      className={`bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing ${
        isSortableDragging ? 'opacity-50 rotate-2 scale-105' : ''
=======
      className={`bg-warm-25 rounded-md border-2 border-default p-4 shadow-xs hover:shadow-sm hover:border-medium transition-all duration-150 cursor-grab active:cursor-grabbing ${
        isSortableDragging ? 'opacity-60' : ''
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
      }`}
    >
      {/* Card Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Icon 
            name={getTypeIcon(workItem.type)} 
            className={`h-4 w-4 ${getTypeColor(workItem.type)}`} 
          />
<<<<<<< HEAD
          <span className="text-xs text-gray-500 uppercase tracking-wide">
            {workItem.type}
          </span>
        </div>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(workItem.priority)}`}>
=======
          <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">
            {workItem.type}
          </span>
        </div>
        <span className={`px-2 py-1 text-xs font-medium rounded-md ${getPriorityColor(workItem.priority)}`}>
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
          {workItem.priority}
        </span>
      </div>

      {/* Card Title */}
<<<<<<< HEAD
      <h4 className="font-medium text-gray-900 mb-2 line-clamp-2">
=======
      <h4 className="font-medium text-gray-700 mb-2 line-clamp-2">
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
        {workItem.title}
      </h4>

      {/* Card Description */}
      {workItem.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {workItem.description}
        </p>
      )}

      {/* Labels */}
      {workItem.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {workItem.labels.slice(0, 3).map(label => (
            <span
              key={label}
<<<<<<< HEAD
              className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
=======
              className="px-2 py-1 text-xs bg-warm-100 text-primary-600 rounded-md font-medium border border-light"
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
            >
              {label}
            </span>
          ))}
          {workItem.labels.length > 3 && (
<<<<<<< HEAD
            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
=======
            <span className="px-2 py-1 text-xs bg-warm-50 text-gray-600 rounded-md font-medium border border-light">
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
              +{workItem.labels.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Card Footer */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center space-x-3">
          {/* Story Points */}
          {workItem.estimate && (
            <div className="flex items-center">
              <Icon name="target" className="h-3 w-3 mr-1" />
              <span>{workItem.estimate} pts</span>
            </div>
          )}

          {/* Due Date */}
          {workItem.dueDate && (
            <div className="flex items-center">
              <Icon name="calendar" className="h-3 w-3 mr-1" />
              <span>{new Date(workItem.dueDate).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        {/* Assignee */}
        {workItem.assigneeId && (
          <div className="flex items-center">
            <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
              <Icon name="user" className="h-3 w-3 text-gray-600" />
            </div>
          </div>
        )}
      </div>

<<<<<<< HEAD
      {/* Drag Handle Indicator */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
=======
      {/* Drag Handle Indicator - Only show when draggable */}
      <div 
        className="absolute top-2 right-2 opacity-0 hover:opacity-60 transition-opacity duration-150 pointer-events-none"
        aria-hidden="true"
      >
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
        <Icon name="grip-vertical" className="h-4 w-4 text-gray-400" />
      </div>
    </div>
  );
<<<<<<< HEAD
};
=======
};
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)

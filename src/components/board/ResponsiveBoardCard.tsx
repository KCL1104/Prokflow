import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Icon, type IconName } from '../common/Icon';
import { useResponsive, useTouchDevice } from '../../hooks/useResponsive';
import type { WorkItem } from '../../types';

interface ResponsiveBoardCardProps {
  workItem: WorkItem;
  isDragging?: boolean;
  compact?: boolean;
  onTap?: (workItem: WorkItem) => void;
  onLongPress?: (workItem: WorkItem) => void;
}

export function ResponsiveBoardCard({
  workItem,
  isDragging = false,
  compact = false,
  onTap,
  onLongPress
}: ResponsiveBoardCardProps) {
  const { isMobile } = useResponsive();
  const isTouchDevice = useTouchDevice();
  const [isPressed, setIsPressed] = useState(false);
  const [pressTimer, setPressTimer] = useState<NodeJS.Timeout | null>(null);

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

  // Touch event handlers
  const handleTouchStart = (_e: React.TouchEvent) => {
    if (!isTouchDevice) return;
    
    setIsPressed(true);
    
    // Set up long press timer
    const timer = setTimeout(() => {
      onLongPress?.(workItem);
      // Provide haptic feedback if available
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }
    }, 500);
    
    setPressTimer(timer);
  };

  const handleTouchEnd = (_e: React.TouchEvent) => {
    if (!isTouchDevice) return;
    
    setIsPressed(false);
    
    if (pressTimer) {
      clearTimeout(pressTimer);
      setPressTimer(null);
      
      // If it was a short press, trigger tap
      onTap?.(workItem);
    }
  };

  const handleTouchCancel = () => {
    if (!isTouchDevice) return;
    
    setIsPressed(false);
    
    if (pressTimer) {
      clearTimeout(pressTimer);
      setPressTimer(null);
    }
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

  const cardClasses = `
    bg-warm-25 rounded-md border-2 border-default shadow-xs transition-all duration-150
    ${isTouchDevice ? 'active:shadow-sm active:border-medium' : 'hover:shadow-sm hover:border-medium'}
    ${isPressed ? 'shadow-sm border-medium' : ''}
    ${isSortableDragging || isDragging ? 'opacity-60' : ''}
    ${isTouchDevice ? 'cursor-pointer' : 'cursor-grab active:cursor-grabbing'}
    ${compact ? 'p-3' : 'p-4'}
  `;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...(isTouchDevice ? {} : listeners)}
      className={cardClasses}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
    >
      {/* Card Header */}
      <div className={`flex items-start justify-between ${compact ? 'mb-2' : 'mb-3'}`}>
        <div className="flex items-center space-x-2">
          <Icon 
            name={getTypeIcon(workItem.type)} 
            className={`${compact ? 'h-3 w-3' : 'h-4 w-4'} ${getTypeColor(workItem.type)}`} 
          />
          <span className={`text-xs text-gray-500 uppercase tracking-wide font-medium ${compact ? 'text-xs' : ''}`}>
            {workItem.type}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 text-xs font-medium rounded-md ${getPriorityColor(workItem.priority)}`}>
            {workItem.priority}
          </span>
          
          {/* Touch drag handle for mobile */}
          {isTouchDevice && (
            <div 
              {...listeners}
              className="p-1 rounded touch-manipulation"
              style={{ touchAction: 'none' }}
            >
              <Icon name="grip-vertical" className="h-4 w-4 text-gray-400" />
            </div>
          )}
        </div>
      </div>

      {/* Card Title */}
      <h4 className={`font-medium text-gray-700 line-clamp-2 ${compact ? 'text-sm mb-1' : 'mb-2'}`}>
        {workItem.title}
      </h4>

      {/* Card Description - Hide in compact mode */}
      {!compact && workItem.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {workItem.description}
        </p>
      )}

      {/* Labels */}
      {workItem.labels.length > 0 && (
        <div className={`flex flex-wrap gap-1 ${compact ? 'mb-2' : 'mb-3'}`}>
          {workItem.labels.slice(0, compact ? 2 : 3).map(label => (
            <span
              key={label}
              className={`px-2 py-1 bg-warm-100 text-primary-600 rounded-md font-medium border border-light ${
                compact ? 'text-xs' : 'text-xs'
              }`}
            >
              {label}
            </span>
          ))}
          {workItem.labels.length > (compact ? 2 : 3) && (
            <span className={`px-2 py-1 bg-warm-50 text-gray-600 rounded-md font-medium border border-light ${
              compact ? 'text-xs' : 'text-xs'
            }`}>
              +{workItem.labels.length - (compact ? 2 : 3)}
            </span>
          )}
        </div>
      )}

      {/* Card Footer */}
      <div className={`flex items-center justify-between text-gray-500 ${
        compact ? 'text-xs' : 'text-sm'
      }`}>
        <div className="flex items-center space-x-3">
          {/* Story Points */}
          {workItem.estimate && (
            <div className="flex items-center">
              <Icon name="target" className={`${compact ? 'h-3 w-3' : 'h-3 w-3'} mr-1`} />
              <span>{workItem.estimate} pts</span>
            </div>
          )}

          {/* Due Date - Hide in compact mode on mobile */}
          {workItem.dueDate && (!compact || !isMobile) && (
            <div className="flex items-center">
              <Icon name="calendar" className={`${compact ? 'h-3 w-3' : 'h-3 w-3'} mr-1`} />
              <span>
                {isMobile 
                  ? new Date(workItem.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                  : new Date(workItem.dueDate).toLocaleDateString()
                }
              </span>
            </div>
          )}
        </div>

        {/* Assignee */}
        {workItem.assigneeId && (
          <div className="flex items-center">
            <div className={`bg-gray-300 rounded-full flex items-center justify-center ${
              compact ? 'w-5 h-5' : 'w-6 h-6'
            }`}>
              <Icon name="user" className={`${compact ? 'h-2 w-2' : 'h-3 w-3'} text-gray-600`} />
            </div>
          </div>
        )}
      </div>

      {/* Mobile-specific indicators */}
      {isMobile && (
        <div className="absolute top-2 left-2 flex space-x-1">
          {/* Attachment indicator */}
          {/* Comments indicator */}
          {/* Blocked indicator */}
        </div>
      )}

      {/* Long press feedback overlay */}
      {isPressed && isTouchDevice && (
        <div className="absolute inset-0 bg-primary-50 bg-opacity-30 rounded-md pointer-events-none" />
      )}
    </div>
  );
}

interface MobileBoardCardActionsProps {
  workItem: WorkItem;
  onEdit?: (workItem: WorkItem) => void;
  onMove?: (workItem: WorkItem) => void;
  onDelete?: (workItem: WorkItem) => void;
  onClose: () => void;
}

export function MobileBoardCardActions({
  workItem,
  onEdit,
  onMove,
  onDelete,
  onClose
}: MobileBoardCardActionsProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
      <div className="bg-warm-25 rounded-t-lg w-full p-6 space-y-4 border-t-2 border-default">
        {/* Card Preview */}
        <div className="border-b border-gray-200 pb-4">
          <h3 className="font-medium text-gray-900 mb-1">{workItem.title}</h3>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span className="capitalize">{workItem.type}</span>
            <span>•</span>
            <span className="capitalize">{workItem.priority}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          {onEdit && (
            <button
              onClick={() => {
                onEdit(workItem);
                onClose();
              }}
              className="w-full flex items-center px-4 py-3 text-left text-gray-700 hover:bg-warm-50 rounded-md border border-light hover:border-medium transition-all duration-150"
            >
              <Icon name="edit" className="h-5 w-5 mr-3" />
              Edit Work Item
            </button>
          )}
          
          {onMove && (
            <button
              onClick={() => {
                onMove(workItem);
                onClose();
              }}
              className="w-full flex items-center px-4 py-3 text-left text-gray-700 hover:bg-warm-50 rounded-md border border-light hover:border-medium transition-all duration-150"
            >
              <Icon name="grip-vertical" className="h-5 w-5 mr-3" />
              Move to Column
            </button>
          )}
          
          {onDelete && (
            <button
              onClick={() => {
                onDelete(workItem);
                onClose();
              }}
              className="w-full flex items-center px-4 py-3 text-left text-red-700 hover:bg-red-50 rounded-md border border-light hover:border-medium transition-all duration-150"
            >
              <Icon name="trash-2" className="h-5 w-5 mr-3" />
              Delete Work Item
            </button>
          )}
        </div>

        {/* Cancel */}
        <button
          onClick={onClose}
          className="w-full py-3 text-center text-gray-500 hover:text-gray-700 transition-colors duration-150"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

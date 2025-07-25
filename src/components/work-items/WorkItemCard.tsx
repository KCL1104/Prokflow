import React from 'react';
import type { WorkItem, TeamMember } from '../../types';
import { getPriorityColor, getStatusColor, getTypeIcon, formatWorkItemDate, isWorkItemOverdue, getAssigneeName } from '../../utils/workItemUtils';

interface WorkItemCardProps {
  workItem: WorkItem;
  teamMembers?: TeamMember[];
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
  compact?: boolean;
}

export const WorkItemCard: React.FC<WorkItemCardProps> = React.memo(({
  workItem,
  teamMembers = [],
  onClick,
  onEdit,
  onDelete,
  showActions = true,
  compact = false
}) => {
  const assigneeName = React.useMemo(() => 
    getAssigneeName(workItem.assigneeId, teamMembers),
    [workItem.assigneeId, teamMembers]
  );

  return (
    <div
      className={`bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow ${onClick ? 'cursor-pointer' : ''
        } ${compact ? 'p-3' : 'p-4'}`}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          {getTypeIcon(workItem.type)}
          <span className="text-xs font-medium text-gray-500 uppercase">
            {workItem.type}
          </span>
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(workItem.priority)}`}>
            {workItem.priority}
          </span>
        </div>

        {showActions && (
          <div className="flex items-center space-x-1">
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="p-1 text-gray-400 hover:text-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                title="Edit work item"
                aria-label={`Edit ${workItem.title}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="p-1 text-gray-400 hover:text-red-600 rounded"
                title="Delete work item"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Title */}
      <h3 className={`font-medium text-gray-900 mb-2 ${compact ? 'text-sm' : 'text-base'}`}>
        {workItem.title}
      </h3>

      {/* Description */}
      {!compact && workItem.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {workItem.description}
        </p>
      )}

      {/* Labels */}
      {workItem.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {workItem.labels.slice(0, compact ? 2 : 4).map((label) => (
            <span
              key={label}
              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
            >
              {label}
            </span>
          ))}
          {workItem.labels.length > (compact ? 2 : 4) && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
              +{workItem.labels.length - (compact ? 2 : 4)}
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center space-x-3">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(workItem.status)}`}>
            {workItem.status.replace('_', ' ')}
          </span>

          {workItem.estimate && (
            <span className="flex items-center">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {workItem.estimate}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-3">
          {workItem.assigneeId && (
            <span className="flex items-center">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {assigneeName}
            </span>
          )}

          {workItem.dueDate && (
            <span className={`flex items-center ${isWorkItemOverdue(workItem.dueDate) ? 'text-red-600' : ''}`}>
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z" />
              </svg>
              {formatWorkItemDate(workItem.dueDate)}
            </span>
          )}
        </div>
      </div>

      {/* Dependencies indicator */}
      {workItem.dependencies.length > 0 && (
        <div className="mt-2 pt-2 border-t border-gray-100">
          <span className="text-xs text-gray-500 flex items-center">
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            {workItem.dependencies.length} dependenc{workItem.dependencies.length === 1 ? 'y' : 'ies'}
          </span>
        </div>
      )}
    </div>
  );
});
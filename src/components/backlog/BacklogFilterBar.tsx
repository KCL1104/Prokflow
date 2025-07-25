import React from 'react';
import type { TeamMember } from '../../types';
import { WORK_ITEM_TYPES, PRIORITY_OPTIONS } from '../../constants/workItemConstants';

interface BacklogFilterBarProps {
  searchTerm: string;
  typeFilter: string;
  priorityFilter: string;
  assigneeFilter: string;
  teamMembers: TeamMember[];
  onSearchChange: (term: string) => void;
  onTypeFilterChange: (filter: string) => void;
  onPriorityFilterChange: (filter: string) => void;
  onAssigneeFilterChange: (filter: string) => void;
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  isAllSelected: boolean;
}

const FILTER_OPTIONS = [
  { value: 'all', label: 'All Items' },
  ...WORK_ITEM_TYPES.filter(type => type.value !== 'all')
] as const;

export const BacklogFilterBar: React.FC<BacklogFilterBarProps> = React.memo(({
  searchTerm,
  typeFilter,
  priorityFilter,
  assigneeFilter,
  teamMembers,
  onSearchChange,
  onTypeFilterChange,
  onPriorityFilterChange,
  onAssigneeFilterChange,
  selectedCount,
  totalCount,
  onSelectAll,
  isAllSelected
}) => {
  return (
    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Search */}
        <div className="md:col-span-2">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search backlog items..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Type Filter */}
        <div>
          <select
            value={typeFilter}
            onChange={(e) => onTypeFilterChange(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            {FILTER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Priority Filter */}
        <div>
          <select
            value={priorityFilter}
            onChange={(e) => onPriorityFilterChange(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            {PRIORITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Assignee Filter */}
        <div>
          <select
            value={assigneeFilter}
            onChange={(e) => onAssigneeFilterChange(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Assignees</option>
            <option value="unassigned">Unassigned</option>
            {teamMembers.map((member) => (
              <option key={member.userId} value={member.userId}>
                User {member.userId.slice(0, 8)}...
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Bulk Actions */}
      {totalCount > 0 && (
        <div className="mt-4 flex items-center space-x-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={isAllSelected}
              onChange={onSelectAll}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">
              Select all visible items
            </span>
          </label>
          {selectedCount > 0 && (
            <span className="text-sm text-gray-500">
              {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
            </span>
          )}
        </div>
      )}
    </div>
  );
});

BacklogFilterBar.displayName = 'BacklogFilterBar';
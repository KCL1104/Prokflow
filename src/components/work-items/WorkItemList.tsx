import React, { useState } from 'react';
import { WorkItemCard } from './WorkItemCard';
<<<<<<< HEAD
import { Button } from '../common/Button';
=======
import { Button } from '../ui/button';
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
import { Loading } from '../common/Loading';
import type { WorkItem, TeamMember } from '../../types';

interface WorkItemListProps {
  workItems: WorkItem[];
  teamMembers?: TeamMember[];
  isLoading?: boolean;
  onCreateNew?: () => void;
  onEditItem?: (workItem: WorkItem) => void;
  onDeleteItem?: (workItem: WorkItem) => void;
  onItemClick?: (workItem: WorkItem) => void;
  title?: string;
  emptyMessage?: string;
  showCreateButton?: boolean;
  compact?: boolean;
  // Selection props for sprint management
  showSelection?: boolean;
  selectedItems?: Set<string>;
  onSelectionChange?: (selectedItems: Set<string>) => void;
  showDragHandle?: boolean;
}

const FILTER_OPTIONS = [
  { value: 'all', label: 'All Items' },
  { value: 'story', label: 'Stories' },
  { value: 'task', label: 'Tasks' },
  { value: 'bug', label: 'Bugs' },
  { value: 'epic', label: 'Epics' }
];

const SORT_OPTIONS = [
  { value: 'priority', label: 'Priority' },
  { value: 'created', label: 'Created Date' },
  { value: 'updated', label: 'Updated Date' },
  { value: 'title', label: 'Title' },
  { value: 'assignee', label: 'Assignee' }
];

const PRIORITY_ORDER = { critical: 4, high: 3, medium: 2, low: 1 };

export const WorkItemList: React.FC<WorkItemListProps> = ({
  workItems,
  teamMembers = [],
  isLoading = false,
  onCreateNew,
  onEditItem,
  onDeleteItem,
  onItemClick,
  title = 'Work Items',
  emptyMessage = 'No work items found',
  showCreateButton = true,
  compact = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('priority');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const filteredAndSortedItems = React.useMemo(() => {
    let filtered = workItems;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.labels.some(label => label.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(item => item.type === typeFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'priority':
          comparison = (PRIORITY_ORDER[a.priority as keyof typeof PRIORITY_ORDER] || 0) - 
                      (PRIORITY_ORDER[b.priority as keyof typeof PRIORITY_ORDER] || 0);
          break;
        case 'created':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'updated':
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'assignee': {
          const aAssignee = a.assigneeId || '';
          const bAssignee = b.assigneeId || '';
          comparison = aAssignee.localeCompare(bAssignee);
          break;
        }
        default:
          comparison = 0;
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });

    return filtered;
  }, [workItems, searchTerm, typeFilter, sortBy, sortOrder]);

  const handleDeleteItem = (workItem: WorkItem) => {
    if (window.confirm(`Are you sure you want to delete "${workItem.title}"?`)) {
      onDeleteItem?.(workItem);
    }
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

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
    <div className="bg-white shadow rounded-lg">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium text-gray-900">{title}</h2>
            <p className="mt-1 text-sm text-gray-600">
              {filteredAndSortedItems.length} of {workItems.length} items
            </p>
          </div>
          {showCreateButton && onCreateNew && (
            <Button variant="primary" onClick={onCreateNew}>
              Create Work Item
            </Button>
          )}
        </div>
      </div>

      {/* Filters and Search */}
<<<<<<< HEAD
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
=======
      <div className="px-6 py-4 border-b-2 border-gray-300 bg-white">
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                placeholder="Search work items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              {FILTER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div>
            <div className="flex space-x-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <button
                onClick={toggleSortOrder}
                className="px-3 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                title={`Sort ${sortOrder === 'asc' ? 'ascending' : 'descending'}`}
              >
                <svg className={`w-4 h-4 text-gray-600 transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Work Items List */}
      <div className="p-6">
        {filteredAndSortedItems.length === 0 ? (
          <div className="text-center py-8">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {searchTerm || typeFilter !== 'all' ? 'No matching items' : emptyMessage}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || typeFilter !== 'all' 
                ? 'Try adjusting your search or filters.'
                : 'Get started by creating your first work item.'
              }
            </p>
            {showCreateButton && onCreateNew && !searchTerm && typeFilter === 'all' && (
              <div className="mt-6">
                <Button variant="primary" onClick={onCreateNew}>
                  Create Work Item
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className={`grid gap-4 ${compact ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {filteredAndSortedItems.map((workItem) => (
              <WorkItemCard
                key={workItem.id}
                workItem={workItem}
                teamMembers={teamMembers}
                onClick={() => onItemClick?.(workItem)}
                onEdit={() => onEditItem?.(workItem)}
                onDelete={() => handleDeleteItem(workItem)}
                compact={compact}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
<<<<<<< HEAD
};
=======
};
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)

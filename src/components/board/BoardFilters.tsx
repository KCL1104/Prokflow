import React, { useState, useMemo } from 'react';
import { Icon } from '../common/Icon';
<<<<<<< HEAD
import { Button } from '../common/Button';
=======
import { Button } from '../ui/button';
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
import type { WorkItem } from '../../types';

interface FilterOptions {
  assignee?: string[];
  priority?: WorkItem['priority'][];
  type?: WorkItem['type'][];
  labels?: string[];
  search?: string;
}

interface BoardFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  workItems: WorkItem[];
<<<<<<< HEAD
=======
  compact?: boolean;
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
}

export const BoardFilters: React.FC<BoardFiltersProps> = ({
  filters,
  onFiltersChange,
  workItems
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

<<<<<<< HEAD
  // Extract unique values for filter options
=======
  // Extract unique values for filter options with optimized memoization
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
  const filterOptions = useMemo(() => {
    const assignees = new Set<string>();
    const priorities = new Set<WorkItem['priority']>();
    const types = new Set<WorkItem['type']>();
    const labels = new Set<string>();

    workItems.forEach(item => {
      if (item.assigneeId) assignees.add(item.assigneeId);
      priorities.add(item.priority);
      types.add(item.type);
      item.labels.forEach(label => labels.add(label));
    });

    return {
<<<<<<< HEAD
      assignees: Array.from(assignees),
      priorities: Array.from(priorities),
      types: Array.from(types),
      labels: Array.from(labels)
=======
      assignees: Array.from(assignees).sort(),
      priorities: Array.from(priorities).sort(),
      types: Array.from(types).sort(),
      labels: Array.from(labels).sort()
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
    };
  }, [workItems]);

  const handleSearchChange = (search: string) => {
    onFiltersChange({ ...filters, search: search || undefined });
  };

  const handleMultiSelectChange = (
    filterKey: keyof FilterOptions,
    value: string,
    checked: boolean
  ) => {
    const currentValues = (filters[filterKey] as string[]) || [];
    const newValues = checked
      ? [...currentValues, value]
      : currentValues.filter(v => v !== value);
    
    onFiltersChange({
      ...filters,
      [filterKey]: newValues.length > 0 ? newValues : undefined
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== undefined && (Array.isArray(value) ? value.length > 0 : value !== '')
  );

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.assignee?.length) count++;
    if (filters.priority?.length) count++;
    if (filters.type?.length) count++;
    if (filters.labels?.length) count++;
    return count;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      {/* Filter Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <h3 className="font-medium text-gray-900">Filters</h3>
          {hasActiveFilters && (
            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
              {getActiveFilterCount()} active
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {hasActiveFilters && (
            <Button
              variant="secondary"
<<<<<<< HEAD
              size="small"
=======
              size="sm"
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
              onClick={clearFilters}
            >
              Clear All
            </Button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            <Icon 
              name={isExpanded ? 'chevron-up' : 'chevron-down'} 
              className="h-4 w-4 mr-1" 
            />
            {isExpanded ? 'Collapse' : 'Expand'}
          </button>
        </div>
      </div>

      {/* Search Bar - Always Visible */}
      <div className="p-4">
        <div className="relative">
          <Icon name="search" className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search work items..."
            value={filters.search || ''}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-gray-100">
          {/* Assignee Filter */}
          {filterOptions.assignees.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assignee
              </label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {filterOptions.assignees.map(assigneeId => (
                  <label key={assigneeId} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={(filters.assignee || []).includes(assigneeId)}
                      onChange={(e) => handleMultiSelectChange('assignee', assigneeId, e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      {assigneeId} {/* In a real app, you'd resolve this to a user name */}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Priority Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <div className="flex flex-wrap gap-2">
              {filterOptions.priorities.map(priority => (
                <label key={priority} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={(filters.priority || []).includes(priority)}
                    onChange={(e) => handleMultiSelectChange('priority', priority, e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700 capitalize">
                    {priority}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type
            </label>
            <div className="flex flex-wrap gap-2">
              {filterOptions.types.map(type => (
                <label key={type} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={(filters.type || []).includes(type)}
                    onChange={(e) => handleMultiSelectChange('type', type, e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700 capitalize">
                    {type}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Labels Filter */}
          {filterOptions.labels.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Labels
              </label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {filterOptions.labels.map(label => (
                  <label key={label} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={(filters.labels || []).includes(label)}
                      onChange={(e) => handleMultiSelectChange('labels', label, e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      {label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
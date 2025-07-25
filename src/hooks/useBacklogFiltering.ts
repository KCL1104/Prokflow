import { useState, useEffect, useMemo, useCallback } from 'react';
import type { WorkItem } from '../types';

interface UseBacklogFilteringProps {
  workItems: WorkItem[];
}

type FilterValue = 'all' | string;

interface FilterState {
  searchTerm: string;
  typeFilter: FilterValue;
  priorityFilter: FilterValue;
  assigneeFilter: FilterValue;
}

// Separate filter functions for better testability and reusability
const createSearchFilter = (searchTerm: string) => {
  if (!searchTerm) return () => true;
  
  const normalizedTerm = searchTerm.toLowerCase().trim();
  
  return (item: WorkItem): boolean => {
    try {
      return (
        item.title.toLowerCase().includes(normalizedTerm) ||
        (item.description?.toLowerCase().includes(normalizedTerm) ?? false) ||
        item.labels.some(label => label.toLowerCase().includes(normalizedTerm))
      );
    } catch (error) {
      console.warn('Error in search filter:', error);
      return false;
    }
  };
};

const createTypeFilter = (typeFilter: string) => (item: WorkItem): boolean => {
  return typeFilter === 'all' || item.type === typeFilter;
};

const createPriorityFilter = (priorityFilter: string) => (item: WorkItem): boolean => {
  return priorityFilter === 'all' || item.priority === priorityFilter;
};

const createAssigneeFilter = (assigneeFilter: string) => (item: WorkItem): boolean => {
  if (assigneeFilter === 'all') return true;
  if (assigneeFilter === 'unassigned') return !item.assigneeId;
  return item.assigneeId === assigneeFilter;
};

// Constants for better maintainability
const SEARCH_DEBOUNCE_MS = 300;
const DEFAULT_FILTER_VALUE = 'all';

export const useBacklogFiltering = ({ workItems }: UseBacklogFilteringProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState(DEFAULT_FILTER_VALUE);
  const [priorityFilter, setPriorityFilter] = useState(DEFAULT_FILTER_VALUE);
  const [assigneeFilter, setAssigneeFilter] = useState(DEFAULT_FILTER_VALUE);

  // Debounce search term to avoid excessive filtering
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Memoize filter functions to prevent recreation on every render
  const searchFilter = useMemo(() => createSearchFilter(debouncedSearchTerm), [debouncedSearchTerm]);
  const typeFilterFn = useMemo(() => createTypeFilter(typeFilter), [typeFilter]);
  const priorityFilterFn = useMemo(() => createPriorityFilter(priorityFilter), [priorityFilter]);
  const assigneeFilterFn = useMemo(() => createAssigneeFilter(assigneeFilter), [assigneeFilter]);

  // Optimized single-pass filtering with composed filters
  const filteredWorkItems = useMemo(() => {
    return workItems.filter(item =>
      searchFilter(item) &&
      typeFilterFn(item) &&
      priorityFilterFn(item) &&
      assigneeFilterFn(item)
    );
  }, [workItems, searchFilter, typeFilterFn, priorityFilterFn, assigneeFilterFn]);

  // Clear filters function
  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setTypeFilter(DEFAULT_FILTER_VALUE);
    setPriorityFilter(DEFAULT_FILTER_VALUE);
    setAssigneeFilter(DEFAULT_FILTER_VALUE);
  }, []);

  // Memoize filter actions to prevent unnecessary re-renders
  const filterActions = useMemo(() => ({
    setSearchTerm,
    setTypeFilter,
    setPriorityFilter,
    setAssigneeFilter,
    clearFilters,
  }), [clearFilters]);

  const filterState: FilterState = {
    searchTerm,
    typeFilter,
    priorityFilter,
    assigneeFilter
  };

  return {
    filteredWorkItems,
    filterState,
    filterActions,
    hasActiveFilters: Boolean(searchTerm || typeFilter !== 'all' || priorityFilter !== 'all' || assigneeFilter !== 'all')
  };
};
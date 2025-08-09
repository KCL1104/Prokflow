import { useMemo } from 'react';
import type { WorkItem } from '../types';

interface FilterOptions {
  assignee?: string[];
  priority?: WorkItem['priority'][];
  type?: WorkItem['type'][];
  labels?: string[];
  search?: string;
}

interface UseBoardFilteringProps {
  workItems: WorkItem[];
  filters: FilterOptions;
}

export const useBoardFiltering = ({ workItems, filters }: UseBoardFilteringProps) => {
  // Memoize filter functions to prevent recreation on every render
  const filterFunctions = useMemo(() => {
    const searchFilter = (item: WorkItem): boolean => {
      if (!filters.search) return true;
      const searchLower = filters.search.toLowerCase();
      return item.title.toLowerCase().includes(searchLower) ||
             (item.description?.toLowerCase().includes(searchLower) ?? false);
    };

    const assigneeFilter = (item: WorkItem): boolean => {
      return !filters.assignee?.length || 
             (!!item.assigneeId && filters.assignee.includes(item.assigneeId));
    };

    const priorityFilter = (item: WorkItem): boolean => {
      return !filters.priority?.length || filters.priority.includes(item.priority);
    };

    const typeFilter = (item: WorkItem): boolean => {
      return !filters.type?.length || filters.type.includes(item.type);
    };

    const labelsFilter = (item: WorkItem): boolean => {
      return !filters.labels?.length || 
             filters.labels.some(label => item.labels?.includes(label) ?? false);
    };

    return { searchFilter, assigneeFilter, priorityFilter, typeFilter, labelsFilter };
  }, [filters]);

  const filteredWorkItems = useMemo(() => {
    const { searchFilter, assigneeFilter, priorityFilter, typeFilter, labelsFilter } = filterFunctions;
    
    return workItems.filter(item =>
      searchFilter(item) &&
      assigneeFilter(item) &&
      priorityFilter(item) &&
      typeFilter(item) &&
      labelsFilter(item)
    );
  }, [workItems, filterFunctions]);

  return { filteredWorkItems };
};
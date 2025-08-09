import React, { createContext, useContext, useState, useCallback } from 'react';
import type { WorkItem, TeamMember } from '../../types';
import { useBacklogFiltering } from '../../hooks/useBacklogFiltering';

interface ProductBacklogContextValue {
  // Data
  workItems: WorkItem[];
  teamMembers: TeamMember[];
  filteredWorkItems: WorkItem[];

  // Selection state
  selectedItems: Set<string>;
  setSelectedItems: React.Dispatch<React.SetStateAction<Set<string>>>;

  // Modal state
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: (open: boolean) => void;
  isBulkEditModalOpen: boolean;
  setIsBulkEditModalOpen: (open: boolean) => void;
  isEstimationModalOpen: boolean;
  setIsEstimationModalOpen: (open: boolean) => void;
  estimationWorkItem: WorkItem | null;
  setEstimationWorkItem: (item: WorkItem | null) => void;

  // Filter state and actions
  filterState: {
    searchTerm: string;
    typeFilter: string;
    priorityFilter: string;
    assigneeFilter: string;
  };
  filterActions: {
    setSearchTerm: (term: string) => void;
    setTypeFilter: (filter: string) => void;
    setPriorityFilter: (filter: string) => void;
    setAssigneeFilter: (filter: string) => void;
    clearFilters: () => void;
  };
  hasActiveFilters: boolean;

  // Actions
  handleSelectItem: (itemId: string, selected: boolean) => void;
  handleSelectAll: () => void;
}

const ProductBacklogContext = createContext<ProductBacklogContextValue | null>(null);

interface ProductBacklogProviderProps {
  children: React.ReactNode;
  workItems: WorkItem[];
  teamMembers: TeamMember[];
}

export const ProductBacklogProvider: React.FC<ProductBacklogProviderProps> = ({
  children,
  workItems,
  teamMembers,
}) => {
  // Selection state
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  // Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isBulkEditModalOpen, setIsBulkEditModalOpen] = useState(false);
  const [isEstimationModalOpen, setIsEstimationModalOpen] = useState(false);
  const [estimationWorkItem, setEstimationWorkItem] = useState<WorkItem | null>(null);

  // Filtering
  const { filteredWorkItems, filterState, filterActions, hasActiveFilters } = useBacklogFiltering({
    workItems,
  });

  const handleSelectItem = useCallback((itemId: string, selected: boolean) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(itemId);
      } else {
        newSet.delete(itemId);
      }
      return newSet;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedItems.size === filteredWorkItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredWorkItems.map(item => item.id)));
    }
  }, [filteredWorkItems, selectedItems.size]);

  const value: ProductBacklogContextValue = {
    workItems,
    teamMembers,
    filteredWorkItems,
    selectedItems,
    setSelectedItems,
    isCreateModalOpen,
    setIsCreateModalOpen,
    isBulkEditModalOpen,
    setIsBulkEditModalOpen,
    isEstimationModalOpen,
    setIsEstimationModalOpen,
    estimationWorkItem,
    setEstimationWorkItem,
    filterState,
    filterActions,
    hasActiveFilters,
    handleSelectItem,
    handleSelectAll,
  };

  return (
    <ProductBacklogContext.Provider value={value}>
      {children}
    </ProductBacklogContext.Provider>
  );
};

<<<<<<< HEAD
=======
// eslint-disable-next-line react-refresh/only-export-components
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
export const useProductBacklog = (): ProductBacklogContextValue => {
  const context = useContext(ProductBacklogContext);
  if (!context) {
    throw new Error('useProductBacklog must be used within a ProductBacklogProvider');
  }
  return context;
};
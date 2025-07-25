import { useState } from 'react';
import type { WorkItem } from '../types';

export const useBacklogModals = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isBulkEditModalOpen, setIsBulkEditModalOpen] = useState(false);
  const [isEstimationModalOpen, setIsEstimationModalOpen] = useState(false);
  const [estimationWorkItem, setEstimationWorkItem] = useState<WorkItem | null>(null);

  const openCreateModal = () => setIsCreateModalOpen(true);
  const closeCreateModal = () => setIsCreateModalOpen(false);
  
  const openBulkEditModal = () => setIsBulkEditModalOpen(true);
  const closeBulkEditModal = () => setIsBulkEditModalOpen(false);
  
  const openEstimationModal = (workItem: WorkItem) => {
    setEstimationWorkItem(workItem);
    setIsEstimationModalOpen(true);
  };
  
  const closeEstimationModal = () => {
    setIsEstimationModalOpen(false);
    setEstimationWorkItem(null);
  };

  return {
    // State
    isCreateModalOpen,
    isBulkEditModalOpen,
    isEstimationModalOpen,
    estimationWorkItem,
    
    // Actions
    setIsCreateModalOpen,
    setIsBulkEditModalOpen,
    setIsEstimationModalOpen,
    setEstimationWorkItem,
    
    // Convenience methods
    openCreateModal,
    closeCreateModal,
    openBulkEditModal,
    closeBulkEditModal,
    openEstimationModal,
    closeEstimationModal,
  };
};
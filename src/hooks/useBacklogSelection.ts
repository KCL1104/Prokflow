import { useState, useCallback, useMemo } from 'react';
import type { WorkItem } from '../types';

interface UseBacklogSelectionProps {
  filteredWorkItems: WorkItem[];
}

export const useBacklogSelection = ({ filteredWorkItems }: UseBacklogSelectionProps) => {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  // Memoize filtered item IDs to prevent unnecessary recalculations
  const filteredItemIds = useMemo(
    () => new Set(filteredWorkItems.map(item => item.id)),
    [filteredWorkItems]
  );

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
    if (selectedItems.size === filteredWorkItems.length && filteredWorkItems.length > 0) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredWorkItems.map(item => item.id)));
    }
  }, [filteredWorkItems, selectedItems.size]);

  const clearSelection = useCallback(() => {
    setSelectedItems(new Set());
  }, []);

  // Clean up selection when filtered items change (remove items no longer visible)
  const cleanedSelectedItems = useMemo(() => {
    const cleaned = new Set<string>();
    selectedItems.forEach(id => {
      if (filteredItemIds.has(id)) {
        cleaned.add(id);
      }
    });
    return cleaned;
  }, [selectedItems, filteredItemIds]);

  // Update selection if it was cleaned
  if (cleanedSelectedItems.size !== selectedItems.size) {
    setSelectedItems(cleanedSelectedItems);
  }

  const isAllSelected = cleanedSelectedItems.size === filteredWorkItems.length && filteredWorkItems.length > 0;
  const hasSelection = cleanedSelectedItems.size > 0;

  return {
    selectedItems: cleanedSelectedItems,
    handleSelectItem,
    handleSelectAll,
    clearSelection,
    isAllSelected,
    hasSelection,
    selectedCount: cleanedSelectedItems.size
  };
};
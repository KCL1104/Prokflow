import { useState, useEffect } from 'react';
import { workItemService } from '../services';
import type { WorkItem } from '../types';

export function useWorkItems(projectId?: string) {
  const [workItems, setWorkItems] = useState<WorkItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (projectId) {
      fetchBacklog(projectId);
    }
  }, [projectId]);

  const fetchBacklog = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const items = await workItemService.getProjectBacklog(id);
      setWorkItems(items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch backlog');
    } finally {
      setLoading(false);
    }
  };

  const createWorkItem = async (data: Parameters<typeof workItemService.createWorkItem>[0]) => {
    setLoading(true);
    setError(null);
    try {
      const newItem = await workItemService.createWorkItem(data);
      setWorkItems(prev => [...prev, newItem]);
      return newItem;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create work item');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateWorkItem = async (id: string, data: Parameters<typeof workItemService.updateWorkItem>[1]) => {
    setLoading(true);
    setError(null);
    try {
      const updatedItem = await workItemService.updateWorkItem(id, data);
      setWorkItems(prev => prev.map(item => item.id === id ? updatedItem : item));
      return updatedItem;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update work item');
      throw err;
    } finally {
      setLoading(false);
    }
  };

<<<<<<< HEAD
=======
  const getSprintWorkItems = async (sprintId: string) => {
    try {
      return await workItemService.getSprintWorkItems(sprintId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch sprint work items');
      throw err;
    }
  };

>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
  return {
    workItems,
    loading,
    error,
    fetchBacklog,
    createWorkItem,
    updateWorkItem,
<<<<<<< HEAD
=======
    getSprintWorkItems,
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
  };
}
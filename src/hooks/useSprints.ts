import { useState, useEffect } from 'react';
import { sprintService } from '../services';
import type { Sprint } from '../types';

export function useSprints(projectId?: string) {
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [activeSprint, setActiveSprint] = useState<Sprint | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (projectId) {
      fetchSprints(projectId);
      fetchActiveSprint(projectId);
    }
  }, [projectId]);

  const fetchSprints = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const sprintData = await sprintService.getProjectSprints(id);
      setSprints(sprintData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch sprints');
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveSprint = async (id: string) => {
    try {
      const activeSprintData = await sprintService.getActiveSprint(id);
      setActiveSprint(activeSprintData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch active sprint');
    }
  };

  const createSprint = async (data: Parameters<typeof sprintService.createSprint>[0]) => {
    setLoading(true);
    setError(null);
    try {
      const newSprint = await sprintService.createSprint(data);
      setSprints(prev => [...prev, newSprint]);
      return newSprint;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create sprint');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    sprints,
    activeSprint,
    loading,
    error,
    fetchSprints,
    fetchActiveSprint,
    createSprint,
  };
}
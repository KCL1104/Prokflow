import { useState, useEffect, useCallback } from 'react';
import { standupService } from '../services/standupService';
import type { 
  Standup, 
  StandupParticipation, 
  CreateStandupRequest,
  CreateStandupParticipationRequest,
  UpdateStandupParticipationRequest 
} from '../types';

interface UseStandupsReturn {
  standups: Standup[];
  loading: boolean;
  error: string | null;
  createStandup: (data: CreateStandupRequest) => Promise<Standup>;
  updateStandup: (id: string, status: Standup['status'], notes?: string, duration?: number) => Promise<void>;
  deleteStandup: (id: string) => Promise<void>;
  fetchStandups: () => Promise<void>;
}

interface UseStandupParticipationReturn {
  participation: StandupParticipation | null;
  participations: StandupParticipation[];
  loading: boolean;
  error: string | null;
  submitParticipation: (data: CreateStandupParticipationRequest) => Promise<void>;
  updateParticipation: (id: string, data: UpdateStandupParticipationRequest) => Promise<void>;
  fetchParticipations: (standupId: string) => Promise<void>;
  fetchUserParticipation: (standupId: string) => Promise<void>;
}

interface UseUpcomingStandupsReturn {
  upcomingStandups: Standup[];
  loading: boolean;
  error: string | null;
  fetchUpcomingStandups: () => Promise<void>;
}

// Hook for managing project standups
export const useStandups = (projectId?: string): UseStandupsReturn => {
  const [standups, setStandups] = useState<Standup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStandups = useCallback(async () => {
    if (!projectId) return;

    setLoading(true);
    setError(null);
    
    try {
      const data = await standupService.getProjectStandups(projectId);
      setStandups(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch standups';
      setError(errorMessage);
      console.error('Error fetching standups:', err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const createStandup = useCallback(async (data: CreateStandupRequest): Promise<Standup> => {
    setError(null);
    
    try {
      const newStandup = await standupService.createStandup(data);
      setStandups(prev => [newStandup, ...prev]);
      return newStandup;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create standup';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const updateStandup = useCallback(async (
    id: string, 
    status: Standup['status'], 
    notes?: string, 
    duration?: number
  ): Promise<void> => {
    setError(null);
    
    try {
      const updatedStandup = await standupService.updateStandup(id, { status, notes, duration });
      setStandups(prev => prev.map(standup => 
        standup.id === id ? updatedStandup : standup
      ));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update standup';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const deleteStandup = useCallback(async (id: string): Promise<void> => {
    setError(null);
    
    try {
      await standupService.deleteStandup(id);
      setStandups(prev => prev.filter(standup => standup.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete standup';
      setError(errorMessage);
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchStandups();
  }, [fetchStandups]);

  return {
    standups,
    loading,
    error,
    createStandup,
    updateStandup,
    deleteStandup,
    fetchStandups,
  };
};

// Hook for managing standup participation
export const useStandupParticipation = (): UseStandupParticipationReturn => {
  const [participation, setParticipation] = useState<StandupParticipation | null>(null);
  const [participations, setParticipations] = useState<StandupParticipation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchParticipations = useCallback(async (standupId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await standupService.getStandupParticipations(standupId);
      setParticipations(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch participations';
      setError(errorMessage);
      console.error('Error fetching participations:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUserParticipation = useCallback(async (standupId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await standupService.getUserStandupParticipation(standupId);
      setParticipation(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch user participation';
      setError(errorMessage);
      console.error('Error fetching user participation:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const submitParticipation = useCallback(async (data: CreateStandupParticipationRequest): Promise<void> => {
    setError(null);
    
    try {
      const newParticipation = await standupService.createStandupParticipation(data);
      setParticipation(newParticipation);
      setParticipations(prev => [...prev, newParticipation]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit participation';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const updateParticipation = useCallback(async (
    id: string, 
    data: UpdateStandupParticipationRequest
  ): Promise<void> => {
    setError(null);
    
    try {
      const updatedParticipation = await standupService.updateStandupParticipation(id, data);
      setParticipation(prev => prev?.id === id ? updatedParticipation : prev);
      setParticipations(prev => prev.map(p => 
        p.id === id ? updatedParticipation : p
      ));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update participation';
      setError(errorMessage);
      throw err;
    }
  }, []);

  return {
    participation,
    participations,
    loading,
    error,
    submitParticipation,
    updateParticipation,
    fetchParticipations,
    fetchUserParticipation,
  };
};

// Hook for upcoming standups
export const useUpcomingStandups = (): UseUpcomingStandupsReturn => {
  const [upcomingStandups, setUpcomingStandups] = useState<Standup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUpcomingStandups = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await standupService.getUpcomingStandups();
      setUpcomingStandups(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch upcoming standups';
      setError(errorMessage);
      console.error('Error fetching upcoming standups:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUpcomingStandups();
  }, [fetchUpcomingStandups]);

  return {
    upcomingStandups,
    loading,
    error,
    fetchUpcomingStandups,
  };
};
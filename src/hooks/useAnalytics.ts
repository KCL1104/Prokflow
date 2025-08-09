import { useState, useEffect, useCallback, useRef } from 'react';
import { reportService } from '../services/reportService';
import { useErrorHandler } from './useErrorHandler';
import type { 
  ProjectMetrics, 
  VelocityData, 
  TeamMetrics,
  LoadingState 
} from '../types';

interface AnalyticsState {
  projectMetrics: ProjectMetrics | null;
  velocityData: VelocityData[];
  teamMetrics: TeamMetrics[];
  cycleTimeAnalytics: {
    averageCycleTime: number;
    averageLeadTime: number;
    throughput: number;
  } | null;
  completionRateAnalytics: {
    totalItems: number;
    completedItems: number;
    completionRate: number;
    completionTrend: { date: string; completed: number; total: number }[];
  } | null;
  loadingStates: {
    projectMetrics: LoadingState;
    velocityData: LoadingState;
    teamMetrics: LoadingState;
    cycleTimeAnalytics: LoadingState;
    completionRateAnalytics: LoadingState;
  };
}

interface UseAnalyticsOptions {
  projectId: string;
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export const useAnalytics = ({
  projectId,
  autoRefresh = false,
  refreshInterval = 300000, // 5 minutes
  dateRange
}: UseAnalyticsOptions) => {
  const { setError } = useErrorHandler();
  
  const [state, setState] = useState<AnalyticsState>({
    projectMetrics: null,
    velocityData: [],
    teamMetrics: [],
    cycleTimeAnalytics: null,
    completionRateAnalytics: null,
    loadingStates: {
      projectMetrics: 'idle',
      velocityData: 'idle',
      teamMetrics: 'idle',
      cycleTimeAnalytics: 'idle',
      completionRateAnalytics: 'idle'
    }
  });

  const updateLoadingState = useCallback((key: keyof AnalyticsState['loadingStates'], status: LoadingState) => {
    setState(prev => ({
      ...prev,
      loadingStates: {
        ...prev.loadingStates,
        [key]: status
      }
    }));
  }, []);

  const fetchProjectMetrics = useCallback(async () => {
    if (!projectId) return;

    updateLoadingState('projectMetrics', 'loading');
    try {
      const metrics = await reportService.getProjectMetrics(projectId);
      setState(prev => ({
        ...prev,
        projectMetrics: metrics
      }));
      updateLoadingState('projectMetrics', 'succeeded');
    } catch (error) {
      setError(error, 'Failed to load project metrics');
      updateLoadingState('projectMetrics', 'failed');
    }
  }, [projectId, setError, updateLoadingState]);

  const fetchVelocityData = useCallback(async (sprintCount = 10) => {
    if (!projectId) return;

    updateLoadingState('velocityData', 'loading');
    try {
      const velocity = await reportService.getVelocityTrends(projectId, sprintCount);
      setState(prev => ({
        ...prev,
        velocityData: velocity
      }));
      updateLoadingState('velocityData', 'succeeded');
    } catch (error) {
      setError(error, 'Failed to load velocity data');
      updateLoadingState('velocityData', 'failed');
    }
  }, [projectId, setError, updateLoadingState]);

  const fetchTeamMetrics = useCallback(async () => {
    if (!projectId) return;

    updateLoadingState('teamMetrics', 'loading');
    try {
      const team = await reportService.getTeamMetrics(projectId);
      setState(prev => ({
        ...prev,
        teamMetrics: team
      }));
      updateLoadingState('teamMetrics', 'succeeded');
    } catch (error) {
      setError(error, 'Failed to load team metrics');
      updateLoadingState('teamMetrics', 'failed');
    }
  }, [projectId, setError, updateLoadingState]);

  const fetchCycleTimeAnalytics = useCallback(async () => {
    if (!projectId) return;

    updateLoadingState('cycleTimeAnalytics', 'loading');
    try {
      const cycleTime = await reportService.getCycleTimeAnalytics(projectId, dateRange);
      setState(prev => ({
        ...prev,
        cycleTimeAnalytics: cycleTime
      }));
      updateLoadingState('cycleTimeAnalytics', 'succeeded');
    } catch (error) {
      setError(error, 'Failed to load cycle time analytics');
      updateLoadingState('cycleTimeAnalytics', 'failed');
    }
  }, [projectId, dateRange, setError, updateLoadingState]);

  const fetchCompletionRateAnalytics = useCallback(async () => {
    if (!projectId) return;

    updateLoadingState('completionRateAnalytics', 'loading');
    try {
      const completion = await reportService.getCompletionRateAnalytics(projectId);
      setState(prev => ({
        ...prev,
        completionRateAnalytics: completion
      }));
      updateLoadingState('completionRateAnalytics', 'succeeded');
    } catch (error) {
      setError(error, 'Failed to load completion rate analytics');
      updateLoadingState('completionRateAnalytics', 'failed');
    }
  }, [projectId, setError, updateLoadingState]);

  const fetchAllAnalytics = useCallback(async () => {
    if (!projectId) return;

    // Set all loading states to 'loading' first
    setState(prev => ({
      ...prev,
      loadingStates: {
        projectMetrics: 'loading',
        velocityData: 'loading',
        teamMetrics: 'loading',
        cycleTimeAnalytics: 'loading',
        completionRateAnalytics: 'loading'
      }
    }));

    try {
      const [metrics, velocity, team, cycleTime, completion] = await Promise.all([
        reportService.getProjectMetrics(projectId),
        reportService.getVelocityTrends(projectId),
        reportService.getTeamMetrics(projectId),
        reportService.getCycleTimeAnalytics(projectId, dateRange),
        reportService.getCompletionRateAnalytics(projectId)
      ]);

      // Update all data and loading states in a single setState call
      setState(prev => ({
        ...prev,
        projectMetrics: metrics,
        velocityData: velocity,
        teamMetrics: team,
        cycleTimeAnalytics: cycleTime,
        completionRateAnalytics: completion,
        loadingStates: {
          projectMetrics: 'succeeded',
          velocityData: 'succeeded',
          teamMetrics: 'succeeded',
          cycleTimeAnalytics: 'succeeded',
          completionRateAnalytics: 'succeeded'
        }
      }));
    } catch (error) {
      setError(error, 'Failed to load analytics data');
      setState(prev => ({
        ...prev,
        loadingStates: {
          projectMetrics: 'failed',
          velocityData: 'failed',
          teamMetrics: 'failed',
          cycleTimeAnalytics: 'failed',
          completionRateAnalytics: 'failed'
        }
      }));
    }
  }, [projectId, dateRange, setError]);

  // Store fetchAllAnalytics in a ref to avoid dependency cycles
  const fetchAllAnalyticsRef = useRef(fetchAllAnalytics);
  useEffect(() => {
    fetchAllAnalyticsRef.current = fetchAllAnalytics;
  }, [fetchAllAnalytics]);

  const refreshAnalytics = useCallback(() => {
    fetchAllAnalytics();
  }, [fetchAllAnalytics]);

  const exportReport = useCallback(async (
    reportType: string, 
    format: 'csv' | 'json' | 'pdf' = 'json'
  ): Promise<string | Blob> => {
    try {
      return await reportService.exportReportData(reportType, projectId, format);
    } catch (error) {
      setError(error, 'Failed to export report data');
      throw error;
    }
  }, [projectId, setError]);

  // Initial data fetch
  useEffect(() => {
    if (projectId) {
      fetchAllAnalyticsRef.current();
    }
  }, [projectId, dateRange]);

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh || !projectId) return;

    const interval = setInterval(() => {
      fetchAllAnalyticsRef.current();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, projectId, dateRange]);

  // Computed values
  const isLoading = Object.values(state.loadingStates).some(status => status === 'loading');
  const hasError = Object.values(state.loadingStates).some(status => status === 'failed');
  const isInitialized = Object.values(state.loadingStates).every(status => status !== 'idle');

  return {
    // Data
    projectMetrics: state.projectMetrics,
    velocityData: state.velocityData,
    teamMetrics: state.teamMetrics,
    cycleTimeAnalytics: state.cycleTimeAnalytics,
    completionRateAnalytics: state.completionRateAnalytics,
    
    // Loading states
    loadingStates: state.loadingStates,
    isLoading,
    hasError,
    isInitialized,
    
    // Actions
    refreshAnalytics,
    fetchProjectMetrics,
    fetchVelocityData,
    fetchTeamMetrics,
    fetchCycleTimeAnalytics,
    fetchCompletionRateAnalytics,
    exportReport
  };
};
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useAnalytics } from '../useAnalytics';
import { reportService } from '../../services/reportService';

// Mock the report service
vi.mock('../../services/reportService', () => ({
  reportService: {
    getProjectMetrics: vi.fn(),
    getVelocityTrends: vi.fn(),
    getTeamMetrics: vi.fn(),
    getCycleTimeAnalytics: vi.fn(),
    getCompletionRateAnalytics: vi.fn(),
    exportReportData: vi.fn()
  }
}));

// Mock the error handler hook
vi.mock('../useErrorHandler', () => ({
  useErrorHandler: () => ({
    setError: vi.fn()
  })
}));

describe('useAnalytics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => 
      useAnalytics({ projectId: '' }) // Empty projectId to test initial state
    );

    expect(result.current.projectMetrics).toBeNull();
    expect(result.current.velocityData).toEqual([]);
    expect(result.current.teamMetrics).toEqual([]);
    expect(result.current.cycleTimeAnalytics).toBeNull();
    expect(result.current.completionRateAnalytics).toBeNull();
    expect(result.current.isLoading).toBe(false); // Should not be loading without projectId
    expect(result.current.hasError).toBe(false);
    expect(result.current.isInitialized).toBe(false);
  });

  it('should fetch all analytics data on mount', async () => {
    const mockProjectMetrics = {
      totalWorkItems: 50,
      completedWorkItems: 30,
      averageCycleTime: 5.5,
      averageLeadTime: 7.2,
      throughput: 2.1,
      velocity: [],
      burndownData: []
    };

    const mockVelocityData = [
      { sprintName: 'Sprint 1', completedPoints: 25, committedPoints: 30, sprintNumber: 1 }
    ];

    const mockTeamMetrics = [
      {
        memberId: 'user-1',
        memberName: 'John Doe',
        completedItems: 15,
        averageCycleTime: 3.5,
        workload: 5,
        utilization: 75.0
      }
    ];

    const mockCycleTimeAnalytics = {
      averageCycleTime: 4.2,
      averageLeadTime: 6.1,
      throughput: 1.8
    };

    const mockCompletionRateAnalytics = {
      totalItems: 100,
      completedItems: 75,
      completionRate: 75.0,
      completionTrend: []
    };

    vi.mocked(reportService.getProjectMetrics).mockResolvedValue(mockProjectMetrics);
    vi.mocked(reportService.getVelocityTrends).mockResolvedValue(mockVelocityData);
    vi.mocked(reportService.getTeamMetrics).mockResolvedValue(mockTeamMetrics);
    vi.mocked(reportService.getCycleTimeAnalytics).mockResolvedValue(mockCycleTimeAnalytics);
    vi.mocked(reportService.getCompletionRateAnalytics).mockResolvedValue(mockCompletionRateAnalytics);

    const { result } = renderHook(() => 
      useAnalytics({ projectId: 'project-1' })
    );

    await waitFor(() => {
      expect(result.current.projectMetrics).toEqual(mockProjectMetrics);
    });
    await waitFor(() => {
      expect(result.current.velocityData).toEqual(mockVelocityData);
    });
    await waitFor(() => {
      expect(result.current.teamMetrics).toEqual(mockTeamMetrics);
    });
    await waitFor(() => {
      expect(result.current.cycleTimeAnalytics).toEqual(mockCycleTimeAnalytics);
    });
    await waitFor(() => {
      expect(result.current.completionRateAnalytics).toEqual(mockCompletionRateAnalytics);
    });

    expect(reportService.getProjectMetrics).toHaveBeenCalledWith('project-1');
    expect(reportService.getVelocityTrends).toHaveBeenCalledWith('project-1');
    expect(reportService.getTeamMetrics).toHaveBeenCalledWith('project-1');
    expect(reportService.getCycleTimeAnalytics).toHaveBeenCalledWith('project-1', undefined);
    expect(reportService.getCompletionRateAnalytics).toHaveBeenCalledWith('project-1');
  });

  it('should handle fetch errors gracefully', async () => {
    vi.mocked(reportService.getProjectMetrics).mockRejectedValue(new Error('API Error'));
    vi.mocked(reportService.getVelocityTrends).mockResolvedValue([]);
    vi.mocked(reportService.getTeamMetrics).mockResolvedValue([]);
    vi.mocked(reportService.getCycleTimeAnalytics).mockResolvedValue({
      averageCycleTime: 0,
      averageLeadTime: 0,
      throughput: 0
    });
    vi.mocked(reportService.getCompletionRateAnalytics).mockResolvedValue({
      totalItems: 0,
      completedItems: 0,
      completionRate: 0,
      completionTrend: []
    });

    const { result } = renderHook(() => 
      useAnalytics({ projectId: 'project-1' })
    );

    await waitFor(() => {
      expect(result.current.loadingStates.projectMetrics).toBe('failed');
    });

    expect(result.current.projectMetrics).toBeNull();
    expect(result.current.hasError).toBe(true);
  });

  it('should refresh analytics data when refreshAnalytics is called', async () => {
    const mockProjectMetrics = {
      totalWorkItems: 50,
      completedWorkItems: 30,
      averageCycleTime: 5.5,
      averageLeadTime: 7.2,
      throughput: 2.1,
      velocity: [],
      burndownData: []
    };

    vi.mocked(reportService.getProjectMetrics).mockResolvedValue(mockProjectMetrics);
    vi.mocked(reportService.getVelocityTrends).mockResolvedValue([]);
    vi.mocked(reportService.getTeamMetrics).mockResolvedValue([]);
    vi.mocked(reportService.getCycleTimeAnalytics).mockResolvedValue({
      averageCycleTime: 0,
      averageLeadTime: 0,
      throughput: 0
    });
    vi.mocked(reportService.getCompletionRateAnalytics).mockResolvedValue({
      totalItems: 0,
      completedItems: 0,
      completionRate: 0,
      completionTrend: []
    });

    const { result } = renderHook(() => 
      useAnalytics({ projectId: 'project-1' })
    );

    await waitFor(() => {
      expect(result.current.isInitialized).toBe(true);
    });

    // Clear previous calls
    vi.clearAllMocks();

    // Call refresh
    result.current.refreshAnalytics();

    await waitFor(() => {
      expect(reportService.getProjectMetrics).toHaveBeenCalledWith('project-1');
    });

    expect(reportService.getVelocityTrends).toHaveBeenCalledWith('project-1');
    expect(reportService.getTeamMetrics).toHaveBeenCalledWith('project-1');
    expect(reportService.getCycleTimeAnalytics).toHaveBeenCalledWith('project-1', undefined);
    expect(reportService.getCompletionRateAnalytics).toHaveBeenCalledWith('project-1');
  });

  it('should export report data as CSV', async () => {
    const mockExportData = 'exported,data\n1,2\n3,4';
    vi.mocked(reportService.exportReportData).mockResolvedValue(mockExportData);

    const { result } = renderHook(() => 
      useAnalytics({ projectId: 'project-1' })
    );

    const exportedData = await result.current.exportReport('velocity-trends', 'csv');

    expect(exportedData).toBe(mockExportData);
    expect(reportService.exportReportData).toHaveBeenCalledWith('velocity-trends', 'project-1', 'csv');
  });

  it('should export report data as PDF', async () => {
    const mockPdfBlob = new Blob(['pdf content'], { type: 'application/pdf' });
    vi.mocked(reportService.exportReportData).mockResolvedValue(mockPdfBlob);

    const { result } = renderHook(() => 
      useAnalytics({ projectId: 'project-1' })
    );

    const exportedData = await result.current.exportReport('project-metrics', 'pdf');

    expect(exportedData).toBe(mockPdfBlob);
    expect(reportService.exportReportData).toHaveBeenCalledWith('project-metrics', 'project-1', 'pdf');
  });

  it('should handle date range in cycle time analytics', async () => {
    const dateRange = {
      start: new Date('2024-01-01'),
      end: new Date('2024-01-31')
    };

    vi.mocked(reportService.getProjectMetrics).mockResolvedValue({
      totalWorkItems: 0,
      completedWorkItems: 0,
      averageCycleTime: 0,
      averageLeadTime: 0,
      throughput: 0,
      velocity: [],
      burndownData: []
    });
    vi.mocked(reportService.getVelocityTrends).mockResolvedValue([]);
    vi.mocked(reportService.getTeamMetrics).mockResolvedValue([]);
    vi.mocked(reportService.getCycleTimeAnalytics).mockResolvedValue({
      averageCycleTime: 0,
      averageLeadTime: 0,
      throughput: 0
    });
    vi.mocked(reportService.getCompletionRateAnalytics).mockResolvedValue({
      totalItems: 0,
      completedItems: 0,
      completionRate: 0,
      completionTrend: []
    });

    renderHook(() => 
      useAnalytics({ 
        projectId: 'project-1',
        dateRange 
      })
    );

    await waitFor(() => {
      expect(reportService.getCycleTimeAnalytics).toHaveBeenCalledWith('project-1', dateRange);
    });
  });

  it('should not fetch data when projectId is not provided', () => {
    renderHook(() => 
      useAnalytics({ projectId: '' })
    );

    expect(reportService.getProjectMetrics).not.toHaveBeenCalled();
    expect(reportService.getVelocityTrends).not.toHaveBeenCalled();
    expect(reportService.getTeamMetrics).not.toHaveBeenCalled();
    expect(reportService.getCycleTimeAnalytics).not.toHaveBeenCalled();
    expect(reportService.getCompletionRateAnalytics).not.toHaveBeenCalled();
  });
});
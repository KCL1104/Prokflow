import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AnalyticsDashboard } from '../AnalyticsDashboard';
import { useAnalytics } from '../../../hooks';

// Mock the useAnalytics hook
const mockAnalyticsData = {
  projectMetrics: {
    totalWorkItems: 50,
    completedWorkItems: 30,
    averageCycleTime: 5.5,
    averageLeadTime: 7.2,
    throughput: 2.1,
    velocity: [],
    burndownData: []
  },
  velocityData: [
    { sprintName: 'Sprint 1', completedPoints: 25, committedPoints: 30, sprintNumber: 1 },
    { sprintName: 'Sprint 2', completedPoints: 28, committedPoints: 30, sprintNumber: 2 }
  ],
  teamMetrics: [
    {
      memberId: 'user-1',
      memberName: 'John Doe',
      completedItems: 15,
      averageCycleTime: 3.5,
      workload: 5,
      utilization: 75.0
    }
  ],
  cycleTimeAnalytics: {
    averageCycleTime: 4.2,
    averageLeadTime: 6.1,
    throughput: 1.8
  },
  completionRateAnalytics: {
    totalItems: 100,
    completedItems: 75,
    completionRate: 75.0,
    completionTrend: [
      { date: '2024-01-01', completed: 10, total: 100 },
      { date: '2024-01-02', completed: 15, total: 100 }
    ]
  },
  loadingStates: {
    projectMetrics: 'succeeded' as const,
    velocityData: 'succeeded' as const,
    teamMetrics: 'succeeded' as const,
    cycleTimeAnalytics: 'succeeded' as const,
    completionRateAnalytics: 'succeeded' as const
  },
  isLoading: false,
  hasError: false,
  isInitialized: true,
  refreshAnalytics: vi.fn(),
  fetchProjectMetrics: vi.fn(),
  fetchVelocityData: vi.fn(),
  fetchTeamMetrics: vi.fn(),
  fetchCycleTimeAnalytics: vi.fn(),
  fetchCompletionRateAnalytics: vi.fn(),
  exportReport: vi.fn()
};

vi.mock('../../hooks/useAnalytics', () => ({
  useAnalytics: vi.fn(() => mockAnalyticsData)
}));

// Mock chart components
vi.mock('../../charts/VelocityChart', () => ({
  VelocityChart: ({ data, className }: { data: unknown[]; className?: string }) => (
    <div data-testid="velocity-chart" className={className}>
      Velocity Chart with {data.length} sprints
    </div>
  )
}));

vi.mock('../../charts/CycleTimeChart', () => ({
  CycleTimeChart: ({ averageCycleTime, className }: { data?: unknown[]; averageCycleTime: number; averageLeadTime?: number; className?: string }) => (
    <div data-testid="cycle-time-chart" className={className}>
      Cycle Time Chart - Avg: {averageCycleTime} days
    </div>
  )
}));

vi.mock('../../charts/CompletionRateChart', () => ({
  CompletionRateChart: ({ completionRate, className }: { completionRate: number; completionTrend?: unknown[]; totalItems?: number; completedItems?: number; className?: string }) => (
    <div data-testid="completion-rate-chart" className={className}>
      Completion Rate: {completionRate}%
    </div>
  )
}));

describe('AnalyticsDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.skip('should render analytics dashboard with all components', () => {
    render(<AnalyticsDashboard projectId="project-1" />);

    // Check header
    expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Project performance metrics and insights')).toBeInTheDocument();

    // Check metric cards
    expect(screen.getByText('Total Work Items')).toBeInTheDocument();
    expect(screen.getByText('Completion Rate')).toBeInTheDocument();
    expect(screen.getByText('Average Cycle Time')).toBeInTheDocument();
    expect(screen.getByText('Throughput')).toBeInTheDocument();

    // Check charts
    expect(screen.getByTestId('velocity-chart')).toBeInTheDocument();
    expect(screen.getByTestId('cycle-time-chart')).toBeInTheDocument();
    expect(screen.getByTestId('completion-rate-chart')).toBeInTheDocument();

    // Check team metrics table
    expect(screen.getByText('Team Performance')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it.skip('should handle refresh button click', () => {
    render(<AnalyticsDashboard projectId="project-1" />);

    const refreshButton = screen.getByRole('button', { name: /refresh/i });
    fireEvent.click(refreshButton);

    expect(mockAnalyticsData.refreshAnalytics).toHaveBeenCalled();
  });

  it('should handle auto-refresh toggle', () => {
    render(<AnalyticsDashboard projectId="project-1" />);

    const autoRefreshCheckbox = screen.getByRole('checkbox', { name: /auto-refresh/i });
    fireEvent.click(autoRefreshCheckbox);

    expect(autoRefreshCheckbox).toBeChecked();
  });

  it.skip('should handle export functionality', async () => {
    const mockExportData = 'test,data\n1,2';
    mockAnalyticsData.exportReport.mockResolvedValue(mockExportData);

    // Mock URL.createObjectURL and related DOM methods
    global.URL.createObjectURL = vi.fn(() => 'mock-url');
    global.URL.revokeObjectURL = vi.fn();
    
    const mockAppendChild = vi.fn();
    const mockRemoveChild = vi.fn();
    const mockClick = vi.fn();
    
    Object.defineProperty(document, 'createElement', {
      value: vi.fn(() => ({
        href: '',
        download: '',
        click: mockClick
      }))
    });
    
    Object.defineProperty(document.body, 'appendChild', {
      value: mockAppendChild
    });
    
    Object.defineProperty(document.body, 'removeChild', {
      value: mockRemoveChild
    });

    render(<AnalyticsDashboard projectId="project-1" />);

    const exportSelect = screen.getByDisplayValue('Export...');
    fireEvent.change(exportSelect, { target: { value: 'project-metrics:csv' } });

    await vi.waitFor(() => {
      expect(mockAnalyticsData.exportReport).toHaveBeenCalledWith('project-metrics', 'csv');
    });
  });

  it.skip('should show loading state when data is loading', () => {
    const loadingAnalyticsData = {
      ...mockAnalyticsData,
      isLoading: true,
      loadingStates: {
        ...mockAnalyticsData.loadingStates,
        teamMetrics: 'loading' as const
      }
    };

    // Update the mock to return loading state
    vi.doMock('../../hooks/useAnalytics', () => ({
      useAnalytics: vi.fn(() => loadingAnalyticsData)
    }));

    render(<AnalyticsDashboard projectId="project-1" />);

    // Should show loading indicators
    expect(screen.getByRole('button', { name: /refresh/i })).toBeDisabled();
  });

  it.skip('should show empty state when no team metrics available', () => {
    const emptyAnalyticsData = {
      ...mockAnalyticsData,
      teamMetrics: []
    };

    vi.mocked(useAnalytics).mockReturnValue(emptyAnalyticsData);

    render(<AnalyticsDashboard projectId="project-1" />);

    expect(screen.getByText('No team metrics available')).toBeInTheDocument();
  });

  it.skip('should display correct trend indicators for metrics', () => {
    render(<AnalyticsDashboard projectId="project-1" />);

    // Completion rate is 75%, which should show "Below Target" (< 80%)
    expect(screen.getByText('Below Target')).toBeInTheDocument();
  });

  it.skip('should handle utilization color coding in team metrics', () => {
    render(<AnalyticsDashboard projectId="project-1" />);

    // John Doe has 75% utilization, which should be in the yellow range (60-80%)
    const utilizationBar = screen.getByText('75.0%').parentElement?.querySelector('.bg-yellow-500');
    expect(utilizationBar).toBeInTheDocument();
  });
});
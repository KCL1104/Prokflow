import { render, screen } from '@testing-library/react';
import { SprintProgressIndicator } from '../SprintProgressIndicator';
import type { Sprint } from '../../../types';
import { vi } from 'vitest';

describe('SprintProgressIndicator', () => {
  const mockSprint: Sprint = {
    id: 'sprint-1',
    projectId: 'project-1',
    name: 'Sprint 1',
    goal: 'Complete user authentication',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-01-14'),
    status: 'active',
    capacity: 40,
    workItems: ['item-1', 'item-2'],
    createdAt: new Date('2024-01-01'),
  };

  const mockMetrics = {
    totalItems: 5,
    completedItems: 2,
    totalPoints: 25,
    completedPoints: 10,
    remainingPoints: 15,
    progressPercentage: 40,
  };

  beforeEach(() => {
    // Mock current date to be in the middle of the sprint
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-08')); // Day 7 of 14-day sprint
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders sprint timeline information', () => {
    render(
      <SprintProgressIndicator
        sprint={mockSprint}
        metrics={mockMetrics}
      />
    );

    expect(screen.getByText(/2024\/1\/1.*-.*2024\/1\/14/)).toBeInTheDocument();
    expect(screen.getByText(/6.*days.*remaining/)).toBeInTheDocument();
  });

  it('displays work progress correctly', () => {
    render(
      <SprintProgressIndicator
        sprint={mockSprint}
        metrics={mockMetrics}
      />
    );

    expect(screen.getByText('Work Progress')).toBeInTheDocument();
    expect(screen.getByText('2/5 items')).toBeInTheDocument();
    expect(screen.getByText('10 pts completed')).toBeInTheDocument();
    expect(screen.getByText('15 pts remaining')).toBeInTheDocument();
  });

  it('displays time progress correctly', () => {
    render(
      <SprintProgressIndicator
        sprint={mockSprint}
        metrics={mockMetrics}
      />
    );

    expect(screen.getByText('Time Progress')).toBeInTheDocument();
    expect(screen.getByText(/7.*\/.*13.*days/)).toBeInTheDocument(); // 7 elapsed / 13 total days
    expect(screen.getByText(/54.*%.*elapsed/)).toBeInTheDocument();
    expect(screen.getByText(/6.*days.*left/)).toBeInTheDocument();
  });

  it('shows "On Track" status when progress matches time', () => {
    const onTrackMetrics = {
      ...mockMetrics,
      progressPercentage: 50, // Matches 50% time elapsed
    };

    render(
      <SprintProgressIndicator
        sprint={mockSprint}
        metrics={onTrackMetrics}
      />
    );

    expect(screen.getByText('On Track')).toBeInTheDocument();
  });

  it('shows "Ahead of Schedule" status when progress exceeds time', () => {
    const aheadMetrics = {
      ...mockMetrics,
      progressPercentage: 70, // 70% vs 50% time elapsed
    };

    render(
      <SprintProgressIndicator
        sprint={mockSprint}
        metrics={aheadMetrics}
      />
    );

    expect(screen.getByText('Ahead of Schedule')).toBeInTheDocument();
  });

  it('shows "Behind Schedule" status when progress lags time', () => {
    const behindMetrics = {
      ...mockMetrics,
      progressPercentage: 25, // 25% vs 50% time elapsed
    };

    render(
      <SprintProgressIndicator
        sprint={mockSprint}
        metrics={behindMetrics}
      />
    );

    expect(screen.getByText('Behind Schedule')).toBeInTheDocument();
  });

  it('displays sprint capacity', () => {
    render(
      <SprintProgressIndicator
        sprint={mockSprint}
        metrics={mockMetrics}
      />
    );

    expect(screen.getByText('Capacity: 40 pts')).toBeInTheDocument();
  });

  it('displays key metrics', () => {
    render(
      <SprintProgressIndicator
        sprint={mockSprint}
        metrics={mockMetrics}
      />
    );

    expect(screen.getByText('25')).toBeInTheDocument(); // Total Points
    expect(screen.getByText('Total Points')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument(); // Completed
    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument(); // Remaining
    expect(screen.getByText('Remaining')).toBeInTheDocument();
  });

  it('displays sprint velocity information', () => {
    render(
      <SprintProgressIndicator
        sprint={mockSprint}
        metrics={mockMetrics}
      />
    );

    expect(screen.getByText('Sprint Velocity')).toBeInTheDocument();
    expect(screen.getByText('Current pace: 1.4 pts/day')).toBeInTheDocument(); // 10 pts / 7 days
    expect(screen.getByText('40%')).toBeInTheDocument();
    expect(screen.getByText('Complete')).toBeInTheDocument();
  });

  it('shows projected completion when behind schedule', () => {
    const behindMetrics = {
      ...mockMetrics,
      progressPercentage: 20,
      completedPoints: 5,
      remainingPoints: 20,
    };

    render(
      <SprintProgressIndicator
        sprint={mockSprint}
        metrics={behindMetrics}
      />
    );

    // With 5 pts completed in 7 days (0.71 pts/day), 20 pts remaining would take ~28 days
    // So it should show late completion
    expect(screen.getByText(/days late/)).toBeInTheDocument();
  });

  it('shows projected early completion when ahead of schedule', () => {
    const aheadMetrics = {
      ...mockMetrics,
      progressPercentage: 80,
      completedPoints: 20,
      remainingPoints: 5,
    };

    render(
      <SprintProgressIndicator
        sprint={mockSprint}
        metrics={aheadMetrics}
      />
    );

    // With 20 pts completed in 7 days (~2.86 pts/day), 5 pts remaining would take ~2 days
    // So it should show early completion
    expect(screen.getByText(/days early/)).toBeInTheDocument();
  });

  it('handles zero progress gracefully', () => {
    const zeroMetrics = {
      totalItems: 5,
      completedItems: 0,
      totalPoints: 25,
      completedPoints: 0,
      remainingPoints: 25,
      progressPercentage: 0,
    };

    render(
      <SprintProgressIndicator
        sprint={mockSprint}
        metrics={zeroMetrics}
      />
    );

    expect(screen.getByText('0/5 items')).toBeInTheDocument();
    expect(screen.getByText('0 pts completed')).toBeInTheDocument();
    expect(screen.getByText('25 pts remaining')).toBeInTheDocument();
    expect(screen.getByText('No progress detected - review sprint scope')).toBeInTheDocument();
  });

  it('handles single day remaining correctly', () => {
    vi.setSystemTime(new Date('2024-01-13')); // 1 day before end

    render(
      <SprintProgressIndicator
        sprint={mockSprint}
        metrics={mockMetrics}
      />
    );

    expect(screen.getByText(/1.*day.*remaining/)).toBeInTheDocument();
  });

  it('handles sprint end date correctly', () => {
    vi.setSystemTime(new Date('2024-01-14')); // Sprint end date

    render(
      <SprintProgressIndicator
        sprint={mockSprint}
        metrics={mockMetrics}
      />
    );

    expect(screen.getByText(/0.*days.*remaining/)).toBeInTheDocument();
  });
});
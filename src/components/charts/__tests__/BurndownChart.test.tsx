import { render, screen } from '@testing-library/react';
import { BurndownChart } from '../BurndownChart';
import type { BurndownData } from '../../../types';

import { vi } from 'vitest';

// Mock Chart.js to avoid canvas issues in tests
vi.mock('react-chartjs-2', () => ({
  Line: ({ data, options }: any) => (
    <div data-testid="burndown-chart">
      <div data-testid="chart-title">{options.plugins.title.text}</div>
      <div data-testid="chart-data">{JSON.stringify(data)}</div>
    </div>
  ),
}));

vi.mock('chart.js', () => ({
  Chart: {
    register: vi.fn(),
  },
  CategoryScale: {},
  LinearScale: {},
  PointElement: {},
  LineElement: {},
  Title: {},
  Tooltip: {},
  Legend: {},
}));

describe('BurndownChart', () => {
  const mockBurndownData: BurndownData[] = [
    {
      date: '2024-01-01',
      remainingPoints: 20,
      idealRemaining: 20,
    },
    {
      date: '2024-01-02',
      remainingPoints: 15,
      idealRemaining: 16,
    },
    {
      date: '2024-01-03',
      remainingPoints: 10,
      idealRemaining: 12,
    },
    {
      date: '2024-01-04',
      remainingPoints: 5,
      idealRemaining: 8,
    },
    {
      date: '2024-01-05',
      remainingPoints: 0,
      idealRemaining: 4,
    },
  ];

  it('renders chart with data', () => {
    render(
      <BurndownChart 
        data={mockBurndownData} 
        sprintName="Test Sprint" 
      />
    );

    expect(screen.getByTestId('burndown-chart')).toBeInTheDocument();
    expect(screen.getByTestId('chart-title')).toHaveTextContent('Test Sprint - Burndown Chart');
  });

  it('shows ahead of schedule status when actual is below ideal', () => {
    render(
      <BurndownChart 
        data={mockBurndownData} 
        sprintName="Test Sprint" 
      />
    );

    expect(screen.getByText('Ahead of Schedule')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('shows behind schedule status when actual is above ideal', () => {
    const behindScheduleData: BurndownData[] = [
      {
        date: '2024-01-01',
        remainingPoints: 20,
        idealRemaining: 20,
      },
      {
        date: '2024-01-02',
        remainingPoints: 18,
        idealRemaining: 15,
      },
    ];

    render(
      <BurndownChart 
        data={behindScheduleData} 
        sprintName="Test Sprint" 
      />
    );

    expect(screen.getByText('Behind Schedule')).toBeInTheDocument();
    expect(screen.getByText('18')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
  });

  it('shows on track status when actual equals ideal', () => {
    const onTrackData: BurndownData[] = [
      {
        date: '2024-01-01',
        remainingPoints: 20,
        idealRemaining: 20,
      },
      {
        date: '2024-01-02',
        remainingPoints: 15,
        idealRemaining: 15,
      },
    ];

    render(
      <BurndownChart 
        data={onTrackData} 
        sprintName="Test Sprint" 
      />
    );

    expect(screen.getByText('On Track')).toBeInTheDocument();
    // Check for the numbers separately since they're in different spans
    const fifteens = screen.getAllByText('15');
    expect(fifteens).toHaveLength(2); // Should appear twice (actual and ideal)
  });

  it('renders empty state when no data provided', () => {
    render(
      <BurndownChart 
        data={[]} 
        sprintName="Test Sprint" 
      />
    );

    expect(screen.getByText('No burndown data available')).toBeInTheDocument();
    expect(screen.getByText('Data will appear as work progresses during the sprint')).toBeInTheDocument();
  });

  it('renders chart legend and info', () => {
    render(
      <BurndownChart 
        data={mockBurndownData} 
        sprintName="Test Sprint" 
      />
    );

    expect(screen.getByText('Actual progress')).toBeInTheDocument();
    expect(screen.getByText('Ideal burndown')).toBeInTheDocument();
    expect(screen.getByText('Updated daily based on completed work')).toBeInTheDocument();
  });
});
import { render, screen } from '@testing-library/react';
import { BurndownChart } from '../BurndownChart';
import type { BurndownData } from '../../../types';

import { vi } from 'vitest';

// Mock Chart.js to avoid canvas issues in tests
vi.mock('react-chartjs-2', () => ({
<<<<<<< HEAD
  Line: ({ data, options }: any) => (
=======
  Line: ({ data, options }: { data: unknown; options: { plugins: { title: { text: string } } } }) => (
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
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

<<<<<<< HEAD
=======
// Mock the services
vi.mock('../../../services', () => ({
  sprintService: {
    getSprintBurndown: vi.fn(),
  },
}));

>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
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

<<<<<<< HEAD
  it('renders chart with data', () => {
    render(
      <BurndownChart 
        data={mockBurndownData} 
=======
  it('renders chart with data', async () => {
    const { sprintService } = await import('../../../services');
    vi.mocked(sprintService.getSprintBurndown).mockResolvedValue(mockBurndownData);

    render(
      <BurndownChart 
        sprintId="test-sprint-id"
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
        sprintName="Test Sprint" 
      />
    );

<<<<<<< HEAD
=======
    await screen.findByTestId('burndown-chart');
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
    expect(screen.getByTestId('burndown-chart')).toBeInTheDocument();
    expect(screen.getByTestId('chart-title')).toHaveTextContent('Test Sprint - Burndown Chart');
  });

<<<<<<< HEAD
  it('shows ahead of schedule status when actual is below ideal', () => {
    render(
      <BurndownChart 
        data={mockBurndownData} 
=======
  it('shows ahead of schedule status when actual is below ideal', async () => {
    // Mock the service to return test data
    const { sprintService } = await import('../../../services');
    vi.mocked(sprintService.getSprintBurndown).mockResolvedValue(mockBurndownData);

    render(
      <BurndownChart 
        sprintId="test-sprint-id"
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
        sprintName="Test Sprint" 
      />
    );

<<<<<<< HEAD
    expect(screen.getByText('Ahead of Schedule')).toBeInTheDocument();
=======
    // Wait for data to load and check status
    await screen.findByText('Ahead of Schedule');
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
  });

<<<<<<< HEAD
  it('shows behind schedule status when actual is above ideal', () => {
=======
  it('shows behind schedule status when actual is above ideal', async () => {
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
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

<<<<<<< HEAD
    render(
      <BurndownChart 
        data={behindScheduleData} 
=======
    const { sprintService } = await import('../../../services');
    vi.mocked(sprintService.getSprintBurndown).mockResolvedValue(behindScheduleData);

    render(
      <BurndownChart 
        sprintId="test-sprint-id"
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
        sprintName="Test Sprint" 
      />
    );

<<<<<<< HEAD
    expect(screen.getByText('Behind Schedule')).toBeInTheDocument();
=======
    await screen.findByText('Behind Schedule');
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
    expect(screen.getByText('18')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
  });

<<<<<<< HEAD
  it('shows on track status when actual equals ideal', () => {
=======
  it('shows on track status when actual equals ideal', async () => {
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
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

<<<<<<< HEAD
    render(
      <BurndownChart 
        data={onTrackData} 
=======
    const { sprintService } = await import('../../../services');
    vi.mocked(sprintService.getSprintBurndown).mockResolvedValue(onTrackData);

    render(
      <BurndownChart 
        sprintId="test-sprint-id"
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
        sprintName="Test Sprint" 
      />
    );

<<<<<<< HEAD
    expect(screen.getByText('On Track')).toBeInTheDocument();
=======
    await screen.findByText('On Track');
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
    // Check for the numbers separately since they're in different spans
    const fifteens = screen.getAllByText('15');
    expect(fifteens).toHaveLength(2); // Should appear twice (actual and ideal)
  });

<<<<<<< HEAD
  it('renders empty state when no data provided', () => {
    render(
      <BurndownChart 
        data={[]} 
=======
  it('renders empty state when no data provided', async () => {
    const { sprintService } = await import('../../../services');
    vi.mocked(sprintService.getSprintBurndown).mockResolvedValue([]);

    render(
      <BurndownChart 
        sprintId="test-sprint-id"
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
        sprintName="Test Sprint" 
      />
    );

<<<<<<< HEAD
    expect(screen.getByText('No burndown data available')).toBeInTheDocument();
    expect(screen.getByText('Data will appear as work progresses during the sprint')).toBeInTheDocument();
  });

  it('renders chart legend and info', () => {
    render(
      <BurndownChart 
        data={mockBurndownData} 
=======
    await screen.findByText('No burndown data available');
    expect(screen.getByText('Data will appear as work progresses during the sprint')).toBeInTheDocument();
  });

  it('renders chart legend and info', async () => {
    const { sprintService } = await import('../../../services');
    vi.mocked(sprintService.getSprintBurndown).mockResolvedValue(mockBurndownData);

    render(
      <BurndownChart 
        sprintId="test-sprint-id"
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
        sprintName="Test Sprint" 
      />
    );

<<<<<<< HEAD
=======
    await screen.findByText('Actual progress');
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
    expect(screen.getByText('Actual progress')).toBeInTheDocument();
    expect(screen.getByText('Ideal burndown')).toBeInTheDocument();
    expect(screen.getByText('Updated daily based on completed work')).toBeInTheDocument();
  });
});
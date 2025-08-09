import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { ResourceAllocationChart } from '../ResourceAllocationChart';
import type { WorkItem, TeamMember, User } from '../../../types';

// Mock Chart.js to avoid canvas issues in tests
vi.mock('react-chartjs-2', () => ({
  Bar: ({ data, options }: { data: unknown; options: { plugins: { title: { text: string } } } }) => (
    <div data-testid="resource-allocation-chart">
      <div data-testid="chart-title">{options.plugins.title.text}</div>
      <div data-testid="chart-data">{JSON.stringify(data)}</div>
    </div>
  ),
}));

vi.mock('chart.js', () => ({
  Chart: {
    register: vi.fn(),
  },
  CategoryScale: vi.fn(),
  LinearScale: vi.fn(),
  BarElement: vi.fn(),
  Title: vi.fn(),
  Tooltip: vi.fn(),
  Legend: vi.fn(),
}));

interface TeamMemberWithUser extends TeamMember {
  user: User;
}

describe('ResourceAllocationChart', () => {
  const mockUser: User = {
    id: 'user-1',
    email: 'john@example.com',
    fullName: 'John Doe',
    full_name: 'John Doe', // For compatibility
    avatarUrl: undefined,
    avatar_url: undefined, // For compatibility
    timezone: 'UTC',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  };

  const mockTeamMember: TeamMemberWithUser = {
    id: 'member-1',
    userId: 'user-1',
    projectId: 'project-1',
    role: 'member',
    joinedAt: new Date('2024-01-01'),
    user: mockUser,
  };

  const mockWorkItem: WorkItem = {
    id: 'item-1',
    projectId: 'project-1',
    title: 'Task 1',
    description: 'First task',
    type: 'task',
    status: 'In Progress',
    priority: 'high',
    assigneeId: 'user-1',
    reporterId: 'user-1',
    estimate: 20,
    actualTime: 0,
    dependencies: [],
    labels: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders resource allocation chart with team members', () => {
    render(
      <ResourceAllocationChart
        workItems={[mockWorkItem]}
        teamMembers={[mockTeamMember]}
      />
    );

    expect(screen.getByTestId('resource-allocation-chart')).toBeInTheDocument();
    expect(screen.getByTestId('chart-title')).toHaveTextContent('Team Resource Allocation');
  });

  it('displays summary statistics correctly', () => {
    render(
      <ResourceAllocationChart
        workItems={[mockWorkItem]}
        teamMembers={[mockTeamMember]}
      />
    );

    expect(screen.getByText('Team Members')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('shows empty state when no team members', () => {
    render(
      <ResourceAllocationChart
        workItems={[mockWorkItem]}
        teamMembers={[]}
      />
    );

    expect(screen.getByText('No team members found')).toBeInTheDocument();
    expect(screen.getByText('Add team members to see resource allocation')).toBeInTheDocument();
  });

  it('renders legend with utilization levels', () => {
    render(
      <ResourceAllocationChart
        workItems={[mockWorkItem]}
        teamMembers={[mockTeamMember]}
      />
    );

    expect(screen.getByText('Over-allocated (>100%)')).toBeInTheDocument();
    expect(screen.getByText('High utilization (80-100%)')).toBeInTheDocument();
    expect(screen.getByText('Normal utilization (60-80%)')).toBeInTheDocument();
    expect(screen.getByText('Low utilization (<60%)')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <ResourceAllocationChart
        workItems={[mockWorkItem]}
        teamMembers={[mockTeamMember]}
        className="custom-class"
      />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });
});
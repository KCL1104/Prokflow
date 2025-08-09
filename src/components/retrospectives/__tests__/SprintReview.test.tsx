import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi, type MockedFunction } from 'vitest';
import { SprintReview } from '../SprintReview';
import { useSprints } from '../../../hooks/useSprints';
import { useWorkItems } from '../../../hooks/useWorkItems';

// Mock the hooks
vi.mock('../../../hooks/useSprints');
vi.mock('../../../hooks/useWorkItems');
vi.mock('../../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: {
      id: 'user-1',
      email: 'test@example.com',
      aud: 'authenticated',
      role: 'authenticated',
      email_confirmed_at: new Date().toISOString(),
      phone: '',
      confirmed_at: new Date().toISOString(),
      last_sign_in_at: new Date().toISOString(),
      app_metadata: {},
      user_metadata: {
        full_name: 'Test User',
        avatar_url: undefined,
      },
      identities: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  })
}));

// Mock the BurndownChart component
vi.mock('../../charts/BurndownChart', () => ({
  BurndownChart: ({ sprintId }: { sprintId: string }) => (
    <div data-testid="burndown-chart">Burndown Chart for {sprintId}</div>
  )
}));

// Mock the WorkItemCard component
vi.mock('../../work-items/WorkItemCard', () => ({
  WorkItemCard: ({ workItem }: { workItem: { title: string } }) => (
    <div data-testid="work-item-card">{workItem.title}</div>
  )
}));

const mockUseSprints = useSprints as MockedFunction<typeof useSprints>;
const mockUseWorkItems = useWorkItems as MockedFunction<typeof useWorkItems>;

const mockSprint = {
  id: 'sprint-1',
  name: 'Sprint 1',
  goal: 'Complete user authentication',
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-01-14'),
  status: 'completed' as const,
  capacity: 40,
  projectId: 'project-1',
  workItems: ['item-1', 'item-2', 'item-3'],
  createdAt: new Date('2023-12-15')
};

const mockWorkItems = [
  {
    id: 'item-1',
    title: 'Login Form',
    status: 'done',
    estimate: 8,
    type: 'story' as const,
    priority: 'high' as const,
    projectId: 'project-1',
    sprintId: 'sprint-1',
    description: 'Create login form',
    reporterId: 'user-1',
    createdAt: new Date('2023-12-20'),
    updatedAt: new Date('2024-01-10')
  },
  {
    id: 'item-2',
    title: 'Password Reset',
    status: 'in_progress',
    estimate: 5,
    type: 'story' as const,
    priority: 'medium' as const,
    projectId: 'project-1',
    sprintId: 'sprint-1',
    description: 'Implement password reset',
    reporterId: 'user-1',
    createdAt: new Date('2023-12-21'),
    updatedAt: new Date('2024-01-08')
  },
  {
    id: 'item-3',
    title: 'User Registration',
    status: 'completed',
    estimate: 13,
    type: 'story' as const,
    priority: 'high' as const,
    projectId: 'project-1',
    sprintId: 'sprint-1',
    description: 'Create user registration',
    reporterId: 'user-1',
    createdAt: new Date('2023-12-22'),
    updatedAt: new Date('2024-01-12')
  }
];

describe('SprintReview', () => {
  const mockGetSprint = vi.fn();
  const mockGetSprintWorkItems = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    mockGetSprint.mockResolvedValue(mockSprint);
    mockGetSprintWorkItems.mockResolvedValue(mockWorkItems);

    mockUseSprints.mockReturnValue({
      sprints: [],
      activeSprint: null,
      loading: false,
      error: null,
      fetchSprints: vi.fn(),
      fetchActiveSprint: vi.fn(),
      createSprint: vi.fn(),
      getSprint: mockGetSprint
    });

    mockUseWorkItems.mockReturnValue({
      workItems: [],
      loading: false,
      error: null,
      fetchBacklog: vi.fn(),
      createWorkItem: vi.fn(),
      updateWorkItem: vi.fn(),
      getSprintWorkItems: mockGetSprintWorkItems
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders sprint review with basic information', async () => {
    render(<SprintReview sprintId="sprint-1" onClose={mockOnClose} />);

    await waitFor(() => {
      expect(screen.getByText('Sprint Review: Sprint 1')).toBeInTheDocument();
    });

    expect(screen.getByText('Complete user authentication')).toBeInTheDocument();
    expect(screen.getByText('2024/1/1 - 2024/1/14')).toBeInTheDocument();
    expect(screen.getByText('13 days')).toBeInTheDocument();
    expect(screen.getByText('completed')).toBeInTheDocument();
  });

  it('displays correct metrics in overview tab', async () => {
    render(<SprintReview sprintId="sprint-1" />);

    await waitFor(() => {
      expect(screen.getByText('Sprint Review: Sprint 1')).toBeInTheDocument();
    });

    // Check metrics cards
    expect(screen.getByText('3')).toBeInTheDocument(); // Total items
    expect(screen.getByText('2')).toBeInTheDocument(); // Completed items
    expect(screen.getByText('21/26')).toBeInTheDocument(); // Story points (21 completed out of 26 total)
    expect(screen.getByText('81%')).toBeInTheDocument(); // Completion rate
  });

  it('switches between tabs correctly', async () => {
    render(<SprintReview sprintId="sprint-1" />);

    await waitFor(() => {
      expect(screen.getByText('Sprint Review: Sprint 1')).toBeInTheDocument();
    });

    // Click on Completed tab
    fireEvent.click(screen.getByText('Completed (2)'));
    expect(screen.getByText('Completed Work (2 items)')).toBeInTheDocument();
    expect(screen.getByText('Login Form')).toBeInTheDocument();
    expect(screen.getByText('User Registration')).toBeInTheDocument();

    // Click on Incomplete tab
    fireEvent.click(screen.getByText('Incomplete (1)'));
    expect(screen.getByText('Incomplete Work (1 items)')).toBeInTheDocument();
    expect(screen.getByText('Password Reset')).toBeInTheDocument();

    // Click on Metrics tab
    fireEvent.click(screen.getByText('Metrics'));
    expect(screen.getByText('Sprint Metrics')).toBeInTheDocument();
    expect(screen.getByTestId('burndown-chart')).toBeInTheDocument();
  });

  it('shows empty state for completed items when none exist', async () => {
    mockGetSprintWorkItems.mockResolvedValue([
      { ...mockWorkItems[1], status: 'in_progress' } // Only incomplete items
    ]);

    render(<SprintReview sprintId="sprint-1" />);

    await waitFor(() => {
      expect(screen.getByText('Sprint Review: Sprint 1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Completed (0)'));
    expect(screen.getByText('No completed items')).toBeInTheDocument();
    expect(screen.getByText('No work items were completed in this sprint.')).toBeInTheDocument();
  });

  it('shows success state for incomplete items when all are complete', async () => {
    mockGetSprintWorkItems.mockResolvedValue([
      { ...mockWorkItems[0], status: 'done' },
      { ...mockWorkItems[2], status: 'completed' }
    ]);

    render(<SprintReview sprintId="sprint-1" />);

    await waitFor(() => {
      expect(screen.getByText('Sprint Review: Sprint 1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Incomplete (0)'));
    expect(screen.getByText('All work completed!')).toBeInTheDocument();
    expect(screen.getByText('Congratulations! All planned work for this sprint was completed.')).toBeInTheDocument();
  });

  it('displays detailed metrics in metrics tab', async () => {
    render(<SprintReview sprintId="sprint-1" />);

    await waitFor(() => {
      expect(screen.getByText('Sprint Review: Sprint 1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Metrics'));

    // Check sprint statistics
    expect(screen.getByText('Sprint Duration:')).toBeInTheDocument();
    expect(screen.getByText('26')).toBeInTheDocument(); // Planned Story Points
    expect(screen.getByText('21')).toBeInTheDocument(); // Completed Story Points
    expect(screen.getByText('81%')).toBeInTheDocument(); // Completion Rate

    // Check work item analysis
    expect(screen.getByText('3')).toBeInTheDocument(); // Total Items
    expect(screen.getByText('2')).toBeInTheDocument(); // Completed Items
    expect(screen.getByText('1')).toBeInTheDocument(); // Incomplete Items
  });

  it('calls onClose when close button is clicked', async () => {
    render(<SprintReview sprintId="sprint-1" onClose={mockOnClose} />);

    await waitFor(() => {
      expect(screen.getByText('Sprint Review: Sprint 1')).toBeInTheDocument();
    });

    const buttons = screen.getAllByRole('button');
    const closeButton = buttons[0]; // First button should be the close button
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('handles loading state', () => {
    mockUseSprints.mockReturnValue({
      sprints: [],
      activeSprint: null,
      loading: true,
      error: null,
      fetchSprints: vi.fn(),
      fetchActiveSprint: vi.fn(),
      createSprint: vi.fn(),
      getSprint: mockGetSprint
    });

    render(<SprintReview sprintId="sprint-1" />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('handles error state', async () => {
    mockGetSprint.mockRejectedValue(new Error('Failed to load sprint'));

    render(<SprintReview sprintId="sprint-1" onClose={mockOnClose} />);

    await waitFor(() => {
      expect(screen.getByText(/Error loading sprint review/)).toBeInTheDocument();
    });

    expect(screen.getByText(/Failed to load sprint/)).toBeInTheDocument();
    expect(screen.getByText('Close')).toBeInTheDocument();
  });

  it('calculates work item breakdown correctly', async () => {
    render(<SprintReview sprintId="sprint-1" />);

    await waitFor(() => {
      expect(screen.getByText('Sprint Review: Sprint 1')).toBeInTheDocument();
    });

    // Check work item breakdown in overview
    expect(screen.getByText(/storys/)).toBeInTheDocument();
    expect(screen.getByText('2/3 completed')).toBeInTheDocument(); // 2 out of 3 stories completed
  });
});
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, type MockedFunction } from 'vitest';
import { SprintReviewList } from '../SprintReviewList';
import { useSprints } from '../../../hooks/useSprints';

// Mock the hooks
vi.mock('../../../hooks/useSprints');

const mockUseSprints = useSprints as MockedFunction<typeof useSprints>;

const mockSprints = [
  {
    id: 'sprint-1',
    name: 'Sprint 1',
    goal: 'Complete user authentication',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-01-14'),
    status: 'completed' as const,
    capacity: 40,
    projectId: 'project-1',
    workItems: ['item-1', 'item-2'],
    createdAt: new Date('2023-12-15')
  },
  {
    id: 'sprint-2',
    name: 'Sprint 2',
    goal: 'Implement dashboard',
    startDate: new Date('2024-01-15'),
    endDate: new Date('2024-01-28'),
    status: 'active' as const,
    capacity: 35,
    projectId: 'project-1',
    workItems: ['item-3', 'item-4'],
    createdAt: new Date('2024-01-10')
  },
  {
    id: 'sprint-3',
    name: 'Sprint 3',
    goal: 'Add reporting features',
    startDate: new Date('2024-02-01'),
    endDate: new Date('2024-02-14'),
    status: 'planning' as const,
    capacity: 30,
    projectId: 'project-1',
    workItems: [],
    createdAt: new Date('2024-01-25')
  }
];

describe('SprintReviewList', () => {
  const mockOnSprintSelect = vi.fn();

  beforeEach(() => {
    mockUseSprints.mockReturnValue({
      sprints: mockSprints,
      activeSprint: mockSprints[1],
      loading: false,
      error: null,
      fetchSprints: vi.fn(),
      fetchActiveSprint: vi.fn(),
      createSprint: vi.fn(),
      getSprint: vi.fn()
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders sprint review list with all sprints', () => {
    render(<SprintReviewList projectId="project-1" onSprintSelect={mockOnSprintSelect} />);

    expect(screen.getByText('Sprint Reviews')).toBeInTheDocument();
    expect(screen.getByText('Sprint 1')).toBeInTheDocument();
    expect(screen.getByText('Sprint 2')).toBeInTheDocument();
    expect(screen.getByText('Sprint 3')).toBeInTheDocument();
  });

  it('displays sprint information correctly', () => {
    render(<SprintReviewList projectId="project-1" onSprintSelect={mockOnSprintSelect} />);

    // Check Sprint 1 details
    expect(screen.getByText('Complete user authentication')).toBeInTheDocument();
    expect(screen.getByText('Jan 1, 2024 - Jan 14, 2024')).toBeInTheDocument();
    expect(screen.getAllByText('13 days')).toHaveLength(3); // All sprints have 13 days
    expect(screen.getByText('Capacity: 40 points')).toBeInTheDocument();
    expect(screen.getByText('completed')).toBeInTheDocument();

    // Check Sprint 2 details
    expect(screen.getByText('Implement dashboard')).toBeInTheDocument();
    expect(screen.getByText('Jan 15, 2024 - Jan 28, 2024')).toBeInTheDocument();
    expect(screen.getByText('Capacity: 35 points')).toBeInTheDocument();
    expect(screen.getByText('active')).toBeInTheDocument();
  });

  it('filters sprints by status', () => {
    render(<SprintReviewList projectId="project-1" onSprintSelect={mockOnSprintSelect} />);

    // Filter by completed sprints
    fireEvent.click(screen.getByText('Completed'));
    expect(screen.getByText('Sprint 1')).toBeInTheDocument();
    expect(screen.queryByText('Sprint 2')).not.toBeInTheDocument();
    expect(screen.queryByText('Sprint 3')).not.toBeInTheDocument();

    // Filter by active sprints
    fireEvent.click(screen.getByText('Active'));
    expect(screen.queryByText('Sprint 1')).not.toBeInTheDocument();
    expect(screen.getByText('Sprint 2')).toBeInTheDocument();
    expect(screen.queryByText('Sprint 3')).not.toBeInTheDocument();

    // Show all sprints
    fireEvent.click(screen.getByText('All Sprints'));
    expect(screen.getByText('Sprint 1')).toBeInTheDocument();
    expect(screen.getByText('Sprint 2')).toBeInTheDocument();
    expect(screen.getByText('Sprint 3')).toBeInTheDocument();
  });

  it('sorts sprints by end date in descending order', () => {
    render(<SprintReviewList projectId="project-1" onSprintSelect={mockOnSprintSelect} />);

    const sprintCards = screen.getAllByText(/Sprint \d/);
    expect(sprintCards[0]).toHaveTextContent('Sprint 3'); // Latest end date
    expect(sprintCards[1]).toHaveTextContent('Sprint 2');
    expect(sprintCards[2]).toHaveTextContent('Sprint 1'); // Earliest end date
  });

  it('calls onSprintSelect when review button is clicked', () => {
    render(<SprintReviewList projectId="project-1" onSprintSelect={mockOnSprintSelect} />);

    const reviewButtons = screen.getAllByText('Review Sprint');
    fireEvent.click(reviewButtons[0]);

    expect(mockOnSprintSelect).toHaveBeenCalledWith(mockSprints[2]); // Sprint 3 (first in sorted order)
  });

  it('shows empty state when no sprints match filter', () => {
    mockUseSprints.mockReturnValue({
      sprints: [mockSprints[0]], // Only completed sprint
      activeSprint: null,
      loading: false,
      error: null,
      fetchSprints: vi.fn(),
      fetchActiveSprint: vi.fn(),
      createSprint: vi.fn(),
      getSprint: vi.fn()
    });

    render(<SprintReviewList projectId="project-1" onSprintSelect={mockOnSprintSelect} />);

    // Filter by active sprints (none exist)
    fireEvent.click(screen.getByText('Active'));
    expect(screen.getByText('No active sprints')).toBeInTheDocument();
    expect(screen.getByText('Start a sprint to see it here.')).toBeInTheDocument();
  });

  it('shows empty state when no sprints exist', () => {
    mockUseSprints.mockReturnValue({
      sprints: [],
      activeSprint: null,
      loading: false,
      error: null,
      fetchSprints: vi.fn(),
      fetchActiveSprint: vi.fn(),
      createSprint: vi.fn(),
      getSprint: vi.fn()
    });

    render(<SprintReviewList projectId="project-1" onSprintSelect={mockOnSprintSelect} />);

    expect(screen.getByText('No sprints found')).toBeInTheDocument();
    expect(screen.getByText('Create sprints to review their progress and outcomes.')).toBeInTheDocument();
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
      getSprint: vi.fn()
    });

    render(<SprintReviewList projectId="project-1" onSprintSelect={mockOnSprintSelect} />);
    // The component shows empty state when loading with no sprints
    expect(screen.getByText('No sprints found')).toBeInTheDocument();
  });

  it('handles error state', () => {
    mockUseSprints.mockReturnValue({
      sprints: [],
      activeSprint: null,
      loading: false,
      error: 'Failed to load sprints',
      fetchSprints: vi.fn(),
      fetchActiveSprint: vi.fn(),
      createSprint: vi.fn(),
      getSprint: vi.fn()
    });

    render(<SprintReviewList projectId="project-1" onSprintSelect={mockOnSprintSelect} />);

    // The component shows empty state when there's an error with no sprints
    expect(screen.getByText('No sprints found')).toBeInTheDocument();
  });

  it('displays sprint goals when available', () => {
    render(<SprintReviewList projectId="project-1" onSprintSelect={mockOnSprintSelect} />);

    expect(screen.getByText('Complete user authentication')).toBeInTheDocument();
    expect(screen.getByText('Implement dashboard')).toBeInTheDocument();
    expect(screen.getByText('Add reporting features')).toBeInTheDocument();
  });

  it('shows correct status colors', () => {
    render(<SprintReviewList projectId="project-1" onSprintSelect={mockOnSprintSelect} />);

    const completedBadge = screen.getByText('completed');
    const activeBadge = screen.getByText('active');
    const planningBadge = screen.getByText('planning');

    expect(completedBadge).toHaveClass('text-green-600', 'bg-green-100');
    expect(activeBadge).toHaveClass('text-blue-600', 'bg-blue-100');
    expect(planningBadge).toHaveClass('text-gray-600', 'bg-gray-100');
  });

  it('displays creation dates correctly', () => {
    render(<SprintReviewList projectId="project-1" onSprintSelect={mockOnSprintSelect} />);

    expect(screen.getByText('Created Dec 15, 2023')).toBeInTheDocument();
    expect(screen.getByText('Created Jan 10, 2024')).toBeInTheDocument();
    expect(screen.getByText('Created Jan 25, 2024')).toBeInTheDocument();
  });
});
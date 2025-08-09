import { describe, it, expect, vi, beforeEach, type MockedFunction } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RetrospectiveList } from '../RetrospectiveList';
import { useRetrospectives } from '../../../hooks/useRetrospectives';
import { useAuth } from '../../../hooks/useAuth';
import { useTeamMembers } from '../../../hooks/useTeamMembers';
import { useSprints } from '../../../hooks/useSprints';
import type { Retrospective } from '../../../types';
import type { User } from '../../../types';

// Mock the hooks
vi.mock('../../../hooks/useRetrospectives');
vi.mock('../../../hooks/useAuth');
vi.mock('../../../hooks/useTeamMembers');
vi.mock('../../../hooks/useSprints');

const mockUseRetrospectives = useRetrospectives as MockedFunction<typeof useRetrospectives>;
const mockUseAuth = useAuth as MockedFunction<typeof useAuth>;
const mockUseTeamMembers = useTeamMembers as MockedFunction<typeof useTeamMembers>;
const mockUseSprints = useSprints as MockedFunction<typeof useSprints>;

const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  fullName: 'Test User',
  full_name: 'Test User', // For compatibility
  avatarUrl: undefined,
  avatar_url: undefined, // For compatibility
  timezone: 'UTC',
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-01T00:00:00Z'),
} as User;

const mockRetrospectives: Retrospective[] = [
  {
    id: '1',
    projectId: 'project-1',
    sprintId: 'sprint-1',
    title: 'Sprint 1 Retrospective',
    status: 'completed',
    facilitatorId: 'user-1',
    participants: ['user-1', 'user-2'],
    templateId: 'template-1',
    scheduledDate: new Date('2024-01-15'),
    completedAt: new Date('2024-01-15'),
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-15'),

  },
  {
    id: '2',
    projectId: 'project-1',
    sprintId: 'sprint-2',
    title: 'Sprint 2 Retrospective',
    status: 'in_progress',
    facilitatorId: 'user-2',
    participants: ['user-1', 'user-2', 'user-3'],
    templateId: 'template-2',
    scheduledDate: new Date('2024-01-30'),
    createdAt: new Date('2024-01-25'),
    updatedAt: new Date('2024-01-30'),


  }
];

describe('RetrospectiveList', () => {
  const mockCreateRetrospective = vi.fn();
  const mockDeleteRetrospective = vi.fn();
  const mockOnRetrospectiveSelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockUseRetrospectives.mockReturnValue({
      retrospectives: mockRetrospectives,
      retrospectivesLoading: false,
      retrospectivesError: null,
      templates: [],
      templatesLoading: false,
      templatesError: null,
      createRetrospective: mockCreateRetrospective,
      updateRetrospective: vi.fn(),
      deleteRetrospective: mockDeleteRetrospective,
      createTemplate: vi.fn(),
      refetchRetrospectives: vi.fn(),
      refetchTemplates: vi.fn()
    });

    mockUseAuth.mockReturnValue({
       user: mockUser,
       loading: false,
       signIn: vi.fn(),
       signUp: vi.fn(),
       signOut: vi.fn()
     });

    mockUseTeamMembers.mockReturnValue({
      teamMembers: [],
      loading: false,
      error: null,
      fetchTeamMembers: vi.fn()
    });

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
  });

  it('renders retrospectives list correctly', () => {
    render(
      <RetrospectiveList
        projectId="project-1"
        onRetrospectiveSelect={mockOnRetrospectiveSelect}
      />
    );

    expect(screen.getByText('Retrospectives')).toBeInTheDocument();
    expect(screen.getByText('New Retrospective')).toBeInTheDocument();
    expect(screen.getByText('Sprint 1 Retrospective')).toBeInTheDocument();
    expect(screen.getByText('Sprint 2 Retrospective')).toBeInTheDocument();
  });

  it('displays retrospective details correctly', () => {
    render(
      <RetrospectiveList
        projectId="project-1"
        onRetrospectiveSelect={mockOnRetrospectiveSelect}
      />
    );

    // Check first retrospective details
    expect(screen.getByText('Facilitator: John Doe')).toBeInTheDocument();
    expect(screen.getByText('2 participants')).toBeInTheDocument();
    expect(screen.getByText('Template: Start, Stop, Continue')).toBeInTheDocument();
    expect(screen.getByText('completed')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    mockUseRetrospectives.mockReturnValue({
      retrospectives: [],
      retrospectivesLoading: true,
      retrospectivesError: null,
      templates: [],
      templatesLoading: false,
      templatesError: null,
      createRetrospective: mockCreateRetrospective,
      updateRetrospective: vi.fn(),
      deleteRetrospective: mockDeleteRetrospective,
      createTemplate: vi.fn(),
      refetchRetrospectives: vi.fn(),
      refetchTemplates: vi.fn()
    });

    render(
      <RetrospectiveList
        projectId="project-1"
        onRetrospectiveSelect={mockOnRetrospectiveSelect}
      />
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows error state', () => {
    mockUseRetrospectives.mockReturnValue({
      retrospectives: [],
      retrospectivesLoading: false,
      retrospectivesError: 'Failed to load retrospectives',
      templates: [],
      templatesLoading: false,
      templatesError: null,
      createRetrospective: mockCreateRetrospective,
      updateRetrospective: vi.fn(),
      deleteRetrospective: mockDeleteRetrospective,
      createTemplate: vi.fn(),
      refetchRetrospectives: vi.fn(),
      refetchTemplates: vi.fn()
    });

    render(
      <RetrospectiveList
        projectId="project-1"
        onRetrospectiveSelect={mockOnRetrospectiveSelect}
      />
    );

    expect(screen.getByText('Error loading retrospectives: Failed to load retrospectives')).toBeInTheDocument();
    expect(screen.getByText('Try Again')).toBeInTheDocument();
  });

  it('shows empty state when no retrospectives', () => {
    mockUseRetrospectives.mockReturnValue({
      retrospectives: [],
      retrospectivesLoading: false,
      retrospectivesError: null,
      templates: [],
      templatesLoading: false,
      templatesError: null,
      createRetrospective: mockCreateRetrospective,
      updateRetrospective: vi.fn(),
      deleteRetrospective: mockDeleteRetrospective,
      createTemplate: vi.fn(),
      refetchRetrospectives: vi.fn(),
      refetchTemplates: vi.fn()
    });

    render(
      <RetrospectiveList
        projectId="project-1"
        onRetrospectiveSelect={mockOnRetrospectiveSelect}
      />
    );

    expect(screen.getByText('No retrospectives yet')).toBeInTheDocument();
    expect(screen.getByText('Create your first retrospective to gather team feedback and improve your process.')).toBeInTheDocument();
  });

  it('opens create form when New Retrospective button is clicked', () => {
    render(
      <RetrospectiveList
        projectId="project-1"
        onRetrospectiveSelect={mockOnRetrospectiveSelect}
      />
    );

    fireEvent.click(screen.getByText('New Retrospective'));
    expect(screen.getByText('Create New Retrospective')).toBeInTheDocument();
  });

  it('calls onRetrospectiveSelect when View button is clicked', () => {
    render(
      <RetrospectiveList
        projectId="project-1"
        onRetrospectiveSelect={mockOnRetrospectiveSelect}
      />
    );

    const viewButtons = screen.getAllByText('View');
    fireEvent.click(viewButtons[0]);

    expect(mockOnRetrospectiveSelect).toHaveBeenCalledWith(mockRetrospectives[0]);
  });

  it('deletes retrospective when delete button is clicked and confirmed', async () => {
    // Mock window.confirm to return true
    const originalConfirm = window.confirm;
    window.confirm = vi.fn(() => true);

    render(
      <RetrospectiveList
        projectId="project-1"
        onRetrospectiveSelect={mockOnRetrospectiveSelect}
      />
    );

    // Find the delete button by looking for buttons with red text color class
    const deleteButtons = screen.getAllByRole('button');
    const deleteButton = deleteButtons.find(button => 
      button.className.includes('text-red-600')
    );
    
    expect(deleteButton).toBeTruthy();
    fireEvent.click(deleteButton!);

    await waitFor(() => {
      expect(mockDeleteRetrospective).toHaveBeenCalledWith('1');
    });

    // Restore original confirm
    window.confirm = originalConfirm;
  });

  it('does not delete retrospective when delete is cancelled', async () => {
    // Mock window.confirm to return false
    const originalConfirm = window.confirm;
    window.confirm = vi.fn(() => false);

    render(
      <RetrospectiveList
        projectId="project-1"
        onRetrospectiveSelect={mockOnRetrospectiveSelect}
      />
    );

    // Find the delete button by looking for buttons with red text color class
    const deleteButtons = screen.getAllByRole('button');
    const deleteButton = deleteButtons.find(button => 
      button.className.includes('text-red-600')
    );
    
    expect(deleteButton).toBeTruthy();
    fireEvent.click(deleteButton!);

    expect(mockDeleteRetrospective).not.toHaveBeenCalled();

    // Restore original confirm
    window.confirm = originalConfirm;
  });

  it('formats dates correctly', () => {
    render(
      <RetrospectiveList
        projectId="project-1"
        onRetrospectiveSelect={mockOnRetrospectiveSelect}
      />
    );

    // Check for scheduled date from first retrospective
    expect(screen.getByText('Scheduled: Jan 15, 2024')).toBeInTheDocument();
    
    // Check for created and completed dates from first retrospective
    expect(screen.getByText(/Created Jan 10, 2024/)).toBeInTheDocument();
    expect(screen.getByText(/Completed Jan 15, 2024/)).toBeInTheDocument();
    
    // Check for created date from second retrospective (no completed date)
    expect(screen.getByText(/Created Jan 25, 2024/)).toBeInTheDocument();
  });

  it('displays correct status colors', () => {
    render(
      <RetrospectiveList
        projectId="project-1"
        onRetrospectiveSelect={mockOnRetrospectiveSelect}
      />
    );

    const completedStatus = screen.getByText('completed');
    const inProgressStatus = screen.getByText('in progress');

    expect(completedStatus).toHaveClass('text-green-600', 'bg-green-100');
    expect(inProgressStatus).toHaveClass('text-blue-600', 'bg-blue-100');
  });
});
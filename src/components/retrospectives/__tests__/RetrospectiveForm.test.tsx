import { describe, it, expect, vi, beforeEach, type MockedFunction } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RetrospectiveForm } from '../RetrospectiveForm';
import { useRetrospectives } from '../../../hooks/useRetrospectives';
import { useTeamMembers } from '../../../hooks/useTeamMembers';
import { useSprints } from '../../../hooks/useSprints';
import { useAuth } from '../../../hooks/useAuth';

// Mock the hooks
vi.mock('../../../hooks/useRetrospectives');
vi.mock('../../../hooks/useTeamMembers');
vi.mock('../../../hooks/useSprints');
vi.mock('../../../hooks/useAuth');

const mockUseRetrospectives = useRetrospectives as MockedFunction<typeof useRetrospectives>;
const mockUseTeamMembers = useTeamMembers as MockedFunction<typeof useTeamMembers>;
const mockUseSprints = useSprints as MockedFunction<typeof useSprints>;
const mockUseAuth = useAuth as MockedFunction<typeof useAuth>;

const mockTemplates = [
  {
    id: 'template-1',
    name: 'Start, Stop, Continue',
    description: 'Classic retrospective format',
    categories: [
      { name: 'Start', description: 'What should we start doing?', color: '#10B981' },
      { name: 'Stop', description: 'What should we stop doing?', color: '#EF4444' },
      { name: 'Continue', description: 'What should we continue doing?', color: '#3B82F6' }
    ],
    isDefault: true,
    createdBy: 'user-1',
    createdAt: new Date()
  }
];

const mockTeamMembers = [
  {
    id: 'member-1',
    userId: 'user-1',
    projectId: 'project-1',
    role: 'owner' as const,
    joinedAt: new Date(),
    user: { id: 'user-1', fullName: 'John Doe', email: 'john@example.com', timezone: 'UTC', createdAt: new Date(), updatedAt: new Date() }
  },
  {
    id: 'member-2',
    userId: 'user-2',
    projectId: 'project-1',
    role: 'member' as const,
    joinedAt: new Date(),
    user: { id: 'user-2', fullName: 'Jane Smith', email: 'jane@example.com', timezone: 'UTC', createdAt: new Date(), updatedAt: new Date() }
  }
];

const mockSprints = [
  {
    id: 'sprint-1',
    projectId: 'project-1',
    name: 'Sprint 1',
    goal: 'Complete user authentication',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-01-14'),
    status: 'completed' as const,
    capacity: 40,
    workItems: [],
    createdAt: new Date()
  },
  {
    id: 'sprint-2',
    projectId: 'project-1',
    name: 'Sprint 2',
    goal: 'Implement dashboard',
    startDate: new Date('2024-01-15'),
    endDate: new Date('2024-01-28'),
    status: 'active' as const,
    capacity: 40,
    workItems: [],
    createdAt: new Date()
  }
];

describe('RetrospectiveForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    mockUseAuth.mockReturnValue({
      user: {
        id: 'user-1',
        email: 'john@example.com',
        fullName: 'John Doe',
        full_name: 'John Doe',
        avatarUrl: undefined,
        avatar_url: undefined,
        timezone: 'UTC',
        createdAt: new Date(),
        updatedAt: new Date(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      loading: false,
      signIn: vi.fn(),
      signOut: vi.fn(),
      signUp: vi.fn()
    });

    mockUseRetrospectives.mockReturnValue({
      retrospectives: [],
      retrospectivesLoading: false,
      retrospectivesError: null,
      templates: mockTemplates,
      templatesLoading: false,
      templatesError: null,
      createRetrospective: vi.fn(),
      updateRetrospective: vi.fn(),
      deleteRetrospective: vi.fn(),
      createTemplate: vi.fn(),
      refetchRetrospectives: vi.fn(),
      refetchTemplates: vi.fn()
    });

    mockUseTeamMembers.mockReturnValue({
      teamMembers: mockTeamMembers,
      loading: false,
      error: null,
      fetchTeamMembers: vi.fn()
    });

    mockUseSprints.mockReturnValue({
      sprints: mockSprints,
      activeSprint: null,
      loading: false,
      error: null,
      fetchSprints: vi.fn(),
      fetchActiveSprint: vi.fn(),
      createSprint: vi.fn(),
      getSprint: vi.fn(),

    });
  });

  it('renders form fields correctly', () => {
    render(
      <RetrospectiveForm
        projectId="project-1"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByLabelText('Retrospective Title *')).toBeInTheDocument();
    expect(screen.getByLabelText('Sprint *')).toBeInTheDocument();
    expect(screen.getByLabelText('Facilitator *')).toBeInTheDocument();
    expect(screen.getByLabelText('Scheduled Date')).toBeInTheDocument();
    expect(screen.getByLabelText('Retrospective Template')).toBeInTheDocument();
    expect(screen.getByText('Participants')).toBeInTheDocument();
  });

  it('shows only completed sprints in sprint dropdown', () => {
    render(
      <RetrospectiveForm
        projectId="project-1"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const sprintSelect = screen.getByLabelText('Sprint *');
    fireEvent.click(sprintSelect);

    // Check for Sprint 1 option (the date format may vary)
    expect(screen.getByRole('option', { name: /Sprint 1/ })).toBeInTheDocument();
    expect(screen.queryByText('Sprint 2')).not.toBeInTheDocument();
  });

  it('populates facilitator dropdown with team members', () => {
    render(
      <RetrospectiveForm
        projectId="project-1"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const facilitatorSelect = screen.getByLabelText('Facilitator *');
    fireEvent.click(facilitatorSelect);

    // Use more specific selectors to avoid conflicts with participant checkboxes
    expect(screen.getByRole('option', { name: 'John Doe' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Jane Smith' })).toBeInTheDocument();
  });

  it('shows template details when template is selected', () => {
    render(
      <RetrospectiveForm
        projectId="project-1"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const templateSelect = screen.getByLabelText('Retrospective Template');
    fireEvent.change(templateSelect, { target: { value: 'template-1' } });

    expect(screen.getByText('Classic retrospective format')).toBeInTheDocument();
    expect(screen.getByText('Start')).toBeInTheDocument();
    expect(screen.getByText('Stop')).toBeInTheDocument();
    expect(screen.getByText('Continue')).toBeInTheDocument();
  });

  it('allows selecting participants', () => {
    render(
      <RetrospectiveForm
        projectId="project-1"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const johnCheckbox = screen.getByRole('checkbox', { name: /John Doe/ });
    const janeCheckbox = screen.getByRole('checkbox', { name: /Jane Smith/ });

    fireEvent.click(johnCheckbox);
    fireEvent.click(janeCheckbox);

    expect(johnCheckbox).toBeChecked();
    expect(janeCheckbox).toBeChecked();
    expect(screen.getByText('2 participant(s) selected')).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    render(
      <RetrospectiveForm
        projectId="project-1"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    // Clear the facilitator field (it's pre-filled with current user)
    fireEvent.change(screen.getByLabelText('Facilitator *'), {
      target: { value: '' }
    });

    fireEvent.click(screen.getByText('Create Retrospective'));

    await waitFor(() => {
      expect(screen.getByText('Title is required')).toBeInTheDocument();
      expect(screen.getByText('Sprint is required')).toBeInTheDocument();
      expect(screen.getByText('Facilitator is required')).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('submits form with correct data', async () => {
    render(
      <RetrospectiveForm
        projectId="project-1"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    // Fill required fields
    fireEvent.change(screen.getByLabelText('Retrospective Title *'), {
      target: { value: 'Sprint 1 Retrospective' }
    });
    fireEvent.change(screen.getByLabelText('Sprint *'), {
      target: { value: 'sprint-1' }
    });
    fireEvent.change(screen.getByLabelText('Facilitator *'), {
      target: { value: 'user-1' }
    });

    // Select template
    fireEvent.change(screen.getByLabelText('Retrospective Template'), {
      target: { value: 'template-1' }
    });

    // Select participants
    fireEvent.click(screen.getByRole('checkbox', { name: /John Doe/ }));

    // Set scheduled date
    fireEvent.change(screen.getByLabelText('Scheduled Date'), {
      target: { value: '2024-01-15T10:00' }
    });

    fireEvent.click(screen.getByText('Create Retrospective'));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        projectId: 'project-1',
        sprintId: 'sprint-1',
        title: 'Sprint 1 Retrospective',
        facilitatorId: 'user-1',
        participants: ['user-1'],
        templateId: 'template-1',
        scheduledDate: new Date('2024-01-15T10:00')
      });
    });
  });

  it('calls onCancel when Cancel button is clicked', () => {
    render(
      <RetrospectiveForm
        projectId="project-1"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    fireEvent.click(screen.getByText('Cancel'));
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('shows loading state when templates are loading', () => {
    mockUseRetrospectives.mockReturnValue({
      retrospectives: [],
      retrospectivesLoading: false,
      retrospectivesError: null,
      templates: [],
      templatesLoading: true,
      templatesError: null,
      createRetrospective: vi.fn(),
      updateRetrospective: vi.fn(),
      deleteRetrospective: vi.fn(),
      createTemplate: vi.fn(),
      refetchRetrospectives: vi.fn(),
      refetchTemplates: vi.fn()
    });

    render(
      <RetrospectiveForm
        projectId="project-1"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('pre-fills form with initial data', () => {
    const initialData = {
      title: 'Existing Retrospective',
      sprintId: 'sprint-1',
      facilitatorId: 'user-2'
    };

    render(
      <RetrospectiveForm
        projectId="project-1"
        initialData={initialData}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    // Check title input
    expect(screen.getByDisplayValue('Existing Retrospective')).toBeInTheDocument();
    
    // Check select elements by their values
    const sprintSelect = screen.getByLabelText('Sprint *') as HTMLSelectElement;
    const facilitatorSelect = screen.getByLabelText('Facilitator *') as HTMLSelectElement;
    
    expect(sprintSelect.value).toBe('sprint-1');
    expect(facilitatorSelect.value).toBe('user-2');
  });
});
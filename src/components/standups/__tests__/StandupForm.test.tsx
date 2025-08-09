// React import not needed for testing library
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { StandupForm } from '../StandupForm';
import { useTeamMembers } from '../../../hooks/useTeamMembers';
import { useAuth } from '../../../hooks/useAuth';
import type { User } from '../../../types';

// Mock the hooks
vi.mock('../../../hooks/useTeamMembers');
vi.mock('../../../hooks/useAuth');

const mockUseTeamMembers = vi.mocked(useTeamMembers);
const mockUseAuth = vi.mocked(useAuth);

const mockTeamMembers = [
  {
    id: 'member-1',
    userId: 'user-1',
    projectId: 'project-1',
    role: 'owner' as const,
    joinedAt: new Date(),
    user: {
      id: 'user-1',
      email: 'owner@example.com',
      fullName: 'Project Owner',
      timezone: 'UTC',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  },
  {
    id: 'member-2',
    userId: 'user-2',
    projectId: 'project-1',
    role: 'member' as const,
    joinedAt: new Date(),
    user: {
      id: 'user-2',
      email: 'member@example.com',
      fullName: 'Team Member',
      timezone: 'UTC',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  },
];

const mockUser = {
  id: 'user-1',
  email: 'owner@example.com',
  fullName: 'Project Owner',
  full_name: 'Project Owner', // For compatibility
  avatarUrl: undefined,
  avatar_url: undefined, // For compatibility
  timezone: 'UTC',
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-01T00:00:00Z'),
} as User;

describe('StandupForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    });

    mockUseTeamMembers.mockReturnValue({
      teamMembers: mockTeamMembers,
      loading: false,
      error: null,
      fetchTeamMembers: vi.fn(),
    });
  });

  it('renders form fields correctly', () => {
    render(
      <StandupForm
        projectId="project-1"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByLabelText('Scheduled Date')).toBeInTheDocument();
    expect(screen.getByLabelText('Scheduled Time')).toBeInTheDocument();
    expect(screen.getByLabelText('Facilitator')).toBeInTheDocument();
    expect(screen.getByText('Participants (0 selected)')).toBeInTheDocument();
  });

  it('shows team members in facilitator dropdown', () => {
    render(
      <StandupForm
        projectId="project-1"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const facilitatorSelect = screen.getByLabelText('Facilitator');
    expect(facilitatorSelect).toBeInTheDocument();

    // Check if team members are in the dropdown
    expect(screen.getByRole('option', { name: 'Project Owner' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Team Member' })).toBeInTheDocument();
  });

  it('shows team members in participants list', () => {
    render(
      <StandupForm
        projectId="project-1"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    // Check if team members are shown as checkboxes
    expect(screen.getByRole('checkbox', { name: /project owner/i })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /team member/i })).toBeInTheDocument();
    expect(screen.getByText('(owner)')).toBeInTheDocument();
    expect(screen.getByText('(member)')).toBeInTheDocument();
  });

  it('allows selecting and deselecting participants', () => {
    render(
      <StandupForm
        projectId="project-1"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const ownerCheckbox = screen.getByRole('checkbox', { name: /project owner/i });
    const memberCheckbox = screen.getByRole('checkbox', { name: /team member/i });

    // Initially no participants selected
    expect(screen.getByText('Participants (0 selected)')).toBeInTheDocument();

    // Select owner
    fireEvent.click(ownerCheckbox);
    expect(screen.getByText('Participants (1 selected)')).toBeInTheDocument();

    // Select member
    fireEvent.click(memberCheckbox);
    expect(screen.getByText('Participants (2 selected)')).toBeInTheDocument();

    // Deselect owner
    fireEvent.click(ownerCheckbox);
    expect(screen.getByText('Participants (1 selected)')).toBeInTheDocument();
  });

  it('allows selecting all participants', () => {
    render(
      <StandupForm
        projectId="project-1"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const selectAllButton = screen.getByText('Select All');
    fireEvent.click(selectAllButton);

    expect(screen.getByText('Participants (2 selected)')).toBeInTheDocument();
  });

  it('allows clearing all participants', () => {
    render(
      <StandupForm
        projectId="project-1"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    // First select all
    const selectAllButton = screen.getByText('Select All');
    fireEvent.click(selectAllButton);

    // Then clear all
    const clearAllButton = screen.getByText('Clear All');
    fireEvent.click(clearAllButton);

    expect(screen.getByText('Participants (0 selected)')).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    render(
      <StandupForm
        projectId="project-1"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    // Clear the facilitator field (it might be pre-filled with current user)
    const facilitatorSelect = screen.getByLabelText('Facilitator');
    fireEvent.change(facilitatorSelect, { target: { value: '' } });

    // Submit the form without filling required fields
    const submitButton = screen.getByRole('button', { name: /schedule standup/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Scheduled date is required')).toBeInTheDocument();
      expect(screen.getByText('Scheduled time is required')).toBeInTheDocument();
      expect(screen.getByText('At least one participant is required')).toBeInTheDocument();
      expect(screen.getByText('Facilitator is required')).toBeInTheDocument();
    }, { timeout: 3000 });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('submits form with valid data', async () => {
    render(
      <StandupForm
        projectId="project-1"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    // Fill in required fields
    const dateInput = screen.getByLabelText('Scheduled Date');
    const timeInput = screen.getByLabelText('Scheduled Time');
    const facilitatorSelect = screen.getByLabelText('Facilitator');

    fireEvent.change(dateInput, { target: { value: '2024-01-15' } });
    fireEvent.change(timeInput, { target: { value: '09:00' } });
    fireEvent.change(facilitatorSelect, { target: { value: 'user-1' } });

    // Select a participant
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]); // Click first checkbox (Project Owner)

    // Wait for form state to update
    await waitFor(() => {
      expect(screen.getByText('Participants (1 selected)')).toBeInTheDocument();
    });

    // Submit form using test-id
    const form = screen.getByTestId('standup-form');
    fireEvent.submit(form);

    // Check if form was submitted
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        projectId: 'project-1',
        sprintId: undefined,
        scheduledDate: expect.any(Date),
        participants: ['user-1'],
        facilitatorId: 'user-1',
      });
    }, { timeout: 1000 });
  });

  it('calls onCancel when cancel button is clicked', () => {
    render(
      <StandupForm
        projectId="project-1"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('shows loading state when team members are loading', () => {
    mockUseTeamMembers.mockReturnValue({
      teamMembers: [],
      loading: true,
      error: null,
      fetchTeamMembers: vi.fn(),
    });

    render(
      <StandupForm
        projectId="project-1"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('shows empty state when no team members exist', () => {
    mockUseTeamMembers.mockReturnValue({
      teamMembers: [],
      loading: false,
      error: null,
      fetchTeamMembers: vi.fn(),
    });

    render(
      <StandupForm
        projectId="project-1"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('No team members found')).toBeInTheDocument();
  });

  it('includes sprintId in submission when provided', async () => {
    render(
      <StandupForm
        projectId="project-1"
        sprintId="sprint-1"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    // Fill in required fields
    const dateInput = screen.getByLabelText('Scheduled Date');
    const timeInput = screen.getByLabelText('Scheduled Time');
    const facilitatorSelect = screen.getByLabelText('Facilitator');

    fireEvent.change(dateInput, { target: { value: '2024-01-15' } });
    fireEvent.change(timeInput, { target: { value: '09:00' } });
    fireEvent.change(facilitatorSelect, { target: { value: 'user-1' } });

    // Select a participant
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]); // Click first checkbox (Project Owner)

    // Wait for form state to update
    await waitFor(() => {
      expect(screen.getByText('Participants (1 selected)')).toBeInTheDocument();
    });

    // Submit form using test-id
    const form = screen.getByTestId('standup-form');
    fireEvent.submit(form);

    // Check if form was submitted with sprintId
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        projectId: 'project-1',
        sprintId: 'sprint-1',
        scheduledDate: expect.any(Date),
        participants: ['user-1'],
        facilitatorId: 'user-1',
      });
    }, { timeout: 1000 });
  });

  it('shows standup guidelines', () => {
    render(
      <StandupForm
        projectId="project-1"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('Standup Guidelines')).toBeInTheDocument();
    expect(screen.getByText(/Keep it short and focused/)).toBeInTheDocument();
  });
});
// React import not needed for testing library
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { StandupParticipationForm } from '../StandupParticipationForm';
import type { StandupParticipation } from '../../../types';

describe('StandupParticipationForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  const mockExistingParticipation: StandupParticipation = {
    id: 'participation-1',
    standupId: 'standup-1',
    userId: 'user-1',
    yesterday: 'Worked on user authentication',
    today: 'Will work on dashboard',
    blockers: 'Need API documentation',
    status: 'submitted',
    submittedAt: new Date('2024-01-15T10:00:00Z'),
    createdAt: new Date('2024-01-15T09:00:00Z'),
    updatedAt: new Date('2024-01-15T10:00:00Z'),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders form fields correctly', () => {
    render(
      <StandupParticipationForm
        standupId="standup-1"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByLabelText(/what did you accomplish yesterday/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/what will you work on today/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/any blockers or impediments/i)).toBeInTheDocument();
  });

  it('shows standup tips', () => {
    render(
      <StandupParticipationForm
        standupId="standup-1"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('Standup Tips')).toBeInTheDocument();
    expect(screen.getByText(/Be specific about what you accomplished/)).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    render(
      <StandupParticipationForm
        standupId="standup-1"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const submitButton = screen.getByText('Submit Standup');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Please describe what you did yesterday')).toBeInTheDocument();
      expect(screen.getByText('Please describe what you plan to do today')).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('submits new participation with valid data', async () => {
    render(
      <StandupParticipationForm
        standupId="standup-1"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    // Fill in required fields
    const yesterdayInput = screen.getByLabelText(/what did you accomplish yesterday/i);
    const todayInput = screen.getByLabelText(/what will you work on today/i);
    const blockersInput = screen.getByLabelText(/any blockers or impediments/i);

    fireEvent.change(yesterdayInput, { target: { value: 'Completed user login' } });
    fireEvent.change(todayInput, { target: { value: 'Work on dashboard' } });
    fireEvent.change(blockersInput, { target: { value: 'Need design mockups' } });

    // Submit form
    const submitButton = screen.getByText('Submit Standup');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        standupId: 'standup-1',
        yesterday: 'Completed user login',
        today: 'Work on dashboard',
        blockers: 'Need design mockups',
      });
    });
  });

  it('loads existing participation data', () => {
    render(
      <StandupParticipationForm
        standupId="standup-1"
        existingParticipation={mockExistingParticipation}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByDisplayValue('Worked on user authentication')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Will work on dashboard')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Need API documentation')).toBeInTheDocument();
  });

  it('shows submitted status for existing participation', () => {
    render(
      <StandupParticipationForm
        standupId="standup-1"
        existingParticipation={mockExistingParticipation}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('Submitted')).toBeInTheDocument();
  });

  it('updates existing participation', async () => {
    render(
      <StandupParticipationForm
        standupId="standup-1"
        existingParticipation={mockExistingParticipation}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    // Modify the today field
    const todayInput = screen.getByDisplayValue('Will work on dashboard');
    fireEvent.change(todayInput, { target: { value: 'Will work on user profile' } });

    // Submit form
    const updateButton = screen.getByText('Update Standup');
    fireEvent.click(updateButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        id: 'participation-1',
        data: {
          yesterday: 'Worked on user authentication',
          today: 'Will work on user profile',
          blockers: 'Need API documentation',
          status: 'submitted',
        },
      });
    });
  });

  it('allows skipping standup for existing participation', async () => {
    render(
      <StandupParticipationForm
        standupId="standup-1"
        existingParticipation={mockExistingParticipation}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const skipButton = screen.getByText('Skip This Standup');
    fireEvent.click(skipButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        id: 'participation-1',
        data: { status: 'skipped' },
      });
    });
  });

  it('shows skipped status', () => {
    const skippedParticipation = {
      ...mockExistingParticipation,
      status: 'skipped' as const,
    };

    render(
      <StandupParticipationForm
        standupId="standup-1"
        existingParticipation={skippedParticipation}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('Skipped')).toBeInTheDocument();
  });

  it('shows pending status', () => {
    const pendingParticipation = {
      ...mockExistingParticipation,
      status: 'pending' as const,
      submittedAt: undefined,
    };

    render(
      <StandupParticipationForm
        standupId="standup-1"
        existingParticipation={pendingParticipation}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('Pending')).toBeInTheDocument();
  });

  it('disables form in read-only mode', () => {
    render(
      <StandupParticipationForm
        standupId="standup-1"
        existingParticipation={mockExistingParticipation}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        readOnly={true}
      />
    );

    const yesterdayInput = screen.getByDisplayValue('Worked on user authentication');
    const todayInput = screen.getByDisplayValue('Will work on dashboard');
    const blockersInput = screen.getByDisplayValue('Need API documentation');

    expect(yesterdayInput).toBeDisabled();
    expect(todayInput).toBeDisabled();
    expect(blockersInput).toBeDisabled();

    // Should not show action buttons in read-only mode
    expect(screen.queryByText('Update Standup')).not.toBeInTheDocument();
    expect(screen.queryByText('Skip This Standup')).not.toBeInTheDocument();
  });

  it('calls onCancel when cancel button is clicked', () => {
    render(
      <StandupParticipationForm
        standupId="standup-1"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('shows loading state', () => {
    render(
      <StandupParticipationForm
        standupId="standup-1"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        loading={true}
      />
    );

    expect(screen.getByText('Submitting...')).toBeInTheDocument();
  });

  it('disables submit button when not dirty and already submitted', () => {
    render(
      <StandupParticipationForm
        standupId="standup-1"
        existingParticipation={mockExistingParticipation}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const updateButton = screen.getByText('Update Standup');
    expect(updateButton).toBeDisabled();
  });

  it('enables submit button when form is dirty', () => {
    render(
      <StandupParticipationForm
        standupId="standup-1"
        existingParticipation={mockExistingParticipation}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    // Make form dirty by changing a field
    const todayInput = screen.getByDisplayValue('Will work on dashboard');
    fireEvent.change(todayInput, { target: { value: 'Will work on something else' } });

    const updateButton = screen.getByText('Update Standup');
    expect(updateButton).not.toBeDisabled();
  });

  it('shows submission timestamp', () => {
    render(
      <StandupParticipationForm
        standupId="standup-1"
        existingParticipation={mockExistingParticipation}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText(/submitted on/i)).toBeInTheDocument();
  });

  it('validates empty blockers field when provided', async () => {
    render(
      <StandupParticipationForm
        standupId="standup-1"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    // Fill required fields
    const yesterdayInput = screen.getByLabelText(/what did you accomplish yesterday/i);
    const todayInput = screen.getByLabelText(/what will you work on today/i);
    const blockersInput = screen.getByLabelText(/any blockers or impediments/i);

    fireEvent.change(yesterdayInput, { target: { value: 'Completed user login' } });
    fireEvent.change(todayInput, { target: { value: 'Work on dashboard' } });
    fireEvent.change(blockersInput, { target: { value: '   ' } }); // Only whitespace

    const submitButton = screen.getByText('Submit Standup');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Please provide details about your blockers or leave empty')).toBeInTheDocument();
    });
  });
});
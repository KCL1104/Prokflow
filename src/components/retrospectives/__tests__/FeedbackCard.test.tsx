import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { FeedbackCard } from '../FeedbackCard';
import type { RetrospectiveFeedback } from '../../../types';

const mockFeedback: RetrospectiveFeedback = {
  id: 'feedback-1',
  retrospectiveId: 'retro-1',
  userId: 'user-1',
  category: 'went_well',
  content: 'Great team collaboration this sprint',
  votes: 3,
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date('2024-01-15')
};

describe('FeedbackCard', () => {
  const mockOnVote = vi.fn();
  const mockOnUpdate = vi.fn();
  const mockOnDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders feedback content correctly', () => {
    render(
      <FeedbackCard
        feedback={mockFeedback}
        currentUserId="user-2"
        onVote={mockOnVote}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('Great team collaboration this sprint')).toBeInTheDocument();
    expect(screen.getByText(new Date('2024-01-15').toLocaleDateString())).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('shows edit and delete buttons for feedback owner', () => {
    render(
      <FeedbackCard
        feedback={mockFeedback}
        currentUserId="user-1" // Same as feedback.userId
        onVote={mockOnVote}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
  });

  it('hides edit and delete buttons for non-owners', () => {
    render(
      <FeedbackCard
        feedback={mockFeedback}
        currentUserId="user-2" // Different from feedback.userId
        onVote={mockOnVote}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();
  });

  it('calls onVote when vote button is clicked', () => {
    render(
      <FeedbackCard
        feedback={mockFeedback}
        currentUserId="user-2"
        onVote={mockOnVote}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    );

    const voteButton = screen.getByRole('button', { name: /vote for this feedback/i });
    fireEvent.click(voteButton);

    expect(mockOnVote).toHaveBeenCalledWith('feedback-1', true);
  });

  it('enters edit mode when edit button is clicked', () => {
    render(
      <FeedbackCard
        feedback={mockFeedback}
        currentUserId="user-1"
        onVote={mockOnVote}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /edit/i }));

    expect(screen.getByDisplayValue('Great team collaboration this sprint')).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('saves edited content when Save button is clicked', async () => {
    render(
      <FeedbackCard
        feedback={mockFeedback}
        currentUserId="user-1"
        onVote={mockOnVote}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    );

    // Enter edit mode
    fireEvent.click(screen.getByRole('button', { name: /edit/i }));

    // Edit content
    const textarea = screen.getByDisplayValue('Great team collaboration this sprint');
    fireEvent.change(textarea, { target: { value: 'Updated feedback content' } });

    // Save changes
    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(mockOnUpdate).toHaveBeenCalledWith('feedback-1', {
        content: 'Updated feedback content'
      });
    });
  });

  it('cancels edit mode when Cancel button is clicked', () => {
    render(
      <FeedbackCard
        feedback={mockFeedback}
        currentUserId="user-1"
        onVote={mockOnVote}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    );

    // Enter edit mode
    fireEvent.click(screen.getByRole('button', { name: /edit/i }));

    // Edit content
    const textarea = screen.getByDisplayValue('Great team collaboration this sprint');
    fireEvent.change(textarea, { target: { value: 'Changed content' } });

    // Cancel changes
    fireEvent.click(screen.getByText('Cancel'));

    // Should return to view mode with original content
    expect(screen.getByText('Great team collaboration this sprint')).toBeInTheDocument();
    expect(screen.queryByDisplayValue('Changed content')).not.toBeInTheDocument();
    expect(mockOnUpdate).not.toHaveBeenCalled();
  });

  it('does not save if content is unchanged', async () => {
    render(
      <FeedbackCard
        feedback={mockFeedback}
        currentUserId="user-1"
        onVote={mockOnVote}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    );

    // Enter edit mode
    fireEvent.click(screen.getByRole('button', { name: /edit/i }));

    // Save without changes
    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(mockOnUpdate).not.toHaveBeenCalled();
    });
  });

  it('calls onDelete when delete button is clicked and confirmed', async () => {
    // Mock window.confirm to return true
    const originalConfirm = window.confirm;
    window.confirm = vi.fn(() => true);

    render(
      <FeedbackCard
        feedback={mockFeedback}
        currentUserId="user-1"
        onVote={mockOnVote}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /delete/i }));

    await waitFor(() => {
      expect(mockOnDelete).toHaveBeenCalledWith('feedback-1');
    });

    // Restore original confirm
    window.confirm = originalConfirm;
  });

  it('does not delete when deletion is cancelled', async () => {
    // Mock window.confirm to return false
    const originalConfirm = window.confirm;
    window.confirm = vi.fn(() => false);

    render(
      <FeedbackCard
        feedback={mockFeedback}
        currentUserId="user-1"
        onVote={mockOnVote}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /delete/i }));

    expect(mockOnDelete).not.toHaveBeenCalled();

    // Restore original confirm
    window.confirm = originalConfirm;
  });

  it('disables Save button when content is empty', () => {
    render(
      <FeedbackCard
        feedback={mockFeedback}
        currentUserId="user-1"
        onVote={mockOnVote}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    );

    // Enter edit mode
    fireEvent.click(screen.getByRole('button', { name: /edit/i }));

    // Clear content
    const textarea = screen.getByDisplayValue('Great team collaboration this sprint');
    fireEvent.change(textarea, { target: { value: '   ' } });

    const saveButton = screen.getByText('Save');
    expect(saveButton).toBeDisabled();
  });


});
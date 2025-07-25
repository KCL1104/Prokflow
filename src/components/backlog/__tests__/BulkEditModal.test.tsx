import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { BulkEditModal } from '../BulkEditModal';
import type { TeamMember } from '../../../types';

const mockTeamMembers: TeamMember[] = [
  {
    id: 'member-1',
    userId: 'user-1',
    projectId: 'project-1',
    role: 'owner',
    joinedAt: new Date('2024-01-01'),
  },
  {
    id: 'member-2',
    userId: 'user-2',
    projectId: 'project-1',
    role: 'member',
    joinedAt: new Date('2024-01-01'),
  },
];

const defaultProps = {
  isOpen: true,
  onClose: vi.fn(),
  selectedCount: 3,
  teamMembers: mockTeamMembers,
  onSubmit: vi.fn(),
};

describe('BulkEditModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders when open', () => {
    render(<BulkEditModal {...defaultProps} />);
    
    expect(screen.getByText('Bulk Edit 3 Items')).toBeInTheDocument();
    expect(screen.getByText('Make changes to 3 selected work items. Only fields you modify will be updated.')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<BulkEditModal {...defaultProps} isOpen={false} />);
    
    expect(screen.queryByText('Bulk Edit 3 Items')).not.toBeInTheDocument();
  });

  it('shows priority options', () => {
    render(<BulkEditModal {...defaultProps} />);
    
    const prioritySelect = screen.getByLabelText('Priority');
    expect(prioritySelect).toBeInTheDocument();
    
    // Check that priority options exist
    expect(screen.getByText('Low')).toBeInTheDocument();
    expect(screen.getByText('Medium')).toBeInTheDocument();
    expect(screen.getByText('High')).toBeInTheDocument();
    expect(screen.getByText('Critical')).toBeInTheDocument();
  });

  it('shows status options', () => {
    render(<BulkEditModal {...defaultProps} />);
    
    const statusSelect = screen.getByLabelText('Status');
    expect(statusSelect).toBeInTheDocument();
    
    // Check that status options exist
    expect(screen.getByText('To Do')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('Review')).toBeInTheDocument();
    expect(screen.getByText('Done')).toBeInTheDocument();
  });

  it('shows assignee options including team members', () => {
    render(<BulkEditModal {...defaultProps} />);
    
    const assigneeSelect = screen.getByLabelText('Assignee');
    expect(assigneeSelect).toBeInTheDocument();
    
    // Check that assignee options exist
    expect(screen.getByText('Unassigned')).toBeInTheDocument();
    expect(screen.getByText('User user-1... (owner)')).toBeInTheDocument();
    expect(screen.getByText('User user-2... (member)')).toBeInTheDocument();
  });

  it('allows adding labels', () => {
    render(<BulkEditModal {...defaultProps} />);
    
    const labelInput = screen.getByPlaceholderText('Add a label');
    const addButton = screen.getByText('Add');
    
    fireEvent.change(labelInput, { target: { value: 'urgent' } });
    fireEvent.click(addButton);
    
    expect(screen.getByText('urgent')).toBeInTheDocument();
    expect(labelInput).toHaveValue('');
  });

  it('allows removing labels', () => {
    render(<BulkEditModal {...defaultProps} />);
    
    const labelInput = screen.getByPlaceholderText('Add a label');
    const addButton = screen.getByText('Add');
    
    // Add a label
    fireEvent.change(labelInput, { target: { value: 'urgent' } });
    fireEvent.click(addButton);
    
    expect(screen.getByText('urgent')).toBeInTheDocument();
    
    // Remove the label
    const removeButton = screen.getByText('×');
    fireEvent.click(removeButton);
    
    expect(screen.queryByText('urgent')).not.toBeInTheDocument();
  });

  it('adds label on Enter key press', () => {
    render(<BulkEditModal {...defaultProps} />);
    
    const labelInput = screen.getByPlaceholderText('Add a label');
    
    fireEvent.change(labelInput, { target: { value: 'feature' } });
    fireEvent.keyDown(labelInput, { key: 'Enter', code: 'Enter' });
    
    expect(screen.getByText('feature')).toBeInTheDocument();
    expect(labelInput).toHaveValue('');
  });

  it('prevents duplicate labels', () => {
    render(<BulkEditModal {...defaultProps} />);
    
    const labelInput = screen.getByPlaceholderText('Add a label');
    const addButton = screen.getByText('Add');
    
    // Add first label
    fireEvent.change(labelInput, { target: { value: 'urgent' } });
    fireEvent.click(addButton);
    
    // Try to add same label again
    fireEvent.change(labelInput, { target: { value: 'urgent' } });
    fireEvent.click(addButton);
    
    // Should only have one instance
    const urgentLabels = screen.getAllByText('urgent');
    expect(urgentLabels).toHaveLength(1);
  });

  it('calls onSubmit with selected updates', async () => {
    const mockOnSubmit = vi.fn().mockResolvedValue(undefined);
    render(<BulkEditModal {...defaultProps} onSubmit={mockOnSubmit} />);
    
    // Change priority
    const prioritySelect = screen.getByLabelText('Priority');
    fireEvent.change(prioritySelect, { target: { value: 'high' } });
    
    // Change status
    const statusSelect = screen.getByLabelText('Status');
    fireEvent.change(statusSelect, { target: { value: 'In Progress' } });
    
    // Add label
    const labelInput = screen.getByPlaceholderText('Add a label');
    const addButton = screen.getByText('Add');
    fireEvent.change(labelInput, { target: { value: 'urgent' } });
    fireEvent.click(addButton);
    
    // Submit form
    const submitButton = screen.getByText('Update 3 Items');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        priority: 'high',
        status: 'In Progress',
        labels: ['urgent'],
      });
    });
  });

  it('calls onClose when cancel button is clicked', () => {
    const mockOnClose = vi.fn();
    render(<BulkEditModal {...defaultProps} onClose={mockOnClose} />);
    
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('calls onClose when modal close button is clicked', () => {
    const mockOnClose = vi.fn();
    render(<BulkEditModal {...defaultProps} onClose={mockOnClose} />);
    
    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('disables form during submission', async () => {
    const mockOnSubmit = vi.fn(() => new Promise<void>(resolve => setTimeout(resolve, 100)));
    render(<BulkEditModal {...defaultProps} onSubmit={mockOnSubmit} />);
    
    const submitButton = screen.getByText('Update 3 Items');
    fireEvent.click(submitButton);
    
    expect(submitButton).toBeDisabled();
    expect(screen.getByLabelText('Priority')).toBeDisabled();
    expect(screen.getByLabelText('Status')).toBeDisabled();
    expect(screen.getByLabelText('Assignee')).toBeDisabled();
  });

  it('resets form when closed', () => {
    const { rerender } = render(<BulkEditModal {...defaultProps} />);
    
    // Make changes
    const prioritySelect = screen.getByLabelText('Priority');
    fireEvent.change(prioritySelect, { target: { value: 'high' } });
    
    const labelInput = screen.getByPlaceholderText('Add a label');
    const addButton = screen.getByText('Add');
    fireEvent.change(labelInput, { target: { value: 'urgent' } });
    fireEvent.click(addButton);
    
    // Close modal
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    
    // Reopen modal
    rerender(<BulkEditModal {...defaultProps} isOpen={true} />);
    
    // Form should be reset
    expect(screen.getByLabelText('Priority')).toHaveValue('');
    expect(screen.queryByText('urgent')).not.toBeInTheDocument();
  });

  it('handles assignee selection correctly', () => {
    render(<BulkEditModal {...defaultProps} />);
    
    const assigneeSelect = screen.getByLabelText('Assignee');
    
    // Initially should be "no-change"
    expect(assigneeSelect).toHaveValue('no-change');
    
    // Select a user
    fireEvent.change(assigneeSelect, { target: { value: 'user-1' } });
    expect(assigneeSelect).toHaveValue('user-1');
    
    // Select back to no change
    fireEvent.change(assigneeSelect, { target: { value: 'no-change' } });
    expect(assigneeSelect).toHaveValue('no-change');
  });
});
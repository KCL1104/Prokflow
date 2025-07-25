import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { EstimationModal } from '../EstimationModal';
import type { WorkItem } from '../../../types';

const mockWorkItem: WorkItem = {
  id: '1',
  projectId: 'project-1',
  title: 'User Story for Estimation',
  description: 'This is a user story that needs estimation',
  type: 'story',
  status: 'To Do',
  priority: 'medium',
  reporterId: 'user-1',
  dependencies: [],
  labels: ['frontend'],
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

const defaultProps = {
  isOpen: true,
  onClose: vi.fn(),
  workItem: mockWorkItem,
  onSubmit: vi.fn(),
};

describe('EstimationModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders when open with work item', () => {
    render(<EstimationModal {...defaultProps} />);
    
    expect(screen.getByText('Estimate Story Points')).toBeInTheDocument();
    expect(screen.getByText('User Story for Estimation')).toBeInTheDocument();
    expect(screen.getByText('This is a user story that needs estimation')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<EstimationModal {...defaultProps} isOpen={false} />);
    
    expect(screen.queryByText('Estimate Story Points')).not.toBeInTheDocument();
  });

  it('does not render when no work item', () => {
    render(<EstimationModal {...defaultProps} workItem={null} />);
    
    expect(screen.queryByText('Estimate Story Points')).not.toBeInTheDocument();
  });

  it('shows current estimate if work item has one', () => {
    const workItemWithEstimate = { ...mockWorkItem, estimate: 5 };
    render(<EstimationModal {...defaultProps} workItem={workItemWithEstimate} />);
    
    expect(screen.getByText('Current estimate: 5 points')).toBeInTheDocument();
  });

  it('shows standard story point options by default', () => {
    render(<EstimationModal {...defaultProps} />);
    
    expect(screen.getByLabelText('Standard story points')).toBeChecked();
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('½')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getByText('13')).toBeInTheDocument();
    expect(screen.getByText('21')).toBeInTheDocument();
    expect(screen.getByText('34')).toBeInTheDocument();
    expect(screen.getByText('?')).toBeInTheDocument();
  });

  it('allows selecting story point values', () => {
    render(<EstimationModal {...defaultProps} />);
    
    const fivePointButton = screen.getByRole('button', { name: /5.*Medium/s });
    fireEvent.click(fivePointButton);
    
    expect(fivePointButton).toHaveClass('border-blue-600', 'bg-blue-50', 'text-blue-900');
  });

  it('shows warning for large story points', () => {
    render(<EstimationModal {...defaultProps} />);
    
    const largePointButton = screen.getByRole('button', { name: /21.*Extra large/s });
    fireEvent.click(largePointButton);
    
    expect(screen.getByText('Large story detected')).toBeInTheDocument();
    expect(screen.getByText(/Consider breaking this story into smaller/)).toBeInTheDocument();
  });

  it('switches to custom estimate mode', () => {
    render(<EstimationModal {...defaultProps} />);
    
    const customRadio = screen.getByLabelText('Custom estimate');
    fireEvent.click(customRadio);
    
    expect(customRadio).toBeChecked();
    expect(screen.getByLabelText('Custom Estimate')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter story points')).toBeInTheDocument();
  });

  it('allows entering custom estimate', () => {
    render(<EstimationModal {...defaultProps} />);
    
    const customRadio = screen.getByLabelText('Custom estimate');
    fireEvent.click(customRadio);
    
    const customInput = screen.getByPlaceholderText('Enter story points');
    fireEvent.change(customInput, { target: { value: '7.5' } });
    
    expect(customInput).toHaveValue(7.5);
  });

  it('submits standard story point estimate', async () => {
    const mockOnSubmit = vi.fn().mockResolvedValue(undefined);
    render(<EstimationModal {...defaultProps} onSubmit={mockOnSubmit} />);
    
    const fivePointButton = screen.getByRole('button', { name: /5.*Medium/s });
    fireEvent.click(fivePointButton);
    
    const saveButton = screen.getByText('Save Estimate');
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(5);
    });
  });

  it('submits custom estimate', async () => {
    const mockOnSubmit = vi.fn().mockResolvedValue(undefined);
    render(<EstimationModal {...defaultProps} onSubmit={mockOnSubmit} />);
    
    const customRadio = screen.getByLabelText('Custom estimate');
    fireEvent.click(customRadio);
    
    const customInput = screen.getByPlaceholderText('Enter story points');
    fireEvent.change(customInput, { target: { value: '7.5' } });
    
    const saveButton = screen.getByText('Save Estimate');
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(7.5);
    });
  });

  it('shows error for invalid custom estimate', async () => {
    render(<EstimationModal {...defaultProps} />);
    
    const customRadio = screen.getByLabelText('Custom estimate');
    fireEvent.click(customRadio);
    
    const customInput = screen.getByPlaceholderText('Enter story points');
    fireEvent.change(customInput, { target: { value: 'invalid' } });
    
    const saveButton = screen.getByText('Save Estimate');
    fireEvent.click(saveButton);
    
    expect(screen.getByText('Please enter a valid positive number for the estimate')).toBeInTheDocument();
  });

  it('shows error for negative custom estimate', async () => {
    render(<EstimationModal {...defaultProps} />);
    
    const customRadio = screen.getByLabelText('Custom estimate');
    fireEvent.click(customRadio);
    
    // Wait for custom input to be enabled
    await waitFor(() => {
      const customInput = screen.getByPlaceholderText('Enter story points');
      expect(customInput).not.toBeDisabled();
    });
    
    const customInput = screen.getByPlaceholderText('Enter story points');
    fireEvent.change(customInput, { target: { value: '-5' } });
    
    const saveButton = screen.getByText('Save Estimate');
    fireEvent.click(saveButton);
    
    // Wait for validation error to appear
    await waitFor(() => {
      expect(screen.getByText('Please enter a valid positive number for the estimate')).toBeInTheDocument();
    });
  });

  it('shows error when no estimate is selected', async () => {
    render(<EstimationModal {...defaultProps} />);
    
    const saveButton = screen.getByText('Save Estimate');
    fireEvent.click(saveButton);
    
    expect(screen.getByText('Please select a story point estimate')).toBeInTheDocument();
  });

  it('calls onClose when cancel button is clicked', () => {
    const mockOnClose = vi.fn();
    render(<EstimationModal {...defaultProps} onClose={mockOnClose} />);
    
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('calls onClose when modal close button is clicked', () => {
    const mockOnClose = vi.fn();
    render(<EstimationModal {...defaultProps} onClose={mockOnClose} />);
    
    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('disables form during submission', async () => {
    const mockOnSubmit = vi.fn(() => new Promise<void>(resolve => setTimeout(resolve, 100)));
    render(<EstimationModal {...defaultProps} onSubmit={mockOnSubmit} />);
    
    const fivePointButton = screen.getByRole('button', { name: /5.*Medium/s });
    fireEvent.click(fivePointButton);
    
    const saveButton = screen.getByText('Save Estimate');
    fireEvent.click(saveButton);
    
    expect(saveButton).toBeDisabled();
    expect(screen.getByLabelText('Standard story points')).toBeDisabled();
    expect(screen.getByLabelText('Custom estimate')).toBeDisabled();
  });

  it('shows estimation guidelines', () => {
    render(<EstimationModal {...defaultProps} />);
    
    expect(screen.getByText('Estimation Guidelines')).toBeInTheDocument();
    expect(screen.getByText(/Consider complexity, effort, and uncertainty/)).toBeInTheDocument();
    expect(screen.getByText(/Compare with previously estimated stories/)).toBeInTheDocument();
    expect(screen.getByText(/Include testing and review time/)).toBeInTheDocument();
  });

  it('pre-selects existing estimate when work item has standard value', () => {
    const workItemWithStandardEstimate = { ...mockWorkItem, estimate: 8 };
    render(<EstimationModal {...defaultProps} workItem={workItemWithStandardEstimate} />);
    
    const eightPointButton = screen.getByRole('button', { name: /8.*Large/s });
    expect(eightPointButton).toHaveClass('border-blue-600', 'bg-blue-50', 'text-blue-900');
  });

  it('switches to custom mode when work item has non-standard estimate', () => {
    const workItemWithCustomEstimate = { ...mockWorkItem, estimate: 7.5 };
    render(<EstimationModal {...defaultProps} workItem={workItemWithCustomEstimate} />);
    
    expect(screen.getByLabelText('Custom estimate')).toBeChecked();
    expect(screen.getByDisplayValue('7.5')).toBeInTheDocument();
  });

  it('resets form when modal is closed and reopened', () => {
    const { rerender } = render(<EstimationModal {...defaultProps} />);
    
    // Select an estimate
    const fivePointButton = screen.getByRole('button', { name: /5.*Medium/s });
    fireEvent.click(fivePointButton);
    
    // Close modal by clicking cancel
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    
    // Reopen modal
    rerender(<EstimationModal {...defaultProps} isOpen={true} />);
    
    // Form should be reset - check that no estimate is selected
    const newFivePointButton = screen.getByRole('button', { name: /5.*Medium/s });
    expect(newFivePointButton).not.toHaveClass('border-blue-600', 'bg-blue-50', 'text-blue-900');
  });
});
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { SprintForm } from '../SprintForm';
import { sprintService } from '../../../services';
import type { Sprint } from '../../../types';

// Mock the services
vi.mock('../../../services', () => ({
  sprintService: {
    createSprint: vi.fn(),
    updateSprint: vi.fn(),
    calculateSprintCapacity: vi.fn()
  }
}));

const mockSprint: Sprint = {
  id: '1',
  projectId: 'project-1',
  name: 'Sprint 1',
  goal: 'Complete user authentication',
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-01-14'),
  status: 'planning',
  capacity: 20,
  workItems: [],
  createdAt: new Date()
};

describe('SprintForm', () => {
  const defaultProps = {
    projectId: 'project-1',
    isOpen: true,
    onClose: vi.fn(),
    onSubmit: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (sprintService.calculateSprintCapacity as jest.MockedFunction<typeof sprintService.calculateSprintCapacity>).mockResolvedValue(20);
  });

  it('renders create form correctly', () => {
    render(<SprintForm {...defaultProps} />);
    
    expect(screen.getByText('Create New Sprint')).toBeInTheDocument();
    expect(screen.getByLabelText(/sprint name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/sprint goal/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/start date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/end date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/sprint capacity/i)).toBeInTheDocument();
  });

  it('renders edit form correctly', async () => {
    render(<SprintForm {...defaultProps} sprint={mockSprint} />);
    
    expect(screen.getByText('Edit Sprint')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('Sprint 1')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Complete user authentication')).toBeInTheDocument();
    });
  });

  it('calculates capacity on mount for new sprint', async () => {
    render(<SprintForm {...defaultProps} />);
    
    await waitFor(() => {
      expect(sprintService.calculateSprintCapacity).toHaveBeenCalledWith('project-1');
    });
  });

  it('shows capacity calculation result', async () => {
    render(<SprintForm {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText(/suggested capacity based on team velocity: 20 story points/i)).toBeInTheDocument();
    });
  });

  it('calls onClose when cancel button is clicked', () => {
    render(<SprintForm {...defaultProps} />);
    
    fireEvent.click(screen.getByText('Cancel'));
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('handles form submission for new sprint', async () => {
    const mockCreatedSprint = { ...mockSprint, id: 'new-sprint-id' };
    (sprintService.createSprint as jest.MockedFunction<typeof sprintService.createSprint>).mockResolvedValue(mockCreatedSprint);

    render(<SprintForm {...defaultProps} />);
    
    // Fill out the form
    fireEvent.change(screen.getByLabelText(/sprint name/i), { target: { value: 'Test Sprint' } });
    fireEvent.change(screen.getByLabelText(/start date/i), { target: { value: '2024-01-01' } });
    fireEvent.change(screen.getByLabelText(/end date/i), { target: { value: '2024-01-14' } });
    
    fireEvent.click(screen.getByText('Create Sprint'));
    
    await waitFor(() => {
      expect(sprintService.createSprint).toHaveBeenCalled();
      expect(defaultProps.onSubmit).toHaveBeenCalledWith(mockCreatedSprint);
      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });

  it('handles form submission for existing sprint', async () => {
    const mockUpdatedSprint = { ...mockSprint, name: 'Updated Sprint' };
    (sprintService.updateSprint as jest.MockedFunction<typeof sprintService.updateSprint>).mockResolvedValue(mockUpdatedSprint);

    render(<SprintForm {...defaultProps} sprint={mockSprint} />);
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('Sprint 1')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Update Sprint'));
    
    await waitFor(() => {
      expect(sprintService.updateSprint).toHaveBeenCalledWith(mockSprint.id, expect.any(Object));
      expect(defaultProps.onSubmit).toHaveBeenCalledWith(mockUpdatedSprint);
      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });

  it('handles capacity calculation error gracefully', async () => {
    (sprintService.calculateSprintCapacity as jest.MockedFunction<typeof sprintService.calculateSprintCapacity>).mockRejectedValue(new Error('Calculation failed'));

    render(<SprintForm {...defaultProps} />);
    
    await waitFor(() => {
      expect(sprintService.calculateSprintCapacity).toHaveBeenCalled();
      // Should fall back to default capacity without crashing
    });
  });

  it('validates required fields', async () => {
    render(<SprintForm {...defaultProps} />);
    
    // Try to submit without filling required fields
    fireEvent.click(screen.getByText('Create Sprint'));
    
    // Form should not submit and should show validation errors
    expect(sprintService.createSprint).not.toHaveBeenCalled();
  });

  it('validates date range', async () => {
    render(<SprintForm {...defaultProps} />);
    
    // Set end date before start date
    fireEvent.change(screen.getByLabelText(/start date/i), { target: { value: '2024-01-14' } });
    fireEvent.change(screen.getByLabelText(/end date/i), { target: { value: '2024-01-01' } });
    
    await waitFor(() => {
      expect(screen.getByText(/end date must be after start date/i)).toBeInTheDocument();
    });
  });
});
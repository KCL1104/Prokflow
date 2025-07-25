import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { SprintCard } from '../SprintCard';
import type { Sprint } from '../../../types';

const mockSprint: Sprint = {
  id: '1',
  projectId: 'project-1',
  name: 'Sprint 1',
  goal: 'Complete user authentication',
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-01-14'),
  status: 'planning',
  capacity: 20,
  workItems: ['item-1', 'item-2'],
  createdAt: new Date()
};

const activeSprint: Sprint = {
  ...mockSprint,
  id: '2',
  name: 'Active Sprint',
  status: 'active',
  startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
  endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
};

const completedSprint: Sprint = {
  ...mockSprint,
  id: '3',
  name: 'Completed Sprint',
  status: 'completed'
};

describe('SprintCard', () => {
  const defaultProps = {
    sprint: mockSprint,
    onEdit: vi.fn(),
    onStart: vi.fn(),
    onComplete: vi.fn(),
    onViewDetails: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders sprint information correctly', () => {
    render(<SprintCard {...defaultProps} />);
    
    expect(screen.getByText('Sprint 1')).toBeInTheDocument();
    expect(screen.getByText('Complete user authentication')).toBeInTheDocument();
    expect(screen.getByText('20 story points')).toBeInTheDocument();
    expect(screen.getByText('2 work items')).toBeInTheDocument();
  });

  it('shows correct status badge for planning sprint', () => {
    render(<SprintCard {...defaultProps} />);
    
    expect(screen.getByText('Planning')).toBeInTheDocument();
  });

  it('shows correct status badge for active sprint', () => {
    render(<SprintCard {...defaultProps} sprint={activeSprint} />);
    
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('shows correct status badge for completed sprint', () => {
    render(<SprintCard {...defaultProps} sprint={completedSprint} />);
    
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('shows progress bar for active sprint', () => {
    render(<SprintCard {...defaultProps} sprint={activeSprint} />);
    
    expect(screen.getByText(/days remaining/)).toBeInTheDocument();
    expect(screen.getByText(/% complete/)).toBeInTheDocument();
  });

  it('shows start button for planning sprint', () => {
    render(<SprintCard {...defaultProps} />);
    
    expect(screen.getByText('Start Sprint')).toBeInTheDocument();
  });

  it('shows complete button for active sprint', () => {
    render(<SprintCard {...defaultProps} sprint={activeSprint} />);
    
    expect(screen.getByText('Complete Sprint')).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', () => {
    render(<SprintCard {...defaultProps} />);
    
    const editButton = screen.getByLabelText('Edit sprint');
    fireEvent.click(editButton);
    
    expect(defaultProps.onEdit).toHaveBeenCalledWith(mockSprint);
  });

  it('calls onStart when start button is clicked', () => {
    render(<SprintCard {...defaultProps} />);
    
    const startButton = screen.getByText('Start Sprint');
    fireEvent.click(startButton);
    
    expect(defaultProps.onStart).toHaveBeenCalledWith(mockSprint);
  });

  it('calls onComplete when complete button is clicked', () => {
    render(<SprintCard {...defaultProps} sprint={activeSprint} />);
    
    const completeButton = screen.getByText('Complete Sprint');
    fireEvent.click(completeButton);
    
    expect(defaultProps.onComplete).toHaveBeenCalledWith(activeSprint);
  });

  it('calls onViewDetails when view details button is clicked', () => {
    render(<SprintCard {...defaultProps} />);
    
    const viewButton = screen.getByText('View Details');
    fireEvent.click(viewButton);
    
    expect(defaultProps.onViewDetails).toHaveBeenCalledWith(mockSprint);
  });

  it('disables edit button for active sprint', () => {
    render(<SprintCard {...defaultProps} sprint={activeSprint} />);
    
    const editButton = screen.getByLabelText('Edit sprint');
    expect(editButton).toBeDisabled();
  });

  it('hides actions when showActions is false', () => {
    render(<SprintCard {...defaultProps} showActions={false} />);
    
    expect(screen.queryByText('Start Sprint')).not.toBeInTheDocument();
    expect(screen.queryByText('View Details')).not.toBeInTheDocument();
  });

  it('formats dates correctly', () => {
    render(<SprintCard {...defaultProps} />);
    
    expect(screen.getByText(/Jan 1, 2024 - Jan 14, 2024/)).toBeInTheDocument();
  });
});
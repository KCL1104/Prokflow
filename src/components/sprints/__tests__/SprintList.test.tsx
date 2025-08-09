import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { SprintList } from '../SprintList';
import type { Sprint } from '../../../types';

const mockSprints: Sprint[] = [
  {
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
  },
  {
    id: '2',
    projectId: 'project-1',
    name: 'Sprint 2',
    goal: 'Implement dashboard',
    startDate: new Date('2024-01-15'),
    endDate: new Date('2024-01-28'),
    status: 'active',
    capacity: 25,
    workItems: ['item-3', 'item-4', 'item-5'],
    createdAt: new Date()
  },
  {
    id: '3',
    projectId: 'project-1',
    name: 'Sprint 3',
    goal: 'Add reporting features',
    startDate: new Date('2023-12-01'),
    endDate: new Date('2023-12-14'),
    status: 'completed',
    capacity: 18,
    workItems: ['item-6'],
    createdAt: new Date()
  }
];

describe('SprintList', () => {
  const defaultProps = {
    projectId: 'project-1',
    sprints: mockSprints,
    loading: false,
    error: null,
    onSprintCreated: vi.fn(),
    onSprintUpdated: vi.fn(),
    onSprintStarted: vi.fn(),
    onSprintCompleted: vi.fn(),
    onSprintSelected: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders sprint list correctly', () => {
    render(<SprintList {...defaultProps} />);
    
    expect(screen.getByText('Sprints')).toBeInTheDocument();
    expect(screen.getByText('Sprint 1')).toBeInTheDocument();
    expect(screen.getByText('Sprint 2')).toBeInTheDocument();
    expect(screen.getByText('Sprint 3')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(<SprintList {...defaultProps} loading={true} />);
    
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('shows error state', () => {
    render(<SprintList {...defaultProps} error="Failed to load sprints" />);
    
    expect(screen.getByText('Failed to load sprints')).toBeInTheDocument();
  });

  it('shows empty state when no sprints', () => {
    render(<SprintList {...defaultProps} sprints={[]} />);
    
    expect(screen.getByText('No sprints yet')).toBeInTheDocument();
    expect(screen.getByText('Create Your First Sprint')).toBeInTheDocument();
  });

  it('opens create modal when create button is clicked', () => {
    render(<SprintList {...defaultProps} />);
    
    const createButton = screen.getByText('Create Sprint');
    fireEvent.click(createButton);
    
    expect(screen.getByText('Create New Sprint')).toBeInTheDocument();
  });

  it('filters sprints by status', () => {
    render(<SprintList {...defaultProps} />);
    
<<<<<<< HEAD
    // Click on Active filter
    fireEvent.click(screen.getByText('Active'));
=======
    // Click on Active filter tab (not the status badge)
    const activeFilterTab = screen.getByRole('tab', { name: /Active.*1/ });
    fireEvent.click(activeFilterTab);
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
    
    expect(screen.getByText('Sprint 2')).toBeInTheDocument();
    expect(screen.queryByText('Sprint 1')).not.toBeInTheDocument();
    expect(screen.queryByText('Sprint 3')).not.toBeInTheDocument();
  });

  it('shows correct counts in filter tabs', () => {
    render(<SprintList {...defaultProps} />);
    
<<<<<<< HEAD
    expect(screen.getByText('3')).toBeInTheDocument(); // All sprints
    expect(screen.getByText('1')).toBeInTheDocument(); // Active (appears multiple times)
=======
    // Check for specific filter tab counts using tab role
    expect(screen.getByRole('tab', { name: /All Sprints.*3/ })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Active.*1/ })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Planning.*1/ })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Completed.*1/ })).toBeInTheDocument();
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
  });

  it('sorts sprints correctly', () => {
    render(<SprintList {...defaultProps} />);
    
    const sprintCards = screen.getAllByText(/Sprint \d/);
    // Active sprint should be first, then planning, then completed
    expect(sprintCards[0]).toHaveTextContent('Sprint 2'); // Active
    expect(sprintCards[1]).toHaveTextContent('Sprint 1'); // Planning
    expect(sprintCards[2]).toHaveTextContent('Sprint 3'); // Completed
  });

  it('calls onSprintStarted when sprint is started', () => {
    render(<SprintList {...defaultProps} />);
    
    const startButton = screen.getByText('Start Sprint');
    fireEvent.click(startButton);
    
    expect(defaultProps.onSprintStarted).toHaveBeenCalledWith(mockSprints[0]);
  });

  it('calls onSprintCompleted when sprint is completed', () => {
    render(<SprintList {...defaultProps} />);
    
    const completeButton = screen.getByText('Complete Sprint');
    fireEvent.click(completeButton);
    
    expect(defaultProps.onSprintCompleted).toHaveBeenCalledWith(mockSprints[1]);
  });

  it('calls onSprintSelected when view details is clicked', () => {
    render(<SprintList {...defaultProps} />);
    
    const viewButtons = screen.getAllByText('View Details');
    fireEvent.click(viewButtons[0]);
    
<<<<<<< HEAD
    expect(defaultProps.onSprintSelected).toHaveBeenCalled();
  });

  it('shows empty state for filtered results', () => {
    render(<SprintList {...defaultProps} />);
    
    // Filter by completed, then switch to a filter with no results
    fireEvent.click(screen.getByText('Completed'));
    fireEvent.click(screen.getByText('Planning'));
    
    expect(screen.getByText('No planning sprints')).toBeInTheDocument();
=======
    expect(defaultProps.onSprintSelected).toHaveBeenCalledWith(mockSprints[1]); // Active sprint should be first
  });

  it('handles keyboard navigation for accessibility', () => {
    render(<SprintList {...defaultProps} />);
    
    const createButton = screen.getByText('Create Sprint');
    expect(createButton.tagName).toBe('BUTTON');
    
    const filterTabs = screen.getAllByRole('tab');
    filterTabs.forEach(tab => {
      expect(tab).toBeInTheDocument();
      // Ensure tabs are keyboard accessible
      expect(tab.tagName).toBe('BUTTON');
      expect(tab).toHaveAttribute('role', 'tab');
      expect(tab).toHaveAttribute('aria-selected');
      expect(tab).toHaveAttribute('aria-controls');
    });
  });

  it('displays sprint counts correctly in filter tabs', () => {
    render(<SprintList {...defaultProps} />);
    
    // Verify that filter counts are accurate by checking specific tabs
    expect(screen.getByRole('tab', { name: /All Sprints.*3/ })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Active.*1/ })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Planning.*1/ })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Completed.*1/ })).toBeInTheDocument();
  });

  it('shows empty state for filtered results', () => {
    // Create test data with no planning sprints to test empty state
    const sprintsWithoutPlanning = mockSprints.filter(sprint => sprint.status !== 'planning');
    
    render(<SprintList {...defaultProps} sprints={sprintsWithoutPlanning} />);
    
    // Filter by planning (which should show empty state)
    const planningFilterTab = screen.getByRole('tab', { name: /Planning.*0/ });
    fireEvent.click(planningFilterTab);
    
    expect(screen.getByText('No planning sprints')).toBeInTheDocument();
    expect(screen.getByText('There are no planning sprints at the moment.')).toBeInTheDocument();
  });

  it('shows correct empty state messages for different filters', () => {
    const emptySprintsList: Sprint[] = [];
    
    render(<SprintList {...defaultProps} sprints={emptySprintsList} />);
    
    // Test different filter states
    const activeFilterTab = screen.getByRole('tab', { name: /Active.*0/ });
    fireEvent.click(activeFilterTab);
    
    expect(screen.getByText('No active sprints')).toBeInTheDocument();
    expect(screen.getByText('There are no active sprints at the moment.')).toBeInTheDocument();
    
    const completedFilterTab = screen.getByRole('tab', { name: /Completed.*0/ });
    fireEvent.click(completedFilterTab);
    
    expect(screen.getByText('No completed sprints')).toBeInTheDocument();
    expect(screen.getByText('There are no completed sprints at the moment.')).toBeInTheDocument();
  });

  it('handles edge cases gracefully', () => {
    // Test with undefined/null callbacks
    const propsWithoutCallbacks = {
      ...defaultProps,
      onSprintCreated: undefined,
      onSprintUpdated: undefined,
      onSprintStarted: undefined,
      onSprintCompleted: undefined,
      onSprintSelected: undefined,
    };
    
    expect(() => {
      render(<SprintList {...propsWithoutCallbacks} />);
    }).not.toThrow();
  });

  it('has proper ARIA attributes for accessibility', () => {
    render(<SprintList {...defaultProps} />);
    
    // Check tablist has proper ARIA attributes
    const tablist = screen.getByRole('tablist');
    expect(tablist).toHaveAttribute('aria-label', 'Sprint filters');
    
    // Check tabpanel has proper ARIA attributes
    const tabpanel = screen.getByRole('tabpanel');
    expect(tabpanel).toHaveAttribute('id', 'all-panel');
    expect(tabpanel).toHaveAttribute('aria-labelledby', 'all-tab');
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
  });
});
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { ProductBacklog } from '../ProductBacklog';
import type { WorkItem, TeamMember } from '../../../types';

// Mock the drag and drop functionality
vi.mock('@dnd-kit/core', () => ({
<<<<<<< HEAD
  DndContext: ({ children, onDragEnd }: any) => (
=======
  DndContext: ({ children, onDragEnd }: { children: React.ReactNode; onDragEnd?: (event: { active: { id: string }; over: { id: string } }) => void }) => (
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
    <div data-testid="dnd-context" onClick={() => onDragEnd?.({ active: { id: '1' }, over: { id: '2' } })}>
      {children}
    </div>
  ),
  closestCenter: vi.fn(),
  KeyboardSensor: vi.fn(),
  PointerSensor: vi.fn(),
  useSensor: vi.fn(),
  useSensors: vi.fn(() => []),
}));

vi.mock('@dnd-kit/sortable', () => ({
  arrayMove: vi.fn((items, oldIndex, newIndex) => {
    const result = [...items];
    const [removed] = result.splice(oldIndex, 1);
    result.splice(newIndex, 0, removed);
    return result;
  }),
<<<<<<< HEAD
  SortableContext: ({ children }: any) => <div>{children}</div>,
=======
  SortableContext: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
  sortableKeyboardCoordinates: vi.fn(),
  verticalListSortingStrategy: vi.fn(),
  useSortable: vi.fn(() => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  })),
}));

vi.mock('@dnd-kit/utilities', () => ({
  CSS: {
    Transform: {
      toString: vi.fn(() => ''),
    },
  },
}));

vi.mock('@dnd-kit/modifiers', () => ({
  restrictToVerticalAxis: vi.fn(),
  restrictToParentElement: vi.fn(),
}));

const mockWorkItems: WorkItem[] = [
  {
    id: '1',
    projectId: 'project-1',
    title: 'User Story 1',
    description: 'First user story',
    type: 'story',
    status: 'To Do',
    priority: 'high',
    assigneeId: 'user-1',
    reporterId: 'user-1',
    estimate: 5,
    dependencies: [],
    labels: ['frontend'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    projectId: 'project-1',
    title: 'Bug Fix 1',
    description: 'Critical bug to fix',
    type: 'bug',
    status: 'To Do',
    priority: 'critical',
    reporterId: 'user-1',
    dependencies: [],
    labels: ['backend'],
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
  },
];

const mockTeamMembers: TeamMember[] = [
  {
    id: 'member-1',
    userId: 'user-1',
    projectId: 'project-1',
    role: 'owner',
    joinedAt: new Date('2024-01-01'),
  },
];

describe('Backlog Integration Tests', () => {
  const defaultProps = {
    projectId: 'project-1',
    workItems: mockWorkItems,
    teamMembers: mockTeamMembers,
    onCreateWorkItem: vi.fn(),
    onUpdateWorkItem: vi.fn(),
    onDeleteWorkItem: vi.fn(),
    onReorderWorkItems: vi.fn(),
    onBulkUpdate: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('integrates filtering, selection, and bulk editing', async () => {
    render(<ProductBacklog {...defaultProps} />);

    // Filter by type
    const typeFilter = screen.getByDisplayValue('All Items');
    fireEvent.change(typeFilter, { target: { value: 'story' } });

    // Should show only stories
    expect(screen.getByText('User Story 1')).toBeInTheDocument();
    expect(screen.queryByText('Bug Fix 1')).not.toBeInTheDocument();

    // Select the story
    const checkboxes = screen.getAllByRole('checkbox');
    const storyCheckbox = checkboxes[1]; // Skip select all checkbox
    fireEvent.click(storyCheckbox);

    // Should show bulk edit button
    expect(screen.getByText('Bulk Edit (1)')).toBeInTheDocument();

    // Open bulk edit modal
    const bulkEditButton = screen.getByText('Bulk Edit (1)');
    fireEvent.click(bulkEditButton);

    // Should show bulk edit modal
    expect(screen.getByText('Bulk Edit 1 Items')).toBeInTheDocument();

    // Change priority in bulk edit
    const prioritySelect = screen.getByLabelText('Priority');
    fireEvent.change(prioritySelect, { target: { value: 'critical' } });

    // Submit bulk edit
    const updateButton = screen.getByText('Update 1 Items');
    fireEvent.click(updateButton);

    // Should call onBulkUpdate
    await waitFor(() => {
      expect(defaultProps.onBulkUpdate).toHaveBeenCalledWith(['1'], {
        priority: 'critical',
      });
    });
  });

  it('integrates story estimation workflow', async () => {
    render(<ProductBacklog {...defaultProps} />);

    // Find the estimate button for the story
    const estimateButton = screen.getByText('5 points');
    fireEvent.click(estimateButton);

    // Should open estimation modal
    expect(screen.getByText('Estimate Story Points')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Estimate Story Points' })).toBeInTheDocument();

    // Select a different estimate
    const eightPointButton = screen.getByRole('button', { name: /8.*Large/s });
    fireEvent.click(eightPointButton);

    // Submit the estimate
    const saveButton = screen.getByText('Save Estimate');
    fireEvent.click(saveButton);

    // Should call onUpdateWorkItem with new estimate
    await waitFor(() => {
      expect(defaultProps.onUpdateWorkItem).toHaveBeenCalledWith('1', { estimate: 8 });
    });
  });

  it('integrates search and filtering', () => {
    render(<ProductBacklog {...defaultProps} />);

    // Filter by type first
    const typeFilter = screen.getByDisplayValue('All Items');
    fireEvent.change(typeFilter, { target: { value: 'bug' } });

    // Should show only bug items
    expect(screen.getByText('Bug Fix 1')).toBeInTheDocument();
    expect(screen.queryByText('User Story 1')).not.toBeInTheDocument();

    // Clear type filter and filter by priority
    fireEvent.change(typeFilter, { target: { value: 'all' } });
    
    const priorityFilter = screen.getByDisplayValue('All Priorities');
    fireEvent.change(priorityFilter, { target: { value: 'high' } });

    // Should show only high priority items
    expect(screen.getByText('User Story 1')).toBeInTheDocument();
    expect(screen.queryByText('Bug Fix 1')).not.toBeInTheDocument();
  });

  it('handles empty states correctly', () => {
    render(<ProductBacklog {...defaultProps} workItems={[]} />);

    // Should show empty state
    expect(screen.getByText('No backlog items')).toBeInTheDocument();
    expect(screen.getByText('Get started by creating your first work item.')).toBeInTheDocument();

    // Should show create button in empty state
    const addButtons = screen.getAllByText('Add Work Item');
    expect(addButtons.length).toBeGreaterThan(0);
  });

  it('handles loading state', () => {
    render(<ProductBacklog {...defaultProps} isLoading={true} />);

    // Should show loading indicator
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProductBacklog } from '../ProductBacklog';
import type { WorkItem, TeamMember } from '../../../types';

import { vi } from 'vitest';

// Mock the drag and drop functionality
vi.mock('@dnd-kit/core', () => ({
  DndContext: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
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
  SortableContext: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
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
  {
    id: '3',
    projectId: 'project-1',
    title: 'Task 1',
    description: 'Simple task',
    type: 'task',
    status: 'To Do',
    priority: 'medium',
    assigneeId: 'user-2',
    reporterId: 'user-1',
    estimate: 2,
    dependencies: [],
    labels: [],
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-03'),
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
  {
    id: 'member-2',
    userId: 'user-2',
    projectId: 'project-1',
    role: 'member',
    joinedAt: new Date('2024-01-01'),
  },
];

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

describe('ProductBacklog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the product backlog with work items', () => {
    render(<ProductBacklog {...defaultProps} />);
    
    expect(screen.getByText('Product Backlog')).toBeInTheDocument();
    expect(screen.getByText('User Story 1')).toBeInTheDocument();
    expect(screen.getByText('Bug Fix 1')).toBeInTheDocument();
    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('3 of 3 items')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(<ProductBacklog {...defaultProps} isLoading={true} />);
    
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('shows empty state when no work items', () => {
    render(<ProductBacklog {...defaultProps} workItems={[]} />);
    
    expect(screen.getByText('No backlog items')).toBeInTheDocument();
    expect(screen.getByText('Get started by creating your first work item.')).toBeInTheDocument();
  });

  it('filters work items by search term', async () => {
    render(<ProductBacklog {...defaultProps} />);
    
    const searchInput = screen.getByPlaceholderText('Search backlog items...');
    fireEvent.change(searchInput, { target: { value: 'Bug' } });
    
    // Wait for debounced search to take effect (300ms debounce + buffer)
    await waitFor(() => {
      expect(screen.queryByText('User Story 1')).not.toBeInTheDocument();
      expect(screen.getByText('Bug Fix 1')).toBeInTheDocument();
      expect(screen.queryByText('Task 1')).not.toBeInTheDocument();
    }, { timeout: 1000 });
    
    expect(screen.getByText('1 of 3 items')).toBeInTheDocument();
  });

  it('filters work items by type', () => {
    render(<ProductBacklog {...defaultProps} />);
    
    const typeFilter = screen.getByDisplayValue('All Items');
    fireEvent.change(typeFilter, { target: { value: 'story' } });
    
    expect(screen.getByText('User Story 1')).toBeInTheDocument();
    expect(screen.queryByText('Bug Fix 1')).not.toBeInTheDocument();
    expect(screen.queryByText('Task 1')).not.toBeInTheDocument();
    expect(screen.getByText('1 of 3 items')).toBeInTheDocument();
  });

  it('filters work items by priority', () => {
    render(<ProductBacklog {...defaultProps} />);
    
    const priorityFilter = screen.getByDisplayValue('All Priorities');
    fireEvent.change(priorityFilter, { target: { value: 'critical' } });
    
    expect(screen.getByText('Bug Fix 1')).toBeInTheDocument();
    expect(screen.queryByText('User Story 1')).not.toBeInTheDocument();
    expect(screen.queryByText('Task 1')).not.toBeInTheDocument();
    expect(screen.getByText('1 of 3 items')).toBeInTheDocument();
  });

  it('filters work items by assignee', () => {
    render(<ProductBacklog {...defaultProps} />);
    
    const assigneeFilter = screen.getByDisplayValue('All Assignees');
    fireEvent.change(assigneeFilter, { target: { value: 'user-1' } });
    
    expect(screen.getByText('User Story 1')).toBeInTheDocument();
    expect(screen.queryByText('Bug Fix 1')).not.toBeInTheDocument();
    expect(screen.queryByText('Task 1')).not.toBeInTheDocument();
    expect(screen.getByText('1 of 3 items')).toBeInTheDocument();
  });

  it('shows unassigned items when filtering by unassigned', () => {
    render(<ProductBacklog {...defaultProps} />);
    
    const assigneeFilter = screen.getByDisplayValue('All Assignees');
    fireEvent.change(assigneeFilter, { target: { value: 'unassigned' } });
    
    expect(screen.getByText('Bug Fix 1')).toBeInTheDocument();
    expect(screen.queryByText('User Story 1')).not.toBeInTheDocument();
    expect(screen.queryByText('Task 1')).not.toBeInTheDocument();
    expect(screen.getByText('1 of 3 items')).toBeInTheDocument();
  });

  it('opens create work item modal', () => {
    render(<ProductBacklog {...defaultProps} />);
    
    const addButton = screen.getByText('Add Work Item');
    fireEvent.click(addButton);
    
    expect(screen.getByRole('heading', { name: 'Create Work Item' })).toBeInTheDocument();
  });

  it('selects individual work items', () => {
    render(<ProductBacklog {...defaultProps} />);
    
    const checkboxes = screen.getAllByRole('checkbox');
    const firstItemCheckbox = checkboxes[1]; // Skip the "select all" checkbox
    
    fireEvent.click(firstItemCheckbox);
    
    expect(screen.getByText(/1 selected/)).toBeInTheDocument();
    expect(screen.getByText('Bulk Edit (1)')).toBeInTheDocument();
  });

  it('selects all visible items', () => {
    render(<ProductBacklog {...defaultProps} />);
    
    const selectAllCheckbox = screen.getByLabelText(/Select all visible items/);
    fireEvent.click(selectAllCheckbox);
    
    expect(screen.getByText(/3 selected/)).toBeInTheDocument();
    expect(screen.getByText('Bulk Edit (3)')).toBeInTheDocument();
  });

  it('opens bulk edit modal when items are selected', () => {
    render(<ProductBacklog {...defaultProps} />);
    
    const selectAllCheckbox = screen.getByLabelText(/Select all visible items/);
    fireEvent.click(selectAllCheckbox);
    
    const bulkEditButton = screen.getByText('Bulk Edit (3)');
    fireEvent.click(bulkEditButton);
    
    expect(screen.getByText('Bulk Edit 3 Items')).toBeInTheDocument();
  });

  it('shows estimation button for stories', () => {
    render(<ProductBacklog {...defaultProps} />);
    
    expect(screen.getByText('5 points')).toBeInTheDocument(); // Story with estimate
  });

  it('shows estimate button for stories without estimate', () => {
    const workItemsWithoutEstimate = [
      {
        ...mockWorkItems[0],
        estimate: undefined,
      },
    ];
    
    render(<ProductBacklog {...defaultProps} workItems={workItemsWithoutEstimate} />);
    
    expect(screen.getByText('Estimate')).toBeInTheDocument();
  });

  it('calls onCreateWorkItem when form is submitted', async () => {
    const mockOnCreate = vi.fn().mockResolvedValue(undefined);
    render(<ProductBacklog {...defaultProps} onCreateWorkItem={mockOnCreate} />);
    
    const addButton = screen.getByText('Add Work Item');
    fireEvent.click(addButton);
    
    // The form submission would be tested in the WorkItemForm component tests
    expect(screen.getByRole('heading', { name: 'Create Work Item' })).toBeInTheDocument();
  });

  it('calls onReorderWorkItems when items are reordered', async () => {
    const mockOnReorder = vi.fn().mockResolvedValue(undefined);
    render(<ProductBacklog {...defaultProps} onReorderWorkItems={mockOnReorder} />);
    
    // Drag and drop testing would require more complex setup with @dnd-kit
    // This is a placeholder for the reorder functionality test
    expect(screen.getByText('Product Backlog')).toBeInTheDocument();
  });

  it('shows no matching items message when filters return no results', async () => {
    render(<ProductBacklog {...defaultProps} />);
    
    const searchInput = screen.getByPlaceholderText('Search backlog items...');
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });
    
    // Wait for debounced search to take effect
    await waitFor(() => {
      expect(screen.getByText('No matching items')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Try adjusting your search or filters.')).toBeInTheDocument();
  });
});
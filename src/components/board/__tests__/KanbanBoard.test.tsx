import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { KanbanBoard } from '../KanbanBoard';
import type { WorkflowState } from '../../../types';

// Mock the hooks
vi.mock('../../../hooks/useWorkItems', () => ({
  useWorkItems: vi.fn(() => ({
    workItems: [],
    loading: false,
    error: null,
    fetchBacklog: vi.fn(),
  })),
}));

// Mock the services
vi.mock('../../../services', () => ({
  workItemService: {
    updateWorkItem: vi.fn(),
  },
}));

// Mock DnD Kit
vi.mock('@dnd-kit/core', () => ({
  DndContext: ({ children }: { children: React.ReactNode }) => <div data-testid="dnd-context">{children}</div>,
  useSensor: vi.fn(),
  useSensors: vi.fn(() => []),
  PointerSensor: vi.fn(),
  closestCorners: vi.fn(),
  useDroppable: vi.fn(() => ({
    setNodeRef: vi.fn(),
    isOver: false,
  })),
}));

vi.mock('@dnd-kit/sortable', () => ({
  SortableContext: ({ children }: { children: React.ReactNode }) => <div data-testid="sortable-context">{children}</div>,
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

describe('KanbanBoard', () => {
  const mockWorkflowStates: WorkflowState[] = [
    {
      id: '1',
      name: 'To Do',
      category: 'todo',
      color: '#gray',
      wipLimit: 5,
    },
    {
      id: '2',
      name: 'In Progress',
      category: 'in_progress',
      color: '#blue',
      wipLimit: 3,
    },
    {
      id: '3',
      name: 'Done',
      category: 'done',
      color: '#green',
    },
  ];

  // Mock work items for future test expansion
  // const mockWorkItems: WorkItem[] = [
  //   {
  //     id: '1',
  //     projectId: 'project-1',
  //     title: 'Test Work Item 1',
  //     description: 'Description 1',
  //     type: 'story',
  //     status: 'To Do',
  //     priority: 'medium',
  //     assigneeId: 'user-1',
  //     reporterId: 'user-1',
  //     estimate: 5,
  //     actualTime: 0,
  //     dependencies: [],
  //     labels: ['frontend'],
  //     createdAt: new Date(),
  //     updatedAt: new Date(),
  //   },
  //   {
  //     id: '2',
  //     projectId: 'project-1',
  //     title: 'Test Work Item 2',
  //     description: 'Description 2',
  //     type: 'task',
  //     status: 'In Progress',
  //     priority: 'high',
  //     assigneeId: 'user-2',
  //     reporterId: 'user-1',
  //     estimate: 3,
  //     actualTime: 1,
  //     dependencies: [],
  //     labels: ['backend'],
  //     createdAt: new Date(),
  //     updatedAt: new Date(),
  //   },
  // ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders board header', () => {
    render(
      <KanbanBoard
        projectId="project-1"
        workflowStates={mockWorkflowStates}
      />
    );

    expect(screen.getByText('Kanban Board')).toBeInTheDocument();
    expect(screen.getByText('Drag and drop work items to update their status')).toBeInTheDocument();
  });

  it('renders workflow state columns', () => {
    render(
      <KanbanBoard
        projectId="project-1"
        workflowStates={mockWorkflowStates}
      />
    );

    expect(screen.getByText('To Do')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('Done')).toBeInTheDocument();
  });

  it('shows loading state', async () => {
    const { useWorkItems } = await import('../../../hooks/useWorkItems');
    vi.mocked(useWorkItems).mockReturnValue({
      workItems: [],
      loading: true,
      error: null,
      fetchBacklog: vi.fn(),
      createWorkItem: vi.fn(),
      updateWorkItem: vi.fn(),
    });

    render(
      <KanbanBoard
        projectId="project-1"
        workflowStates={mockWorkflowStates}
      />
    );

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('shows error state', async () => {
    const { useWorkItems } = await import('../../../hooks/useWorkItems');
    vi.mocked(useWorkItems).mockReturnValue({
      workItems: [],
      loading: false,
      error: 'Failed to load work items',
      fetchBacklog: vi.fn(),
      createWorkItem: vi.fn(),
      updateWorkItem: vi.fn(),
    });

    render(
      <KanbanBoard
        projectId="project-1"
        workflowStates={mockWorkflowStates}
      />
    );

    expect(screen.getByText('Failed to load work items')).toBeInTheDocument();
  });

  it('shows empty state when no work items', () => {
    render(
      <KanbanBoard
        projectId="project-1"
        workflowStates={mockWorkflowStates}
      />
    );

    expect(screen.getByText('No work items yet')).toBeInTheDocument();
    expect(screen.getByText('Create work items in the backlog to see them on the board.')).toBeInTheDocument();
  });

  it('renders refresh button', () => {
    render(
      <KanbanBoard
        projectId="project-1"
        workflowStates={mockWorkflowStates}
      />
    );

    const refreshButton = screen.getByText('Refresh');
    expect(refreshButton).toBeInTheDocument();
  });
});
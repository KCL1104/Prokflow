import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { ScrumBoard } from '../ScrumBoard';
import type { WorkflowState, WorkItem, Sprint } from '../../../types';

// Mock the hooks
vi.mock('../../../hooks/useWorkItems', () => ({
  useWorkItems: vi.fn(() => ({
    workItems: [],
    loading: false,
    error: null,
    fetchBacklog: vi.fn(),
  })),
}));

vi.mock('../../../hooks/useSprints', () => ({
  useSprints: vi.fn(() => ({
    activeSprint: null,
    loading: false,
    error: null,
  })),
}));

// Mock the services
vi.mock('../../../services', () => ({
  workItemService: {
    updateWorkItem: vi.fn(),
  },
  sprintService: {
    getSprintBurndown: vi.fn(() => Promise.resolve([])),
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

describe('ScrumBoard', () => {
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

  const mockSprint: Sprint = {
    id: 'sprint-1',
    projectId: 'project-1',
    name: 'Sprint 1',
    goal: 'Complete user authentication',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-01-14'),
    status: 'active',
    capacity: 40,
    workItems: ['item-1', 'item-2'],
    createdAt: new Date('2024-01-01'),
  };

  const mockWorkItems: WorkItem[] = [
    {
      id: 'item-1',
      projectId: 'project-1',
      title: 'User login form',
      description: 'Create login form component',
      type: 'story',
      status: 'To Do',
      priority: 'high',
      assigneeId: 'user-1',
      reporterId: 'user-1',
      estimate: 8,
      actualTime: 0,
      dependencies: [],
      labels: ['frontend'],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'item-2',
      projectId: 'project-1',
      title: 'Authentication API',
      description: 'Implement authentication endpoints',
      type: 'task',
      status: 'In Progress',
      priority: 'high',
      assigneeId: 'user-2',
      reporterId: 'user-1',
      estimate: 13,
      actualTime: 5,
      dependencies: [],
      labels: ['backend'],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows no active sprint message when no sprint is active', () => {
    render(
      <ScrumBoard
        projectId="project-1"
        workflowStates={mockWorkflowStates}
      />
    );

    expect(screen.getByText('No Active Sprint')).toBeInTheDocument();
    expect(screen.getByText('Create and start a sprint to use the Scrum board view.')).toBeInTheDocument();
    expect(screen.getByText('Manage Sprints')).toBeInTheDocument();
  });

  it('renders sprint header when active sprint exists', async () => {
    const { useSprints } = await import('../../../hooks/useSprints');
    const { useWorkItems } = await import('../../../hooks/useWorkItems');
    
    vi.mocked(useSprints).mockReturnValue({
      activeSprint: mockSprint,
      sprints: [mockSprint],
      loading: false,
      error: null,
      fetchSprints: vi.fn(),
      fetchActiveSprint: vi.fn(),
      createSprint: vi.fn(),
      getSprint: vi.fn(),
    });

    vi.mocked(useWorkItems).mockReturnValue({
      workItems: mockWorkItems,
      loading: false,
      error: null,
      fetchBacklog: vi.fn(),
      createWorkItem: vi.fn(),
      updateWorkItem: vi.fn(),
      getSprintWorkItems: vi.fn(),
    });

    render(
      <ScrumBoard
        projectId="project-1"
        workflowStates={mockWorkflowStates}
      />
    );

    expect(screen.getByText('Sprint 1')).toBeInTheDocument();
    expect(screen.getByText('Complete user authentication')).toBeInTheDocument();
  });

  it('shows sprint progress indicators', async () => {
    const { useSprints } = await import('../../../hooks/useSprints');
    const { useWorkItems } = await import('../../../hooks/useWorkItems');
    
    vi.mocked(useSprints).mockReturnValue({
      activeSprint: mockSprint,
      sprints: [mockSprint],
      loading: false,
      error: null,
      fetchSprints: vi.fn(),
      fetchActiveSprint: vi.fn(),
      createSprint: vi.fn(),
      getSprint: vi.fn(),
    });

    vi.mocked(useWorkItems).mockReturnValue({
      workItems: mockWorkItems,
      loading: false,
      error: null,
      fetchBacklog: vi.fn(),
      createWorkItem: vi.fn(),
      updateWorkItem: vi.fn(),
      getSprintWorkItems: vi.fn(),
    });

    render(
      <ScrumBoard
        projectId="project-1"
        workflowStates={mockWorkflowStates}
      />
    );

    expect(screen.getByText('Work Progress')).toBeInTheDocument();
    expect(screen.getByText('Time Progress')).toBeInTheDocument();
    expect(screen.getByText('Capacity: 40 pts')).toBeInTheDocument();
  });

  it('toggles burndown chart visibility', async () => {
    const { useSprints } = await import('../../../hooks/useSprints');
    const { useWorkItems } = await import('../../../hooks/useWorkItems');
    
    vi.mocked(useSprints).mockReturnValue({
      activeSprint: mockSprint,
      sprints: [mockSprint],
      loading: false,
      error: null,
      fetchSprints: vi.fn(),
      fetchActiveSprint: vi.fn(),
      createSprint: vi.fn(),
      getSprint: vi.fn(),
    });

    vi.mocked(useWorkItems).mockReturnValue({
      workItems: mockWorkItems,
      loading: false,
      error: null,
      fetchBacklog: vi.fn(),
      createWorkItem: vi.fn(),
      updateWorkItem: vi.fn(),
      getSprintWorkItems: vi.fn(),
    });

    render(
      <ScrumBoard
        projectId="project-1"
        workflowStates={mockWorkflowStates}
      />
    );

    const burndownButton = screen.getByText('Show Burndown');
    expect(burndownButton).toBeInTheDocument();

    fireEvent.click(burndownButton);
    expect(screen.getByText('Hide Burndown')).toBeInTheDocument();
    expect(screen.getByText('Sprint Burndown')).toBeInTheDocument();
  });

  it('renders workflow state columns', async () => {
    const { useSprints } = await import('../../../hooks/useSprints');
    const { useWorkItems } = await import('../../../hooks/useWorkItems');
    
    vi.mocked(useSprints).mockReturnValue({
      activeSprint: mockSprint,
      sprints: [mockSprint],
      loading: false,
      error: null,
      fetchSprints: vi.fn(),
      fetchActiveSprint: vi.fn(),
      createSprint: vi.fn(),
      getSprint: vi.fn(),
    });

    vi.mocked(useWorkItems).mockReturnValue({
      workItems: mockWorkItems,
      loading: false,
      error: null,
      fetchBacklog: vi.fn(),
      createWorkItem: vi.fn(),
      updateWorkItem: vi.fn(),
      getSprintWorkItems: vi.fn(),
    });

    render(
      <ScrumBoard
        projectId="project-1"
        workflowStates={mockWorkflowStates}
      />
    );

    expect(screen.getByText('To Do')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('Done')).toBeInTheDocument();
  });

  it('shows loading state', async () => {
    const { useSprints } = await import('../../../hooks/useSprints');
    vi.mocked(useSprints).mockReturnValue({
      activeSprint: null,
      sprints: [],
      loading: true,
      error: null,
      fetchSprints: vi.fn(),
      fetchActiveSprint: vi.fn(),
      createSprint: vi.fn(),
      getSprint: vi.fn(),
    });

    render(
      <ScrumBoard
        projectId="project-1"
        workflowStates={mockWorkflowStates}
      />
    );

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('shows error state', async () => {
    const { useSprints } = await import('../../../hooks/useSprints');
    vi.mocked(useSprints).mockReturnValue({
      activeSprint: null,
      sprints: [],
      loading: false,
      error: 'Failed to load sprint data',
      fetchSprints: vi.fn(),
      fetchActiveSprint: vi.fn(),
      createSprint: vi.fn(),
      getSprint: vi.fn(),
    });

    render(
      <ScrumBoard
        projectId="project-1"
        workflowStates={mockWorkflowStates}
      />
    );

    expect(screen.getByText('Failed to load sprint data')).toBeInTheDocument();
  });

  it('shows empty state when no work items in sprint', async () => {
    const { useSprints } = await import('../../../hooks/useSprints');
    const { useWorkItems } = await import('../../../hooks/useWorkItems');
    
    const emptySprintMock = { ...mockSprint, workItems: [] };
    
    vi.mocked(useSprints).mockReturnValue({
      activeSprint: emptySprintMock,
      sprints: [emptySprintMock],
      loading: false,
      error: null,
      fetchSprints: vi.fn(),
      fetchActiveSprint: vi.fn(),
      createSprint: vi.fn(),
      getSprint: vi.fn(),
    });

    vi.mocked(useWorkItems).mockReturnValue({
      workItems: [],
      loading: false,
      error: null,
      fetchBacklog: vi.fn(),
      createWorkItem: vi.fn(),
      updateWorkItem: vi.fn(),
      getSprintWorkItems: vi.fn(),
    });

    render(
      <ScrumBoard
        projectId="project-1"
        workflowStates={mockWorkflowStates}
      />
    );

    expect(screen.getByText('No work items in sprint')).toBeInTheDocument();
    expect(screen.getByText('Add work items to this sprint from the backlog.')).toBeInTheDocument();
    expect(screen.getByText('Go to Backlog')).toBeInTheDocument();
  });

  it('renders refresh button', async () => {
    const { useSprints } = await import('../../../hooks/useSprints');
    const { useWorkItems } = await import('../../../hooks/useWorkItems');
    
    vi.mocked(useSprints).mockReturnValue({
      activeSprint: mockSprint,
      sprints: [mockSprint],
      loading: false,
      error: null,
      fetchSprints: vi.fn(),
      fetchActiveSprint: vi.fn(),
      createSprint: vi.fn(),
      getSprint: vi.fn(),
    });

    vi.mocked(useWorkItems).mockReturnValue({
      workItems: mockWorkItems,
      loading: false,
      error: null,
      fetchBacklog: vi.fn(),
      createWorkItem: vi.fn(),
      updateWorkItem: vi.fn(),
      getSprintWorkItems: vi.fn(),
    });

    render(
      <ScrumBoard
        projectId="project-1"
        workflowStates={mockWorkflowStates}
      />
    );

    const refreshButton = screen.getByText('Refresh');
    expect(refreshButton).toBeInTheDocument();
  });
});
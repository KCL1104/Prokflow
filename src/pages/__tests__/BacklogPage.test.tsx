import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { BacklogPage } from '../BacklogPage';
import { workItemService } from '../../services/workItemService';
import { projectService } from '../../services/projectService';
import type { WorkItem, TeamMember } from '../../types';

import { vi } from 'vitest';

// Mock the services
vi.mock('../../services/workItemService');
vi.mock('../../services/projectService');

// Mock react-router-dom with proper typing
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: vi.fn(() => ({ projectId: 'project-1' })),
  };
});

// Mock the ProductBacklog component with proper props typing
vi.mock('../../components/backlog/ProductBacklog', () => ({
  ProductBacklog: ({ projectId, workItems, teamMembers }: {
    projectId: string;
    workItems: WorkItem[];
    teamMembers: TeamMember[];
  }) => (
    <div data-testid="product-backlog">
      <div>Project ID: {projectId}</div>
      <div>Work Items: {workItems.length}</div>
      <div>Team Members: {teamMembers.length}</div>
    </div>
  )
}));

// Use factory functions for consistent test data
const createMockWorkItem = (overrides: Partial<WorkItem> = {}): WorkItem => ({
  id: '1',
  projectId: 'project-1',
  title: 'Test Work Item',
  description: 'Test description',
  type: 'story',
  status: 'To Do',
  priority: 'medium',
  reporterId: 'user-1',
  dependencies: [],
  labels: [],
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});

const createMockTeamMember = (overrides: Partial<TeamMember> = {}): TeamMember => ({
  id: 'member-1',
  userId: 'user-1',
  projectId: 'project-1',
  role: 'owner',
  joinedAt: new Date('2024-01-01'),
  ...overrides,
});

const mockWorkItems: WorkItem[] = [createMockWorkItem()];
const mockTeamMembers: TeamMember[] = [createMockTeamMember()];

const mockWorkItemService = workItemService as any;
const mockProjectService = projectService as any;

describe('BacklogPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockWorkItemService.getProjectBacklog = vi.fn().mockResolvedValue(mockWorkItems);
    mockProjectService.getProjectMembers = vi.fn().mockResolvedValue(mockTeamMembers);
  });

  it('renders loading state initially', () => {
    render(
      <MemoryRouter initialEntries={['/projects/project-1/backlog']}>
        <BacklogPage />
      </MemoryRouter>
    );

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('loads and displays backlog data', async () => {
    render(
      <MemoryRouter initialEntries={['/projects/project-1/backlog']}>
        <BacklogPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('product-backlog')).toBeInTheDocument();
    });

    expect(screen.getByText('Project ID: project-1')).toBeInTheDocument();
    expect(screen.getByText('Work Items: 1')).toBeInTheDocument();
    expect(screen.getByText('Team Members: 1')).toBeInTheDocument();
  });



  it('displays error when data loading fails', async () => {
    const errorMessage = 'Failed to load data';
    mockWorkItemService.getProjectBacklog = vi.fn().mockRejectedValue(new Error(errorMessage));

    render(
      <MemoryRouter initialEntries={['/projects/project-1/backlog']}>
        <BacklogPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Error Loading Backlog')).toBeInTheDocument();
    });

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    expect(screen.getByText('Retry')).toBeInTheDocument();
  });

  it('calls service methods with correct parameters', async () => {
    render(
      <MemoryRouter initialEntries={['/projects/project-1/backlog']}>
        <BacklogPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockWorkItemService.getProjectBacklog).toHaveBeenCalledWith('project-1');
      expect(mockProjectService.getProjectMembers).toHaveBeenCalledWith('project-1');
    });
  });

  it('renders page title and description', async () => {
    render(
      <MemoryRouter initialEntries={['/projects/project-1/backlog']}>
        <BacklogPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Product Backlog')).toBeInTheDocument();
    });

    expect(screen.getByText('Manage and prioritize your project\'s work items')).toBeInTheDocument();
  });

  it('handles empty data gracefully', async () => {
    mockWorkItemService.getProjectBacklog = vi.fn().mockResolvedValue([]);
    mockProjectService.getProjectMembers = vi.fn().mockResolvedValue([]);

    render(
      <MemoryRouter initialEntries={['/projects/project-1/backlog']}>
        <BacklogPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('product-backlog')).toBeInTheDocument();
    });

    expect(screen.getByText('Work Items: 0')).toBeInTheDocument();
    expect(screen.getByText('Team Members: 0')).toBeInTheDocument();
  });

  it('displays error when project ID is missing', async () => {
    const { useParams } = await import('react-router-dom');
    const mockUseParams = useParams as any;
    
    // Temporarily change mock return value
    mockUseParams.mockReturnValue({ projectId: '' });

    render(
      <MemoryRouter initialEntries={['/backlog']}>
        <BacklogPage />
      </MemoryRouter>
    );

    expect(screen.getByText('Project Not Found')).toBeInTheDocument();
    expect(screen.getByText('The project ID is missing from the URL.')).toBeInTheDocument();
    
    // Reset mock for other tests
    mockUseParams.mockReturnValue({ projectId: 'project-1' });
  });
});
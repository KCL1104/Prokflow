import { vi } from 'vitest';

// Centralized mock setup for consistent testing
export const createMockUseParams = () => {
  const mockUseParams = vi.fn<() => { projectId?: string }>();
  vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
      ...actual,
      useParams: mockUseParams,
    };
  });
  return mockUseParams;
};

export const createMockServices = () => ({
  workItemService: {
    getProjectBacklog: vi.fn(),
    createWorkItem: vi.fn(),
    updateWorkItem: vi.fn(),
    deleteWorkItem: vi.fn(),
  },
  projectService: {
    getProjectMembers: vi.fn(),
  },
});

// Common test data factories
export const createMockWorkItem = (overrides = {}) => ({
  id: '1',
  projectId: 'project-1',
  title: 'Test Work Item',
  description: 'Test description',
  type: 'story' as const,
  status: 'To Do',
  priority: 'medium' as const,
  reporterId: 'user-1',
  dependencies: [],
  labels: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createMockTeamMember = (overrides = {}) => ({
  id: 'member-1',
  userId: 'user-1',
  projectId: 'project-1',
  role: 'owner' as const,
  joinedAt: new Date(),
  ...overrides,
});
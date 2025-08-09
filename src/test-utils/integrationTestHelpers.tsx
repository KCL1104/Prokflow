/**
 * Integration test helpers for setting up test environments and utilities
 */
import React, { type ReactElement } from 'react';
import { vi, expect, beforeEach, afterEach } from 'vitest';
import { render, type RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import type { User, Project, WorkItem, Sprint, TeamMember } from '../types';

// Mock Supabase user for authenticated tests
export const mockSupabaseUser: SupabaseUser = {
  id: 'test-user-1',
  email: 'test@example.com',
  aud: 'authenticated',
  role: 'authenticated',
  email_confirmed_at: '2024-01-01T00:00:00.000Z',
  phone: '',
  confirmed_at: '2024-01-01T00:00:00.000Z',
  last_sign_in_at: '2024-01-01T00:00:00.000Z',
  app_metadata: {},
  user_metadata: {
    full_name: 'Test User',
    avatar_url: undefined,
  },
  identities: [],
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
};

// Mock application user
export const mockUser: User = {
  id: 'test-user-1',
  email: 'test@example.com',
  fullName: 'Test User',
  full_name: 'Test User', // For compatibility
  avatarUrl: undefined,
  avatar_url: undefined, // For compatibility
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  timezone: 'UTC',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

// Mock team members
export const mockTeamMembers: TeamMember[] = [
  {
    id: 'member-1',
    userId: 'test-user-1',
    projectId: 'test-project-1',
    role: 'owner',
    joinedAt: new Date('2024-01-01'),
  },
  {
    id: 'member-2',
    userId: 'test-user-2',
    projectId: 'test-project-1',
    role: 'member',
    joinedAt: new Date('2024-01-01'),
  },
];

// Mock project data
export const mockProject: Project = {
  id: 'test-project-1',
  name: 'Test Project',
  description: 'A test project for integration testing',
  methodology: 'scrum',
  workflowId: 'workflow-1',
  ownerId: 'test-user-1',
  teamMembers: mockTeamMembers,
  settings: {
    sprintDuration: 14,
    wipLimits: { 'In Progress': 3 },
    workingDays: [1, 2, 3, 4, 5],
    timezone: 'UTC',
    estimationUnit: 'story_points',
  },
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

// Mock work items
export const mockWorkItems: WorkItem[] = [
  {
    id: 'work-item-1',
    projectId: 'test-project-1',
    title: 'User Authentication',
    description: 'Implement user login and registration',
    type: 'story',
    status: 'To Do',
    priority: 'high',
    assigneeId: 'test-user-1',
    reporterId: 'test-user-1',
    estimate: 8,
    actualTime: 0,
    dependencies: [],
    labels: ['frontend', 'auth'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'work-item-2',
    projectId: 'test-project-1',
    title: 'API Integration',
    description: 'Connect frontend to backend API',
    type: 'task',
    status: 'In Progress',
    priority: 'medium',
    assigneeId: 'test-user-1',
    reporterId: 'test-user-1',
    estimate: 5,
    actualTime: 2,
    dependencies: ['work-item-1'],
    labels: ['backend'],
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
  },
];

// Mock sprint data
export const mockSprint: Sprint = {
  id: 'test-sprint-1',
  projectId: 'test-project-1',
  name: 'Sprint 1',
  goal: 'Complete user authentication and basic API integration',
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-01-14'),
  status: 'active',
  capacity: 40,
  workItems: ['work-item-1', 'work-item-2'],
  createdAt: new Date('2024-01-01'),
};

// Mock Supabase responses
export const createMockSupabaseResponse = <T,>(data: T, error: Error | null = null) => ({
  data,
  error,
});

// Mock session for authenticated tests
export const mockSession = {
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_in: 3600,
  expires_at: Date.now() / 1000 + 3600,
  token_type: 'bearer',
  user: mockSupabaseUser,
};

// Create mock auth context value
export const createMockAuthContext = (user: SupabaseUser | null = mockSupabaseUser) => ({
  user,
  session: user ? mockSession : null,
  loading: false,
  signUp: vi.fn().mockResolvedValue({ user, error: null }),
  signIn: vi.fn().mockResolvedValue({ user, error: null }),
  signInWithProvider: vi.fn().mockResolvedValue({ user, error: null }),
  signOut: vi.fn().mockResolvedValue({ error: null }),
  resetPassword: vi.fn().mockResolvedValue({ error: null }),
  updatePassword: vi.fn().mockResolvedValue({ error: null }),
});

// Enhanced render function with providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  user?: SupabaseUser | null;
  initialRoute?: string;
}

export const renderWithProviders = (
  ui: ReactElement,
  options: CustomRenderOptions = {}
) => {
  const { user: _user = mockSupabaseUser, initialRoute = '/', ...renderOptions } = options;

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <BrowserRouter>
      <AuthProvider>
        {children}
      </AuthProvider>
    </BrowserRouter>
  );

  // Navigate to initial route if specified
  if (initialRoute !== '/') {
    window.history.pushState({}, 'Test page', initialRoute);
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

// Database test utilities
export const setupTestDatabase = () => {
  // Mock database operations for integration tests
  const mockDatabase = {
    projects: new Map([['test-project-1', mockProject]]),
    workItems: new Map(mockWorkItems.map(item => [item.id, item])),
    sprints: new Map([['test-sprint-1', mockSprint]]),
    teamMembers: new Map(mockTeamMembers.map(member => [member.id, member])),
  };

  return {
    getProject: vi.fn((id: string) => 
      Promise.resolve(createMockSupabaseResponse(mockDatabase.projects.get(id) || null))
    ),
    getWorkItems: vi.fn((projectId: string) => 
      Promise.resolve(createMockSupabaseResponse(
        Array.from(mockDatabase.workItems.values()).filter(item => item.projectId === projectId)
      ))
    ),
    getSprints: vi.fn((projectId: string) => 
      Promise.resolve(createMockSupabaseResponse(
        Array.from(mockDatabase.sprints.values()).filter(sprint => sprint.projectId === projectId)
      ))
    ),
    getTeamMembers: vi.fn((projectId: string) => 
      Promise.resolve(createMockSupabaseResponse(
        Array.from(mockDatabase.teamMembers.values()).filter(member => member.projectId === projectId)
      ))
    ),
    createWorkItem: vi.fn((data: Partial<WorkItem>) => {
      const newItem: WorkItem = { 
        ...mockWorkItems[0], 
        ...data, 
        id: `work-item-${Date.now()}`, 
        createdAt: new Date(), 
        updatedAt: new Date() 
      };
      mockDatabase.workItems.set(newItem.id, newItem);
      return Promise.resolve(createMockSupabaseResponse(newItem));
    }),
    updateWorkItem: vi.fn((id: string, data: Partial<WorkItem>) => {
      const existing = mockDatabase.workItems.get(id);
      if (existing) {
        const updated = { ...existing, ...data, updatedAt: new Date() };
        mockDatabase.workItems.set(id, updated);
        return Promise.resolve(createMockSupabaseResponse(updated));
      }
      return Promise.resolve(createMockSupabaseResponse(null, new Error('Not found')));
    }),
    deleteWorkItem: vi.fn((id: string) => {
      mockDatabase.workItems.delete(id);
      return Promise.resolve(createMockSupabaseResponse(null));
    }),
  };
};

// Real-time test utilities
export const setupRealtimeTests = () => {
  const mockRealtimeChannel = {
    subscribe: vi.fn(),
    unsubscribe: vi.fn(),
    send: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
  };

  const mockRealtime = {
    channel: vi.fn(() => mockRealtimeChannel),
    removeAllChannels: vi.fn(),
    getChannels: vi.fn(() => []),
  };

  return { mockRealtime, mockRealtimeChannel };
};

// Performance test utilities
export const measurePerformance = async (fn: () => Promise<void> | void) => {
  const start = performance.now();
  await fn();
  const end = performance.now();
  return end - start;
};

// Wait for async operations to complete
export const waitForAsyncOperations = () => new Promise(resolve => setTimeout(resolve, 0));

// Mock API responses for different scenarios
export const createApiMocks = () => ({
  success: <T,>(data: T) => Promise.resolve({ data, error: null }),
  error: (message: string) => Promise.resolve({ data: null, error: new Error(message) }),
  loading: () => new Promise<never>(() => {}), // Never resolves, simulates loading
  delayed: <T,>(data: T, delay = 100) => 
    new Promise<{ data: T; error: null }>(resolve => 
      setTimeout(() => resolve({ data, error: null }), delay)
    ),
});

// Test data generators
export const generateWorkItem = (overrides: Partial<WorkItem> = {}): WorkItem => ({
  ...mockWorkItems[0],
  id: `work-item-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
  ...overrides,
});

export const generateProject = (overrides: Partial<Project> = {}): Project => ({
  ...mockProject,
  id: `project-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
  ...overrides,
});

export const generateSprint = (overrides: Partial<Sprint> = {}): Sprint => ({
  ...mockSprint,
  id: `sprint-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
  ...overrides,
});

export const generateUser = (overrides: Partial<User> = {}): User => ({
  ...mockUser,
  id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
  ...overrides,
});

export const generateTeamMember = (overrides: Partial<TeamMember> = {}): TeamMember => ({
  ...mockTeamMembers[0],
  id: `member-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
  ...overrides,
});

// Cleanup utilities
export const cleanupTestData = () => {
  // Reset all mocks
  vi.clearAllMocks();
  
  // Clear any test data from localStorage/sessionStorage
  localStorage.clear();
  sessionStorage.clear();
  
  // Reset window location
  window.history.replaceState({}, '', '/');
  
  // Clear any pending timers
  vi.clearAllTimers();
};

// Test assertion helpers
export const expectToBeInDocument = (element: HTMLElement | null) => {
  expect(element).toBeInTheDocument();
};

export const expectToHaveText = (element: HTMLElement | null, text: string) => {
  expect(element).toHaveTextContent(text);
};

export const expectToBeVisible = (element: HTMLElement | null) => {
  expect(element).toBeVisible();
};

// Mock service responses
export const createMockServiceResponse = <T,>(data: T) => ({
  data,
  error: null,
  status: 200,
  statusText: 'OK',
});

export const createMockServiceError = (message: string, status = 400) => ({
  data: null,
  error: new Error(message),
  status,
  statusText: 'Error',
});

// Integration test setup helper
export const setupIntegrationTest = () => {
  beforeEach(() => {
    cleanupTestData();
  });

  afterEach(() => {
    cleanupTestData();
  });
};
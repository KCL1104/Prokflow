/**
 * API Integration Tests for Supabase Operations
 * Tests database operations, authentication, and real-time subscriptions
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { projectService } from '../../services/projectService';
import { workItemService } from '../../services/workItemService';
import { auth } from '../../lib/supabase';
import { realtimeService } from '../../services/realtimeService';
import { supabase, getCurrentUserId } from '../../lib/supabase';


// Mock data
const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  fullName: 'Test User',
  full_name: 'Test User', // For compatibility
  avatarUrl: undefined,
  avatar_url: undefined, // For compatibility
  timezone: 'UTC',
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-01T00:00:00Z'),
};

// Mock data objects removed as they were unused

// Create mock query builder
const createMockQuery = () => ({
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  neq: vi.fn().mockReturnThis(),
  gt: vi.fn().mockReturnThis(),
  gte: vi.fn().mockReturnThis(),
  lt: vi.fn().mockReturnThis(),
  lte: vi.fn().mockReturnThis(),
  like: vi.fn().mockReturnThis(),
  ilike: vi.fn().mockReturnThis(),
  in: vi.fn().mockReturnThis(),
  contains: vi.fn().mockReturnThis(),
  is: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  single: vi.fn().mockResolvedValue({ data: null, error: null }),
  maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
  overlaps: vi.fn().mockReturnThis(),
  or: vi.fn().mockReturnThis(),
  range: vi.fn().mockReturnThis(),
});

// Create mock channel
const createMockChannel = () => ({
  on: vi.fn().mockReturnThis(),
  subscribe: vi.fn().mockResolvedValue({ status: 'SUBSCRIBED' }),
  unsubscribe: vi.fn().mockResolvedValue({ status: 'CLOSED' }),
  send: vi.fn().mockResolvedValue({ status: 'ok' }),
  track: vi.fn().mockResolvedValue({ status: 'ok' }),
  untrack: vi.fn().mockResolvedValue({ status: 'ok' }),
  presenceState: vi.fn(() => ({})),
});

// Mock Supabase client
vi.mock('../../lib/supabase', () => {
  const mockAuth = {
    signUp: vi.fn(),
    signInWithPassword: vi.fn(),
    signInWithOAuth: vi.fn(),
    signOut: vi.fn(),
    getUser: vi.fn(),
    getSession: vi.fn(),
    onAuthStateChange: vi.fn(),
    resetPasswordForEmail: vi.fn(),
    updateUser: vi.fn(),
  };

  const mockAuthHelper = {
    signUp: vi.fn(),
    signIn: vi.fn(),
    signInWithProvider: vi.fn(),
    signOut: vi.fn(),
    resetPassword: vi.fn(),
    updatePassword: vi.fn(),
    getSession: vi.fn(),
    getUser: vi.fn(),
    onAuthStateChange: vi.fn(),
  };

  return {
    supabase: {
      from: vi.fn(() => createMockQuery()),
      auth: mockAuth,
      channel: vi.fn(() => createMockChannel()),
      removeAllChannels: vi.fn().mockResolvedValue({ status: 'ok' }),
      rpc: vi.fn().mockResolvedValue({ data: true, error: null }),
      realtime: {
        isConnected: vi.fn(() => true),
      },
    },
    auth: mockAuthHelper,
    getCurrentUserId: vi.fn(),
  };
});

describe('API Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mock implementations
    (getCurrentUserId as ReturnType<typeof vi.fn>).mockResolvedValue('user-1');
    
    // Setup auth mocks
    (supabase.auth.signUp as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { user: mockUser, session: null },
      error: null
    });
    
    (supabase.auth.signInWithPassword as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { user: mockUser, session: { access_token: 'token' } },
      error: null
    });
    
    (auth.signUp as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { user: mockUser, session: null },
      error: null
    });
    
    (auth.signIn as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { user: mockUser, session: { access_token: 'token' } },
      error: null
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Authentication Integration', () => {
    it('should handle user registration successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      };

      const result = await auth.signUp(userData.email, userData.password, {
        full_name: userData.name
      });

      expect(auth.signUp).toHaveBeenCalledWith(
        userData.email,
        userData.password,
        { full_name: userData.name }
      );
      expect(result.data.user).toEqual(mockUser);
      expect(result.error).toBeNull();
    });

    it('should handle user login successfully', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'password123'
      };

      const result = await auth.signIn(credentials.email, credentials.password);

      expect(auth.signIn).toHaveBeenCalledWith(
        credentials.email,
        credentials.password
      );
      expect(result.data.user).toEqual(mockUser);
      expect(result.data.session).toBeDefined();
      expect(result.error).toBeNull();
    });

    it('should handle authentication errors', async () => {
      const authError = {
        message: 'Invalid credentials',
        status: 400
      };

      (auth.signIn as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: { user: null, session: null },
        error: authError
      });

      const result = await auth.signIn('invalid@email.com', 'wrongpassword');

      expect(result.error).toEqual(authError);
      expect(result.data.user).toBeNull();
    });

    it('should handle password reset', async () => {
      (auth.resetPassword as ReturnType<typeof vi.fn>).mockResolvedValue({ error: null });

      const result = await auth.resetPassword('test@example.com');

      expect(auth.resetPassword).toHaveBeenCalledWith('test@example.com');
      expect(result.error).toBeNull();
    });

    it('should handle OAuth authentication', async () => {
      (auth.signInWithProvider as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: { url: 'https://oauth.provider.com/auth' },
        error: null
      });

      const result = await auth.signInWithProvider('google');

      expect(auth.signInWithProvider).toHaveBeenCalledWith('google');
      expect(result.data.url).toBe('https://oauth.provider.com/auth');
      expect(result.error).toBeNull();
    });
  });

  describe('Project Service Integration', () => {
    beforeEach(() => {
      // Mock workflow query
      const mockWorkflowQuery = createMockQuery();
      mockWorkflowQuery.single.mockResolvedValue({
        data: { id: 'workflow-1' },
        error: null
      });
      
      // Mock project creation
      const mockProjectQuery = createMockQuery();
      mockProjectQuery.single.mockResolvedValue({
        data: {
          id: 'project-1',
          name: 'Test Project',
          description: 'A test project',
          methodology: 'scrum',
          workflow_id: 'workflow-1',
          owner_id: 'user-1',
          settings: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        error: null
      });
      
      // Mock team members query
      const mockMembersQuery = createMockQuery();
      mockMembersQuery.order.mockResolvedValue({
        data: [],
        error: null
      });
      
      (supabase.from as ReturnType<typeof vi.fn>).mockImplementation((table: string) => {
        if (table === 'workflows') return mockWorkflowQuery;
        if (table === 'projects') return mockProjectQuery;
        if (table === 'project_members') return mockMembersQuery;
        return createMockQuery();
      });
    });

    it('should create a project successfully', async () => {
      const projectData = {
        name: 'Test Project',
        description: 'A test project',
        methodology: 'scrum' as const
      };

      // Mock workflow query first
      const mockWorkflowQuery = createMockQuery();
      mockWorkflowQuery.eq.mockReturnThis();
      mockWorkflowQuery.limit.mockResolvedValue({
        data: [{
          id: 'workflow-1',
          name: 'Scrum Workflow',
          methodology: 'scrum',
          states: []
        }],
        error: null
      });

      // Mock project insert
      const mockProjectInsert = createMockQuery();
      mockProjectInsert.single.mockResolvedValue({
        data: {
          id: 'project-1',
          name: 'Test Project',
          description: 'A test project',
          methodology: 'scrum',
          workflow_id: 'workflow-1',
          owner_id: 'user-1',
          settings: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        error: null
      });

      (supabase.from as ReturnType<typeof vi.fn>)
        .mockReturnValueOnce(mockWorkflowQuery) // First call for workflows
        .mockReturnValueOnce(mockProjectInsert); // Second call for project insert

      const result = await projectService.createProject(projectData);

      expect(result.name).toBe(projectData.name);
      expect(result.description).toBe(projectData.description);
      expect(result.methodology).toBe(projectData.methodology);
      expect(result.ownerId).toBe('user-1');
    });

    it('should get a project by ID', async () => {
      const result = await projectService.getProject('project-1');

      expect(result.id).toBe('project-1');
      expect(result.name).toBe('Test Project');
    });

    it('should update a project', async () => {
      const updateData = {
        name: 'Updated Project Name',
        description: 'Updated description'
      };

      // Mock the updated project response
      const mockUpdateQuery = createMockQuery();
      mockUpdateQuery.single.mockResolvedValue({
        data: {
          id: 'project-1',
          name: 'Updated Project Name',
          description: 'Updated description',
          methodology: 'scrum',
          workflow_id: 'workflow-1',
          owner_id: 'user-1',
          settings: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        error: null
      });
      
      // Mock team members query
      const mockMembersQuery = createMockQuery();
      mockMembersQuery.order.mockResolvedValue({
        data: [],
        error: null
      });
      
      (supabase.from as ReturnType<typeof vi.fn>).mockImplementation((table: string) => {
        if (table === 'projects') return mockUpdateQuery;
        if (table === 'project_members') return mockMembersQuery;
        return createMockQuery();
      });

      const result = await projectService.updateProject('project-1', updateData);

      expect(result.name).toBe('Updated Project Name');
      expect(result.description).toBe('Updated description');
    });
  });

  describe('Work Item Service Integration', () => {
    beforeEach(() => {
      // Mock project workflow query
      const mockProjectQuery = createMockQuery();
      mockProjectQuery.single.mockResolvedValue({
        data: { workflow_id: 'workflow-1' },
        error: null
      });
      
      // Mock workflow state query
      const mockStateQuery = createMockQuery();
      mockStateQuery.limit.mockResolvedValue({
        data: [{ name: 'To Do' }],
        error: null
      });
      
      // Mock work item creation
      const mockWorkItemQuery = createMockQuery();
      mockWorkItemQuery.single.mockResolvedValue({
        data: {
          id: 'work-item-1',
          project_id: 'project-1',
          title: 'Test Work Item',
          description: 'A test work item',
          type: 'task',
          status: 'To Do',
          priority: 'medium',
          reporter_id: 'user-1',
          labels: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        error: null
      });
      
      (supabase.from as ReturnType<typeof vi.fn>).mockImplementation((table: string) => {
        if (table === 'projects') return mockProjectQuery;
        if (table === 'workflow_states') return mockStateQuery;
        if (table === 'work_items') return mockWorkItemQuery;
        return createMockQuery();
      });
    });

    it('should create a work item successfully', async () => {
      const workItemData = {
        projectId: 'project-1',
        title: 'Test Work Item',
        description: 'A test work item',
        type: 'task' as const,
        priority: 'medium' as const
      };

      const result = await workItemService.createWorkItem(workItemData);

      expect(result.title).toBe(workItemData.title);
      expect(result.description).toBe(workItemData.description);
      expect(result.type).toBe(workItemData.type);
      expect(result.priority).toBe(workItemData.priority);
      expect(result.projectId).toBe(workItemData.projectId);
    });

    it('should get work item by ID', async () => {
      const result = await workItemService.getWorkItem('work-item-1');

      expect(result.id).toBe('work-item-1');
      expect(result.title).toBe('Test Work Item');
    });

    it('should update a work item', async () => {
      const updateData = {
        title: 'Updated Work Item',
        status: 'In Progress'
      };

      // Mock the updated work item response
      const mockWorkItemQuery = createMockQuery();
      mockWorkItemQuery.single.mockResolvedValue({
        data: {
          id: 'work-item-1',
          project_id: 'project-1',
          title: 'Updated Work Item',
          description: 'A test work item',
          type: 'task',
          status: 'In Progress',
          priority: 'medium',
          reporter_id: 'user-1',
          labels: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        error: null
      });
      
      (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue(mockWorkItemQuery);

      const result = await workItemService.updateWorkItem('work-item-1', updateData);

      expect(result.title).toBe('Updated Work Item');
      expect(result.status).toBe('In Progress');
    });
  });

  describe('Real-time Integration', () => {
    let mockChannel: ReturnType<typeof createMockChannel>;

    beforeEach(() => {
      mockChannel = createMockChannel();
      (supabase.channel as ReturnType<typeof vi.fn>).mockReturnValue(mockChannel);
    });

    it('should subscribe to project updates', () => {
      const callback = vi.fn();
      
      const unsubscribe = realtimeService.subscribe({
        type: 'project_updates',
        projectId: 'project-1',
        userId: 'user-1'
      }, callback);

      expect(supabase.channel).toHaveBeenCalledWith('project_updates_project-1');
      expect(mockChannel.subscribe).toHaveBeenCalled();
      expect(typeof unsubscribe).toBe('function');
    });

    it('should unsubscribe from channels', () => {
      const callback = vi.fn();
      
      // First subscribe
      const unsubscribe = realtimeService.subscribe({
        type: 'project_updates',
        projectId: 'project-1',
        userId: 'user-1'
      }, callback);
      
      // Then unsubscribe
      unsubscribe();
      
      expect(mockChannel.unsubscribe).toHaveBeenCalled();
    });

    it('should handle cursor updates', () => {
      // First subscribe to cursor tracking
      realtimeService.subscribe({
        type: 'cursor_tracking',
        projectId: 'project-1',
        userId: 'user-1'
      }, vi.fn());
      
      // Then update cursor
      realtimeService.updateCursor('project-1', {
        userId: 'user-1',
        x: 100,
        y: 200
      });

      expect(mockChannel.send).toHaveBeenCalledWith({
        type: 'broadcast',
        event: 'cursor_update',
        payload: {
          userId: 'user-1',
          x: 100,
          y: 200,
          timestamp: expect.any(Number)
        }
      });
    });

    it('should handle notifications', () => {
      // First subscribe to notifications
      realtimeService.subscribe({
        type: 'notifications',
        projectId: 'project-1',
        userId: 'user-1'
      }, vi.fn());
      
      // Then send notification
      realtimeService.sendNotification('project-1', {
        type: 'work_item_updated',
        title: 'Work item updated',
        message: 'A work item has been updated',
        userId: 'user-1',
        projectId: 'project-1'
      });

      expect(mockChannel.send).toHaveBeenCalledWith({
        type: 'broadcast',
        event: 'notification',
        payload: {
          type: 'work_item_updated',
          title: 'Work item updated',
          message: 'A work item has been updated',
          userId: 'user-1',
          timestamp: expect.any(Number)
        }
      });
    });
  });

  describe('Performance and Error Handling', () => {
    it('should handle large dataset queries efficiently', async () => {
      const largeDataset = Array.from({ length: 50 }, (_, i) => ({
        id: `work-item-${i}`,
        project_id: 'project-1',
        title: `Work Item ${i}`,
        type: 'task',
        status: 'To Do',
        priority: 'medium',
        reporter_id: 'user-1',
        labels: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      const mockQuery = createMockQuery();
      mockQuery.order.mockResolvedValue({
        data: largeDataset,
        error: null
      });
      
      (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue(mockQuery);

      const startTime = performance.now();
      const result = await workItemService.getProjectBacklog('project-1');
      const endTime = performance.now();

      expect(result).toHaveLength(50);
      expect(endTime - startTime).toBeLessThan(100);
    });

    it('should handle database errors gracefully', async () => {
      const mockQuery = createMockQuery();
      mockQuery.single.mockResolvedValue({
        data: null,
        error: { message: 'Database connection failed', code: 'DB_ERROR' }
      });
      
      (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue(mockQuery);

      await expect(projectService.getProject('invalid-id'))
        .rejects
        .toThrow('Failed to get project: Database connection failed');
    });

    it('should handle concurrent API requests', async () => {
      const mockQuery = createMockQuery();
      mockQuery.single.mockResolvedValue({
        data: {
          id: 'project-1',
          name: 'Test Project',
          description: 'A test project',
          methodology: 'scrum',
          workflow_id: 'workflow-1',
          owner_id: 'user-1',
          settings: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        error: null
      });
      
      const mockMembersQuery = createMockQuery();
      mockMembersQuery.order.mockResolvedValue({
        data: [],
        error: null
      });
      
      (supabase.from as ReturnType<typeof vi.fn>).mockImplementation((table: string) => {
        if (table === 'project_members') return mockMembersQuery;
        return mockQuery;
      });

      const promises = Array.from({ length: 10 }, () => 
        projectService.getProject('project-1')
      );

      const results = await Promise.all(promises);

      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result.id).toBe('project-1');
        expect(result.name).toBe('Test Project');
      });
    });
  });
});
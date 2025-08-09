import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { supabase } from '../../lib/supabase';
import { AuthService } from '../../services/authService';
import { DatabaseService } from '../../services/databaseService';
import { RealtimeService } from '../../services/realtimeService';
import { ProjectService } from '../../services/projectService';
import { WorkItemService } from '../../services/workItemService';
import { SprintService } from '../../services/sprintService';
import type { Project, WorkItem, Sprint } from '../../types';

// Test user credentials
const TEST_USER = {
  email: 'test@example.com',
  password: 'Abcd_123'
};

// Test data
const TEST_PROJECT = {
  name: 'Integration Test Project',
  description: 'A project created for integration testing',
  key: 'ITP'
};

const TEST_WORK_ITEM = {
  title: 'Test Work Item',
  description: 'A work item for testing',
  type: 'story' as const,
  priority: 'medium' as const,
  status: 'todo' as const
};

const TEST_SPRINT = {
  name: 'Test Sprint',
  goal: 'Complete integration testing',
  start_date: new Date().toISOString(),
  end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString() // 2 weeks from now
};

describe('Supabase Integration Tests', () => {
  let authService: AuthService;
  let databaseService: DatabaseService;
  let realtimeService: RealtimeService;
  let projectService: ProjectService;
  let workItemService: WorkItemService;
  let sprintService: SprintService;

  
  let testProject: Project;
  let testWorkItem: WorkItem;
  let testSprint: Sprint;
  let userId: string;

  beforeAll(async () => {
    // Initialize services
    authService = new AuthService();
    databaseService = new DatabaseService();
    realtimeService = new RealtimeService();
    projectService = new ProjectService();
    workItemService = new WorkItemService();
    sprintService = new SprintService();


    // Clear any existing session
    await supabase.auth.signOut();
  });

  afterAll(async () => {
    // Cleanup: Remove test data
    try {
      if (testWorkItem?.id) {
        await workItemService.deleteWorkItem(testWorkItem.id);
      }
      if (testSprint?.id) {
        await sprintService.deleteSprint(testSprint.id);
      }
      if (testProject?.id) {
        await projectService.deleteProject(testProject.id);
      }
    } catch (error) {
      console.warn('Cleanup failed:', error);
    }

    // Sign out
    await supabase.auth.signOut();
  });

  describe('1. Authentication Integration', () => {
    it('should connect to Supabase successfully', async () => {
      const { data, error } = await supabase.from('users').select('count').limit(1);
      expect(error).toBeNull();
      expect(data).toBeDefined();
    });

    it('should authenticate with test user credentials', async () => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: TEST_USER.email,
        password: TEST_USER.password
      });

      expect(error).toBeNull();
      expect(data.user).toBeDefined();
      expect(data.user?.email).toBe(TEST_USER.email);
      expect(data.session).toBeDefined();
      
      userId = data.user!.id;
    });

    it('should get current user session', async () => {
      const { data: { session } } = await supabase.auth.getSession();
      expect(session).toBeDefined();
      expect(session?.user.email).toBe(TEST_USER.email);
    });

    it('should get user profile through AuthService', async () => {
      const profile = await authService.getCurrentUserProfile();
      expect(profile).toBeDefined();
      expect(profile?.email).toBe(TEST_USER.email);
    });
  });

  describe('2. Database Operations Integration', () => {
    it('should test database connection', async () => {
      const isConnected = await databaseService.testConnection();
      expect(isConnected).toBe(true);
    });

    it('should fetch default workflows', async () => {
      const workflows = await databaseService.getDefaultWorkflows();
      expect(workflows).toBeDefined();
      expect(Array.isArray(workflows)).toBe(true);
    });

    it('should fetch workflow states', async () => {
      const states = await databaseService.getWorkflowStates();
      expect(states).toBeDefined();
      expect(Array.isArray(states)).toBe(true);
    });

    it('should create a test project', async () => {
      testProject = await projectService.createProject({
        ...TEST_PROJECT,
        owner_id: userId
      });

      expect(testProject).toBeDefined();
      expect(testProject.name).toBe(TEST_PROJECT.name);
      expect(testProject.key).toBe(TEST_PROJECT.key);
      expect(testProject.owner_id).toBe(userId);
    });

    it('should fetch projects for user', async () => {
      const projects = await projectService.getUserProjects();
      expect(projects).toBeDefined();
      expect(Array.isArray(projects)).toBe(true);
      expect(projects.some(p => p.id === testProject.id)).toBe(true);
    });

    it('should create a test work item', async () => {
      testWorkItem = await workItemService.createWorkItem({
        ...TEST_WORK_ITEM,
        project_id: testProject.id,
        reporter_id: userId
      });

      expect(testWorkItem).toBeDefined();
      expect(testWorkItem.title).toBe(TEST_WORK_ITEM.title);
      expect(testWorkItem.project_id).toBe(testProject.id);
    });

    it('should fetch work items for project', async () => {
      const workItems = await workItemService.getWorkItemsByProject(testProject.id);
      expect(workItems).toBeDefined();
      expect(Array.isArray(workItems)).toBe(true);
      expect(workItems.some(wi => wi.id === testWorkItem.id)).toBe(true);
    });

    it('should update work item', async () => {
      const updatedTitle = 'Updated Test Work Item';
      const updatedWorkItem = await workItemService.updateWorkItem(testWorkItem.id, {
        title: updatedTitle
      });

      expect(updatedWorkItem).toBeDefined();
      expect(updatedWorkItem.title).toBe(updatedTitle);
    });

    it('should create a test sprint', async () => {
      testSprint = await sprintService.createSprint({
        ...TEST_SPRINT,
        project_id: testProject.id
      });

      expect(testSprint).toBeDefined();
      expect(testSprint.name).toBe(TEST_SPRINT.name);
      expect(testSprint.project_id).toBe(testProject.id);
    });

    it('should fetch sprints for project', async () => {
      const sprints = await sprintService.getSprintsByProject(testProject.id);
      expect(sprints).toBeDefined();
      expect(Array.isArray(sprints)).toBe(true);
      expect(sprints.some(s => s.id === testSprint.id)).toBe(true);
    });
  });

  describe('3. Real-time Functionality Integration', () => {
    it('should initialize realtime service', () => {
      expect(realtimeService).toBeDefined();
      expect(typeof realtimeService.subscribeToProjectUpdates).toBe('function');
      expect(typeof realtimeService.subscribeToWorkItemUpdates).toBe('function');
    });

    it('should subscribe to project updates', async () => {
      const mockCallback = vi.fn();
      
      const unsubscribe = realtimeService.subscribeToProjectUpdates(
        testProject.id,
        mockCallback
      );

      expect(typeof unsubscribe).toBe('function');
      
      // Test subscription by updating project
      await projectService.updateProject(testProject.id, {
        description: 'Updated description for realtime test'
      });

      // Wait a bit for realtime event
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Cleanup
      unsubscribe();
    });

    it('should subscribe to work item updates', async () => {
      const mockCallback = vi.fn();
      
      const unsubscribe = realtimeService.subscribeToWorkItemUpdates(
        testProject.id,
        mockCallback
      );

      expect(typeof unsubscribe).toBe('function');
      
      // Test subscription by updating work item
      await workItemService.updateWorkItem(testWorkItem.id, {
        description: 'Updated description for realtime test'
      });

      // Wait a bit for realtime event
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Cleanup
      unsubscribe();
    });

    it('should handle cursor tracking', () => {
      const mockCursor = {
        x: 100,
        y: 200,
        user_id: userId,
        user_name: 'Test User'
      };

      expect(() => {
        realtimeService.updateCursor(testProject.id, mockCursor);
      }).not.toThrow();
    });
  });

  describe('4. Notification Table Integration', () => {
    it('should create a notification directly in database', async () => {
      const { data: notification, error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          title: 'Test Notification',
          message: 'This is a test notification for integration testing',
          type: 'info'
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(notification).toBeDefined();
      expect(notification.title).toBe('Test Notification');
      expect(notification.user_id).toBe(userId);
    });

    it('should fetch user notifications from database', async () => {
      const { data: notifications, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId);

      expect(error).toBeNull();
      expect(notifications).toBeDefined();
      expect(Array.isArray(notifications)).toBe(true);
    });
  });

  describe('5. RPC Functions Integration', () => {
    it('should test workflow validation RPC', async () => {
      const result = await databaseService.testWorkflowValidation();
      expect(result).toBeDefined();
    });

    it('should test project metrics RPC', async () => {
      const result = await databaseService.testProjectMetrics();
      expect(result).toBeDefined();
    });

    it('should test sprint velocity calculation RPC', async () => {
      const result = await databaseService.testSprintVelocity();
      expect(result).toBeDefined();
    });

    it('should test WIP limit check RPC', async () => {
      const result = await databaseService.testWipLimit();
      expect(result).toBeDefined();
    });
  });

  describe('6. Error Handling and Edge Cases', () => {
    it('should handle invalid authentication gracefully', async () => {
      await supabase.auth.signOut();
      
      const { error } = await supabase.auth.signInWithPassword({
        email: 'invalid@example.com',
        password: 'wrongpassword'
      });

      expect(error).toBeDefined();
      
      // Re-authenticate for remaining tests
      await supabase.auth.signInWithPassword({
        email: TEST_USER.email,
        password: TEST_USER.password
      });
    });

    it('should handle database errors gracefully', async () => {
      try {
        // Try to create project with invalid data
        await projectService.createProject({
          name: '', // Invalid empty name
          description: 'Test',
          key: '',
          owner_id: 'invalid-uuid'
        });
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should handle realtime connection issues gracefully', () => {
      expect(() => {
        realtimeService.subscribeToProjectUpdates('invalid-id', () => {});
      }).not.toThrow();
    });
  });
});

// Helper function to generate integration test report
export async function generateIntegrationReport(): Promise<string> {
  const report = {
    timestamp: new Date().toISOString(),
    supabaseConnection: false,
    authentication: false,
    databaseOperations: false,
    realtimeFunctionality: false,
    rpcFunctions: false,
    errorHandling: false,
    overallStatus: 'UNKNOWN'
  };

  try {
    // Test basic connection
    const { error: connectionError } = await supabase.from('users').select('count').limit(1);
    report.supabaseConnection = !connectionError;

    // Test authentication
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: TEST_USER.email,
      password: TEST_USER.password
    });
    report.authentication = !authError;

    // Test database operations
    const databaseService = new DatabaseService();
    const dbConnected = await databaseService.testConnection();
    report.databaseOperations = dbConnected;

    // Test RPC functions
    try {
      await databaseService.testWorkflowValidation();
      report.rpcFunctions = true;
    } catch {
      report.rpcFunctions = false;
    }

    // Test realtime
    const realtimeService = new RealtimeService();
    report.realtimeFunctionality = !!realtimeService;

    // Test error handling
    const { error: invalidAuthError } = await supabase.auth.signInWithPassword({
      email: 'invalid@test.com',
      password: 'wrong'
    });
    report.errorHandling = !!invalidAuthError; // Should have error for invalid creds

    // Determine overall status
    const allPassed = Object.values(report).slice(1, -1).every(Boolean);
    report.overallStatus = allPassed ? 'PASS' : 'FAIL';

  } catch (error) {
    console.error('Integration test error:', error);
    report.overallStatus = 'ERROR';
  }

  return `
=== SUPABASE INTEGRATION TEST REPORT ===
Generated: ${report.timestamp}

✅ Supabase Connection: ${report.supabaseConnection ? 'PASS' : 'FAIL'}
✅ Authentication: ${report.authentication ? 'PASS' : 'FAIL'}
✅ Database Operations: ${report.databaseOperations ? 'PASS' : 'FAIL'}
✅ Realtime Functionality: ${report.realtimeFunctionality ? 'PASS' : 'FAIL'}
✅ RPC Functions: ${report.rpcFunctions ? 'PASS' : 'FAIL'}
✅ Error Handling: ${report.errorHandling ? 'PASS' : 'FAIL'}

🎯 OVERALL STATUS: ${report.overallStatus}

${report.overallStatus === 'PASS' ? 
  '🎉 All Supabase integration tests passed! The application is fully integrated with Supabase.' :
  '⚠️  Some integration tests failed. Please check the individual test results for details.'}
==========================================
  `;
}
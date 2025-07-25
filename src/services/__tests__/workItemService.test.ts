import { describe, it, expect, vi, beforeEach } from 'vitest';
import { workItemService } from '../workItemService';
import { supabase } from '../../lib/supabase';

// Mock Supabase
vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
    rpc: vi.fn()
  },
  getCurrentUserId: vi.fn()
}));

const mockSupabase = supabase as any;

describe('WorkItemService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createWorkItem', () => {
    it('should create a work item successfully', async () => {
      const mockWorkItem = {
        id: 'work-item-1',
        project_id: 'project-1',
        title: 'Test Work Item',
        description: 'Test Description',
        type: 'story',
        status: 'To Do',
        priority: 'medium',
        assignee_id: null,
        reporter_id: 'user-1',
        estimate: null,
        actual_time: null,
        sprint_id: null,
        parent_id: null,
        labels: [],
        due_date: null,
        position: 1,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      };

      const { getCurrentUserId } = await import('../../lib/supabase');
      vi.mocked(getCurrentUserId).mockResolvedValue('user-1');

      // Mock position query
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue({
                data: [{ position: 0 }],
                error: null
              })
            })
          })
        })
      });

      // Mock project workflow query
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { workflow_id: 'workflow-1' },
              error: null
            })
          })
        })
      });

      // Mock default state query
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue({
                  data: [{ name: 'To Do' }],
                  error: null
                })
              })
            })
          })
        })
      });

      // Mock work item creation
      mockSupabase.from.mockReturnValueOnce({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockWorkItem,
              error: null
            })
          })
        })
      });

      // Mock dependencies query
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: [],
            error: null
          })
        })
      });

      const createData = {
        projectId: 'project-1',
        title: 'Test Work Item',
        description: 'Test Description',
        type: 'story' as const,
        priority: 'medium' as const
      };

      const result = await workItemService.createWorkItem(createData);

      expect(result.title).toBe('Test Work Item');
      expect(result.type).toBe('story');
      expect(result.priority).toBe('medium');
    });

    it('should throw error when user is not authenticated', async () => {
      const { getCurrentUserId } = await import('../../lib/supabase');
      vi.mocked(getCurrentUserId).mockResolvedValue(null);

      const createData = {
        projectId: 'project-1',
        title: 'Test Work Item',
        description: 'Test Description',
        type: 'story' as const,
        priority: 'medium' as const
      };

      await expect(workItemService.createWorkItem(createData)).rejects.toThrow(
        'User must be authenticated to create work items'
      );
    });
  });

  describe('moveWorkItem', () => {
    it('should move work item to new status', async () => {
      const mockWorkItem = {
        project_id: 'project-1',
        status: 'To Do'
      };

      const mockProject = {
        workflow_id: 'workflow-1'
      };

      // Mock work item query
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockWorkItem,
              error: null
            })
          })
        })
      });

      // Mock project query
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockProject,
              error: null
            })
          })
        })
      });

      // Mock transition validation
      mockSupabase.rpc.mockResolvedValue({
        data: true,
        error: null
      });

      // Mock update work item
      const updatedWorkItem = {
        ...mockWorkItem,
        id: 'work-item-1',
        title: 'Test Item',
        description: '',
        type: 'story',
        priority: 'medium',
        assignee_id: null,
        reporter_id: 'user-1',
        estimate: null,
        actual_time: null,
        sprint_id: null,
        parent_id: null,
        labels: [],
        due_date: null,
        position: 1,
        status: 'In Progress',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      };

      mockSupabase.from.mockReturnValueOnce({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: updatedWorkItem,
                error: null
              })
            })
          })
        })
      });

      // Mock dependencies query
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: [],
            error: null
          })
        })
      });

      const result = await workItemService.moveWorkItem('work-item-1', 'In Progress');

      expect(result.status).toBe('In Progress');
    });

    it('should throw error for invalid transition', async () => {
      const mockWorkItem = {
        project_id: 'project-1',
        status: 'To Do'
      };

      const mockProject = {
        workflow_id: 'workflow-1'
      };

      // Mock work item query
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockWorkItem,
              error: null
            })
          })
        })
      });

      // Mock project query
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockProject,
              error: null
            })
          })
        })
      });

      // Mock transition validation (invalid)
      mockSupabase.rpc.mockResolvedValue({
        data: false,
        error: null
      });

      await expect(workItemService.moveWorkItem('work-item-1', 'Done')).rejects.toThrow(
        'Invalid status transition from To Do to Done'
      );
    });
  });
});
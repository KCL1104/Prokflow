import { describe, it, expect, vi, beforeEach } from 'vitest';
import { projectService } from '../projectService';
import { supabase } from '../../lib/supabase';

// Mock Supabase
vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
    rpc: vi.fn()
  },
  getCurrentUserId: vi.fn()
}));

<<<<<<< HEAD
const mockSupabase = supabase as any;
=======
const mockSupabase = vi.mocked(supabase);
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)

describe('ProjectService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createProject', () => {
    it('should create a project successfully', async () => {
      const mockProject = {
        id: 'project-1',
        name: 'Test Project',
        description: 'Test Description',
        methodology: 'scrum',
        workflow_id: 'workflow-1',
        owner_id: 'user-1',
        settings: {},
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      };

      const mockWorkflow = { id: 'workflow-1' };

      // Mock getCurrentUserId
      const { getCurrentUserId } = await import('../../lib/supabase');
      vi.mocked(getCurrentUserId).mockResolvedValue('user-1');

      // Mock workflow query
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue({
                data: [mockWorkflow],
                error: null
              })
            })
          })
        })
      });

      // Mock project creation
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue({
                data: [mockWorkflow],
                error: null
              })
            })
          })
        })
      }).mockReturnValueOnce({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockProject,
              error: null
            })
          })
        })
      }).mockReturnValueOnce({
        insert: vi.fn().mockResolvedValue({
          error: null
        })
      }).mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: [],
              error: null
            })
          })
        })
      });

      const createData = {
        name: 'Test Project',
        description: 'Test Description',
        methodology: 'scrum' as const
      };

      const result = await projectService.createProject(createData);

      expect(result.name).toBe('Test Project');
      expect(result.methodology).toBe('scrum');
    });

    it('should throw error when user is not authenticated', async () => {
      const { getCurrentUserId } = await import('../../lib/supabase');
      vi.mocked(getCurrentUserId).mockResolvedValue(null);

      const createData = {
        name: 'Test Project',
        description: 'Test Description',
        methodology: 'scrum' as const
      };

      await expect(projectService.createProject(createData)).rejects.toThrow(
        'User must be authenticated to create a project'
      );
    });
  });

  describe('getProject', () => {
    it('should get a project successfully', async () => {
      const mockProject = {
        id: 'project-1',
        name: 'Test Project',
        description: 'Test Description',
        methodology: 'scrum',
        workflow_id: 'workflow-1',
        owner_id: 'user-1',
        settings: {},
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      };

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockProject,
              error: null
            })
          })
        })
      });

      // Mock getProjectMembers call
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockProject,
              error: null
            })
          })
        })
      }).mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: [],
              error: null
            })
          })
        })
      });

      const result = await projectService.getProject('project-1');

      expect(result.id).toBe('project-1');
      expect(result.name).toBe('Test Project');
    });

    it('should throw error when project not found', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'Not found' }
            })
          })
        })
      });

      await expect(projectService.getProject('nonexistent')).rejects.toThrow(
        'Failed to get project'
      );
    });
  });
});
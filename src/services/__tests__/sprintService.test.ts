import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sprintService } from '../sprintService';
import { supabase } from '../../lib/supabase';

// Mock Supabase
vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
    rpc: vi.fn()
  }
}));

<<<<<<< HEAD
const mockSupabase = supabase as any;
=======
const mockSupabase = vi.mocked(supabase);
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)

describe('SprintService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createSprint', () => {
    it('should create a sprint successfully', async () => {
      const mockSprint = {
        id: 'sprint-1',
        project_id: 'project-1',
        name: 'Sprint 1',
        goal: 'Complete user authentication',
        start_date: '2024-01-01T00:00:00Z',
        end_date: '2024-01-14T00:00:00Z',
        status: 'planning',
        capacity: 20,
        retrospective_notes: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      };

      // Mock sprint creation
      mockSupabase.from.mockReturnValueOnce({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockSprint,
              error: null
            })
          })
        })
      });

      // Mock work items query
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
        name: 'Sprint 1',
        goal: 'Complete user authentication',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-14'),
        capacity: 20
      };

      const result = await sprintService.createSprint(createData);

      expect(result.name).toBe('Sprint 1');
      expect(result.goal).toBe('Complete user authentication');
      expect(result.status).toBe('planning');
    });
  });

  describe('startSprint', () => {
    it('should start a sprint successfully', async () => {
      const mockSprint = {
        project_id: 'project-1'
      };

      // Mock sprint query
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockSprint,
              error: null
            })
          })
        })
      });

      // Mock active sprint check (no active sprint)
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { code: 'PGRST116' } // Not found
              })
            })
          })
        })
      });

      // Mock sprint update
      const updatedSprint = {
        id: 'sprint-1',
        project_id: 'project-1',
        name: 'Sprint 1',
        goal: 'Complete user authentication',
        start_date: '2024-01-01T00:00:00Z',
        end_date: '2024-01-14T00:00:00Z',
        status: 'active',
        capacity: 20,
        retrospective_notes: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      };

      mockSupabase.from.mockReturnValueOnce({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: updatedSprint,
                error: null
              })
            })
          })
        })
      });

      // Mock work items query
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: [],
            error: null
          })
        })
      });

      const result = await sprintService.startSprint('sprint-1');

      expect(result.status).toBe('active');
    });

    it('should throw error when another sprint is already active', async () => {
      const mockSprint = {
        project_id: 'project-1'
      };

      const mockActiveSprint = {
        id: 'active-sprint',
        status: 'active'
      };

      // Mock sprint query
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockSprint,
              error: null
            })
          })
        })
      });

      // Mock active sprint check (found active sprint)
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockActiveSprint,
                error: null
              })
            })
          })
        })
      });

      // Mock work items query for active sprint
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: [],
            error: null
          })
        })
      });

      await expect(sprintService.startSprint('sprint-1')).rejects.toThrow(
        'Cannot start sprint: another sprint is already active'
      );
    });
  });

  describe('completeSprint', () => {
    it('should complete a sprint and move incomplete items to backlog', async () => {
      // Mock moving incomplete items
      mockSupabase.from.mockReturnValueOnce({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            neq: vi.fn().mockResolvedValue({
              error: null
            })
          })
        })
      });

      // Mock sprint update
      const completedSprint = {
        id: 'sprint-1',
        project_id: 'project-1',
        name: 'Sprint 1',
        goal: 'Complete user authentication',
        start_date: '2024-01-01T00:00:00Z',
        end_date: '2024-01-14T00:00:00Z',
        status: 'completed',
        capacity: 20,
        retrospective_notes: 'Great sprint!',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-14T00:00:00Z'
      };

      mockSupabase.from.mockReturnValueOnce({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: completedSprint,
                error: null
              })
            })
          })
        })
      });

      // Mock work items query
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: [],
            error: null
          })
        })
      });

      const result = await sprintService.completeSprint('sprint-1', 'Great sprint!');

      expect(result.status).toBe('completed');
      expect(result.retrospectiveNotes).toBe('Great sprint!');
    });
  });

  describe('calculateSprintCapacity', () => {
    it('should calculate sprint capacity based on velocity', async () => {
      // Mock velocity calculation
      mockSupabase.rpc.mockResolvedValue({
        data: 25,
        error: null
      });

      const result = await sprintService.calculateSprintCapacity('project-1');

      expect(result).toBe(25);
    });

    it('should return default capacity when velocity calculation fails', async () => {
      // Mock velocity calculation failure
      mockSupabase.rpc.mockResolvedValue({
        data: null,
        error: { message: 'Function not found' }
      });

      const result = await sprintService.calculateSprintCapacity('project-1');

      expect(result).toBe(20); // Default capacity
    });
  });
});
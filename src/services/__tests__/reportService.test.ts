import { describe, it, expect, vi, beforeEach } from 'vitest';
import { reportService } from '../reportService';
import { supabase } from '../../lib/supabase';

// Type for mocking Supabase query builders
type MockQueryBuilder = {
  select: ReturnType<typeof vi.fn>;
  eq?: ReturnType<typeof vi.fn>;
  order?: ReturnType<typeof vi.fn>;
  limit?: ReturnType<typeof vi.fn>;
  gte?: ReturnType<typeof vi.fn>;
};

// Mock Supabase
vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn()
    }))
  }
}));

describe('reportService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    reportService.clearCache();
  });

  describe('getProjectMetrics', () => {
    it('should fetch project metrics successfully', async () => {
      const mockWorkItems = [
        { id: '1', status: 'done', created_at: '2024-01-01', updated_at: '2024-01-05', estimate: 5 },
        { id: '2', status: 'done', created_at: '2024-01-02', updated_at: '2024-01-06', estimate: 3 },
        { id: '3', status: 'in_progress', created_at: '2024-01-03', updated_at: '2024-01-07', estimate: 8 }
      ];



      // Mock the database queries
      const mockQueryBuilder = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: mockWorkItems, error: null })
        })
      };
      vi.mocked(supabase.from).mockReturnValue(mockQueryBuilder as MockQueryBuilder);

      const result = await reportService.getProjectMetrics('project-1');

      expect(result.totalWorkItems).toBe(3);
      expect(result.completedWorkItems).toBe(2);
      expect(result.averageCycleTime).toBeGreaterThan(0);
      expect(result.velocity).toHaveLength(2);
      expect(result.burndownData).toHaveLength(1);
    });

    it('should handle errors gracefully', async () => {
      // Clear cache first
      reportService.clearCache();
      
      const mockQueryBuilder = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Database error' }
          })
        })
      };
      vi.mocked(supabase.from).mockReturnValue(mockQueryBuilder as MockQueryBuilder);

      await expect(reportService.getProjectMetrics('project-1')).rejects.toThrow(
        'Failed to get work items: Database error'
      );
    });
  });

  describe('getVelocityTrends', () => {
    it('should fetch velocity trends successfully', async () => {
      const mockSprints = [
        { id: 'sprint-1', name: 'Sprint 1', status: 'completed' },
        { id: 'sprint-2', name: 'Sprint 2', status: 'completed' }
      ];

      const mockWorkItems = [
        { estimate: 5, status: 'done' },
        { estimate: 3, status: 'done' },
        { estimate: 2, status: 'in_progress' }
      ];

      const mockQueryBuilder = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue({ data: mockSprints, error: null })
            })
          })
        })
      };
      
      // Mock sprints query first
      vi.mocked(supabase.from).mockReturnValueOnce(mockQueryBuilder as MockQueryBuilder);
      
      // Mock work items queries for each sprint
      const mockWorkItemsQueryBuilder = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: mockWorkItems, error: null })
        })
      };
      vi.mocked(supabase.from).mockReturnValue(mockWorkItemsQueryBuilder as MockQueryBuilder);

      const result = await reportService.getVelocityTrends('project-1', 5);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        sprintName: 'Sprint 1',
        completedPoints: 8, // 5 + 3 from done items
        committedPoints: 10, // 5 + 3 + 2 total
        sprintNumber: 1
      });
    });

    it('should return empty array on error', async () => {
      // Clear cache and mocks
      reportService.clearCache();
      vi.clearAllMocks();
      
      const mockQueryBuilder = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Database error' }
          })
        })
      };
      vi.mocked(supabase.from).mockReturnValue(mockQueryBuilder as MockQueryBuilder);

      const result = await reportService.getVelocityTrends('project-1');

      expect(result).toEqual([]);
    });
  });

  describe('getTeamMetrics', () => {
    it('should fetch team metrics successfully', async () => {
      const mockMembers = [
        { id: 'member-1', user_id: 'user-1', role: 'developer' },
        { id: 'member-2', user_id: 'user-2', role: 'designer' }
      ];

      const mockQueryBuilder = {
         select: vi.fn().mockReturnValue({
           eq: vi.fn().mockResolvedValue({ data: mockMembers, error: null })
         })
       };
       vi.mocked(supabase.from).mockReturnValue(mockQueryBuilder as MockQueryBuilder);

      const result = await reportService.getTeamMetrics('project-1');

      expect(result).toEqual([
        { memberName: 'user-1', completedTasks: 0, totalTasks: 0, completionRate: 0 },
        { memberName: 'user-2', completedTasks: 0, totalTasks: 0, completionRate: 0 }
      ]);

      expect(supabase.from).toHaveBeenCalledWith('project_members');
    });
  });

  describe('getCycleTimeAnalytics', () => {
    it('should fetch cycle time analytics successfully', async () => {
      const mockWorkItems = [
        { 
          id: 'item-1', 
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-05T00:00:00Z',
          status: 'done'
        },
        { 
          id: 'item-2', 
          created_at: '2024-01-02T00:00:00Z',
          updated_at: '2024-01-08T00:00:00Z',
          status: 'done'
        }
      ];

      const mockQueryBuilder = {
         select: vi.fn().mockReturnValue({
           eq: vi.fn().mockReturnValue({
             gte: vi.fn().mockResolvedValue({ data: mockWorkItems, error: null })
           })
         })
       };
       vi.mocked(supabase.from).mockReturnValue(mockQueryBuilder as MockQueryBuilder);

       const dateRange = {
         start: new Date('2024-01-01'),
         end: new Date('2024-01-31')
       };
       const result = await reportService.getCycleTimeAnalytics('project-1', dateRange);

      expect(result).toEqual({
        averageCycleTime: expect.any(Number),
        medianCycleTime: expect.any(Number),
        percentile95: expect.any(Number),
        trendData: expect.any(Array)
      });

      expect(supabase.from).toHaveBeenCalledWith('work_items');
    });

    it('should return default values on error', async () => {
      const mockQueryBuilder = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            gte: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'Database error' }
            })
          })
        })
      };
      vi.mocked(supabase.from).mockReturnValue(mockQueryBuilder as MockQueryBuilder);

      const result = await reportService.getCycleTimeAnalytics('project-1');

      expect(result).toEqual({
        averageCycleTime: 0,
        averageLeadTime: 0,
        throughput: 0
      });
    });
  });

  describe('getCompletionRateAnalytics', () => {
    it('should fetch completion rate analytics successfully', async () => {
      const mockData = [{
        total_items: 100,
        completed_items: 75,
        completion_rate: 75.0,
        completion_trend: [
          { date: '2024-01-01', completed: 10, total: 100 },
          { date: '2024-01-02', completed: 15, total: 100 }
        ]
      }];

      const mockQueryBuilder = {
         select: vi.fn().mockReturnValue({
           eq: vi.fn().mockResolvedValue({ data: mockData, error: null })
         })
       };
       vi.mocked(supabase.from).mockReturnValue(mockQueryBuilder as MockQueryBuilder);

      const result = await reportService.getCompletionRateAnalytics('project-1');

      expect(result).toEqual({
        totalItems: 100,
        completedItems: 75,
        completionRate: 75.0,
        completionTrend: [
          { date: '2024-01-01', completed: 10, total: 100 },
          { date: '2024-01-02', completed: 15, total: 100 }
        ]
      });

      expect(supabase.rpc).toHaveBeenCalledWith('get_completion_rate_analytics', {
        p_project_id: 'project-1'
      });
    });
  });

  describe('exportReportData', () => {
    it('should export project metrics as JSON', async () => {
      const mockMetrics = {
        totalWorkItems: 50,
        completedWorkItems: 30,
        averageCycleTime: 5.5,
        averageLeadTime: 7.2,
        throughput: 2.1,
        velocity: [],
        burndownData: []
      };

      // Mock the getProjectMetrics method
      vi.spyOn(reportService, 'getProjectMetrics').mockResolvedValue(mockMetrics);

      const result = await reportService.exportReportData('project-metrics', 'project-1', 'json');

      expect(result).toBe(JSON.stringify(mockMetrics, null, 2));
    });

    it('should export velocity trends as CSV', async () => {
      const mockVelocity = [
        { sprintName: 'Sprint 1', completedPoints: 25, committedPoints: 30, sprintNumber: 1 },
        { sprintName: 'Sprint 2', completedPoints: 28, committedPoints: 30, sprintNumber: 2 }
      ];

      vi.spyOn(reportService, 'getVelocityTrends').mockResolvedValue(mockVelocity);

      const result = await reportService.exportReportData('velocity-trends', 'project-1', 'csv');

      const expectedCSV = [
        'sprintName,completedPoints,committedPoints,sprintNumber',
        'Sprint 1,25,30,1',
        'Sprint 2,28,30,2'
      ].join('\n');

      expect(result).toBe(expectedCSV);
    });

    it('should export project metrics as PDF', async () => {
      const mockMetrics = {
        totalWorkItems: 50,
        completedWorkItems: 30,
        averageCycleTime: 5.5,
        averageLeadTime: 7.2,
        throughput: 2.1,
        velocity: [],
        burndownData: []
      };

      vi.spyOn(reportService, 'getProjectMetrics').mockResolvedValue(mockMetrics);

      const result = await reportService.exportReportData('project-metrics', 'project-1', 'pdf');

      expect(result).toBeInstanceOf(Blob);
      expect((result as Blob).type).toBe('application/pdf');
    });

    it('should throw error for unknown report type', async () => {
      await expect(
        reportService.exportReportData('unknown-type', 'project-1', 'json')
      ).rejects.toThrow('Unknown report type: unknown-type');
    });
  });

  describe('convertToCSV', () => {
    it('should convert array data to CSV', () => {
      const data = [
        { name: 'John', age: 30, city: 'New York' },
        { name: 'Jane', age: 25, city: 'Boston' }
      ];

      const result = reportService.convertToCSV(data);

      const expected = [
        'name,age,city',
        'John,30,New York',
        'Jane,25,Boston'
      ].join('\n');

      expect(result).toBe(expected);
    });

    it('should convert object data to CSV', () => {
      const data = { name: 'John', age: 30, city: 'New York' };

      const result = reportService.convertToCSV(data);

      const expected = [
        'name,age,city',
        'John,30,New York'
      ].join('\n');

      expect(result).toBe(expected);
    });

    it('should return empty string for empty data', () => {
      expect(reportService.convertToCSV([])).toBe('');
      expect(reportService.convertToCSV(null)).toBe('');
      expect(reportService.convertToCSV(undefined)).toBe('');
    });
  });

  describe('clearCache', () => {
    it('should clear cache for specific project', () => {
      // This is a basic test since we can't easily test the internal cache
      expect(() => reportService.clearCache('project-1')).not.toThrow();
    });

    it('should clear all cache when no project specified', () => {
      expect(() => reportService.clearCache()).not.toThrow();
    });
  });

  describe('PDF generation', () => {
    it('should generate HTML report content', () => {
      const data = { totalItems: 100, completedItems: 75 };
      const html = reportService.generateHTMLReport(data, 'test-report');
      
      expect(html).toContain('<html>');
      expect(html).toContain('TEST-REPORT Report');
      expect(html).toContain('Total Items');
      expect(html).toContain('100');
    });

    it('should handle array data in HTML report', () => {
      const data = [
        { name: 'Item 1', value: 10 },
        { name: 'Item 2', value: 20 }
      ];
      const html = reportService.generateHTMLReport(data, 'array-report');
      
      expect(html).toContain('<table>');
      expect(html).toContain('Item 1');
      expect(html).toContain('Item 2');
    });
  });
});
import { supabase } from '../lib/supabase';
import type { 
  ProjectMetrics, 
  VelocityData, 
  BurndownData, 
  TeamMetrics
} from '../types';

// Simple in-memory cache for report data
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class ReportCache {
  private cache = new Map<string, CacheEntry<unknown>>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes

  set<T>(key: string, data: T, ttl?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  clear(): void {
    this.cache.clear();
  }

  clearProject(projectId: string): void {
    const keysToDelete = Array.from(this.cache.keys()).filter(key => 
      key.includes(projectId)
    );
    keysToDelete.forEach(key => this.cache.delete(key));
  }
}

const reportCache = new ReportCache();

export interface ReportService {
  getProjectMetrics(projectId: string): Promise<ProjectMetrics>;
  getVelocityTrends(projectId: string, sprintCount?: number): Promise<VelocityData[]>;
  getTeamMetrics(projectId: string): Promise<TeamMetrics[]>;
  getCycleTimeAnalytics(projectId: string, dateRange?: { start: Date; end: Date }): Promise<{
    averageCycleTime: number;
    averageLeadTime: number;
    throughput: number;
  }>;
  getCompletionRateAnalytics(projectId: string): Promise<{
    totalItems: number;
    completedItems: number;
    completionRate: number;
    completionTrend: { date: string; completed: number; total: number }[];
  }>;
  exportReportData(reportType: string, projectId: string, format: 'csv' | 'json' | 'pdf'): Promise<string | Blob>;
  convertToCSV(data: unknown): string;
  convertToPDF(data: unknown, reportType: string): Promise<Blob>;
  generateHTMLReport(data: unknown, reportType: string): string;
  createSimplePDF(htmlContent: string, reportType: string): string;
  clearCache(projectId?: string): void;
}

export const reportService: ReportService = {
  async getProjectMetrics(projectId: string): Promise<ProjectMetrics> {
    const cacheKey = `project-metrics:${projectId}`;
    const cached = reportCache.get<ProjectMetrics>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      // Get work items for the project
      const { data: workItems, error: workItemsError } = await supabase
        .from('work_items')
        .select('id, status, created_at, updated_at, estimate')
        .eq('project_id', projectId);

      if (workItemsError?.message) {
        throw new Error(`Failed to get work items: ${workItemsError.message}`);
      }

      // Calculate metrics manually
      const totalWorkItems = workItems?.length || 0;
      const completedWorkItems = workItems?.filter(item => item.status === 'done').length || 0;
      
      // Calculate average cycle time
      let totalCycleTime = 0;
      const completedItems = workItems?.filter(item => item.status === 'done') || [];
      completedItems.forEach(item => {
        if (item.created_at && item.updated_at) {
          const created = new Date(item.created_at);
          const updated = new Date(item.updated_at);
          totalCycleTime += (updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
        }
      });
      const averageCycleTime = completedItems.length > 0 ? totalCycleTime / completedItems.length : 0;
      
      // Calculate throughput (completed items per week)
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const recentCompletedItems = workItems?.filter(item => 
        item.status === 'done' && 
        item.updated_at && 
        new Date(item.updated_at) >= oneWeekAgo
      ).length || 0;
      
      // Get velocity data
      const velocityData = await this.getVelocityTrends(projectId);

      // Get burndown data for active sprint
      const { data: activeSprint } = await supabase
        .from('sprints')
        .select('id, start_date, end_date')
        .eq('project_id', projectId)
        .eq('status', 'active')
        .single();

      let burndownData: BurndownData[] = [];
      if (activeSprint) {
        // Calculate burndown manually
        const { data: sprintWorkItems } = await supabase
          .from('work_items')
          .select('estimate, status, updated_at')
          .eq('sprint_id', activeSprint.id);
          
        const totalPoints = sprintWorkItems?.reduce((sum, item) => sum + (item.estimate || 0), 0) || 0;
        const completedPoints = sprintWorkItems?.filter(item => item.status === 'done')
          .reduce((sum, item) => sum + (item.estimate || 0), 0) || 0;
        
        // Simple burndown for current date
        burndownData = [{
          date: new Date().toISOString().split('T')[0],
          remainingPoints: totalPoints - completedPoints,
          idealRemaining: totalPoints * 0.5 // Simple ideal line
        }];
      }

      const result = {
        totalWorkItems,
        completedWorkItems,
        averageCycleTime,
        averageLeadTime: averageCycleTime, // Using cycle time as lead time approximation
        throughput: recentCompletedItems,
        velocity: velocityData,
        burndownData
      };

      // Cache the result
      reportCache.set(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error getting project metrics:', error);
      throw error;
    }
  },

  async getVelocityTrends(projectId: string, sprintCount = 10): Promise<VelocityData[]> {
    const cacheKey = `velocity-trends:${projectId}:${sprintCount}`;
    const cached = reportCache.get<VelocityData[]>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      // Get sprints for the project
      const { data: sprints, error: sprintError } = await supabase
        .from('sprints')
        .select('id, name, status')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
        .limit(sprintCount);

      if (sprintError?.message) {
        throw new Error(`Failed to get sprints: ${sprintError.message}`);
      }

      const result: VelocityData[] = [];
      
      for (let i = 0; i < (sprints?.length || 0); i++) {
        const sprint = sprints![i];
        
        // Get work items for this sprint
        const { data: workItems } = await supabase
          .from('work_items')
          .select('estimate, status')
          .eq('sprint_id', sprint.id);

        const totalEstimate = workItems?.reduce((sum, item) => sum + (item.estimate || 0), 0) || 0;
        const completedEstimate = workItems?.filter(item => item.status === 'done')
          .reduce((sum, item) => sum + (item.estimate || 0), 0) || 0;

        result.push({
          sprintName: sprint.name,
          completedPoints: completedEstimate,
          committedPoints: totalEstimate,
          sprintNumber: i + 1
        });
      }

      // Cache the result
      reportCache.set(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error getting velocity trends:', error);
      return [];
    }
  },

  async getTeamMetrics(projectId: string): Promise<TeamMetrics[]> {
    try {
      // Get project members
      const { data: members, error: memberError } = await supabase
        .from('project_members')
        .select('user_id, users(id, full_name)')
        .eq('project_id', projectId);

      if (memberError?.message) {
        throw new Error(`Failed to get team members: ${memberError.message}`);
      }

      const result: TeamMetrics[] = [];
      
      for (const member of members || []) {
        // Get work items assigned to this member
        const { data: workItems } = await supabase
          .from('work_items')
          .select('status, created_at, updated_at, estimate')
          .eq('project_id', projectId)
          .eq('assignee_id', member.user_id);

        const completedItems = workItems?.filter(item => item.status === 'done').length || 0;
        const totalItems = workItems?.length || 0;
        
        // Calculate average cycle time
        let totalCycleTime = 0;
        const completedWorkItems = workItems?.filter(item => item.status === 'done') || [];
        completedWorkItems.forEach(item => {
          if (item.created_at && item.updated_at) {
            const created = new Date(item.created_at);
            const updated = new Date(item.updated_at);
            totalCycleTime += (updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
          }
        });
        
        const averageCycleTime = completedWorkItems.length > 0 ? totalCycleTime / completedWorkItems.length : 0;
        const workload = workItems?.reduce((sum, item) => sum + (item.estimate || 0), 0) || 0;
        const utilization = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

        result.push({
          memberId: member.user_id,
          memberName: (member.users as { full_name?: string })?.full_name || 'Unknown',
          completedItems,
          averageCycleTime,
          workload,
          utilization
        });
      }

      return result;
    } catch (error) {
      console.error('Error getting team metrics:', error);
      return [];
    }
  },

  async getCycleTimeAnalytics(
    projectId: string,
    dateRange?: { start: Date; end: Date }
  ): Promise<{
    averageCycleTime: number;
    averageLeadTime: number;
    throughput: number;
  }> {
    try {
      // Calculate cycle time analytics manually
      let query = supabase
        .from('work_items')
        .select('created_at, updated_at, status')
        .eq('project_id', projectId);

      if (dateRange?.start) {
        query = query.gte('created_at', dateRange.start.toISOString());
      }
      if (dateRange?.end) {
        query = query.lte('created_at', dateRange.end.toISOString());
      }

      const { data: workItems, error: dbError } = await query;

      if (dbError?.message) {
        throw new Error(`Failed to get cycle time analytics: ${dbError.message}`);
      }

      const completedItems = workItems?.filter(item => item.status === 'done') || [];
      
      // Calculate average cycle time (simplified)
      let totalCycleTime = 0;
      completedItems.forEach(item => {
        if (item.created_at && item.updated_at) {
          const created = new Date(item.created_at);
          const updated = new Date(item.updated_at);
          totalCycleTime += (updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24); // days
        }
      });

      const averageCycleTime = completedItems.length > 0 ? totalCycleTime / completedItems.length : 0;
      const averageLeadTime = averageCycleTime; // Simplified - same as cycle time
      const throughput = completedItems.length;

      return {
        averageCycleTime,
        averageLeadTime,
        throughput
      };
    } catch (error) {
      console.error('Error getting cycle time analytics:', error);
      return {
        averageCycleTime: 0,
        averageLeadTime: 0,
        throughput: 0
      };
    }
  },

  async getCompletionRateAnalytics(projectId: string): Promise<{
    totalItems: number;
    completedItems: number;
    completionRate: number;
    completionTrend: { date: string; completed: number; total: number }[];
  }> {
    try {
      // Since the RPC function doesn't exist, let's calculate completion rate manually
      const { data: workItems, error: dbError } = await supabase
        .from('work_items')
        .select('status, created_at')
        .eq('project_id', projectId);

      if (dbError?.message) {
        throw new Error(`Failed to get completion rate analytics: ${dbError.message}`);
      }

      const totalItems = workItems?.length || 0;
      const completedItems = workItems?.filter(item => item.status === 'done').length || 0;
      const completionRate = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

      // Generate simple trend data (last 7 days)
      const completionTrend = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        completionTrend.push({
          date: date.toISOString().split('T')[0],
          completed: Math.floor(completedItems * (1 - i * 0.1)),
          total: totalItems
        });
      }

      return {
        totalItems,
        completedItems,
        completionRate,
        completionTrend
      };
    } catch (error) {
      console.error('Error getting completion rate analytics:', error);
      return {
        totalItems: 0,
        completedItems: 0,
        completionRate: 0,
        completionTrend: []
      };
    }
  },

  async exportReportData(
    reportType: string, 
    projectId: string, 
    format: 'csv' | 'json' | 'pdf'
  ): Promise<string | Blob> {
    try {
      let data: unknown;

      switch (reportType) {
        case 'project-metrics':
          data = await this.getProjectMetrics(projectId);
          break;
        case 'velocity-trends':
          data = await this.getVelocityTrends(projectId);
          break;
        case 'team-metrics':
          data = await this.getTeamMetrics(projectId);
          break;
        case 'cycle-time':
          data = await this.getCycleTimeAnalytics(projectId);
          break;
        case 'completion-rate':
          data = await this.getCompletionRateAnalytics(projectId);
          break;
        default:
          throw new Error(`Unknown report type: ${reportType}`);
      }

      if (format === 'csv') {
        return this.convertToCSV(data);
      } else if (format === 'pdf') {
        return await this.convertToPDF(data, reportType);
      } else {
        return JSON.stringify(data, null, 2);
      }
    } catch (error) {
      console.error('Error exporting report data:', error);
      throw error;
    }
  },

  // Helper method to convert data to PDF format
  async convertToPDF(data: unknown, reportType: string): Promise<Blob> {
    // Create a simple HTML report structure
    const htmlContent = this.generateHTMLReport(data, reportType);
    
    // For now, we'll create a simple text-based PDF using a basic approach
    // In a production environment, you'd want to use a proper PDF library like jsPDF or Puppeteer
    const pdfContent = this.createSimplePDF(htmlContent, reportType);
    
    return new Blob([pdfContent], { type: 'application/pdf' });
  },

  // Generate HTML content for PDF reports
  generateHTMLReport(data: unknown, reportType: string): string {
    const timestamp = new Date().toLocaleString();
    
    let content = `
      <html>
        <head>
          <title>${reportType.replace('-', ' ').toUpperCase()} Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px; }
            h2 { color: #666; margin-top: 30px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f8f9fa; font-weight: bold; }
            .metric { background-color: #e9ecef; padding: 10px; margin: 10px 0; border-radius: 5px; }
            .footer { margin-top: 40px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <h1>${reportType.replace('-', ' ').toUpperCase()} Report</h1>
          <p><strong>Generated:</strong> ${timestamp}</p>
    `;

    if (Array.isArray(data)) {
      // Handle array data (like velocity trends, team metrics)
      if (data.length > 0) {
        content += '<h2>Data Summary</h2>';
        content += '<table>';
        content += '<tr>';
        Object.keys(data[0]).forEach(key => {
          content += `<th>${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</th>`;
        });
        content += '</tr>';
        
        data.forEach(item => {
          content += '<tr>';
          Object.values(item).forEach(value => {
            content += `<td>${value}</td>`;
          });
          content += '</tr>';
        });
        content += '</table>';
      }
    } else if (typeof data === 'object' && data !== null) {
      // Handle object data (like project metrics)
      content += '<h2>Metrics Overview</h2>';
      Object.entries(data).forEach(([key, value]) => {
        if (typeof value === 'object' && value !== null) {
          // Skip complex objects for now
          return;
        }
        content += `<div class="metric"><strong>${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</strong> ${value}</div>`;
      });
    }

    content += `
          <div class="footer">
            <p>This report was generated automatically by the Project Management Platform.</p>
          </div>
        </body>
      </html>
    `;

    return content;
  },

  // Create a simple PDF-like content (placeholder for actual PDF generation)
  createSimplePDF(htmlContent: string, reportType: string): string {
    // This is a simplified approach. In production, you'd use a proper PDF library
    // For now, we'll return the HTML content as a text representation
    const textContent = htmlContent
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
    
    return `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length ${textContent.length}
>>
stream
BT
/F1 12 Tf
50 750 Td
(${reportType.replace('-', ' ').toUpperCase()} REPORT) Tj
0 -20 Td
(Generated: ${new Date().toLocaleString()}) Tj
0 -40 Td
(${textContent.substring(0, 500)}...) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000206 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
${300 + textContent.length}
%%EOF`;
  },

  // Helper method to convert data to CSV format
  convertToCSV(data: unknown): string {
    if (!data || (Array.isArray(data) && data.length === 0)) {
      return '';
    }

    const headers: string[] = [];
    const rows: string[][] = [];

    if (Array.isArray(data)) {
      // Handle array data (like velocity trends, team metrics)
      if (data.length > 0) {
        headers.push(...Object.keys(data[0]));
        data.forEach(item => {
          rows.push(Object.values(item).map(value => String(value)));
        });
      }
    } else {
      // Handle object data (like project metrics)
      headers.push(...Object.keys(data));
      rows.push(Object.values(data).map(value => String(value)));
    }

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    return csvContent;
  },

  clearCache(projectId?: string): void {
    if (projectId) {
      reportCache.clearProject(projectId);
    } else {
      reportCache.clear();
    }
  }
};
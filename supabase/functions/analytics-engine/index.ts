// Setup type definitions for built-in Supabase Runtime APIs
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'

// Supabase Edge Function for advanced analytics and metrics
// This function handles complex analytics calculations and data aggregations

import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AnalyticsRequest {
  action: 'burndown-chart' | 'velocity-analysis' | 'cycle-time' | 'team-performance' | 'project-health' | 'sprint-metrics' | 'workload-distribution' | 'completion-trends';
  projectId?: string;
  sprintId?: string;
  userId?: string;
  teamId?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  options?: {
    sprintCount?: number;
    includeSubtasks?: boolean;
    groupBy?: 'day' | 'week' | 'month';
    workItemTypes?: string[];
  };
}

interface BurndownData {
  date: string;
  remainingPoints: number;
  idealRemaining: number;
  completedPoints: number;
  totalPoints: number;
}

interface VelocityData {
  sprintName: string;
  sprintNumber: number;
  completedPoints: number;
  committedPoints: number;
  completionRate: number;
  startDate: string;
  endDate: string;
}

interface CycleTimeData {
  workItemId: string;
  title: string;
  type: string;
  cycleTime: number; // in days
  leadTime: number; // in days
  createdAt: string;
  completedAt: string;
  stages: {
    stage: string;
    duration: number;
    startTime: string;
    endTime: string;
  }[];
}

interface TeamPerformanceData {
  userId: string;
  userName: string;
  completedItems: number;
  totalPoints: number;
  averageCycleTime: number;
  onTimeDelivery: number;
  qualityScore: number;
}

interface ProjectHealthData {
  overallScore: number;
  velocity: {
    current: number;
    trend: 'up' | 'down' | 'stable';
    consistency: number;
  };
  quality: {
    bugRate: number;
    reworkRate: number;
    testCoverage: number;
  };
  delivery: {
    onTimeRate: number;
    scopeCreep: number;
    burndownAccuracy: number;
  };
  team: {
    utilization: number;
    satisfaction: number;
    turnover: number;
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Parse request body
    const { action, projectId, sprintId, userId: _userId, teamId: _teamId, dateRange, options }: AnalyticsRequest = await req.json()

    if (!action) {
      return new Response(
        JSON.stringify({ error: 'Missing required action parameter' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    let result: unknown;
    
    switch (action) {
      case 'burndown-chart':
        if (!sprintId) {
          return new Response(
            JSON.stringify({ error: 'Missing sprintId for burndown-chart action' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        result = await generateBurndownChart(supabaseClient, sprintId);
        break;
        
      case 'velocity-analysis':
        if (!projectId) {
          return new Response(
            JSON.stringify({ error: 'Missing projectId for velocity-analysis action' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        result = await analyzeVelocity(supabaseClient, projectId, options?.sprintCount);
        break;
        
      case 'cycle-time':
        if (!projectId) {
          return new Response(
            JSON.stringify({ error: 'Missing projectId for cycle-time action' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        result = await analyzeCycleTime(supabaseClient, projectId, dateRange, options);
        break;
        
      case 'team-performance':
        if (!projectId) {
          return new Response(
            JSON.stringify({ error: 'Missing projectId for team-performance action' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        result = await analyzeTeamPerformance(supabaseClient, projectId, dateRange);
        break;
        
      case 'project-health':
        if (!projectId) {
          return new Response(
            JSON.stringify({ error: 'Missing projectId for project-health action' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        result = await analyzeProjectHealth(supabaseClient, projectId);
        break;
        
      case 'sprint-metrics':
        if (!sprintId) {
          return new Response(
            JSON.stringify({ error: 'Missing sprintId for sprint-metrics action' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        result = await getSprintMetrics(supabaseClient, sprintId);
        break;
        
      case 'workload-distribution':
        if (!projectId) {
          return new Response(
            JSON.stringify({ error: 'Missing projectId for workload-distribution action' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        result = await analyzeWorkloadDistribution(supabaseClient, projectId, dateRange);
        break;
        
      case 'completion-trends':
        if (!projectId) {
          return new Response(
            JSON.stringify({ error: 'Missing projectId for completion-trends action' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        result = await analyzeCompletionTrends(supabaseClient, projectId, options?.groupBy);
        break;
        
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
    }

    return new Response(
      JSON.stringify({ data: result, success: true }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json'
        } 
      }
    );

  } catch (error) {
    console.error('Analytics engine error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

// Helper functions for analytics operations
async function generateBurndownChart(supabase: ReturnType<typeof createClient>, sprintId: string): Promise<BurndownData[]> {
  const { data, error } = await supabase.rpc('generate_burndown_data', {
    p_sprint_id: sprintId
  });
  
  if (error) throw error;
  return data || [];
}

async function analyzeVelocity(supabase: ReturnType<typeof createClient>, projectId: string, sprintCount = 10): Promise<{
  velocityData: VelocityData[];
  averageVelocity: number;
  velocityTrend: 'up' | 'down' | 'stable';
  consistency: number;
}> {
  const { data, error } = await supabase.rpc('analyze_velocity', {
    p_project_id: projectId,
    p_sprint_count: sprintCount
  });
  
  if (error) throw error;
  
  const velocityData = data?.velocity_data || [];
  const averageVelocity = data?.average_velocity || 0;
  const velocityTrend = data?.velocity_trend || 'stable';
  const consistency = data?.consistency || 0;
  
  return {
    velocityData,
    averageVelocity,
    velocityTrend,
    consistency
  };
}

async function analyzeCycleTime(supabase: ReturnType<typeof createClient>, projectId: string, dateRange?: { start: string; end: string }, options?: { workItemTypes?: string[] }): Promise<{
  cycleTimeData: CycleTimeData[];
  averageCycleTime: number;
  averageLeadTime: number;
  distribution: { range: string; count: number }[];
}> {
  const { data, error } = await supabase.rpc('analyze_cycle_time', {
    p_project_id: projectId,
    p_start_date: dateRange?.start,
    p_end_date: dateRange?.end,
    p_work_item_types: options?.workItemTypes
  });
  
  if (error) throw error;
  
  return {
    cycleTimeData: data?.cycle_time_data || [],
    averageCycleTime: data?.average_cycle_time || 0,
    averageLeadTime: data?.average_lead_time || 0,
    distribution: data?.distribution || []
  };
}

async function analyzeTeamPerformance(supabase: ReturnType<typeof createClient>, projectId: string, dateRange?: { start: string; end: string }): Promise<{
  teamMembers: TeamPerformanceData[];
  teamAverages: {
    completedItems: number;
    totalPoints: number;
    averageCycleTime: number;
    onTimeDelivery: number;
    qualityScore: number;
  };
}> {
  const { data, error } = await supabase.rpc('analyze_team_performance', {
    p_project_id: projectId,
    p_start_date: dateRange?.start,
    p_end_date: dateRange?.end
  });
  
  if (error) throw error;
  
  return {
    teamMembers: data?.team_members || [],
    teamAverages: data?.team_averages || {
      completedItems: 0,
      totalPoints: 0,
      averageCycleTime: 0,
      onTimeDelivery: 0,
      qualityScore: 0
    }
  };
}

async function analyzeProjectHealth(supabase: ReturnType<typeof createClient>, projectId: string): Promise<ProjectHealthData> {
  const { data, error } = await supabase.rpc('analyze_project_health', {
    p_project_id: projectId
  });
  
  if (error) throw error;
  
  return data?.[0] || {
    overallScore: 0,
    velocity: { current: 0, trend: 'stable', consistency: 0 },
    quality: { bugRate: 0, reworkRate: 0, testCoverage: 0 },
    delivery: { onTimeRate: 0, scopeCreep: 0, burndownAccuracy: 0 },
    team: { utilization: 0, satisfaction: 0, turnover: 0 }
  };
}

async function getSprintMetrics(supabase: ReturnType<typeof createClient>, sprintId: string): Promise<{
  sprintInfo: {
    name: string;
    goal: string;
    startDate: string;
    endDate: string;
    status: string;
  };
  metrics: {
    totalItems: number;
    completedItems: number;
    totalPoints: number;
    completedPoints: number;
    completionRate: number;
    velocityAchieved: number;
    scopeChange: number;
    averageCycleTime: number;
  };
  dailyProgress: {
    date: string;
    completedItems: number;
    remainingItems: number;
    completedPoints: number;
    remainingPoints: number;
  }[];
}> {
  const { data, error } = await supabase.rpc('get_sprint_metrics', {
    p_sprint_id: sprintId
  });
  
  if (error) throw error;
  
  return data?.[0] || {
    sprintInfo: { name: '', goal: '', startDate: '', endDate: '', status: '' },
    metrics: {
      totalItems: 0,
      completedItems: 0,
      totalPoints: 0,
      completedPoints: 0,
      completionRate: 0,
      velocityAchieved: 0,
      scopeChange: 0,
      averageCycleTime: 0
    },
    dailyProgress: []
  };
}

async function analyzeWorkloadDistribution(supabase: ReturnType<typeof createClient>, projectId: string, dateRange?: { start: string; end: string }): Promise<{
  byAssignee: {
    userId: string;
    userName: string;
    activeItems: number;
    totalPoints: number;
    utilization: number;
  }[];
  byType: {
    type: string;
    count: number;
    totalPoints: number;
    averagePoints: number;
  }[];
  byPriority: {
    priority: string;
    count: number;
    percentage: number;
  }[];
}> {
  const { data, error } = await supabase.rpc('analyze_workload_distribution', {
    p_project_id: projectId,
    p_start_date: dateRange?.start,
    p_end_date: dateRange?.end
  });
  
  if (error) throw error;
  
  return {
    byAssignee: data?.by_assignee || [],
    byType: data?.by_type || [],
    byPriority: data?.by_priority || []
  };
}

async function analyzeCompletionTrends(supabase: ReturnType<typeof createClient>, projectId: string, groupBy = 'week'): Promise<{
  trends: {
    period: string;
    completedItems: number;
    completedPoints: number;
    createdItems: number;
    createdPoints: number;
    netProgress: number;
  }[];
  summary: {
    totalCompleted: number;
    averagePerPeriod: number;
    trend: 'up' | 'down' | 'stable';
    productivity: number;
  };
}> {
  const { data, error } = await supabase.rpc('analyze_completion_trends', {
    p_project_id: projectId,
    p_group_by: groupBy
  });
  
  if (error) throw error;
  
  return {
    trends: data?.trends || [],
    summary: data?.summary || {
      totalCompleted: 0,
      averagePerPeriod: 0,
      trend: 'stable',
      productivity: 0
    }
  };
}
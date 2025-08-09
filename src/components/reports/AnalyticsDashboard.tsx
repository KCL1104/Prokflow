import React, { useState } from 'react';
import { useAnalytics } from '../../hooks/useAnalytics';
import { VelocityChart } from '../charts/VelocityChart';
import { CycleTimeChart } from '../charts/CycleTimeChart';
import { CompletionRateChart } from '../charts/CompletionRateChart';
import { Loading } from '../common/Loading';
import { Icon } from '../common/Icon';
import type { TeamMetrics } from '../../types';
import type { IconName } from '../common/Icon';

interface AnalyticsDashboardProps {
  projectId: string;
  className?: string;
}

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon: IconName;
  className?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  icon,
  className = ''
}) => {
  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-600'
  };

  const trendIcons: Record<'up' | 'down' | 'neutral', IconName> = {
    up: 'trending-up',
    down: 'trending-down',
    neutral: 'minus'
  };

  return (
    <div className={`bg-white rounded-md border border-gray-200 p-6 shadow-xs ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && (
            <div className="flex items-center mt-1">
              {trend && (
                <Icon 
                  name={trendIcons[trend]} 
                  className={`h-4 w-4 mr-1 ${trendColors[trend]}`} 
                />
              )}
              <p className={`text-sm ${trend ? trendColors[trend] : 'text-gray-500'}`}>
                {subtitle}
              </p>
            </div>
          )}
        </div>
        <div className="p-3 bg-primary-50 rounded-md">
          <Icon name={icon} className="h-6 w-6 text-primary-600" />
        </div>
      </div>
    </div>
  );
};

interface TeamMetricsTableProps {
  teamMetrics: TeamMetrics[];
  isLoading: boolean;
}

const TeamMetricsTable: React.FC<TeamMetricsTableProps> = ({ teamMetrics, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-md border border-gray-200 p-6 shadow-xs">
        <div className="h-48 flex items-center justify-center">
          <Loading size="large" />
        </div>
      </div>
    );
  }

  if (teamMetrics.length === 0) {
    return (
      <div className="bg-white rounded-md border border-gray-200 p-6 shadow-xs">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Performance</h3>
        <div className="h-48 flex items-center justify-center bg-gray-50 rounded-md">
          <div className="text-center text-gray-500">
            <Icon name="users" className="h-8 w-8 mx-auto mb-2" />
            <p className="font-medium">No team metrics available</p>
            <p className="text-sm mt-1">Assign work items to team members to see performance data</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-md border border-gray-200 p-6 shadow-xs">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Performance</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Team Member
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Completed Items
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Avg Cycle Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Current Workload
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Utilization
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {teamMetrics.map((member) => (
              <tr key={member.memberId} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {member.memberName}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{member.completedItems}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {member.averageCycleTime.toFixed(1)} days
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{member.workload} items</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="text-sm text-gray-900 mr-2">
                      {member.utilization.toFixed(1)}%
                    </div>
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          member.utilization > 80 
                            ? 'bg-red-500' 
                            : member.utilization > 60 
                            ? 'bg-yellow-500' 
                            : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(member.utilization, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  projectId,
  className = ''
}) => {
  const [dateRange] = useState<{ start: Date; end: Date } | undefined>();
  const [autoRefresh, setAutoRefresh] = useState(false);

  const {
    projectMetrics,
    velocityData,
    teamMetrics,
    cycleTimeAnalytics,
    completionRateAnalytics,
    loadingStates,
    isLoading,
    refreshAnalytics,
    exportReport
  } = useAnalytics({
    projectId,
    autoRefresh,
    refreshInterval: 300000, // 5 minutes
    dateRange
  });

  const handleClearCache = () => {
    // Clear cache and refresh data
    if (window.confirm('This will clear the report cache and refresh all data. Continue?')) {
      // Import and use the report service directly for cache clearing
      import('../../services/reportService').then(({ reportService }) => {
        reportService.clearCache(projectId);
        refreshAnalytics();
      });
    }
  };

  const handleExport = async (reportType: string, format: 'csv' | 'json' | 'pdf') => {
    try {
      const data = await exportReport(reportType, format);
      
      // Create and download file
      let blob: Blob;
      
      if (format === 'pdf') {
        blob = data as Blob;
      } else {
        blob = new Blob([data as string], { 
          type: format === 'csv' ? 'text/csv' : 'application/json' 
        });
      }
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportType}-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  // Generate cycle time chart data from project metrics
  const cycleTimeChartData = projectMetrics?.burndownData.map((item) => ({
    date: item.date,
    cycleTime: cycleTimeAnalytics?.averageCycleTime || 0,
    leadTime: cycleTimeAnalytics?.averageLeadTime || 0
  })) || [];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Project performance metrics and insights
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {/* Auto-refresh toggle */}
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="ml-2 text-sm text-gray-700">Auto-refresh</span>
          </label>

          {/* Refresh button */}
          <button
            onClick={refreshAnalytics}
            disabled={isLoading}
            className="inline-flex items-center px-3 py-2 border-2 border-default text-sm leading-4 font-medium rounded-md text-gray-700 bg-warm-25 hover:bg-warm-50 hover:border-medium focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 transition-all duration-150"
          >
            <Icon name="refresh-cw" className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>

          {/* Clear Cache button */}
          <button
            onClick={handleClearCache}
            disabled={isLoading}
            className="inline-flex items-center px-3 py-2 border-2 border-default text-sm leading-4 font-medium rounded-md text-gray-700 bg-warm-25 hover:bg-warm-50 hover:border-medium focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 transition-all duration-150"
          >
            <Icon name="trash-2" className="h-4 w-4 mr-2" />
            Clear Cache
          </button>

          {/* Export dropdown */}
          <div className="relative">
            <select
              onChange={(e) => {
                const [reportType, format] = e.target.value.split(':');
                if (reportType && format) {
                  handleExport(reportType, format as 'csv' | 'json' | 'pdf');
                }
                e.target.value = '';
              }}
              className="block w-full pl-3 pr-10 py-2 text-base border-2 border-default bg-warm-25 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:bg-warm-50 sm:text-sm rounded-md"
              defaultValue=""
            >
              <option value="" disabled>Export...</option>
              <option value="project-metrics:json">Project Metrics (JSON)</option>
              <option value="project-metrics:csv">Project Metrics (CSV)</option>
              <option value="project-metrics:pdf">Project Metrics (PDF)</option>
              <option value="velocity-trends:json">Velocity Trends (JSON)</option>
              <option value="velocity-trends:csv">Velocity Trends (CSV)</option>
              <option value="velocity-trends:pdf">Velocity Trends (PDF)</option>
              <option value="team-metrics:json">Team Metrics (JSON)</option>
              <option value="team-metrics:csv">Team Metrics (CSV)</option>
              <option value="team-metrics:pdf">Team Metrics (PDF)</option>
              <option value="cycle-time:json">Cycle Time (JSON)</option>
              <option value="cycle-time:csv">Cycle Time (CSV)</option>
              <option value="cycle-time:pdf">Cycle Time (PDF)</option>
              <option value="completion-rate:json">Completion Rate (JSON)</option>
              <option value="completion-rate:csv">Completion Rate (CSV)</option>
              <option value="completion-rate:pdf">Completion Rate (PDF)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Work Items"
          value={projectMetrics?.totalWorkItems || 0}
          icon="list"
        />
        <MetricCard
          title="Completion Rate"
          value={`${completionRateAnalytics?.completionRate.toFixed(1) || 0}%`}
          subtitle={`${completionRateAnalytics?.completedItems || 0} of ${completionRateAnalytics?.totalItems || 0} completed`}
          trend={
            (completionRateAnalytics?.completionRate || 0) >= 80 
              ? 'up' 
              : (completionRateAnalytics?.completionRate || 0) >= 60 
              ? 'neutral' 
              : 'down'
          }
          icon="check-circle"
        />
        <MetricCard
          title="Average Cycle Time"
          value={`${cycleTimeAnalytics?.averageCycleTime.toFixed(1) || 0} days`}
          subtitle="Time from start to completion"
          icon="clock"
        />
        <MetricCard
          title="Throughput"
          value={`${cycleTimeAnalytics?.throughput.toFixed(1) || 0}`}
          subtitle="Items completed per day"
          icon="trending-up"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Velocity Chart */}
        <VelocityChart 
          data={velocityData} 
          className="lg:col-span-1"
        />

        {/* Completion Rate Chart */}
        <CompletionRateChart
          completionRate={completionRateAnalytics?.completionRate || 0}
          completionTrend={completionRateAnalytics?.completionTrend || []}
          totalItems={completionRateAnalytics?.totalItems || 0}
          completedItems={completionRateAnalytics?.completedItems || 0}
          className="lg:col-span-1"
        />

        {/* Cycle Time Chart */}
        <CycleTimeChart
          data={cycleTimeChartData}
          averageCycleTime={cycleTimeAnalytics?.averageCycleTime || 0}
          averageLeadTime={cycleTimeAnalytics?.averageLeadTime || 0}
          className="lg:col-span-1"
        />

        {/* Burndown Chart (if active sprint exists) */}
        {projectMetrics?.burndownData && projectMetrics.burndownData.length > 0 && (
          <div className="lg:col-span-1">
            <div className="bg-warm-25 rounded-lg border-2 border-default p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Sprint Burndown</h3>
              <div className="h-64">
                {/* This would need the actual sprint ID - simplified for now */}
                <div className="h-full flex items-center justify-center bg-warm-50 rounded-md border-2 border-light">
                  <div className="text-center text-gray-500">
                    <Icon name="bar-chart" className="h-8 w-8 mx-auto mb-2" />
                    <p className="font-medium">Active sprint burndown</p>
                    <p className="text-sm mt-1">Integrated with sprint management</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Team Metrics Table */}
      <TeamMetricsTable 
        teamMetrics={teamMetrics} 
        isLoading={loadingStates.teamMetrics === 'loading'} 
      />
    </div>
  );
};
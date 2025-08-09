import React, { useMemo } from 'react';
import {
  CategoryScale,
  Chart as ChartJS,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import type { ChartOptions } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { Icon } from '../common/Icon';
import type { WorkItem, TeamMember, User } from '../../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface TeamMemberWithUser extends TeamMember {
  user: User;
}

// Configuration constants
const RESOURCE_ALLOCATION_CONFIG = {
  DEFAULT_WEEKLY_CAPACITY: 40, // 8 hours * 5 days
  UTILIZATION_THRESHOLDS: {
    HIGH: 80,
    NORMAL: 60,
    OVER_ALLOCATED: 100,
  },
  CHART_DISPLAY_CAP: 150, // Cap utilization display at 150%
} as const;

interface ResourceAllocationData {
  memberId: string;
  memberName: string;
  email: string;
  totalWorkload: number;
  currentCapacity: number;
  utilization: number;
  assignedTasks: number;
  completedTasks: number;
  isOverAllocated: boolean;
}

interface ResourceAllocationChartProps {
  workItems: WorkItem[];
  teamMembers: TeamMemberWithUser[];
  onMemberClick?: (memberId: string) => void;
  className?: string;
}

// Error boundary for chart rendering
class ChartErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Resource allocation chart error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

const ChartErrorFallback: React.FC = () => (
  <div className="h-64 flex items-center justify-center bg-gray-50 rounded-md">
    <div className="text-center text-gray-500">
      <Icon name="alert-triangle" className="h-8 w-8 mx-auto mb-2" />
      <p className="font-medium">Unable to render chart</p>
      <p className="text-sm mt-1">Please try refreshing the page</p>
    </div>
  </div>
);

// Color mapping utilities with improved readability
const UTILIZATION_COLOR_MAP = {
  OVER_ALLOCATED: { bg: '#EF4444', border: '#DC2626' },
  HIGH: { bg: '#F59E0B', border: '#D97706' },
  NORMAL: { bg: '#3B82F6', border: '#2563EB' },
  LOW: { bg: '#10B981', border: '#059669' },
} as const;

const getUtilizationColor = (data: ResourceAllocationData): { bg: string; border: string } => {
  if (data.isOverAllocated) {
    return UTILIZATION_COLOR_MAP.OVER_ALLOCATED;
  }

  const { utilization } = data;
  const { HIGH, NORMAL } = RESOURCE_ALLOCATION_CONFIG.UTILIZATION_THRESHOLDS;

  if (utilization > HIGH) return UTILIZATION_COLOR_MAP.HIGH;
  if (utilization > NORMAL) return UTILIZATION_COLOR_MAP.NORMAL;
  return UTILIZATION_COLOR_MAP.LOW;
};

export const ResourceAllocationChart: React.FC<ResourceAllocationChartProps> = React.memo(({
  workItems,
  teamMembers,
  onMemberClick,
  className = ''
}) => {
  // Calculate resource allocation data with optimized filtering
  const resourceData = useMemo((): ResourceAllocationData[] => {
    // Early return if no data
    if (workItems.length === 0 || teamMembers.length === 0) {
      return [];
    }

    // Pre-group work items by assignee to avoid repeated filtering
    const workItemsByAssignee = workItems.reduce((acc, item) => {
      if (item.assigneeId) {
        if (!acc[item.assigneeId]) {
          acc[item.assigneeId] = [];
        }
        acc[item.assigneeId].push(item);
      }
      return acc;
    }, {} as Record<string, WorkItem[]>);

    return teamMembers.map(member => {
      const assignedItems = workItemsByAssignee[member.userId] || [];

      // Use single pass to calculate all metrics
      let totalWorkload = 0;
      let remainingWorkload = 0;
      let completedCount = 0;

      for (const item of assignedItems) {
        const estimate = item.estimate || 0;
        totalWorkload += estimate;

        if (item.status === 'Done') {
          completedCount++;
        } else {
          remainingWorkload += estimate;
        }
      }

      const currentCapacity = RESOURCE_ALLOCATION_CONFIG.DEFAULT_WEEKLY_CAPACITY;
      const utilization = currentCapacity > 0 ? (remainingWorkload / currentCapacity) * 100 : 0;
      const isOverAllocated = utilization > RESOURCE_ALLOCATION_CONFIG.UTILIZATION_THRESHOLDS.OVER_ALLOCATED;

      return {
        memberId: member.userId,
        memberName: member.user.fullName || member.user.email,
        email: member.user.email,
        totalWorkload,
        currentCapacity,
        utilization,
        assignedTasks: assignedItems.length,
        completedTasks: completedCount,
        isOverAllocated,
      };
    });
  }, [workItems, teamMembers]);

  // Prepare chart data
  const chartData = useMemo(() => {
    if (resourceData.length === 0) {
      return null;
    }

    const labels = resourceData.map(data => data.memberName);
    const utilizationData = resourceData.map(data => Math.min(data.utilization, RESOURCE_ALLOCATION_CONFIG.CHART_DISPLAY_CAP)); // Cap at 150% for display

    return {
      labels,
      datasets: [
        {
          label: 'Current Utilization (%)',
          data: utilizationData,
          backgroundColor: resourceData.map(data => getUtilizationColor(data).bg),
          borderColor: resourceData.map(data => getUtilizationColor(data).border),
          borderWidth: 2,
          barThickness: 40,
        }
      ]
    };
  }, [resourceData]);

  // Chart options
  const options: ChartOptions<'bar'> = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            family: 'Inter, system-ui, sans-serif',
          },
        },
      },
      title: {
        display: true,
        text: 'Team Resource Allocation',
        font: {
          size: 16,
          weight: 'bold',
          family: 'Inter, system-ui, sans-serif',
        },
        padding: {
          bottom: 20,
        },
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        callbacks: {
          title: function (context) {
            const dataIndex = context[0].dataIndex;
            return resourceData[dataIndex]?.memberName || '';
          },
          label: function (context) {
            const dataIndex = context.dataIndex;
            const data = resourceData[dataIndex];
            if (!data) return '';

            if (context.dataset.label === 'Current Utilization (%)') {
              const lines = [
                `Utilization: ${Math.round(data.utilization)}%`,
                `Assigned Tasks: ${data.assignedTasks}`,
                `Completed Tasks: ${data.completedTasks}`,
                `Total Workload: ${data.totalWorkload}h`,
              ];

              if (data.isOverAllocated) {
                lines.push('⚠️ Over-allocated');
              }

              return lines;
            }

            return context.dataset.label;
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Team Members',
          font: {
            size: 12,
            weight: 'bold',
            family: 'Inter, system-ui, sans-serif',
          },
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          font: {
            size: 11,
            family: 'Inter, system-ui, sans-serif',
          },
          maxRotation: 45,
        },
      },
      y: {
        title: {
          display: true,
          text: 'Utilization (%)',
          font: {
            size: 12,
            weight: 'bold',
            family: 'Inter, system-ui, sans-serif',
          },
        },
        beginAtZero: true,
        max: 150,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          font: {
            size: 11,
            family: 'Inter, system-ui, sans-serif',
          },
          callback: function (value) {
            return `${value}%`;
          },
        },
      },
    },
    onClick: (_event, elements) => {
      if (elements.length > 0 && onMemberClick) {
        const dataIndex = elements[0].index;
        const memberData = resourceData[dataIndex];
        if (memberData) {
          onMemberClick(memberData.memberId);
        }
      }
    },
  }), [resourceData, onMemberClick]);

  if (!chartData || resourceData.length === 0) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-md">
          <div className="text-center text-gray-500">
            <Icon name="users" className="h-8 w-8 mx-auto mb-2" />
            <p className="font-medium">No team members found</p>
            <p className="text-sm mt-1">Add team members to see resource allocation</p>
          </div>
        </div>
      </div>
    );
  }

  // Calculate summary statistics
  const overAllocatedCount = resourceData.filter(data => data.isOverAllocated).length;
  const highUtilizationCount = resourceData.filter(data => data.utilization > 80 && !data.isOverAllocated).length;
  const averageUtilization = resourceData.reduce((sum, data) => sum + data.utilization, 0) / resourceData.length;

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      {/* Summary Statistics */}
      <div className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center">
              <Icon name="users" className="h-5 w-5 text-gray-400 mr-2" />
              <div>
                <p className="text-sm text-gray-600">Team Members</p>
                <p className="text-lg font-semibold text-gray-900">{resourceData.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-red-50 rounded-lg p-4">
            <div className="flex items-center">
              <Icon name="alert-triangle" className="h-5 w-5 text-red-400 mr-2" />
              <div>
                <p className="text-sm text-gray-600">Over-allocated</p>
                <p className="text-lg font-semibold text-gray-900">{overAllocatedCount}</p>
              </div>
            </div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center">
              <Icon name="zap" className="h-5 w-5 text-yellow-400 mr-2" />
              <div>
                <p className="text-sm text-gray-600">High Utilization</p>
                <p className="text-lg font-semibold text-gray-900">{highUtilizationCount}</p>
              </div>
            </div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center">
              <Icon name="bar-chart" className="h-5 w-5 text-blue-400 mr-2" />
              <div>
                <p className="text-sm text-gray-600">Avg Utilization</p>
                <p className="text-lg font-semibold text-gray-900">{Math.round(averageUtilization)}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64 relative">
        <ChartErrorBoundary fallback={<ChartErrorFallback />}>
          <Bar data={chartData} options={options} />
        </ChartErrorBoundary>
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
            <span className="text-gray-600">Over-allocated (&gt;100%)</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-yellow-500 rounded mr-2"></div>
            <span className="text-gray-600">High utilization (80-100%)</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
            <span className="text-gray-600">Normal utilization (60-80%)</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
            <span className="text-gray-600">Low utilization (&lt;60%)</span>
          </div>
        </div>

        <div className="mt-3 text-xs text-gray-500">
          <p>• Click on bars to view member details • Capacity assumes 40 hours/week</p>
          <p>• Utilization based on remaining work estimates</p>
        </div>
      </div>
    </div>
  );
});
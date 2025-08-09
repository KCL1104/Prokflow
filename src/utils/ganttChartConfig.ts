import type { ChartOptions } from 'chart.js';

interface GanttTask {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  progress: number;
  dependencies: string[];
  assignee?: string;
  priority: string;
  status: string;
  estimate: number;
  actualTime: number;
  isCriticalPath: boolean;
  isMilestone: boolean;
}

export const createGanttChartOptions = (
  tasksWithCriticalPath: GanttTask[],
  timeScale: 'day' | 'week' | 'month',
  onWorkItemClick?: (workItem: { id: string }) => void
): ChartOptions<'bar'> => ({
  indexAxis: 'y' as const,
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    title: {
      display: true,
      text: 'Project Gantt Chart',
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
      mode: 'nearest',
      intersect: true,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleColor: 'white',
      bodyColor: 'white',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 1,
      cornerRadius: 8,
      padding: 12,
      callbacks: {
        title: function(context) {
          const dataIndex = context[0].dataIndex;
          return tasksWithCriticalPath[dataIndex]?.title || '';
        },
        label: function(context) {
          const dataIndex = context.dataIndex;
          const task = tasksWithCriticalPath[dataIndex];
          if (!task) return '';
          
          const duration = Math.ceil((task.endDate.getTime() - task.startDate.getTime()) / (1000 * 60 * 60 * 24));
          const lines = [
            `Duration: ${duration} days`,
            `Progress: ${Math.round(task.progress)}%`,
            `Priority: ${task.priority}`,
            `Status: ${task.status}`
          ];
          
          if (task.isCriticalPath) {
            lines.push('⚠️ Critical Path');
          }
          if (task.isMilestone) {
            lines.push('🎯 Milestone');
          }
          
          return lines;
        },
      },
    },
  },
  scales: {
    x: {
      type: 'time',
      time: {
        unit: timeScale,
        displayFormats: {
          day: 'MMM dd',
          week: 'MMM dd',
          month: 'MMM yyyy'
        }
      },
      title: {
        display: true,
        text: 'Timeline',
        font: {
          size: 12,
          weight: 'bold',
          family: 'Inter, system-ui, sans-serif',
        },
      },
      grid: {
        color: 'rgba(0, 0, 0, 0.1)',
      },
    },
    y: {
      title: {
        display: true,
        text: 'Tasks',
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
        callback: function(_value, index) {
          const task = tasksWithCriticalPath[index];
          if (!task) return '';
          
          // Truncate long titles
          const maxLength = 30;
          return task.title.length > maxLength 
            ? task.title.substring(0, maxLength) + '...'
            : task.title;
        },
      },
    },
  },
  onClick: (_event, elements) => {
    if (elements.length > 0 && onWorkItemClick) {
      const dataIndex = elements[0].index;
      const task = tasksWithCriticalPath[dataIndex];
      if (task) {
        onWorkItemClick(task);
      }
    }
  },
});

export const createGanttChartData = (
  tasksWithCriticalPath: GanttTask[],
  showCriticalPath: boolean
) => {
  if (tasksWithCriticalPath.length === 0) {
    return null;
  }

  const labels = tasksWithCriticalPath.map(task => task.title);

  return {
    labels,
    datasets: [
      {
        label: 'Task Duration',
        data: tasksWithCriticalPath.map((task, index) => ({
          x: [task.startDate, task.endDate],
          y: index,
          taskId: task.id,
          progress: task.progress,
          isCriticalPath: task.isCriticalPath,
          isMilestone: task.isMilestone,
          priority: task.priority,
          status: task.status
        })),
        backgroundColor: tasksWithCriticalPath.map(task => {
          if (task.isMilestone) return '#8B5CF6'; // Purple for milestones
          if (task.isCriticalPath && showCriticalPath) return '#EF4444'; // Red for critical path
          switch (task.priority) {
            case 'critical': return '#DC2626';
            case 'high': return '#EA580C';
            case 'medium': return '#3B82F6';
            case 'low': return '#10B981';
            default: return '#6B7280';
          }
        }),
        borderColor: tasksWithCriticalPath.map(task => {
          if (task.status === 'Done') return '#059669';
          return 'transparent';
        }),
        borderWidth: 2,
        barThickness: 20,
        categoryPercentage: 0.8,
        barPercentage: 0.9,
      }
    ]
  };
};
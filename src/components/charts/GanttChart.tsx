import React, { useMemo, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  TimeScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import { Bar } from 'react-chartjs-2';
import { Icon } from '../common/Icon';
import { GanttChartControls } from './GanttChartControls';
import type { WorkItem } from '../../types';
import { useGanttData } from '../../hooks/useGanttData';
import { createGanttChartData, createGanttChartOptions } from '../../utils/ganttChartConfig';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  TimeScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface GanttChartProps {
  projectId: string;
  workItems: WorkItem[];
  onWorkItemClick?: (workItem: WorkItem) => void;
  onDependencyEdit?: (workItemId: string, dependencies: string[]) => void;
  className?: string;
}



// Error boundary for chart rendering
class ErrorBoundary extends React.Component<
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
    console.error('Gantt chart rendering error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

const ChartErrorFallback: React.FC = () => (
  <div className="h-96 flex items-center justify-center bg-gray-50 rounded-md">
    <div className="text-center text-gray-500">
      <Icon name="alert-triangle" className="h-8 w-8 mx-auto mb-2" />
      <p className="font-medium">Unable to render Gantt chart</p>
      <p className="text-sm mt-1">Please try refreshing the page</p>
    </div>
  </div>
);

export const GanttChart: React.FC<GanttChartProps> = React.memo(({
  workItems,
  onWorkItemClick,
  className = ''
}) => {
  const [showCriticalPath, setShowCriticalPath] = useState(true);
  const [showMilestones, setShowMilestones] = useState(true);
  const [timeScale, setTimeScale] = useState<'day' | 'week' | 'month'>('week');

  const { tasksWithCriticalPath, criticalPath } = useGanttData(workItems);

  // Prepare chart data
  const chartData = useMemo(() => {
    return createGanttChartData(tasksWithCriticalPath, showCriticalPath);
  }, [tasksWithCriticalPath, showCriticalPath]);

  // Chart options
  const options = useMemo(() => {
    const handleTaskClick = (task: { id: string }) => {
      if (onWorkItemClick) {
        const workItem = workItems.find(item => item.id === task.id);
        if (workItem) {
          onWorkItemClick(workItem);
        }
      }
    };

    return createGanttChartOptions(tasksWithCriticalPath, timeScale, handleTaskClick);
  }, [tasksWithCriticalPath, timeScale, workItems, onWorkItemClick]);





  if (!chartData || tasksWithCriticalPath.length === 0) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <div className="h-96 flex items-center justify-center bg-gray-50 rounded-md">
          <div className="text-center text-gray-500">
            <Icon name="calendar" className="h-8 w-8 mx-auto mb-2" />
            <p className="font-medium">No timeline data available</p>
            <p className="text-sm mt-1">Add due dates to work items to see them in the Gantt chart</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      {/* Chart Controls */}
      <GanttChartControls
        showCriticalPath={showCriticalPath}
        onShowCriticalPathChange={setShowCriticalPath}
        showMilestones={showMilestones}
        onShowMilestonesChange={setShowMilestones}
        timeScale={timeScale}
        onTimeScaleChange={setTimeScale}
        criticalPathDuration={criticalPath.duration}
        hasCriticalPath={criticalPath.path.length > 0}
      />

      {/* Chart Container */}
      <div className="h-96 relative">
        <ErrorBoundary fallback={<ChartErrorFallback />}>
          <Bar data={chartData} options={options} />
        </ErrorBoundary>
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
            <span className="text-gray-600">Critical Path</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-purple-500 rounded mr-2"></div>
            <span className="text-gray-600">Milestones</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-orange-500 rounded mr-2"></div>
            <span className="text-gray-600">High Priority</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
            <span className="text-gray-600">Normal Priority</span>
          </div>
        </div>
        
        <div className="mt-3 text-xs text-gray-500">
          <p>• Click on tasks to view details • Red border indicates completed tasks</p>
          <p>• Critical path shows the longest sequence of dependent tasks</p>
        </div>
      </div>
    </div>
  );
});
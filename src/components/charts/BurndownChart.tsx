<<<<<<< HEAD
import React, { useMemo } from 'react';
=======
import React, { useMemo, useEffect, useState } from 'react';
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import type { ChartOptions } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Icon } from '../common/Icon';
<<<<<<< HEAD
=======
import { Loading } from '../common/Loading';
import { sprintService } from '../../services';
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
import type { BurndownData } from '../../types';

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
    console.error('Chart rendering error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

// Fallback component for chart errors
const ChartErrorFallback: React.FC = () => (
  <div className="h-64 flex items-center justify-center bg-gray-50 rounded-md">
    <div className="text-center text-gray-500">
      <Icon name="alert-triangle" className="h-8 w-8 mx-auto mb-2" />
      <p className="font-medium">Unable to render chart</p>
      <p className="text-sm mt-1">Please try refreshing the page</p>
    </div>
  </div>
);

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface BurndownChartProps {
<<<<<<< HEAD
  data: BurndownData[];
=======
  sprintId: string;
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
  sprintName: string;
  className?: string;
}

export const BurndownChart: React.FC<BurndownChartProps> = React.memo(({
<<<<<<< HEAD
  data,
  sprintName,
  className = ''
}) => {
=======
  sprintId,
  sprintName,
  className = ''
}) => {
  const [data, setData] = useState<BurndownData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    const fetchBurndownData = async () => {
      setLoading(true);
      setError(null);
      try {
        const burndownData = await sprintService.getSprintBurndown(sprintId);
        if (isMounted) {
          setData(burndownData || []); // Handle null/undefined response
        }
      } catch (err) {
        if (isMounted) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to load burndown data';
          setError(errorMessage);
          console.error('Burndown data fetch error:', err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (sprintId) {
      fetchBurndownData().catch(err => {
        if (isMounted) {
          console.error('Unhandled burndown fetch error:', err);
        }
      });
    }
    
    return () => {
      isMounted = false;
    };
  }, [sprintId]);
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
  const chartData = useMemo(() => {
    if (!data || data.length === 0) {
      return null;
    }

    const labels = data.map(item => {
      const date = new Date(item.date);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    });

    return {
      labels,
      datasets: [
        {
          label: 'Remaining Work',
          data: data.map(item => item.remainingPoints),
          borderColor: 'rgb(59, 130, 246)', // blue-500
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 3,
          pointBackgroundColor: 'rgb(59, 130, 246)',
          pointBorderColor: 'white',
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8,
          tension: 0.1,
          fill: true,
        },
        {
          label: 'Ideal Burndown',
          data: data.map(item => item.idealRemaining),
          borderColor: 'rgb(156, 163, 175)', // gray-400
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderDash: [5, 5],
          pointBackgroundColor: 'rgb(156, 163, 175)',
          pointBorderColor: 'white',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          tension: 0,
          fill: false,
        },
      ],
    };
  }, [data]);

  const options: ChartOptions<'line'> = useMemo(() => ({
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
        text: `${sprintName} - Burndown Chart`,
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
        titleFont: {
          size: 13,
          weight: 'bold',
        },
        bodyFont: {
          size: 12,
        },
        callbacks: {
          label: function(context) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return `${label}: ${value} story points`;
          },
        },
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false,
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Sprint Days',
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
        },
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Story Points',
          font: {
            size: 12,
            weight: 'bold',
            family: 'Inter, system-ui, sans-serif',
          },
        },
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          font: {
            size: 11,
            family: 'Inter, system-ui, sans-serif',
          },
          callback: function(value) {
            return `${value} pts`;
          },
        },
      },
    },
    elements: {
      point: {
        hoverBorderWidth: 3,
      },
    },
  }), [sprintName]);

<<<<<<< HEAD
=======
  if (loading) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <div className="h-64 flex items-center justify-center">
          <Loading size="large" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <div className="h-64 flex items-center justify-center bg-red-50 rounded-md">
          <div className="text-center text-red-500">
            <Icon name="alert-circle" className="h-8 w-8 mx-auto mb-2" />
            <p className="font-medium">Error loading burndown data</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
  if (!chartData || data.length === 0) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-md">
          <div className="text-center text-gray-500">
            <Icon name="bar-chart" className="h-8 w-8 mx-auto mb-2" />
            <p className="font-medium">No burndown data available</p>
            <p className="text-sm mt-1">Data will appear as work progresses during the sprint</p>
          </div>
        </div>
      </div>
    );
  }

  const currentRemaining = data[data.length - 1]?.remainingPoints || 0;
  const idealRemaining = data[data.length - 1]?.idealRemaining || 0;
  const isAheadOfSchedule = currentRemaining < idealRemaining;
  const isBehindSchedule = currentRemaining > idealRemaining;

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      {/* Chart Header with Status */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Burndown Chart</h3>
        <div className="flex items-center space-x-4">
          {/* Sprint Status Indicator */}
          <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            isAheadOfSchedule 
              ? 'bg-green-100 text-green-800' 
              : isBehindSchedule 
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-blue-100 text-blue-800'
          }`}>
            <Icon 
              name={isAheadOfSchedule ? 'trending-down' : isBehindSchedule ? 'trending-up' : 'minus'} 
              className="h-4 w-4 mr-1" 
            />
            {isAheadOfSchedule ? 'Ahead of Schedule' : isBehindSchedule ? 'Behind Schedule' : 'On Track'}
          </div>
          
          {/* Current vs Ideal */}
          <div className="text-sm text-gray-600">
            <span className="font-medium">{currentRemaining}</span> / <span>{idealRemaining}</span> pts remaining
          </div>
        </div>
      </div>

      {/* Chart Container */}
      <div className="h-64 relative">
        <ErrorBoundary fallback={<ChartErrorFallback />}>
          <Line data={chartData} options={options} />
        </ErrorBoundary>
      </div>

      {/* Chart Legend/Info */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
            <span className="text-gray-600">Actual progress</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-0.5 bg-gray-400 mr-2" style={{ borderTop: '2px dashed' }}></div>
            <span className="text-gray-600">Ideal burndown</span>
          </div>
          <div className="text-gray-500 text-xs">
            Updated daily based on completed work
          </div>
        </div>
      </div>
    </div>
  );
<<<<<<< HEAD
});
=======
});
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)

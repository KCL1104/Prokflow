import React, { useMemo } from 'react';
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
import { Line } from 'react-chartjs-2';
import type { ChartOptions } from 'chart.js';
import { Icon } from '../common/Icon';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface CycleTimeData {
  date: string;
  cycleTime: number;
  leadTime: number;
}

interface CycleTimeChartProps {
  data: CycleTimeData[];
  averageCycleTime: number;
  averageLeadTime: number;
  className?: string;
}

export const CycleTimeChart: React.FC<CycleTimeChartProps> = React.memo(({
  data,
  averageCycleTime,
  averageLeadTime,
  className = ''
}) => {
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
          label: 'Cycle Time',
          data: data.map(item => item.cycleTime),
          borderColor: 'rgb(59, 130, 246)', // blue-500
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 3,
          pointBackgroundColor: 'rgb(59, 130, 246)',
          pointBorderColor: 'white',
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8,
          tension: 0.1,
          fill: false,
        },
        {
          label: 'Lead Time',
          data: data.map(item => item.leadTime),
          borderColor: 'rgb(34, 197, 94)', // green-500
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          borderWidth: 3,
          pointBackgroundColor: 'rgb(34, 197, 94)',
          pointBorderColor: 'white',
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8,
          tension: 0.1,
          fill: false,
        },
        {
          label: 'Avg Cycle Time',
          data: data.map(() => averageCycleTime),
          borderColor: 'rgb(156, 163, 175)', // gray-400
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderDash: [5, 5],
          pointRadius: 0,
          tension: 0,
          fill: false,
        },
      ],
    };
  }, [data, averageCycleTime]);

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
        text: 'Cycle Time & Lead Time Trends',
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
          label: function(context) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return `${label}: ${value.toFixed(1)} days`;
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
          text: 'Time Period',
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
          text: 'Days',
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
            return `${value} days`;
          },
        },
      },
    },
  }), []);

  if (!chartData || data.length === 0) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-md">
          <div className="text-center text-gray-500">
            <Icon name="clock" className="h-8 w-8 mx-auto mb-2" />
            <p className="font-medium">No cycle time data available</p>
            <p className="text-sm mt-1">Complete some work items to see cycle time trends</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      {/* Chart Header with Metrics */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Cycle Time Analysis</h3>
        <div className="flex items-center space-x-4">
          {/* Average Metrics */}
          <div className="text-sm text-gray-600">
            <span className="font-medium">Avg Cycle: {averageCycleTime.toFixed(1)}</span> days
          </div>
          <div className="text-sm text-gray-600">
            <span className="font-medium">Avg Lead: {averageLeadTime.toFixed(1)}</span> days
          </div>
        </div>
      </div>

      {/* Chart Container */}
      <div className="h-64 relative">
        <Line data={chartData} options={options} />
      </div>

      {/* Chart Legend/Info */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
            <span className="text-gray-600">Cycle time (work start to completion)</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span className="text-gray-600">Lead time (request to delivery)</span>
          </div>
          <div className="text-gray-500 text-xs">
            Lower times indicate better flow efficiency
          </div>
        </div>
      </div>
    </div>
  );
});
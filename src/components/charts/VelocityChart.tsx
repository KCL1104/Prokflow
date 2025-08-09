import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import type { ChartOptions } from 'chart.js';
import { Icon } from '../common/Icon';
import type { VelocityData } from '../../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

interface VelocityChartProps {
  data: VelocityData[];
  className?: string;
}

export const VelocityChart: React.FC<VelocityChartProps> = React.memo(({
  data,
  className = ''
}) => {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) {
      return null;
    }

    const labels = data.map(item => item.sprintName);

    return {
      labels,
      datasets: [
        {
          label: 'Committed Points',
          data: data.map(item => item.committedPoints),
          backgroundColor: 'rgba(59, 130, 246, 0.6)', // blue-500 with opacity
          borderColor: 'rgb(59, 130, 246)',
          borderWidth: 1,
        },
        {
          label: 'Completed Points',
          data: data.map(item => item.completedPoints),
          backgroundColor: 'rgba(34, 197, 94, 0.6)', // green-500 with opacity
          borderColor: 'rgb(34, 197, 94)',
          borderWidth: 1,
        },
      ],
    };
  }, [data]);

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
        text: 'Sprint Velocity Trends',
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
            return `${label}: ${value} story points`;
          },
          afterBody: function(tooltipItems) {
            if (tooltipItems.length >= 2) {
              const committed = tooltipItems[0].parsed.y;
              const completed = tooltipItems[1].parsed.y;
              const completionRate = committed > 0 ? ((completed / committed) * 100).toFixed(1) : '0';
              return [`Completion Rate: ${completionRate}%`];
            }
            return [];
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
          text: 'Sprints',
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
  }), []);

  if (!chartData || data.length === 0) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-md">
          <div className="text-center text-gray-500">
            <Icon name="bar-chart" className="h-8 w-8 mx-auto mb-2" />
            <p className="font-medium">No velocity data available</p>
            <p className="text-sm mt-1">Complete some sprints to see velocity trends</p>
          </div>
        </div>
      </div>
    );
  }

  // Calculate average velocity and trend
  const averageVelocity = data.reduce((sum, item) => sum + item.completedPoints, 0) / data.length;
  const recentVelocity = data.slice(-3).reduce((sum, item) => sum + item.completedPoints, 0) / Math.min(3, data.length);
  const isImproving = recentVelocity > averageVelocity;

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      {/* Chart Header with Metrics */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Velocity Trends</h3>
        <div className="flex items-center space-x-4">
          {/* Velocity Trend Indicator */}
          <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            isImproving 
              ? 'bg-green-100 text-green-800' 
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            <Icon 
              name={isImproving ? 'trending-up' : 'trending-down'} 
              className="h-4 w-4 mr-1" 
            />
            {isImproving ? 'Improving' : 'Declining'}
          </div>
          
          {/* Average Velocity */}
          <div className="text-sm text-gray-600">
            <span className="font-medium">Avg: {averageVelocity.toFixed(1)}</span> pts/sprint
          </div>
        </div>
      </div>

      {/* Chart Container */}
      <div className="h-64 relative">
        <Bar data={chartData} options={options} />
      </div>

      {/* Chart Summary */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
            <span className="text-gray-600">Committed story points</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span className="text-gray-600">Completed story points</span>
          </div>
          <div className="text-gray-500 text-xs">
            Based on last {data.length} completed sprints
          </div>
        </div>
      </div>
    </div>
  );
});

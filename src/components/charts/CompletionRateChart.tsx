import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
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
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface CompletionTrendData {
  date: string;
  completed: number;
  total: number;
}

interface CompletionRateChartProps {
  completionRate: number;
  completionTrend: CompletionTrendData[];
  totalItems: number;
  completedItems: number;
  className?: string;
}

export const CompletionRateChart: React.FC<CompletionRateChartProps> = React.memo(({
  completionRate,
  completionTrend,
  totalItems,
  completedItems,
  className = ''
}) => {
  const chartData = useMemo(() => {
    if (!completionTrend || completionTrend.length === 0) {
      return null;
    }

    const labels = completionTrend.map(item => {
      const date = new Date(item.date);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    });

    const completionRates = completionTrend.map(item => 
      item.total > 0 ? (item.completed / item.total) * 100 : 0
    );

    return {
      labels,
      datasets: [
        {
          label: 'Completion Rate',
          data: completionRates,
          borderColor: 'rgb(34, 197, 94)', // green-500
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          borderWidth: 3,
          pointBackgroundColor: 'rgb(34, 197, 94)',
          pointBorderColor: 'white',
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8,
          tension: 0.1,
          fill: true,
        },
        {
          label: 'Target (80%)',
          data: completionTrend.map(() => 80),
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
  }, [completionTrend]);

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
        text: 'Completion Rate Trends',
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
            if (label === 'Completion Rate') {
              return `${label}: ${value.toFixed(1)}%`;
            }
            return `${label}: ${value}%`;
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
          text: 'Completion Rate (%)',
          font: {
            size: 12,
            weight: 'bold',
            family: 'Inter, system-ui, sans-serif',
          },
        },
        beginAtZero: true,
        max: 100,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          font: {
            size: 11,
            family: 'Inter, system-ui, sans-serif',
          },
          callback: function(value) {
            return `${value}%`;
          },
        },
      },
    },
  }), []);

  if (!chartData || completionTrend.length === 0) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-md">
          <div className="text-center text-gray-500">
            <Icon name="pie-chart" className="h-8 w-8 mx-auto mb-2" />
            <p className="font-medium">No completion data available</p>
            <p className="text-sm mt-1">Complete some work items to see completion trends</p>
          </div>
        </div>
      </div>
    );
  }

  const isOnTarget = completionRate >= 80;
  const remainingItems = totalItems - completedItems;

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      {/* Chart Header with Metrics */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Completion Rate</h3>
        <div className="flex items-center space-x-4">
          {/* Completion Status */}
          <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            isOnTarget 
              ? 'bg-green-100 text-green-800' 
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            <Icon 
              name={isOnTarget ? 'check-circle' : 'alert-circle'} 
              className="h-4 w-4 mr-1" 
            />
            {isOnTarget ? 'On Target' : 'Below Target'}
          </div>
          
          {/* Current Rate */}
          <div className="text-sm text-gray-600">
            <span className="font-medium">{completionRate.toFixed(1)}%</span> completed
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>{completedItems} completed</span>
          <span>{remainingItems} remaining</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-green-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${completionRate}%` }}
          ></div>
        </div>
      </div>

      {/* Chart Container */}
      <div className="h-64 relative">
        <Line data={chartData} options={options} />
      </div>

      {/* Chart Summary */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span className="text-gray-600">Actual completion rate</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-0.5 bg-gray-400 mr-2" style={{ borderTop: '2px dashed' }}></div>
            <span className="text-gray-600">Target completion rate (80%)</span>
          </div>
          <div className="text-gray-500 text-xs">
            {totalItems} total items • {completedItems} completed
          </div>
        </div>
      </div>
    </div>
  );
});
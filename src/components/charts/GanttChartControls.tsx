import React from 'react';
import { Icon } from '../common/Icon';
import { Button } from '../ui/button';

interface GanttChartControlsProps {
  showCriticalPath: boolean;
  onShowCriticalPathChange: (show: boolean) => void;
  showMilestones: boolean;
  onShowMilestonesChange: (show: boolean) => void;
  timeScale: 'day' | 'week' | 'month';
  onTimeScaleChange: (scale: 'day' | 'week' | 'month') => void;
  criticalPathDuration: number;
  hasCriticalPath: boolean;
}

export const GanttChartControls: React.FC<GanttChartControlsProps> = React.memo(({
  showCriticalPath,
  onShowCriticalPathChange,
  showMilestones,
  onShowMilestonesChange,
  timeScale,
  onTimeScaleChange,
  criticalPathDuration,
  hasCriticalPath
}) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center space-x-4">
        <h3 className="text-lg font-semibold text-gray-900">Gantt Chart</h3>
        
        {/* Critical Path Info */}
        {hasCriticalPath && (
          <div className="flex items-center px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
            <Icon name="trending-up" className="h-4 w-4 mr-1" />
            Critical Path: {criticalPathDuration} days
          </div>
        )}
      </div>

      <div className="flex items-center space-x-3">
        {/* Time Scale Selector */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Scale:</span>
          <select
            value={timeScale}
            onChange={(e) => onTimeScaleChange(e.target.value as 'day' | 'week' | 'month')}
            className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="day">Day</option>
            <option value="week">Week</option>
            <option value="month">Month</option>
          </select>
        </div>

        {/* Toggle Controls */}
        <Button
          variant={showCriticalPath ? "primary" : "secondary"}
          size="sm"
          onClick={() => onShowCriticalPathChange(!showCriticalPath)}
        >
          <Icon name="trending-up" className="h-4 w-4 mr-1" />
          Critical Path
        </Button>

        <Button
          variant={showMilestones ? "primary" : "secondary"}
          size="sm"
          onClick={() => onShowMilestonesChange(!showMilestones)}
        >
          <Icon name="target" className="h-4 w-4 mr-1" />
          Milestones
        </Button>
      </div>
    </div>
  );
});
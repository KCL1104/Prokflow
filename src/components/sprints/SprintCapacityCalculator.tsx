import React, { useState, useEffect, useCallback } from 'react';
import { Icon, type IconName } from '../common/Icon';
<<<<<<< HEAD
import { Button } from '../common/Button';
=======
import { Button } from '../ui/button';
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
import { sprintService } from '../../services';

interface SprintCapacityCalculatorProps {
  projectId: string;
  onCapacityCalculated?: (capacity: number) => void;
  className?: string;
}

interface VelocityData {
  sprintName: string;
  completedPoints: number;
  sprintNumber: number;
}

export const SprintCapacityCalculator: React.FC<SprintCapacityCalculatorProps> = ({
  projectId,
  onCapacityCalculated,
  className = ''
}) => {
  const [calculating, setCalculating] = useState(false);
  const [capacity, setCapacity] = useState<number | null>(null);
  const [velocityHistory, setVelocityHistory] = useState<VelocityData[]>([]);
  const [error, setError] = useState<string | null>(null);

  const calculateCapacity = useCallback(async () => {
    setCalculating(true);
    setError(null);
    
    try {
      const calculatedCapacity = await sprintService.calculateSprintCapacity(projectId);
      setCapacity(calculatedCapacity);
      onCapacityCalculated?.(calculatedCapacity);
      
      // TODO: Fetch velocity history for display
      // This would require additional service methods to get historical sprint data
      setVelocityHistory([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to calculate capacity');
      setCapacity(20); // Default fallback
      onCapacityCalculated?.(20);
    } finally {
      setCalculating(false);
    }
  }, [projectId, onCapacityCalculated]);

  useEffect(() => {
    calculateCapacity();
  }, [calculateCapacity]);

  const getCapacityRecommendation = (): {
    type: 'warning' | 'info' | 'success';
    message: string;
    icon: IconName;
  } | null => {
    if (!capacity) return null;
    
    if (capacity < 10) {
      return {
        type: 'warning',
        message: 'Low capacity detected. Consider adding team members or reducing scope.',
        icon: 'alert-triangle'
      };
    } else if (capacity > 50) {
      return {
        type: 'info',
        message: 'High capacity detected. Ensure work items are properly estimated.',
        icon: 'info'
      };
    } else {
      return {
        type: 'success',
        message: 'Capacity looks good based on team velocity.',
        icon: 'check-circle'
      };
    }
  };

  const recommendation = getCapacityRecommendation();

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Sprint Capacity Calculator</h3>
        <Button
          variant="secondary"
<<<<<<< HEAD
          size="small"
=======
          size="sm"
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
          onClick={calculateCapacity}
          disabled={calculating}
          loading={calculating}
        >
          <Icon name="refresh" className="h-4 w-4 mr-1" />
          Recalculate
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
          <div className="flex items-center">
            <Icon name="alert-circle" className="h-5 w-5 text-red-400 mr-2" />
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        </div>
      )}

      {capacity !== null && (
        <div className="space-y-4">
          {/* Calculated Capacity */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-900">Recommended Capacity</p>
                <p className="text-2xl font-bold text-blue-900">{capacity}</p>
                <p className="text-sm text-blue-700">story points</p>
              </div>
              <Icon name="target" className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          {/* Recommendation */}
          {recommendation && (
            <div className={`border rounded-md p-4 ${
              recommendation.type === 'warning' 
                ? 'bg-yellow-50 border-yellow-200' 
                : recommendation.type === 'info'
                ? 'bg-blue-50 border-blue-200'
                : 'bg-green-50 border-green-200'
            }`}>
              <div className="flex items-start">
                <Icon 
                  name={recommendation.icon} 
                  className={`h-5 w-5 mr-2 mt-0.5 ${
                    recommendation.type === 'warning' 
                      ? 'text-yellow-600' 
                      : recommendation.type === 'info'
                      ? 'text-blue-600'
                      : 'text-green-600'
                  }`} 
                />
                <p className={`text-sm ${
                  recommendation.type === 'warning' 
                    ? 'text-yellow-800' 
                    : recommendation.type === 'info'
                    ? 'text-blue-800'
                    : 'text-green-800'
                }`}>
                  {recommendation.message}
                </p>
              </div>
            </div>
          )}

          {/* Calculation Method */}
          <div className="text-sm text-gray-600">
            <p className="font-medium mb-2">How is this calculated?</p>
            <ul className="space-y-1 text-xs">
              <li className="flex items-start">
                <Icon name="dot" className="h-3 w-3 text-gray-400 mr-1 mt-0.5" />
                Based on average velocity from the last 3 completed sprints
              </li>
              <li className="flex items-start">
                <Icon name="dot" className="h-3 w-3 text-gray-400 mr-1 mt-0.5" />
                Adjusted for team capacity and working days
              </li>
              <li className="flex items-start">
                <Icon name="dot" className="h-3 w-3 text-gray-400 mr-1 mt-0.5" />
                Minimum capacity of 10 story points applied
              </li>
            </ul>
          </div>

          {/* Velocity History (if available) */}
          {velocityHistory.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-900 mb-2">Recent Velocity</p>
              <div className="space-y-2">
                {velocityHistory.map((sprint) => (
                  <div key={sprint.sprintNumber} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{sprint.sprintName}</span>
                    <span className="font-medium">{sprint.completedPoints} points</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
<<<<<<< HEAD
};
=======
};
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)

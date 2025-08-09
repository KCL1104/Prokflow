import React, { useState, useCallback } from 'react';
<<<<<<< HEAD
import { Button } from '../common/Button';
=======
import { Button } from '../ui/button';
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
import { Modal } from '../common/Modal';
import type { WorkItem } from '../../types';
interface EstimationValidationResult {
  isValid: boolean;
  error?: string;
  estimate?: number;
}

interface EstimationModalProps {
  isOpen: boolean;
  onClose: () => void;
  workItem: WorkItem | null;
  onSubmit: (estimate: number) => Promise<void>;
}

// Common story point values using Fibonacci sequence
const STORY_POINT_OPTIONS = [
  { value: 0, label: '0', description: 'No effort required' },
  { value: 0.5, label: '½', description: 'Minimal effort' },
  { value: 1, label: '1', description: 'Very small' },
  { value: 2, label: '2', description: 'Small' },
  { value: 3, label: '3', description: 'Medium-small' },
  { value: 5, label: '5', description: 'Medium' },
  { value: 8, label: '8', description: 'Large' },
  { value: 13, label: '13', description: 'Very large' },
  { value: 21, label: '21', description: 'Extra large' },
  { value: 34, label: '34', description: 'Too large - consider breaking down' },
  { value: -1, label: '?', description: 'Unknown - needs more information' }
] as const;

// Threshold for large story warning
const LARGE_STORY_THRESHOLD = 21;

export const EstimationModal: React.FC<EstimationModalProps> = ({
  isOpen,
  onClose,
  workItem,
  onSubmit
}) => {
  const [selectedEstimate, setSelectedEstimate] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customEstimate, setCustomEstimate] = useState('');
  const [useCustom, setUseCustom] = useState(false);
  const [error, setError] = useState<string | null>(null);
  React.useEffect(() => {
    if (workItem?.estimate !== undefined) {
      const existingOption = STORY_POINT_OPTIONS.find(option => option.value === workItem.estimate);
      if (existingOption) {
        setSelectedEstimate(workItem.estimate);
        setUseCustom(false);
      } else {
        setCustomEstimate(workItem.estimate.toString());
        setUseCustom(true);
      }
    } else {
      setSelectedEstimate(null);
      setCustomEstimate('');
      setUseCustom(false);
    }
  }, [workItem]);

  const validateEstimate = useCallback((): EstimationValidationResult => {
    if (useCustom) {
      const estimate = parseFloat(customEstimate);
      if (isNaN(estimate) || estimate < 0) {
        return { isValid: false, error: 'Please enter a valid positive number for the estimate' };
      }
      if (estimate > 1000) {
        return { isValid: false, error: 'Estimate cannot exceed 1000 points' };
      }
      return { isValid: true, estimate };
    } else {
      if (selectedEstimate === null) {
        return { isValid: false, error: 'Please select a story point estimate' };
      }
      return { isValid: true, estimate: selectedEstimate };
    }
  }, [useCustom, customEstimate, selectedEstimate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateEstimate();
    if (!validation.isValid) {
      setError(validation.error || 'Invalid estimate');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit(validation.estimate!);
      handleClose();
    } catch (error) {
      console.error('Failed to update estimate:', error);
      setError(error instanceof Error ? error.message : 'Failed to update estimate');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedEstimate(null);
    setCustomEstimate('');
    setUseCustom(false);
    setError(null);
    onClose();
  };

  if (!workItem) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Estimate Story Points"
      size="medium"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Work item info */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">{workItem.title}</h4>
          {workItem.description && (
            <p className="text-sm text-gray-600 line-clamp-3">{workItem.description}</p>
          )}
          {workItem.estimate !== undefined && (
            <p className="text-sm text-blue-600 mt-2">
              Current estimate: {workItem.estimate} points
            </p>
          )}
        </div>

        {/* Estimation method toggle */}
        <div className="flex items-center space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              checked={!useCustom}
              onChange={() => setUseCustom(false)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              disabled={isSubmitting}
            />
            <span className="ml-2 text-sm text-gray-700">Standard story points</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              checked={useCustom}
              onChange={() => setUseCustom(true)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              disabled={isSubmitting}
            />
            <span className="ml-2 text-sm text-gray-700">Custom estimate</span>
          </label>
        </div>

        {/* Standard story points */}
        {!useCustom && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Story Points
            </label>
            <div className="grid grid-cols-3 gap-3">
              {STORY_POINT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setSelectedEstimate(option.value)}
                  disabled={isSubmitting}
                  className={`relative p-4 border rounded-lg text-center transition-colors ${selectedEstimate === option.value
                    ? 'border-blue-600 bg-blue-50 text-blue-900'
                    : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                    } ${option.value >= LARGE_STORY_THRESHOLD ? 'border-orange-300 bg-orange-50' : ''}`}
                >
                  <div className="text-2xl font-bold mb-1">{option.label}</div>
                  <div className="text-xs text-gray-600">{option.description}</div>
                  {option.value >= LARGE_STORY_THRESHOLD && (
                    <div className="absolute top-1 right-1">
                      <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
            {selectedEstimate !== null && selectedEstimate >= LARGE_STORY_THRESHOLD && (
              <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-md">
                <div className="flex">
                  <svg className="w-5 h-5 text-orange-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div className="text-sm text-orange-800">
                    <p className="font-medium">Large story detected</p>
                    <p>Consider breaking this story into smaller, more manageable pieces for better estimation accuracy and faster delivery.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Custom estimate */}
        {useCustom && (
          <div>
            <label htmlFor="customEstimate" className="block text-sm font-medium text-gray-700 mb-1">
              Custom Estimate
            </label>
            <input
              type="number"
              id="customEstimate"
              value={customEstimate}
              onChange={(e) => {
                setCustomEstimate(e.target.value);
<<<<<<< HEAD
                if (error) setError(null); // Clear error when user starts typing
              }}
              min="0"
=======
              }}
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
              step="0.5"
              placeholder="Enter story points"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isSubmitting}
            />
            <p className="mt-1 text-sm text-gray-500">
              Enter a custom story point value (e.g., 1.5, 7, 10)
            </p>
          </div>
        )}

        {/* Estimation guidelines */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h5 className="font-medium text-blue-900 mb-2">Estimation Guidelines</h5>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Consider complexity, effort, and uncertainty</li>
            <li>• Compare with previously estimated stories</li>
            <li>• Include testing and review time</li>
            <li>• Use team's historical velocity as reference</li>
            <li>• When in doubt, estimate higher or break down the story</li>
          </ul>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex">
              <svg className="w-5 h-5 text-red-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div className="text-sm text-red-800">
                <p>{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
            loading={isSubmitting}
          >
            Save Estimate
          </Button>
        </div>
      </form>
    </Modal>
  );
<<<<<<< HEAD
};
=======
};
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)

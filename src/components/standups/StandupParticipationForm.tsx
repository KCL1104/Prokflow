import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Loading } from '../common/Loading';
import { Icon } from '../common/Icon';
import type { StandupParticipation, CreateStandupParticipationRequest, UpdateStandupParticipationRequest } from '../../types';

interface StandupParticipationFormProps {
  standupId: string;
  existingParticipation?: StandupParticipation | null;
  onSubmit: (data: CreateStandupParticipationRequest | { id: string; data: UpdateStandupParticipationRequest }) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
  readOnly?: boolean;
}

export const StandupParticipationForm: React.FC<StandupParticipationFormProps> = ({
  standupId,
  existingParticipation,
  onSubmit,
  onCancel,
  loading = false,
  readOnly = false
}) => {
  const [formData, setFormData] = useState({
    yesterday: '',
    today: '',
    blockers: '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = useState(false);

  // Initialize form with existing participation data
  useEffect(() => {
    if (existingParticipation) {
      setFormData({
        yesterday: existingParticipation.yesterday,
        today: existingParticipation.today,
        blockers: existingParticipation.blockers,
      });
    }
  }, [existingParticipation]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.yesterday.trim()) {
      newErrors.yesterday = 'Please describe what you did yesterday';
    }

    if (!formData.today.trim()) {
      newErrors.today = 'Please describe what you plan to do today';
    }

    // Blockers are optional, but if provided should not be empty
    if (formData.blockers && !formData.blockers.trim()) {
      newErrors.blockers = 'Please provide details about your blockers or leave empty';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      if (existingParticipation) {
        // Update existing participation
        await onSubmit({
          id: existingParticipation.id,
          data: {
            yesterday: formData.yesterday.trim(),
            today: formData.today.trim(),
            blockers: formData.blockers.trim(),
            status: 'submitted',
          }
        });
      } else {
        // Create new participation
        await onSubmit({
          standupId,
          yesterday: formData.yesterday.trim(),
          today: formData.today.trim(),
          blockers: formData.blockers.trim(),
        });
      }
      setIsDirty(false);
    } catch (error) {
      console.error('Error submitting standup participation:', error);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSkip = async () => {
    if (existingParticipation) {
      try {
        await onSubmit({
          id: existingParticipation.id,
          data: { status: 'skipped' }
        });
      } catch (error) {
        console.error('Error skipping standup:', error);
      }
    }
  };

  const isSubmitted = existingParticipation?.status === 'submitted';
  const isSkipped = existingParticipation?.status === 'skipped';

  return (
    <div className="space-y-6">
      {/* Status indicator */}
      {existingParticipation && (
        <div className="flex items-center space-x-2">
          {isSubmitted && (
            <div className="flex items-center text-green-600">
              <Icon name="check-circle" className="h-5 w-5 mr-2" />
              <span className="text-sm font-medium">Submitted</span>
            </div>
          )}
          {isSkipped && (
            <div className="flex items-center text-gray-600">
              <Icon name="minus" className="h-5 w-5 mr-2" />
              <span className="text-sm font-medium">Skipped</span>
            </div>
          )}
          {existingParticipation.status === 'pending' && (
            <div className="flex items-center text-yellow-600">
              <Icon name="clock" className="h-5 w-5 mr-2" />
              <span className="text-sm font-medium">Pending</span>
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Yesterday */}
        <div>
          <label htmlFor="yesterday" className="block text-sm font-medium text-gray-700 mb-2">
            <Icon name="calendar" className="h-4 w-4 inline mr-1" />
            What did you accomplish yesterday?
          </label>
          <textarea
            id="yesterday"
            value={formData.yesterday}
            onChange={(e) => handleInputChange('yesterday', e.target.value)}
            placeholder="Describe what you worked on and completed yesterday..."
            rows={3}
            disabled={readOnly}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
          />
          {errors.yesterday && (
            <p className="mt-1 text-sm text-red-600">{errors.yesterday}</p>
          )}
        </div>

        {/* Today */}
        <div>
          <label htmlFor="today" className="block text-sm font-medium text-gray-700 mb-2">
            <Icon name="target" className="h-4 w-4 inline mr-1" />
            What will you work on today?
          </label>
          <textarea
            id="today"
            value={formData.today}
            onChange={(e) => handleInputChange('today', e.target.value)}
            placeholder="Describe your plans and goals for today..."
            rows={3}
            disabled={readOnly}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
          />
          {errors.today && (
            <p className="mt-1 text-sm text-red-600">{errors.today}</p>
          )}
        </div>

        {/* Blockers */}
        <div>
          <label htmlFor="blockers" className="block text-sm font-medium text-gray-700 mb-2">
            <Icon name="alert-triangle" className="h-4 w-4 inline mr-1" />
            Any blockers or impediments? (Optional)
          </label>
          <textarea
            id="blockers"
            value={formData.blockers}
            onChange={(e) => handleInputChange('blockers', e.target.value)}
            placeholder="Describe any obstacles, dependencies, or help you need..."
            rows={2}
            disabled={readOnly}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
          />
          {errors.blockers && (
            <p className="mt-1 text-sm text-red-600">{errors.blockers}</p>
          )}
        </div>

        {/* Guidelines */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Standup Tips</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Be specific about what you accomplished and plan to do</li>
            <li>• Mention any work items, tasks, or features by name</li>
            <li>• Highlight blockers that need team attention or help</li>
            <li>• Keep it concise but informative</li>
          </ul>
        </div>

        {/* Form Actions */}
        {!readOnly && (
          <div className="flex justify-between pt-6 border-t border-gray-200">
            <div>
              {existingParticipation && !isSkipped && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleSkip}
                  disabled={loading}
                >
                  <Icon name="x" className="h-4 w-4 mr-2" />
                  Skip This Standup
                </Button>
              )}
            </div>
            
            <div className="flex space-x-3">
              {onCancel && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onCancel}
                  disabled={loading}
                >
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                disabled={loading || (!isDirty && isSubmitted)}
              >
                {loading ? (
                  <>
                    <Loading size="small" />
                    {existingParticipation ? 'Updating...' : 'Submitting...'}
                  </>
                ) : (
                  <>
                    <Icon name="check" className="h-4 w-4 mr-2" />
                    {existingParticipation ? 'Update' : 'Submit'} Standup
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Submission info */}
        {existingParticipation?.submittedAt && (
          <div className="text-sm text-gray-500 text-center pt-2">
            {isSubmitted ? 'Submitted' : 'Last updated'} on{' '}
            {existingParticipation.submittedAt.toLocaleDateString()} at{' '}
            {existingParticipation.submittedAt.toLocaleTimeString()}
          </div>
        )}
      </form>
    </div>
  );
};

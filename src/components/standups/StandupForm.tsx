import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Loading } from '../common/Loading';
import { Icon } from '../common/Icon';
import { useTeamMembers } from '../../hooks/useTeamMembers';
import { useAuth } from '../../hooks/useAuth';
import type { CreateStandupRequest } from '../../types';

interface StandupFormProps {
  projectId: string;
  sprintId?: string;
  onSubmit: (data: CreateStandupRequest) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export const StandupForm: React.FC<StandupFormProps> = ({
  projectId,
  sprintId,
  onSubmit,
  onCancel,
  loading = false
}) => {
  const { user } = useAuth();
  const { teamMembers, loading: membersLoading } = useTeamMembers(projectId);
  
  const [formData, setFormData] = useState({
    scheduledDate: '',
    scheduledTime: '',
    participants: [] as string[],
    facilitatorId: user?.id || '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.scheduledDate) {
      newErrors.scheduledDate = 'Scheduled date is required';
    }

    if (!formData.scheduledTime) {
      newErrors.scheduledTime = 'Scheduled time is required';
    }

    if (formData.participants.length === 0) {
      newErrors.participants = 'At least one participant is required';
    }

    if (!formData.facilitatorId) {
      newErrors.facilitatorId = 'Facilitator is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const scheduledDateTime = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`);
      
      await onSubmit({
        projectId,
        sprintId,
        scheduledDate: scheduledDateTime,
        participants: formData.participants,
        facilitatorId: formData.facilitatorId,
      });
    } catch (error) {
      console.error('Error creating standup:', error);
    }
  };

  const handleParticipantToggle = (userId: string) => {
    setFormData(prev => ({
      ...prev,
      participants: prev.participants.includes(userId)
        ? prev.participants.filter(id => id !== userId)
        : [...prev.participants, userId]
    }));
  };

  const selectAllParticipants = () => {
    setFormData(prev => ({
      ...prev,
      participants: teamMembers.map(member => member.userId)
    }));
  };

  const clearAllParticipants = () => {
    setFormData(prev => ({
      ...prev,
      participants: []
    }));
  };

  if (membersLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loading size="large" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" data-testid="standup-form">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Scheduled Date */}
        <div>
          <label htmlFor="scheduledDate" className="block text-sm font-medium text-gray-700 mb-1">
            Scheduled Date
          </label>
          <input
            type="date"
            id="scheduledDate"
            value={formData.scheduledDate}
            onChange={(e) => setFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            min={new Date().toISOString().split('T')[0]}
          />
          {errors.scheduledDate && (
            <p className="mt-1 text-sm text-red-600">{errors.scheduledDate}</p>
          )}
        </div>

        {/* Scheduled Time */}
        <div>
          <label htmlFor="scheduledTime" className="block text-sm font-medium text-gray-700 mb-1">
            Scheduled Time
          </label>
          <input
            type="time"
            id="scheduledTime"
            value={formData.scheduledTime}
            onChange={(e) => setFormData(prev => ({ ...prev, scheduledTime: e.target.value }))}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.scheduledTime && (
            <p className="mt-1 text-sm text-red-600">{errors.scheduledTime}</p>
          )}
        </div>
      </div>

      {/* Facilitator */}
      <div>
        <label htmlFor="facilitator" className="block text-sm font-medium text-gray-700 mb-1">
          Facilitator
        </label>
        <select
          id="facilitator"
          value={formData.facilitatorId}
          onChange={(e) => setFormData(prev => ({ ...prev, facilitatorId: e.target.value }))}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Select facilitator</option>
          {teamMembers.map(member => (
            <option key={member.userId} value={member.userId}>
              {member.user.fullName || member.user.email}
            </option>
          ))}
        </select>
        {errors.facilitatorId && (
          <p className="mt-1 text-sm text-red-600">{errors.facilitatorId}</p>
        )}
      </div>

      {/* Participants */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-gray-700">
            Participants ({formData.participants.length} selected)
          </label>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={selectAllParticipants}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Select All
            </button>
            <button
              type="button"
              onClick={clearAllParticipants}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Clear All
            </button>
          </div>
        </div>
        
        <div className="border border-gray-300 rounded-md p-3 max-h-48 overflow-y-auto">
          {teamMembers.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              No team members found
            </p>
          ) : (
            <div className="space-y-2">
              {teamMembers.map(member => (
                <label key={member.userId} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.participants.includes(member.userId)}
                    onChange={() => handleParticipantToggle(member.userId)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <div className="ml-3 flex items-center">
                    {member.user.avatarUrl ? (
                      <img
                        src={member.user.avatarUrl}
                        alt={member.user.fullName || member.user.email}
                        className="h-6 w-6 rounded-full mr-2"
                      />
                    ) : (
                      <div className="h-6 w-6 bg-gray-300 rounded-full flex items-center justify-center mr-2">
                        <Icon name="user" className="h-3 w-3 text-gray-600" />
                      </div>
                    )}
                    <span className="text-sm text-gray-900">
                      {member.user.fullName || member.user.email}
                    </span>
                    <span className="ml-2 text-xs text-gray-500 capitalize">
                      ({member.role})
                    </span>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>
        {errors.participants && (
          <p className="mt-1 text-sm text-red-600">{errors.participants}</p>
        )}
      </div>

      {/* Guidelines */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Standup Guidelines</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Keep it short and focused (15 minutes max)</li>
          <li>• Each participant shares: What did I do yesterday? What will I do today? Any blockers?</li>
          <li>• Focus on progress and impediments, not detailed discussions</li>
          <li>• Take detailed discussions offline after the standup</li>
          <li>• Be punctual and prepared</li>
        </ul>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loading size="small" />
              Creating...
            </>
          ) : (
            <>
              <Icon name="calendar" className="h-4 w-4 mr-2" />
              Schedule Standup
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

import React, { useState } from 'react';
<<<<<<< HEAD
import { Button } from '../common/Button';
=======
import { Button } from '../ui/button';
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
import { Loading } from '../common/Loading';
import type { Project, UpdateProjectRequest } from '../../types';

interface ProjectSettingsProps {
  project: Project;
  onUpdate: (data: UpdateProjectRequest) => Promise<void>;
  isLoading?: boolean;
}

const ESTIMATION_UNITS = [
  { value: 'story_points', label: 'Story Points' },
  { value: 'hours', label: 'Hours' },
  { value: 'days', label: 'Days' }
] as const;

const WORKING_DAYS = [
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
  { value: 0, label: 'Sunday' }
];

export const ProjectSettings: React.FC<ProjectSettingsProps> = ({
  project,
  onUpdate,
  isLoading = false
}) => {
  const [formData, setFormData] = useState({
    name: project.name,
    description: project.description,
    settings: {
      sprintDuration: project.settings.sprintDuration || 14,
      workingDays: project.settings.workingDays,
      timezone: project.settings.timezone,
      estimationUnit: project.settings.estimationUnit,
      wipLimits: project.settings.wipLimits || {}
    }
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

<<<<<<< HEAD
  const handleInputChange = (field: string, value: any) => {
=======
  const handleInputChange = (field: string, value: string | number | number[] | boolean) => {
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

<<<<<<< HEAD
  const handleSettingsChange = (field: string, value: any) => {
=======
  const handleSettingsChange = (field: string, value: string | number | number[] | boolean) => {
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
    setFormData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [field]: value
      }
    }));
    setHasChanges(true);
  };

  const handleWorkingDaysChange = (day: number, checked: boolean) => {
    const newWorkingDays = checked
      ? [...formData.settings.workingDays, day].sort()
      : formData.settings.workingDays.filter(d => d !== day);
    
    handleSettingsChange('workingDays', newWorkingDays);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Project name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Project name must be at least 2 characters';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Project name must be less than 100 characters';
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    if (formData.settings.sprintDuration && (formData.settings.sprintDuration < 1 || formData.settings.sprintDuration > 30)) {
      newErrors.sprintDuration = 'Sprint duration must be between 1 and 30 days';
    }

    if (formData.settings.workingDays.length === 0) {
      newErrors.workingDays = 'At least one working day must be selected';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onUpdate({
        name: formData.name,
        description: formData.description,
        settings: formData.settings
      });
      setHasChanges(false);
    } catch (error) {
      console.error('Settings update error:', error);
    }
  };

  const handleReset = () => {
    setFormData({
      name: project.name,
      description: project.description,
      settings: {
        sprintDuration: project.settings.sprintDuration || 14,
        workingDays: project.settings.workingDays,
        timezone: project.settings.timezone,
        estimationUnit: project.settings.estimationUnit,
        wipLimits: project.settings.wipLimits || {}
      }
    });
    setHasChanges(false);
    setErrors({});
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">Project Settings</h2>
        <p className="mt-1 text-sm text-gray-600">
          Manage your project configuration and preferences.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-base font-medium text-gray-900">Basic Information</h3>
          
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Project Name *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? 'border-red-300' : 'border-gray-300'
              }`}
              disabled={isLoading}
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.description ? 'border-red-300' : 'border-gray-300'
              }`}
              disabled={isLoading}
            />
            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
          </div>
        </div>

        {/* Project Configuration */}
        <div className="space-y-4">
          <h3 className="text-base font-medium text-gray-900">Configuration</h3>
          
          {project.methodology === 'scrum' && (
            <div>
              <label htmlFor="sprintDuration" className="block text-sm font-medium text-gray-700 mb-1">
                Sprint Duration (days)
              </label>
              <input
                type="number"
                id="sprintDuration"
                value={formData.settings.sprintDuration || ''}
<<<<<<< HEAD
                onChange={(e) => handleSettingsChange('sprintDuration', parseInt(e.target.value) || undefined)}
=======
                onChange={(e) => {
                   const value = e.target.value;
                   const parsed = value ? parseInt(value, 10) : 14; // Default to 14 days
                   handleSettingsChange('sprintDuration', parsed);
                 }}
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
                min="1"
                max="30"
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.sprintDuration ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={isLoading}
              />
              {errors.sprintDuration && <p className="mt-1 text-sm text-red-600">{errors.sprintDuration}</p>}
            </div>
          )}

          <div>
            <label htmlFor="estimationUnit" className="block text-sm font-medium text-gray-700 mb-1">
              Estimation Unit
            </label>
            <select
              id="estimationUnit"
              value={formData.settings.estimationUnit}
<<<<<<< HEAD
              onChange={(e) => handleSettingsChange('estimationUnit', e.target.value as any)}
=======
              onChange={(e) => handleSettingsChange('estimationUnit', e.target.value)}
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            >
              {ESTIMATION_UNITS.map((unit) => (
                <option key={unit.value} value={unit.value}>
                  {unit.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Working Days *
            </label>
            <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
              {WORKING_DAYS.map((day) => (
                <label key={day.value} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.settings.workingDays.includes(day.value)}
                    onChange={(e) => handleWorkingDaysChange(day.value, e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    disabled={isLoading}
                  />
                  <span className="text-sm text-gray-700">{day.label}</span>
                </label>
              ))}
            </div>
            {errors.workingDays && <p className="mt-1 text-sm text-red-600">{errors.workingDays}</p>}
          </div>

          <div>
            <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 mb-1">
              Timezone
            </label>
            <input
              type="text"
              id="timezone"
              value={formData.settings.timezone}
              onChange={(e) => handleSettingsChange('timezone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., America/New_York"
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <Button
            type="button"
            variant="secondary"
            onClick={handleReset}
            disabled={isLoading || !hasChanges}
          >
            Reset
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isLoading || !hasChanges}
          >
            {isLoading ? <Loading size="small" /> : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
<<<<<<< HEAD
};
=======
};
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)

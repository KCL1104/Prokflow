import React, { useState } from 'react';
<<<<<<< HEAD
import { Button } from '../common/Button';
import { Loading } from '../common/Loading';
import type { ProjectFormData, ValidationErrors } from '../../types/forms';
=======
import { Button } from '../ui/button';
import { Loading } from '../common/Loading';
import type { ProjectFormData, ValidationErrors, ProjectSettings } from '../../types/forms';
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)

interface ProjectFormProps {
  initialData?: Partial<ProjectFormData>;
  onSubmit: (data: ProjectFormData) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  submitLabel?: string;
}

const METHODOLOGY_OPTIONS = [
  { value: 'scrum', label: 'Scrum', description: 'Sprint-based iterative development' },
  { value: 'kanban', label: 'Kanban', description: 'Continuous flow with WIP limits' },
  { value: 'waterfall', label: 'Waterfall', description: 'Sequential phase-based approach' },
  { value: 'custom', label: 'Custom', description: 'Define your own workflow' }
] as const;

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

export const ProjectForm: React.FC<ProjectFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  submitLabel = 'Create Project'
}) => {
  const [formData, setFormData] = useState<ProjectFormData>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    methodology: initialData?.methodology || 'scrum',
    settings: {
      sprintDuration: initialData?.settings?.sprintDuration || 14,
      workingDays: initialData?.settings?.workingDays || [1, 2, 3, 4, 5],
      timezone: initialData?.settings?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      estimationUnit: initialData?.settings?.estimationUnit || 'story_points',
      wipLimits: initialData?.settings?.wipLimits || {}
    }
  });

  const [errors, setErrors] = useState<ValidationErrors<ProjectFormData>>({});

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors<ProjectFormData> = {};

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
      newErrors.settings = 'Sprint duration must be between 1 and 30 days';
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
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

<<<<<<< HEAD
  const handleInputChange = (field: keyof ProjectFormData, value: any) => {
=======
  const handleInputChange = (field: keyof ProjectFormData, value: string | number[] | ProjectSettings) => {
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

<<<<<<< HEAD
  const handleSettingsChange = (field: keyof ProjectFormData['settings'], value: any) => {
=======
  const handleSettingsChange = (field: keyof ProjectFormData['settings'], value: string | number | number[]) => {
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
    setFormData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [field]: value
      }
    }));
  };

  const handleWorkingDaysChange = (day: number, checked: boolean) => {
    const newWorkingDays = checked
      ? [...formData.settings.workingDays, day].sort()
      : formData.settings.workingDays.filter(d => d !== day);
    
    handleSettingsChange('workingDays', newWorkingDays);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
        
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
            placeholder="Enter project name"
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
            placeholder="Describe your project"
            disabled={isLoading}
          />
          {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
        </div>
      </div>

      {/* Methodology Selection */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Methodology</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {METHODOLOGY_OPTIONS.map((option) => (
            <label
              key={option.value}
              className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none ${
                formData.methodology === option.value
                  ? 'border-blue-600 ring-2 ring-blue-600'
                  : 'border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="methodology"
                value={option.value}
                checked={formData.methodology === option.value}
<<<<<<< HEAD
                onChange={(e) => handleInputChange('methodology', e.target.value as any)}
=======
                onChange={(e) => handleInputChange('methodology', e.target.value)}
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
                className="sr-only"
                disabled={isLoading}
              />
              <div className="flex flex-col">
                <span className="block text-sm font-medium text-gray-900">
                  {option.label}
                </span>
                <span className="block text-sm text-gray-500">
                  {option.description}
                </span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Project Settings */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Project Settings</h3>
        
        {formData.methodology === 'scrum' && (
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
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
            Working Days
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
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          disabled={isLoading}
        >
          {isLoading ? <Loading size="small" /> : submitLabel}
        </Button>
      </div>
    </form>
  );
<<<<<<< HEAD
};
=======
};
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)

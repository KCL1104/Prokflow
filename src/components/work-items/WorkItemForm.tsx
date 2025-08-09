import React, { useState } from 'react';
<<<<<<< HEAD
import { Button } from '../common/Button';
=======
import { Button } from '../ui/button';
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
import { Loading } from '../common/Loading';
import type { WorkItemFormData, ValidationErrors } from '../../types/forms';

interface WorkItemFormProps {
  initialData?: Partial<WorkItemFormData>;
  onSubmit: (data: WorkItemFormData) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  submitLabel?: string;
  projectId: string;
  teamMembers?: Array<{ id: string; userId: string; role: string }>;
}

const WORK_ITEM_TYPES = [
  { value: 'story', label: 'User Story', description: 'A feature from the user perspective' },
  { value: 'task', label: 'Task', description: 'A specific piece of work to be done' },
  { value: 'bug', label: 'Bug', description: 'A defect that needs to be fixed' },
  { value: 'epic', label: 'Epic', description: 'A large feature that spans multiple stories' }
] as const;

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low', color: 'text-gray-600' },
  { value: 'medium', label: 'Medium', color: 'text-yellow-600' },
  { value: 'high', label: 'High', color: 'text-orange-600' },
  { value: 'critical', label: 'Critical', color: 'text-red-600' }
] as const;

export const WorkItemForm: React.FC<WorkItemFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  submitLabel = 'Create Work Item',
  projectId,
  teamMembers = []
}) => {
  const [formData, setFormData] = useState<WorkItemFormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    type: initialData?.type || 'story',
    priority: initialData?.priority || 'medium',
    assigneeId: initialData?.assigneeId || '',
    estimate: initialData?.estimate || undefined,
    labels: initialData?.labels || [],
    dueDate: initialData?.dueDate || '',
    acceptanceCriteria: initialData?.acceptanceCriteria || ''
  });

  const [errors, setErrors] = useState<ValidationErrors<WorkItemFormData>>({});
  const [newLabel, setNewLabel] = useState('');

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors<WorkItemFormData> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    } else if (formData.title.length > 200) {
      newErrors.title = 'Title must be less than 200 characters';
    }

    if (formData.description && formData.description.length > 2000) {
      newErrors.description = 'Description must be less than 2000 characters';
    }

    if (formData.estimate && (formData.estimate < 0 || formData.estimate > 1000)) {
      newErrors.estimate = 'Estimate must be between 0 and 1000';
    }

    if (formData.dueDate) {
      const dueDate = new Date(formData.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (dueDate < today) {
        newErrors.dueDate = 'Due date cannot be in the past';
      }
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
      await onSubmit({
        ...formData,
        projectId,
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : undefined
      });
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

<<<<<<< HEAD
  const handleInputChange = (field: keyof WorkItemFormData, value: any) => {
=======
  const handleInputChange = (field: keyof WorkItemFormData, value: string | number | string[] | Date | undefined) => {
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

  const handleAddLabel = () => {
    if (newLabel.trim() && !formData.labels.includes(newLabel.trim())) {
      setFormData(prev => ({
        ...prev,
        labels: [...prev.labels, newLabel.trim()]
      }));
      setNewLabel('');
    }
  };

  const handleRemoveLabel = (labelToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      labels: prev.labels.filter(label => label !== labelToRemove)
    }));
  };

  const getPriorityColor = (priority: string) => {
    return PRIORITY_OPTIONS.find(p => p.value === priority)?.color || 'text-gray-600';
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Work Item Details</h3>
        
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title *
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
<<<<<<< HEAD
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.title ? 'border-red-300' : 'border-gray-300'
=======
            className={`w-full px-3 py-2 border-2 rounded-md shadow-sm bg-warm-25 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-warm-50 ${
              errors.title ? 'border-red-300' : 'border-default'
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
            }`}
            placeholder="Enter work item title"
            disabled={isLoading}
          />
          {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={4}
<<<<<<< HEAD
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.description ? 'border-red-300' : 'border-gray-300'
=======
            className={`w-full px-3 py-2 border-2 rounded-md shadow-sm bg-warm-25 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-warm-50 ${
              errors.description ? 'border-red-300' : 'border-default'
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
            }`}
            placeholder="Describe the work item"
            disabled={isLoading}
          />
          {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
        </div>

        {formData.type === 'story' && (
          <div>
            <label htmlFor="acceptanceCriteria" className="block text-sm font-medium text-gray-700 mb-1">
              Acceptance Criteria
            </label>
            <textarea
              id="acceptanceCriteria"
              value={formData.acceptanceCriteria}
              onChange={(e) => handleInputChange('acceptanceCriteria', e.target.value)}
              rows={3}
<<<<<<< HEAD
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
=======
              className="w-full px-3 py-2 border-2 border-default rounded-md shadow-sm bg-warm-25 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-warm-50"
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
              placeholder="Define the acceptance criteria for this story"
              disabled={isLoading}
            />
          </div>
        )}
      </div>

      {/* Type and Priority */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type *
          </label>
          <div className="space-y-2">
            {WORK_ITEM_TYPES.map((type) => (
              <label
                key={type.value}
<<<<<<< HEAD
                className={`relative flex cursor-pointer rounded-lg border p-3 focus:outline-none ${
                  formData.type === type.value
                    ? 'border-blue-600 ring-2 ring-blue-600'
                    : 'border-gray-300'
=======
                className={`relative flex cursor-pointer rounded-lg border-2 p-3 bg-warm-25 hover:bg-warm-50 focus:outline-none ${
                  formData.type === type.value
                    ? 'border-primary-500 ring-2 ring-primary-500 bg-warm-100'
                    : 'border-default'
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
                }`}
              >
                <input
                  type="radio"
                  name="type"
                  value={type.value}
                  checked={formData.type === type.value}
<<<<<<< HEAD
                  onChange={(e) => handleInputChange('type', e.target.value as any)}
=======
                  onChange={(e) => handleInputChange('type', e.target.value)}
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
                  className="sr-only"
                  disabled={isLoading}
                />
                <div className="flex flex-col">
                  <span className="block text-sm font-medium text-gray-900">
                    {type.label}
                  </span>
                  <span className="block text-sm text-gray-500">
                    {type.description}
                  </span>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
            Priority
          </label>
          <select
            id="priority"
            value={formData.priority}
<<<<<<< HEAD
            onChange={(e) => handleInputChange('priority', e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
=======
            onChange={(e) => handleInputChange('priority', e.target.value)}
            className="w-full px-3 py-2 border-2 border-default rounded-md shadow-sm bg-warm-25 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-warm-50"
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
            disabled={isLoading}
          >
            {PRIORITY_OPTIONS.map((priority) => (
              <option key={priority.value} value={priority.value}>
                {priority.label}
              </option>
            ))}
          </select>
          <div className={`mt-1 text-sm ${getPriorityColor(formData.priority)}`}>
            Current priority: {PRIORITY_OPTIONS.find(p => p.value === formData.priority)?.label}
          </div>
        </div>
      </div>

      {/* Assignment and Estimation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="assigneeId" className="block text-sm font-medium text-gray-700 mb-1">
            Assignee
          </label>
          <select
            id="assigneeId"
            value={formData.assigneeId}
            onChange={(e) => handleInputChange('assigneeId', e.target.value)}
<<<<<<< HEAD
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
=======
            className="w-full px-3 py-2 border-2 border-default rounded-md shadow-sm bg-warm-25 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-warm-50"
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
            disabled={isLoading}
          >
            <option value="">Unassigned</option>
            {teamMembers.map((member) => (
              <option key={member.userId} value={member.userId}>
                User {member.userId.slice(0, 8)}... ({member.role})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="estimate" className="block text-sm font-medium text-gray-700 mb-1">
            Estimate
          </label>
          <input
            type="number"
            id="estimate"
            value={formData.estimate || ''}
            onChange={(e) => handleInputChange('estimate', e.target.value ? parseFloat(e.target.value) : undefined)}
            min="0"
            step="0.5"
<<<<<<< HEAD
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.estimate ? 'border-red-300' : 'border-gray-300'
=======
            className={`w-full px-3 py-2 border-2 rounded-md shadow-sm bg-warm-25 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-warm-50 ${
              errors.estimate ? 'border-red-300' : 'border-default'
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
            }`}
            placeholder="Story points / hours"
            disabled={isLoading}
          />
          {errors.estimate && <p className="mt-1 text-sm text-red-600">{errors.estimate}</p>}
        </div>
      </div>

      {/* Due Date */}
      <div>
        <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
          Due Date
        </label>
        <input
          type="date"
          id="dueDate"
          value={formData.dueDate}
          onChange={(e) => handleInputChange('dueDate', e.target.value)}
<<<<<<< HEAD
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.dueDate ? 'border-red-300' : 'border-gray-300'
=======
          className={`w-full px-3 py-2 border-2 rounded-md shadow-sm bg-warm-25 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-warm-50 ${
            errors.dueDate ? 'border-red-300' : 'border-default'
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
          }`}
          disabled={isLoading}
        />
        {errors.dueDate && <p className="mt-1 text-sm text-red-600">{errors.dueDate}</p>}
      </div>

      {/* Labels */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Labels
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {formData.labels.map((label) => (
            <span
              key={label}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
            >
              {label}
              <button
                type="button"
                onClick={() => handleRemoveLabel(label)}
                className="ml-1 text-blue-600 hover:text-blue-800"
                disabled={isLoading}
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="flex space-x-2">
          <input
            type="text"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddLabel())}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Add a label"
            disabled={isLoading}
          />
          <Button
            type="button"
            variant="secondary"
            onClick={handleAddLabel}
            disabled={isLoading || !newLabel.trim()}
          >
            Add
          </Button>
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

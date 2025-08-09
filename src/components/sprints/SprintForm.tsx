import React, { useState, useEffect, useCallback } from 'react';
<<<<<<< HEAD
import { Button } from '../common/Button';
=======
import { Button } from '../ui/button';
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
import { Modal } from '../common/Modal';
import { Icon } from '../common/Icon';
import { sprintService } from '../../services';
import type { CreateSprintRequest, UpdateSprintRequest, Sprint } from '../../types';

interface SprintFormProps {
  projectId: string;
  sprint?: Sprint;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (sprint: Sprint) => void;
}

interface SprintFormData {
  name: string;
  goal: string;
  startDate: string;
  endDate: string;
  capacity?: number;
}

interface ValidationErrors {
  name?: string;
  goal?: string;
  startDate?: string;
  endDate?: string;
  capacity?: string;
}

export const SprintForm: React.FC<SprintFormProps> = ({
  projectId,
  sprint,
  isOpen,
  onClose,
  onSubmit
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [calculatedCapacity, setCalculatedCapacity] = useState<number | null>(null);
  const [errors, setErrors] = useState<ValidationErrors>({});

  const [formData, setFormData] = useState<SprintFormData>({
    name: sprint?.name || '',
    goal: sprint?.goal || '',
    startDate: sprint?.startDate ? sprint.startDate.toISOString().split('T')[0] : '',
    endDate: sprint?.endDate ? sprint.endDate.toISOString().split('T')[0] : '',
    capacity: sprint?.capacity
  });

  // Reset form data when sprint changes
  useEffect(() => {
    if (sprint) {
      setFormData({
        name: sprint.name,
        goal: sprint.goal,
        startDate: sprint.startDate.toISOString().split('T')[0],
        endDate: sprint.endDate.toISOString().split('T')[0],
        capacity: sprint.capacity
      });
    } else {
      setFormData({
        name: '',
        goal: '',
        startDate: '',
        endDate: '',
        capacity: undefined
      });
    }
    setErrors({});
  }, [sprint]);

  const calculateCapacity = useCallback(async () => {
    try {
      const capacity = await sprintService.calculateSprintCapacity(projectId);
      setCalculatedCapacity(capacity);
      if (!formData.capacity) {
        setFormData(prev => ({ ...prev, capacity }));
      }
    } catch (error) {
      console.warn('Failed to calculate capacity:', error);
      setCalculatedCapacity(20); // Default fallback
      if (!formData.capacity) {
        setFormData(prev => ({ ...prev, capacity: 20 }));
      }
    }
  }, [formData.capacity, projectId]);

  // Calculate capacity when form opens
  useEffect(() => {
    if (isOpen && !sprint) {
      calculateCapacity();
    }
  }, [isOpen, sprint, calculateCapacity]);

  // Validate date range
  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (start >= end) {
        setErrors(prev => ({
          ...prev,
          endDate: 'End date must be after start date'
        }));
      } else {
        setErrors(prev => ({
          ...prev,
          endDate: undefined
        }));
      }
    }
  }, [formData.startDate, formData.endDate]);

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Sprint name is required';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Sprint name must be less than 100 characters';
    }

    if (formData.goal && formData.goal.length > 500) {
      newErrors.goal = 'Sprint goal must be less than 500 characters';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }

    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (start >= end) {
        newErrors.endDate = 'End date must be after start date';
      }
    }

    if (formData.capacity && (formData.capacity < 1 || formData.capacity > 1000)) {
      newErrors.capacity = 'Capacity must be between 1 and 1000';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof SprintFormData, value: string | number | undefined) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const sprintData = {
        projectId,
        name: formData.name,
        goal: formData.goal,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
        capacity: formData.capacity || calculatedCapacity || 20
      };

      let result: Sprint;
      if (sprint) {
        // Update existing sprint
        const updateData: UpdateSprintRequest = {
          name: sprintData.name,
          goal: sprintData.goal,
          startDate: sprintData.startDate,
          endDate: sprintData.endDate,
          capacity: sprintData.capacity
        };
        result = await sprintService.updateSprint(sprint.id, updateData);
      } else {
        // Create new sprint
        const createData: CreateSprintRequest = sprintData;
        result = await sprintService.createSprint(createData);
      }

      onSubmit(result);
      onClose();
    } catch (error) {
      console.error('Failed to save sprint:', error);
      // Handle error (could show toast notification)
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateSprintDuration = () => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    }
    return 0;
  };

  const sprintDuration = calculateSprintDuration();
  const isDateRangeValid = formData.startDate && formData.endDate && new Date(formData.startDate) < new Date(formData.endDate);
  const isFormValid = Object.keys(errors).filter(key => errors[key as keyof ValidationErrors]).length === 0 && 
                      formData.name.trim() && 
                      formData.startDate && 
                      formData.endDate;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={sprint ? 'Edit Sprint' : 'Create New Sprint'}
      size="medium"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Sprint Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Sprint Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.name ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="e.g., Sprint 1, Q1 Sprint, Feature Release Sprint"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        {/* Sprint Goal */}
        <div>
          <label htmlFor="goal" className="block text-sm font-medium text-gray-700 mb-1">
            Sprint Goal
          </label>
          <textarea
            id="goal"
            name="goal"
            value={formData.goal}
            onChange={(e) => handleInputChange('goal', e.target.value)}
            rows={3}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.goal ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="What is the main objective of this sprint?"
          />
          {errors.goal && (
            <p className="mt-1 text-sm text-red-600">{errors.goal}</p>
          )}
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
              Start Date *
            </label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={formData.startDate}
              onChange={(e) => handleInputChange('startDate', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.startDate ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.startDate && (
              <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
            )}
          </div>

          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
              End Date *
            </label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={formData.endDate}
              onChange={(e) => handleInputChange('endDate', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.endDate ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.endDate && (
              <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>
            )}
          </div>
        </div>

        {/* Sprint Duration Info */}
        {isDateRangeValid && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <div className="flex items-center">
              <Icon name="calendar" className="h-4 w-4 text-blue-600 mr-2" />
              <span className="text-sm text-blue-800">
                Sprint duration: {sprintDuration} days
              </span>
            </div>
          </div>
        )}

        {/* Capacity */}
        <div>
          <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-1">
            Sprint Capacity (Story Points)
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              id="capacity"
              name="capacity"
              value={formData.capacity || ''}
              onChange={(e) => handleInputChange('capacity', e.target.value ? parseInt(e.target.value) : undefined)}
              min="1"
              max="1000"
              className={`flex-1 px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.capacity ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Auto-calculated based on team velocity"
            />
            <Button
              type="button"
              variant="secondary"
<<<<<<< HEAD
              size="small"
=======
              size="sm"
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
              onClick={calculateCapacity}
              disabled={isSubmitting}
            >
              <Icon name="refresh" className="h-4 w-4" />
            </Button>
          </div>
          {calculatedCapacity && (
            <p className="mt-1 text-sm text-gray-600">
              Suggested capacity based on team velocity: {calculatedCapacity} story points
            </p>
          )}
          {errors.capacity && (
            <p className="mt-1 text-sm text-red-600">{errors.capacity}</p>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!isFormValid || isSubmitting || !isDateRangeValid}
            loading={isSubmitting}
          >
            {sprint ? 'Update Sprint' : 'Create Sprint'}
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

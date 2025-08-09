import React, { useState } from 'react';
import { useTeamMembers } from '../../hooks/useTeamMembers';
import { Button } from '../ui/button';
import type { CreateRetrospectiveActionItemRequest } from '../../types';

interface ActionItemFormProps {
  retrospectiveId: string;
  projectId?: string;
  onSubmit: (data: CreateRetrospectiveActionItemRequest) => void;
  onCancel: () => void;
}

export const ActionItemForm: React.FC<ActionItemFormProps> = ({
  retrospectiveId,
  projectId,
  onSubmit,
  onCancel
}) => {
  const { teamMembers } = useTeamMembers(projectId);
  const [formData, setFormData] = useState<CreateRetrospectiveActionItemRequest>({
    retrospectiveId,
    title: '',
    description: '',
    assigneeId: '',
    priority: 'medium',
    dueDate: undefined
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: keyof CreateRetrospectiveActionItemRequest, value: string | Date | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit({
        ...formData,
        title: formData.title.trim(),
        description: formData.description?.trim() || undefined,
        assigneeId: formData.assigneeId || undefined,
        dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined
      });
      
      // Reset form
      setFormData({
        retrospectiveId,
        title: '',
        description: '',
        assigneeId: '',
        priority: 'medium',
        dueDate: undefined
      });
      setErrors({});
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
          Action Item Title *
        </label>
        <input
          type="text"
          id="title"
          value={formData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.title ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder="Enter action item title"
        />
        {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          rows={3}
          placeholder="Provide additional details about this action item..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="assigneeId" className="block text-sm font-medium text-gray-700 mb-2">
            Assignee
          </label>
          <select
            id="assigneeId"
            value={formData.assigneeId}
            onChange={(e) => handleInputChange('assigneeId', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Unassigned</option>
            {teamMembers.map((member) => (
              <option key={member.userId} value={member.userId}>
                {member.user?.fullName || member.user?.email}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
            Priority
          </label>
          <select
            id="priority"
            value={formData.priority}
            onChange={(e) => handleInputChange('priority', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div>
          <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-2">
            Due Date
          </label>
          <input
            type="date"
            id="dueDate"
            value={formData.dueDate ? new Date(formData.dueDate).toISOString().slice(0, 10) : ''}
            onChange={(e) => handleInputChange('dueDate', e.target.value ? new Date(e.target.value) : undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button type="submit">
          Add Action Item
        </Button>
      </div>
    </form>
  );
};

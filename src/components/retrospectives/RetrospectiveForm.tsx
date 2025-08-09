import React, { useState, useEffect } from 'react';
import { useRetrospectives } from '../../hooks/useRetrospectives';
import { useTeamMembers } from '../../hooks/useTeamMembers';
import { useSprints } from '../../hooks/useSprints';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/button';

import { Loading } from '../common/Loading';
import type { CreateRetrospectiveRequest, RetrospectiveTemplate } from '../../types';

interface RetrospectiveFormProps {
  projectId?: string;
  initialData?: Partial<CreateRetrospectiveRequest>;
  onSubmit: (data: CreateRetrospectiveRequest) => void;
  onCancel: () => void;
}

export const RetrospectiveForm: React.FC<RetrospectiveFormProps> = ({
  projectId,
  initialData,
  onSubmit,
  onCancel
}) => {
  const { user } = useAuth();
  const { templates, templatesLoading } = useRetrospectives();
  const { teamMembers } = useTeamMembers(projectId);
  const { sprints } = useSprints(projectId);
  
  const [formData, setFormData] = useState<CreateRetrospectiveRequest>({
    projectId: projectId || '',
    sprintId: '',
    title: '',
    facilitatorId: user?.id || '',
    participants: [],
    templateId: '',
    scheduledDate: undefined,
    ...initialData
  });

  const [selectedTemplate, setSelectedTemplate] = useState<RetrospectiveTemplate | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (formData.templateId && templates.length > 0) {
      const template = templates.find(t => t.id === formData.templateId);
      setSelectedTemplate(template || null);
    }
  }, [formData.templateId, templates]);

  const handleInputChange = (field: keyof CreateRetrospectiveRequest, value: string | Date | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleParticipantToggle = (userId: string) => {
    setFormData(prev => ({
      ...prev,
      participants: prev.participants?.includes(userId)
        ? prev.participants.filter(id => id !== userId)
        : [...(prev.participants || []), userId]
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.sprintId) {
      newErrors.sprintId = 'Sprint is required';
    }

    if (!formData.facilitatorId) {
      newErrors.facilitatorId = 'Facilitator is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const completedSprints = sprints.filter(sprint => sprint.status === 'completed');

  if (templatesLoading) {
    return <Loading />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Retrospective Title *
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.title ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Enter retrospective title"
          />
          {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
        </div>

        <div>
          <label htmlFor="sprintId" className="block text-sm font-medium text-gray-700 mb-2">
            Sprint *
          </label>
          <select
            id="sprintId"
            value={formData.sprintId}
            onChange={(e) => handleInputChange('sprintId', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.sprintId ? 'border-red-300' : 'border-gray-300'
            }`}
          >
            <option value="">Select a sprint</option>
            {completedSprints.map((sprint) => (
              <option key={sprint.id} value={sprint.id}>
                {sprint.name} ({new Date(sprint.endDate).toLocaleDateString()})
              </option>
            ))}
          </select>
          {errors.sprintId && <p className="mt-1 text-sm text-red-600">{errors.sprintId}</p>}
        </div>

        <div>
          <label htmlFor="facilitatorId" className="block text-sm font-medium text-gray-700 mb-2">
            Facilitator *
          </label>
          <select
            id="facilitatorId"
            value={formData.facilitatorId}
            onChange={(e) => handleInputChange('facilitatorId', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.facilitatorId ? 'border-red-300' : 'border-gray-300'
            }`}
          >
            <option value="">Select facilitator</option>
            {teamMembers.map((member) => (
              <option key={member.userId} value={member.userId}>
                {member.user?.fullName || member.user?.email}
              </option>
            ))}
          </select>
          {errors.facilitatorId && <p className="mt-1 text-sm text-red-600">{errors.facilitatorId}</p>}
        </div>

        <div>
          <label htmlFor="scheduledDate" className="block text-sm font-medium text-gray-700 mb-2">
            Scheduled Date
          </label>
          <input
            type="datetime-local"
            id="scheduledDate"
            value={formData.scheduledDate ? new Date(formData.scheduledDate).toISOString().slice(0, 16) : ''}
            onChange={(e) => handleInputChange('scheduledDate', e.target.value ? new Date(e.target.value) : undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label htmlFor="templateId" className="block text-sm font-medium text-gray-700 mb-2">
          Retrospective Template
        </label>
        <select
          id="templateId"
          value={formData.templateId}
          onChange={(e) => handleInputChange('templateId', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select a template (optional)</option>
          {templates.map((template) => (
            <option key={template.id} value={template.id}>
              {template.name}
            </option>
          ))}
        </select>
        {selectedTemplate && (
          <div className="mt-2 p-3 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-600 mb-2">{selectedTemplate.description}</p>
            <div className="flex flex-wrap gap-2">
              {selectedTemplate.categories.map((category, index) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs rounded-full text-white"
                  style={{ backgroundColor: category.color }}
                >
                  {category.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Participants
        </label>
        <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded-md p-3">
          {teamMembers.map((member) => (
            <label key={member.userId} className="flex items-center">
              <input
                type="checkbox"
                checked={formData.participants?.includes(member.userId) || false}
                onChange={() => handleParticipantToggle(member.userId)}
                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">
                {member.user?.fullName || member.user?.email}
              </span>
            </label>
          ))}
        </div>
        <p className="mt-1 text-sm text-gray-500">
          {formData.participants?.length || 0} participant(s) selected
        </p>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button type="submit">
          Create Retrospective
        </Button>
      </div>
    </form>
  );
};

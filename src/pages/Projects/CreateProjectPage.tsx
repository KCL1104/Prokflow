import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProjectForm } from '../../components/projects';
import { projectService } from '../../services/projectService';
import type { ProjectFormData } from '../../types/forms';

export const CreateProjectPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateProject = async (formData: ProjectFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const project = await projectService.createProject({
        name: formData.name,
        description: formData.description,
        methodology: formData.methodology,
        settings: formData.settings
      });

      // Navigate to the new project dashboard
      navigate(`/projects/${project.id}`);
    } catch (err) {
      console.error('Failed to create project:', err);
      setError(err instanceof Error ? err.message : 'Failed to create project');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/projects');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create New Project</h1>
          <p className="mt-2 text-gray-600">
            Set up a new project with your preferred methodology and configuration.
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error creating project</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white shadow rounded-lg p-6">
          <ProjectForm
            onSubmit={handleCreateProject}
            onCancel={handleCancel}
            isLoading={isLoading}
            submitLabel="Create Project"
          />
        </div>
      </div>
    </div>
  );
};
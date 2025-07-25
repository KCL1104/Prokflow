import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ProjectDashboard, 
  ProjectSettings, 
  TeamMemberManagement 
} from '../../components/projects';
import { Button } from '../../components/common';
import { projectService } from '../../services/projectService';
import type { Project, ProjectMetrics, UpdateProjectRequest } from '../../types';

type TabType = 'overview' | 'settings' | 'team';

export const ProjectDetailPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  
  const [project, setProject] = useState<Project | null>(null);
  const [metrics] = useState<ProjectMetrics | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) {
      navigate('/projects');
      return;
    }

    loadProject();
  }, [projectId, navigate]);

  const loadProject = async () => {
    if (!projectId) return;

    setIsLoading(true);
    setError(null);

    try {
      const projectData = await projectService.getProject(projectId);
      setProject(projectData);
      
      // TODO: Load project metrics when metrics service is implemented
      // const metricsData = await metricsService.getProjectMetrics(projectId);
      // setMetrics(metricsData);
    } catch (err) {
      console.error('Failed to load project:', err);
      setError(err instanceof Error ? err.message : 'Failed to load project');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProject = async (data: UpdateProjectRequest) => {
    if (!project) return;

    try {
      const updatedProject = await projectService.updateProject(project.id, data);
      setProject(updatedProject);
    } catch (err) {
      console.error('Failed to update project:', err);
      throw err; // Re-throw to let the component handle the error
    }
  };

  const handleAddTeamMember = async (userId: string, role: string) => {
    if (!project) return;

    try {
      await projectService.addTeamMember(project.id, userId, role);
      await loadProject(); // Reload to get updated team members
    } catch (err) {
      console.error('Failed to add team member:', err);
      throw err;
    }
  };

  const handleRemoveTeamMember = async (userId: string) => {
    if (!project) return;

    try {
      await projectService.removeTeamMember(project.id, userId);
      await loadProject(); // Reload to get updated team members
    } catch (err) {
      console.error('Failed to remove team member:', err);
      throw err;
    }
  };

  const handleUpdateTeamMemberRole = async (userId: string, role: string) => {
    if (!project) return;

    try {
      await projectService.updateTeamMemberRole(project.id, userId, role);
      await loadProject(); // Reload to get updated team members
    } catch (err) {
      console.error('Failed to update team member role:', err);
      throw err;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error loading project</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error || 'Project not found'}</p>
                </div>
                <div className="mt-4">
                  <Button
                    variant="secondary"
                    onClick={() => navigate('/projects')}
                  >
                    Back to Projects
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
    { id: 'team', label: 'Team', icon: '👥' }
  ] as const;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="secondary"
                onClick={() => navigate('/projects')}
              >
                ← Back to Projects
              </Button>
              <h1 className="text-xl font-semibold text-gray-900">{project.name}</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <ProjectDashboard
            project={project}
            metrics={metrics || undefined}
            isLoading={false}
          />
        )}

        {activeTab === 'settings' && (
          <ProjectSettings
            project={project}
            onUpdate={handleUpdateProject}
            isLoading={false}
          />
        )}

        {activeTab === 'team' && (
          <TeamMemberManagement
            project={project}
            onAddMember={handleAddTeamMember}
            onRemoveMember={handleRemoveTeamMember}
            onUpdateMemberRole={handleUpdateTeamMemberRole}
            isLoading={false}
          />
        )}
      </div>
    </div>
  );
};
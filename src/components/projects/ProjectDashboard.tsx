import React from 'react';
import type { Project, ProjectMetrics } from '../../types';

interface ProjectDashboardProps {
  project: Project;
  metrics?: ProjectMetrics;
  isLoading?: boolean;
}

export const ProjectDashboard: React.FC<ProjectDashboardProps> = ({
  project,
  metrics,
  isLoading = false
}) => {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const getMethodologyBadgeColor = (methodology: string) => {
    switch (methodology) {
      case 'scrum':
        return 'bg-blue-100 text-blue-800';
      case 'kanban':
        return 'bg-green-100 text-green-800';
      case 'waterfall':
        return 'bg-purple-100 text-purple-800';
      case 'custom':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const completionRate = metrics 
    ? Math.round((metrics.completedWorkItems / metrics.totalWorkItems) * 100) || 0
    : 0;

  if (isLoading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg">
      {/* Project Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
            {project.description && (
              <p className="mt-1 text-sm text-gray-600">{project.description}</p>
            )}
            <div className="mt-2 flex items-center space-x-4">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getMethodologyBadgeColor(project.methodology)}`}>
                {project.methodology.charAt(0).toUpperCase() + project.methodology.slice(1)}
              </span>
              <span className="text-sm text-gray-500">
                Created {formatDate(project.createdAt)}
              </span>
              <span className="text-sm text-gray-500">
                {project.teamMembers.length} team member{project.teamMembers.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="px-6 py-4">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Project Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-900">Total Work Items</p>
                <p className="text-2xl font-semibold text-blue-900">
                  {metrics?.totalWorkItems || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-900">Completed</p>
                <p className="text-2xl font-semibold text-green-900">
                  {metrics?.completedWorkItems || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-yellow-900">Completion Rate</p>
                <p className="text-2xl font-semibold text-yellow-900">
                  {completionRate}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-purple-900">Avg Cycle Time</p>
                <p className="text-2xl font-semibold text-purple-900">
                  {metrics?.averageCycleTime ? `${Math.round(metrics.averageCycleTime)}d` : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Team Members */}
      <div className="px-6 py-4 border-t border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Team Members</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {project.teamMembers.map((member) => (
            <div key={member.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  User {member.userId.slice(0, 8)}
                </p>
                <p className="text-sm text-gray-500 capitalize">{member.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Project Settings Summary */}
      <div className="px-6 py-4 border-t border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Estimation Unit:</span>
            <span className="ml-2 text-gray-600 capitalize">
              {project.settings.estimationUnit.replace('_', ' ')}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Timezone:</span>
            <span className="ml-2 text-gray-600">{project.settings.timezone}</span>
          </div>
          {project.methodology === 'scrum' && project.settings.sprintDuration && (
            <div>
              <span className="font-medium text-gray-700">Sprint Duration:</span>
              <span className="ml-2 text-gray-600">{project.settings.sprintDuration} days</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
import React from 'react';
<<<<<<< HEAD

export const ReportsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Reports & Analytics
        </h1>
        <p className="text-gray-600 mb-4">
          Project metrics, burndown charts, and team analytics will be displayed here.
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <p className="text-blue-800 text-sm">
            🚧 This page is under construction. Reporting functionality will be added in upcoming tasks.
          </p>
        </div>
      </div>
=======
import { useParams } from 'react-router-dom';
import { AnalyticsDashboard } from '../../components/reports/AnalyticsDashboard';

export const ReportsPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();

  if (!projectId) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Reports & Analytics
          </h1>
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <p className="text-yellow-800 text-sm">
              Please select a project to view analytics and reports.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AnalyticsDashboard projectId={projectId} />
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
    </div>
  );
};
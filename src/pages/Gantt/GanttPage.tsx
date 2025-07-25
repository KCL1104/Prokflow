import React from 'react';

export const GanttPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Gantt Chart
        </h1>
        <p className="text-gray-600 mb-4">
          Timeline and dependency visualization will be implemented here.
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <p className="text-blue-800 text-sm">
            🚧 This page is under construction. Gantt chart functionality will be added in upcoming tasks.
          </p>
        </div>
      </div>
    </div>
  );
};
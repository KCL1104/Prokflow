import React from 'react';

export const SettingsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Settings
        </h1>
        <p className="text-gray-600 mb-4">
          User preferences, project settings, and system configuration will be managed here.
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <p className="text-blue-800 text-sm">
            🚧 This page is under construction. Settings functionality will be added in upcoming tasks.
          </p>
        </div>
      </div>
    </div>
  );
};
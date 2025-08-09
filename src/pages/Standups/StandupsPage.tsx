import React from 'react';
import { useParams } from 'react-router-dom';
import { StandupList } from '../../components/standups/StandupList';

export const StandupsPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();

  if (!projectId) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Project not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <StandupList projectId={projectId} />
    </div>
  );
};
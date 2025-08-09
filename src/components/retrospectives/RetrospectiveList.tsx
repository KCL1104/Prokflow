import React, { useState } from 'react';
import { useRetrospectives } from '../../hooks/useRetrospectives';
import { Button } from '../ui/button';
import { Icon } from '../common/Icon';
import { Loading } from '../common/Loading';
import { RetrospectiveForm } from './RetrospectiveForm';
import type { Retrospective, CreateRetrospectiveRequest } from '../../types';

interface RetrospectiveListProps {
  projectId: string;
  onRetrospectiveSelect?: (retrospective: Retrospective) => void;
}

export const RetrospectiveList: React.FC<RetrospectiveListProps> = ({
  projectId,
  onRetrospectiveSelect
}) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const {
    retrospectives,
    retrospectivesLoading,
    retrospectivesError,
    createRetrospective,
    deleteRetrospective
  } = useRetrospectives(projectId);

  const handleCreateRetrospective = async (data: CreateRetrospectiveRequest) => {
    try {
      await createRetrospective({
        ...data,
        projectId
      });
      setShowCreateForm(false);
    } catch (error) {
      console.error('Failed to create retrospective:', error);
    }
  };

  const handleDeleteRetrospective = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this retrospective?')) {
      try {
        await deleteRetrospective(id);
      } catch (error) {
        console.error('Failed to delete retrospective:', error);
      }
    }
  };

  const getStatusColor = (status: Retrospective['status']) => {
    switch (status) {
      case 'draft':
        return 'text-gray-600 bg-gray-100';
      case 'in_progress':
        return 'text-blue-600 bg-blue-100';
      case 'completed':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (retrospectivesLoading) {
    return <Loading />;
  }

  if (retrospectivesError) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">Error loading retrospectives: {retrospectivesError}</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Retrospectives</h2>
        <Button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2"
        >
          <Icon name="plus" size="sm" />
          New Retrospective
        </Button>
      </div>

      {showCreateForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Create New Retrospective</h3>
          <RetrospectiveForm
            onSubmit={handleCreateRetrospective}
            onCancel={() => setShowCreateForm(false)}
          />
        </div>
      )}

      {retrospectives.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Icon name="calendar" size="lg" className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No retrospectives yet</h3>
          <p className="text-gray-600 mb-4">
            Create your first retrospective to gather team feedback and improve your process.
          </p>
          <Button onClick={() => setShowCreateForm(true)}>
            Create Retrospective
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {retrospectives.map((retrospective) => (
            <div
              key={retrospective.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {retrospective.title}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>Sprint ID: {retrospective.sprintId}</span>
                    <span>•</span>
                    <span>Facilitator ID: {retrospective.facilitatorId}</span>
                    {retrospective.scheduledDate && (
                      <>
                        <span>•</span>
                        <span>Scheduled: {formatDate(retrospective.scheduledDate)}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(retrospective.status)}`}>
                    {retrospective.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                <Icon name="users" size="sm" />
                <span>{retrospective.participants?.length || 0} participants</span>
                {retrospective.templateId && (
                  <>
                    <span>•</span>
                    <span>Template ID: {retrospective.templateId}</span>
                  </>
                )}
              </div>

              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  Created {formatDate(retrospective.createdAt)}
                  {retrospective.completedAt && (
                    <span> • Completed {formatDate(retrospective.completedAt)}</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onRetrospectiveSelect?.(retrospective)}
                  >
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteRetrospective(retrospective.id)}
                    className="text-red-600 hover:text-red-700 hover:border-red-300"
                  >
                    <Icon name="trash-2" size="sm" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

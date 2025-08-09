import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  RetrospectiveList, 
  RetrospectiveSession, 
  SprintReview, 
  SprintReviewList 
} from '../../components/retrospectives';
import { Icon } from '../../components/common/Icon';
import type { Retrospective, Sprint } from '../../types';

export const RetrospectivesPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [selectedRetrospective, setSelectedRetrospective] = useState<Retrospective | null>(null);
  const [selectedSprint, setSelectedSprint] = useState<Sprint | null>(null);
  const [activeView, setActiveView] = useState<'retrospectives' | 'reviews'>('retrospectives');

  if (!projectId) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Project ID is required</p>
      </div>
    );
  }

  if (selectedRetrospective) {
    return (
      <RetrospectiveSession
        retrospectiveId={selectedRetrospective.id}
        onClose={() => setSelectedRetrospective(null)}
      />
    );
  }

  if (selectedSprint) {
    return (
      <SprintReview
        sprintId={selectedSprint.id}
        onClose={() => setSelectedSprint(null)}
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-gray-900">Team Collaboration</h1>
          
          {/* View Toggle */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveView('retrospectives')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                activeView === 'retrospectives'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon name="users" className="h-4 w-4" />
              Retrospectives
            </button>
            <button
              onClick={() => setActiveView('reviews')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                activeView === 'reviews'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon name="eye" className="h-4 w-4" />
              Sprint Reviews
            </button>
          </div>
        </div>
        
        <p className="text-gray-600">
          {activeView === 'retrospectives' 
            ? 'Conduct retrospectives to gather team feedback and identify improvements.'
            : 'Review sprint outcomes, completed work, and team performance metrics.'
          }
        </p>
      </div>

      {activeView === 'retrospectives' ? (
        <RetrospectiveList
          projectId={projectId}
          onRetrospectiveSelect={setSelectedRetrospective}
        />
      ) : (
        <SprintReviewList
          projectId={projectId}
          onSprintSelect={setSelectedSprint}
        />
      )}
    </div>
  );
};
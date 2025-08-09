import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Loading } from '../common/Loading';
import { Icon, type IconName } from '../common/Icon';
import { Modal } from '../common/Modal';
import { StandupForm } from './StandupForm';
import { StandupParticipationForm } from './StandupParticipationForm';
import { useStandups, useStandupParticipation } from '../../hooks/useStandups';
import { useAuth } from '../../hooks/useAuth';
import type { Standup, CreateStandupRequest, CreateStandupParticipationRequest, UpdateStandupParticipationRequest } from '../../types';

interface StandupListProps {
  projectId: string;
  sprintId?: string;
}

export const StandupList: React.FC<StandupListProps> = ({
  projectId,
  sprintId
}) => {
  const { user } = useAuth();
  const { standups, loading, error, createStandup, updateStandup, deleteStandup } = useStandups(projectId);
  const { 
    participation, 
    submitParticipation, 
    updateParticipation, 
    fetchUserParticipation 
  } = useStandupParticipation();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedStandup, setSelectedStandup] = useState<Standup | null>(null);
  const [showParticipationForm, setShowParticipationForm] = useState(false);
  const [participationLoading, setParticipationLoading] = useState(false);

  // Filter standups by sprint if sprintId is provided
  const filteredStandups = sprintId 
    ? standups.filter((standup: Standup) => standup.sprintId === sprintId)
    : standups;

  const handleCreateStandup = async (data: CreateStandupRequest) => {
    try {
      await createStandup(data);
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error creating standup:', error);
    }
  };

  const handleStartStandup = async (standup: Standup) => {
    try {
      await updateStandup(standup.id, 'in_progress');
    } catch (error) {
      console.error('Error starting standup:', error);
    }
  };

  const handleCompleteStandup = async (standup: Standup) => {
    try {
      const duration = 15; // Default duration, could be made configurable
      await updateStandup(standup.id, 'completed', undefined, duration);
    } catch (error) {
      console.error('Error completing standup:', error);
    }
  };

  const handleCancelStandup = async (standup: Standup) => {
    if (window.confirm('Are you sure you want to cancel this standup?')) {
      try {
        await updateStandup(standup.id, 'cancelled');
      } catch (error) {
        console.error('Error cancelling standup:', error);
      }
    }
  };

  const handleDeleteStandup = async (standup: Standup) => {
    if (window.confirm('Are you sure you want to delete this standup? This action cannot be undone.')) {
      try {
        await deleteStandup(standup.id);
      } catch (error) {
        console.error('Error deleting standup:', error);
      }
    }
  };

  const handleJoinStandup = async (standup: Standup) => {
    setSelectedStandup(standup);
    setParticipationLoading(true);
    
    try {
      await fetchUserParticipation(standup.id);
      setShowParticipationForm(true);
    } catch (error) {
      console.error('Error fetching participation:', error);
    } finally {
      setParticipationLoading(false);
    }
  };

  const handleSubmitParticipation = async (data: CreateStandupParticipationRequest | { id: string; data: UpdateStandupParticipationRequest }) => {
    try {
      if ('id' in data && data.id) {
        // Update existing participation
        await updateParticipation(data.id, data.data);
      } else {
        // Create new participation
        await submitParticipation(data as CreateStandupParticipationRequest);
      }
      setShowParticipationForm(false);
      setSelectedStandup(null);
    } catch (error) {
      console.error('Error submitting participation:', error);
    }
  };

  const getStatusBadge = (status: Standup['status']) => {
    const badges = {
      scheduled: 'bg-blue-100 text-blue-800 border-blue-200',
      in_progress: 'bg-green-100 text-green-800 border-green-200',
      completed: 'bg-gray-100 text-gray-800 border-gray-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
    };

    const icons: Record<Standup['status'], IconName> = {
      scheduled: 'calendar',
      in_progress: 'play',
      completed: 'check-circle',
      cancelled: 'x',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${badges[status]}`}>
        <Icon name={icons[status]} className="h-3 w-3 mr-1" />
        {status.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  const isUserParticipant = (standup: Standup) => {
    return user && standup.participants.includes(user.id);
  };

  const canManageStandup = (standup: Standup) => {
    return user && (standup.facilitatorId === user.id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loading size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex items-center">
          <Icon name="alert-circle" className="h-5 w-5 text-red-400 mr-2" />
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Daily Standups</h2>
          <p className="text-gray-600 mt-1">
            {sprintId ? 'Sprint standups' : 'Project standups'} and team updates
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Icon name="plus" className="h-4 w-4 mr-2" />
          Schedule Standup
        </Button>
      </div>

      {/* Standups List */}
      {filteredStandups.length === 0 ? (
        <div className="text-center py-12">
          <Icon name="calendar" className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No standups scheduled</h3>
          <p className="text-gray-600 mb-6">
            Schedule your first daily standup to keep the team aligned and track progress.
          </p>
          <Button onClick={() => setShowCreateForm(true)}>
            <Icon name="plus" className="h-4 w-4 mr-2" />
            Schedule First Standup
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredStandups.map((standup: Standup) => (
            <div key={standup.id} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Daily Standup
                    </h3>
                    {getStatusBadge(standup.status)}
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600 space-x-4 mb-3">
                    <div className="flex items-center">
                      <Icon name="calendar" className="h-4 w-4 mr-1" />
                      {standup.scheduledDate.toLocaleDateString()}
                    </div>
                    <div className="flex items-center">
                      <Icon name="clock" className="h-4 w-4 mr-1" />
                      {standup.scheduledDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="flex items-center">
                      <Icon name="users" className="h-4 w-4 mr-1" />
                      {standup.participants.length} participants
                    </div>
                    {standup.duration && (
                      <div className="flex items-center">
                        <Icon name="clock" className="h-4 w-4 mr-1" />
                        {standup.duration} min
                      </div>
                    )}
                  </div>

                  {standup.notes && (
                    <p className="text-sm text-gray-700 mb-3">{standup.notes}</p>
                  )}
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  {/* Participant Actions */}
                  {isUserParticipant(standup) && standup.status !== 'cancelled' && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleJoinStandup(standup)}
                      disabled={participationLoading}
                    >
                      {participationLoading ? (
                        <Loading size="small" />
                      ) : (
                        <>
                          <Icon name="edit" className="h-4 w-4 mr-1" />
                          {standup.status === 'completed' ? 'View' : 'Join'}
                        </>
                      )}
                    </Button>
                  )}

                  {/* Facilitator Actions */}
                  {canManageStandup(standup) && (
                    <>
                      {standup.status === 'scheduled' && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleStartStandup(standup)}
                        >
                          <Icon name="play" className="h-4 w-4 mr-1" />
                          Start
                        </Button>
                      )}

                      {standup.status === 'in_progress' && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleCompleteStandup(standup)}
                        >
                          <Icon name="check" className="h-4 w-4 mr-1" />
                          Complete
                        </Button>
                      )}

                      {(standup.status === 'scheduled' || standup.status === 'in_progress') && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleCancelStandup(standup)}
                        >
                          <Icon name="x" className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                      )}

                      {(standup.status === 'cancelled' || standup.status === 'completed') && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleDeleteStandup(standup)}
                        >
                          <Icon name="delete" className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Standup Modal */}
      <Modal
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        title="Schedule Daily Standup"
        size="large"
      >
        <StandupForm
          projectId={projectId}
          sprintId={sprintId}
          onSubmit={handleCreateStandup}
          onCancel={() => setShowCreateForm(false)}
        />
      </Modal>

      {/* Participation Modal */}
      <Modal
        isOpen={showParticipationForm}
        onClose={() => {
          setShowParticipationForm(false);
          setSelectedStandup(null);
        }}
        title={`Standup - ${selectedStandup?.scheduledDate.toLocaleDateString()}`}
        size="large"
      >
        {selectedStandup && (
          <StandupParticipationForm
            standupId={selectedStandup.id}
            existingParticipation={participation}
            onSubmit={handleSubmitParticipation}
            onCancel={() => {
              setShowParticipationForm(false);
              setSelectedStandup(null);
            }}
            readOnly={selectedStandup.status === 'completed'}
          />
        )}
      </Modal>
    </div>
  );
};

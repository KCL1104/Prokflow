import React, { useState } from 'react';
import { useRetrospective } from '../../hooks/useRetrospectives';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/button';
import { Icon } from '../common/Icon';
import { Loading } from '../common/Loading';
import { FeedbackCard } from './FeedbackCard';
import { ActionItemCard } from './ActionItemCard';
import { FeedbackForm } from './FeedbackForm';
import { ActionItemForm } from './ActionItemForm';
import type { 
  Retrospective, 
  RetrospectiveFeedback, 
  CreateRetrospectiveFeedbackRequest,
  CreateRetrospectiveActionItemRequest
} from '../../types';

interface RetrospectiveSessionProps {
  retrospectiveId: string;
  onClose?: () => void;
}

export const RetrospectiveSession: React.FC<RetrospectiveSessionProps> = ({
  retrospectiveId,
  onClose
}) => {
  const { user } = useAuth();
  const {
    retrospective,
    loading,
    error,
    addFeedback,
    updateFeedback,
    deleteFeedback,
    voteFeedback,
    addActionItem,
    updateActionItem,
    deleteActionItem
  } = useRetrospective(retrospectiveId);

  const [activeTab, setActiveTab] = useState<'feedback' | 'actions'>('feedback');
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [showActionForm, setShowActionForm] = useState(false);
  // const [selectedCategory] = useState<string>(''); // Unused for now

  const handleAddFeedback = async (data: CreateRetrospectiveFeedbackRequest) => {
    try {
      await addFeedback(data);
      setShowFeedbackForm(false);
    } catch (error) {
      console.error('Failed to add feedback:', error);
    }
  };

  const handleAddActionItem = async (data: CreateRetrospectiveActionItemRequest) => {
    try {
      await addActionItem(data);
      setShowActionForm(false);
    } catch (error) {
      console.error('Failed to add action item:', error);
    }
  };

  const handleVote = async (feedbackId: string, increment: boolean) => {
    try {
      await voteFeedback(feedbackId, increment);
    } catch (error) {
      console.error('Failed to vote:', error);
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

  const groupFeedbackByCategory = (feedback: RetrospectiveFeedback[]) => {
    return feedback.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {} as Record<string, RetrospectiveFeedback[]>);
  };

  if (loading) {
    return <Loading />;
  }

  if (error || !retrospective) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">Error loading retrospective: {error}</p>
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>
    );
  }

  const feedbackByCategory = groupFeedbackByCategory(retrospective.feedback || []);
  interface FeedbackCategory {
    name: string;
    description: string;
    color: string;
  }

  const categories: FeedbackCategory[] = [
    { name: 'What Went Well', description: 'Positive aspects', color: '#10B981' },
    { name: 'What Didn\'t Go Well', description: 'Areas for improvement', color: '#F59E0B' },
    { name: 'Action Items', description: 'Things to do', color: '#8B5CF6' }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {retrospective.title}
              </h1>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>Sprint ID: {retrospective.sprintId}</span>
                <span>•</span>
                <span>Facilitator ID: {retrospective.facilitatorId}</span>
                <span>•</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(retrospective.status)}`}>
                  {retrospective.status.replace('_', ' ')}
                </span>
              </div>
            </div>
            {onClose && (
              <Button variant="outline" onClick={onClose}>
                <Icon name="x" size="sm" />
              </Button>
            )}
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('feedback')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'feedback'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Feedback
            </button>
            <button
              onClick={() => setActiveTab('actions')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'actions'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Action Items ({retrospective.actionItems?.length || 0})
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'feedback' && (
            <div className="space-y-6">
              {/* Add Feedback Button */}
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">Team Feedback</h2>
                <Button
                  onClick={() => setShowFeedbackForm(true)}
                  className="flex items-center gap-2"
                >
                  <Icon name="plus" size="sm" />
                  Add Feedback
                </Button>
              </div>

              {/* Feedback Form */}
              {showFeedbackForm && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <FeedbackForm
                    retrospectiveId={retrospectiveId}
                    categories={categories}
                    onSubmit={handleAddFeedback}
                    onCancel={() => setShowFeedbackForm(false)}
                  />
                </div>
              )}

              {/* Feedback Categories */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {categories.map((category: FeedbackCategory) => (
                  <div key={category.name} className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <h3 className="font-medium text-gray-900">{category.name}</h3>
                      <span className="text-sm text-gray-500">
                        ({feedbackByCategory[category.name]?.length || 0})
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">{category.description}</p>
                    
                    <div className="space-y-3">
                      {feedbackByCategory[category.name]?.map((feedback) => (
                        <FeedbackCard
                          key={feedback.id}
                          feedback={feedback}
                          currentUserId={user?.id}
                          onVote={handleVote}
                          onUpdate={updateFeedback}
                          onDelete={deleteFeedback}
                        />
                      )) || (
                        <div className="text-center py-8 text-gray-500 text-sm">
                          No feedback yet
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'actions' && (
            <div className="space-y-6">
              {/* Add Action Item Button */}
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">Action Items</h2>
                <Button
                  onClick={() => setShowActionForm(true)}
                  className="flex items-center gap-2"
                >
                  <Icon name="plus" size="sm" />
                  Add Action Item
                </Button>
              </div>

              {/* Action Item Form */}
              {showActionForm && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <ActionItemForm
                    retrospectiveId={retrospectiveId}
                    onSubmit={handleAddActionItem}
                    onCancel={() => setShowActionForm(false)}
                  />
                </div>
              )}

              {/* Action Items List */}
              <div className="space-y-4">
                {retrospective.actionItems?.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <Icon name="list" size="lg" className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No action items yet</h3>
                    <p className="text-gray-600 mb-4">
                      Add action items to track follow-up tasks from this retrospective.
                    </p>
                    <Button onClick={() => setShowActionForm(true)}>
                      Add Action Item
                    </Button>
                  </div>
                ) : (
                  retrospective.actionItems?.map((actionItem) => (
                    <ActionItemCard
                      key={actionItem.id}
                      actionItem={actionItem}
                      onUpdate={updateActionItem}
                      onDelete={deleteActionItem}
                    />
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

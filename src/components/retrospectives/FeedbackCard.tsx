import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Icon } from '../common/Icon';
import type { RetrospectiveFeedback, UpdateRetrospectiveFeedbackRequest } from '../../types';

interface FeedbackCardProps {
  feedback: RetrospectiveFeedback;
  currentUserId?: string;
  onVote: (feedbackId: string, increment: boolean) => void;
  onUpdate: (id: string, data: UpdateRetrospectiveFeedbackRequest) => void;
  onDelete: (id: string) => void;
}

export const FeedbackCard: React.FC<FeedbackCardProps> = ({
  feedback,
  currentUserId,
  onVote,
  onUpdate,
  onDelete
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(feedback.content);

  const isOwner = currentUserId === feedback.userId;

  const handleSaveEdit = () => {
    if (editContent.trim() !== feedback.content) {
      onUpdate(feedback.id, { content: editContent.trim() });
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditContent(feedback.content);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this feedback?')) {
      onDelete(feedback.id);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
      {isEditing ? (
        <div className="space-y-3">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={3}
            placeholder="Enter your feedback..."
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancelEdit}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSaveEdit}
              disabled={!editContent.trim()}
            >
              Save
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-start mb-3">
            <p className="text-gray-900 flex-1 mr-3">{feedback.content}</p>
            {isOwner && (
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="p-1"
                  aria-label="Edit feedback"
                >
                  <Icon name="edit" size="sm" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDelete}
                  className="p-1 text-red-600 hover:text-red-700"
                  aria-label="Delete feedback"
                >
                  <Icon name="trash-2" size="sm" />
                </Button>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>{new Date(feedback.createdAt).toLocaleDateString()}</span>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onVote(feedback.id, true)}
                className="flex items-center gap-1 px-2 py-1 text-gray-600 hover:text-blue-600"
                aria-label="Vote for this feedback"
              >
                <Icon name="plus" size="sm" />
                <span className="text-xs">{feedback.votes}</span>
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

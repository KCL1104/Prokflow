import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Icon } from '../common/Icon';
import type { RetrospectiveActionItem, UpdateRetrospectiveActionItemRequest } from '../../types';

interface ActionItemCardProps {
  actionItem: RetrospectiveActionItem;
  onUpdate: (id: string, data: UpdateRetrospectiveActionItemRequest) => void;
  onDelete: (id: string) => void;
}

export const ActionItemCard: React.FC<ActionItemCardProps> = ({
  actionItem,
  onUpdate,
  onDelete
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: actionItem.title,
    description: actionItem.description || '',
    priority: actionItem.priority,
    status: actionItem.status,
    dueDate: actionItem.dueDate ? new Date(actionItem.dueDate).toISOString().slice(0, 10) : ''
  });

  const handleSaveEdit = () => {
    const updateData: UpdateRetrospectiveActionItemRequest = {
      title: editData.title.trim(),
      description: editData.description.trim() || undefined,
      priority: editData.priority,
      status: editData.status,
      dueDate: editData.dueDate ? new Date(editData.dueDate) : undefined
    };

    onUpdate(actionItem.id, updateData);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditData({
      title: actionItem.title,
      description: actionItem.description || '',
      priority: actionItem.priority,
      status: actionItem.status,
      dueDate: actionItem.dueDate ? new Date(actionItem.dueDate).toISOString().slice(0, 10) : ''
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this action item?')) {
      onDelete(actionItem.id);
    }
  };

  const handleStatusChange = (newStatus: RetrospectiveActionItem['status']) => {
    onUpdate(actionItem.id, { status: newStatus });
  };

  const getPriorityColor = (priority: RetrospectiveActionItem['priority']) => {
    switch (priority) {
      case 'low':
        return 'text-green-600 bg-green-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'high':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: RetrospectiveActionItem['status']) => {
    switch (status) {
      case 'open':
        return 'text-blue-600 bg-blue-100';
      case 'in_progress':
        return 'text-yellow-600 bg-yellow-100';
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'cancelled':
        return 'text-gray-600 bg-gray-100';
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

  const isOverdue = actionItem.dueDate && new Date(actionItem.dueDate) < new Date() && actionItem.status !== 'completed';

  return (
    <div className={`bg-white border rounded-lg p-4 ${isOverdue ? 'border-red-200 bg-red-50' : 'border-gray-200'}`}>
      {isEditing ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              value={editData.title}
              onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={editData.description}
              onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                value={editData.priority}
                onChange={(e) => setEditData(prev => ({ ...prev, priority: e.target.value as 'low' | 'medium' | 'high' }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={editData.status}
                onChange={(e) => setEditData(prev => ({ ...prev, status: e.target.value as 'open' | 'in_progress' | 'completed' | 'cancelled' }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={editData.dueDate}
                onChange={(e) => setEditData(prev => ({ ...prev, dueDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

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
              disabled={!editData.title.trim()}
            >
              Save
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 mb-1">{actionItem.title}</h4>
              {actionItem.description && (
                <p className="text-gray-600 text-sm mb-2">{actionItem.description}</p>
              )}
            </div>
            <div className="flex items-center gap-1 ml-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="p-1"
              >
                <Icon name="edit" size="sm" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="p-1 text-red-600 hover:text-red-700"
              >
                <Icon name="trash-2" size="sm" />
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 mb-3">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(actionItem.priority)}`}>
              {actionItem.priority} priority
            </span>
            
            <select
              value={actionItem.status}
              onChange={(e) => handleStatusChange(e.target.value as 'open' | 'in_progress' | 'completed' | 'cancelled')}
              className={`px-2 py-1 rounded-full text-xs font-medium border-0 focus:ring-2 focus:ring-blue-500 ${getStatusColor(actionItem.status)}`}
            >
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            {actionItem.dueDate && (
              <span className={`text-xs ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                Due: {formatDate(actionItem.dueDate)}
                {isOverdue && ' (Overdue)'}
              </span>
            )}
          </div>

          <div className="flex justify-between items-center text-sm text-gray-500">
            <div className="flex items-center gap-2">
              {actionItem.assigneeId && (
                <span>Assigned to: {actionItem.assigneeId}</span>
              )}
            </div>
            <span>Created {formatDate(actionItem.createdAt)}</span>
          </div>
        </>
      )}
    </div>
  );
};

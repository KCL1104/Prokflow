import React, { useState } from 'react';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import type { WorkItem, TeamMember } from '../../types';

interface BulkEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCount: number;
  teamMembers: TeamMember[];
  onSubmit: (updates: Partial<WorkItem>) => Promise<void>;
}

import { PRIORITY_DETAILS, STATUS_DETAILS } from '../../constants/workItemConstants';

const PRIORITY_OPTIONS = [
  { value: '', label: 'No change' },
  ...PRIORITY_DETAILS.map(p => ({ value: p.value, label: p.label }))
];

const STATUS_OPTIONS = [
  { value: '', label: 'No change' },
  ...STATUS_DETAILS.map(s => ({ value: s.value, label: s.label }))
];

export const BulkEditModal: React.FC<BulkEditModalProps> = ({
  isOpen,
  onClose,
  selectedCount,
  teamMembers,
  onSubmit
}) => {
  const [updates, setUpdates] = useState<Partial<WorkItem>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newLabels, setNewLabels] = useState<string[]>([]);
  const [newLabelInput, setNewLabelInput] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const finalUpdates: Partial<WorkItem> = {};

      // Only include fields that have been changed
      if (updates.priority) {
        finalUpdates.priority = updates.priority;
      }
      if (updates.status) {
        finalUpdates.status = updates.status;
      }
      if (updates.assigneeId !== undefined) {
        finalUpdates.assigneeId = updates.assigneeId || undefined;
      }
      if (newLabels.length > 0) {
        finalUpdates.labels = newLabels;
      }

      await onSubmit(finalUpdates);
      handleReset();
    } catch (error) {
      console.error('Bulk edit failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setUpdates({});
    setNewLabels([]);
    setNewLabelInput('');
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleAddLabel = () => {
    if (newLabelInput.trim() && !newLabels.includes(newLabelInput.trim())) {
      setNewLabels(prev => [...prev, newLabelInput.trim()]);
      setNewLabelInput('');
    }
  };

  const handleRemoveLabel = (labelToRemove: string) => {
    setNewLabels(prev => prev.filter(label => label !== labelToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddLabel();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Bulk Edit ${selectedCount} Items`}
      size="medium"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="text-sm text-gray-600 mb-4">
          Make changes to {selectedCount} selected work items. Only fields you modify will be updated.
        </div>

        {/* Priority */}
        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
            Priority
          </label>
          <select
            id="priority"
            value={updates.priority || ''}
            onChange={(e) => setUpdates(prev => ({ 
              ...prev, 
              priority: e.target.value as WorkItem['priority'] || undefined 
            }))}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isSubmitting}
          >
            {PRIORITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            id="status"
            value={updates.status || ''}
            onChange={(e) => setUpdates(prev => ({ 
              ...prev, 
              status: e.target.value || undefined 
            }))}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isSubmitting}
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Assignee */}
        <div>
          <label htmlFor="assignee" className="block text-sm font-medium text-gray-700 mb-1">
            Assignee
          </label>
          <select
            id="assignee"
            value={updates.assigneeId !== undefined ? (updates.assigneeId || '') : 'no-change'}
            onChange={(e) => {
              const value = e.target.value;
              if (value === 'no-change') {
                setUpdates(prev => {
                  const { assigneeId: _, ...rest } = prev;
                  return rest;
                });
              } else {
                setUpdates(prev => ({ 
                  ...prev, 
                  assigneeId: value || undefined 
                }));
              }
            }}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isSubmitting}
          >
            <option value="no-change">No change</option>
            <option value="">Unassigned</option>
            {teamMembers.map((member) => (
              <option key={member.userId} value={member.userId}>
                User {member.userId.slice(0, 8)}... ({member.role})
              </option>
            ))}
          </select>
        </div>

        {/* Labels */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Add Labels
          </label>
          <div className="space-y-2">
            {/* Current labels */}
            {newLabels.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {newLabels.map((label) => (
                  <span
                    key={label}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {label}
                    <button
                      type="button"
                      onClick={() => handleRemoveLabel(label)}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                      disabled={isSubmitting}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
            
            {/* Add new label */}
            <div className="flex space-x-2">
              <input
                type="text"
                value={newLabelInput}
                onChange={(e) => setNewLabelInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Add a label"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isSubmitting}
              />
              <Button
                type="button"
                variant="secondary"
                onClick={handleAddLabel}
                disabled={isSubmitting || !newLabelInput.trim()}
              >
                Add
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              Labels will be added to all selected items (existing labels will be preserved)
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
            loading={isSubmitting}
          >
            Update {selectedCount} Items
          </Button>
        </div>
      </form>
    </Modal>
  );
};
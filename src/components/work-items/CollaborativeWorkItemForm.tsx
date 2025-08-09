import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { CollaborativeTextInput, CollaborativeTextArea } from '../collaboration/CollaborativeTextEditor';
import { CollaborationStatus } from '../collaboration/RealtimeCollaborationProvider';
import { useRealtimeCollaboration } from '../../hooks/useRealtimeCollaboration';
import { useCollaborativeIndicators } from '../../hooks/useCollaborativeEditing';
import { useWorkItemNotifications } from '../../hooks/useNotifications';
import { useAuth } from '../../hooks/useAuth';
import type { WorkItem } from '../../types';

interface CollaborativeWorkItemFormProps {
  workItem?: WorkItem;
  projectId: string;
  onSave: (data: Partial<WorkItem>) => Promise<void>;
  onCancel: () => void;
  className?: string;
}

export function CollaborativeWorkItemForm({
  workItem,
  projectId,
  onSave,
  onCancel,
  className = ''
}: CollaborativeWorkItemFormProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState(() => ({
    title: workItem?.title || '',
    description: workItem?.description || '',
    type: workItem?.type || 'story',
    priority: workItem?.priority || 'medium',
    estimate: workItem?.estimate || 0
  }));
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [initialFormData, setInitialFormData] = useState(formData);
  
  // Update form data when workItem changes
  useEffect(() => {
    const newFormData = {
      title: workItem?.title || '',
      description: workItem?.description || '',
      type: workItem?.type || 'story',
      priority: workItem?.priority || 'medium',
      estimate: workItem?.estimate ?? 0
    };
    
    setFormData(newFormData);
    setInitialFormData(newFormData);
    setHasUnsavedChanges(false);
    
    // Use a microtask to ensure all state updates are processed
    Promise.resolve().then(() => {
      setIsInitialized(true);
    });
  }, [workItem]);

  // Real-time collaboration hooks
  const { connected } = useRealtimeCollaboration();
  const { hasOtherUsers, editingUsers } = useCollaborativeIndicators(workItem?.id || null, projectId);
  const { notifyWorkItemUpdated } = useWorkItemNotifications(projectId, workItem?.id || null);

  // Track form changes (only after initialization)
  useEffect(() => {
    if (!isInitialized) return;
    
    const hasChanges = (
      formData.title !== initialFormData.title ||
      formData.description !== initialFormData.description ||
      formData.type !== initialFormData.type ||
      formData.priority !== initialFormData.priority ||
      formData.estimate !== initialFormData.estimate
    );
    
    setHasUnsavedChanges(hasChanges);
  }, [formData, initialFormData, isInitialized]);

  const handleFieldChange = (field: keyof typeof formData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (isSaving) return;

    setIsSaving(true);
    try {
      await onSave(formData);
      
      // Send notification about the update
      if (workItem && user) {
        const changes = [];
        if (formData.title !== workItem.title) changes.push('title');
        if (formData.description !== workItem.description) changes.push('description');
        if (formData.type !== workItem.type) changes.push('type');
        if (formData.priority !== workItem.priority) changes.push('priority');
        if (formData.estimate !== workItem.estimate) changes.push('estimate');
        
        if (changes.length > 0) {
          notifyWorkItemUpdated(
            formData.title,
            user.full_name || user.email || 'Unknown User',
            changes
          );
        }
      }
      
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Failed to save work item:', error);
      // Re-throw the error so it can be handled by the caller
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const handleAutoSave = async (field: keyof typeof formData, value: string | number) => {
    if (!workItem) return; // Only auto-save for existing items
    
    try {
      await onSave({ [field]: value });
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      {/* Collaboration Status */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">
          {workItem ? 'Edit Work Item' : 'Create Work Item'}
        </h2>
        
        <div className="flex items-center gap-4">
          {hasOtherUsers && (
            <div className="text-sm text-gray-600">
              {editingUsers.length > 0 ? (
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  {editingUsers.length} user{editingUsers.length > 1 ? 's' : ''} editing
                </span>
              ) : (
                <span>Others viewing</span>
              )}
            </div>
          )}
          
          <CollaborationStatus projectId={projectId} workItemId={workItem?.id} />
        </div>
      </div>

      <form onSubmit={async (e) => { e.preventDefault(); await handleSave(); }} className="space-y-6">
        {/* Title Field */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Title *
          </label>
          <CollaborativeTextInput
            workItemId={workItem?.id || null}
            projectId={projectId}
            fieldName="title"
            value={formData.title}
            onChange={(value) => handleFieldChange('title', value)}
            onSave={(value) => handleAutoSave('title', value)}
            placeholder="Enter work item title..."
            className="text-lg font-medium"
            id="title"
          />
        </div>

        {/* Type and Priority Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
              Type
            </label>
            <select
              id="type"
              value={formData.type}
              onChange={(e) => handleFieldChange('type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="story">Story</option>
              <option value="task">Task</option>
              <option value="bug">Bug</option>
              <option value="epic">Epic</option>
            </select>
          </div>

          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <select
              id="priority"
              value={formData.priority}
              onChange={(e) => handleFieldChange('priority', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>

        {/* Estimate Field */}
        <div>
          <label htmlFor="estimate" className="block text-sm font-medium text-gray-700 mb-2">
            Story Points
          </label>
          <input
            type="number"
            id="estimate"
            min="0"
            max="100"
            value={formData.estimate.toString()}
            onChange={(e) => handleFieldChange('estimate', parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Description Field */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <CollaborativeTextArea
            workItemId={workItem?.id || null}
            projectId={projectId}
            fieldName="description"
            value={formData.description}
            onChange={(value) => handleFieldChange('description', value)}
            onSave={(value) => handleAutoSave('description', value)}
            placeholder="Describe the work item..."
            rows={6}
            id="description"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <div className="flex items-center gap-4">
            {isInitialized && hasUnsavedChanges && (
              <span className="text-sm text-yellow-600">
                You have unsaved changes
              </span>
            )}
            
            {!connected && (
              <span className="text-sm text-red-600">
                Real-time features unavailable
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              disabled={isSaving}
            >
              Cancel
            </Button>
            
            <Button
              type="submit"
              variant="primary"
              disabled={isSaving || !formData.title.trim()}
              loading={isSaving}
            >
              {workItem ? 'Update' : 'Create'} Work Item
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

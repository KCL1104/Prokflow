import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ProductBacklog } from '../components/backlog/ProductBacklog';
import { Loading } from '../components/common/Loading';
import { workItemService } from '../services/workItemService';
import { projectService } from '../services/projectService';
import type { WorkItem, TeamMember, WorkItemFormData } from '../types';
import { getErrorMessage } from '../utils';

export const BacklogPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [workItems, setWorkItems] = useState<WorkItem[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;

    const loadBacklogData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [backlogItems, members] = await Promise.all([
          workItemService.getProjectBacklog(projectId),
          projectService.getProjectMembers(projectId)
        ]);

        setWorkItems(backlogItems);
        setTeamMembers(members);
      } catch (err) {
        console.error('Failed to load backlog data:', err);
        const errorMessage = getErrorMessage(err);
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    loadBacklogData();
  }, [projectId]);

  const handleCreateWorkItem = async (data: WorkItemFormData) => {
    if (!projectId) return;

    try {
      const newWorkItem = await workItemService.createWorkItem({
        ...data,
        projectId,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined
      });

      setWorkItems(prev => [newWorkItem, ...prev]);
    } catch (error) {
      console.error('Failed to create work item:', error);
      throw error;
    }
  };

  const handleUpdateWorkItem = async (id: string, updates: Partial<WorkItem>) => {
    try {
      const updatedWorkItem = await workItemService.updateWorkItem(id, updates);
      
      setWorkItems(prev => 
        prev.map(item => item.id === id ? updatedWorkItem : item)
      );
    } catch (error) {
      console.error('Failed to update work item:', error);
      throw error;
    }
  };

  const handleDeleteWorkItem = async (id: string) => {
    try {
      // Note: This would need to be implemented in the service
      // await workItemService.deleteWorkItem(id);
      
      setWorkItems(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error('Failed to delete work item:', error);
      throw error;
    }
  };

  const handleReorderWorkItems = async (workItemIds: string[]) => {
    try {
      // Optimistically update the UI
      const reorderedItems = workItemIds.map(id => 
        workItems.find(item => item.id === id)!
      ).filter(Boolean);
      
      setWorkItems(reorderedItems);

      // Note: This would need to be implemented in the service
      // await workItemService.reorderWorkItems(projectId, workItemIds);
    } catch (error) {
      console.error('Failed to reorder work items:', error);
      // Revert the optimistic update
      const [backlogItems] = await Promise.all([
        workItemService.getProjectBacklog(projectId!)
      ]);
      setWorkItems(backlogItems);
      throw error;
    }
  };

  const handleBulkUpdate = async (workItemIds: string[], updates: Partial<WorkItem>) => {
    try {
      // Update each work item
      const updatePromises = workItemIds.map(id => 
        workItemService.updateWorkItem(id, updates)
      );
      
      const updatedItems = await Promise.all(updatePromises);
      
      // Update the state
      setWorkItems(prev => 
        prev.map(item => {
          const updatedItem = updatedItems.find(updated => updated.id === item.id);
          return updatedItem || item;
        })
      );
    } catch (error) {
      console.error('Failed to bulk update work items:', error);
      throw error;
    }
  };

  if (!projectId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Project Not Found</h1>
          <p className="text-gray-600">The project ID is missing from the URL.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Backlog</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Product Backlog</h1>
          <p className="mt-2 text-gray-600">
            Manage and prioritize your project's work items
          </p>
        </div>

        {isLoading ? (
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-center">
              <Loading />
            </div>
          </div>
        ) : (
          <ProductBacklog
            projectId={projectId}
            workItems={workItems}
            teamMembers={teamMembers}
            onCreateWorkItem={handleCreateWorkItem}
            onUpdateWorkItem={handleUpdateWorkItem}
            onDeleteWorkItem={handleDeleteWorkItem}
            onReorderWorkItems={handleReorderWorkItems}
            onBulkUpdate={handleBulkUpdate}
          />
        )}
      </div>
    </div>
  );
};
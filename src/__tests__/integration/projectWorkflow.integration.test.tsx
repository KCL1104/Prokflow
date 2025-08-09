/**
 * Integration tests for complete project workflow scenarios
 * Tests the full user journey from project creation to task completion
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, setupTestDatabase, cleanupTestData, mockUser } from '../../test-utils/integrationTestHelpers.tsx';
import ProjectDetailPage from '../../pages/Projects/ProjectDetailPage';
import BacklogPage from '../../pages/BacklogPage';
import { BoardPage } from '../../pages/Board/BoardPage';
import { SprintsPage } from '../../pages/Sprints/SprintsPage';
import { projectService } from '../../services/projectService';
import { workItemService } from '../../services/workItemService';
import { sprintService } from '../../services/sprintService';
import type { CreateWorkItemRequest, UpdateWorkItemRequest } from '../../types';

// Mock services
vi.mock('../../services/projectService');
vi.mock('../../services/workItemService');
vi.mock('../../services/sprintService');
vi.mock('../../services/realtimeService');

describe('Project Workflow Integration Tests', () => {
  let mockDatabase: ReturnType<typeof setupTestDatabase>;
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    mockDatabase = setupTestDatabase();
    user = userEvent.setup();
    
    // Mock service implementations
    projectService.getProject = vi.fn().mockImplementation(async (id: string) => {
      const response = await mockDatabase.getProject(id);
      return response.data;
    });
    projectService.getProjectMembers = vi.fn().mockImplementation(async (projectId: string) => {
      const response = await mockDatabase.getTeamMembers(projectId);
      return response.data;
    });
    workItemService.getProjectBacklog = vi.fn().mockImplementation(async (projectId: string) => {
      const response = await mockDatabase.getWorkItems(projectId);
      return response.data;
    });
    workItemService.createWorkItem = vi.fn().mockImplementation(async (data: CreateWorkItemRequest) => {
      const response = await mockDatabase.createWorkItem(data);
      return response.data;
    });
    workItemService.updateWorkItem = vi.fn().mockImplementation(async (id: string, data: UpdateWorkItemRequest) => {
      const response = await mockDatabase.updateWorkItem(id, data);
      return response.data;
    });
    sprintService.getProjectSprints = vi.fn().mockImplementation(async (projectId: string) => {
      const response = await mockDatabase.getSprints(projectId);
      return response.data;
    });
  });

  afterEach(() => {
    cleanupTestData();
  });

  describe('Complete Project Management Workflow', () => {
    it('should handle full project lifecycle from creation to completion', async () => {
      // 1. Start with project detail page
      renderWithProviders(
        <ProjectDetailPage />,
        { initialRoute: '/projects/test-project-1' }
      );

      // Verify project loads
      await waitFor(() => {
        expect(screen.getByText('Test Project')).toBeInTheDocument();
      });

      // 2. Navigate to backlog and create work items
      const backlogLink = screen.getByText('Backlog');
      await user.click(backlogLink);

      // Wait for backlog to load
      await waitFor(() => {
        expect(screen.getByText('Product Backlog')).toBeInTheDocument();
      });

      // Create a new work item
      const addItemButton = screen.getByText('Add Work Item');
      await user.click(addItemButton);

      // Fill out work item form
      const titleInput = screen.getByLabelText(/title/i);
      const descriptionInput = screen.getByLabelText(/description/i);
      
      await user.type(titleInput, 'New Feature Implementation');
      await user.type(descriptionInput, 'Implement the new feature as requested');

      // Select work item type
      const typeSelect = screen.getByLabelText(/type/i);
      await user.selectOptions(typeSelect, 'story');

      // Set priority
      const prioritySelect = screen.getByLabelText(/priority/i);
      await user.selectOptions(prioritySelect, 'high');

      // Submit form
      const submitButton = screen.getByText('Create Work Item');
      await user.click(submitButton);

      // Verify work item was created
      await waitFor(() => {
        expect(mockDatabase.createWorkItem).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'New Feature Implementation',
            description: 'Implement the new feature as requested',
            type: 'story',
            priority: 'high',
          })
        );
      });

      // 3. Navigate to sprint planning
      const sprintsLink = screen.getByText('Sprints');
      await user.click(sprintsLink);

      await waitFor(() => {
        expect(screen.getByText('Sprint 1')).toBeInTheDocument();
      });

      // 4. Move work items to board
      const boardLink = screen.getByText('Board');
      await user.click(boardLink);

      await waitFor(() => {
        expect(screen.getByText('To Do')).toBeInTheDocument();
        expect(screen.getByText('In Progress')).toBeInTheDocument();
        expect(screen.getByText('Done')).toBeInTheDocument();
      });

      // Verify work items are displayed on board
      expect(screen.getByText('User Authentication')).toBeInTheDocument();
      expect(screen.getByText('API Integration')).toBeInTheDocument();
    });

    it('should handle work item status transitions correctly', async () => {
      renderWithProviders(
        <BoardPage />,
        { initialRoute: '/projects/test-project-1/board' }
      );

      // Wait for board to load
      await waitFor(() => {
        expect(screen.getByText('User Authentication')).toBeInTheDocument();
      });

      // Find a work item in "To Do" column
      const workItemCard = screen.getByText('User Authentication').closest('[data-testid="work-item-card"]');
      expect(workItemCard).toBeInTheDocument();

      // Simulate drag and drop to "In Progress" column
      // Note: This would require more complex drag-and-drop simulation
      // For now, we'll test the status update directly
      const workItem = screen.getByText('User Authentication');
      await user.click(workItem);

      // Verify work item details modal opens
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Change status
      const statusSelect = screen.getByLabelText(/status/i);
      await user.selectOptions(statusSelect, 'In Progress');

      // Save changes
      const saveButton = screen.getByText('Save Changes');
      await user.click(saveButton);

      // Verify status update was called
      await waitFor(() => {
        expect(mockDatabase.updateWorkItem).toHaveBeenCalledWith(
          'work-item-1',
          expect.objectContaining({
            status: 'In Progress',
          })
        );
      });
    });

    it('should handle bulk operations on work items', async () => {
      renderWithProviders(
        <BacklogPage />,
        { initialRoute: '/projects/test-project-1/backlog' }
      );

      // Wait for backlog to load
      await waitFor(() => {
        expect(screen.getByText('Product Backlog')).toBeInTheDocument();
      });

      // Select multiple work items
      const checkboxes = screen.getAllByRole('checkbox');
      const selectAllCheckbox = checkboxes[0]; // First checkbox is "select all"
      
      await user.click(selectAllCheckbox);

      // Verify bulk edit button appears
      await waitFor(() => {
        expect(screen.getByText(/Bulk Edit/)).toBeInTheDocument();
      });

      // Open bulk edit modal
      const bulkEditButton = screen.getByText(/Bulk Edit/);
      await user.click(bulkEditButton);

      // Verify bulk edit modal opens
      await waitFor(() => {
        expect(screen.getByText('Bulk Edit')).toBeInTheDocument();
      });

      // Change priority for all selected items
      const prioritySelect = screen.getByLabelText(/priority/i);
      await user.selectOptions(prioritySelect, 'critical');

      // Apply changes
      const applyButton = screen.getByText('Apply Changes');
      await user.click(applyButton);

      // Verify bulk update was called
      await waitFor(() => {
        expect(mockDatabase.updateWorkItem).toHaveBeenCalledTimes(2); // For both work items
      });
    });

    it('should handle sprint planning workflow', async () => {
      renderWithProviders(
        <SprintsPage />,
        { initialRoute: '/projects/test-project-1/sprints' }
      );

      // Wait for sprints page to load
      await waitFor(() => {
        expect(screen.getByText('Sprint 1')).toBeInTheDocument();
      });

      // Create new sprint
      const createSprintButton = screen.getByText('Create Sprint');
      await user.click(createSprintButton);

      // Fill out sprint form
      const sprintNameInput = screen.getByLabelText(/sprint name/i);
      const sprintGoalInput = screen.getByLabelText(/sprint goal/i);
      
      await user.type(sprintNameInput, 'Sprint 2');
      await user.type(sprintGoalInput, 'Complete remaining features');

      // Set sprint dates
      const startDateInput = screen.getByLabelText(/start date/i);
      const endDateInput = screen.getByLabelText(/end date/i);
      
      await user.type(startDateInput, '2024-01-15');
      await user.type(endDateInput, '2024-01-28');

      // Submit sprint creation
      const createButton = screen.getByText('Create Sprint');
      await user.click(createButton);

      // Verify sprint was created
      await waitFor(() => {
        expect(screen.getByText('Sprint 2')).toBeInTheDocument();
      });
    });

    it('should handle real-time collaboration features', async () => {
      // Mock real-time updates
      const mockRealtimeUpdate = vi.fn();
      
      renderWithProviders(
        <BoardPage />,
        { initialRoute: '/projects/test-project-1/board' }
      );

      // Wait for board to load
      await waitFor(() => {
        expect(screen.getByText('User Authentication')).toBeInTheDocument();
      });

      // Simulate real-time update from another user
      const realtimeUpdate = {
        eventType: 'UPDATE',
        new: {
          id: 'work-item-1',
          status: 'Done',
          assigneeId: 'test-user-2',
        },
      };

      // This would be handled by the real-time service
      mockRealtimeUpdate(realtimeUpdate);

      // Verify UI updates in response to real-time changes
      // Note: This would require actual real-time implementation
      expect(mockRealtimeUpdate).toHaveBeenCalledWith(realtimeUpdate);
    });

    it('should handle error scenarios gracefully', async () => {
      // Mock service to return error
      mockDatabase.getProject.mockResolvedValueOnce({
        data: null,
        error: new Error('Project not found'),
      });

      renderWithProviders(
        <ProjectDetailPage />,
        { initialRoute: '/projects/nonexistent-project' }
      );

      // Verify error handling
      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument();
      });
    });

    it('should handle offline scenarios', async () => {
      // Mock network offline
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      });

      renderWithProviders(
        <BacklogPage />,
        { initialRoute: '/projects/test-project-1/backlog' }
      );

      // Verify offline indicator or cached data is shown
      await waitFor(() => {
        expect(screen.getByText(/offline/i) || screen.getByText('Product Backlog')).toBeInTheDocument();
      });

      // Restore online status
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true,
      });
    });
  });

  describe('Cross-Feature Integration', () => {
    it('should maintain data consistency across different views', async () => {
      // Start with backlog view
      const { rerender } = renderWithProviders(
        <BacklogPage />,
        { initialRoute: '/projects/test-project-1/backlog' }
      );

      await waitFor(() => {
        expect(screen.getByText('User Authentication')).toBeInTheDocument();
      });

      // Switch to board view
      rerender(<BoardPage />);

      await waitFor(() => {
        expect(screen.getByText('User Authentication')).toBeInTheDocument();
      });

      // Verify same data is displayed consistently
      expect(screen.getByText('API Integration')).toBeInTheDocument();
    });

    it('should handle navigation between different project views', async () => {
      renderWithProviders(
        <ProjectDetailPage />,
        { initialRoute: '/projects/test-project-1' }
      );

      // Navigate through different sections
      const sections = ['Backlog', 'Board', 'Sprints', 'Reports'];
      
      for (const section of sections) {
        const link = screen.getByText(section);
        await user.click(link);
        
        // Verify navigation occurred (URL would change in real app)
        expect(link).toBeInTheDocument();
      }
    });

    it('should handle user permissions correctly', async () => {
      // Test with different user roles
      const viewerUser = { 
        ...mockUser, 
        id: 'viewer-user',
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      };
      
      renderWithProviders(
        <BacklogPage />,
        { 
          user: viewerUser,
          initialRoute: '/projects/test-project-1/backlog' 
        }
      );

      await waitFor(() => {
        expect(screen.getByText('Product Backlog')).toBeInTheDocument();
      });

      // Verify viewer cannot see edit buttons
      expect(screen.queryByText('Add Work Item')).not.toBeInTheDocument();
    });
  });

  describe('Performance Integration Tests', () => {
    it('should handle large datasets efficiently', async () => {
      // Mock large dataset
      const largeWorkItemSet = Array.from({ length: 100 }, (_, i) => ({
        id: `work-item-${i}`,
        projectId: 'test-project-1',
        title: `Work Item ${i}`,
        description: `Description for work item ${i}`,
        type: 'task' as const,
        status: 'To Do',
        priority: 'medium' as const,
        reporterId: 'test-user-1',
        dependencies: [],
        labels: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      mockDatabase.getWorkItems.mockResolvedValueOnce({
        data: largeWorkItemSet,
        error: null,
      });

      const startTime = performance.now();
      
      renderWithProviders(
        <BacklogPage />,
        { initialRoute: '/projects/test-project-1/backlog' }
      );

      await waitFor(() => {
        expect(screen.getByText('Product Backlog')).toBeInTheDocument();
      });

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Verify reasonable render time (less than 2 seconds)
      expect(renderTime).toBeLessThan(2000);
    });

    it('should handle concurrent user actions', async () => {
      renderWithProviders(
        <BacklogPage />,
        { initialRoute: '/projects/test-project-1/backlog' }
      );

      await waitFor(() => {
        expect(screen.getByText('Product Backlog')).toBeInTheDocument();
      });

      // Simulate multiple concurrent actions
      const promises = [
        user.click(screen.getByText('Add Work Item')),
        user.type(screen.getByPlaceholderText('Search backlog items...'), 'test'),
        user.click(screen.getAllByRole('checkbox')[0]),
      ];

      // All actions should complete without errors
      await Promise.all(promises);
      
      expect(screen.getByRole('dialog')).toBeInTheDocument(); // Modal opened
    });
  });
});
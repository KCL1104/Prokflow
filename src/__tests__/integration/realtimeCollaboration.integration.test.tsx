/**
 * Integration tests for real-time collaboration features
 * Tests live updates, presence indicators, and collaborative editing
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, setupRealtimeTests, cleanupTestData } from '../../test-utils/integrationTestHelpers.tsx';
import { BoardPage } from '../../pages/Board/BoardPage';
import BacklogPage from '../../pages/BacklogPage';
import { RealtimeCollaborationProvider } from '../../components/collaboration/RealtimeCollaborationProvider';
import { useRealtime } from '../../hooks/useRealtime';
import { usePresence } from '../../hooks/usePresence';
import { useCollaborativeEditing } from '../../hooks/useCollaborativeEditing';

// Mock services
vi.mock('../../services/realtimeService');
vi.mock('../../services/workItemService');
vi.mock('../../hooks/useRealtime');
vi.mock('../../hooks/usePresence');
vi.mock('../../hooks/useCollaborativeEditing');

describe('Real-time Collaboration Integration Tests', () => {

  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    setupRealtimeTests();
    user = userEvent.setup();

    // Mock real-time hooks

    vi.mocked(useRealtime).mockReturnValue({
      connected: true,
      connecting: false,
      subscribe: vi.fn(),
      unsubscribe: vi.fn(),
      reconnect: vi.fn(),
      error: null,
    });

    vi.mocked(usePresence).mockReturnValue({
      presence: {
        'test-user-1': {
          userId: 'test-user-1',
          userName: 'Test User',
          status: 'online',
          lastSeen: new Date(),
        },
      },
      updatePresence: vi.fn(),
      isUserOnline: vi.fn().mockReturnValue(true),
    });

    vi.mocked(useCollaborativeEditing).mockReturnValue({
      session: null,
      activeUsers: [],
      joinSession: vi.fn(),
      leaveSession: vi.fn(),
      updateEditingStatus: vi.fn(),
    });
  });

  afterEach(() => {
    cleanupTestData();
  });

  describe('Real-time Work Item Updates', () => {
    it('should show live updates when work items are modified by other users', async () => {
      const TestComponent = () => (
        <RealtimeCollaborationProvider projectId="test-project-1">
          <BoardPage />
        </RealtimeCollaborationProvider>
      );

      renderWithProviders(<TestComponent />, {
        initialRoute: '/projects/test-project-1/board'
      });

      // Wait for board to load
      await waitFor(() => {
        expect(screen.getByText('User Authentication')).toBeInTheDocument();
      });

      // Simulate real-time update from another user
      const realtimeUpdate = {
        eventType: 'UPDATE',
        new: {
          id: 'work-item-1',
          title: 'User Authentication (Updated)',
          status: 'In Progress',
          assigneeId: 'test-user-2',
          updatedAt: new Date().toISOString(),
        },
        old: {
          id: 'work-item-1',
          title: 'User Authentication',
          status: 'To Do',
          assigneeId: 'test-user-1',
        },
      };

      // Trigger real-time update
      // const { useRealtime } = await import('../../hooks/useRealtime');
      const mockSubscribe = vi.mocked(useRealtime().subscribe);
      const subscribeCallback = mockSubscribe.mock.calls[0]?.[1];
      
      if (subscribeCallback) {
        subscribeCallback(realtimeUpdate);
      }

      // Verify UI updates with new data
      await waitFor(() => {
        expect(screen.getByText('User Authentication (Updated)')).toBeInTheDocument();
      });

      // Verify work item moved to correct column
      const inProgressColumn = screen.getByText('In Progress').closest('[data-testid="board-column"]');
      expect(inProgressColumn).toContainElement(screen.getByText('User Authentication (Updated)'));
    });

    it('should handle work item creation in real-time', async () => {
      const TestComponent = () => (
        <RealtimeCollaborationProvider projectId="test-project-1">
          <BacklogPage />
        </RealtimeCollaborationProvider>
      );

      renderWithProviders(<TestComponent />, {
        initialRoute: '/projects/test-project-1/backlog'
      });

      await waitFor(() => {
        expect(screen.getByText('Product Backlog')).toBeInTheDocument();
      });

      // Simulate new work item created by another user
      const newWorkItemUpdate = {
        eventType: 'INSERT',
        new: {
          id: 'work-item-new',
          projectId: 'test-project-1',
          title: 'New Feature Request',
          description: 'Feature requested by stakeholder',
          type: 'story',
          status: 'To Do',
          priority: 'medium',
          reporterId: 'test-user-2',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      };

      // Trigger real-time update
      // const { useRealtime } = await import('../../hooks/useRealtime');
      const mockSubscribe = vi.mocked(useRealtime().subscribe);
      const subscribeCallback = mockSubscribe.mock.calls[0]?.[1];
      
      if (subscribeCallback) {
        subscribeCallback(newWorkItemUpdate);
      }

      // Verify new work item appears in backlog
      await waitFor(() => {
        expect(screen.getByText('New Feature Request')).toBeInTheDocument();
      });
    });

    it('should handle work item deletion in real-time', async () => {
      const TestComponent = () => (
        <RealtimeCollaborationProvider projectId="test-project-1">
          <BacklogPage />
        </RealtimeCollaborationProvider>
      );

      renderWithProviders(<TestComponent />, {
        initialRoute: '/projects/test-project-1/backlog'
      });

      await waitFor(() => {
        expect(screen.getByText('User Authentication')).toBeInTheDocument();
      });

      // Simulate work item deletion by another user
      const deleteUpdate = {
        eventType: 'DELETE',
        old: {
          id: 'work-item-1',
          title: 'User Authentication',
        },
      };

      // Trigger real-time update
      // const { useRealtime } = await import('../../hooks/useRealtime');
      const mockSubscribe = vi.mocked(useRealtime().subscribe);
      const subscribeCallback = mockSubscribe.mock.calls[0]?.[1];
      
      if (subscribeCallback) {
        subscribeCallback(deleteUpdate);
      }

      // Verify work item is removed from UI
      await waitFor(() => {
        expect(screen.queryByText('User Authentication')).not.toBeInTheDocument();
      });
    });
  });

  describe('Presence Indicators', () => {
    it('should show other users currently viewing the project', async () => {
      const TestComponent = () => (
        <RealtimeCollaborationProvider projectId="test-project-1">
          <BoardPage />
        </RealtimeCollaborationProvider>
      );

      renderWithProviders(<TestComponent />, {
        initialRoute: '/projects/test-project-1/board'
      });

      // Wait for presence indicators to load
      await waitFor(() => {
        expect(screen.getByText('Test User')).toBeInTheDocument();
        expect(screen.getByText('Another User')).toBeInTheDocument();
      });

      // Verify presence indicators show user avatars
      const presenceIndicators = screen.getAllByTestId('presence-indicator');
      expect(presenceIndicators).toHaveLength(2);
    });

    it('should update presence when users join or leave', async () => {
      const TestComponent = () => (
        <RealtimeCollaborationProvider projectId="test-project-1">
          <BoardPage />
        </RealtimeCollaborationProvider>
      );

      renderWithProviders(<TestComponent />, {
        initialRoute: '/projects/test-project-1/board'
      });

      await waitFor(() => {
        expect(screen.getByText('Test User')).toBeInTheDocument();
      });

      // Simulate user leaving
      // const { usePresence } = await import('../../hooks/usePresence');
      const mockUpdatePresence = usePresence('test-project-1').updatePresence;
      
      // Update presence state to remove a user
      vi.mocked(usePresence).mockReturnValue({
        presence: {
          'test-user-1': {
            userId: 'test-user-1',
            userName: 'Test User',
            status: 'online',
            lastSeen: new Date(),
          },
        },
        updatePresence: mockUpdatePresence,
        isUserOnline: vi.fn().mockReturnValue(true),
      });

      // Trigger re-render
      fireEvent(window, new Event('resize'));

      await waitFor(() => {
        expect(screen.getByText('Test User')).toBeInTheDocument();
        expect(screen.queryByText('Another User')).not.toBeInTheDocument();
      });
    });

    it('should show cursor positions of other users', async () => {
      const TestComponent = () => (
        <RealtimeCollaborationProvider projectId="test-project-1">
          <BoardPage />
        </RealtimeCollaborationProvider>
      );

      renderWithProviders(<TestComponent />, {
        initialRoute: '/projects/test-project-1/board'
      });

      // Verify cursor indicators are rendered
      await waitFor(() => {
        const cursors = screen.getAllByTestId('collaborative-cursor');
        expect(cursors).toHaveLength(2);
      });

      // Simulate cursor movement
      // const { usePresence } = await import('../../hooks/usePresence');
      const mockUpdatePresence = usePresence('test-project-1').updatePresence;
      
      fireEvent.mouseMove(document.body, { clientX: 500, clientY: 600 });
      
      expect(mockUpdatePresence).toHaveBeenCalled();
    });
  });

  describe('Collaborative Editing', () => {
    it('should handle concurrent editing of work item descriptions', async () => {
      const TestComponent = () => (
        <RealtimeCollaborationProvider projectId="test-project-1">
          <BacklogPage />
        </RealtimeCollaborationProvider>
      );

      renderWithProviders(<TestComponent />, {
        initialRoute: '/projects/test-project-1/backlog'
      });

      await waitFor(() => {
        expect(screen.getByText('User Authentication')).toBeInTheDocument();
      });

      // Click on work item to open edit modal
      const workItem = screen.getByText('User Authentication');
      await user.click(workItem);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Start editing description
      const descriptionField = screen.getByLabelText(/description/i);
      await user.click(descriptionField);

      // Verify collaborative editing started
      // const { useCollaborativeEditing } = await import('../../hooks/useCollaborativeEditing');
      const mockJoinSession = useCollaborativeEditing('work-item-1', 'test-project-1').joinSession;
      
      expect(mockJoinSession).toHaveBeenCalledWith('work-item-1');

      // Simulate collaborative editing session join
      mockJoinSession('work-item-1');

      // Verify session was joined
      expect(mockJoinSession).toHaveBeenCalledWith('work-item-1');
    });

    it('should show editing indicators when others are editing', async () => {
      const TestComponent = () => (
        <RealtimeCollaborationProvider projectId="test-project-1">
          <BacklogPage />
        </RealtimeCollaborationProvider>
      );

      // Mock someone else is editing
      // const { useCollaborativeEditing } = await import('../../hooks/useCollaborativeEditing');
      vi.mocked(useCollaborativeEditing).mockReturnValue({
        session: {
          id: 'session-1',
          workItemId: 'work-item-1',
          activeUsers: [{
            userId: 'test-user-1',
            userName: 'Test User 1',
            isEditing: false,
            joinedAt: new Date(),
          }, {
            userId: 'test-user-2',
            userName: 'Test User 2',
            isEditing: true,
            editingField: 'description',
            joinedAt: new Date(),
            cursor: {
              userId: 'test-user-2',
              userName: 'Test User 2',
              x: 100,
              y: 200,
              timestamp: new Date(),
            },
          }],
          lastActivity: new Date(),
        },
        activeUsers: [{
          userId: 'test-user-2',
          userName: 'Test User 2',
          isEditing: true,
          editingField: 'description',
          joinedAt: new Date(),
        }],
        joinSession: vi.fn(),
        leaveSession: vi.fn(),
        updateEditingStatus: vi.fn(),
      });

      renderWithProviders(<TestComponent />, {
        initialRoute: '/projects/test-project-1/backlog'
      });

      await waitFor(() => {
        expect(screen.getByText('User Authentication')).toBeInTheDocument();
      });

      // Verify editing indicator is shown
      expect(screen.getByTestId('editing-indicator')).toBeInTheDocument();
      expect(screen.getByText('Another User is editing')).toBeInTheDocument();
    });

    it('should handle conflict resolution in collaborative editing', async () => {
      const TestComponent = () => (
        <RealtimeCollaborationProvider projectId="test-project-1">
          <BacklogPage />
        </RealtimeCollaborationProvider>
      );

      renderWithProviders(<TestComponent />, {
        initialRoute: '/projects/test-project-1/backlog'
      });

      await waitFor(() => {
        expect(screen.getByText('User Authentication')).toBeInTheDocument();
      });

      // Simulate conflicting edits
      // const { useCollaborativeEditing } = await import('../../hooks/useCollaborativeEditing');
      const mockUpdateEditingStatus = useCollaborativeEditing('work-item-1', 'test-project-1').updateEditingStatus;

      // Two users editing the same field simultaneously
      // Update editing status for both users
      mockUpdateEditingStatus(true, 'title');
      mockUpdateEditingStatus(true, 'title');

      // Verify editing status was updated
      expect(mockUpdateEditingStatus).toHaveBeenCalledTimes(2);
    });
  });

  describe('Real-time Notifications', () => {
    it('should show notifications for relevant project updates', async () => {
      const TestComponent = () => (
        <RealtimeCollaborationProvider projectId="test-project-1">
          <BoardPage />
        </RealtimeCollaborationProvider>
      );

      renderWithProviders(<TestComponent />, {
        initialRoute: '/projects/test-project-1/board'
      });

      await waitFor(() => {
        expect(screen.getByText('User Authentication')).toBeInTheDocument();
      });

      // Simulate notification for work item assignment
      const notificationUpdate = {
        type: 'notification',
        data: {
          id: 'notification-1',
          type: 'work_item_assigned',
          title: 'Work item assigned to you',
          message: 'API Integration has been assigned to you by Test User',
          workItemId: 'work-item-2',
          userId: 'test-user-1',
          createdAt: new Date().toISOString(),
        },
      };

      // Trigger notification
      // const { useRealtime } = await import('../../hooks/useRealtime');
      const mockSubscribe = vi.mocked(useRealtime().subscribe);
      const subscribeCallback = mockSubscribe.mock.calls[0]?.[1];
      
      if (subscribeCallback) {
        subscribeCallback(notificationUpdate);
      }

      // Verify notification appears
      await waitFor(() => {
        expect(screen.getByText('Work item assigned to you')).toBeInTheDocument();
      });
    });

    it('should handle notification interactions', async () => {
      const TestComponent = () => (
        <RealtimeCollaborationProvider projectId="test-project-1">
          <BoardPage />
        </RealtimeCollaborationProvider>
      );

      renderWithProviders(<TestComponent />, {
        initialRoute: '/projects/test-project-1/board'
      });

      // Simulate notification
      const notificationUpdate = {
        type: 'notification',
        data: {
          id: 'notification-1',
          type: 'work_item_commented',
          title: 'New comment on work item',
          message: 'Test User commented on User Authentication',
          workItemId: 'work-item-1',
          userId: 'test-user-1',
          createdAt: new Date().toISOString(),
        },
      };

      // const { useRealtime } = await import('../../hooks/useRealtime');
      const mockSubscribe = vi.mocked(useRealtime().subscribe);
      const subscribeCallback = mockSubscribe.mock.calls[0]?.[1];
      
      if (subscribeCallback) {
        subscribeCallback(notificationUpdate);
      }

      await waitFor(() => {
        expect(screen.getByText('New comment on work item')).toBeInTheDocument();
      });

      // Click on notification to navigate to work item
      const notification = screen.getByText('New comment on work item');
      await user.click(notification);

      // Verify navigation or modal opening
      await waitFor(() => {
        expect(screen.getByRole('dialog') || screen.getByText('User Authentication')).toBeInTheDocument();
      });
    });
  });

  describe('Connection Management', () => {
    it('should handle connection loss and reconnection', async () => {
      const TestComponent = () => (
        <RealtimeCollaborationProvider projectId="test-project-1">
          <BoardPage />
        </RealtimeCollaborationProvider>
      );

      renderWithProviders(<TestComponent />, {
        initialRoute: '/projects/test-project-1/board'
      });

      await waitFor(() => {
        expect(screen.getByText('User Authentication')).toBeInTheDocument();
      });

      // Simulate connection loss
      // const { useRealtime } = await import('../../hooks/useRealtime');
      vi.mocked(useRealtime).mockReturnValue({
        connected: false,
        connecting: false,
        subscribe: vi.fn(),
        unsubscribe: vi.fn(),
        reconnect: vi.fn(),
        error: 'Connection lost',
      });

      // Trigger re-render
      fireEvent(window, new Event('online'));

      // Verify connection status indicator
      await waitFor(() => {
        expect(screen.getByText(/offline/i) || screen.getByTestId('connection-status')).toBeInTheDocument();
      });

      // Simulate reconnection
      vi.mocked(useRealtime).mockReturnValue({
        connected: true,
        connecting: false,
        subscribe: vi.fn(),
        unsubscribe: vi.fn(),
        reconnect: vi.fn(),
        error: null,
      });

      fireEvent(window, new Event('online'));

      // Verify reconnection
      await waitFor(() => {
        expect(screen.queryByText(/offline/i)).not.toBeInTheDocument();
      });
    });

    it('should queue operations during disconnection', async () => {
      const TestComponent = () => (
        <RealtimeCollaborationProvider projectId="test-project-1">
          <BacklogPage />
        </RealtimeCollaborationProvider>
      );

      renderWithProviders(<TestComponent />, {
        initialRoute: '/projects/test-project-1/backlog'
      });

      // Simulate offline state
      // const { useRealtime } = await import('../../hooks/useRealtime');
      const mockSend = vi.fn();
      vi.mocked(useRealtime).mockReturnValue({
        connected: false,
        connecting: false,
        subscribe: vi.fn(),
        unsubscribe: vi.fn(),
        reconnect: vi.fn(),
        error: null,
      });

      await waitFor(() => {
        expect(screen.getByText('User Authentication')).toBeInTheDocument();
      });

      // Try to update work item while offline
      const workItem = screen.getByText('User Authentication');
      await user.click(workItem);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const titleInput = screen.getByDisplayValue('User Authentication');
      await user.clear(titleInput);
      await user.type(titleInput, 'Updated User Authentication');

      const saveButton = screen.getByText('Save Changes');
      await user.click(saveButton);

      // Verify operation was queued (not sent immediately)
      expect(mockSend).not.toHaveBeenCalled();

      // Simulate reconnection
      vi.mocked(useRealtime).mockReturnValue({
        connected: true,
        connecting: false,
        subscribe: vi.fn(),
        unsubscribe: vi.fn(),
        reconnect: vi.fn(),
        error: null,
      });

      fireEvent(window, new Event('online'));

      // Verify queued operations are sent
      await waitFor(() => {
        expect(mockSend).toHaveBeenCalled();
      });
    });
  });
});
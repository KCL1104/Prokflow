import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, type MockedFunction } from 'vitest';
import { NotificationCenter } from '../NotificationCenter';
import { useNotifications } from '../../../hooks/useNotifications';

// Mock the useNotifications hook
vi.mock('../../../hooks/useNotifications');

const mockUseNotifications = useNotifications as MockedFunction<typeof useNotifications>;

// Mock the Icon component
vi.mock('../../common/Icon', () => ({
  Icon: ({ name, size }: { name: string; size?: number }) => (
    <span data-testid={`icon-${name}`} data-size={size}>
      {name}
    </span>
  )
}));

describe('NotificationCenter', () => {
  const mockNotifications = [
    {
      id: 'notification-1',
      type: 'work_item_updated' as const,
      title: 'Work Item Updated',
      message: 'Test work item was updated by John Doe',
      userId: 'user-1',
      projectId: 'project-1',
      read: false,
      createdAt: new Date('2023-01-01T10:00:00Z'),
      actionUrl: '/work-items/item-1'
    },
    {
      id: 'notification-2',
      type: 'comment_added' as const,
      title: 'New Comment',
      message: 'Jane Smith commented on your work item',
      userId: 'user-1',
      projectId: 'project-1',
      read: true,
      createdAt: new Date('2023-01-01T09:00:00Z'),
      actionUrl: '/work-items/item-2#comments'
    }
  ];

  const defaultMockReturn = {
    notifications: mockNotifications,
    unreadCount: 1,
    markAsRead: vi.fn(),
    markAllAsRead: vi.fn(),
    clearNotifications: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseNotifications.mockReturnValue(defaultMockReturn);
  });

  it('should render notification bell with unread count', () => {
    render(<NotificationCenter projectId="test-project" />);

    expect(screen.getByTestId('icon-bell')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('should not show unread count when there are no unread notifications', () => {
    mockUseNotifications.mockReturnValue({
      ...defaultMockReturn,
      unreadCount: 0
    });

    render(<NotificationCenter projectId="test-project" />);

    expect(screen.getByTestId('icon-bell')).toBeInTheDocument();
    expect(screen.queryByText('1')).not.toBeInTheDocument();
  });

  it('should open dropdown when bell is clicked', () => {
    render(<NotificationCenter projectId="test-project" />);

    const bellButton = screen.getByRole('button');
    fireEvent.click(bellButton);

    expect(screen.getByText('Notifications')).toBeInTheDocument();
    expect(screen.getByText('(1 unread)')).toBeInTheDocument();
  });

  it('should display notifications in the dropdown', () => {
    render(<NotificationCenter projectId="test-project" />);

    const bellButton = screen.getByRole('button');
    fireEvent.click(bellButton);

    expect(screen.getByText('Work Item Updated')).toBeInTheDocument();
    expect(screen.getByText('Test work item was updated by John Doe')).toBeInTheDocument();
    expect(screen.getByText('New Comment')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith commented on your work item')).toBeInTheDocument();
  });

  it('should mark notification as read when clicked', () => {
    const mockMarkAsRead = vi.fn();
    mockUseNotifications.mockReturnValue({
      ...defaultMockReturn,
      markAsRead: mockMarkAsRead
    });

    // Mock window.location.href
    const originalLocation = window.location;
    delete (window as typeof window & { location?: Location }).location;
    Object.defineProperty(window, 'location', {
      value: { ...originalLocation, href: '' },
      writable: true
    });

    render(<NotificationCenter projectId="test-project" />);

    const bellButton = screen.getByRole('button');
    fireEvent.click(bellButton);

    const unreadNotification = screen.getByText('Work Item Updated').closest('div');
    fireEvent.click(unreadNotification!);

    expect(mockMarkAsRead).toHaveBeenCalledWith('notification-1');
    expect(window.location.href).toBe('/work-items/item-1');
  });

  it('should mark all notifications as read', () => {
    const mockMarkAllAsRead = vi.fn();
    mockUseNotifications.mockReturnValue({
      ...defaultMockReturn,
      markAllAsRead: mockMarkAllAsRead
    });

    render(<NotificationCenter projectId="test-project" />);

    const bellButton = screen.getByRole('button');
    fireEvent.click(bellButton);

    const markAllReadButton = screen.getByText('Mark all read');
    fireEvent.click(markAllReadButton);

    expect(mockMarkAllAsRead).toHaveBeenCalled();
  });

  it('should clear all notifications', () => {
    const mockClearNotifications = vi.fn();
    mockUseNotifications.mockReturnValue({
      ...defaultMockReturn,
      clearNotifications: mockClearNotifications
    });

    render(<NotificationCenter projectId="test-project" />);

    const bellButton = screen.getByRole('button');
    fireEvent.click(bellButton);

    const clearAllButton = screen.getByText('Clear all');
    fireEvent.click(clearAllButton);

    expect(mockClearNotifications).toHaveBeenCalled();
  });

  it('should show empty state when there are no notifications', () => {
    mockUseNotifications.mockReturnValue({
      ...defaultMockReturn,
      notifications: [],
      unreadCount: 0
    });

    render(<NotificationCenter projectId="test-project" />);

    const bellButton = screen.getByRole('button');
    fireEvent.click(bellButton);

    expect(screen.getByText('No notifications yet')).toBeInTheDocument();
    // Check for the bell icon in the empty state specifically
    const emptyStateContainer = screen.getByText('No notifications yet').closest('div');
    expect(emptyStateContainer).toContainElement(screen.getAllByTestId('icon-bell')[1]);
  });

  it('should close dropdown when clicking outside', async () => {
    render(<NotificationCenter projectId="test-project" />);

    const bellButton = screen.getByRole('button');
    fireEvent.click(bellButton);

    expect(screen.getByText('Notifications')).toBeInTheDocument();

    // Click on the backdrop (the invisible overlay that covers the screen)
    const backdrop = document.querySelector('.fixed.inset-0.z-40');
    expect(backdrop).toBeInTheDocument();
    fireEvent.click(backdrop!);

    await waitFor(() => {
      expect(screen.queryByText('Notifications')).not.toBeInTheDocument();
    });
  });

  it('should display correct notification icons', () => {
    render(<NotificationCenter projectId="test-project" />);

    const bellButton = screen.getByRole('button');
    fireEvent.click(bellButton);

    expect(screen.getByTestId('icon-edit')).toBeInTheDocument(); // work_item_updated
    expect(screen.getByTestId('icon-message-circle')).toBeInTheDocument(); // comment_added
  });

  it('should show unread indicator for unread notifications', () => {
    render(<NotificationCenter projectId="test-project" />);

    const bellButton = screen.getByRole('button');
    fireEvent.click(bellButton);

    // Find the notification items by their container divs
    const notificationItems = screen.getAllByText(/Work Item Updated|New Comment/).map(text => {
      // Get the notification item div (the one with the styling)
      let element = text.parentElement;
      while (element && !element.className.includes('p-3 border-b')) {
        element = element.parentElement;
      }
      return element;
    });

    const unreadNotification = notificationItems[0]; // Work Item Updated (unread)
    const readNotification = notificationItems[1]; // New Comment (read)

    // Check for blue background on unread notification
    expect(unreadNotification).toHaveClass('bg-blue-50');
    expect(readNotification).not.toHaveClass('bg-blue-50');
  });
});
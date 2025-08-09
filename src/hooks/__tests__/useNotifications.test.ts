import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useNotifications, useNotificationSender } from '../useNotifications';
import { realtimeService } from '../../services/realtimeService';
import { useAuth } from '../useAuth';
import type { RealtimePayload } from '../../types/realtime';

// Mock dependencies
vi.mock('../../services/realtimeService');
vi.mock('../useAuth');

const mockRealtimeService = vi.mocked(realtimeService);
const mockUseAuth = vi.mocked(useAuth);

// Mock Notification API
const mockNotification = vi.fn();
Object.defineProperty(window, 'Notification', {
  value: mockNotification,
  configurable: true
});

Object.defineProperty(Notification, 'permission', {
  value: 'granted',
  configurable: true
});

Object.defineProperty(Notification, 'requestPermission', {
  value: vi.fn().mockResolvedValue('granted'),
  configurable: true
});

describe('useNotifications', () => {
  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
    fullName: 'Test User',
    full_name: 'Test User', // For compatibility
    avatarUrl: undefined,
    avatar_url: undefined, // For compatibility
    timezone: 'UTC',
    createdAt: new Date('2023-01-01T00:00:00.000Z'),
    updatedAt: new Date('2023-01-01T00:00:00.000Z')
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false,
      signIn: vi.fn(),
      signOut: vi.fn(),
      signUp: vi.fn()
    });
    mockRealtimeService.subscribe.mockReturnValue(vi.fn());
  });

  it('should initialize with empty notifications', () => {
    const { result } = renderHook(() => useNotifications('test-project'));

    expect(result.current.notifications).toEqual([]);
    expect(result.current.unreadCount).toBe(0);
  });

  it('should subscribe to notifications when project and user are available', () => {
    renderHook(() => useNotifications('test-project'));

    expect(mockRealtimeService.subscribe).toHaveBeenCalledWith(
      {
        type: 'notifications',
        projectId: 'test-project',
        userId: 'test-user-id'
      },
      expect.any(Function)
    );
  });

  it('should not subscribe when project is null', () => {
    renderHook(() => useNotifications(null));

    expect(mockRealtimeService.subscribe).not.toHaveBeenCalled();
  });

  it('should not subscribe when user is null', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      signIn: vi.fn(),
      signOut: vi.fn(),
      signUp: vi.fn()
    });

    renderHook(() => useNotifications('test-project'));

    expect(mockRealtimeService.subscribe).not.toHaveBeenCalled();
  });

  it('should handle incoming notifications', () => {
    let subscriptionCallback: (payload: RealtimePayload<Record<string, unknown>>) => void;
    mockRealtimeService.subscribe.mockImplementation((_, callback) => {
      subscriptionCallback = callback;
      return vi.fn();
    });

    const { result } = renderHook(() => useNotifications('test-project'));

    const mockNotificationPayload: RealtimePayload<Record<string, unknown>> = {
      eventType: 'INSERT',
      new: {
        id: 'notification-1',
        type: 'work_item_updated',
        title: 'Work Item Updated',
        message: 'Test work item was updated',
        userId: 'test-user-id',
        projectId: 'test-project',
        read: false,
        createdAt: new Date()
      },
      schema: 'public',
      table: 'notifications',
      commit_timestamp: '2023-01-01T00:00:00.000Z'
    };

    act(() => {
      subscriptionCallback!(mockNotificationPayload);
    });

    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifications[0]).toEqual(mockNotificationPayload.new);
    expect(result.current.unreadCount).toBe(1);
  });

  it('should mark notification as read', () => {
    let subscriptionCallback: (payload: RealtimePayload<Record<string, unknown>>) => void;
    mockRealtimeService.subscribe.mockImplementation((_, callback) => {
      subscriptionCallback = callback;
      return vi.fn();
    });

    const { result } = renderHook(() => useNotifications('test-project'));

    // Add a notification
    const mockNotificationPayload: RealtimePayload<Record<string, unknown>> = {
      eventType: 'INSERT',
      new: {
        id: 'notification-1',
        type: 'work_item_updated',
        title: 'Work Item Updated',
        message: 'Test work item was updated',
        userId: 'test-user-id',
        projectId: 'test-project',
        read: false,
        createdAt: new Date()
      },
      schema: 'public',
      table: 'notifications',
      commit_timestamp: '2023-01-01T00:00:00.000Z'
    };

    act(() => {
      subscriptionCallback!(mockNotificationPayload);
    });

    expect(result.current.unreadCount).toBe(1);

    // Mark as read
    act(() => {
      result.current.markAsRead('notification-1');
    });

    expect(result.current.notifications[0].read).toBe(true);
    expect(result.current.unreadCount).toBe(0);
  });

  it('should mark all notifications as read', () => {
    let subscriptionCallback: (payload: RealtimePayload<Record<string, unknown>>) => void;
    mockRealtimeService.subscribe.mockImplementation((_, callback) => {
      subscriptionCallback = callback;
      return vi.fn();
    });

    const { result } = renderHook(() => useNotifications('test-project'));

    // Add multiple notifications
    const notifications: RealtimePayload<Record<string, unknown>>[] = [
      {
        eventType: 'INSERT',
        new: {
          id: 'notification-1',
          type: 'work_item_updated',
          title: 'Work Item Updated',
          message: 'Test work item 1 was updated',
          userId: 'test-user-id',
          projectId: 'test-project',
          read: false,
          createdAt: new Date()
        },
        schema: 'public',
        table: 'notifications',
        commit_timestamp: '2023-01-01T00:00:00.000Z'
      },
      {
        eventType: 'INSERT',
        new: {
          id: 'notification-2',
          type: 'work_item_assigned',
          title: 'Work Item Assigned',
          message: 'Test work item 2 was assigned',
          userId: 'test-user-id',
          projectId: 'test-project',
          read: false,
          createdAt: new Date()
        },
        schema: 'public',
        table: 'notifications',
        commit_timestamp: '2023-01-01T00:00:00.000Z'
      }
    ];

    act(() => {
      notifications.forEach(notification => {
        subscriptionCallback!(notification);
      });
    });

    expect(result.current.unreadCount).toBe(2);

    // Mark all as read
    act(() => {
      result.current.markAllAsRead();
    });

    expect(result.current.notifications.every(n => n.read)).toBe(true);
    expect(result.current.unreadCount).toBe(0);
  });

  it('should clear all notifications', () => {
    let subscriptionCallback: (payload: RealtimePayload<Record<string, unknown>>) => void;
    mockRealtimeService.subscribe.mockImplementation((_, callback) => {
      subscriptionCallback = callback;
      return vi.fn();
    });

    const { result } = renderHook(() => useNotifications('test-project'));

    // Add a notification
    const mockNotificationPayload: RealtimePayload<Record<string, unknown>> = {
      eventType: 'INSERT',
      new: {
        id: 'notification-1',
        type: 'work_item_updated',
        title: 'Work Item Updated',
        message: 'Test work item was updated',
        userId: 'test-user-id',
        projectId: 'test-project',
        read: false,
        createdAt: new Date()
      },
      schema: 'public',
      table: 'notifications',
      commit_timestamp: '2023-01-01T00:00:00.000Z'
    };

    act(() => {
      subscriptionCallback!(mockNotificationPayload);
    });

    expect(result.current.notifications).toHaveLength(1);

    // Clear notifications
    act(() => {
      result.current.clearNotifications();
    });

    expect(result.current.notifications).toHaveLength(0);
    expect(result.current.unreadCount).toBe(0);
  });
});

describe('useNotificationSender', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should send notification when project is available', () => {
    const { result } = renderHook(() => useNotificationSender('test-project'));

    const notificationPayload = {
      type: 'work_item_updated' as const,
      title: 'Test Notification',
      message: 'This is a test notification',
      userId: 'test-user-id'
    };

    act(() => {
      result.current.sendNotification(notificationPayload);
    });

    expect(mockRealtimeService.sendNotification).toHaveBeenCalledWith(
      'test-project',
      {
        ...notificationPayload,
        projectId: 'test-project'
      }
    );
  });

  it('should not send notification when project is null', () => {
    const { result } = renderHook(() => useNotificationSender(null));

    const notificationPayload = {
      type: 'work_item_updated' as const,
      title: 'Test Notification',
      message: 'This is a test notification',
      userId: 'test-user-id'
    };

    act(() => {
      result.current.sendNotification(notificationPayload);
    });

    expect(mockRealtimeService.sendNotification).not.toHaveBeenCalled();
  });
});
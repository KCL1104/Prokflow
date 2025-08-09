import { useState, useEffect, useCallback } from 'react';
import { realtimeService } from '../services/realtimeService';
import { useAuth } from './useAuth';
import type { 
  LiveNotification, 
  NotificationPayload, 
  UseNotificationsReturn,
  RealtimeChannelConfig,
  RealtimePayload
} from '../types/realtime';

/**
 * Hook for managing live notifications
 */
export function useNotifications(projectId: string | null): UseNotificationsReturn {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<LiveNotification[]>([]);

  // Subscribe to notifications for the project
  useEffect(() => {
    if (!projectId || !user) {
      return;
    }

    const config: RealtimeChannelConfig = {
      type: 'notifications',
      projectId,
      userId: user.id
    };

    const handleNotification = (payload: RealtimePayload<unknown>) => {
      if (payload.eventType === 'INSERT' && payload.new) {
        const notification = payload.new as LiveNotification;
        
        // Only show notifications for the current user
        if (notification.userId === user.id) {
          setNotifications(prev => [notification, ...prev]);
          
          // Show browser notification if permission granted
          if (Notification.permission === 'granted') {
            new Notification(notification.title, {
              body: notification.message,
              icon: '/favicon.ico',
              tag: notification.id
            });
          }
        }
      }
    };

    const unsubscribe = realtimeService.subscribe(config, handleNotification);

    return unsubscribe;
  }, [projectId, user]);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotifications
  };
}

/**
 * Hook for sending notifications
 */
export function useNotificationSender(projectId: string | null) {
  const sendNotification = useCallback((payload: Omit<NotificationPayload, 'projectId'>) => {
    if (!projectId) {
      return;
    }

    const fullPayload: NotificationPayload = {
      ...payload,
      projectId
    };

    realtimeService.sendNotification(projectId, fullPayload);
  }, [projectId]);

  return { sendNotification };
}

/**
 * Hook for work item related notifications
 */
export function useWorkItemNotifications(projectId: string | null, workItemId: string | null) {
  const { sendNotification } = useNotificationSender(projectId);

  const notifyWorkItemUpdated = useCallback((
    workItemTitle: string,
    updatedBy: string,
    changes: string[]
  ) => {
    sendNotification({
      type: 'work_item_updated',
      title: 'Work Item Updated',
      message: `${updatedBy} updated "${workItemTitle}": ${changes.join(', ')}`,
      userId: '', // Will be set by the recipient's subscription
      workItemId: workItemId || undefined,
      actionUrl: workItemId ? `/work-items/${workItemId}` : undefined
    });
  }, [sendNotification, workItemId]);

  const notifyWorkItemAssigned = useCallback((
    workItemTitle: string,
    assignedTo: string,
    assignedBy: string
  ) => {
    sendNotification({
      type: 'work_item_assigned',
      title: 'Work Item Assigned',
      message: `${assignedBy} assigned "${workItemTitle}" to ${assignedTo}`,
      userId: '', // Will be set by the recipient's subscription
      workItemId: workItemId || undefined,
      actionUrl: workItemId ? `/work-items/${workItemId}` : undefined
    });
  }, [sendNotification, workItemId]);

  const notifyCommentAdded = useCallback((
    workItemTitle: string,
    commentedBy: string,
    commentPreview: string
  ) => {
    sendNotification({
      type: 'comment_added',
      title: 'New Comment',
      message: `${commentedBy} commented on "${workItemTitle}": ${commentPreview}`,
      userId: '', // Will be set by the recipient's subscription
      workItemId: workItemId || undefined,
      actionUrl: workItemId ? `/work-items/${workItemId}#comments` : undefined
    });
  }, [sendNotification, workItemId]);

  const notifyMention = useCallback((
    mentionedUserId: string,
    workItemTitle: string,
    mentionedBy: string,
    context: string
  ) => {
    sendNotification({
      type: 'mention',
      title: 'You were mentioned',
      message: `${mentionedBy} mentioned you in "${workItemTitle}": ${context}`,
      userId: mentionedUserId,
      workItemId: workItemId || undefined,
      actionUrl: workItemId ? `/work-items/${workItemId}#comments` : undefined
    });
  }, [sendNotification, workItemId]);

  return {
    notifyWorkItemUpdated,
    notifyWorkItemAssigned,
    notifyCommentAdded,
    notifyMention
  };
}

/**
 * Hook for sprint related notifications
 */
export function useSprintNotifications(projectId: string | null, sprintId: string | null) {
  const { sendNotification } = useNotificationSender(projectId);

  const notifySprintUpdated = useCallback((
    sprintName: string,
    updatedBy: string,
    changes: string[]
  ) => {
    sendNotification({
      type: 'sprint_updated',
      title: 'Sprint Updated',
      message: `${updatedBy} updated sprint "${sprintName}": ${changes.join(', ')}`,
      userId: '', // Will be set by the recipient's subscription
      sprintId: sprintId || undefined,
      actionUrl: sprintId ? `/sprints/${sprintId}` : undefined
    });
  }, [sendNotification, sprintId]);

  return {
    notifySprintUpdated
  };
}

/**
 * Hook for notification preferences and settings
 */
export function useNotificationSettings() {
  const [settings, setSettings] = useState({
    browserNotifications: true,
    workItemUpdates: true,
    assignments: true,
    comments: true,
    mentions: true,
    sprintUpdates: true
  });

  // Load settings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('notification-settings');
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to parse notification settings:', error);
      }
    }
  }, []);

  // Save settings to localStorage
  const updateSettings = useCallback((newSettings: Partial<typeof settings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem('notification-settings', JSON.stringify(updated));
      return updated;
    });
  }, []);

  return {
    settings,
    updateSettings
  };
}
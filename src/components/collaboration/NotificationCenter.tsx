import React, { useState } from 'react';
import { Icon } from '../common/Icon';
import { useNotifications } from '../../hooks/useNotifications';
import type { LiveNotification } from '../../types/realtime';

interface NotificationItemProps {
  notification: LiveNotification;
  onMarkAsRead: (id: string) => void;
  onClose?: (id: string) => void;
}

function NotificationItem({ notification, onMarkAsRead, onClose }: NotificationItemProps) {
  const handleClick = () => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
    
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  const getNotificationIcon = () => {
    switch (notification.type) {
      case 'work_item_updated':
        return 'edit';
      case 'work_item_assigned':
        return 'user';
      case 'comment_added':
        return 'message-circle';
      case 'mention':
        return 'at-sign';
      case 'sprint_updated':
        return 'calendar';
      default:
        return 'bell';
    }
  };

  const getNotificationColor = () => {
    switch (notification.type) {
      case 'work_item_updated':
        return 'text-blue-600';
      case 'work_item_assigned':
        return 'text-green-600';
      case 'comment_added':
        return 'text-purple-600';
      case 'mention':
        return 'text-orange-600';
      case 'sprint_updated':
        return 'text-indigo-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div
      className={`p-3 border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors ${
        !notification.read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
      }`}
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 ${getNotificationColor()}`}>
          <Icon name={getNotificationIcon()} size="sm" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <p className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                {notification.title}
              </p>
              <p className={`text-sm ${!notification.read ? 'text-gray-700' : 'text-gray-500'}`}>
                {notification.message}
              </p>
            </div>
            
            {onClose && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClose(notification.id);
                }}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600"
              >
                <Icon name="x" size="sm" />
              </button>
            )}
          </div>
          
          <p className="text-xs text-gray-500 mt-1">
            {new Date(notification.createdAt).toLocaleString()}
          </p>
        </div>
        
        {!notification.read && (
          <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full"></div>
        )}
      </div>
    </div>
  );
}

interface NotificationCenterProps {
  projectId: string | null;
  className?: string;
}

export function NotificationCenter({ projectId, className = '' }: NotificationCenterProps) {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotifications } = 
    useNotifications(projectId);
  const [isOpen, setIsOpen] = useState(false);

  const handleNotificationClose = (notificationId: string) => {
    // In a real implementation, you might want to remove the notification
    // For now, we'll just mark it as read
    markAsRead(notificationId);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-warm-50 border-2 border-transparent hover:border-light rounded-lg transition-all duration-150"
      >
        <Icon name="bell" size="md" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Panel */}
          <div className="absolute right-0 top-full mt-2 w-80 bg-warm-25 rounded-lg shadow-lg border-2 border-default z-50 max-h-96 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b-2 border-default bg-warm-50">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-900">
                  Notifications
                  {unreadCount > 0 && (
                    <span className="ml-2 text-xs text-gray-500">
                      ({unreadCount} unread)
                    </span>
                  )}
                </h3>
                
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      Mark all read
                    </button>
                  )}
                  
                  {notifications.length > 0 && (
                    <button
                      onClick={clearNotifications}
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >
                      Clear all
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Icon name="bell" size="lg" className="mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No notifications yet</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={markAsRead}
                    onClose={handleNotificationClose}
                  />
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

interface NotificationToastProps {
  notification: LiveNotification;
  onClose: () => void;
  autoClose?: boolean;
  duration?: number;
}

export function NotificationToast({ 
  notification, 
  onClose, 
  autoClose = true, 
  duration = 5000 
}: NotificationToastProps) {
  React.useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onClose]);

  const getNotificationIcon = () => {
    switch (notification.type) {
      case 'work_item_updated':
        return 'edit';
      case 'work_item_assigned':
        return 'user';
      case 'comment_added':
        return 'message-circle';
      case 'mention':
        return 'at-sign';
      case 'sprint_updated':
        return 'calendar';
      default:
        return 'bell';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 bg-warm-25 rounded-lg shadow-lg border-2 border-default p-4 max-w-sm animate-slide-in-right">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 text-blue-600">
          <Icon name={getNotificationIcon()} size="md" />
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900">
            {notification.title}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            {notification.message}
          </p>
        </div>
        
        <button
          onClick={onClose}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600"
        >
          <Icon name="x" size="sm" />
        </button>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../store';

import { useRealtimeCollaboration } from '../../hooks/useRealtimeCollaboration';
import { Bell, X, Check, AlertCircle, Info } from 'lucide-react';
import { markNotificationAsRead } from '../../store/slices/notificationSlice';
import type { LiveNotification } from '../../types/realtime';
import { removeToast } from '../../store/slices/uiSlice';
import { AlertTriangle } from 'lucide-react';

interface NotificationCenterProps {
  className?: string;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ className = '' }) => {
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const [showToasts, setShowToasts] = useState(true);
  
  // Get notifications from Redux store
  const { toasts } = useSelector((state: RootState) => state.ui);
  const { notifications, unreadCount } = useSelector((state: RootState) => state.notification);
  
  // Get real-time collaboration notifications
  const { notifications: realtimeNotifications } = useRealtimeCollaboration();

  // Auto-remove toasts after their duration
  useEffect(() => {
    toasts.forEach(toast => {
      if (toast.duration && toast.duration > 0) {
        const timer = setTimeout(() => {
          dispatch(removeToast(toast.id));
        }, toast.duration);
        
        return () => clearTimeout(timer);
      }
    });
  }, [toasts, dispatch]);

  const handleMarkAsRead = (notificationId: string) => {
    dispatch(markNotificationAsRead(notificationId));
  };

  const handleRemoveToast = (toastId: string) => {
    dispatch(removeToast(toastId));
  };

  const getToastIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <Check className="w-5 h-5 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getToastBgColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const totalUnreadCount = unreadCount + realtimeNotifications.filter((n: any) => !n.read).length;

  return (
    <div className={`relative ${className}`}>
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-6 h-6" />
        {totalUnreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-lg shadow-lg border-2 border-gray-300 z-50">
          <div className="p-4 border-b-2 border-gray-300">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowToasts(!showToasts)}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  {showToasts ? 'Hide Toasts' : 'Show Toasts'}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {/* System Notifications */}
            {notifications.length > 0 && (
              <div className="p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">System Notifications</h4>
                <div className="space-y-2">
                  {notifications.slice(0, 5).map((notification: LiveNotification) => (
                    <div
                      key={notification.id}
                      className={`p-3 rounded-lg border-2 ${
                        notification.read ? 'bg-gray-50 border-gray-300' : 'bg-blue-50 border-blue-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                          {notification.message && (
                            <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(notification.createdAt).toLocaleString()}
                          </p>
                        </div>
                        {!notification.read && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="ml-2 text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Mark as read
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Real-time Collaboration Notifications */}
            {realtimeNotifications.length > 0 && (
              <div className="p-4 border-t-2 border-gray-300">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Collaboration Updates</h4>
                <div className="space-y-2">
                  {realtimeNotifications.slice(0, 5).map((notification: any) => (
                    <div
                      key={notification.id}
                      className={`p-3 rounded-lg border-2 ${
                        notification.read ? 'bg-gray-50 border-gray-300' : 'bg-green-50 border-green-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                          {notification.message && (
                            <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(notification.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {notifications.length === 0 && realtimeNotifications.length === 0 && (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No notifications yet</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      {showToasts && (
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {toasts.map(toast => (
            <div
              key={toast.id}
              className={`max-w-sm w-full rounded-lg border p-4 shadow-lg transition-all duration-300 ${
                getToastBgColor(toast.type)
              }`}
            >
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {getToastIcon(toast.type)}
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-900">{toast.title}</p>
                  {toast.message && (
                    <p className="text-sm text-gray-600 mt-1">{toast.message}</p>
                  )}
                </div>
                <div className="ml-4 flex-shrink-0">
                  <button
                    onClick={() => handleRemoveToast(toast.id)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};
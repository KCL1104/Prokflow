import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useRealtime } from '../../hooks/useRealtime';
import { useCursorTracking } from '../../hooks/useCursorTracking';
import { useNotifications } from '../../hooks/useNotifications';
import { usePresence } from '../../hooks/usePresence';
import { useRealtimeCollaboration } from '../../hooks/useRealtimeCollaboration';
import { CollaborativeCursors } from './CollaborativeCursor';
import { PresenceIndicator } from './PresenceIndicator';
import { NotificationCenter } from './NotificationCenter';
import { RealtimeCollaborationContext, type RealtimeCollaborationContextType } from '../../contexts/RealtimeCollaborationContext';

interface RealtimeCollaborationProviderProps {
  children: React.ReactNode;
  projectId: string | null;
  enableCursors?: boolean;
  enableNotifications?: boolean;
  enablePresence?: boolean;
  className?: string;
}

export function RealtimeCollaborationProvider({
  children,
  projectId,
  enableCursors = true,
  enableNotifications = true,
  enablePresence = true,
  className = ''
}: RealtimeCollaborationProviderProps) {
  const { user } = useAuth();
  const { connected, connecting, error, reconnect } = useRealtime();

  // Cursor tracking
  const {
    cursors,
    isTracking: isTrackingCursors,
    startTracking: startCursorTracking,
    stopTracking: stopCursorTracking
  } = useCursorTracking(projectId, enableCursors);

  // Notifications
  const {
    notifications,
    unreadCount,
    markAsRead: markNotificationAsRead
  } = useNotifications(projectId);

  // Presence
  const { presence } = usePresence(projectId);

  // State for controlling features
  const [cursorTrackingEnabled, setCursorTrackingEnabled] = useState(enableCursors);

  // Memoize expensive calculations
  const onlineUsersCount = useMemo(() => {
    if (!enablePresence || !user) return 0;

    return Object.values(presence).filter(p =>
      p.status === 'online' && p.userId !== user.id
    ).length + 1; // +1 for current user
  }, [presence, user, enablePresence]);

  // Memoize callback functions to prevent unnecessary re-renders
  const handleEnableCursorTracking = useCallback((enabled: boolean) => {
    setCursorTrackingEnabled(enabled);
    if (enabled) {
      startCursorTracking();
    } else {
      stopCursorTracking();
    }
  }, [startCursorTracking, stopCursorTracking]);

  const handleMarkNotificationAsRead = useCallback((id: string) => {
    if (enableNotifications) {
      markNotificationAsRead(id);
    }
  }, [markNotificationAsRead, enableNotifications]);

  // Auto-enable/disable features based on props
  useEffect(() => {
    if (enableCursors && !isTrackingCursors) {
      startCursorTracking();
    } else if (!enableCursors && isTrackingCursors) {
      stopCursorTracking();
    }
  }, [enableCursors, isTrackingCursors, startCursorTracking, stopCursorTracking]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue: RealtimeCollaborationContextType = useMemo(() => ({
    // Connection status
    connected,
    connecting,
    error,

    // Cursors
    cursors: enableCursors ? cursors : [],
    isTrackingCursors: enableCursors && isTrackingCursors,

    // Notifications
    notifications: enableNotifications ? notifications : [],
    unreadCount: enableNotifications ? unreadCount : 0,
    markNotificationAsRead: handleMarkNotificationAsRead,

    // Presence
    presence: enablePresence ? presence : {},
    onlineUsersCount,

    // Controls
    enableCursorTracking: handleEnableCursorTracking,
    reconnect
  }), [
    connected,
    connecting,
    error,
    cursors,
    isTrackingCursors,
    notifications,
    unreadCount,
    presence,
    onlineUsersCount,
    handleEnableCursorTracking,
    handleMarkNotificationAsRead,
    reconnect,
    enableCursors,
    enableNotifications,
    enablePresence
  ]);

  return (
    <RealtimeCollaborationContext.Provider value={contextValue}>
      <div
        className={`relative ${className}`}
        role="region"
        aria-label="Real-time collaboration features"
      >
        {children}

        {/* Collaborative Cursors Overlay */}
        {enableCursors && cursorTrackingEnabled && projectId && (
          <CollaborativeCursors
            cursors={cursors}
            aria-label="Collaborative cursors from other users"
          />
        )}
      </div>
    </RealtimeCollaborationContext.Provider>
  );
}

interface CollaborationToolbarProps {
  projectId: string | null;
  className?: string;
  showOnlineUsers?: boolean;
  showNotifications?: boolean;
  showConnectionStatus?: boolean;
}

export function CollaborationToolbar({
  projectId,
  className = '',
  showOnlineUsers = true,
  showNotifications = true,
  showConnectionStatus = true
}: CollaborationToolbarProps) {
  const {
    connected,
    connecting,
    error,
    onlineUsersCount,
    unreadCount,
    reconnect
  } = useRealtimeCollaboration();

  const handleReconnect = useCallback(() => {
    reconnect();
  }, [reconnect]);

  const connectionStatusText = useMemo(() => {
    if (connected) return 'Connected';
    if (connecting) return 'Connecting...';
    return 'Disconnected';
  }, [connected, connecting]);

  const connectionStatusColor = useMemo(() => {
    if (connected) return 'bg-green-500';
    if (connecting) return 'bg-yellow-500 animate-pulse';
    return 'bg-red-500';
  }, [connected, connecting]);

  return (
    <div
      className={`flex items-center gap-4 ${className}`}
      role="toolbar"
      aria-label="Collaboration tools"
    >
      {/* Connection Status */}
      {showConnectionStatus && (
        <div className="flex items-center gap-2" role="status" aria-live="polite">
          <div
            className={`w-2 h-2 rounded-full ${connectionStatusColor}`}
            aria-hidden="true"
          />
          <span className="text-xs text-gray-600">
            {connectionStatusText}
          </span>
          {error && !connected && (
            <button
              onClick={handleReconnect}
              className="text-xs text-blue-600 hover:text-blue-800 underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded"
              aria-label="Reconnect to real-time collaboration services"
            >
              Retry
            </button>
          )}
        </div>
      )}

      {/* Online Users */}
      {showOnlineUsers && projectId && (
        <PresenceIndicator
          maxVisible={3}
          className=""
          aria-label={`${onlineUsersCount} users online`}
        />
      )}

      {/* Notifications */}
      {showNotifications && projectId && (
        <NotificationCenter
          projectId={projectId}
          aria-label={`${unreadCount} unread notifications`}
        />
      )}
    </div>
  );
}

interface CollaborationStatusProps {
  projectId: string | null;
  workItemId?: string | null;
  className?: string;
}

export function CollaborationStatus({
  projectId,
  workItemId,
  className = ''
}: CollaborationStatusProps) {
  const { connected, onlineUsersCount } = useRealtimeCollaboration();

  // Don't render if no project context
  if (!projectId) {
    return null;
  }

  if (!connected) {
    return (
      <div
        className={`text-xs text-gray-500 ${className}`}
        role="status"
        aria-live="polite"
      >
        Collaboration features unavailable
      </div>
    );
  }

  // Build status text
  let statusText = 'Live collaboration active';
  if (onlineUsersCount > 1) {
    statusText += ` • ${onlineUsersCount} online`;
  }
  if (workItemId) {
    statusText += ` • Editing work item`;
  }

  return (
    <div
      className={`text-xs text-gray-600 ${className}`}
      role="status"
      aria-live="polite"
    >
      <span className="flex items-center gap-1">
        <div
          className="w-2 h-2 bg-green-500 rounded-full"
          aria-hidden="true"
        />
        {statusText}
      </span>
    </div>
  );
}

interface RealtimeConnectionIndicatorProps {
  className?: string;
  showText?: boolean;
}

export const RealtimeConnectionIndicator = React.memo(function RealtimeConnectionIndicator({
  className = '',
  showText = false
}: RealtimeConnectionIndicatorProps) {
  const { connected, connecting, error, reconnect } = useRealtimeCollaboration();

  const statusColor = useMemo(() => {
    if (connected) return 'bg-green-500';
    if (connecting) return 'bg-yellow-500 animate-pulse';
    return 'bg-red-500';
  }, [connected, connecting]);

  const statusText = useMemo(() => {
    if (connected) return 'Connected';
    if (connecting) return 'Connecting...';
    return 'Disconnected';
  }, [connected, connecting]);

  const handleReconnect = useCallback(() => {
    reconnect();
  }, [reconnect]);

  return (
    <div
      className={`flex items-center gap-2 ${className}`}
      role="status"
      aria-live="polite"
    >
      <div
        className={`w-2 h-2 rounded-full ${statusColor}`}
        aria-hidden="true"
      />
      {showText && (
        <span className="text-xs text-gray-600">
          {statusText}
        </span>
      )}
      {error && !connected && (
        <button
          onClick={handleReconnect}
          className="text-xs text-blue-600 hover:text-blue-800 underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded"
          title="Reconnect to real-time services"
          aria-label="Reconnect to real-time collaboration services"
        >
          Retry
        </button>
      )}
    </div>
  );
});
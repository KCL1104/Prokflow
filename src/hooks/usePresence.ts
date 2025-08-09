import { useState, useEffect, useCallback, useRef } from 'react';
import { realtimeService } from '../services/realtimeService';
import { useAuth } from './useAuth';
import type { 
  UserPresence, 
  PresenceState, 
  UsePresenceReturn 
} from '../types/realtime';

/**
 * Hook for managing user presence in a project
 */
export function usePresence(projectId: string | null): UsePresenceReturn {
  const { user } = useAuth();
  const [presence, setPresence] = useState<PresenceState>({});
  const [currentStatus, setCurrentStatus] = useState<UserPresence['status']>('online');
  const presenceUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  // Update presence state from realtime service
  useEffect(() => {
    if (!projectId) {
      return;
    }

    const updatePresenceState = () => {
      const currentPresence = realtimeService.getPresence();
      setPresence(currentPresence);
    };

    // Initial update
    updatePresenceState();

    // Set up periodic updates
    const interval = setInterval(updatePresenceState, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [projectId]);

  // Update presence
  const updatePresence = useCallback((
    status: UserPresence['status'], 
    metadata?: Partial<UserPresence>
  ) => {
    if (!projectId || !user) {
      return;
    }

    const presenceData: Partial<UserPresence> = {
      userId: user.id,
      userName: user.full_name || user.email,
      userAvatar: user.avatar_url,
      status,
      lastSeen: new Date(),
      ...metadata
    };

    realtimeService.updatePresence(projectId, presenceData);
    setCurrentStatus(status);

    // Throttle presence updates
    if (presenceUpdateTimeoutRef.current) {
      clearTimeout(presenceUpdateTimeoutRef.current);
    }

    presenceUpdateTimeoutRef.current = setTimeout(() => {
      presenceUpdateTimeoutRef.current = null;
    }, 1000);
  }, [projectId, user]);

  // Track user activity for automatic status updates
  useEffect(() => {
    const handleActivity = () => {
      lastActivityRef.current = Date.now();
      
      if (currentStatus !== 'online') {
        updatePresence('online');
      }
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [currentStatus, updatePresence]);

  // Auto-update status based on inactivity
  useEffect(() => {
    const checkInactivity = () => {
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivityRef.current;

      if (timeSinceLastActivity > 5 * 60 * 1000) { // 5 minutes
        if (currentStatus !== 'away') {
          updatePresence('away');
        }
      } else if (timeSinceLastActivity > 30 * 60 * 1000) { // 30 minutes
        if (currentStatus !== 'offline') {
          updatePresence('offline');
        }
      }
    };

    const interval = setInterval(checkInactivity, 60 * 1000); // Check every minute

    return () => {
      clearInterval(interval);
    };
  }, [currentStatus, updatePresence]);

  // Check if a user is online
  const isUserOnline = useCallback((userId: string): boolean => {
    const userPresence = presence[userId];
    if (!userPresence) {
      return false;
    }

    const now = Date.now();
    const lastSeen = userPresence.lastSeen.getTime();
    const timeSinceLastSeen = now - lastSeen;

    // Consider user online if seen within last 2 minutes
    return userPresence.status === 'online' && timeSinceLastSeen < 2 * 60 * 1000;
  }, [presence]);

  // Initialize presence when user and project are available
  useEffect(() => {
    if (projectId && user) {
      updatePresence('online', {
        currentPage: window.location.pathname
      });
    }

    return () => {
      if (projectId && user) {
        updatePresence('offline');
      }
    };
  }, [projectId, user, updatePresence]);

  // Update presence when page changes
  useEffect(() => {
    const handlePageChange = () => {
      if (projectId && user) {
        updatePresence(currentStatus, {
          currentPage: window.location.pathname
        });
      }
    };

    // Listen for navigation changes
    window.addEventListener('popstate', handlePageChange);
    
    // For SPA navigation, you might need to listen to your router's events
    // This is a simplified approach
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function(...args) {
      originalPushState.apply(history, args);
      handlePageChange();
    };

    history.replaceState = function(...args) {
      originalReplaceState.apply(history, args);
      handlePageChange();
    };

    return () => {
      window.removeEventListener('popstate', handlePageChange);
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
    };
  }, [projectId, user, currentStatus]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        updatePresence('away');
      } else {
        updatePresence('online');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [updatePresence]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (presenceUpdateTimeoutRef.current) {
        clearTimeout(presenceUpdateTimeoutRef.current);
      }
    };
  }, []);

  return {
    presence,
    updatePresence,
    isUserOnline
  };
}

/**
 * Hook for displaying online users in a project
 */
export function useOnlineUsers(projectId: string | null) {
  const { presence, isUserOnline } = usePresence(projectId);
  const { user } = useAuth();

  const onlineUsers = Object.values(presence).filter(userPresence => 
    isUserOnline(userPresence.userId) && userPresence.userId !== user?.id
  );

  const totalOnlineCount = onlineUsers.length + (user ? 1 : 0); // Include current user

  return {
    onlineUsers,
    totalOnlineCount,
    isUserOnline
  };
}

/**
 * Hook for work item specific presence
 */
export function useWorkItemPresence(projectId: string | null, workItemId: string | null) {
  const { presence, updatePresence } = usePresence(projectId);
  const { user } = useAuth();

  // Update presence with current work item
  useEffect(() => {
    if (workItemId) {
      updatePresence('online', {
        currentWorkItem: workItemId
      });
    }
  }, [workItemId, updatePresence]);

  // Get users viewing the same work item
  const usersViewingWorkItem = Object.values(presence).filter(userPresence => 
    userPresence.currentWorkItem === workItemId && 
    userPresence.userId !== user?.id
  );

  return {
    usersViewingWorkItem,
    viewerCount: usersViewingWorkItem.length
  };
}

/**
 * Hook for presence indicators
 */
export function usePresenceIndicator(userId: string, projectId: string | null) {
  const { presence, isUserOnline } = usePresence(projectId);
  
  const userPresence = presence[userId];
  const online = isUserOnline(userId);
  
  const getStatusColor = () => {
    if (!userPresence) return 'gray';
    
    switch (userPresence.status) {
      case 'online':
        return online ? 'green' : 'gray';
      case 'away':
        return 'yellow';
      case 'offline':
      default:
        return 'gray';
    }
  };

  const getStatusText = () => {
    if (!userPresence) return 'Offline';
    
    if (online) {
      return 'Online';
    }
    
    const now = Date.now();
    const lastSeen = userPresence.lastSeen.getTime();
    const timeSinceLastSeen = now - lastSeen;
    
    if (timeSinceLastSeen < 60 * 1000) {
      return 'Just now';
    } else if (timeSinceLastSeen < 60 * 60 * 1000) {
      const minutes = Math.floor(timeSinceLastSeen / (60 * 1000));
      return `${minutes}m ago`;
    } else if (timeSinceLastSeen < 24 * 60 * 60 * 1000) {
      const hours = Math.floor(timeSinceLastSeen / (60 * 60 * 1000));
      return `${hours}h ago`;
    } else {
      const days = Math.floor(timeSinceLastSeen / (24 * 60 * 60 * 1000));
      return `${days}d ago`;
    }
  };

  return {
    userPresence,
    online,
    statusColor: getStatusColor(),
    statusText: getStatusText(),
    currentPage: userPresence?.currentPage,
    currentWorkItem: userPresence?.currentWorkItem
  };
}
import { useEffect, useState, useCallback, useRef } from 'react';
import { realtimeService } from '../services/realtimeService';
import type { 
  RealtimeChannelConfig, 
  RealtimePayload, 
  UseRealtimeReturn,
  RealtimeConnectionStatus
} from '../types/realtime';

/**
 * Hook for managing real-time subscriptions
 */
export function useRealtime(): UseRealtimeReturn {
  const [connectionStatus, setConnectionStatus] = useState<RealtimeConnectionStatus>({
    connected: false,
    connecting: false,
    reconnectAttempts: 0
  });

  const subscriptionsRef = useRef<Map<string, () => void>>(new Map());

  // Check connection status periodically
  useEffect(() => {
    const checkConnection = () => {
      const connected = realtimeService.isConnected();
      setConnectionStatus(prev => ({
        ...prev,
        connected,
        connecting: false,
        lastConnected: connected ? new Date() : prev.lastConnected
      }));
    };

    // Initial check
    checkConnection();

    // Set up periodic checks
    const interval = setInterval(checkConnection, 5000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const subscribe = useCallback((
    config: RealtimeChannelConfig,
    callback: (payload: RealtimePayload) => void
  ): (() => void) => {
    const channelId = `${config.type}_${config.projectId}_${config.workItemId || ''}_${config.sprintId || ''}`;
    
    // Unsubscribe from existing subscription if it exists
    const existingUnsubscribe = subscriptionsRef.current.get(channelId);
    if (existingUnsubscribe) {
      existingUnsubscribe();
    }

    // Create new subscription
    const unsubscribe = realtimeService.subscribe(config, callback);
    subscriptionsRef.current.set(channelId, unsubscribe);

    return () => {
      unsubscribe();
      subscriptionsRef.current.delete(channelId);
    };
  }, []);

  const unsubscribe = useCallback((channelId: string) => {
    const unsubscribeFn = subscriptionsRef.current.get(channelId);
    if (unsubscribeFn) {
      unsubscribeFn();
      subscriptionsRef.current.delete(channelId);
    }
  }, []);

  const reconnect = useCallback(() => {
    setConnectionStatus(prev => ({
      ...prev,
      connecting: true,
      reconnectAttempts: prev.reconnectAttempts + 1
    }));

    // Resubscribe to all channels
    const subscriptions = Array.from(subscriptionsRef.current.entries());
    subscriptionsRef.current.clear();
    
    // Wait a bit before reconnecting
    setTimeout(() => {
      subscriptions.forEach(([channelId, _unsubscribeFn]) => {
        // Note: This is a simplified reconnection
        // In a real implementation, you'd need to store the original config and callback
        console.log(`Reconnecting to channel: ${channelId}`);
      });
    }, 1000);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    const subscriptions = subscriptionsRef.current;
    return () => {
      subscriptions.forEach(unsubscribe => unsubscribe());
      subscriptions.clear();
    };
  }, []);

  return {
    connected: connectionStatus.connected,
    connecting: connectionStatus.connecting,
    error: connectionStatus.error || null,
    subscribe,
    unsubscribe,
    reconnect
  };
}

/**
 * Hook for subscribing to specific real-time updates
 */
export function useRealtimeSubscription<T = unknown>(
  config: RealtimeChannelConfig | null,
  callback: (payload: RealtimePayload<T>) => void,
  deps: React.DependencyList = []
) {
  const { subscribe } = useRealtime();
  const callbackRef = useRef(callback);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!config) {
      return;
    }

    // Unsubscribe from previous subscription
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
    }

    // Subscribe to new channel
    unsubscribeRef.current = subscribe(config, (payload) => {
      callbackRef.current(payload as RealtimePayload<T>);
    });

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config?.type, config?.projectId, config?.workItemId, config?.sprintId, subscribe, ...deps]);

  return unsubscribeRef.current;
}

/**
 * Hook for project-wide real-time updates
 */
export function useProjectRealtime(
  projectId: string | null,
  userId: string,
  callback: (payload: RealtimePayload) => void
) {
  const config = projectId ? {
    type: 'project_updates' as const,
    projectId,
    userId
  } : null;

  useRealtimeSubscription(config, callback, [projectId, userId]);
}

/**
 * Hook for work item real-time updates
 */
export function useWorkItemRealtime(
  projectId: string | null,
  workItemId: string | null,
  userId: string,
  callback: (payload: RealtimePayload) => void
) {
  const config = projectId ? {
    type: 'work_item_updates' as const,
    projectId,
    workItemId: workItemId || undefined,
    userId
  } : null;

  useRealtimeSubscription(config, callback, [projectId, workItemId, userId]);
}

/**
 * Hook for sprint real-time updates
 */
export function useSprintRealtime(
  projectId: string | null,
  sprintId: string | null,
  userId: string,
  callback: (payload: RealtimePayload) => void
) {
  const config = projectId ? {
    type: 'sprint_updates' as const,
    projectId,
    sprintId: sprintId || undefined,
    userId
  } : null;

  useRealtimeSubscription(config, callback, [projectId, sprintId, userId]);
}
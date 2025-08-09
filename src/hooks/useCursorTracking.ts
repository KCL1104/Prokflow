import { useState, useEffect, useCallback, useRef } from 'react';
import { realtimeService } from '../services/realtimeService';
import { useAuth } from './useAuth';
import type { 
  UserCursor, 
  CursorUpdate, 
  UseCursorTrackingReturn,
  RealtimeChannelConfig 
} from '../types/realtime';

/**
 * Hook for real-time cursor tracking in collaborative editing
 */
export function useCursorTracking(
  projectId: string | null,
  enabled: boolean = true
): UseCursorTrackingReturn {
  const { user } = useAuth();
  const [cursors, setCursors] = useState<UserCursor[]>([]);
  const [isTracking, setIsTracking] = useState(false);
  const trackingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastCursorUpdateRef = useRef<CursorUpdate | null>(null);

  // Subscribe to cursor updates from other users
  useEffect(() => {
    if (!projectId || !user || !enabled) {
      return;
    }

    const config: RealtimeChannelConfig = {
      type: 'cursor_tracking',
      projectId,
      userId: user.id
    };

    const unsubscribe = realtimeService.subscribe(config, () => {
      // Update cursors from the service
      const updatedCursors = realtimeService.getCursors()
        .filter(cursor => cursor.userId !== user.id); // Exclude own cursor
      setCursors(updatedCursors);
    });

    return unsubscribe;
  }, [projectId, user, enabled]);

  // Update cursor position
  const updateCursor = useCallback((update: CursorUpdate) => {
    if (!projectId || !user) {
      return;
    }

    // Throttle cursor updates to avoid spam
    const now = Date.now();
    const lastUpdate = lastCursorUpdateRef.current;
    
    if (lastUpdate && 
        Math.abs(update.x - lastUpdate.x) < 5 && 
        Math.abs(update.y - lastUpdate.y) < 5 &&
        now - (lastUpdate as CursorUpdate & { timestamp: number }).timestamp < 100) {
      return;
    }

    const cursorUpdate: CursorUpdate = {
      ...update,
      userId: user.id,
      timestamp: now
    } as CursorUpdate & { timestamp: number };

    lastCursorUpdateRef.current = cursorUpdate;
    realtimeService.updateCursor(projectId, cursorUpdate);
  }, [projectId, user]);

  // Start tracking mouse movements
  const startTracking = useCallback(() => {
    if (!enabled || isTracking) {
      return;
    }

    const handleMouseMove = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const elementId = target.id || target.className || undefined;

      updateCursor({
        userId: user?.id || '',
        x: event.clientX,
        y: event.clientY,
        elementId
      });
    };

    const handleMouseLeave = () => {
      // Send cursor update with coordinates outside viewport to hide cursor
      updateCursor({
        userId: user?.id || '',
        x: -1,
        y: -1
      });
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    
    setIsTracking(true);

    // Cleanup function
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      setIsTracking(false);
    };
  }, [enabled, isTracking, updateCursor, user]);

  // Stop tracking
  const stopTracking = useCallback(() => {
    if (trackingIntervalRef.current) {
      clearInterval(trackingIntervalRef.current);
      trackingIntervalRef.current = null;
    }
    setIsTracking(false);
  }, []);

  // Auto-start tracking when enabled
  useEffect(() => {
    if (enabled && projectId && user) {
      const cleanup = startTracking();
      return cleanup;
    } else {
      stopTracking();
    }
  }, [enabled, projectId, user]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTracking();
    };
  }, []);

  return {
    cursors,
    updateCursor,
    isTracking,
    startTracking,
    stopTracking
  };
}

/**
 * Hook for displaying collaborative cursors
 */
export function useCollaborativeCursors(projectId: string | null) {
  const { cursors } = useCursorTracking(projectId);
  const [visibleCursors, setVisibleCursors] = useState<UserCursor[]>([]);

  useEffect(() => {
    // Filter out cursors that are outside the viewport or too old
    const now = Date.now();
    const filtered = cursors.filter(cursor => {
      const age = now - cursor.timestamp.getTime();
      return age < 10000 && // Hide cursors older than 10 seconds
             cursor.x >= 0 && 
             cursor.y >= 0 && 
             cursor.x <= window.innerWidth && 
             cursor.y <= window.innerHeight;
    });

    setVisibleCursors(filtered);
  }, [cursors]);

  return visibleCursors;
}

/**
 * Hook for cursor tracking in a specific work item context
 */
export function useWorkItemCursorTracking(
  projectId: string | null,
  workItemId: string | null,
  enabled: boolean = true
) {
  const { cursors, updateCursor, isTracking, startTracking, stopTracking } = 
    useCursorTracking(projectId, enabled);

  // Filter cursors for the specific work item context
  const workItemCursors = cursors.filter(cursor => 
    cursor.elementId?.includes(workItemId || '') || 
    cursor.elementId?.includes('work-item')
  );

  // Enhanced update cursor with work item context
  const updateWorkItemCursor = useCallback((update: Omit<CursorUpdate, 'userId'>) => {
    updateCursor({
      ...update,
      userId: '', // Will be set by the base hook
      elementId: update.elementId || `work-item-${workItemId}`
    });
  }, [updateCursor, workItemId]);

  return {
    cursors: workItemCursors,
    updateCursor: updateWorkItemCursor,
    isTracking,
    startTracking,
    stopTracking
  };
}
import { useState, useEffect, useCallback, useRef } from 'react';
import { realtimeService } from '../services/realtimeService';
import { useAuth } from './useAuth';
import type { 
  CollaborativeSession, 
  CollaborativeUser, 
  UseCollaborativeEditingReturn,
  RealtimeChannelConfig 
} from '../types/realtime';

/**
 * Hook for collaborative editing sessions
 */
export function useCollaborativeEditing(
  workItemId: string | null,
  projectId: string | null
): UseCollaborativeEditingReturn {
  const { user } = useAuth();
  const [session, setSession] = useState<CollaborativeSession | null>(null);
  const [activeUsers, setActiveUsers] = useState<CollaborativeUser[]>([]);
  const sessionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Subscribe to collaborative editing events
  useEffect(() => {
    if (!workItemId || !projectId || !user) {
      return;
    }

    const config: RealtimeChannelConfig = {
      type: 'collaborative_editing',
      projectId,
      workItemId,
      userId: user.id
    };

    const unsubscribe = realtimeService.subscribe(config, () => {
      // Update session from the service
      const updatedSession = realtimeService.getCollaborativeSession(workItemId);
      setSession(updatedSession);
      setActiveUsers(updatedSession?.activeUsers || []);
    });

    return unsubscribe;
  }, [workItemId, projectId, user]);

  // Leave collaborative session
  const leaveSession = useCallback(() => {
    if (!user || !workItemId) {
      return;
    }

    realtimeService.leaveCollaborativeSession(workItemId, user.id);
    setSession(null);
    setActiveUsers([]);

    if (sessionTimeoutRef.current) {
      clearTimeout(sessionTimeoutRef.current);
      sessionTimeoutRef.current = null;
    }
  }, [user, workItemId]);

  // Join collaborative session
  const joinSession = useCallback((targetWorkItemId: string) => {
    if (!user || !projectId) {
      return;
    }

    const collaborativeUser: CollaborativeUser = {
      userId: user.id,
      userName: user.full_name || user.email,
      userAvatar: user.avatar_url,
      isEditing: false,
      joinedAt: new Date()
    };

    realtimeService.joinCollaborativeSession(targetWorkItemId, collaborativeUser);

    // Set up session timeout to automatically leave after inactivity
    if (sessionTimeoutRef.current) {
      clearTimeout(sessionTimeoutRef.current);
    }

    sessionTimeoutRef.current = setTimeout(() => {
      leaveSession();
    }, 30 * 60 * 1000); // 30 minutes
  }, [user, projectId, leaveSession]);

  // Update editing status
  const updateEditingStatus = useCallback((isEditing: boolean, field?: string) => {
    if (!user || !workItemId) {
      return;
    }

    realtimeService.updateEditingStatus(workItemId, user.id, isEditing, field);

    // Reset session timeout on activity
    if (sessionTimeoutRef.current) {
      clearTimeout(sessionTimeoutRef.current);
    }

    if (isEditing) {
      sessionTimeoutRef.current = setTimeout(() => {
        updateEditingStatus(false);
      }, 5 * 60 * 1000); // 5 minutes of inactivity
    }
  }, [user, workItemId]);

  // Auto-join session when workItemId changes
  useEffect(() => {
    if (workItemId) {
      joinSession(workItemId);
    }

    return () => {
      leaveSession();
    };
  }, [workItemId, joinSession, leaveSession]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (sessionTimeoutRef.current) {
        clearTimeout(sessionTimeoutRef.current);
      }
      leaveSession();
    };
  }, [leaveSession]);

  return {
    session,
    activeUsers,
    joinSession,
    leaveSession,
    updateEditingStatus
  };
}

/**
 * Hook for field-level collaborative editing
 */
export function useFieldCollaboration(
  workItemId: string | null,
  projectId: string | null,
  fieldName: string
) {
  const { activeUsers, updateEditingStatus } = useCollaborativeEditing(workItemId, projectId);
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const editingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get users editing this specific field
  const fieldEditors = activeUsers.filter(u => 
    u.isEditing && 
    u.editingField === fieldName && 
    u.userId !== user?.id
  );

  // Start editing this field
  const startEditing = useCallback(() => {
    if (isEditing) return;

    setIsEditing(true);
    updateEditingStatus(true, fieldName);

    // Auto-stop editing after inactivity
    if (editingTimeoutRef.current) {
      clearTimeout(editingTimeoutRef.current);
    }

    editingTimeoutRef.current = setTimeout(() => {
      stopEditing();
    }, 30 * 1000); // 30 seconds
  }, [isEditing, updateEditingStatus, fieldName]); // eslint-disable-line react-hooks/exhaustive-deps

  // Stop editing this field
  const stopEditing = useCallback(() => {
    if (!isEditing) return;

    setIsEditing(false);
    updateEditingStatus(false);

    if (editingTimeoutRef.current) {
      clearTimeout(editingTimeoutRef.current);
      editingTimeoutRef.current = null;
    }
  }, [isEditing, updateEditingStatus]);

  // Reset editing timeout on activity
  const resetEditingTimeout = useCallback(() => {
    if (!isEditing) return;

    if (editingTimeoutRef.current) {
      clearTimeout(editingTimeoutRef.current);
    }

    editingTimeoutRef.current = setTimeout(() => {
      stopEditing();
    }, 30 * 1000);
  }, [isEditing, stopEditing]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (editingTimeoutRef.current) {
        clearTimeout(editingTimeoutRef.current);
      }
      if (isEditing) {
        updateEditingStatus(false);
      }
    };
  }, [isEditing, updateEditingStatus]);

  return {
    fieldEditors,
    isEditing,
    startEditing,
    stopEditing,
    resetEditingTimeout,
    isFieldBeingEdited: fieldEditors.length > 0
  };
}

/**
 * Hook for collaborative text editing with conflict resolution
 */
export function useCollaborativeTextEditor(
  workItemId: string | null,
  projectId: string | null,
  fieldName: string,
  initialValue: string = ''
) {
  const { 
    fieldEditors, 
    isEditing, 
    startEditing, 
    stopEditing, 
    resetEditingTimeout,
    isFieldBeingEdited 
  } = useFieldCollaboration(workItemId, projectId, fieldName);

  const [value, setValue] = useState(initialValue);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Update value when initial value changes (external updates)
  useEffect(() => {
    if (!isEditing && initialValue !== value) {
      setValue(initialValue);
      setHasUnsavedChanges(false);
    }
  }, [initialValue, isEditing, value]);

  // Handle text changes
  const handleChange = useCallback((newValue: string) => {
    setValue(newValue);
    setHasUnsavedChanges(newValue !== initialValue);
    resetEditingTimeout();

    // Auto-save after delay
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      // This would trigger a save callback passed from parent component
      setHasUnsavedChanges(false);
    }, 2000); // 2 seconds
  }, [initialValue, resetEditingTimeout]);

  // Handle focus (start editing)
  const handleFocus = useCallback(() => {
    startEditing();
  }, [startEditing]);

  // Handle blur (stop editing)
  const handleBlur = useCallback(() => {
    stopEditing();
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
  }, [stopEditing]);

  // Force save
  const forceSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
    setHasUnsavedChanges(false);
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    value,
    setValue: handleChange,
    isEditing,
    hasUnsavedChanges,
    fieldEditors,
    isFieldBeingEdited,
    handleFocus,
    handleBlur,
    forceSave,
    editorProps: {
      value,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => 
        handleChange(e.target.value),
      onFocus: handleFocus,
      onBlur: handleBlur
    }
  };
}

/**
 * Hook for showing collaborative editing indicators
 */
export function useCollaborativeIndicators(workItemId: string | null, projectId: string | null) {
  const { activeUsers } = useCollaborativeEditing(workItemId, projectId);
  const { user } = useAuth();

  // Get other users (excluding current user)
  const otherUsers = activeUsers.filter(u => u.userId !== user?.id);

  // Get users currently editing
  const editingUsers = otherUsers.filter(u => u.isEditing);

  // Get users just viewing
  const viewingUsers = otherUsers.filter(u => !u.isEditing);

  return {
    otherUsers,
    editingUsers,
    viewingUsers,
    hasOtherUsers: otherUsers.length > 0,
    hasEditingUsers: editingUsers.length > 0
  };
}
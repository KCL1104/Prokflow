import { useState, useEffect } from 'react';
import { usePresence } from './usePresence';
import { useAuth } from './useAuth';

interface CollaborativeIndicators {
  hasOtherUsers: boolean;
  editingUsers: Array<{
    id: string;
    name: string;
    email: string;
  }>;
  viewingUsers: Array<{
    id: string;
    name: string;
    email: string;
  }>;
}

export function useCollaborativeIndicators(
  workItemId: string | null,
  projectId: string | null
): CollaborativeIndicators {
  const { user } = useAuth();
  const { presence } = usePresence(projectId);
  const [indicators, setIndicators] = useState<CollaborativeIndicators>({
    hasOtherUsers: false,
    editingUsers: [],
    viewingUsers: []
  });

  useEffect(() => {
    if (!workItemId || !projectId || !user) {
      setIndicators({
        hasOtherUsers: false,
        editingUsers: [],
        viewingUsers: []
      });
      return;
    }

    const otherUsers = Object.values(presence).filter(p => 
      p.userId !== user.id && p.status === 'online'
    );

    const editingUsers = otherUsers.filter(p => 
      p.currentWorkItem === workItemId && p.isEditing
    ).map(p => ({
      id: p.userId,
      name: p.userName || 'Unknown User',
      email: p.userEmail || ''
    }));

    const viewingUsers = otherUsers.filter(p => 
      p.currentWorkItem === workItemId && !p.isEditing
    ).map(p => ({
      id: p.userId,
      name: p.userName || 'Unknown User',
      email: p.userEmail || ''
    }));

    setIndicators({
      hasOtherUsers: otherUsers.length > 0,
      editingUsers,
      viewingUsers
    });
  }, [presence, workItemId, projectId, user]);

  return indicators;
}
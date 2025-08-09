import { useContext } from 'react';
import { RealtimeCollaborationContext } from '../contexts/RealtimeCollaborationContext';

export function useRealtimeCollaboration() {
  const context = useContext(RealtimeCollaborationContext);
  if (!context) {
    throw new Error('useRealtimeCollaboration must be used within RealtimeCollaborationProvider');
  }
  return context;
}
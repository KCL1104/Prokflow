import { createContext } from 'react';
import type { 
  UserCursor,
  LiveNotification,
  PresenceState
} from '../types/realtime';

interface RealtimeCollaborationContextType {
  // Connection status
  connected: boolean;
  connecting: boolean;
  error: string | null;
  
  // Cursors
  cursors: UserCursor[];
  isTrackingCursors: boolean;
  
  // Notifications
  notifications: LiveNotification[];
  unreadCount: number;
  markNotificationAsRead: (id: string) => void;
  
  // Presence
  presence: PresenceState;
  onlineUsersCount: number;
  
  // Controls
  enableCursorTracking: (enabled: boolean) => void;
  reconnect: () => void;
}

export const RealtimeCollaborationContext = createContext<RealtimeCollaborationContextType | null>(null);
export type { RealtimeCollaborationContextType };
// Real-time collaboration types
export interface RealtimeSubscription {
  id: string;
  channel: string;
  table: string;
  filter?: string;
  callback: (payload: RealtimePayload) => void;
}

export interface RealtimePayload<T = unknown> {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: T;
  old?: T;
  errors?: string[];
  schema: string;
  table: string;
  commit_timestamp: string;
}

// Cursor tracking types
export interface UserCursor {
  userId: string;
  userName: string;
  userAvatar?: string;
  x: number;
  y: number;
  elementId?: string;
  timestamp: Date;
}

export interface CursorUpdate {
  userId: string;
  x: number;
  y: number;
  elementId?: string;
}

// Live notifications types
export interface LiveNotification {
  id: string;
  type: 'work_item_updated' | 'work_item_assigned' | 'comment_added' | 'mention' | 'sprint_updated' | 'error' | 'info';
  title: string;
  message: string;
  userId: string;
  projectId: string;
  workItemId?: string;
  sprintId?: string;
  commentId?: string;
  actionUrl?: string;
  priority?: 'low' | 'medium' | 'high';
  read: boolean;
  createdAt: Date;
}

export interface NotificationPayload {
  type: LiveNotification['type'];
  title: string;
  message: string;
  userId: string;
  projectId: string;
  workItemId?: string;
  sprintId?: string;
  commentId?: string;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
}

// Collaborative editing types
export interface CollaborativeSession {
  id: string;
  workItemId: string;
  activeUsers: CollaborativeUser[];
  lastActivity: Date;
}

export interface CollaborativeUser {
  userId: string;
  userName: string;
  userAvatar?: string;
  cursor?: UserCursor;
  isEditing: boolean;
  editingField?: string;
  joinedAt: Date;
}

// Real-time events for different entities
export interface WorkItemRealtimeEvent {
  type: 'work_item_updated' | 'work_item_created' | 'work_item_deleted';
  workItem: unknown; // Will be typed based on WorkItem interface
  userId: string;
  userName: string;
  timestamp: Date;
}

export interface CommentRealtimeEvent {
  type: 'comment_added' | 'comment_updated' | 'comment_deleted';
  comment: unknown; // Will be typed based on Comment interface
  workItemId: string;
  userId: string;
  userName: string;
  timestamp: Date;
}

export interface SprintRealtimeEvent {
  type: 'sprint_updated' | 'sprint_created' | 'sprint_deleted';
  sprint: unknown; // Will be typed based on Sprint interface
  userId: string;
  userName: string;
  timestamp: Date;
}

// Real-time connection status
export interface RealtimeConnectionStatus {
  connected: boolean;
  connecting: boolean;
  error?: string;
  lastConnected?: Date;
  reconnectAttempts: number;
}

// Real-time channel types
export type RealtimeChannelType = 
  | 'project_updates'
  | 'work_item_updates'
  | 'sprint_updates'
  | 'cursor_tracking'
  | 'notifications'
  | 'collaborative_editing';

export interface RealtimeChannelConfig {
  type: RealtimeChannelType;
  projectId: string;
  workItemId?: string;
  sprintId?: string;
  userId: string;
}

// Presence tracking types
export interface UserPresence {
  userId: string;
  userName: string;
  userEmail?: string;
  userAvatar?: string;
  status: 'online' | 'away' | 'offline';
  lastSeen: Date;
  currentPage?: string;
  currentWorkItem?: string;
  isEditing?: boolean;
}

export interface PresenceState {
  [userId: string]: UserPresence;
}

// Real-time hooks return types
export interface UseRealtimeReturn {
  connected: boolean;
  connecting: boolean;
  error: string | null;
  subscribe: (config: RealtimeChannelConfig, callback: (payload: unknown) => void) => () => void;
  unsubscribe: (channelId: string) => void;
  reconnect: () => void;
}

export interface UseCursorTrackingReturn {
  cursors: UserCursor[];
  updateCursor: (update: CursorUpdate) => void;
  isTracking: boolean;
  startTracking: () => void;
  stopTracking: () => void;
}

export interface UseNotificationsReturn {
  notifications: LiveNotification[];
  unreadCount: number;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

export interface UseCollaborativeEditingReturn {
  session: CollaborativeSession | null;
  activeUsers: CollaborativeUser[];
  joinSession: (workItemId: string) => void;
  leaveSession: () => void;
  updateEditingStatus: (isEditing: boolean, field?: string) => void;
}

export interface UsePresenceReturn {
  presence: PresenceState;
  updatePresence: (status: UserPresence['status'], metadata?: Partial<UserPresence>) => void;
  isUserOnline: (userId: string) => boolean;
}
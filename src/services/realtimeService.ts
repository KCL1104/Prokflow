import { supabase } from '../lib/supabase';
import type { 
  RealtimeChannelConfig, 
  RealtimePayload, 
  UserCursor, 
  CursorUpdate,
  LiveNotification,
  NotificationPayload,
  UserPresence,
  PresenceState,
  CollaborativeSession,
  CollaborativeUser
} from '../types/realtime';
import type { RealtimeChannel } from '@supabase/supabase-js';

class RealtimeService {
  private channels: Map<string, RealtimeChannel> = new Map();
  private cursors: Map<string, UserCursor> = new Map();
  private presence: Map<string, UserPresence> = new Map();
  private collaborativeSessions: Map<string, CollaborativeSession> = new Map();

  /**
   * Subscribe to real-time updates for a specific channel
   */
  subscribe(
    config: RealtimeChannelConfig,
    callback: (payload: RealtimePayload) => void
  ): () => void {
    const channelId = this.generateChannelId(config);
    
    // Remove existing channel if it exists
    if (this.channels.has(channelId)) {
      this.unsubscribe(channelId);
    }

    const channel = supabase.channel(channelId);

    // Configure channel based on type
    switch (config.type) {
      case 'project_updates':
        this.setupProjectUpdatesChannel(channel, config, callback);
        break;
      case 'work_item_updates':
        this.setupWorkItemUpdatesChannel(channel, config, callback);
        break;
      case 'sprint_updates':
        this.setupSprintUpdatesChannel(channel, config, callback);
        break;
      case 'cursor_tracking':
        this.setupCursorTrackingChannel(channel, config);
        break;
      case 'notifications':
        this.setupNotificationsChannel(channel, config, callback);
        break;
      case 'collaborative_editing':
        this.setupCollaborativeEditingChannel(channel, config);
        break;
    }

    // Subscribe to the channel
    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log(`Subscribed to channel: ${channelId}`);
      } else if (status === 'CHANNEL_ERROR') {
        console.error(`Error subscribing to channel: ${channelId}`);
      }
    });

    this.channels.set(channelId, channel);

    // Return unsubscribe function
    return () => this.unsubscribe(channelId);
  }

  /**
   * Unsubscribe from a specific channel
   */
  unsubscribe(channelId: string): void {
    const channel = this.channels.get(channelId);
    if (channel) {
      channel.unsubscribe();
      this.channels.delete(channelId);
      console.log(`Unsubscribed from channel: ${channelId}`);
    }
  }

  /**
   * Unsubscribe from all channels
   */
  unsubscribeAll(): void {
    this.channels.forEach((channel, channelId) => {
      channel.unsubscribe();
      console.log(`Unsubscribed from channel: ${channelId}`);
    });
    this.channels.clear();
  }

  /**
   * Update cursor position for collaborative editing
   */
  updateCursor(projectId: string, cursor: CursorUpdate): void {
    const channelId = `cursor_tracking_${projectId}`;
    const channel = this.channels.get(channelId);
    
    if (channel) {
      channel.send({
        type: 'broadcast',
        event: 'cursor_update',
        payload: cursor
      });
    }
  }

  /**
   * Send a live notification
   */
  sendNotification(projectId: string, notification: NotificationPayload): void {
    const channelId = `notifications_${projectId}`;
    const channel = this.channels.get(channelId);
    
    if (channel) {
      channel.send({
        type: 'broadcast',
        event: 'notification',
        payload: notification
      });
    }
  }

  /**
   * Update user presence
   */
  updatePresence(projectId: string, presence: Partial<UserPresence>): void {
    const channelId = `project_updates_${projectId}`;
    const channel = this.channels.get(channelId);
    
    if (channel) {
      channel.track(presence);
    }
  }

  /**
   * Join collaborative editing session
   */
  joinCollaborativeSession(workItemId: string, user: CollaborativeUser): void {
    const channelId = `collaborative_editing_${workItemId}`;
    const channel = this.channels.get(channelId);
    
    if (channel) {
      channel.send({
        type: 'broadcast',
        event: 'user_joined',
        payload: user
      });
    }
  }

  /**
   * Leave collaborative editing session
   */
  leaveCollaborativeSession(workItemId: string, userId: string): void {
    const channelId = `collaborative_editing_${workItemId}`;
    const channel = this.channels.get(channelId);
    
    if (channel) {
      channel.send({
        type: 'broadcast',
        event: 'user_left',
        payload: { userId }
      });
    }
  }

  /**
   * Update editing status in collaborative session
   */
  updateEditingStatus(workItemId: string, userId: string, isEditing: boolean, field?: string): void {
    const channelId = `collaborative_editing_${workItemId}`;
    const channel = this.channels.get(channelId);
    
    if (channel) {
      channel.send({
        type: 'broadcast',
        event: 'editing_status_update',
        payload: { userId, isEditing, field }
      });
    }
  }

  // Private helper methods

  private generateChannelId(config: RealtimeChannelConfig): string {
    const { type, projectId, workItemId, sprintId } = config;
    
    switch (type) {
      case 'project_updates':
        return `project_updates_${projectId}`;
      case 'work_item_updates':
        return workItemId ? `work_item_updates_${workItemId}` : `work_items_${projectId}`;
      case 'sprint_updates':
        return sprintId ? `sprint_updates_${sprintId}` : `sprints_${projectId}`;
      case 'cursor_tracking':
        return `cursor_tracking_${projectId}`;
      case 'notifications':
        return `notifications_${projectId}`;
      case 'collaborative_editing':
        return workItemId ? `collaborative_editing_${workItemId}` : `collaborative_${projectId}`;
      default:
        return `${type}_${projectId}`;
    }
  }

  private setupProjectUpdatesChannel(
    channel: RealtimeChannel,
    config: RealtimeChannelConfig,
    callback: (payload: RealtimePayload) => void
  ): void {
    // Listen to project table changes
    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'projects',
        filter: `id=eq.${config.projectId}`
      },
      callback
    );

    // Listen to project members changes
    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'project_members',
        filter: `project_id=eq.${config.projectId}`
      },
      callback
    );

    // Track user presence
    channel.on('presence', { event: 'sync' }, () => {
      const presenceState = channel.presenceState();
      this.handlePresenceSync(this.convertPresenceState(presenceState));
    });

    channel.on('presence', { event: 'join' }, ({ key, newPresences }: { key: string; newPresences: UserPresence[] }) => {
      this.handlePresenceJoin(key, newPresences);
    });

    channel.on('presence', { event: 'leave' }, ({ key, leftPresences }: { key: string; leftPresences: UserPresence[] }) => {
      this.handlePresenceLeave(key, leftPresences);
    });
  }

  private setupWorkItemUpdatesChannel(
    channel: RealtimeChannel,
    config: RealtimeChannelConfig,
    callback: (payload: RealtimePayload) => void
  ): void {
    const filter = config.workItemId 
      ? `id=eq.${config.workItemId}`
      : `project_id=eq.${config.projectId}`;

    // Listen to work items changes
    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'work_items',
        filter
      },
      callback
    );

    // Listen to comments changes
    if (config.workItemId) {
      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: `work_item_id=eq.${config.workItemId}`
        },
        callback
      );
    }
  }

  private setupSprintUpdatesChannel(
    channel: RealtimeChannel,
    config: RealtimeChannelConfig,
    callback: (payload: RealtimePayload) => void
  ): void {
    const filter = config.sprintId 
      ? `id=eq.${config.sprintId}`
      : `project_id=eq.${config.projectId}`;

    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'sprints',
        filter
      },
      callback
    );
  }

  private setupCursorTrackingChannel(
    channel: RealtimeChannel,
    _config: RealtimeChannelConfig
  ): void {
    channel.on('broadcast', { event: 'cursor_update' }, ({ payload }: { payload: CursorUpdate }) => {
      this.handleCursorUpdate(payload);
    });
  }

  private setupNotificationsChannel(
    channel: RealtimeChannel,
    _config: RealtimeChannelConfig,
    callback: (payload: RealtimePayload) => void
  ): void {
    channel.on('broadcast', { event: 'notification' }, ({ payload }: { payload: NotificationPayload }) => {
      this.handleNotification(payload, callback);
    });
  }

  private setupCollaborativeEditingChannel(
    channel: RealtimeChannel,
    config: RealtimeChannelConfig
  ): void {
    channel.on('broadcast', { event: 'user_joined' }, ({ payload }: { payload: CollaborativeUser }) => {
      this.handleUserJoinedSession(config.workItemId!, payload);
    });

    channel.on('broadcast', { event: 'user_left' }, ({ payload }: { payload: { userId: string } }) => {
      this.handleUserLeftSession(config.workItemId!, payload.userId);
    });

    channel.on('broadcast', { event: 'editing_status_update' }, ({ payload }: { payload: { userId: string; isEditing: boolean; field?: string } }) => {
      this.handleEditingStatusUpdate(config.workItemId!, payload);
    });
  }

  private convertPresenceState(presenceState: Record<string, { presence_ref: string }[]>): Record<string, UserPresence[]> {
    const converted: Record<string, UserPresence[]> = {};
    
    Object.entries(presenceState).forEach(([userId, presences]) => {
      if (presences && presences.length > 0) {
        // Convert Supabase presence format to our UserPresence format
        const userPresences: UserPresence[] = presences.map(presence => ({
          userId,
          userName: userId, // Default to userId, should be updated with actual user data
          status: 'online' as const,
          lastSeen: new Date(),
          ...presence // Spread any additional properties from the presence object
        }));
        converted[userId] = userPresences;
      }
    });
    
    return converted;
  }

  private handlePresenceSync(presenceState: Record<string, UserPresence[]>): void {
    // Update local presence state
    Object.entries(presenceState).forEach(([userId, presences]) => {
      if (presences && presences.length > 0) {
        const presence = presences[0];
        this.presence.set(userId, presence);
      }
    });
  }

  private handlePresenceJoin(key: string, newPresences: UserPresence[]): void {
    if (newPresences && newPresences.length > 0) {
      const presence = newPresences[0];
      this.presence.set(key, presence);
    }
  }

  private handlePresenceLeave(key: string, _leftPresences: UserPresence[]): void {
    this.presence.delete(key);
  }

  private handleCursorUpdate(cursor: CursorUpdate): void {
    const existingCursor = this.cursors.get(cursor.userId);
    const updatedCursor: UserCursor = {
      userName: 'Unknown User',
      ...existingCursor,
      ...cursor,
      timestamp: new Date()
    };
    
    this.cursors.set(cursor.userId, updatedCursor);
  }

  private handleNotification(
    payload: NotificationPayload,
    callback: (payload: RealtimePayload) => void
  ): void {
    const notification: LiveNotification = {
      id: crypto.randomUUID(),
      ...payload,
      read: false,
      createdAt: new Date()
    };

    // Call the callback with the notification
    callback({
      eventType: 'INSERT',
      new: notification,
      schema: 'public',
      table: 'notifications',
      commit_timestamp: new Date().toISOString()
    });
  }

  private handleUserJoinedSession(workItemId: string, user: CollaborativeUser): void {
    const session = this.collaborativeSessions.get(workItemId);
    if (session) {
      const existingUserIndex = session.activeUsers.findIndex(u => u.userId === user.userId);
      if (existingUserIndex >= 0) {
        session.activeUsers[existingUserIndex] = user;
      } else {
        session.activeUsers.push(user);
      }
      session.lastActivity = new Date();
    } else {
      this.collaborativeSessions.set(workItemId, {
        id: crypto.randomUUID(),
        workItemId,
        activeUsers: [user],
        lastActivity: new Date()
      });
    }
  }

  private handleUserLeftSession(workItemId: string, userId: string): void {
    const session = this.collaborativeSessions.get(workItemId);
    if (session) {
      session.activeUsers = session.activeUsers.filter(u => u.userId !== userId);
      session.lastActivity = new Date();
      
      // Remove session if no active users
      if (session.activeUsers.length === 0) {
        this.collaborativeSessions.delete(workItemId);
      }
    }
  }

  private handleEditingStatusUpdate(workItemId: string, payload: { userId: string; isEditing: boolean; field?: string }): void {
    const session = this.collaborativeSessions.get(workItemId);
    if (session) {
      const user = session.activeUsers.find(u => u.userId === payload.userId);
      if (user) {
        user.isEditing = payload.isEditing;
        user.editingField = payload.field;
      }
      session.lastActivity = new Date();
    }
  }

  // Getter methods for accessing cached data
  getCursors(): UserCursor[] {
    return Array.from(this.cursors.values());
  }

  getPresence(): PresenceState {
    const presenceState: PresenceState = {};
    this.presence.forEach((presence, userId) => {
      presenceState[userId] = presence;
    });
    return presenceState;
  }

  getCollaborativeSession(workItemId: string): CollaborativeSession | null {
    return this.collaborativeSessions.get(workItemId) || null;
  }

  isConnected(): boolean {
    return supabase.realtime.isConnected();
  }

  getConnectionStatus() {
    return {
      connected: this.isConnected(),
      channels: this.channels.size
    };
  }

  /**
   * Subscribe to work items updates for a project
   */
  subscribeToWorkItems(projectId: string, userId: string, callback: (payload: RealtimePayload) => void): () => void {
    return this.subscribe({
      type: 'work_item_updates',
      projectId,
      userId
    }, callback);
  }

  /**
   * Track user presence in a project
   */
  async trackPresence(projectId: string, presenceData: UserPresence): Promise<void> {
    const channelId = `presence:${projectId}`;
    
    // Remove existing channel if it exists
    if (this.channels.has(channelId)) {
      this.unsubscribe(channelId);
    }

    const channel = supabase.channel(channelId);
    
    channel.on('presence', { event: 'sync' }, () => {
      const presenceState = channel.presenceState();
      this.handlePresenceSync(this.convertPresenceState(presenceState));
    });

    channel.on('presence', { event: 'join' }, ({ key, newPresences }: { key: string; newPresences: UserPresence[] }) => {
      this.handlePresenceJoin(key, newPresences);
    });

    channel.on('presence', { event: 'leave' }, ({ key, leftPresences }: { key: string; leftPresences: UserPresence[] }) => {
      this.handlePresenceLeave(key, leftPresences);
    });

    await channel.subscribe();
    await channel.track(presenceData);
    
    this.channels.set(channelId, channel);
  }

  /**
   * Broadcast a message to a project channel
   */
  async broadcastMessage(projectId: string, message: Record<string, unknown>): Promise<void> {
    const channelId = `broadcast:${projectId}`;
    
    let channel = this.channels.get(channelId);
    if (!channel) {
      channel = supabase.channel(channelId);
      await channel.subscribe();
      this.channels.set(channelId, channel);
    }

    await channel.send({
      type: 'broadcast',
      event: 'message',
      payload: message
    });
  }

  /**
   * Clean up all subscriptions and channels
   */
  async cleanup(): Promise<void> {
    const unsubscribePromises = Array.from(this.channels.values()).map(channel => 
      channel.unsubscribe()
    );
    
    await Promise.all(unsubscribePromises);
    this.channels.clear();
    this.cursors.clear();
    this.presence.clear();
    this.collaborativeSessions.clear();
  }
}

// Export singleton instance
export const realtimeService = new RealtimeService();
export default realtimeService;
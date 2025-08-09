import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { UserPresence } from '../../types';

// Define CursorPosition locally since it's not in types
interface CursorPosition {
  x: number;
  y: number;
  elementId?: string;
}

export interface CollaborationState {
  // Connection status
  isConnected: boolean;
  isConnecting: boolean;
  connectionError: string | null;
  lastConnected: number | null;
  
  // Presence tracking
  presence: UserPresence[];
  onlineUsersCount: number;
  
  // Cursor tracking
  cursors: Record<string, CursorPosition>;
  isTrackingCursors: boolean;
  
  // Collaborative sessions
  activeSessions: {
    id: string;
    type: 'document' | 'board' | 'planning';
    participants: string[];
    startedAt: string;
    lastActivity: string;
  }[];
  
  // Real-time updates
  pendingUpdates: {
    id: string;
    type: 'work_item' | 'project' | 'sprint';
    action: 'create' | 'update' | 'delete';
    data: any;
    timestamp: number;
    userId: string;
  }[];
  
  // Settings
  settings: {
    enableCursorTracking: boolean;
    enablePresenceIndicators: boolean;
    enableLiveUpdates: boolean;
    enableNotifications: boolean;
    cursorUpdateInterval: number;
  };
}

const initialState: CollaborationState = {
  isConnected: false,
  isConnecting: false,
  connectionError: null,
  lastConnected: null,
  
  presence: [],
  onlineUsersCount: 0,
  
  cursors: {},
  isTrackingCursors: false,
  
  activeSessions: [],
  
  pendingUpdates: [],
  
  settings: {
    enableCursorTracking: true,
    enablePresenceIndicators: true,
    enableLiveUpdates: true,
    enableNotifications: true,
    cursorUpdateInterval: 100,
  },
};

const collaborationSlice = createSlice({
  name: 'collaboration',
  initialState,
  reducers: {
    // Connection management
    setConnecting: (state, action: PayloadAction<boolean>) => {
      state.isConnecting = action.payload;
      if (action.payload) {
        state.connectionError = null;
      }
    },
    setConnected: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
      state.isConnecting = false;
      if (action.payload) {
        state.lastConnected = Date.now();
        state.connectionError = null;
      }
    },
    setConnectionError: (state, action: PayloadAction<string | null>) => {
      state.connectionError = action.payload;
      state.isConnecting = false;
      if (action.payload) {
        state.isConnected = false;
      }
    },
    
    // Presence management
    setPresence: (state, action: PayloadAction<UserPresence[]>) => {
      state.presence = action.payload;
      state.onlineUsersCount = action.payload.filter(p => p.status === 'online').length;
    },
    updateUserPresence: (state, action: PayloadAction<UserPresence>) => {
      const index = state.presence.findIndex(p => p.userId === action.payload.userId);
      if (index !== -1) {
        state.presence[index] = action.payload;
      } else {
        state.presence.push(action.payload);
      }
      state.onlineUsersCount = state.presence.filter(p => p.status === 'online').length;
    },
    removeUserPresence: (state, action: PayloadAction<string>) => {
      state.presence = state.presence.filter(p => p.userId !== action.payload);
      state.onlineUsersCount = state.presence.filter(p => p.status === 'online').length;
    },
    
    // Cursor tracking
    setCursorTracking: (state, action: PayloadAction<boolean>) => {
      state.isTrackingCursors = action.payload;
      if (!action.payload) {
        state.cursors = {};
      }
    },
    updateCursor: (state, action: PayloadAction<{ userId: string; position: CursorPosition }>) => {
      const { userId, position } = action.payload;
      state.cursors[userId] = position;
    },
    removeCursor: (state, action: PayloadAction<string>) => {
      delete state.cursors[action.payload];
    },
    clearCursors: (state) => {
      state.cursors = {};
    },
    
    // Collaborative sessions
    addSession: (state, action: PayloadAction<CollaborationState['activeSessions'][0]>) => {
      state.activeSessions.push(action.payload);
    },
    updateSession: (state, action: PayloadAction<{ id: string; updates: Partial<CollaborationState['activeSessions'][0]> }>) => {
      const { id, updates } = action.payload;
      const index = state.activeSessions.findIndex(s => s.id === id);
      if (index !== -1) {
        state.activeSessions[index] = { ...state.activeSessions[index], ...updates };
      }
    },
    removeSession: (state, action: PayloadAction<string>) => {
      state.activeSessions = state.activeSessions.filter(s => s.id !== action.payload);
    },
    
    // Real-time updates
    addPendingUpdate: (state, action: PayloadAction<CollaborationState['pendingUpdates'][0]>) => {
      state.pendingUpdates.push(action.payload);
      // Keep only last 50 updates
      if (state.pendingUpdates.length > 50) {
        state.pendingUpdates = state.pendingUpdates.slice(-50);
      }
    },
    removePendingUpdate: (state, action: PayloadAction<string>) => {
      state.pendingUpdates = state.pendingUpdates.filter(u => u.id !== action.payload);
    },
    clearPendingUpdates: (state) => {
      state.pendingUpdates = [];
    },
    
    // Settings
    updateSettings: (state, action: PayloadAction<Partial<CollaborationState['settings']>>) => {
      state.settings = { ...state.settings, ...action.payload };
    },
    
    // Reset
    reset: () => initialState,
    
    // Disconnect cleanup
    disconnect: (state) => {
      state.isConnected = false;
      state.isConnecting = false;
      state.presence = [];
      state.onlineUsersCount = 0;
      state.cursors = {};
      state.activeSessions = [];
      state.pendingUpdates = [];
    },
  },
});

export const {
  setConnecting,
  setConnected,
  setConnectionError,
  setPresence,
  updateUserPresence,
  removeUserPresence,
  setCursorTracking,
  updateCursor,
  removeCursor,
  clearCursors,
  addSession,
  updateSession,
  removeSession,
  addPendingUpdate,
  removePendingUpdate,
  clearPendingUpdates,
  updateSettings,
  reset,
  disconnect,
} = collaborationSlice.actions;

export default collaborationSlice.reducer;
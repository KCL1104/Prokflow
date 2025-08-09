import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { User } from '@supabase/supabase-js';
import { AuthService } from '../../services/authService';
import type { User as UserProfile } from '../../types';
import type { Database } from '../../types/database';

type DbUser = Database['public']['Tables']['users']['Row'];

// Transform database user to domain user
function transformDbUser(dbUser: DbUser): UserProfile {
  return {
    id: dbUser.id,
    email: dbUser.email,
    fullName: dbUser.full_name || undefined,
    full_name: dbUser.full_name || undefined,
    avatarUrl: dbUser.avatar_url || undefined,
    avatar_url: dbUser.avatar_url || undefined,
    timezone: dbUser.timezone || 'UTC',
    createdAt: new Date(dbUser.created_at || new Date()),
    updatedAt: new Date(dbUser.updated_at || new Date()),
    created_at: dbUser.created_at || undefined,
    updated_at: dbUser.updated_at || undefined
  };
}

export interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  sessionRefreshing: boolean;
}

const initialState: AuthState = {
  user: null,
  profile: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,
  sessionRefreshing: false,
};

// Async thunks
export const getCurrentUserProfile = createAsyncThunk(
  'auth/getCurrentUserProfile',
  async (_, { rejectWithValue }) => {
    try {
      return await AuthService.getCurrentUserProfile();
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to get user profile');
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'auth/updateUserProfile',
  async (updates: Partial<UserProfile>, { rejectWithValue }) => {
    try {
      return await AuthService.updateUserProfile(updates);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update profile');
    }
  }
);

export const refreshSession = createAsyncThunk(
  'auth/refreshSession',
  async (_, { rejectWithValue }) => {
    try {
      return await AuthService.refreshSession();
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to refresh session');
    }
  }
);

export const signOut = createAsyncThunk(
  'auth/signOut',
  async (_, { rejectWithValue }) => {
    try {
      await AuthService.signOut();
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to sign out');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      state.isLoading = false;
    },
    setProfile: (state, action: PayloadAction<UserProfile | null>) => {
      state.profile = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    reset: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // getCurrentUserProfile
      .addCase(getCurrentUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getCurrentUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload ? transformDbUser(action.payload) : null;
      })
      .addCase(getCurrentUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // updateUserProfile
      .addCase(updateUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload ? transformDbUser(action.payload) : null;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // refreshSession
      .addCase(refreshSession.pending, (state) => {
        state.sessionRefreshing = true;
      })
      .addCase(refreshSession.fulfilled, (state, action) => {
        state.sessionRefreshing = false;
        if (action.payload) {
          state.user = action.payload.user;
          state.isAuthenticated = true;
        }
      })
      .addCase(refreshSession.rejected, (state, action) => {
        state.sessionRefreshing = false;
        state.error = action.payload as string;
      })
      // signOut
      .addCase(signOut.fulfilled, (state) => {
        state.user = null;
        state.profile = null;
        state.isAuthenticated = false;
        state.isLoading = false;
        state.error = null;
      });
  },
});

export const { setUser, setProfile, setLoading, setError, clearError, reset } = authSlice.actions;
export default authSlice.reducer;
<<<<<<< HEAD
import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error('Missing VITE_SUPABASE_URL environment variable')
}

if (!supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_ANON_KEY environment variable')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})
=======
import { createClient, type Session } from '@supabase/supabase-js'
import type { Database } from '../types/database'
import { config } from '../config/environment'

export const supabase = createClient<Database>(
  config.supabase.url, 
  config.supabase.anonKey, 
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    },
    realtime: {
      params: {
        eventsPerSecond: config.features.enableRealtime ? 10 : 0
      }
    },
    global: {
      headers: {
        'X-Client-Info': `${config.app.name}/${config.app.version}`
      }
    }
  }
)
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)

// Auth configuration with type safety
interface AuthConfig {
  email: {
    confirmEmail: boolean;
    redirectTo: string;
  };
  providers: {
    google: {
      scopes: string;
      redirectTo: string;
    };
    github: {
      scopes: string;
      redirectTo: string;
    };
  };
}

export const authConfig: AuthConfig = {
  // Email/password configuration
  email: {
    confirmEmail: true,
    redirectTo: `${window.location.origin}/auth/callback`
  },

  // Social provider configuration
  providers: {
    google: {
      scopes: 'email profile',
      redirectTo: `${window.location.origin}/auth/callback`
    },
    github: {
      scopes: 'user:email',
      redirectTo: `${window.location.origin}/auth/callback`
    }
  }
}

// Helper functions for authentication
export const auth = {
  // Sign up with email and password
  signUp: async (email: string, password: string, userData?: { full_name?: string }) => {
    return await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
        emailRedirectTo: authConfig.email.redirectTo
      }
    })
  },

  // Sign in with email and password
  signIn: async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({
      email,
      password
    })
  },

  // Sign in with social provider
  signInWithProvider: async (provider: 'google' | 'github') => {
    if (provider === 'google') {
      return await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: authConfig.providers.google.redirectTo,
          scopes: authConfig.providers.google.scopes
        }
      })
    } else {
      return await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: authConfig.providers.github.redirectTo,
          scopes: authConfig.providers.github.scopes
        }
      })
    }
  },

  // Sign out
  signOut: async () => {
    return await supabase.auth.signOut()
  },

  // Reset password
  resetPassword: async (email: string) => {
    return await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    })
  },

  // Update password
  updatePassword: async (password: string) => {
    return await supabase.auth.updateUser({ password })
  },

  // Get current session
  getSession: async () => {
    return await supabase.auth.getSession()
  },

  // Get current user
  getUser: async () => {
    return await supabase.auth.getUser()
  },

  // Listen to auth state changes
<<<<<<< HEAD
  onAuthStateChange: (callback: (event: string, session: any) => void) => {
=======
  onAuthStateChange: (callback: (event: string, session: Session | null) => void) => {
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
    return supabase.auth.onAuthStateChange(callback)
  }
}

// Helper function to check if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  const { data: { session } } = await supabase.auth.getSession()
  return !!session
}

// Helper function to get current user ID
export const getCurrentUserId = async (): Promise<string | null> => {
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id || null
}
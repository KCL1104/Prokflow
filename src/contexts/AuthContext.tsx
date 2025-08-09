import { createContext, useContext, useEffect, useState } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase, auth } from '../lib/supabase'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
<<<<<<< HEAD
  signUp: (email: string, password: string, userData?: { full_name?: string }) => Promise<any>
  signIn: (email: string, password: string) => Promise<any>
  signInWithProvider: (provider: 'google' | 'github') => Promise<any>
  signOut: () => Promise<any>
  resetPassword: (email: string) => Promise<any>
  updatePassword: (password: string) => Promise<any>
=======
  signUp: (email: string, password: string, userData?: { full_name?: string }) => Promise<{ user: User | null; error: Error | null }>
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: Error | null }>
  signInWithProvider: (provider: 'google' | 'github') => Promise<{ user: User | null; error: Error | null }>
  signOut: () => Promise<{ error: Error | null }>
  resetPassword: (email: string) => Promise<{ error: Error | null }>
  updatePassword: (password: string) => Promise<{ error: Error | null }>
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

<<<<<<< HEAD
=======
// eslint-disable-next-line react-refresh/only-export-components
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)

        // Handle specific auth events
        switch (event) {
          case 'SIGNED_IN':
            console.log('User signed in:', session?.user?.email)
            break
          case 'SIGNED_OUT':
            console.log('User signed out')
            break
          case 'TOKEN_REFRESHED':
            console.log('Token refreshed')
            break
          case 'USER_UPDATED':
            console.log('User updated')
            break
          case 'PASSWORD_RECOVERY':
            console.log('Password recovery initiated')
            break
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

<<<<<<< HEAD
=======
  // Wrapper for signUp to match expected interface
  const signUp = async (email: string, password: string, userData?: { full_name?: string }) => {
    const response = await auth.signUp(email, password, userData)
    return {
      user: response.data?.user || null,
      error: response.error
    }
  }

  // Wrapper for signIn to match expected interface
  const signIn = async (email: string, password: string) => {
    const response = await auth.signIn(email, password)
    return {
      user: response.data?.user || null,
      error: response.error
    }
  }

  // Wrapper for signInWithProvider to match expected interface
  const signInWithProvider = async (provider: 'google' | 'github') => {
    const response = await auth.signInWithProvider(provider)
    return {
      user: null, // OAuth redirects, so user will be null initially
      error: response.error
    }
  }

>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
  const value: AuthContextType = {
    user,
    session,
    loading,
<<<<<<< HEAD
    signUp: auth.signUp,
    signIn: auth.signIn,
    signInWithProvider: auth.signInWithProvider,
=======
    signUp,
    signIn,
    signInWithProvider,
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
    signOut: auth.signOut,
    resetPassword: auth.resetPassword,
    updatePassword: auth.updatePassword
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Higher-order component for protected routes
<<<<<<< HEAD
=======
// eslint-disable-next-line react-refresh/only-export-components
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
export const withAuth = <P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> => {
  return (props: P) => {
    const { user, loading } = useAuth()

    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      )
    }

    if (!user) {
      // Redirect to login or show login component
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
            <p className="text-gray-600">Please sign in to access this page.</p>
          </div>
        </div>
      )
    }

    return <Component {...props} />
  }
}
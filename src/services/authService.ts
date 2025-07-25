import { supabase } from '../lib/supabase'
import type { Database } from '../types/database'

type User = Database['public']['Tables']['users']['Row']
// type UserInsert = Database['public']['Tables']['users']['Insert'] // Unused for now
type UserUpdate = Database['public']['Tables']['users']['Update']

export class AuthService {
  /**
   * Get current user profile from the users table
   */
  static async getCurrentUserProfile(): Promise<User | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) return null

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Error fetching user profile:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in getCurrentUserProfile:', error)
      return null
    }
  }

  /**
   * Update user profile
   */
  static async updateUserProfile(updates: UserUpdate): Promise<User | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) throw new Error('No authenticated user')

      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating user profile:', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('Error in updateUserProfile:', error)
      throw error
    }
  }

  /**
   * Check if user has completed their profile
   */
  static async isProfileComplete(): Promise<boolean> {
    try {
      const profile = await this.getCurrentUserProfile()
      
      if (!profile) return false

      // Check if required profile fields are filled
      return !!(profile.full_name && profile.email)
    } catch (error) {
      console.error('Error checking profile completion:', error)
      return false
    }
  }

  /**
   * Get user's project memberships
   */
  static async getUserProjectMemberships() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) return []

      const { data, error } = await supabase
        .from('project_members')
        .select(`
          *,
          projects (
            id,
            name,
            description,
            methodology,
            created_at
          )
        `)
        .eq('user_id', user.id)

      if (error) {
        console.error('Error fetching project memberships:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getUserProjectMemberships:', error)
      return []
    }
  }

  /**
   * Check if user has permission for a specific project
   */
  static async hasProjectPermission(
    projectId: string, 
    requiredRole?: Database['public']['Enums']['project_role']
  ): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) return false

      const { data, error } = await supabase
        .from('project_members')
        .select('role')
        .eq('project_id', projectId)
        .eq('user_id', user.id)
        .single()

      if (error || !data) return false

      if (!requiredRole) return true

      // Role hierarchy: owner > admin > member > viewer
      const roleHierarchy = {
        'viewer': 0,
        'member': 1,
        'admin': 2,
        'owner': 3
      }

      return roleHierarchy[data.role] >= roleHierarchy[requiredRole]
    } catch (error) {
      console.error('Error checking project permission:', error)
      return false
    }
  }

  /**
   * Sign out and clear any cached data
   */
  static async signOut(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('Error signing out:', error)
        throw error
      }

      // Clear any cached data or local storage if needed
      localStorage.removeItem('project-cache')
      sessionStorage.clear()
    } catch (error) {
      console.error('Error in signOut:', error)
      throw error
    }
  }

  /**
   * Refresh user session
   */
  static async refreshSession() {
    try {
      const { data, error } = await supabase.auth.refreshSession()
      
      if (error) {
        console.error('Error refreshing session:', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('Error in refreshSession:', error)
      throw error
    }
  }
}
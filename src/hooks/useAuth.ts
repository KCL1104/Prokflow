import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
<<<<<<< HEAD
import type { User } from '@supabase/supabase-js';
=======
import type { User } from '../types';
import type { User as SupabaseUser } from '@supabase/supabase-js';

// Helper function to map Supabase user to our User type
const mapSupabaseUser = (supabaseUser: SupabaseUser | null): User | null => {
  if (!supabaseUser) return null;
  
  return {
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    fullName: supabaseUser.user_metadata?.full_name,
    full_name: supabaseUser.user_metadata?.full_name, // For compatibility
    avatarUrl: supabaseUser.user_metadata?.avatar_url,
    avatar_url: supabaseUser.user_metadata?.avatar_url, // For compatibility
    timezone: supabaseUser.user_metadata?.timezone || 'UTC',
    createdAt: new Date(supabaseUser.created_at),
    updatedAt: new Date(supabaseUser.updated_at || supabaseUser.created_at)
  };
};
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
<<<<<<< HEAD
      setUser(session?.user ?? null);
=======
      setUser(mapSupabaseUser(session?.user ?? null));
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
<<<<<<< HEAD
        setUser(session?.user ?? null);
=======
        setUser(mapSupabaseUser(session?.user ?? null));
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };
}
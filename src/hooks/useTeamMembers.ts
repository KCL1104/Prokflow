import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { TeamMember, User } from '../types';

interface TeamMemberWithUser extends TeamMember {
  user: User;
}

interface UseTeamMembersReturn {
  teamMembers: TeamMemberWithUser[];
  loading: boolean;
  error: string | null;
  fetchTeamMembers: (projectId: string) => Promise<void>;
}

export const useTeamMembers = (projectId?: string): UseTeamMembersReturn => {
  const [teamMembers, setTeamMembers] = useState<TeamMemberWithUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTeamMembers = async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data: members, error: membersError } = await supabase
        .from('project_members')
        .select(`
          *,
          user:users(*)
        `)
        .eq('project_id', id);

      if (membersError) {
        throw new Error(`Failed to fetch team members: ${membersError.message}`);
      }

      const transformedMembers: TeamMemberWithUser[] = (members || []).map(member => ({
        id: member.id,
        userId: member.user_id,
        projectId: member.project_id,
        role: member.role,
        name: member.user.full_name || member.user.email || 'Unknown User',
        email: member.user.email || 'unknown@example.com',
        joinedAt: member.joined_at ? new Date(member.joined_at) : new Date(),
        user: {
          id: member.user.id,
          email: member.user.email,
          fullName: member.user.full_name ?? undefined,
          full_name: member.user.full_name ?? undefined,
          avatarUrl: member.user.avatar_url ?? undefined,
          avatar_url: member.user.avatar_url ?? undefined,
          timezone: member.user.timezone ?? 'UTC',
          createdAt: member.user.created_at ? new Date(member.user.created_at) : new Date(),
          updatedAt: member.user.updated_at ? new Date(member.user.updated_at) : new Date(),
          created_at: member.user.created_at,
          updated_at: member.user.updated_at,
        }
      }));

      setTeamMembers(transformedMembers);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch team members';
      setError(errorMessage);
      console.error('Error fetching team members:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchTeamMembers(projectId);
    }
  }, [projectId]);

  return {
    teamMembers,
    loading,
    error,
    fetchTeamMembers,
  };
};
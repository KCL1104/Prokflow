import React, { useState } from 'react';
<<<<<<< HEAD
import { Button } from '../common/Button';
=======
import { Button } from '../ui/button';
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
import { Loading } from '../common/Loading';
import { Modal } from '../common/Modal';
import type { Project, TeamMember } from '../../types';

interface TeamMemberManagementProps {
  project: Project;
  onAddMember: (userId: string, role: string) => Promise<void>;
  onRemoveMember: (userId: string) => Promise<void>;
  onUpdateMemberRole: (userId: string, role: string) => Promise<void>;
  isLoading?: boolean;
}

const ROLE_OPTIONS = [
  { value: 'viewer', label: 'Viewer', description: 'Can view project content' },
  { value: 'member', label: 'Member', description: 'Can create and edit work items' },
  { value: 'admin', label: 'Admin', description: 'Can manage project settings and members' },
  { value: 'owner', label: 'Owner', description: 'Full project control' }
] as const;

export const TeamMemberManagement: React.FC<TeamMemberManagementProps> = ({
  project,
  onAddMember,
  onRemoveMember,
  onUpdateMemberRole,
  isLoading = false
}) => {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    userId: '',
<<<<<<< HEAD
    role: 'member' as const
=======
    role: 'member' as 'admin' | 'member' | 'viewer'
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
  });
  const [inviteLoading, setInviteLoading] = useState(false);
  const [editingMember, setEditingMember] = useState<string | null>(null);

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inviteForm.userId.trim()) {
      return;
    }

    setInviteLoading(true);
    try {
      await onAddMember(inviteForm.userId, inviteForm.role);
      setShowInviteModal(false);
      setInviteForm({ userId: '', role: 'member' });
    } catch (error) {
      console.error('Failed to invite member:', error);
    } finally {
      setInviteLoading(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (window.confirm('Are you sure you want to remove this team member?')) {
      try {
        await onRemoveMember(userId);
      } catch (error) {
        console.error('Failed to remove member:', error);
      }
    }
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      await onUpdateMemberRole(userId, newRole);
      setEditingMember(null);
    } catch (error) {
      console.error('Failed to update member role:', error);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-purple-100 text-purple-800';
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'member':
        return 'bg-blue-100 text-blue-800';
      case 'viewer':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const canEditMember = (member: TeamMember) => {
    // Only owners and admins can edit members, and owners can't be edited
    return member.role !== 'owner';
  };

  const canRemoveMember = (member: TeamMember) => {
    // Only owners and admins can remove members, and owners can't be removed
    return member.role !== 'owner';
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium text-gray-900">Team Members</h2>
            <p className="mt-1 text-sm text-gray-600">
              Manage project team members and their roles.
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => setShowInviteModal(true)}
            disabled={isLoading}
          >
            Invite Member
          </Button>
        </div>
      </div>

      <div className="p-6">
        {project.teamMembers.length === 0 ? (
          <div className="text-center py-8">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No team members</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by inviting team members to your project.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {project.teamMembers.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      User {member.userId.slice(0, 8)}...
                    </p>
                    <p className="text-sm text-gray-500">
                      Joined {new Intl.DateTimeFormat('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      }).format(member.joinedAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {editingMember === member.userId ? (
                    <div className="flex items-center space-x-2">
                      <select
                        value={member.role}
                        onChange={(e) => handleUpdateRole(member.userId, e.target.value)}
                        className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={isLoading}
                      >
                        {ROLE_OPTIONS.map((role) => (
                          <option key={role.value} value={role.value}>
                            {role.label}
                          </option>
                        ))}
                      </select>
                      <Button
<<<<<<< HEAD
                        size="small"
=======
                        size="sm"
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
                        variant="secondary"
                        onClick={() => setEditingMember(null)}
                        disabled={isLoading}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(member.role)}`}>
                        {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                      </span>
                      
                      <div className="flex items-center space-x-2">
                        {canEditMember(member) && (
                          <Button
<<<<<<< HEAD
                            size="small"
=======
                            size="sm"
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
                            variant="secondary"
                            onClick={() => setEditingMember(member.userId)}
                            disabled={isLoading}
                          >
                            Edit Role
                          </Button>
                        )}
                        
                        {canRemoveMember(member) && (
                          <Button
<<<<<<< HEAD
                            size="small"
                            variant="danger"
=======
                            size="sm"
                            variant="destructive"
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
                            onClick={() => handleRemoveMember(member.userId)}
                            disabled={isLoading}
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Invite Member Modal */}
      <Modal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        title="Invite Team Member"
      >
        <form onSubmit={handleInviteMember} className="space-y-4">
          <div>
            <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-1">
              User ID *
            </label>
            <input
              type="text"
              id="userId"
              value={inviteForm.userId}
              onChange={(e) => setInviteForm(prev => ({ ...prev, userId: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter user ID"
              required
              disabled={inviteLoading}
            />
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              id="role"
              value={inviteForm.role}
<<<<<<< HEAD
              onChange={(e) => setInviteForm(prev => ({ ...prev, role: e.target.value as any }))}
=======
              onChange={(e) => setInviteForm(prev => ({ ...prev, role: e.target.value as 'admin' | 'member' | 'viewer' }))}
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={inviteLoading}
            >
              {ROLE_OPTIONS.filter(role => role.value !== 'owner').map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label} - {role.description}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowInviteModal(false)}
              disabled={inviteLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={inviteLoading || !inviteForm.userId.trim()}
            >
              {inviteLoading ? <Loading size="small" /> : 'Send Invite'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
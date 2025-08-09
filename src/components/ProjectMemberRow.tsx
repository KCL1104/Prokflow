import React from 'react';
import { User, Crown, Shield, Eye, MoreHorizontal } from 'lucide-react';
import type { TeamMember } from '../types';

interface ProjectMemberRowProps {
  member: TeamMember;
  onRemove?: (memberId: string) => void;
  onRoleChange?: (memberId: string, role: TeamMember['role']) => void;
  canEdit?: boolean;
}

export const ProjectMemberRow: React.FC<ProjectMemberRowProps> = ({
  member,
  onRemove,
  onRoleChange,
  canEdit = false
}) => {
  const getRoleIcon = (role: TeamMember['role']) => {
    switch (role) {
      case 'owner':
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'admin':
        return <Shield className="w-4 h-4 text-blue-500" />;
      case 'member':
        return <User className="w-4 h-4 text-gray-500" />;
      case 'viewer':
        return <Eye className="w-4 h-4 text-gray-400" />;
      default:
        return <User className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRoleColor = (role: TeamMember['role']) => {
    switch (role) {
      case 'owner':
        return 'bg-yellow-100 text-yellow-800';
      case 'admin':
        return 'bg-blue-100 text-blue-800';
      case 'member':
        return 'bg-green-100 text-green-800';
      case 'viewer':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200 hover:bg-gray-50">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
          <User className="w-5 h-5 text-gray-600" />
        </div>
        <div>
          <div className="font-medium text-gray-900">{member.name}</div>
          <div className="text-sm text-gray-500">{member.email}</div>
        </div>
      </div>
      
      <div className="flex items-center space-x-3">
        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}>
          {getRoleIcon(member.role)}
          <span className="ml-1 capitalize">{member.role}</span>
        </div>
        
        {canEdit && (
          <div className="flex items-center space-x-2">
            <select
              value={member.role}
              onChange={(e) => onRoleChange?.(member.id, e.target.value as TeamMember['role'])}
              className="text-sm border border-gray-300 rounded px-2 py-1"
              disabled={member.role === 'owner'}
            >
              <option value="viewer">Viewer</option>
              <option value="member">Member</option>
              <option value="admin">Admin</option>
              {member.role === 'owner' && <option value="owner">Owner</option>}
            </select>
            
            {member.role !== 'owner' && (
              <button
                onClick={() => onRemove?.(member.id)}
                className="text-red-600 hover:text-red-800 p-1"
                title="Remove member"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectMemberRow;
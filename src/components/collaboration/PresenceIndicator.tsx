import React, { useState, useEffect } from 'react';
import { User, Eye, Edit, MousePointer, Circle } from 'lucide-react';
import { useRealtimeCollaboration } from '../../hooks/useRealtimeCollaboration';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';

interface PresenceUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  lastSeen: Date;
  currentPage?: string;
  activity?: 'viewing' | 'editing' | 'idle';
  cursor?: {
    x: number;
    y: number;
    elementId?: string;
  };
}

interface PresenceIndicatorProps {
  className?: string;
  showAvatars?: boolean;
  showActivity?: boolean;
  maxVisible?: number;
  size?: 'sm' | 'md' | 'lg';
}

export const PresenceIndicator: React.FC<PresenceIndicatorProps> = ({
  className = '',
  showAvatars = true,
  showActivity = true,
  maxVisible = 5,
  size = 'md'
}) => {
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  const [presenceUsers, setPresenceUsers] = useState<PresenceUser[]>([]);
  
  const { presence } = useRealtimeCollaboration();
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const currentProject = useSelector((state: RootState) => state.project.currentProject);

  // Update presence data
  useEffect(() => {
    if (presence && currentProject) {
      const users = Object.entries(presence)
        .filter(([userId]) => userId !== currentUser?.id)
        .map(([userId, data]) => ({
          id: userId,
          name: data.userName || 'Unknown User',
          email: data.userEmail || '',
          avatar: data.userAvatar,
          status: data.status || 'online',
          lastSeen: new Date(data.lastSeen || Date.now()),
          currentPage: data.currentPage,
          activity: (data.isEditing ? 'editing' : 'viewing') as 'viewing' | 'editing' | 'idle',
          cursor: undefined,
        }));
      
      setPresenceUsers(users);
    }
  }, [presence, currentProject, currentUser]);

  // Note: Presence updates are now handled by the RealtimeCollaborationProvider
  // This component only displays the presence data

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'away':
        return 'bg-yellow-500';
      case 'busy':
        return 'bg-red-500';
      case 'offline':
      default:
        return 'bg-gray-400';
    }
  };

  const getActivityIcon = (activity: string) => {
    switch (activity) {
      case 'editing':
        return Edit;
      case 'viewing':
        return Eye;
      case 'idle':
      default:
        return MousePointer;
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          avatar: 'w-6 h-6',
          status: 'w-2 h-2',
          text: 'text-xs',
        };
      case 'lg':
        return {
          avatar: 'w-10 h-10',
          status: 'w-3 h-3',
          text: 'text-sm',
        };
      case 'md':
      default:
        return {
          avatar: 'w-8 h-8',
          status: 'w-2.5 h-2.5',
          text: 'text-sm',
        };
    }
  };

  const sizeClasses = getSizeClasses();
  const visibleUsers = presenceUsers.slice(0, maxVisible);
  const hiddenCount = Math.max(0, presenceUsers.length - maxVisible);

  if (presenceUsers.length === 0) {
    return null;
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Online users count */}
      <div className="flex items-center space-x-1 text-gray-600">
        <Circle className="w-3 h-3 fill-green-500 text-green-500" />
        <span className={`${sizeClasses.text} font-medium`}>
          {presenceUsers.length} online
        </span>
      </div>

      {/* User avatars */}
      {showAvatars && (
        <div className="flex -space-x-2">
          {visibleUsers.map((user) => {
            const ActivityIcon = getActivityIcon(user.activity || 'viewing');
            
            return (
              <div
                key={user.id}
                className="relative"
                onMouseEnter={() => setShowTooltip(user.id)}
                onMouseLeave={() => setShowTooltip(null)}
              >
                {/* Avatar */}
                <div className={`relative ${sizeClasses.avatar} rounded-full border-2 border-white bg-gray-200 overflow-hidden`}>
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500">
                      <User className="w-1/2 h-1/2 text-white" />
                    </div>
                  )}
                </div>

                {/* Status indicator */}
                <div className={`absolute -bottom-0.5 -right-0.5 ${sizeClasses.status} rounded-full border border-white ${getStatusColor(user.status)}`} />

                {/* Activity indicator */}
                {showActivity && user.activity === 'editing' && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                    <ActivityIcon className="w-2.5 h-2.5 text-white" />
                  </div>
                )}

                {/* Tooltip */}
                {showTooltip === user.id && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50">
                    <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap">
                      <div className="font-medium">{user.name}</div>
                      <div className="text-gray-300">{user.email}</div>
                      <div className="flex items-center space-x-1 mt-1">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(user.status)}`} />
                        <span className="capitalize">{user.status}</span>
                      </div>
                      {user.currentPage && (
                        <div className="text-gray-400 mt-1">
                          Page: {user.currentPage.split('/').pop() || 'Dashboard'}
                        </div>
                      )}
                      {user.activity && (
                        <div className="flex items-center space-x-1 text-gray-400 mt-1">
                          <ActivityIcon className="w-3 h-3" />
                          <span className="capitalize">{user.activity}</span>
                        </div>
                      )}
                      <div className="text-gray-500 mt-1">
                        Last seen: {user.lastSeen.toLocaleTimeString()}
                      </div>
                      {/* Tooltip arrow */}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Show hidden count */}
          {hiddenCount > 0 && (
            <div className={`${sizeClasses.avatar} rounded-full border-2 border-white bg-gray-100 flex items-center justify-center`}>
              <span className={`${sizeClasses.text} font-medium text-gray-600`}>
                +{hiddenCount}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Cursor tracking component
export const CursorTracker: React.FC = () => {
  const [cursors, setCursors] = useState<Record<string, { x: number; y: number; user: PresenceUser }>>({});
  const { presence } = useRealtimeCollaboration();
  const currentUser = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    // Note: Cursor tracking is handled separately by the cursor tracking system
    // This component is simplified for now
    setCursors({});
  }, [presence, currentUser]);

  return (
    <>
      {Object.entries(cursors).map(([userId, { x, y, user }]) => (
        <div
          key={userId}
          className="fixed pointer-events-none z-50 transition-all duration-100"
          style={{ left: x, top: y }}
        >
          {/* Cursor */}
          <div className="relative">
            <MousePointer className="w-5 h-5 text-blue-500 fill-blue-500" />
            {/* User label */}
            <div className="absolute top-6 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
              {user.name}
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

// Hook for presence data
export const usePresence = () => {
  const { presence, onlineUsersCount } = useRealtimeCollaboration();

  // Note: Presence updates are now handled by the RealtimeCollaborationProvider
  // This hook provides read-only access to presence data

  const isUserOnline = (userId: string) => {
    return presence[userId]?.status === 'online';
  };

  const getUserPresence = (userId: string) => {
    return presence[userId] || null;
  };

  return {
    presence,
    onlineUsersCount,
    isUserOnline,
    getUserPresence,
  };
};
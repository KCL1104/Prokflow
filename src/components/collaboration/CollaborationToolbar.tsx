import React, { useState, useEffect } from 'react';
import { Users, MessageSquare, Share2, Settings, Bell, Video, Phone, Monitor } from 'lucide-react';
import { PresenceIndicator } from './PresenceIndicator';
import { ConnectionStatusIndicator } from '../status/ConnectionStatusIndicator';
// import { useRealtimeCollaboration } from '../../contexts/RealtimeCollaborationContext';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../store';
import { addNotification } from '../../store/slices/notificationSlice';
import { updateSettings } from '../../store/slices/collaborationSlice';

interface CollaborationToolbarProps {
  className?: string;
  position?: 'top' | 'bottom' | 'floating';
  compact?: boolean;
}

export const CollaborationToolbar: React.FC<CollaborationToolbarProps> = ({
  className = '',
  position = 'top',
  compact = false
}) => {
  const [showSettings, setShowSettings] = useState(false);

  const [isMinimized, setIsMinimized] = useState(false);
  
  const dispatch = useDispatch();
  // Mock collaboration data for now
  const isConnected = true;
  const connectedUsers: any[] = [];
  const shareScreen = () => console.log('Share screen');
  const startVideoCall = () => console.log('Start video call');
  const startVoiceCall = () => console.log('Start voice call');
  
  const currentProject = useSelector((state: RootState) => state.project.currentProject);
  const collaborationSettings = useSelector((state: RootState) => state.collaboration.settings);
  const notifications = useSelector((state: RootState) => state.notification.notifications);
  const unreadCount = useSelector((state: RootState) => state.notification.unreadCount);

  // Auto-minimize on mobile
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMinimized(window.innerWidth < 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const handleShareProject = async () => {
    if (!currentProject) return;
    
    try {
      const shareUrl = `${window.location.origin}/projects/${currentProject.id}`;
      
      if (navigator.share) {
        await navigator.share({
          title: `Collaborate on ${currentProject.name}`,
          text: `Join me in working on ${currentProject.name}`,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        dispatch(addNotification({
        id: Date.now().toString(),
        type: 'info',
        title: 'Link Copied',
        message: 'Project share link copied to clipboard',
        userId: 'current-user',
        projectId: currentProject?.id || '',
        read: false,
        createdAt: new Date(),
      }));
      }
    } catch (error) {
      dispatch(addNotification({
        id: Date.now().toString(),
        type: 'error',
        title: 'Share Failed',
        message: 'Failed to share project link',
        userId: 'current-user',
        projectId: currentProject?.id || '',
        read: false,
        createdAt: new Date(),
      }));
    }
  };

  const handleStartVideoCall = () => {
    if (connectedUsers.length === 0) {
      dispatch(addNotification({
        id: Date.now().toString(),
        type: 'info',
        title: 'No Users Online',
        message: 'No other users are currently online to call',
        userId: 'current-user',
        projectId: currentProject?.id || '',
        read: false,
        createdAt: new Date(),
      }));
      return;
    }
    
    startVideoCall();
    dispatch(addNotification({
      id: Date.now().toString(),
      type: 'info',
      title: 'Video Call Started',
      message: 'Initiating video call with team members',
      userId: 'current-user',
      projectId: currentProject?.id || '',
      read: false,
      createdAt: new Date(),
    }));
  };

  const handleStartVoiceCall = () => {
    if (connectedUsers.length === 0) {
      dispatch(addNotification({
        id: Date.now().toString(),
        type: 'info',
        title: 'No Users Online',
        message: 'No other users are currently online to call',
        userId: 'current-user',
        projectId: currentProject?.id || '',
        read: false,
        createdAt: new Date(),
      }));
      return;
    }
    
    startVoiceCall();
    dispatch(addNotification({
      id: Date.now().toString(),
      type: 'info',
      title: 'Voice Call Started',
      message: 'Initiating voice call with team members',
      userId: 'current-user',
      projectId: currentProject?.id || '',
      read: false,
      createdAt: new Date(),
    }));
  };

  const handleShareScreen = () => {
    shareScreen();
    dispatch(addNotification({
      id: Date.now().toString(),
      type: 'info',
      title: 'Screen Sharing',
      message: 'Screen sharing session started',
      userId: 'current-user',
      projectId: currentProject?.id || '',
      read: false,
      createdAt: new Date(),
    }));
  };

  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };

  const updateCollaborationSetting = (key: string, value: any) => {
    dispatch(updateSettings({ [key]: value }));
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'bottom':
        return 'fixed bottom-4 left-1/2 transform -translate-x-1/2 z-40';
      case 'floating':
        return 'fixed top-20 right-4 z-40';
      case 'top':
      default:
        return 'relative';
    }
  };

  if (!isConnected || !currentProject) {
    return null;
  }

  return (
    <>
      <div className={`${getPositionClasses()} ${className}`}>
        <div className={`bg-warm-25 border-2 border-default rounded-lg shadow-lg ${
          position === 'floating' ? 'p-2' : 'px-4 py-2'
        } ${isMinimized && position === 'floating' ? 'w-12' : ''}`}>
          
          {/* Minimized floating view */}
          {isMinimized && position === 'floating' ? (
            <div className="flex flex-col space-y-2">
              <button
                onClick={() => setIsMinimized(false)}
                className="p-2 rounded-lg hover:bg-warm-50 border-2 border-transparent hover:border-light transition-all duration-150"
                title="Expand collaboration tools"
              >
                <Users className="w-5 h-5 text-gray-600" />
              </button>
              <ConnectionStatusIndicator />
            </div>
          ) : (
            /* Full view */
            <div className={`flex items-center space-x-4 ${
              position === 'floating' ? 'flex-col space-y-2 space-x-0' : ''
            }`}>
              
              {/* Minimize button for floating */}
              {position === 'floating' && (
                <button
                  onClick={() => setIsMinimized(true)}
                  className="self-end p-1 rounded hover:bg-warm-50 border-2 border-transparent hover:border-light transition-all duration-150"
                  title="Minimize"
                >
                  <div className="w-3 h-0.5 bg-gray-400 rounded" />
                </button>
              )}

              {/* Connection Status */}
              <ConnectionStatusIndicator />

              {/* Presence Indicator */}
              <PresenceIndicator 
                size={compact ? 'sm' : 'md'}
                maxVisible={compact ? 3 : 5}
                showActivity={!compact}
              />

              {/* Collaboration Actions */}
              <div className={`flex items-center space-x-2 ${
                position === 'floating' ? 'flex-col space-y-1 space-x-0' : ''
              }`}>
                
                {/* Share Project */}
                <button
                  onClick={handleShareProject}
                  className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                  title="Share project"
                >
                  <Share2 className="w-5 h-5" />
                </button>

                {/* Video Call */}
                <button
                  onClick={handleStartVideoCall}
                  className="p-2 rounded-lg hover:bg-green-50 text-green-600 transition-colors"
                  title="Start video call"
                  disabled={connectedUsers.length === 0}
                >
                  <Video className="w-5 h-5" />
                </button>

                {/* Voice Call */}
                <button
                  onClick={handleStartVoiceCall}
                  className="p-2 rounded-lg hover:bg-green-50 text-green-600 transition-colors"
                  title="Start voice call"
                  disabled={connectedUsers.length === 0}
                >
                  <Phone className="w-5 h-5" />
                </button>

                {/* Screen Share */}
                <button
                  onClick={handleShareScreen}
                  className="p-2 rounded-lg hover:bg-purple-50 text-purple-600 transition-colors"
                  title="Share screen"
                >
                  <Monitor className="w-5 h-5" />
                </button>

                {/* Notifications */}
                <div className="relative">
                  <button
                    className="p-2 rounded-lg hover:bg-yellow-50 text-yellow-600 transition-colors"
                    title="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>
                </div>

                {/* Settings */}
                <button
                  onClick={toggleSettings}
                  className="p-2 rounded-lg hover:bg-warm-50 text-gray-600 border-2 border-transparent hover:border-light transition-all duration-150"
                  title="Collaboration settings"
                >
                  <Settings className="w-5 h-5" />
                </button>
              </div>

              {/* Quick Stats */}
              {!compact && position !== 'floating' && (
                <div className="flex items-center space-x-4 text-sm text-gray-500 border-l pl-4">
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>{connectedUsers.length + 1} active</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MessageSquare className="w-4 h-4" />
                    <span>{notifications.length} messages</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-warm-25 rounded-lg shadow-xl border-2 border-default p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Collaboration Settings</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              {/* Show Cursors */}
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Show User Cursors</label>
                <input
                  type="checkbox"
                  checked={collaborationSettings.enableCursorTracking}
                  onChange={(e) => updateCollaborationSetting('enableCursorTracking', e.target.checked)}
                  className="rounded border-2 border-default bg-warm-25 text-primary-600 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              {/* Show Presence */}
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Show User Presence</label>
                <input
                  type="checkbox"
                  checked={collaborationSettings.enablePresenceIndicators}
                  onChange={(e) => updateCollaborationSetting('enablePresenceIndicators', e.target.checked)}
                  className="rounded border-2 border-default bg-warm-25 text-primary-600 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              {/* Live Updates */}
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Live Updates</label>
                <input
                  type="checkbox"
                  checked={collaborationSettings.enableLiveUpdates}
                  onChange={(e) => updateCollaborationSetting('enableLiveUpdates', e.target.checked)}
                  className="rounded border-2 border-default bg-warm-25 text-primary-600 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              {/* Notifications */}
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Real-time Notifications</label>
                <input
                  type="checkbox"
                  checked={collaborationSettings.enableNotifications}
                  onChange={(e) => updateCollaborationSetting('enableNotifications', e.target.checked)}
                  className="rounded border-2 border-default bg-warm-25 text-primary-600 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              {/* Sound */}
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Sound Notifications</label>
                <input
                  type="checkbox"
                  checked={false}
                  onChange={() => {}}
                  className="rounded border-2 border-default bg-warm-25 text-primary-600 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-warm-50 border-2 border-default rounded-lg hover:bg-warm-100 hover:border-medium transition-all duration-150"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border-2 border-primary-600 rounded-lg hover:bg-primary-700 hover:border-primary-700 transition-all duration-150"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CollaborationToolbar;
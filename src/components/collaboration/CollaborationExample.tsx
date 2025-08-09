import React from 'react';
import { RealtimeCollaborationProvider, CollaborationToolbar } from './RealtimeCollaborationProvider';
import { CollaborativeWorkItemForm } from '../work-items/CollaborativeWorkItemForm';
import { NotificationToast } from './NotificationCenter';
import { useNotifications } from '../../hooks/useNotifications';
import { useRealtimeCollaboration } from '../../hooks/useRealtimeCollaboration';
import type { WorkItem } from '../../types';

interface CollaborationExampleProps {
  projectId: string;
  workItem?: WorkItem;
  onSave: (data: Partial<WorkItem>) => Promise<void>;
  onCancel: () => void;
}

/**
 * Example component demonstrating how to integrate real-time collaboration features
 * This shows the complete setup for a collaborative work item editing experience
 */
export function CollaborationExample({
  projectId,
  workItem,
  onSave,
  onCancel
}: CollaborationExampleProps) {
  const { notifications } = useNotifications(projectId);
  const [toastNotification, setToastNotification] = React.useState<typeof notifications[0] | null>(null);

  // Show toast for new notifications
  React.useEffect(() => {
    const latestNotification = notifications[0];
    if (latestNotification && !latestNotification.read) {
      setToastNotification(latestNotification);
    }
  }, [notifications]);

  return (
    <RealtimeCollaborationProvider
      projectId={projectId}
      enableCursors={true}
      enableNotifications={true}
      enablePresence={true}
      className="min-h-screen bg-gray-50"
    >
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Collaboration Toolbar */}
        <div className="mb-6">
          <CollaborationToolbar
            projectId={projectId}
            showOnlineUsers={true}
            showNotifications={true}
            showConnectionStatus={true}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
          />
        </div>

        {/* Main Content with Collaborative Form */}
        <div className="space-y-6">
          <CollaborativeWorkItemForm
            workItem={workItem}
            projectId={projectId}
            onSave={onSave}
            onCancel={onCancel}
          />

          {/* Additional collaborative features could go here */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Real-time Collaboration Features
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Live Cursors</h4>
                <p className="text-sm text-gray-600">
                  See where other team members are working in real-time with live cursor tracking.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Presence Indicators</h4>
                <p className="text-sm text-gray-600">
                  Know who's online and actively editing with presence indicators.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Live Notifications</h4>
                <p className="text-sm text-gray-600">
                  Get instant notifications when work items are updated or assigned.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Collaborative Editing</h4>
                <p className="text-sm text-gray-600">
                  Edit work items simultaneously with conflict resolution and auto-save.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Toast Notifications */}
        {toastNotification && (
          <NotificationToast
            notification={toastNotification}
            onClose={() => setToastNotification(null)}
            autoClose={true}
            duration={5000}
          />
        )}
      </div>
    </RealtimeCollaborationProvider>
  );
}

/**
 * Minimal setup example for adding collaboration to any component
 */
export function MinimalCollaborationSetup({ 
  projectId, 
  children 
}: { 
  projectId: string; 
  children: React.ReactNode; 
}) {
  return (
    <RealtimeCollaborationProvider projectId={projectId}>
      {children}
    </RealtimeCollaborationProvider>
  );
}

/**
 * Example of using individual collaboration hooks
 */
export function CollaborationHooksExample({ projectId: _projectId }: { projectId: string }) {
  const { connected, onlineUsersCount } = useRealtimeCollaboration();
  
  return (
    <div className="p-4 bg-white rounded-lg shadow-sm border">
      <h3 className="font-medium text-gray-900 mb-2">Collaboration Status</h3>
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span>{connected ? 'Connected' : 'Disconnected'}</span>
        </div>
        <div>
          <span className="text-gray-600">Online users: {onlineUsersCount}</span>
        </div>
      </div>
    </div>
  );
}
import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Breadcrumbs } from './Breadcrumbs';
import { ErrorBoundary } from '../error/ErrorBoundary';
<<<<<<< HEAD

export const AppLayout: React.FC = () => {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar */}
        <ErrorBoundary fallback={<div className="w-64 bg-white border-r border-gray-200 flex items-center justify-center p-4">
=======
import { CollaborationToolbar } from '../collaboration/CollaborationToolbar';
import { NotificationCenter } from '../notifications/NotificationCenter';
import { CursorTracker } from '../collaboration/PresenceIndicator';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';

export const AppLayout: React.FC = () => {
  const collaborationSettings = useSelector((state: RootState) => state.collaboration.settings);
  const currentProject = useSelector((state: RootState) => state.project.currentProject);

  return (
    <ErrorBoundary>
      <div className="h-screen w-screen bg-gray-25 flex relative overflow-hidden">
        {/* Clean background - no patterns */}
        
        {/* Cursor Tracker for real-time collaboration */}
        {collaborationSettings.enableCursorTracking && currentProject && (
          <ErrorBoundary fallback={null}>
            <CursorTracker />
          </ErrorBoundary>
        )}

        {/* Sidebar */}
        <ErrorBoundary fallback={<div className="w-64 bg-warm-25 border-r-2 border-default flex items-center justify-center p-4">
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
          <span className="text-gray-500">Navigation unavailable</span>
        </div>}>
          <Sidebar />
        </ErrorBoundary>
        
        {/* Main content area */}
<<<<<<< HEAD
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <ErrorBoundary fallback={<div className="bg-white border-b border-gray-200 p-4">
=======
        <div className="flex-1 flex flex-col relative z-10">
          {/* Header */}
          <ErrorBoundary fallback={<div className="bg-warm-25 border-b-2 border-default p-4">
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
            <span className="text-gray-500">Header unavailable</span>
          </div>}>
            <Header />
          </ErrorBoundary>
<<<<<<< HEAD
          
          {/* Breadcrumbs */}
          <ErrorBoundary fallback={null}>
            <Breadcrumbs />
          </ErrorBoundary>
          
          {/* Page content */}
          <main className="flex-1 p-6">
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </main>
        </div>
=======

          {/* Collaboration Toolbar */}
          {currentProject && (
            <ErrorBoundary fallback={null}>
              <div className="bg-warm-25 border-b-2 border-default">
                <CollaborationToolbar 
                  position="top" 
                  compact={false}
                  className="px-6 py-3"
                />
              </div>
            </ErrorBoundary>
          )}
          
          {/* Breadcrumbs */}
          <ErrorBoundary fallback={null}>
            <div className="bg-warm-25 border-b-2 border-light">
              <Breadcrumbs />
            </div>
          </ErrorBoundary>
          
          {/* Page content */}
          <main className="flex-1 relative overflow-auto bg-warm-25">
            <div className="h-full">
              <ErrorBoundary>
                <Outlet />
              </ErrorBoundary>
            </div>
          </main>
        </div>

        {/* Global Notification Center */}
        <ErrorBoundary fallback={null}>
          <NotificationCenter />
        </ErrorBoundary>

        {/* Floating Collaboration Toolbar for mobile */}
        {currentProject && (
          <ErrorBoundary fallback={null}>
            <div className="md:hidden">
              <CollaborationToolbar 
                position="floating" 
                compact={true}
              />
            </div>
          </ErrorBoundary>
        )}
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
      </div>
    </ErrorBoundary>
  );
};
<<<<<<< HEAD
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from '../components/error';
import { ProtectedRoute } from '../components/routing';
import { AppLayout } from '../components/layout';

// Auth pages
import { AuthPage, CallbackPage, ResetPasswordPage } from '../pages/Auth';

// Main app pages
import { DashboardPage } from '../pages/Dashboard';
import { ProjectDetailPage } from '../pages/Projects/ProjectDetailPage';
import { BacklogPage } from '../pages/BacklogPage';
import { BoardPage } from '../pages/Board';
import { GanttPage } from '../pages/Gantt';
import { SprintsPage } from '../pages/Sprints';
import { ReportsPage } from '../pages/Reports';
import { SettingsPage } from '../pages/Settings';
import { NotFoundPage } from '../pages/NotFoundPage';

=======
import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ErrorBoundary } from '../components/error';
import { ProtectedRoute } from '../components/routing';
import { AppLayout } from '../components/layout';
import { AuthProvider } from '../contexts/AuthContext';
import { RealtimeCollaborationProvider } from '../components/collaboration/RealtimeCollaborationProvider';
import { ErrorTrackingProvider } from '../providers/ErrorTrackingProvider';
import { PerformanceMonitoringProvider } from '../providers/PerformanceMonitoringProvider';
import { store } from '../store';
import { createLazyComponent } from '../utils/lazyLoadingUtils';
import { LoadingSpinner, LazyLoadErrorBoundary } from '../utils/lazyLoading';

// Auth pages (keep these eager loaded as they're critical)
import { AuthPage, CallbackPage, ResetPasswordPage } from '../pages/Auth';

// Eager load critical pages
import { DashboardPage } from '../pages/Dashboard';
import { NotFoundPage } from '../pages/NotFoundPage';

// Lazy load heavy feature pages
const ProjectDetailPage = createLazyComponent(
  () => import('../pages/Projects/ProjectDetailPage'),
  'ProjectDetailPage'
);

const BacklogPage = createLazyComponent(
  () => import('../pages/BacklogPage'),
  'BacklogPage'
);

const BoardPage = createLazyComponent(
  () => import('../pages/Board'),
  'BoardPage'
);

const GanttPage = createLazyComponent(
  () => import('../pages/Gantt'),
  'GanttPage'
);

const SprintsPage = createLazyComponent(
  () => import('../pages/Sprints'),
  'SprintsPage'
);

const ReportsPage = createLazyComponent(
  () => import('../pages/Reports'),
  'ReportsPage'
);

const SettingsPage = createLazyComponent(
  () => import('../pages/Settings'),
  'SettingsPage'
);

>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
// Placeholder for projects list page
const ProjectsListPage: React.FC = () => (
  <div className="space-y-6">
    <div className="bg-white rounded-lg shadow p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Projects</h1>
      <p className="text-gray-600 mb-4">
        Project list and management functionality will be implemented here.
      </p>
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <p className="text-blue-800 text-sm">
          🚧 This page is under construction. Project list functionality will be added in upcoming tasks.
        </p>
      </div>
    </div>
  </div>
);

export const AppRouter: React.FC = () => {
  return (
<<<<<<< HEAD
    <BrowserRouter>
      <ErrorBoundary>
        <Routes>
          {/* Public routes */}
          <Route
            path="/auth"
            element={
              <ProtectedRoute requireAuth={false}>
                <AuthPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/auth/callback"
            element={
              <ProtectedRoute requireAuth={false}>
                <CallbackPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/auth/reset-password"
            element={
              <ProtectedRoute requireAuth={false}>
                <ResetPasswordPage />
              </ProtectedRoute>
            }
          />

          {/* Protected routes with layout */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            {/* Redirect root to dashboard */}
            <Route index element={<Navigate to="/dashboard" replace />} />
            
            {/* Main app routes */}
            <Route path="dashboard" element={<DashboardPage />} />
            
            {/* Projects routes */}
            <Route path="projects" element={<ProjectsListPage />} />
            <Route path="projects/:projectId" element={<ProjectDetailPage />} />
            
            {/* Project-specific feature routes */}
            <Route path="projects/:projectId/backlog" element={<BacklogPage />} />
            <Route path="projects/:projectId/sprints" element={<SprintsPage />} />
            <Route path="projects/:projectId/board" element={<BoardPage />} />
            <Route path="projects/:projectId/gantt" element={<GanttPage />} />
            <Route path="projects/:projectId/reports" element={<ReportsPage />} />
            
            {/* Global routes */}
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* 404 page */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </ErrorBoundary>
    </BrowserRouter>
=======
    <Provider store={store}>
      <ErrorTrackingProvider>
        <PerformanceMonitoringProvider>
          <AuthProvider>
            <BrowserRouter>
              <ErrorBoundary>
                <Routes>
            {/* Public routes */}
            <Route
              path="/auth"
              element={
                <ProtectedRoute requireAuth={false}>
                  <AuthPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/auth/callback"
              element={
                <ProtectedRoute requireAuth={false}>
                  <CallbackPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/auth/reset-password"
              element={
                <ProtectedRoute requireAuth={false}>
                  <ResetPasswordPage />
                </ProtectedRoute>
              }
            />
         
   {/* Protected routes with layout */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <RealtimeCollaborationProvider projectId={null}>
                    <AppLayout />
                  </RealtimeCollaborationProvider>
                </ProtectedRoute>
              }
            >
              {/* Redirect root to dashboard */}
              <Route index element={<Navigate to="/dashboard" replace />} />
              
              {/* Main app routes */}
              <Route path="dashboard" element={<DashboardPage />} />
              
              {/* Projects routes */}
              <Route path="projects" element={<ProjectsListPage />} />
              <Route 
                path="projects/:projectId" 
                element={
                  <LazyLoadErrorBoundary>
                    <Suspense fallback={<LoadingSpinner message="Loading project..." />}>
                      <ProjectDetailPage />
                    </Suspense>
                  </LazyLoadErrorBoundary>
                } 
              />        
      {/* Project-specific feature routes */}
              <Route 
                path="projects/:projectId/backlog" 
                element={
                  <LazyLoadErrorBoundary>
                    <Suspense fallback={<LoadingSpinner message="Loading backlog..." />}>
                      <BacklogPage />
                    </Suspense>
                  </LazyLoadErrorBoundary>
                } 
              />
              <Route 
                path="projects/:projectId/sprints" 
                element={
                  <LazyLoadErrorBoundary>
                    <Suspense fallback={<LoadingSpinner message="Loading sprints..." />}>
                      <SprintsPage />
                    </Suspense>
                  </LazyLoadErrorBoundary>
                } 
              />
              <Route 
                path="projects/:projectId/board" 
                element={
                  <LazyLoadErrorBoundary>
                    <Suspense fallback={<LoadingSpinner message="Loading board..." />}>
                      <BoardPage />
                    </Suspense>
                  </LazyLoadErrorBoundary>
                } 
              />
              <Route 
                path="projects/:projectId/gantt" 
                element={
                  <LazyLoadErrorBoundary>
                    <Suspense fallback={<LoadingSpinner message="Loading Gantt chart..." />}>
                      <GanttPage />
                    </Suspense>
                  </LazyLoadErrorBoundary>
                } 
              />
              <Route 
                path="projects/:projectId/reports" 
                element={
                  <LazyLoadErrorBoundary>
                    <Suspense fallback={<LoadingSpinner message="Loading reports..." />}>
                      <ReportsPage />
                    </Suspense>
                  </LazyLoadErrorBoundary>
                } 
              />   
           {/* Global routes */}
              <Route 
                path="settings" 
                element={
                  <LazyLoadErrorBoundary>
                    <Suspense fallback={<LoadingSpinner message="Loading settings..." />}>
                      <SettingsPage />
                    </Suspense>
                  </LazyLoadErrorBoundary>
                } 
              />
            </Route>

            {/* 404 page */}
            <Route path="*" element={<NotFoundPage />} />
            </Routes>
              </ErrorBoundary>
            </BrowserRouter>
          </AuthProvider>
        </PerformanceMonitoringProvider>
      </ErrorTrackingProvider>
    </Provider>
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
  );
};
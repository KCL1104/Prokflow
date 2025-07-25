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
  );
};
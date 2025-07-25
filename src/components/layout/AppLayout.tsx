import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Breadcrumbs } from './Breadcrumbs';
import { ErrorBoundary } from '../error/ErrorBoundary';

export const AppLayout: React.FC = () => {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar */}
        <ErrorBoundary fallback={<div className="w-64 bg-white border-r border-gray-200 flex items-center justify-center p-4">
          <span className="text-gray-500">Navigation unavailable</span>
        </div>}>
          <Sidebar />
        </ErrorBoundary>
        
        {/* Main content area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <ErrorBoundary fallback={<div className="bg-white border-b border-gray-200 p-4">
            <span className="text-gray-500">Header unavailable</span>
          </div>}>
            <Header />
          </ErrorBoundary>
          
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
      </div>
    </ErrorBoundary>
  );
};
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Loading } from '../common/Loading';
import { AuthContainer } from './AuthContainer';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireAuth?: boolean;
}

export function ProtectedRoute({ 
  children, 
  fallback,
  requireAuth = true 
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loading size="large" text="Loading..." />
      </div>
    );
  }

  // If authentication is required but user is not authenticated
  if (requireAuth && !user) {
    return fallback || <AuthContainer />;
  }

  // If authentication is not required or user is authenticated
  return <>{children}</>;
}

// Higher-order component version for class components or more complex use cases
<<<<<<< HEAD
=======
// eslint-disable-next-line react-refresh/only-export-components
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
export function withProtectedRoute<P extends object>(
  Component: React.ComponentType<P>,
  options: {
    requireAuth?: boolean;
    fallback?: React.ReactNode;
  } = {}
) {
  const { requireAuth = true, fallback } = options;

  return function ProtectedComponent(props: P) {
    return (
      <ProtectedRoute requireAuth={requireAuth} fallback={fallback}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}

// Hook for checking authentication status in components
<<<<<<< HEAD
=======
// eslint-disable-next-line react-refresh/only-export-components
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
export function useRequireAuth() {
  const { user, loading } = useAuth();

  return {
    isAuthenticated: !!user,
    isLoading: loading,
    user
  };
}
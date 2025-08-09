import React, { createContext, useContext, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useDispatch } from 'react-redux';
import { addToast } from '../store/slices/uiSlice';

interface ErrorTrackingContextType {
  reportError: (error: Error, context?: Record<string, any>) => void;
  reportWarning: (message: string, context?: Record<string, any>) => void;
  reportInfo: (message: string, context?: Record<string, any>) => void;
}

const ErrorTrackingContext = createContext<ErrorTrackingContextType | undefined>(undefined);

interface ErrorTrackingProviderProps {
  children: ReactNode;
}

export const ErrorTrackingProvider: React.FC<ErrorTrackingProviderProps> = ({ children }) => {
  const dispatch = useDispatch();

  const reportError = (error: Error, context?: Record<string, any>) => {
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error tracked:', error, context);
    }

    // Send to external error tracking service (e.g., Sentry, LogRocket)
    // TODO: Integrate with actual error tracking service
    try {
      // Example: Sentry.captureException(error, { extra: context });
      
      // For now, store in localStorage for debugging
      const errorLog = {
        message: error.message,
        stack: error.stack,
        context,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      };
      
      const existingLogs = JSON.parse(localStorage.getItem('errorLogs') || '[]');
      existingLogs.push(errorLog);
      
      // Keep only last 50 errors
      if (existingLogs.length > 50) {
        existingLogs.splice(0, existingLogs.length - 50);
      }
      
      localStorage.setItem('errorLogs', JSON.stringify(existingLogs));
    } catch (loggingError) {
      console.error('Failed to log error:', loggingError);
    }

    // Show user-friendly error message
    dispatch(addToast({
      type: 'error',
      title: 'Something went wrong',
      message: 'We\'ve been notified and are working on a fix.',
      duration: 5000,
    }));
  };

  const reportWarning = (message: string, context?: Record<string, any>) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Warning tracked:', message, context);
    }

    // TODO: Send to monitoring service
    try {
      const warningLog = {
        level: 'warning',
        message,
        context,
        timestamp: new Date().toISOString(),
        url: window.location.href,
      };
      
      const existingLogs = JSON.parse(localStorage.getItem('warningLogs') || '[]');
      existingLogs.push(warningLog);
      
      if (existingLogs.length > 100) {
        existingLogs.splice(0, existingLogs.length - 100);
      }
      
      localStorage.setItem('warningLogs', JSON.stringify(existingLogs));
    } catch (loggingError) {
      console.error('Failed to log warning:', loggingError);
    }
  };

  const reportInfo = (message: string, context?: Record<string, any>) => {
    if (process.env.NODE_ENV === 'development') {
      console.info('Info tracked:', message, context);
    }

    // TODO: Send to analytics service
    try {
      const infoLog = {
        level: 'info',
        message,
        context,
        timestamp: new Date().toISOString(),
        url: window.location.href,
      };
      
      const existingLogs = JSON.parse(localStorage.getItem('infoLogs') || '[]');
      existingLogs.push(infoLog);
      
      if (existingLogs.length > 200) {
        existingLogs.splice(0, existingLogs.length - 200);
      }
      
      localStorage.setItem('infoLogs', JSON.stringify(existingLogs));
    } catch (loggingError) {
      console.error('Failed to log info:', loggingError);
    }
  };

  // Global error handler
  useEffect(() => {
    const handleUnhandledError = (event: ErrorEvent) => {
      reportError(new Error(event.message), {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      reportError(new Error(`Unhandled promise rejection: ${event.reason}`), {
        reason: event.reason,
      });
    };

    window.addEventListener('error', handleUnhandledError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleUnhandledError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  const value: ErrorTrackingContextType = {
    reportError,
    reportWarning,
    reportInfo,
  };

  return (
    <ErrorTrackingContext.Provider value={value}>
      {children}
    </ErrorTrackingContext.Provider>
  );
};

export const useErrorTracking = (): ErrorTrackingContextType => {
  const context = useContext(ErrorTrackingContext);
  if (!context) {
    throw new Error('useErrorTracking must be used within an ErrorTrackingProvider');
  }
  return context;
};

// Higher-order component for error boundary
export const withErrorTracking = <P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P> => {
  return (props: P) => {
    const { reportError } = useErrorTracking();

    return (
      <ErrorBoundary onError={reportError}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
};

// Error boundary component
class ErrorBoundary extends React.Component<
  { children: ReactNode; onError: (error: Error) => void },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; onError: (error: Error) => void }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.props.onError(error);
    console.error('Error boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="mt-4 text-center">
              <h3 className="text-lg font-medium text-gray-900">Something went wrong</h3>
              <p className="mt-2 text-sm text-gray-500">
                We\'re sorry, but something unexpected happened. Please try refreshing the page.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
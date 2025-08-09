import React, { createContext, useContext, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { useDispatch } from 'react-redux';
import { setPerformanceMetrics } from '../store/slices/uiSlice';

interface PerformanceMetrics {
  pageLoadTime: number;
  renderTime: number;
  apiResponseTime: number;
  memoryUsage?: number;
  connectionType?: string;
  effectiveType?: string;
}

interface PerformanceMonitoringContextType {
  trackPageLoad: (pageName: string) => void;
  trackApiCall: (endpoint: string, duration: number, success: boolean) => void;
  trackUserInteraction: (action: string, element: string) => void;
  trackError: (error: string, context?: Record<string, any>) => void;
  getPerformanceMetrics: () => PerformanceMetrics | null;
}

const PerformanceMonitoringContext = createContext<PerformanceMonitoringContextType | undefined>(undefined);

interface PerformanceMonitoringProviderProps {
  children: ReactNode;
}

export const PerformanceMonitoringProvider: React.FC<PerformanceMonitoringProviderProps> = ({ children }) => {
  const dispatch = useDispatch();

  // Track Core Web Vitals
  const trackCoreWebVitals = useCallback(() => {
    // Track Largest Contentful Paint (LCP)
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as any;
          if (lastEntry) {
            console.log('LCP:', lastEntry.startTime);
            // TODO: Send to analytics service
          }
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

        // Track First Input Delay (FID)
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            console.log('FID:', entry.processingStart - entry.startTime);
            // TODO: Send to analytics service
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });

        // Track Cumulative Layout Shift (CLS)
        const clsObserver = new PerformanceObserver((list) => {
          let clsValue = 0;
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });
          console.log('CLS:', clsValue);
          // TODO: Send to analytics service
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (error) {
        console.warn('Performance Observer not fully supported:', error);
      }
    }
  }, []);

  const trackPageLoad = useCallback((pageName: string) => {
    const navigationTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    if (navigationTiming) {
      const pageLoadTime = navigationTiming.loadEventEnd - navigationTiming.fetchStart;
      const renderTime = navigationTiming.domContentLoadedEventEnd - navigationTiming.fetchStart;
      
      const metrics: PerformanceMetrics = {
        pageLoadTime,
        renderTime,
        apiResponseTime: 0, // Will be updated by API calls
      };

      // Add memory usage if available
      if ('memory' in performance) {
        const memoryInfo = (performance as any).memory;
        metrics.memoryUsage = memoryInfo.usedJSHeapSize;
      }

      // Add connection info if available
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        metrics.connectionType = connection.type;
        metrics.effectiveType = connection.effectiveType;
      }

      dispatch(setPerformanceMetrics(metrics));

      // Log performance data
      const performanceLog = {
        pageName,
        metrics,
        timestamp: new Date().toISOString(),
        url: window.location.href,
      };

      try {
        const existingLogs = JSON.parse(localStorage.getItem('performanceLogs') || '[]');
        existingLogs.push(performanceLog);
        
        // Keep only last 100 performance logs
        if (existingLogs.length > 100) {
          existingLogs.splice(0, existingLogs.length - 100);
        }
        
        localStorage.setItem('performanceLogs', JSON.stringify(existingLogs));
      } catch (error) {
        console.error('Failed to log performance data:', error);
      }

      // TODO: Send to analytics service (e.g., Google Analytics, Mixpanel)
      if (process.env.NODE_ENV === 'development') {
        console.log('Page performance tracked:', performanceLog);
      }
    }
  }, [dispatch]);

  const trackApiCall = useCallback((endpoint: string, duration: number, success: boolean) => {
    const apiLog = {
      endpoint,
      duration,
      success,
      timestamp: new Date().toISOString(),
    };

    try {
      const existingLogs = JSON.parse(localStorage.getItem('apiPerformanceLogs') || '[]');
      existingLogs.push(apiLog);
      
      // Keep only last 200 API performance logs
      if (existingLogs.length > 200) {
        existingLogs.splice(0, existingLogs.length - 200);
      }
      
      localStorage.setItem('apiPerformanceLogs', JSON.stringify(existingLogs));
    } catch (error) {
      console.error('Failed to log API performance:', error);
    }

    // TODO: Send to monitoring service
    if (process.env.NODE_ENV === 'development') {
      console.log('API call tracked:', apiLog);
    }
  }, []);

  const trackUserInteraction = useCallback((action: string, element: string) => {
    const interactionLog = {
      action,
      element,
      timestamp: new Date().toISOString(),
      url: window.location.href,
    };

    try {
      const existingLogs = JSON.parse(localStorage.getItem('userInteractionLogs') || '[]');
      existingLogs.push(interactionLog);
      
      // Keep only last 500 interaction logs
      if (existingLogs.length > 500) {
        existingLogs.splice(0, existingLogs.length - 500);
      }
      
      localStorage.setItem('userInteractionLogs', JSON.stringify(existingLogs));
    } catch (error) {
      console.error('Failed to log user interaction:', error);
    }

    // TODO: Send to analytics service
    if (process.env.NODE_ENV === 'development') {
      console.log('User interaction tracked:', interactionLog);
    }
  }, []);

  const trackError = useCallback((error: string, context?: Record<string, any>) => {
    const errorLog = {
      error,
      context,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    try {
      const existingLogs = JSON.parse(localStorage.getItem('performanceErrorLogs') || '[]');
      existingLogs.push(errorLog);
      
      // Keep only last 100 error logs
      if (existingLogs.length > 100) {
        existingLogs.splice(0, existingLogs.length - 100);
      }
      
      localStorage.setItem('performanceErrorLogs', JSON.stringify(existingLogs));
    } catch (loggingError) {
      console.error('Failed to log performance error:', loggingError);
    }

    // TODO: Send to error tracking service
    if (process.env.NODE_ENV === 'development') {
      console.log('Performance error tracked:', errorLog);
    }
  }, []);

  const getPerformanceMetrics = useCallback((): PerformanceMetrics | null => {
    const navigationTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    if (!navigationTiming) return null;

    const metrics: PerformanceMetrics = {
      pageLoadTime: navigationTiming.loadEventEnd - navigationTiming.fetchStart,
      renderTime: navigationTiming.domContentLoadedEventEnd - navigationTiming.fetchStart,
      apiResponseTime: 0, // This would be calculated from tracked API calls
    };

    if ('memory' in performance) {
      const memoryInfo = (performance as any).memory;
      metrics.memoryUsage = memoryInfo.usedJSHeapSize;
    }

    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      metrics.connectionType = connection.type;
      metrics.effectiveType = connection.effectiveType;
    }

    return metrics;
  }, []);

  // Initialize performance monitoring
  useEffect(() => {
    // Track initial page load
    if (document.readyState === 'complete') {
      trackPageLoad('initial');
    } else {
      window.addEventListener('load', () => trackPageLoad('initial'));
    }

    // Track Core Web Vitals
    trackCoreWebVitals();

    // Track resource loading performance
    if ('PerformanceObserver' in window) {
      try {
        const resourceObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.duration > 1000) { // Log slow resources (>1s)
              console.warn('Slow resource:', entry.name, entry.duration);
              // TODO: Send to monitoring service
            }
          });
        });
        resourceObserver.observe({ entryTypes: ['resource'] });
      } catch (error) {
        console.warn('Resource performance monitoring not available:', error);
      }
    }

    // Monitor memory usage periodically
    const memoryMonitor = setInterval(() => {
      if ('memory' in performance) {
        const memoryInfo = (performance as any).memory;
        const usagePercent = (memoryInfo.usedJSHeapSize / memoryInfo.jsHeapSizeLimit) * 100;
        
        if (usagePercent > 80) {
          console.warn('High memory usage:', usagePercent.toFixed(2) + '%');
          trackError('High memory usage detected', {
            usagePercent,
            usedJSHeapSize: memoryInfo.usedJSHeapSize,
            jsHeapSizeLimit: memoryInfo.jsHeapSizeLimit,
          });
        }
      }
    }, 30000); // Check every 30 seconds

    return () => {
      clearInterval(memoryMonitor);
    };
  }, [trackPageLoad, trackCoreWebVitals, trackError]);

  const value: PerformanceMonitoringContextType = {
    trackPageLoad,
    trackApiCall,
    trackUserInteraction,
    trackError,
    getPerformanceMetrics,
  };

  return (
    <PerformanceMonitoringContext.Provider value={value}>
      {children}
    </PerformanceMonitoringContext.Provider>
  );
};

export const usePerformanceMonitoring = (): PerformanceMonitoringContextType => {
  const context = useContext(PerformanceMonitoringContext);
  if (!context) {
    throw new Error('usePerformanceMonitoring must be used within a PerformanceMonitoringProvider');
  }
  return context;
};

// Higher-order component for automatic performance tracking
export const withPerformanceTracking = <P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
): React.ComponentType<P> => {
  return (props: P) => {
    const { trackUserInteraction } = usePerformanceMonitoring();

    useEffect(() => {
      const startTime = performance.now();
      
      return () => {
        const renderTime = performance.now() - startTime;
        if (renderTime > 100) { // Log slow renders (>100ms)
          console.warn(`Slow render for ${componentName}:`, renderTime);
        }
      };
    }, []);

    const handleClick = useCallback((event: React.MouseEvent) => {
      const target = event.target as HTMLElement;
      trackUserInteraction('click', `${componentName}:${target.tagName}`);
    }, [trackUserInteraction]);

    return (
      <div onClick={handleClick}>
        <Component {...props} />
      </div>
    );
  };
};
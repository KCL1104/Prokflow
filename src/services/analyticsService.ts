import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';

// Analytics event types
export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  userId?: string;
  timestamp?: string;
  sessionId?: string;
}

// User properties for analytics
export interface UserProperties {
  userId: string;
  email?: string;
  name?: string;
  role?: string;
  projectCount?: number;
  teamSize?: number;
  subscriptionPlan?: string;
  lastActiveDate?: string;
}

// Page view tracking
export interface PageView {
  page: string;
  title?: string;
  url?: string;
  referrer?: string;
  userId?: string;
  timestamp?: string;
  sessionId?: string;
}

class AnalyticsService {
  private sessionId: string;
  private userId?: string;
  private isInitialized = false;
  private eventQueue: AnalyticsEvent[] = [];
  private pageViewQueue: PageView[] = [];

  constructor() {
    this.sessionId = this.generateSessionId();
    this.initializeAnalytics();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeAnalytics() {
    try {
      // TODO: Initialize external analytics services
      // Example integrations:
      // - Google Analytics 4
      // - Mixpanel
      // - Amplitude
      // - PostHog
      // - Custom analytics endpoint
      
      // For now, we'll use localStorage and console logging
      this.isInitialized = true;
      console.log('Analytics service initialized with session:', this.sessionId);
      
      // Process queued events
      this.processEventQueue();
    } catch (error) {
      console.error('Failed to initialize analytics:', error);
    }
  }

  private processEventQueue() {
    // Process queued events
    this.eventQueue.forEach(event => this.sendEvent(event));
    this.pageViewQueue.forEach(pageView => this.sendPageView(pageView));
    
    // Clear queues
    this.eventQueue = [];
    this.pageViewQueue = [];
  }

  private sendEvent(event: AnalyticsEvent) {
    if (!this.isInitialized) {
      this.eventQueue.push(event);
      return;
    }

    const enrichedEvent = {
      ...event,
      userId: event.userId || this.userId,
      sessionId: this.sessionId,
      timestamp: event.timestamp || new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      screen: {
        width: window.screen.width,
        height: window.screen.height,
      },
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
    };

    try {
      // Store locally for now
      const events = this.getStoredEvents();
      events.push(enrichedEvent);
      localStorage.setItem('analytics_events', JSON.stringify(events.slice(-1000))); // Keep last 1000 events
      
      // TODO: Send to external analytics service
      // await fetch('/api/analytics/events', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(enrichedEvent)
      // });
      
      console.log('Analytics event:', enrichedEvent);
    } catch (error) {
      console.error('Failed to send analytics event:', error);
    }
  }

  private sendPageView(pageView: PageView) {
    if (!this.isInitialized) {
      this.pageViewQueue.push(pageView);
      return;
    }

    const enrichedPageView = {
      ...pageView,
      userId: pageView.userId || this.userId,
      sessionId: this.sessionId,
      timestamp: pageView.timestamp || new Date().toISOString(),
      url: pageView.url || window.location.href,
      referrer: pageView.referrer || document.referrer,
      title: pageView.title || document.title,
    };

    try {
      // Store locally for now
      const pageViews = this.getStoredPageViews();
      pageViews.push(enrichedPageView);
      localStorage.setItem('analytics_page_views', JSON.stringify(pageViews.slice(-500))); // Keep last 500 page views
      
      // TODO: Send to external analytics service
      console.log('Analytics page view:', enrichedPageView);
    } catch (error) {
      console.error('Failed to send page view:', error);
    }
  }

  private getStoredEvents(): AnalyticsEvent[] {
    try {
      const stored = localStorage.getItem('analytics_events');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private getStoredPageViews(): PageView[] {
    try {
      const stored = localStorage.getItem('analytics_page_views');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  // Public methods
  setUserId(userId: string) {
    this.userId = userId;
  }

  identify(userProperties: UserProperties) {
    this.setUserId(userProperties.userId);
    
    // TODO: Send user identification to analytics service
    console.log('Analytics identify:', userProperties);
    
    // Store user properties
    try {
      localStorage.setItem('analytics_user', JSON.stringify(userProperties));
    } catch (error) {
      console.error('Failed to store user properties:', error);
    }
  }

  track(eventName: string, properties?: Record<string, any>) {
    this.sendEvent({
      name: eventName,
      properties,
    });
  }

  page(pageName: string, properties?: Record<string, any>) {
    this.sendPageView({
      page: pageName,
      ...properties,
    });
  }

  // Predefined event tracking methods
  trackUserAction(action: string, target: string, properties?: Record<string, any>) {
    this.track('user_action', {
      action,
      target,
      ...properties,
    });
  }

  trackProjectEvent(event: string, projectId: string, properties?: Record<string, any>) {
    this.track('project_event', {
      event,
      projectId,
      ...properties,
    });
  }

  trackWorkItemEvent(event: string, workItemId: string, properties?: Record<string, any>) {
    this.track('work_item_event', {
      event,
      workItemId,
      ...properties,
    });
  }

  trackCollaborationEvent(event: string, properties?: Record<string, any>) {
    this.track('collaboration_event', {
      event,
      ...properties,
    });
  }

  trackPerformance(metric: string, value: number, properties?: Record<string, any>) {
    this.track('performance_metric', {
      metric,
      value,
      ...properties,
    });
  }

  trackError(error: Error, context?: Record<string, any>) {
    this.track('error', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      ...context,
    });
  }

  // Get analytics data for debugging
  getAnalyticsData() {
    return {
      events: this.getStoredEvents(),
      pageViews: this.getStoredPageViews(),
      sessionId: this.sessionId,
      userId: this.userId,
    };
  }

  // Clear analytics data
  clearAnalyticsData() {
    localStorage.removeItem('analytics_events');
    localStorage.removeItem('analytics_page_views');
    localStorage.removeItem('analytics_user');
  }
}

// Create singleton instance
export const analyticsService = new AnalyticsService();

// React hook for analytics
export const useAnalytics = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const currentProject = useSelector((state: RootState) => state.project.currentProject);

  useEffect(() => {
    if (user) {
      analyticsService.identify({
        userId: user.id,
        email: user.email || undefined,
        name: user.user_metadata?.full_name || undefined,
        role: user.user_metadata?.role || undefined,
      });
    }
  }, [user]);

  const trackEvent = (eventName: string, properties?: Record<string, any>) => {
    analyticsService.track(eventName, {
      ...properties,
      projectId: currentProject?.id,
    });
  };

  const trackPageView = (pageName: string, properties?: Record<string, any>) => {
    analyticsService.page(pageName, {
      ...properties,
      projectId: currentProject?.id,
    });
  };

  const trackUserAction = (action: string, target: string, properties?: Record<string, any>) => {
    analyticsService.trackUserAction(action, target, {
      ...properties,
      projectId: currentProject?.id,
    });
  };

  const trackProjectEvent = (event: string, properties?: Record<string, any>) => {
    if (currentProject) {
      analyticsService.trackProjectEvent(event, currentProject.id, properties);
    }
  };

  const trackWorkItemEvent = (event: string, workItemId: string, properties?: Record<string, any>) => {
    analyticsService.trackWorkItemEvent(event, workItemId, {
      ...properties,
      projectId: currentProject?.id,
    });
  };

  const trackCollaborationEvent = (event: string, properties?: Record<string, any>) => {
    analyticsService.trackCollaborationEvent(event, {
      ...properties,
      projectId: currentProject?.id,
    });
  };

  const trackPerformance = (metric: string, value: number, properties?: Record<string, any>) => {
    analyticsService.trackPerformance(metric, value, {
      ...properties,
      projectId: currentProject?.id,
    });
  };

  const trackError = (error: Error, context?: Record<string, any>) => {
    analyticsService.trackError(error, {
      ...context,
      projectId: currentProject?.id,
    });
  };

  return {
    trackEvent,
    trackPageView,
    trackUserAction,
    trackProjectEvent,
    trackWorkItemEvent,
    trackCollaborationEvent,
    trackPerformance,
    trackError,
  };
};

// Page tracking hook
export const usePageTracking = (pageName: string) => {
  const { trackPageView } = useAnalytics();

  useEffect(() => {
    trackPageView(pageName);
  }, [pageName, trackPageView]);
};

export default analyticsService;
import { store } from '../store'
import { analyticsService } from './analyticsService'
import { emailService } from './emailService'
import { pwaService } from './pwaService'
import { setConnected } from '../store/slices/collaborationSlice'
import { addNotification } from '../store/slices/notificationSlice'
import { addToast, setPerformanceMetrics } from '../store/slices/uiSlice'

/**
 * Integration Service
 * Coordinates all services and ensures they work together seamlessly
 */
class IntegrationService {
  private initialized = false
  private performanceObserver?: PerformanceObserver
  private connectionCheckInterval?: NodeJS.Timeout

  /**
   * Initialize all integrations
   */
  async init(): Promise<void> {
    if (this.initialized) return

    try {
      // Initialize core services
      await this.initializeServices()
      
      // Setup cross-service integrations
      this.setupAnalyticsIntegration()
      this.setupNotificationIntegration()
      this.setupPerformanceMonitoring()
      this.setupConnectionMonitoring()
      this.setupErrorHandling()
      this.setupPWAIntegration()
      
      this.initialized = true
      
      // Track successful initialization
      analyticsService.track('integration_initialized', {
        timestamp: Date.now(),
        services: ['analytics', 'email', 'pwa', 'notifications', 'collaboration']
      })
      
      console.log('🚀 Integration Service initialized successfully')
    } catch (error) {
      console.error('❌ Failed to initialize Integration Service:', error)
      analyticsService.trackError(error as Error, {
        context: 'integration_service_init'
      })
    }
  }

  /**
   * Initialize all core services
   */
  private async initializeServices(): Promise<void> {
    const initPromises = [
      // Services are initialized when imported
    ].filter(Boolean)

    await Promise.allSettled(initPromises)
  }

  /**
   * Setup analytics integration with Redux store
   */
  private setupAnalyticsIntegration(): void {
    // Subscribe to store changes for analytics
    store.subscribe(() => {
      const state = store.getState()
      
      // Track user authentication changes
      if (state.auth.user) {
        analyticsService.setUserId(state.auth.user.id)
        analyticsService.setUserId(state.auth.user.id)
        analyticsService.identify({
          userId: state.auth.user.id,
          email: state.auth.user.email,
          name: state.auth.profile?.fullName || state.auth.profile?.full_name || state.auth.user?.email || '',
          role: state.auth.user.role
        })
      }
      
      // Track current project changes
      if (state.project.currentProject) {
        analyticsService.track('project_switched', {
          projectId: state.project.currentProject.id,
          timestamp: Date.now()
        })
      }
    })
  }

  /**
   * Setup notification integration
   */
  private setupNotificationIntegration(): void {
    // Listen for notification events and send emails if needed
    store.subscribe(() => {
      const state = store.getState()
      const notifications = state.notification.notifications
      
      // Send email for high-priority notifications
      notifications.forEach((notification: any) => {
        if (notification.priority === 'high' && !notification.emailSent) {
          this.sendNotificationEmail(notification)
        }
      })
    })
  }

  /**
   * Setup performance monitoring
   */
  private setupPerformanceMonitoring(): void {
    if (typeof window === 'undefined') return

    // Monitor Core Web Vitals
    this.observePerformanceMetrics()
    
    // Monitor memory usage
    setInterval(() => {
      if ('memory' in performance) {
        store.dispatch(setPerformanceMetrics({
          pageLoadTime: 0,
          renderTime: 0,
          apiResponseTime: 0
        }))
      }
    }, 30000) // Every 30 seconds
  }

  /**
   * Setup connection monitoring
   */
  private setupConnectionMonitoring(): void {
    if (typeof window === 'undefined') return

    // Monitor online/offline status
    const updateConnectionStatus = () => {
      const isOnline = navigator.onLine
      store.dispatch(setConnected(isOnline))
      
      if (!isOnline) {
        store.dispatch(addToast({
          type: 'warning',
          title: 'Connection Status',
          message: 'You are currently offline. Some features may be limited.',
          duration: 5000
        }))
      }
    }

    window.addEventListener('online', updateConnectionStatus)
    window.addEventListener('offline', updateConnectionStatus)
    updateConnectionStatus() // Initial check

    // Periodic connection quality check
    this.connectionCheckInterval = setInterval(async () => {
      try {
          await fetch('/api/health', { method: 'HEAD' })
          store.dispatch(setConnected(true))
        } catch (error) {
          store.dispatch(setConnected(false))
        }
    }, 60000) // Every minute
  }

  /**
   * Setup global error handling
   */
  private setupErrorHandling(): void {
    if (typeof window === 'undefined') return

    // Handle unhandled errors
    window.addEventListener('error', (event) => {
      const error = event.error || new Error(event.message)
      this.handleError(error, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        type: 'javascript_error'
      })
    })

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      const error = new Error(event.reason)
      this.handleError(error, {
        type: 'unhandled_promise_rejection'
      })
    })
  }

  /**
   * Setup PWA integration
   */
  private setupPWAIntegration(): void {
    // Listen for PWA events and show appropriate notifications
    pwaService.on('update-available', () => {
      store.dispatch(addNotification({
        id: `update-${Date.now()}`,
        type: 'info',
        title: 'App Update Available',
        message: 'A new version of the app is available. Refresh to update.',
        userId: store.getState().auth.user?.id || 'system',
        projectId: store.getState().project.currentProject?.id || 'system',
        priority: 'medium',
        read: false,
        createdAt: new Date()
      }))
    })

    pwaService.on('install-available', () => {
      store.dispatch(addToast({
        type: 'info',
        title: 'Install App',
        message: 'Install Kiro Pro for a better experience!',
        duration: 8000
      }))
    })
  }

  /**
   * Observe performance metrics
   */
  private observePerformanceMetrics(): void {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return

    try {
      this.performanceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        
        entries.forEach((entry) => {
          // Track navigation timing
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming
            const loadTime = navEntry.loadEventEnd - navEntry.loadEventStart
            analyticsService.trackPerformance('navigation_load_time', loadTime, {
              domContentLoaded: navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart,
              firstPaint: navEntry.loadEventEnd - navEntry.fetchStart
            })
          }
          
          // Track resource timing
          if (entry.entryType === 'resource') {
            const resourceEntry = entry as PerformanceResourceTiming
            if (resourceEntry.duration > 1000) { // Only track slow resources
              analyticsService.trackPerformance('slow_resource_duration', resourceEntry.duration, {
                name: resourceEntry.name,
                size: resourceEntry.transferSize
              })
            }
          }
        })
      })

      this.performanceObserver.observe({ entryTypes: ['navigation', 'resource', 'paint'] })
    } catch (error) {
      console.warn('Performance monitoring not available:', error)
    }
  }

  /**
   * Handle errors across the application
   */
  private handleError(error: Error, context: Record<string, any> = {}): void {
    // Log to analytics
    analyticsService.trackError(error, context)
    
    // Show user-friendly error message
    store.dispatch(addToast({
      type: 'error',
      title: 'Error',
      message: 'Something went wrong. Our team has been notified.',
      duration: 5000
    }))
    
    // Add to notifications for critical errors
    if (context.type === 'critical') {
      store.dispatch(addNotification({
        id: `error-${Date.now()}`,
        type: 'error',
        title: 'Integration Error',
        message: error.message,
        userId: store.getState().auth.user?.id || 'system',
        projectId: store.getState().project.currentProject?.id || 'system',
        priority: 'high',
        read: false,
        createdAt: new Date()
      }))
    }
  }

  /**
   * Send notification email
   */
  private async sendNotificationEmail(notification: any): Promise<void> {
    try {
      const state = store.getState()
      const user = state.auth.user
      
      if (!user || !user.email) return
      
      await emailService.sendNotificationEmail(
        user.email,
        notification.type,
        {
          title: notification.title,
          message: notification.message,
          actionUrl: notification.actionUrl
        }
      )
      
      // Mark as email sent (you'd need to add this field to the notification)
      // This is a placeholder - you'd implement this in your notification slice
    } catch (error) {
      console.error('Failed to send notification email:', error)
    }
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.performanceObserver) {
      this.performanceObserver.disconnect()
    }
    
    if (this.connectionCheckInterval) {
      clearInterval(this.connectionCheckInterval)
    }
    
    this.initialized = false
  }
}

export const integrationService = new IntegrationService()
export default integrationService
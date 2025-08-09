// PWA Service for managing Progressive Web App features

export interface PWAInstallPrompt {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export interface PWAUpdateAvailable {
  waiting: ServiceWorker | null;
  skipWaiting(): void;
}

export interface PWAOfflineAction {
  id: string;
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: string;
  timestamp: number;
  retryCount: number;
}

export interface PWANotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
  requireInteraction?: boolean;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

class PWAService {
  private installPrompt: PWAInstallPrompt | null = null;
  private registration: ServiceWorkerRegistration | null = null;
  private updateAvailable = false;
  private isOnline = navigator.onLine;
  private offlineActions: PWAOfflineAction[] = [];
  private listeners: Map<string, Function[]> = new Map();

  constructor() {
    this.initializeEventListeners();
    this.loadOfflineActions();
  }

  // Initialize PWA service
  async initialize(): Promise<void> {
    try {
      // Register service worker
      await this.registerServiceWorker();
      
      // Setup install prompt
      this.setupInstallPrompt();
      
      // Setup update detection
      this.setupUpdateDetection();
      
      // Setup background sync
      this.setupBackgroundSync();
      
      // Setup push notifications
      await this.setupPushNotifications();
      
      console.log('PWA Service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize PWA Service:', error);
    }
  }

  // Register service worker
  private async registerServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        this.registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        });
        
        console.log('Service Worker registered:', this.registration);
        
        // Listen for service worker messages
        navigator.serviceWorker.addEventListener('message', (event) => {
          this.handleServiceWorkerMessage(event.data);
        });
        
        this.emit('sw-registered', this.registration);
      } catch (error) {
        console.error('Service Worker registration failed:', error);
        throw error;
      }
    } else {
      throw new Error('Service Workers not supported');
    }
  }

  // Setup install prompt
  private setupInstallPrompt(): void {
    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
      this.installPrompt = event as any;
      this.emit('install-available', this.installPrompt);
    });

    window.addEventListener('appinstalled', () => {
      this.installPrompt = null;
      this.emit('app-installed');
    });
  }

  // Setup update detection
  private setupUpdateDetection(): void {
    if (this.registration) {
      this.registration.addEventListener('updatefound', () => {
        const newWorker = this.registration!.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              this.updateAvailable = true;
              this.emit('update-available', {
                waiting: newWorker,
                skipWaiting: () => this.skipWaiting()
              });
            }
          });
        }
      });
    }
  }

  // Setup background sync
  private setupBackgroundSync(): void {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      // Background sync is supported
      console.log('Background sync is supported');
    } else {
      console.log('Background sync is not supported');
    }
  }

  // Setup push notifications
  private async setupPushNotifications(): Promise<void> {
    if ('Notification' in window && 'serviceWorker' in navigator) {
      // Check current permission
      if (Notification.permission === 'default') {
        console.log('Notification permission not granted yet');
      } else if (Notification.permission === 'granted') {
        await this.subscribeToPushNotifications();
      }
    }
  }

  // Initialize event listeners
  private initializeEventListeners(): void {
    // Online/offline detection
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.emit('online');
      this.syncOfflineActions();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.emit('offline');
    });

    // Visibility change for background sync
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.isOnline) {
        this.syncOfflineActions();
      }
    });
  }

  // Public methods

  // Check if app can be installed
  canInstall(): boolean {
    return this.installPrompt !== null;
  }

  // Trigger install prompt
  async install(): Promise<'accepted' | 'dismissed'> {
    if (!this.installPrompt) {
      throw new Error('Install prompt not available');
    }

    await this.installPrompt.prompt();
    const choice = await this.installPrompt.userChoice;
    
    if (choice.outcome === 'accepted') {
      this.installPrompt = null;
    }
    
    return choice.outcome;
  }

  // Check if update is available
  isUpdateAvailable(): boolean {
    return this.updateAvailable;
  }

  // Apply update
  async applyUpdate(): Promise<void> {
    if (!this.updateAvailable) {
      throw new Error('No update available');
    }

    this.skipWaiting();
  }

  // Skip waiting and activate new service worker
  private skipWaiting(): void {
    if (this.registration?.waiting) {
      this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      
      // Reload page after new SW takes control
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });
    }
  }

  // Request notification permission
  async requestNotificationPermission(): Promise<NotificationPermission> {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        await this.subscribeToPushNotifications();
      }
      
      return permission;
    }
    
    throw new Error('Notifications not supported');
  }

  // Subscribe to push notifications
  private async subscribeToPushNotifications(): Promise<void> {
    if (!this.registration) {
      throw new Error('Service Worker not registered');
    }

    try {
      // TODO: Replace with your VAPID public key
      const vapidPublicKey = 'YOUR_VAPID_PUBLIC_KEY';
      
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey)
      });

      // Send subscription to server
      await this.sendSubscriptionToServer(subscription);
      
      console.log('Push notification subscription successful');
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
    }
  }

  // Send subscription to server
  private async sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
    // TODO: Implement server endpoint to store subscription
    try {
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(subscription)
      });
    } catch (error) {
      console.error('Failed to send subscription to server:', error);
    }
  }

  // Show local notification
  async showNotification(options: PWANotificationOptions): Promise<void> {
    if (!this.registration) {
      throw new Error('Service Worker not registered');
    }

    if (Notification.permission !== 'granted') {
      throw new Error('Notification permission not granted');
    }

    await this.registration.showNotification(options.title, {
      body: options.body,
      icon: options.icon || '/icons/icon-192x192.png',
      badge: options.badge || '/icons/badge-72x72.png',
      tag: options.tag,
      data: options.data,
      requireInteraction: options.requireInteraction
    });
  }

  // Add offline action
  addOfflineAction(action: Omit<PWAOfflineAction, 'id' | 'timestamp' | 'retryCount'>): void {
    const offlineAction: PWAOfflineAction = {
      ...action,
      id: this.generateId(),
      timestamp: Date.now(),
      retryCount: 0
    };

    this.offlineActions.push(offlineAction);
    this.saveOfflineActions();

    // Try to sync immediately if online
    if (this.isOnline) {
      this.syncOfflineActions();
    }
  }

  // Sync offline actions
  private async syncOfflineActions(): Promise<void> {
    if (!this.isOnline || this.offlineActions.length === 0) {
      return;
    }

    const actionsToSync = [...this.offlineActions];
    
    for (const action of actionsToSync) {
      try {
        await fetch(action.url, {
          method: action.method,
          headers: action.headers,
          body: action.body
        });

        // Remove successful action
        this.removeOfflineAction(action.id);
        this.emit('action-synced', action);
      } catch (error) {
        // Increment retry count
        action.retryCount++;
        
        // Remove action if max retries reached
        if (action.retryCount >= 3) {
          this.removeOfflineAction(action.id);
          this.emit('action-failed', action);
        }
        
        console.error('Failed to sync offline action:', error);
      }
    }

    this.saveOfflineActions();
  }

  // Remove offline action
  private removeOfflineAction(actionId: string): void {
    this.offlineActions = this.offlineActions.filter(action => action.id !== actionId);
  }

  // Load offline actions from storage
  private loadOfflineActions(): void {
    try {
      const stored = localStorage.getItem('pwa-offline-actions');
      if (stored) {
        this.offlineActions = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load offline actions:', error);
    }
  }

  // Save offline actions to storage
  private saveOfflineActions(): void {
    try {
      localStorage.setItem('pwa-offline-actions', JSON.stringify(this.offlineActions));
    } catch (error) {
      console.error('Failed to save offline actions:', error);
    }
  }

  // Handle service worker messages
  private handleServiceWorkerMessage(data: any): void {
    switch (data.type) {
      case 'CACHE_UPDATED':
        this.emit('cache-updated', data);
        break;
      case 'BACKGROUND_SYNC':
        this.emit('background-sync', data);
        break;
      default:
        console.log('Unknown service worker message:', data);
    }
  }

  // Event emitter methods
  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  private emit(event: string, data?: any): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  // Utility methods
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  // Getters
  get isAppOnline(): boolean {
    return this.isOnline;
  }

  get serviceWorkerRegistration(): ServiceWorkerRegistration | null {
    return this.registration;
  }

  get pendingOfflineActions(): PWAOfflineAction[] {
    return [...this.offlineActions];
  }
}

// Create singleton instance
export const pwaService = new PWAService();

// React hook for PWA features
export function usePWA() {
  const [canInstall, setCanInstall] = React.useState(pwaService.canInstall());
  const [isUpdateAvailable, setIsUpdateAvailable] = React.useState(pwaService.isUpdateAvailable());
  const [isOnline, setIsOnline] = React.useState(pwaService.isAppOnline);
  const [pendingActions, setPendingActions] = React.useState(pwaService.pendingOfflineActions);

  React.useEffect(() => {
    const handleInstallAvailable = () => setCanInstall(true);
    const handleAppInstalled = () => setCanInstall(false);
    const handleUpdateAvailable = () => setIsUpdateAvailable(true);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    const handleActionSynced = () => setPendingActions(pwaService.pendingOfflineActions);

    pwaService.on('install-available', handleInstallAvailable);
    pwaService.on('app-installed', handleAppInstalled);
    pwaService.on('update-available', handleUpdateAvailable);
    pwaService.on('online', handleOnline);
    pwaService.on('offline', handleOffline);
    pwaService.on('action-synced', handleActionSynced);
    pwaService.on('action-failed', handleActionSynced);

    return () => {
      pwaService.off('install-available', handleInstallAvailable);
      pwaService.off('app-installed', handleAppInstalled);
      pwaService.off('update-available', handleUpdateAvailable);
      pwaService.off('online', handleOnline);
      pwaService.off('offline', handleOffline);
      pwaService.off('action-synced', handleActionSynced);
      pwaService.off('action-failed', handleActionSynced);
    };
  }, []);

  return {
    canInstall,
    isUpdateAvailable,
    isOnline,
    pendingActions,
    install: () => pwaService.install(),
    applyUpdate: () => pwaService.applyUpdate(),
    requestNotificationPermission: () => pwaService.requestNotificationPermission(),
    showNotification: (options: PWANotificationOptions) => pwaService.showNotification(options),
    addOfflineAction: (action: Omit<PWAOfflineAction, 'id' | 'timestamp' | 'retryCount'>) => 
      pwaService.addOfflineAction(action)
  };
}

// Import React for the hook
import React from 'react';

export default pwaService;
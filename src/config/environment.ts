/**
 * Environment Configuration
 * Centralized configuration management for different environments
 */

export interface EnvironmentConfig {
  supabase: {
    url: string;
    anonKey: string;
  };
  app: {
    name: string;
    version: string;
    environment: 'development' | 'staging' | 'production';
    debug: boolean;
  };
  features: {
    enableAnalytics: boolean;
    enableErrorTracking: boolean;
    enablePerformanceMonitoring: boolean;
    enableRealtime: boolean;
  };
  performance: {
    enableLazyLoading: boolean;
    chunkSizeWarningLimit: number;
    maxConcurrentRequests: number;
  };
}

// Validate required environment variables
function validateEnvironmentVariables(): void {
  const required = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY'
  ];

  const missing = required.filter(key => !import.meta.env[key]);
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please check your .env.local file and ensure all required variables are set.'
    );
  }
}

// Get environment-specific configuration
function getEnvironmentConfig(): EnvironmentConfig {
  const env = import.meta.env.MODE || 'development';
  const isDevelopment = env === 'development';
  const isProduction = env === 'production';

  return {
    supabase: {
      url: import.meta.env.VITE_SUPABASE_URL,
      anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    },
    app: {
      name: 'Project Management Platform',
      version: import.meta.env.VITE_APP_VERSION || '1.0.0',
      environment: env as 'development' | 'staging' | 'production',
      debug: isDevelopment,
    },
    features: {
      enableAnalytics: isProduction,
      enableErrorTracking: isProduction,
      enablePerformanceMonitoring: isProduction,
      enableRealtime: true,
    },
    performance: {
      enableLazyLoading: true,
      chunkSizeWarningLimit: isProduction ? 500 : 1000,
      maxConcurrentRequests: isProduction ? 6 : 10,
    },
  };
}

// Initialize and validate configuration
validateEnvironmentVariables();
export const config = getEnvironmentConfig();

// Environment helpers
export const isDevelopment = config.app.environment === 'development';
export const isProduction = config.app.environment === 'production';
export const isStaging = config.app.environment === 'staging';

// Debug logging helper
export const debugLog = (message: string, ...args: unknown[]): void => {
  if (config.app.debug) {
    console.log(`[DEBUG] ${message}`, ...args);
  }
};

// Performance monitoring helper
export const performanceLog = (label: string, startTime: number): void => {
  if (config.features.enablePerformanceMonitoring) {
    const duration = performance.now() - startTime;
    console.log(`[PERF] ${label}: ${duration.toFixed(2)}ms`);
  }
};

// Error tracking helper
export const trackError = (error: Error, context?: Record<string, unknown>): void => {
  if (config.features.enableErrorTracking) {
    // In production, this would integrate with error tracking service
    console.error('[ERROR]', error, context);
  }
};
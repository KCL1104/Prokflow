import React, { lazy } from 'react';

/**
 * Utility for creating lazy-loaded components with better error handling
 */
export function createLazyComponent(
  importFn: () => Promise<{ default: React.ComponentType }>,
  componentName?: string
): React.LazyExoticComponent<React.ComponentType> {
  return lazy(async () => {
    try {
      const module = await importFn();
      return module;
    } catch (error) {
      console.error(`Failed to load component ${componentName || 'Unknown'}:`, error);
      // Return a fallback component that will be defined in the components file
      const { LazyLoadErrorFallback } = await import('./lazyLoading');
      return {
        default: LazyLoadErrorFallback
      };
    }
  });
}
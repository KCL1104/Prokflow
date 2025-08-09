import { useState, useEffect, useCallback, useMemo, useRef } from 'react';

// Tailwind CSS breakpoints - matches project's Tailwind configuration
export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export type Breakpoint = keyof typeof breakpoints;

// Type for responsive values configuration
export interface ResponsiveValues<T> {
  base: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
  '2xl'?: T;
}

// Type for window dimensions
export interface WindowDimensions {
  width: number;
  height: number;
}

// Type for safe area insets
export interface SafeAreaInsets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

// Type for viewport information
export interface ViewportInfo extends WindowDimensions {
  safeAreaInsets: SafeAreaInsets;
  availableHeight: number;
  availableWidth: number;
}

// Debounce utility with improved type safety and cleanup
function debounce<T extends (...args: unknown[]) => void>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) & { cancel: () => void } {
  let timeout: NodeJS.Timeout | null = null;
  
  const debounced = (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      timeout = null;
      func(...args);
    }, wait);
  };
  
  debounced.cancel = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  };
  
  return debounced;
}

// Type guard for browser environment with better SSR support
const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined';

// Default dimensions for SSR - matches common desktop viewport
const DEFAULT_DIMENSIONS: WindowDimensions = {
  width: 1024,
  height: 768,
} as const;

// Default safe area insets
const DEFAULT_SAFE_AREA_INSETS: SafeAreaInsets = {
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
} as const;

/**
 * Hook for responsive design utilities with performance optimizations and error handling
 * Provides breakpoint detection, window size tracking, and responsive utilities
 */
export function useResponsive() {
  const [windowSize, setWindowSize] = useState<WindowDimensions>(() => ({
    width: isBrowser ? window.innerWidth : DEFAULT_DIMENSIONS.width,
    height: isBrowser ? window.innerHeight : DEFAULT_DIMENSIONS.height,
  }));

  // Use ref to track if component is mounted to prevent memory leaks
  const isMountedRef = useRef(true);

  const handleResize = useCallback(() => {
    if (!isBrowser || !isMountedRef.current) return;
    
    try {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    } catch (error) {
      // Gracefully handle potential errors in window access
      console.warn('Error accessing window dimensions:', error);
    }
  }, []);

  // Debounced resize handler for better performance
  const debouncedHandleResize = useMemo(
    () => debounce(handleResize, 100),
    [handleResize]
  );

  useEffect(() => {
    if (!isBrowser) return;

    // Set initial size
    handleResize();

    window.addEventListener('resize', debouncedHandleResize, { passive: true });
    
    return () => {
      isMountedRef.current = false;
      window.removeEventListener('resize', debouncedHandleResize);
      debouncedHandleResize.cancel();
    };
  }, [handleResize, debouncedHandleResize]);

  // Memoize computed values for performance
  const computedValues = useMemo(() => {
    const { width } = windowSize;
    
    return {
      isMobile: width < breakpoints.md,
      isTablet: width >= breakpoints.md && width < breakpoints.lg,
      isDesktop: width >= breakpoints.lg,
      isSmallMobile: width < breakpoints.sm,
      isLargeDesktop: width >= breakpoints.xl,
    };
  }, [windowSize]);

  // Memoize breakpoint utility functions to prevent unnecessary re-renders
  const breakpointUtils = useMemo(() => ({
    isBreakpoint: (breakpoint: Breakpoint): boolean => {
      return windowSize.width >= breakpoints[breakpoint];
    },
    isBelow: (breakpoint: Breakpoint): boolean => {
      return windowSize.width < breakpoints[breakpoint];
    },
    isAbove: (breakpoint: Breakpoint): boolean => {
      return windowSize.width > breakpoints[breakpoint];
    },
    isBetween: (min: Breakpoint, max: Breakpoint): boolean => {
      return windowSize.width >= breakpoints[min] && windowSize.width < breakpoints[max];
    },
  }), [windowSize.width]);

  return {
    windowSize,
    ...computedValues,
    ...breakpointUtils,
    breakpoints,
  };
}

/**
 * Hook for responsive values based on breakpoints with improved type safety
 * Returns different values based on current screen size
 */
export function useResponsiveValue<T>(values: ResponsiveValues<T>): T {
  const { windowSize } = useResponsive();

  return useMemo(() => {
    const { width } = windowSize;

    // Find the appropriate value based on current screen size (largest to smallest)
    if (width >= breakpoints['2xl'] && values['2xl'] !== undefined) {
      return values['2xl'];
    }
    if (width >= breakpoints.xl && values.xl !== undefined) {
      return values.xl;
    }
    if (width >= breakpoints.lg && values.lg !== undefined) {
      return values.lg;
    }
    if (width >= breakpoints.md && values.md !== undefined) {
      return values.md;
    }
    if (width >= breakpoints.sm && values.sm !== undefined) {
      return values.sm;
    }

    return values.base;
  }, [windowSize, values]);
}

/**
 * Hook for touch device detection with proper type safety and error handling
 * Detects if the current device supports touch interactions
 */
export function useTouchDevice(): boolean {
  const [isTouchDevice, setIsTouchDevice] = useState<boolean>(() => {
    if (!isBrowser) return false;
    
    try {
      return (
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        // @ts-expect-error - Legacy IE support for touch detection
        (navigator.msMaxTouchPoints && navigator.msMaxTouchPoints > 0)
      );
    } catch (error) {
      console.warn('Error detecting touch device:', error);
      return false;
    }
  });

  useEffect(() => {
    if (!isBrowser) return;

    const checkTouchDevice = (): boolean => {
      try {
        return (
          'ontouchstart' in window ||
          navigator.maxTouchPoints > 0 ||
          // @ts-expect-error - Legacy IE support for touch detection
          (navigator.msMaxTouchPoints && navigator.msMaxTouchPoints > 0)
        );
      } catch (error) {
        console.warn('Error checking touch device capabilities:', error);
        return false;
      }
    };

    setIsTouchDevice(checkTouchDevice());
  }, []);

  return isTouchDevice;
}

/**
 * Hook for device orientation with debounced updates and error handling
 * Detects and tracks device orientation changes
 */
export function useOrientation(): 'portrait' | 'landscape' {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>(() => {
    if (!isBrowser) return 'portrait';
    
    try {
      return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
    } catch (error) {
      console.warn('Error detecting initial orientation:', error);
      return 'portrait';
    }
  });

  // Use ref to track if component is mounted
  const isMountedRef = useRef(true);

  const handleOrientationChange = useCallback(() => {
    if (!isBrowser || !isMountedRef.current) return;
    
    try {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
    } catch (error) {
      console.warn('Error handling orientation change:', error);
    }
  }, []);

  // Debounced orientation change handler
  const debouncedHandleOrientationChange = useMemo(
    () => debounce(handleOrientationChange, 150),
    [handleOrientationChange]
  );

  useEffect(() => {
    if (!isBrowser) return;

    // Set initial orientation
    handleOrientationChange();

    window.addEventListener('resize', debouncedHandleOrientationChange, { passive: true });
    window.addEventListener('orientationchange', debouncedHandleOrientationChange, { passive: true });

    return () => {
      isMountedRef.current = false;
      window.removeEventListener('resize', debouncedHandleOrientationChange);
      window.removeEventListener('orientationchange', debouncedHandleOrientationChange);
      debouncedHandleOrientationChange.cancel();
    };
  }, [handleOrientationChange, debouncedHandleOrientationChange]);

  return orientation;
}

/**
 * Hook for viewport dimensions with safe area insets and performance optimizations
 * Provides comprehensive viewport information including safe areas for mobile devices
 */
export function useViewport(): ViewportInfo {
  const { windowSize } = useResponsive();
  const [safeAreaInsets, setSafeAreaInsets] = useState<SafeAreaInsets>(DEFAULT_SAFE_AREA_INSETS);

  // Use ref to track if component is mounted
  const isMountedRef = useRef(true);

  const updateSafeAreaInsets = useCallback(() => {
    if (!isBrowser || !isMountedRef.current) return;

    try {
      const computedStyle = getComputedStyle(document.documentElement);
      const newInsets: SafeAreaInsets = {
        top: parseInt(computedStyle.getPropertyValue('--safe-area-inset-top') || '0', 10),
        right: parseInt(computedStyle.getPropertyValue('--safe-area-inset-right') || '0', 10),
        bottom: parseInt(computedStyle.getPropertyValue('--safe-area-inset-bottom') || '0', 10),
        left: parseInt(computedStyle.getPropertyValue('--safe-area-inset-left') || '0', 10),
      };
      
      // Only update if values have changed to prevent unnecessary re-renders
      setSafeAreaInsets(prevInsets => {
        if (
          prevInsets.top === newInsets.top &&
          prevInsets.right === newInsets.right &&
          prevInsets.bottom === newInsets.bottom &&
          prevInsets.left === newInsets.left
        ) {
          return prevInsets;
        }
        return newInsets;
      });
    } catch (error) {
      // Fallback to zero insets if CSS custom properties are not supported
      console.warn('Failed to read safe area insets:', error);
      setSafeAreaInsets(DEFAULT_SAFE_AREA_INSETS);
    }
  }, []);

  // Debounced safe area insets update
  const debouncedUpdateSafeAreaInsets = useMemo(
    () => debounce(updateSafeAreaInsets, 100),
    [updateSafeAreaInsets]
  );

  useEffect(() => {
    if (!isBrowser) return;

    updateSafeAreaInsets();
    window.addEventListener('resize', debouncedUpdateSafeAreaInsets, { passive: true });

    return () => {
      isMountedRef.current = false;
      window.removeEventListener('resize', debouncedUpdateSafeAreaInsets);
      debouncedUpdateSafeAreaInsets.cancel();
    };
  }, [updateSafeAreaInsets, debouncedUpdateSafeAreaInsets]);

  // Memoize computed viewport values for performance
  const computedViewport = useMemo((): ViewportInfo => ({
    width: windowSize.width,
    height: windowSize.height,
    safeAreaInsets,
    availableHeight: Math.max(0, windowSize.height - safeAreaInsets.top - safeAreaInsets.bottom),
    availableWidth: Math.max(0, windowSize.width - safeAreaInsets.left - safeAreaInsets.right),
  }), [windowSize, safeAreaInsets]);

  return computedViewport;
}
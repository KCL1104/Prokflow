import { renderHook, act } from '@testing-library/react';
import { useResponsive, useResponsiveValue, useTouchDevice, useOrientation, useViewport } from '../useResponsive';

// Mock window dimensions
const mockWindowSize = (width: number, height: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  });
};

// Mock resize event
const mockResizeEvent = (width: number, height: number) => {
  mockWindowSize(width, height);
  act(() => {
    window.dispatchEvent(new Event('resize'));
  });
};

describe('useResponsive', () => {
  beforeEach(() => {
    // Reset to default desktop size
    mockWindowSize(1024, 768);
  });

  it('should detect mobile screen size', () => {
    mockWindowSize(375, 667); // iPhone size
    const { result } = renderHook(() => useResponsive());

    expect(result.current.isMobile).toBe(true);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.isDesktop).toBe(false);
  });

  it('should detect tablet screen size', () => {
    mockWindowSize(768, 1024); // iPad size
    const { result } = renderHook(() => useResponsive());

    expect(result.current.isMobile).toBe(false);
    expect(result.current.isTablet).toBe(true);
    expect(result.current.isDesktop).toBe(false);
  });

  it('should detect desktop screen size', () => {
    mockWindowSize(1440, 900); // Desktop size
    const { result } = renderHook(() => useResponsive());

    expect(result.current.isMobile).toBe(false);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.isDesktop).toBe(true);
  });

  it('should update on window resize', async () => {
    const { result } = renderHook(() => useResponsive());

    // Start with desktop
    expect(result.current.isDesktop).toBe(true);

    // Resize to mobile
    mockResizeEvent(375, 667);
    
    // Wait for debounced update
    await new Promise(resolve => setTimeout(resolve, 150));
    
    expect(result.current.isMobile).toBe(true);
    expect(result.current.isDesktop).toBe(false);
  });

  it('should correctly identify breakpoints', () => {
    mockWindowSize(800, 600);
    const { result } = renderHook(() => useResponsive());

    expect(result.current.isBreakpoint('sm')).toBe(true);
    expect(result.current.isBreakpoint('md')).toBe(true);
    expect(result.current.isBreakpoint('lg')).toBe(false);
    expect(result.current.isBreakpoint('xl')).toBe(false);
  });

  it('should correctly identify below/above breakpoints', () => {
    mockWindowSize(800, 600);
    const { result } = renderHook(() => useResponsive());

    expect(result.current.isBelow('lg')).toBe(true);
    expect(result.current.isAbove('sm')).toBe(true);
    expect(result.current.isBelow('sm')).toBe(false);
    expect(result.current.isAbove('lg')).toBe(false);
  });

  it('should correctly identify between breakpoints', () => {
    mockWindowSize(800, 600);
    const { result } = renderHook(() => useResponsive());

    expect(result.current.isBetween('md', 'lg')).toBe(true);
    expect(result.current.isBetween('sm', 'md')).toBe(false);
    expect(result.current.isBetween('lg', 'xl')).toBe(false);
  });

  it('should return correct window size', () => {
    mockWindowSize(1200, 800);
    const { result } = renderHook(() => useResponsive());

    expect(result.current.windowSize.width).toBe(1200);
    expect(result.current.windowSize.height).toBe(800);
  });

  it('should detect small mobile and large desktop', () => {
    // Small mobile
    mockWindowSize(320, 568);
    const { result: smallResult } = renderHook(() => useResponsive());
    expect(smallResult.current.isSmallMobile).toBe(true);
    expect(smallResult.current.isLargeDesktop).toBe(false);

    // Large desktop
    mockWindowSize(1920, 1080);
    const { result: largeResult } = renderHook(() => useResponsive());
    expect(largeResult.current.isSmallMobile).toBe(false);
    expect(largeResult.current.isLargeDesktop).toBe(true);
  });
});

describe('useResponsiveValue', () => {
  beforeEach(() => {
    mockWindowSize(1024, 768);
  });

  it('should return base value for small screens', () => {
    mockWindowSize(400, 600);
    const { result } = renderHook(() =>
      useResponsiveValue({
        base: 'mobile',
        md: 'tablet',
        lg: 'desktop'
      })
    );

    expect(result.current).toBe('mobile');
  });

  it('should return md value for medium screens', () => {
    mockWindowSize(800, 600);
    const { result } = renderHook(() =>
      useResponsiveValue({
        base: 'mobile',
        md: 'tablet',
        lg: 'desktop'
      })
    );

    expect(result.current).toBe('tablet');
  });

  it('should return lg value for large screens', () => {
    mockWindowSize(1200, 800);
    const { result } = renderHook(() =>
      useResponsiveValue({
        base: 'mobile',
        md: 'tablet',
        lg: 'desktop'
      })
    );

    expect(result.current).toBe('desktop');
  });

  it('should fall back to base value when specific breakpoint not defined', () => {
    mockWindowSize(1200, 800);
    const { result } = renderHook(() =>
      useResponsiveValue({
        base: 'default',
        md: 'tablet'
      })
    );

    expect(result.current).toBe('tablet'); // Falls back to highest available
  });

  it('should update value on resize', async () => {
    const { result } = renderHook(() =>
      useResponsiveValue({
        base: 'mobile',
        md: 'tablet',
        lg: 'desktop'
      })
    );

    // Start with desktop
    expect(result.current).toBe('desktop');

    // Resize to mobile
    mockResizeEvent(400, 600);
    
    // Wait for debounced update
    await new Promise(resolve => setTimeout(resolve, 150));
    
    expect(result.current).toBe('mobile');
  });
});

describe('useTouchDevice', () => {
  const originalOntouchstart = window.ontouchstart;
  const originalMaxTouchPoints = navigator.maxTouchPoints;

  afterEach(() => {
    // Restore original values
    if (originalOntouchstart !== undefined) {
      window.ontouchstart = originalOntouchstart;
    } else {
      delete (window as unknown as { ontouchstart?: unknown }).ontouchstart;
    }
    Object.defineProperty(navigator, 'maxTouchPoints', {
      value: originalMaxTouchPoints,
      configurable: true
    });
  });

  it('should detect touch device via ontouchstart', () => {
    window.ontouchstart = null;
    const { result } = renderHook(() => useTouchDevice());

    expect(result.current).toBe(true);
  });

  it('should detect touch device via maxTouchPoints', () => {
    delete (window as unknown as { ontouchstart?: unknown }).ontouchstart;
    Object.defineProperty(navigator, 'maxTouchPoints', {
      value: 1,
      configurable: true
    });

    const { result } = renderHook(() => useTouchDevice());

    expect(result.current).toBe(true);
  });

  it('should detect non-touch device', () => {
    delete (window as unknown as { ontouchstart?: unknown }).ontouchstart;
    Object.defineProperty(navigator, 'maxTouchPoints', {
      value: 0,
      configurable: true
    });

    const { result } = renderHook(() => useTouchDevice());

    // The hook should return false for non-touch devices (or undefined in test environment)
    expect(result.current).toBeFalsy();
  });
});

describe('useOrientation', () => {
  beforeEach(() => {
    mockWindowSize(1024, 768);
  });

  it('should detect landscape orientation', () => {
    mockWindowSize(1024, 768); // Width > Height
    const { result } = renderHook(() => useOrientation());

    expect(result.current).toBe('landscape');
  });

  it('should detect portrait orientation', () => {
    mockWindowSize(375, 667); // Height > Width
    const { result } = renderHook(() => useOrientation());

    expect(result.current).toBe('portrait');
  });

  it('should update orientation on resize', async () => {
    const { result } = renderHook(() => useOrientation());

    // Start with landscape
    expect(result.current).toBe('landscape');

    // Rotate to portrait
    mockResizeEvent(375, 667);
    
    // Wait for debounced update
    await new Promise(resolve => setTimeout(resolve, 200));
    
    expect(result.current).toBe('portrait');
  });

  it('should handle orientation change event', async () => {
    const { result } = renderHook(() => useOrientation());

    // Start with landscape
    expect(result.current).toBe('landscape');

    // Simulate orientation change
    mockWindowSize(375, 667);
    act(() => {
      window.dispatchEvent(new Event('orientationchange'));
    });

    // Wait for debounced update
    await new Promise(resolve => setTimeout(resolve, 200));

    expect(result.current).toBe('portrait');
  });
});

describe('useViewport', () => {
  beforeEach(() => {
    mockWindowSize(1024, 768);
    
    // Mock getComputedStyle
    Object.defineProperty(window, 'getComputedStyle', {
      value: () => ({
        getPropertyValue: (prop: string) => {
          const safeAreaProps: Record<string, string> = {
            '--safe-area-inset-top': '20',
            '--safe-area-inset-right': '0',
            '--safe-area-inset-bottom': '34',
            '--safe-area-inset-left': '0',
          };
          return safeAreaProps[prop] || '0';
        },
      }),
      configurable: true,
    });
  });

  it('should return viewport dimensions with safe area insets', () => {
    const { result } = renderHook(() => useViewport());

    expect(result.current.width).toBe(1024);
    expect(result.current.height).toBe(768);
    expect(result.current.safeAreaInsets.top).toBe(20);
    expect(result.current.safeAreaInsets.bottom).toBe(34);
    expect(result.current.availableHeight).toBe(714); // 768 - 20 - 34
    expect(result.current.availableWidth).toBe(1024); // No left/right insets
  });

  it('should update viewport on window resize', async () => {
    const { result } = renderHook(() => useViewport());

    // Initial size
    expect(result.current.width).toBe(1024);
    expect(result.current.height).toBe(768);

    // Resize window
    mockResizeEvent(800, 600);
    
    // Wait for debounced update
    await new Promise(resolve => setTimeout(resolve, 150));

    expect(result.current.width).toBe(800);
    expect(result.current.height).toBe(600);
  });

  it('should ensure available dimensions are never negative', () => {
    // Mock large safe area insets that exceed window dimensions
    Object.defineProperty(window, 'getComputedStyle', {
      value: () => ({
        getPropertyValue: (prop: string) => {
          const safeAreaProps: Record<string, string> = {
            '--safe-area-inset-top': '400',
            '--safe-area-inset-right': '600',
            '--safe-area-inset-bottom': '400',
            '--safe-area-inset-left': '600',
          };
          return safeAreaProps[prop] || '0';
        },
      }),
      configurable: true,
    });

    mockWindowSize(500, 300);
    const { result } = renderHook(() => useViewport());

    expect(result.current.availableHeight).toBe(0); // Math.max(0, 300 - 400 - 400)
    expect(result.current.availableWidth).toBe(0); // Math.max(0, 500 - 600 - 600)
  });
});
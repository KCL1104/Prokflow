import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, type MockedFunction } from 'vitest';
import { ResponsiveLayout, ResponsiveContainer, ResponsiveGrid, ResponsiveStack } from '../ResponsiveLayout';
import { useResponsive, useViewport } from '../../../hooks/useResponsive';

// Mock the useResponsive hooks
vi.mock('../../../hooks/useResponsive');
const mockUseResponsive = useResponsive as MockedFunction<typeof useResponsive>;
const mockUseViewport = useViewport as MockedFunction<typeof useViewport>;

// Mock the MobileNavigation components
vi.mock('../MobileNavigation', () => ({
  MobileNavigation: ({ projectId }: { projectId?: string }) => (
    <div data-testid="mobile-navigation">Mobile Nav - {projectId}</div>
  ),
  MobileBottomNavigation: ({ projectId }: { projectId?: string }) => (
    <div data-testid="mobile-bottom-navigation">Bottom Nav - {projectId}</div>
  )
}));

describe('ResponsiveLayout', () => {
  const defaultMockReturn = {
    windowSize: { width: 1024, height: 768 },
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isSmallMobile: false,
    isLargeDesktop: false,
    isBreakpoint: vi.fn(),
    isBelow: vi.fn(),
    isAbove: vi.fn(),
    isBetween: vi.fn(),
    breakpoints: { sm: 640 as const, md: 768 as const, lg: 1024 as const, xl: 1280 as const, '2xl': 1536 as const }
  };

  beforeEach(() => {
    mockUseResponsive.mockReturnValue(defaultMockReturn);
    mockUseViewport.mockReturnValue({
      width: 1024,
      height: 768,
      availableHeight: 768,
      availableWidth: 1024,
      safeAreaInsets: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      },
    });
  });

  it('should render desktop layout by default', () => {
    render(
      <ResponsiveLayout>
        <div>Main Content</div>
      </ResponsiveLayout>
    );

    expect(screen.getByText('Main Content')).toBeInTheDocument();
    expect(screen.queryByTestId('mobile-navigation')).not.toBeInTheDocument();
    expect(screen.queryByTestId('mobile-bottom-navigation')).not.toBeInTheDocument();
  });

  it('should render mobile layout on mobile devices', () => {
    mockUseResponsive.mockReturnValue({
      ...defaultMockReturn,
      isMobile: true,
      isTablet: false,
      isDesktop: false
    });

    render(
      <ResponsiveLayout projectId="test-project">
        <div>Main Content</div>
      </ResponsiveLayout>
    );

    expect(screen.getByText('Main Content')).toBeInTheDocument();
    expect(screen.getByTestId('mobile-navigation')).toBeInTheDocument();
    expect(screen.getByTestId('mobile-bottom-navigation')).toBeInTheDocument();
  });

  it('should render tablet layout on tablet devices', () => {
    mockUseResponsive.mockReturnValue({
      ...defaultMockReturn,
      isMobile: false,
      isTablet: true,
      isDesktop: false
    });

    render(
      <ResponsiveLayout sidebar={<div>Sidebar</div>}>
        <div>Main Content</div>
      </ResponsiveLayout>
    );

    expect(screen.getByText('Main Content')).toBeInTheDocument();
    expect(screen.getByText('Sidebar')).toBeInTheDocument();
    expect(screen.queryByTestId('mobile-navigation')).not.toBeInTheDocument();
  });

  it('should render header when provided', () => {
    render(
      <ResponsiveLayout header={<div>Header Content</div>}>
        <div>Main Content</div>
      </ResponsiveLayout>
    );

    expect(screen.getByText('Header Content')).toBeInTheDocument();
    expect(screen.getByText('Main Content')).toBeInTheDocument();
  });

  it('should render sidebar when provided on desktop', () => {
    render(
      <ResponsiveLayout sidebar={<div>Sidebar Content</div>}>
        <div>Main Content</div>
      </ResponsiveLayout>
    );

    expect(screen.getByText('Sidebar Content')).toBeInTheDocument();
    expect(screen.getByText('Main Content')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <ResponsiveLayout className="custom-class">
        <div>Main Content</div>
      </ResponsiveLayout>
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });
});

describe('ResponsiveContainer', () => {
  const defaultMockReturn = {
    windowSize: { width: 1024, height: 768 },
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isSmallMobile: false,
    isLargeDesktop: false,
    isBreakpoint: vi.fn(),
    isBelow: vi.fn(),
    isAbove: vi.fn(),
    isBetween: vi.fn(),
    breakpoints: { sm: 640 as const, md: 768 as const, lg: 1024 as const, xl: 1280 as const, '2xl': 1536 as const }
  };

  beforeEach(() => {
    mockUseResponsive.mockReturnValue({
      ...defaultMockReturn,
      isMobile: false
    });
  });

  it('should render with default max width', () => {
    const { container } = render(
      <ResponsiveContainer>
        <div>Content</div>
      </ResponsiveContainer>
    );

    expect(container.firstChild).toHaveClass('max-w-xl');
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('should apply custom max width', () => {
    const { container } = render(
      <ResponsiveContainer maxWidth="lg">
        <div>Content</div>
      </ResponsiveContainer>
    );

    expect(container.firstChild).toHaveClass('max-w-lg');
  });

  it('should apply mobile padding on mobile devices', () => {
    mockUseResponsive.mockReturnValue({
      ...defaultMockReturn,
      isMobile: true
    });

    const { container } = render(
      <ResponsiveContainer>
        <div>Content</div>
      </ResponsiveContainer>
    );

    expect(container.firstChild).toHaveClass('px-4');
  });

  it('should apply desktop padding on desktop devices', () => {
    const { container } = render(
      <ResponsiveContainer>
        <div>Content</div>
      </ResponsiveContainer>
    );

    expect(container.firstChild).toHaveClass('px-6');
  });
});

describe('ResponsiveGrid', () => {
  it('should render with default grid columns', () => {
    const { container } = render(
      <ResponsiveGrid>
        <div>Item 1</div>
        <div>Item 2</div>
      </ResponsiveGrid>
    );

    expect(container.firstChild).toHaveClass('grid');
    expect(container.firstChild).toHaveClass('grid-cols-1');
    expect(container.firstChild).toHaveClass('md:grid-cols-2');
    expect(container.firstChild).toHaveClass('lg:grid-cols-3');
  });

  it('should render with custom grid columns', () => {
    const { container } = render(
      <ResponsiveGrid columns={{ base: 2, md: 4, lg: 6 }}>
        <div>Item 1</div>
        <div>Item 2</div>
      </ResponsiveGrid>
    );

    expect(container.firstChild).toHaveClass('grid-cols-2');
    expect(container.firstChild).toHaveClass('md:grid-cols-4');
    expect(container.firstChild).toHaveClass('lg:grid-cols-6');
  });

  it('should apply custom gap', () => {
    const { container } = render(
      <ResponsiveGrid gap={6}>
        <div>Item 1</div>
        <div>Item 2</div>
      </ResponsiveGrid>
    );

    expect(container.firstChild).toHaveClass('gap-6');
  });

  it('should render children', () => {
    render(
      <ResponsiveGrid>
        <div>Item 1</div>
        <div>Item 2</div>
      </ResponsiveGrid>
    );

    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });
});

describe('ResponsiveStack', () => {
  it('should render with default direction (column)', () => {
    const { container } = render(
      <ResponsiveStack>
        <div>Item 1</div>
        <div>Item 2</div>
      </ResponsiveStack>
    );

    expect(container.firstChild).toHaveClass('flex');
    expect(container.firstChild).toHaveClass('flex-col');
    expect(container.firstChild).toHaveClass('md:flex-row');
  });

  it('should render with custom direction', () => {
    const { container } = render(
      <ResponsiveStack direction={{ base: 'row', lg: 'column' }}>
        <div>Item 1</div>
        <div>Item 2</div>
      </ResponsiveStack>
    );

    expect(container.firstChild).toHaveClass('flex-row');
    expect(container.firstChild).toHaveClass('lg:flex-col');
  });

  it('should apply alignment classes', () => {
    const { container } = render(
      <ResponsiveStack align="center" justify="between">
        <div>Item 1</div>
        <div>Item 2</div>
      </ResponsiveStack>
    );

    expect(container.firstChild).toHaveClass('items-center');
    expect(container.firstChild).toHaveClass('justify-between');
  });

  it('should apply spacing classes', () => {
    const { container } = render(
      <ResponsiveStack spacing={6}>
        <div>Item 1</div>
        <div>Item 2</div>
      </ResponsiveStack>
    );

    expect(container.firstChild).toHaveClass('space-y-6');
  });

  it('should render children', () => {
    render(
      <ResponsiveStack>
        <div>Item 1</div>
        <div>Item 2</div>
      </ResponsiveStack>
    );

    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });
});
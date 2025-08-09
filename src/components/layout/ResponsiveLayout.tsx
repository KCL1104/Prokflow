import React from 'react';
import { useResponsive, useViewport } from '../../hooks/useResponsive';
import { MobileNavigation, MobileBottomNavigation } from './MobileNavigation';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  projectId?: string;
  sidebar?: React.ReactNode;
  header?: React.ReactNode;
  className?: string;
}

export function ResponsiveLayout({
  children,
  projectId,
  sidebar,
  header,
  className = ''
}: ResponsiveLayoutProps) {
  const { isMobile, isTablet } = useResponsive();
  const { availableHeight, safeAreaInsets } = useViewport();

  if (isMobile) {
    return (
      <div 
        className={`min-h-screen bg-gray-50 ${className}`}
        style={{
          paddingTop: safeAreaInsets.top,
          paddingBottom: safeAreaInsets.bottom,
          paddingLeft: safeAreaInsets.left,
          paddingRight: safeAreaInsets.right,
        }}
      >
        {/* Mobile Header */}
        <MobileNavigation projectId={projectId} />
        
        {/* Main Content */}
        <main 
          className="pb-20 px-4 py-4"
          style={{ minHeight: availableHeight - 120 }} // Account for header and bottom nav
        >
          {children}
        </main>
        
        {/* Mobile Bottom Navigation */}
        <MobileBottomNavigation projectId={projectId} />
      </div>
    );
  }

  if (isTablet) {
    return (
      <div className={`min-h-screen bg-gray-50 ${className}`}>
        {/* Tablet Header */}
        {header && (
          <header className="bg-white border-b border-gray-200 px-6 py-4">
            {header}
          </header>
        )}
        
        <div className="flex">
          {/* Collapsible Sidebar */}
          {sidebar && (
            <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
              <div className="p-4">
                {sidebar}
              </div>
            </aside>
          )}
          
          {/* Main Content */}
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
    );
  }

  // Desktop Layout
  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {/* Desktop Header */}
      {header && (
        <header className="bg-white border-b border-gray-200 px-8 py-4">
          {header}
        </header>
      )}
      
      <div className="flex">
        {/* Desktop Sidebar */}
        {sidebar && (
          <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
            <div className="p-6">
              {sidebar}
            </div>
          </aside>
        )}
        
        {/* Main Content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

interface ResponsiveContainerProps {
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  className?: string;
}

export function ResponsiveContainer({
  children,
  maxWidth = 'xl',
  className = ''
}: ResponsiveContainerProps) {
  const { isMobile } = useResponsive();

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-full'
  };

  return (
    <div className={`
      w-full mx-auto
      ${isMobile ? 'px-4' : 'px-6'}
      ${maxWidth !== 'full' ? maxWidthClasses[maxWidth] : ''}
      ${className}
    `}>
      {children}
    </div>
  );
}

interface ResponsiveGridProps {
  children: React.ReactNode;
  columns?: {
    base: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: number;
  className?: string;
}

export function ResponsiveGrid({
  children,
  columns = { base: 1, md: 2, lg: 3 },
  gap = 4,
  className = ''
}: ResponsiveGridProps) {
  const getGridClasses = () => {
    const classes = [`grid gap-${gap}`];
    
    // Base columns
    classes.push(`grid-cols-${columns.base}`);
    
    // Responsive columns
    if (columns.sm) classes.push(`sm:grid-cols-${columns.sm}`);
    if (columns.md) classes.push(`md:grid-cols-${columns.md}`);
    if (columns.lg) classes.push(`lg:grid-cols-${columns.lg}`);
    if (columns.xl) classes.push(`xl:grid-cols-${columns.xl}`);
    
    return classes.join(' ');
  };

  return (
    <div className={`${getGridClasses()} ${className}`}>
      {children}
    </div>
  );
}

interface ResponsiveStackProps {
  children: React.ReactNode;
  direction?: {
    base: 'row' | 'column';
    sm?: 'row' | 'column';
    md?: 'row' | 'column';
    lg?: 'row' | 'column';
  };
  spacing?: number;
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  className?: string;
}

export function ResponsiveStack({
  children,
  direction = { base: 'column', md: 'row' },
  spacing = 4,
  align = 'start',
  justify = 'start',
  className = ''
}: ResponsiveStackProps) {
  const getFlexClasses = () => {
    const classes = ['flex'];
    
    // Direction classes
    if (direction.base === 'row') {
      classes.push('flex-row');
    } else {
      classes.push('flex-col');
    }
    
    if (direction.sm) {
      classes.push(direction.sm === 'row' ? 'sm:flex-row' : 'sm:flex-col');
    }
    if (direction.md) {
      classes.push(direction.md === 'row' ? 'md:flex-row' : 'md:flex-col');
    }
    if (direction.lg) {
      classes.push(direction.lg === 'row' ? 'lg:flex-row' : 'lg:flex-col');
    }
    
    // Spacing
    if (direction.base === 'row') {
      classes.push(`space-x-${spacing}`);
    } else {
      classes.push(`space-y-${spacing}`);
    }
    
    // Alignment
    const alignClasses = {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      stretch: 'items-stretch'
    };
    classes.push(alignClasses[align]);
    
    // Justify
    const justifyClasses = {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
      around: 'justify-around',
      evenly: 'justify-evenly'
    };
    classes.push(justifyClasses[justify]);
    
    return classes.join(' ');
  };

  return (
    <div className={`${getFlexClasses()} ${className}`}>
      {children}
    </div>
  );
}
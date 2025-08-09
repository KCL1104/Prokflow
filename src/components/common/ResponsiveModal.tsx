import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from './Icon';
import { useResponsive, useViewport } from '../../hooks/useResponsive';

interface ResponsiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  closeOnBackdropClick?: boolean;
  className?: string;
}

export function ResponsiveModal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnBackdropClick = true,
  className = ''
}: ResponsiveModalProps) {
  const { isMobile, isTablet } = useResponsive();
  const { availableHeight, safeAreaInsets } = useViewport();

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll on mobile
      if (isMobile) {
        document.body.style.overflow = 'hidden';
      }
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      if (isMobile) {
        document.body.style.overflow = 'unset';
      }
    };
  }, [isOpen, onClose, isMobile]);

  if (!isOpen) return null;

  const getSizeClasses = () => {
    if (isMobile) {
      return 'w-full h-full max-w-none max-h-none rounded-none';
    }

    const sizeClasses = {
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-lg',
      xl: 'max-w-xl',
      full: 'max-w-full'
    };

    if (isTablet) {
      return `${sizeClasses[size]} max-h-[90vh] w-full mx-4`;
    }

    return `${sizeClasses[size]} max-h-[90vh]`;
  };

  const modalContent = (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        paddingTop: safeAreaInsets.top,
        paddingBottom: safeAreaInsets.bottom,
        paddingLeft: safeAreaInsets.left,
        paddingRight: safeAreaInsets.right,
      }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={closeOnBackdropClick ? onClose : undefined}
      />

      {/* Modal */}
      <div
        className={`
          relative bg-white shadow-xl overflow-hidden transition-all
          ${getSizeClasses()}
          ${isMobile ? '' : 'rounded-lg'}
          ${className}
        `}
        style={{
          maxHeight: isMobile ? availableHeight : '90vh'
        }}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className={`
            flex items-center justify-between border-b border-gray-200
            ${isMobile ? 'px-4 py-4' : 'px-6 py-4'}
          `}>
            {title && (
              <h2 className={`font-semibold text-gray-900 ${
                isMobile ? 'text-lg' : 'text-xl'
              }`}>
                {title}
              </h2>
            )}
            
            {showCloseButton && (
              <button
                onClick={onClose}
                className={`
                  text-gray-400 hover:text-gray-600 transition-colors
                  ${isMobile ? 'p-2' : 'p-1'}
                `}
              >
                <Icon name="x" size={isMobile ? 'lg' : 'md'} />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className={`
          overflow-y-auto flex-1
          ${isMobile ? 'px-4 py-4' : 'px-6 py-6'}
        `}>
          {children}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

interface ResponsiveDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  position?: 'left' | 'right' | 'bottom';
  size?: 'sm' | 'md' | 'lg';
  showCloseButton?: boolean;
  className?: string;
}

export function ResponsiveDrawer({
  isOpen,
  onClose,
  title,
  children,
  position = 'right',
  size = 'md',
  showCloseButton = true,
  className = ''
}: ResponsiveDrawerProps) {
  const { isMobile } = useResponsive();
  const { safeAreaInsets } = useViewport();

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getDrawerClasses = () => {
    const sizeClasses = {
      sm: '320px',
      md: '400px',
      lg: '500px'
    };

    if (isMobile) {
      if (position === 'bottom') {
        return 'inset-x-0 bottom-0 h-3/4 rounded-t-xl';
      }
      return 'inset-y-0 right-0 w-full';
    }

    switch (position) {
      case 'left':
        return `inset-y-0 left-0 w-[${sizeClasses[size]}]`;
      case 'right':
        return `inset-y-0 right-0 w-[${sizeClasses[size]}]`;
      case 'bottom':
        return `inset-x-0 bottom-0 h-3/4 rounded-t-xl`;
      default:
        return `inset-y-0 right-0 w-[${sizeClasses[size]}]`;
    }
  };

  const getTransformClasses = () => {
    if (!isOpen) {
      switch (position) {
        case 'left':
          return 'transform -translate-x-full';
        case 'right':
          return 'transform translate-x-full';
        case 'bottom':
          return 'transform translate-y-full';
        default:
          return 'transform translate-x-full';
      }
    }
    return 'transform translate-x-0 translate-y-0';
  };

  const drawerContent = (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`
          absolute bg-white shadow-xl transition-transform duration-300 ease-in-out
          ${getDrawerClasses()}
          ${getTransformClasses()}
          ${className}
        `}
        style={{
          paddingTop: position !== 'bottom' ? safeAreaInsets.top : 0,
          paddingBottom: position === 'bottom' ? safeAreaInsets.bottom : 0,
        }}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            {title && (
              <h2 className="text-lg font-semibold text-gray-900">
                {title}
              </h2>
            )}
            
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Icon name="x" size="md" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {children}
        </div>
      </div>
    </div>
  );

  return createPortal(drawerContent, document.body);
}

interface ResponsiveBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  snapPoints?: number[];
  initialSnap?: number;
  showCloseButton?: boolean;
  className?: string;
}

export function ResponsiveBottomSheet({
  isOpen,
  onClose,
  title,
  children,
  snapPoints = [0.5, 0.9],
  initialSnap = 0,
  showCloseButton = true,
  className = ''
}: ResponsiveBottomSheetProps) {
  const { isMobile } = useResponsive();
  const { availableHeight, safeAreaInsets } = useViewport();
  const [_currentSnap, _setCurrentSnap] = React.useState(initialSnap);

  // Only render on mobile
  if (!isMobile) {
    return (
      <ResponsiveModal
        isOpen={isOpen}
        onClose={onClose}
        title={title}
        showCloseButton={showCloseButton}
        className={className}
      >
        {children}
      </ResponsiveModal>
    );
  }

  const height = availableHeight * snapPoints[_currentSnap];

  const bottomSheetContent = (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Bottom Sheet */}
      <div
        className={`
          absolute bottom-0 left-0 right-0 bg-white rounded-t-xl shadow-xl
          transition-transform duration-300 ease-out
          ${isOpen ? 'transform translate-y-0' : 'transform translate-y-full'}
          ${className}
        `}
        style={{
          height: `${height}px`,
          paddingBottom: safeAreaInsets.bottom
        }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-8 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            {title && (
              <h2 className="text-lg font-semibold text-gray-900">
                {title}
              </h2>
            )}
            
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Icon name="x" size="md" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {children}
        </div>
      </div>
    </div>
  );

  return createPortal(bottomSheetContent, document.body);
}
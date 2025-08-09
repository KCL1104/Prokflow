import React, { useState, useEffect } from 'react';
import { WifiOff, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { useRealtimeCollaboration } from '../../hooks/useRealtimeCollaboration';
import { usePerformanceMonitoring } from '../../providers/PerformanceMonitoringProvider';

interface ConnectionStatusIndicatorProps {
  className?: string;
  showDetails?: boolean;
}

export const ConnectionStatusIndicator: React.FC<ConnectionStatusIndicatorProps> = ({ 
  className = '',
  showDetails = false 
}) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showTooltip, setShowTooltip] = useState(false);
  const [connectionQuality, setConnectionQuality] = useState<'excellent' | 'good' | 'poor' | 'offline'>('excellent');
  
  const { connected, connecting, error, reconnect } = useRealtimeCollaboration();
  const { getPerformanceMetrics } = usePerformanceMonitoring();

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Monitor connection quality
  useEffect(() => {
    const checkConnectionQuality = () => {
      if (!isOnline) {
        setConnectionQuality('offline');
        return;
      }

      // Check network connection if available
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        const effectiveType = connection.effectiveType;
        
        switch (effectiveType) {
          case '4g':
            setConnectionQuality('excellent');
            break;
          case '3g':
            setConnectionQuality('good');
            break;
          case '2g':
          case 'slow-2g':
            setConnectionQuality('poor');
            break;
          default:
            setConnectionQuality('good');
        }
      } else {
        // Fallback: check based on performance metrics
        const metrics = getPerformanceMetrics();
        if (metrics) {
          if (metrics.apiResponseTime < 200) {
            setConnectionQuality('excellent');
          } else if (metrics.apiResponseTime < 500) {
            setConnectionQuality('good');
          } else {
            setConnectionQuality('poor');
          }
        }
      }
    };

    checkConnectionQuality();
    const interval = setInterval(checkConnectionQuality, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [isOnline, getPerformanceMetrics]);

  const getStatusInfo = () => {
    if (!isOnline) {
      return {
        icon: WifiOff,
        color: 'text-red-500',
        bgColor: 'bg-red-100',
        status: 'Offline',
        description: 'No internet connection',
      };
    }

    if (error) {
      return {
        icon: AlertCircle,
        color: 'text-red-500',
        bgColor: 'bg-red-100',
        status: 'Connection Error',
        description: 'Real-time features unavailable',
      };
    }

    if (connecting) {
      return {
        icon: Clock,
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-100',
        status: 'Connecting',
        description: 'Establishing real-time connection',
      };
    }

    if (connected) {
      const qualityInfo = {
        excellent: {
          color: 'text-green-500',
          bgColor: 'bg-green-100',
          status: 'Excellent',
          description: 'All features available',
        },
        good: {
          color: 'text-green-500',
          bgColor: 'bg-green-100',
          status: 'Good',
          description: 'All features available',
        },
        poor: {
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-100',
          status: 'Poor Connection',
          description: 'Some features may be slow',
        },
        offline: {
          color: 'text-red-500',
          bgColor: 'bg-red-100',
          status: 'Offline',
          description: 'No internet connection',
        },
      };

      return {
        icon: CheckCircle,
        ...qualityInfo[connectionQuality],
      };
    }

    return {
      icon: WifiOff,
      color: 'text-gray-500',
      bgColor: 'bg-gray-100',
      status: 'Disconnected',
      description: 'Real-time features unavailable',
    };
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  const handleReconnect = () => {
    if (reconnect) {
      reconnect();
    }
  };

  if (showDetails) {
    return (
      <div className={`flex items-center space-x-3 p-3 rounded-lg border ${statusInfo.bgColor} ${className}`}>
        <StatusIcon className={`w-5 h-5 ${statusInfo.color}`} />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-900">{statusInfo.status}</span>
            {(error || !connected) && (
              <button
                onClick={handleReconnect}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                Retry
              </button>
            )}
          </div>
          <p className="text-xs text-gray-600">{statusInfo.description}</p>
          {isOnline && 'connection' in navigator && (
            <div className="text-xs text-gray-500 mt-1">
              Network: {(navigator as any).connection.effectiveType?.toUpperCase() || 'Unknown'}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`relative ${className}`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <button
        onClick={handleReconnect}
        className={`p-2 rounded-lg transition-colors ${statusInfo.bgColor} hover:opacity-80`}
        aria-label={`Connection status: ${statusInfo.status}`}
      >
        <StatusIcon className={`w-5 h-5 ${statusInfo.color}`} />
      </button>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50">
          <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap">
            <div className="font-medium">{statusInfo.status}</div>
            <div className="text-gray-300">{statusInfo.description}</div>
            {isOnline && 'connection' in navigator && (
              <div className="text-gray-400 mt-1">
                {(navigator as any).connection.effectiveType?.toUpperCase() || 'Unknown'} Network
              </div>
            )}
            {/* Tooltip arrow */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      )}

      {/* Connection quality indicator dots */}
      {isOnline && connected && (
        <div className="absolute -top-1 -right-1 flex space-x-0.5">
          <div className={`w-1.5 h-1.5 rounded-full ${
            connectionQuality === 'excellent' ? 'bg-green-500' : 'bg-gray-300'
          }`} />
          <div className={`w-1.5 h-1.5 rounded-full ${
            ['excellent', 'good'].includes(connectionQuality) ? 'bg-green-500' : 'bg-gray-300'
          }`} />
          <div className={`w-1.5 h-1.5 rounded-full ${
            connectionQuality === 'excellent' ? 'bg-green-500' : 'bg-gray-300'
          }`} />
        </div>
      )}
    </div>
  );
};

// Hook for connection status
export const useConnectionStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { connected, connecting, error } = useRealtimeCollaboration();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return {
    isOnline,
    isConnected: connected,
    isConnecting: connecting,
    hasError: !!error,
    isFullyConnected: isOnline && connected && !error,
  };
};
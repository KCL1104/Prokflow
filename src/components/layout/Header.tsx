import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../common/Button';

export const Header: React.FC = () => {
  const { user, signOut } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    if (isSigningOut) return;
    
    setIsSigningOut(true);
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
      // Could add toast notification here
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200" role="banner">
      <div className="px-6 py-4 flex items-center justify-between">
        {/* Search and actions could go here */}
        <div className="flex-1">
          {/* Placeholder for search or other header content */}
        </div>

        {/* User actions */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button 
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md"
            aria-label="View notifications"
            title="Notifications"
          >
            <span className="text-lg" aria-hidden="true">🔔</span>
          </button>

          {/* User menu */}
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-700 hidden sm:inline">
              {user?.email}
            </span>
            <Button
              variant="secondary"
              size="small"
              onClick={handleSignOut}
              loading={isSigningOut}
              disabled={isSigningOut}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
<<<<<<< HEAD
import { Button } from '../common/Button';
=======
import { Button } from '../ui/button';
import { Bell, Search, User } from 'lucide-react';
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)

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
<<<<<<< HEAD
    <header className="bg-white shadow-sm border-b border-gray-200" role="banner">
      <div className="px-6 py-4 flex items-center justify-between">
        {/* Search and actions could go here */}
        <div className="flex-1">
          {/* Placeholder for search or other header content */}
=======
    <header className="bg-white border-b border-gray-200 shadow-sm" role="banner">
      <div className="px-6 py-4 flex items-center justify-between">
        {/* Search bar */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search projects, tasks..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-md text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-150"
            />
          </div>
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
        </div>

        {/* User actions */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button 
<<<<<<< HEAD
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
=======
            className="relative p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-md"
            aria-label="View notifications"
            title="Notifications"
          >
            <Bell className="w-5 h-5" aria-hidden="true" />
            {/* Notification badge */}
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
          </button>

          {/* User menu */}
          <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary-500 rounded-md flex items-center justify-center text-white text-sm font-semibold">
                {user?.email?.[0]?.toUpperCase() || <User className="w-4 h-4" />}
              </div>
              <span className="text-sm font-medium text-gray-700 hidden sm:inline">
                {user?.email}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
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
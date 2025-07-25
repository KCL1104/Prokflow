import React from 'react';
import { NavLink, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface NavItem {
  name: string;
  href: string;
  icon: string;
  badge?: number;
  ariaLabel?: string;
}

interface SidebarProps {
  className?: string;
}

const getNavigation = (projectId?: string): NavItem[] => [
  { name: 'Dashboard', href: '/dashboard', icon: '📊' },
  { name: 'Projects', href: '/projects', icon: '📁' },
  ...(projectId ? [
    { name: 'Backlog', href: `/projects/${projectId}/backlog`, icon: '📋' },
    { name: 'Sprints', href: `/projects/${projectId}/sprints`, icon: '🏃' },
    { name: 'Board', href: `/projects/${projectId}/board`, icon: '📌' },
    { name: 'Gantt', href: `/projects/${projectId}/gantt`, icon: '📈' },
    { name: 'Reports', href: `/projects/${projectId}/reports`, icon: '📊' },
  ] : []),
  { name: 'Settings', href: '/settings', icon: '⚙️' },
];

const getNavLinkClasses = (isActive: boolean): string => {
  const baseClasses = 'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500';
  const activeClasses = 'bg-blue-50 text-blue-700 border-r-2 border-blue-700';
  const inactiveClasses = 'text-gray-600 hover:text-gray-900 hover:bg-gray-50';
  
  return `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`;
};

export const Sidebar: React.FC<SidebarProps> = ({ className = '' }) => {
  const location = useLocation();
  const { user } = useAuth();
  const { projectId } = useParams<{ projectId?: string }>();
  
  const navigation = getNavigation(projectId);

  return (
    <div className={`w-64 bg-white shadow-sm border-r border-gray-200 flex flex-col ${className}`}>
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">
          Project Manager
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1" role="navigation" aria-label="Main navigation">
        {navigation.map((item) => {
          const isActive = location.pathname.startsWith(item.href);
          
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive: linkActive }) => getNavLinkClasses(linkActive || isActive)}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className="mr-3 text-lg" aria-hidden="true">{item.icon}</span>
              {item.name}
              {item.badge && (
                <span 
                  className="ml-auto bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full"
                  aria-label={`${item.badge} notifications`}
                >
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User info */}
      {user && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
              {user.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.email}
              </p>
              <p className="text-xs text-gray-500">
                Online
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
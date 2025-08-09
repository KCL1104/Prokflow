import React from 'react';
import { NavLink, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
<<<<<<< HEAD
=======
import { 
  BarChart3, 
  FolderOpen, 
  ClipboardList, 
  Zap, 
  Kanban, 
  Calendar, 
  TrendingUp, 
  Settings,
  Circle
} from 'lucide-react';
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)

interface NavItem {
  name: string;
  href: string;
<<<<<<< HEAD
  icon: string;
=======
  icon: React.ComponentType<{ className?: string }>;
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
  badge?: number;
  ariaLabel?: string;
}

interface SidebarProps {
  className?: string;
}

const getNavigation = (projectId?: string): NavItem[] => [
<<<<<<< HEAD
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
=======
  { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
  { name: 'Projects', href: '/projects', icon: FolderOpen },
  ...(projectId ? [
    { name: 'Backlog', href: `/projects/${projectId}/backlog`, icon: ClipboardList },
    { name: 'Sprints', href: `/projects/${projectId}/sprints`, icon: Zap },
    { name: 'Board', href: `/projects/${projectId}/board`, icon: Kanban },
    { name: 'Gantt', href: `/projects/${projectId}/gantt`, icon: Calendar },
    { name: 'Reports', href: `/projects/${projectId}/reports`, icon: TrendingUp },
  ] : []),
  { name: 'Settings', href: '/settings', icon: Settings },
];



export const Sidebar: React.FC<SidebarProps> = () => {
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
  const location = useLocation();
  const { user } = useAuth();
  const { projectId } = useParams<{ projectId?: string }>();
  
  const navigation = getNavigation(projectId);

  return (
<<<<<<< HEAD
    <div className={`w-64 bg-white shadow-sm border-r border-gray-200 flex flex-col ${className}`}>
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">
          Project Manager
        </h1>
=======
    <aside className="w-64 bg-warm-25 text-gray-900 shadow-sm border-r-2 border-default flex flex-col transition-colors duration-200">
      {/* Logo Section */}
      <div className="p-6 bg-primary-500 border-b-2 border-default">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <Kanban className="h-5 w-5 text-primary-500" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white">KiroPro</h1>
            <p className="text-xs text-primary-100">Project Management</p>
          </div>
        </div>
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1" role="navigation" aria-label="Main navigation">
        {navigation.map((item) => {
          const isActive = location.pathname.startsWith(item.href);
          
          return (
            <NavLink
              key={item.name}
              to={item.href}
<<<<<<< HEAD
              className={({ isActive: linkActive }) => getNavLinkClasses(linkActive || isActive)}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className="mr-3 text-lg" aria-hidden="true">{item.icon}</span>
              {item.name}
              {item.badge && (
                <span 
                  className="ml-auto bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full"
=======
              className={({ isActive: linkActive }) => {
                const active = linkActive || isActive;
                return `group flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                  active
                    ? 'bg-warm-100 text-primary-600 border-r-2 border-primary-500 border border-light'
                    : 'text-gray-600 hover:text-gray-700 hover:bg-warm-50 border border-transparent hover:border-light'
                }`;
              }}
              aria-current={isActive ? 'page' : undefined}
            >
              <item.icon className={`mr-3 w-5 h-5 transition-colors duration-150 ${
                location.pathname.startsWith(item.href) ? 'text-primary-500' : 'text-gray-500'
              }`} aria-hidden="true" />
              {item.name}
              {item.badge && (
                <span 
                  className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full"
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
                  aria-label={`${item.badge} notifications`}
                >
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

<<<<<<< HEAD
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
=======
      {/* User Info */}
      {user && (
        <div className="mt-auto p-4 border-t-2 border-default">
          <div className="flex items-center space-x-3 p-3 rounded-md bg-warm-50 border-2 border-default">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 font-medium text-sm">
              {user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-700 truncate">
                {user?.email || 'User'}
              </p>
              <div className="flex items-center space-x-1 text-xs text-green-500">
                <Circle className="h-2 w-2 fill-current" />
                <span>Online</span>
              </div>
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
            </div>
          </div>
        </div>
      )}
<<<<<<< HEAD
    </div>
=======
    </aside>
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
  );
};
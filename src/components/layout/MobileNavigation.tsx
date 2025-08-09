import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Icon } from '../common/Icon';
import type { IconName } from '../common/Icon';
import { useAuth } from '../../hooks/useAuth';
import { useProject } from '../../hooks/useProject';
import { useResponsive } from '../../hooks/useResponsive';

interface MobileNavigationProps {
  projectId?: string;
  className?: string;
}

export function MobileNavigation({ projectId, className = '' }: MobileNavigationProps) {
  const { user, signOut } = useAuth();
  const { project } = useProject(projectId);
  const location = useLocation();
  const { isMobile } = useResponsive();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (!isMobile) {
    return null;
  }

  const navigationItems: Array<{
    name: string;
    href: string;
    icon: IconName;
    active: boolean;
  }> = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: 'home' as IconName,
      active: location.pathname === '/dashboard'
    },
    ...(projectId ? [
      {
        name: 'Backlog',
        href: `/projects/${projectId}/backlog`,
        icon: 'list' as IconName,
        active: location.pathname.includes('/backlog')
      },
      {
        name: 'Board',
        href: `/projects/${projectId}/board`,
        icon: 'layers' as IconName,
        active: location.pathname.includes('/board')
      },
      {
        name: 'Sprints',
        href: `/projects/${projectId}/sprints`,
        icon: 'target' as IconName,
        active: location.pathname.includes('/sprints')
      },
      {
        name: 'Reports',
        href: `/projects/${projectId}/reports`,
        icon: 'bar-chart' as IconName,
        active: location.pathname.includes('/reports')
      }
    ] : [])
  ];

  return (
    <>
      {/* Mobile Header */}
      <div className={`bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between ${className}`}>
        <div className="flex items-center">
          <button
            onClick={() => setIsMenuOpen(true)}
            className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            <Icon name="menu" size="lg" />
          </button>
          
          <div className="ml-3">
            <h1 className="text-lg font-semibold text-gray-900">
              {project?.name || 'Project Management'}
            </h1>
            {project && (
              <p className="text-sm text-gray-500 capitalize">
                {project.methodology} Project
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* User Avatar */}
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            {user?.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.full_name || user.email}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <Icon name="user" size="sm" className="text-gray-600" />
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsMenuOpen(false)}
          />
          
          {/* Slide-out Menu */}
          <div className="fixed inset-y-0 left-0 w-80 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out">
            <div className="flex flex-col h-full">
              {/* Menu Header */}
              <div className="px-4 py-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                      <Icon name="folder" size="md" className="text-white" />
                    </div>
                    <div className="ml-3">
                      <h2 className="text-lg font-semibold text-gray-900">
                        Project Manager
                      </h2>
                      <p className="text-sm text-gray-500">
                        {user?.full_name || user?.email}
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="p-2 rounded-md text-gray-400 hover:text-gray-600"
                  >
                    <Icon name="x" size="md" />
                  </button>
                </div>
              </div>

              {/* Navigation Items */}
              <nav className="flex-1 px-4 py-6 space-y-2">
                {navigationItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                      item.active
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon name={item.icon} size="md" className="mr-3" />
                    {item.name}
                  </Link>
                ))}

                {/* Project-specific items */}
                {projectId && (
                  <>
                    <div className="border-t border-gray-200 my-4" />
                    
                    <Link
                      to={`/projects/${projectId}/gantt`}
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                        location.pathname.includes('/gantt')
                          ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Icon name="calendar" size="md" className="mr-3" />
                      Timeline
                    </Link>
                    
                    <Link
                      to={`/projects/${projectId}/retrospectives`}
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                        location.pathname.includes('/retrospectives')
                          ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Icon name="refresh-cw" size="md" className="mr-3" />
                      Retrospectives
                    </Link>
                    
                    <Link
                      to={`/projects/${projectId}/settings`}
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                        location.pathname.includes('/settings')
                          ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Icon name="settings" size="md" className="mr-3" />
                      Settings
                    </Link>
                  </>
                )}
              </nav>

              {/* Menu Footer */}
              <div className="px-4 py-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    signOut();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center w-full px-3 py-3 text-sm font-medium text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Icon name="arrow-right" size="md" className="mr-3" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

interface MobileBottomNavigationProps {
  projectId?: string;
  className?: string;
}

export function MobileBottomNavigation({ projectId, className = '' }: MobileBottomNavigationProps) {
  const location = useLocation();
  const { isMobile } = useResponsive();

  if (!isMobile || !projectId) {
    return null;
  }

  const bottomNavItems: Array<{
    name: string;
    href: string;
    icon: IconName;
    active: boolean;
  }> = [
    {
      name: 'Backlog',
      href: `/projects/${projectId}/backlog`,
      icon: 'list' as IconName,
      active: location.pathname.includes('/backlog')
    },
    {
      name: 'Board',
      href: `/projects/${projectId}/board`,
      icon: 'layers' as IconName,
      active: location.pathname.includes('/board')
    },
    {
      name: 'Sprints',
      href: `/projects/${projectId}/sprints`,
      icon: 'target' as IconName,
      active: location.pathname.includes('/sprints')
    },
    {
      name: 'Reports',
      href: `/projects/${projectId}/reports`,
      icon: 'bar-chart' as IconName,
      active: location.pathname.includes('/reports')
    }
  ];

  return (
    <div className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-2 ${className}`}>
      <div className="flex items-center justify-around">
        {bottomNavItems.map((item) => (
          <Link
            key={item.name}
            to={item.href}
            className={`flex flex-col items-center px-3 py-2 rounded-lg transition-colors ${
              item.active
                ? 'text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon name={item.icon} size="md" />
            <span className="text-xs mt-1 font-medium">{item.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
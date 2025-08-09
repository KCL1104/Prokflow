import React, { useMemo } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const params = useParams();

  const breadcrumbs = useMemo((): BreadcrumbItem[] => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Home', href: '/dashboard' }
    ];

    // Build breadcrumbs based on current path
    let currentPath = '';
    
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      // Skip the last segment (current page)
      const isLast = index === pathSegments.length - 1;
      
      let label = segment.charAt(0).toUpperCase() + segment.slice(1);
      
      // Handle special cases
      switch (segment) {
        case 'projects':
          label = 'Projects';
          break;
        case 'backlog':
          label = 'Product Backlog';
          break;
        case 'board':
          label = 'Board View';
          break;
        case 'gantt':
          label = 'Gantt Chart';
          break;
        case 'reports':
          label = 'Reports';
          break;
        case 'settings':
          label = 'Settings';
          break;
        default:
          // Handle dynamic segments (IDs)
          if (segment.match(/^[a-f0-9-]{36}$/)) {
            // This looks like a UUID, try to get a meaningful name
            if (pathSegments[index - 1] === 'projects') {
              label = params.projectId ? 'Project Details' : 'Project';
            } else {
              label = 'Details';
            }
          }
      }

      breadcrumbs.push({
        label,
        href: isLast ? undefined : currentPath
      });
    });

    return breadcrumbs;
  }, [location.pathname, params]);

  // Don't show breadcrumbs on the dashboard
  if (location.pathname === '/dashboard' || location.pathname === '/') {
    return null;
  }

  return (
<<<<<<< HEAD
    <nav className="bg-gray-50 border-b border-gray-200 px-6 py-3" aria-label="Breadcrumb">
=======
    <nav className="bg-white border-b-2 border-gray-300 px-6 py-3" aria-label="Breadcrumb">
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
      <ol className="flex items-center space-x-2 text-sm">
        {breadcrumbs.map((crumb, index) => (
          <li key={`${crumb.href || crumb.label}-${index}`} className="flex items-center">
            {index > 0 && (
              <span className="mx-2 text-gray-400" aria-hidden="true">/</span>
            )}
            {crumb.href ? (
              <Link
                to={crumb.href}
                className="text-blue-600 hover:text-blue-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
              >
                {crumb.label}
              </Link>
            ) : (
              <span className="text-gray-900 font-medium" aria-current="page">
                {crumb.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};
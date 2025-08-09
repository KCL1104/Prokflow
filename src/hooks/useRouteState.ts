import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import { useCallback, useMemo } from 'react';

/**
 * Hook for managing URL search parameters as state
 */
export function useUrlState<T extends Record<string, string | undefined>>(
  defaultValues: T
): [T, (updates: Partial<T>) => void, (key: keyof T) => void] {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Get current state from URL
  const state = useMemo(() => {
    const result = { ...defaultValues };
    
    Object.keys(defaultValues).forEach((key) => {
      const value = searchParams.get(key);
      if (value !== null) {
<<<<<<< HEAD
        (result as any)[key] = value;
=======
        (result as Record<string, string>)[key] = value;
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
      }
    });
    
    return result;
  }, [searchParams, defaultValues]);

  // Update URL parameters
  const updateState = useCallback((updates: Partial<T>) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      
      Object.entries(updates).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') {
          newParams.delete(key);
        } else {
          newParams.set(key, String(value));
        }
      });
      
      return newParams;
    });
  }, [setSearchParams]);

  // Remove a specific parameter
  const removeParam = useCallback((key: keyof T) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.delete(String(key));
      return newParams;
    });
  }, [setSearchParams]);

  return [state, updateState, removeParam];
}

/**
 * Hook for getting current route information
 */
export function useRouteInfo() {
  const location = useLocation();
  const navigate = useNavigate();

  const routeInfo = useMemo(() => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    
    return {
      pathname: location.pathname,
      search: location.search,
      hash: location.hash,
      segments: pathSegments,
      isRoot: location.pathname === '/',
      isDashboard: location.pathname === '/dashboard',
      isProject: pathSegments[0] === 'projects',
      isBacklog: pathSegments[0] === 'backlog',
      isBoard: pathSegments[0] === 'board',
      isGantt: pathSegments[0] === 'gantt',
      isReports: pathSegments[0] === 'reports',
      isSettings: pathSegments[0] === 'settings',
    };
  }, [location]);

  const navigateWithState = useCallback((
    to: string, 
<<<<<<< HEAD
    options?: { replace?: boolean; state?: any }
=======
    options?: { replace?: boolean; state?: unknown }
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
  ) => {
    navigate(to, options);
  }, [navigate]);

  return {
    ...routeInfo,
    navigate: navigateWithState,
    goBack: () => navigate(-1),
    goForward: () => navigate(1),
  };
}

/**
 * Hook for managing filter state in URL
 */
export function useFilterState() {
  const [filters, updateFilters, removeFilter] = useUrlState({
    search: undefined,
    status: undefined,
    assignee: undefined,
    priority: undefined,
    type: undefined,
    sort: undefined,
    page: undefined,
  });

  const clearFilters = useCallback(() => {
    updateFilters({
      search: undefined,
      status: undefined,
      assignee: undefined,
      priority: undefined,
      type: undefined,
      sort: undefined,
      page: undefined,
    });
  }, [updateFilters]);

  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some(value => value !== undefined);
  }, [filters]);

  return {
    filters,
    updateFilters,
    removeFilter,
    clearFilters,
    hasActiveFilters,
  };
}
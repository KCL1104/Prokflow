import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { vi } from 'vitest';
import { ErrorBoundary } from '../../components/error';
import { ProtectedRoute } from '../../components/routing';
import { AppLayout } from '../../components/layout';
import { DashboardPage } from '../../pages/Dashboard';
import { NotFoundPage } from '../../pages/NotFoundPage';

// Mock the auth hook
vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { email: 'test@example.com' },
    loading: false,
    signOut: vi.fn(),
  }),
}));

// Mock Supabase
vi.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
    },
  },
}));

describe('AppRouter', () => {
  it('renders dashboard page when authenticated', () => {
    const router = createMemoryRouter([
      {
        path: '/',
        element: (
          <ErrorBoundary>
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          </ErrorBoundary>
        ),
        children: [
          { path: 'dashboard', element: <DashboardPage /> },
        ],
      },
    ], {
      initialEntries: ['/dashboard'],
    });

    render(<RouterProvider router={router} />);

    expect(screen.getByText(/Welcome back/)).toBeInTheDocument();
  });

  it('renders 404 page for unknown routes', () => {
    const router = createMemoryRouter([
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ], {
      initialEntries: ['/unknown-route'],
    });

    render(<RouterProvider router={router} />);

    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText('Page Not Found')).toBeInTheDocument();
  });
});
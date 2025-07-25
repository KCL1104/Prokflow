// Test setup file for Vitest
import { vi, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom';

// Mock environment variables
vi.mock('import.meta', () => ({
  env: {
    VITE_SUPABASE_URL: 'https://test.supabase.co',
    VITE_SUPABASE_ANON_KEY: 'test-key'
  }
}));

// Mock Supabase client globally
vi.mock('./lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
    rpc: vi.fn(),
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signInWithOAuth: vi.fn(),
      signOut: vi.fn(),
      resetPasswordForEmail: vi.fn(),
      updateUser: vi.fn(),
      getUser: vi.fn(),
      getSession: vi.fn(),
      onAuthStateChange: vi.fn()
    }
  },
  getCurrentUserId: vi.fn()
}));

// Global test utilities
const originalConsole = { ...console };
global.console = {
  ...console,
  // Suppress console.warn and console.error in tests unless needed
  warn: vi.fn(),
  error: vi.fn(),
  // Keep log for debugging if needed
  log: originalConsole.log
};

// Reset all mocks between tests
beforeEach(() => {
  vi.clearAllMocks();
});

// Cleanup after each test
afterEach(() => {
  vi.restoreAllMocks();
});
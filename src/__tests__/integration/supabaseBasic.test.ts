import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { supabase } from '../../lib/supabase';
import { AuthService } from '../../services/authService';
import { DatabaseService } from '../../services/databaseService';

// Test user credentials
const TEST_USER = {
  email: 'test@example.com',
  password: 'Abcd_123'
};

describe('Basic Supabase Integration', () => {
  let authService: AuthService;
  let databaseService: DatabaseService;
  let userId: string;

  beforeAll(async () => {
    authService = new AuthService();
    databaseService = new DatabaseService();
    
    // Clear any existing session
    await supabase.auth.signOut();
  });

  afterAll(async () => {
    // Sign out
    await supabase.auth.signOut();
  });

  describe('1. Supabase Connection', () => {
    it('should connect to Supabase successfully', async () => {
      const { data, error } = await supabase.from('users').select('count').limit(1);
      expect(error).toBeNull();
      expect(data).toBeDefined();
    });
  });

  describe('2. Authentication', () => {
    it('should authenticate with test user credentials', async () => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: TEST_USER.email,
        password: TEST_USER.password
      });

      expect(error).toBeNull();
      expect(data.user).toBeDefined();
      expect(data.user?.email).toBe(TEST_USER.email);
      expect(data.session).toBeDefined();
      
      userId = data.user!.id;
    });

    it('should get current user session', async () => {
      const { data: { session } } = await supabase.auth.getSession();
      expect(session).toBeDefined();
      expect(session?.user.email).toBe(TEST_USER.email);
    });

    it('should get user profile through AuthService', async () => {
      const profile = await authService.getCurrentUserProfile();
      expect(profile).toBeDefined();
      expect(profile?.email).toBe(TEST_USER.email);
    });
  });

  describe('3. Database Connection', () => {
    it('should test database connection', async () => {
      const isConnected = await databaseService.testConnection();
      expect(isConnected).toBe(true);
    });

    it('should fetch tables from database', async () => {
      const { data: projects, error } = await supabase
        .from('projects')
        .select('id, name')
        .limit(5);
      
      expect(error).toBeNull();
      expect(projects).toBeDefined();
      expect(Array.isArray(projects)).toBe(true);
    });

    it('should fetch users table', async () => {
      const { data: users, error } = await supabase
        .from('users')
        .select('id, email')
        .limit(5);
      
      expect(error).toBeNull();
      expect(users).toBeDefined();
      expect(Array.isArray(users)).toBe(true);
    });
  });

  describe('4. Basic CRUD Operations', () => {
    it('should be able to read from notifications table', async () => {
      const { data: notifications, error } = await supabase
        .from('notifications')
        .select('*')
        .limit(5);
      
      expect(error).toBeNull();
      expect(notifications).toBeDefined();
      expect(Array.isArray(notifications)).toBe(true);
    });

    it('should be able to read from work_items table', async () => {
      const { data: workItems, error } = await supabase
        .from('work_items')
        .select('*')
        .limit(5);
      
      expect(error).toBeNull();
      expect(workItems).toBeDefined();
      expect(Array.isArray(workItems)).toBe(true);
    });
  });

  describe('5. Error Handling', () => {
    it('should handle invalid authentication gracefully', async () => {
      await supabase.auth.signOut();
      
      const { error } = await supabase.auth.signInWithPassword({
        email: 'invalid@example.com',
        password: 'wrongpassword'
      });

      expect(error).toBeDefined();
      
      // Re-authenticate for remaining tests
      await supabase.auth.signInWithPassword({
        email: TEST_USER.email,
        password: TEST_USER.password
      });
    });
  });
});

// Generate a simple integration report
export async function generateBasicIntegrationReport(): Promise<string> {
  const report = {
    timestamp: new Date().toISOString(),
    supabaseConnection: false,
    authentication: false,
    databaseRead: false,
    errorHandling: false,
    overallStatus: 'UNKNOWN'
  };

  try {
    // Test basic connection
    const { error: connectionError } = await supabase.from('users').select('count').limit(1);
    report.supabaseConnection = !connectionError;

    // Test authentication
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: TEST_USER.email,
      password: TEST_USER.password
    });
    report.authentication = !authError;

    // Test database read
    const { error: dbError } = await supabase.from('projects').select('id').limit(1);
    report.databaseRead = !dbError;

    // Test error handling
    const { error: invalidAuthError } = await supabase.auth.signInWithPassword({
      email: 'invalid@test.com',
      password: 'wrong'
    });
    report.errorHandling = !!invalidAuthError; // Should have error for invalid creds

    // Determine overall status
    const allPassed = Object.values(report).slice(1, -1).every(Boolean);
    report.overallStatus = allPassed ? 'PASS' : 'FAIL';

  } catch (error) {
    console.error('Integration test error:', error);
    report.overallStatus = 'ERROR';
  }

  return `
=== BASIC SUPABASE INTEGRATION REPORT ===
Generated: ${report.timestamp}

✅ Supabase Connection: ${report.supabaseConnection ? 'PASS' : 'FAIL'}
✅ Authentication: ${report.authentication ? 'PASS' : 'FAIL'}
✅ Database Read Operations: ${report.databaseRead ? 'PASS' : 'FAIL'}
✅ Error Handling: ${report.errorHandling ? 'PASS' : 'FAIL'}

🎯 OVERALL STATUS: ${report.overallStatus}

${report.overallStatus === 'PASS' ? 
  '🎉 Basic Supabase integration is working! The application can connect, authenticate, and read from the database.' :
  '⚠️  Some basic integration tests failed. Please check the individual test results for details.'}
==========================================
  `;
}
/**
 * End-to-end tests for user authentication flows
 */
import { test, expect } from '@playwright/test';
import { TestHelpers } from '../utils/testHelpers';
import { testUsers, generateUniqueEmail } from '../fixtures/testData';

test.describe('User Authentication E2E Tests', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page: _page }) => {
    helpers = new TestHelpers(page);
  });

  test.afterEach(async ({ page: _page }) => {
    await helpers.cleanupTestData();
  });

  test.describe('User Registration', () => {
    test('should allow new user to register successfully', async ({ page }) => {
      const uniqueEmail = generateUniqueEmail();
      const password = 'testpassword123';
      const name = 'Test User';

      await helpers.signup(uniqueEmail, password, name);

      // Verify registration success message
      await expect(page.locator('text=Check your email for verification')).toBeVisible();
      
      // Verify user is redirected to email verification page
      expect(page.url()).toContain('/auth/verify-email');
    });

    test('should show validation errors for invalid registration data', async ({ page }) => {
      await page.goto('/auth/signup');

      // Try to submit with empty fields
      await page.click('[data-testid="signup-button"]');

      // Verify validation errors appear
      await expect(page.locator('text=Email is required')).toBeVisible();
      await expect(page.locator('text=Password is required')).toBeVisible();
      await expect(page.locator('text=Name is required')).toBeVisible();
    });

    test('should show error for invalid email format', async ({ page }) => {
      await page.goto('/auth/signup');

      await page.fill('[data-testid="email-input"]', 'invalid-email');
      await page.fill('[data-testid="password-input"]', 'password123');
      await page.fill('[data-testid="name-input"]', 'Test User');
      
      await page.click('[data-testid="signup-button"]');

      await expect(page.locator('text=Please enter a valid email address')).toBeVisible();
    });

    test('should show error for weak password', async ({ page }) => {
      await page.goto('/auth/signup');

      await page.fill('[data-testid="email-input"]', generateUniqueEmail());
      await page.fill('[data-testid="password-input"]', '123'); // Too short
      await page.fill('[data-testid="name-input"]', 'Test User');
      
      await page.click('[data-testid="signup-button"]');

      await expect(page.locator('text=Password must be at least 8 characters')).toBeVisible();
    });

    test('should prevent registration with existing email', async ({ page }) => {
      const existingEmail = testUsers.projectOwner.email;

      await page.goto('/auth/signup');

      await page.fill('[data-testid="email-input"]', existingEmail);
      await page.fill('[data-testid="password-input"]', 'password123');
      await page.fill('[data-testid="name-input"]', 'Test User');
      
      await page.click('[data-testid="signup-button"]');

      await helpers.expectErrorMessage('User already registered');
    });
  });

  test.describe('User Login', () => {
    test('should allow existing user to login successfully', async ({ page }) => {
      await helpers.login('projectOwner');

      // Verify successful login
      expect(page.url()).toContain('/dashboard');
      await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
      await expect(page.locator(`text=${testUsers.projectOwner.name}`)).toBeVisible();
    });

    test('should show error for invalid credentials', async ({ page }) => {
      await page.goto('/auth/login');

      await page.fill('[data-testid="email-input"]', testUsers.projectOwner.email);
      await page.fill('[data-testid="password-input"]', 'wrongpassword');
      await page.click('[data-testid="login-button"]');

      await helpers.expectErrorMessage('Invalid login credentials');
    });

    test('should show validation errors for empty fields', async ({ page }) => {
      await page.goto('/auth/login');

      await page.click('[data-testid="login-button"]');

      await expect(page.locator('text=Email is required')).toBeVisible();
      await expect(page.locator('text=Password is required')).toBeVisible();
    });

    test('should redirect to intended page after login', async ({ page }) => {
      // Try to access protected page without authentication
      await page.goto('/projects/create');

      // Should be redirected to login
      expect(page.url()).toContain('/auth/login');

      // Login
      await page.fill('[data-testid="email-input"]', testUsers.projectOwner.email);
      await page.fill('[data-testid="password-input"]', testUsers.projectOwner.password);
      await page.click('[data-testid="login-button"]');

      // Should be redirected to originally intended page
      await page.waitForURL('/projects/create');
      expect(page.url()).toContain('/projects/create');
    });

    test('should handle "Remember Me" functionality', async ({ page }) => {
      await page.goto('/auth/login');

      await page.fill('[data-testid="email-input"]', testUsers.projectOwner.email);
      await page.fill('[data-testid="password-input"]', testUsers.projectOwner.password);
      await page.check('[data-testid="remember-me-checkbox"]');
      await page.click('[data-testid="login-button"]');

      // Verify login success
      await page.waitForURL('/dashboard');

      // Close and reopen browser (simulate)
      await page.context().close();
      const newContext = await page.context().browser()?.newContext();
      const newPage = await newContext?.newPage();
      
      if (newPage) {
        await newPage.goto('/dashboard');
        // Should still be logged in
        await expect(newPage.locator('[data-testid="user-menu"]')).toBeVisible();
      }
    });
  });

  test.describe('Social Authentication', () => {
    test('should initiate Google OAuth flow', async ({ page }) => {
      await page.goto('/auth/login');

      // Mock the OAuth redirect
      await page.route('**/auth/v1/authorize**', route => {
        route.fulfill({
          status: 302,
          headers: {
            'Location': '/auth/callback?code=mock-auth-code'
          }
        });
      });

      await page.click('[data-testid="google-login-button"]');

      // Should redirect to OAuth provider (mocked)
      await page.waitForURL('**/auth/callback**');
    });

    test('should initiate GitHub OAuth flow', async ({ page }) => {
      await page.goto('/auth/login');

      await page.route('**/auth/v1/authorize**', route => {
        route.fulfill({
          status: 302,
          headers: {
            'Location': '/auth/callback?code=mock-auth-code'
          }
        });
      });

      await page.click('[data-testid="github-login-button"]');

      await page.waitForURL('**/auth/callback**');
    });

    test('should handle OAuth callback success', async ({ page }) => {
      // Mock successful OAuth callback
      await page.goto('/auth/callback?code=success-code');

      // Should redirect to dashboard after successful OAuth
      await page.waitForURL('/dashboard');
      await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
    });

    test('should handle OAuth callback error', async ({ page }) => {
      // Mock OAuth error
      await page.goto('/auth/callback?error=access_denied');

      // Should redirect to login with error message
      await page.waitForURL('/auth/login');
      await helpers.expectErrorMessage('Authentication was cancelled');
    });
  });

  test.describe('Password Reset', () => {
    test('should send password reset email', async ({ page }) => {
      await page.goto('/auth/forgot-password');

      await page.fill('[data-testid="email-input"]', testUsers.projectOwner.email);
      await page.click('[data-testid="send-reset-button"]');

      await helpers.expectSuccessMessage('Password reset email sent');
    });

    test('should show error for non-existent email', async ({ page }) => {
      await page.goto('/auth/forgot-password');

      await page.fill('[data-testid="email-input"]', 'nonexistent@example.com');
      await page.click('[data-testid="send-reset-button"]');

      await helpers.expectErrorMessage('No user found with this email address');
    });

    test('should reset password with valid token', async ({ page }) => {
      // Mock password reset page with valid token
      await page.goto('/auth/reset-password?token=valid-reset-token');

      await page.fill('[data-testid="new-password-input"]', 'newpassword123');
      await page.fill('[data-testid="confirm-password-input"]', 'newpassword123');
      await page.click('[data-testid="reset-password-button"]');

      await helpers.expectSuccessMessage('Password updated successfully');
      
      // Should redirect to login
      await page.waitForURL('/auth/login');
    });

    test('should show error for invalid reset token', async ({ page }) => {
      await page.goto('/auth/reset-password?token=invalid-token');

      await page.fill('[data-testid="new-password-input"]', 'newpassword123');
      await page.fill('[data-testid="confirm-password-input"]', 'newpassword123');
      await page.click('[data-testid="reset-password-button"]');

      await helpers.expectErrorMessage('Invalid or expired reset token');
    });

    test('should validate password confirmation match', async ({ page }) => {
      await page.goto('/auth/reset-password?token=valid-reset-token');

      await page.fill('[data-testid="new-password-input"]', 'newpassword123');
      await page.fill('[data-testid="confirm-password-input"]', 'differentpassword');
      await page.click('[data-testid="reset-password-button"]');

      await expect(page.locator('text=Passwords do not match')).toBeVisible();
    });
  });

  test.describe('User Logout', () => {
    test('should logout user successfully', async ({ page }) => {
      await helpers.login('projectOwner');

      // Verify user is logged in
      await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();

      await helpers.logout();

      // Verify user is logged out
      expect(page.url()).toContain('/auth/login');
      await expect(page.locator('[data-testid="user-menu"]')).not.toBeVisible();
    });

    test('should clear user session on logout', async ({ page }) => {
      await helpers.login('projectOwner');

      await helpers.logout();

      // Try to access protected page
      await page.goto('/dashboard');

      // Should be redirected to login
      await page.waitForURL('/auth/login');
    });

    test('should handle logout from multiple tabs', async ({ context }) => {
      // Login in first tab
      const page1 = await context.newPage();
      const helpers1 = new TestHelpers(page1);
      await helpers1.login('projectOwner');

      // Open second tab
      const page2 = await context.newPage();
      await page2.goto('/dashboard');
      await expect(page2.locator('[data-testid="user-menu"]')).toBeVisible();

      // Logout from first tab
      await helpers1.logout();

      // Second tab should also be logged out (if session sharing is implemented)
      await page2.reload();
      await page2.waitForURL('/auth/login');
    });
  });

  test.describe('Session Management', () => {
    test('should handle session expiration', async ({ page }) => {
      await helpers.login('projectOwner');

      // Mock session expiration
      await page.route('**/api/**', route => {
        route.fulfill({
          status: 401,
          body: JSON.stringify({ error: 'Session expired' })
        });
      });

      // Try to perform an action that requires authentication
      await page.goto('/projects/create');

      // Should be redirected to login
      await page.waitForURL('/auth/login');
      await helpers.expectErrorMessage('Your session has expired. Please log in again.');
    });

    test('should refresh session automatically', async ({ page }) => {
      await helpers.login('projectOwner');

      // Mock token refresh
      await page.route('**/auth/v1/token**', route => {
        route.fulfill({
          status: 200,
          body: JSON.stringify({
            access_token: 'new-access-token',
            refresh_token: 'new-refresh-token',
            expires_in: 3600
          })
        });
      });

      // Wait for automatic token refresh (this would happen in the background)
      await page.waitForTimeout(1000);

      // User should remain logged in
      await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
    });

    test('should handle concurrent login attempts', async ({ context }) => {
      const page1 = await context.newPage();
      const page2 = await context.newPage();
      
      const helpers1 = new TestHelpers(page1);
      const helpers2 = new TestHelpers(page2);

      // Attempt to login from both tabs simultaneously
      await Promise.all([
        helpers1.login('projectOwner'),
        helpers2.login('projectOwner')
      ]);

      // Both should be successfully logged in
      await expect(page1.locator('[data-testid="user-menu"]')).toBeVisible();
      await expect(page2.locator('[data-testid="user-menu"]')).toBeVisible();
    });
  });

  test.describe('Security Features', () => {
    test('should prevent XSS attacks in login form', async ({ page }) => {
      await page.goto('/auth/login');

      const xssPayload = '<script>alert("XSS")</script>';
      
      await page.fill('[data-testid="email-input"]', xssPayload);
      await page.fill('[data-testid="password-input"]', 'password');
      await page.click('[data-testid="login-button"]');

      // XSS payload should be escaped and not executed
      const emailValue = await page.inputValue('[data-testid="email-input"]');
      expect(emailValue).toBe(xssPayload);
      
      // No alert should appear
      page.on('dialog', _dialog => {
        throw new Error('XSS alert detected');
      });
    });

    test('should implement rate limiting for login attempts', async ({ page }) => {
      await page.goto('/auth/login');

      // Attempt multiple failed logins
      for (let i = 0; i < 6; i++) {
        await page.fill('[data-testid="email-input"]', testUsers.projectOwner.email);
        await page.fill('[data-testid="password-input"]', 'wrongpassword');
        await page.click('[data-testid="login-button"]');
        
        if (i < 5) {
          await helpers.expectErrorMessage('Invalid login credentials');
        }
      }

      // Should show rate limiting message after too many attempts
      await helpers.expectErrorMessage('Too many login attempts. Please try again later.');
    });

    test('should secure password visibility toggle', async ({ page }) => {
      await page.goto('/auth/login');

      const passwordInput = page.locator('[data-testid="password-input"]');
      const toggleButton = page.locator('[data-testid="password-toggle"]');

      await page.fill('[data-testid="password-input"]', 'testpassword');

      // Initially password should be hidden
      expect(await passwordInput.getAttribute('type')).toBe('password');

      // Click toggle to show password
      await toggleButton.click();
      expect(await passwordInput.getAttribute('type')).toBe('text');

      // Click toggle to hide password again
      await toggleButton.click();
      expect(await passwordInput.getAttribute('type')).toBe('password');
    });
  });

  test.describe('Accessibility', () => {
    test('should be keyboard navigable', async ({ page }) => {
      await page.goto('/auth/login');

      // Tab through form elements
      await page.keyboard.press('Tab'); // Email input
      await expect(page.locator('[data-testid="email-input"]')).toBeFocused();

      await page.keyboard.press('Tab'); // Password input
      await expect(page.locator('[data-testid="password-input"]')).toBeFocused();

      await page.keyboard.press('Tab'); // Remember me checkbox
      await expect(page.locator('[data-testid="remember-me-checkbox"]')).toBeFocused();

      await page.keyboard.press('Tab'); // Login button
      await expect(page.locator('[data-testid="login-button"]')).toBeFocused();

      // Should be able to submit with Enter
      await page.fill('[data-testid="email-input"]', testUsers.projectOwner.email);
      await page.fill('[data-testid="password-input"]', testUsers.projectOwner.password);
      await page.keyboard.press('Enter');

      await page.waitForURL('/dashboard');
    });

    test('should have proper ARIA labels and roles', async ({ page }) => {
      await page.goto('/auth/login');

      // Check form has proper role
      const form = page.locator('form');
      expect(await form.getAttribute('role')).toBe('form');

      // Check inputs have proper labels
      const emailInput = page.locator('[data-testid="email-input"]');
      const emailLabel = await emailInput.getAttribute('aria-label') || 
                         await page.locator('label[for="email"]').textContent();
      expect(emailLabel).toContain('Email');

      const passwordInput = page.locator('[data-testid="password-input"]');
      const passwordLabel = await passwordInput.getAttribute('aria-label') || 
                            await page.locator('label[for="password"]').textContent();
      expect(passwordLabel).toContain('Password');

      // Check button has proper role and label
      const loginButton = page.locator('[data-testid="login-button"]');
      expect(await loginButton.getAttribute('role')).toBe('button');
      expect(await loginButton.textContent()).toContain('Log In');
    });

    test('should announce errors to screen readers', async ({ page }) => {
      await page.goto('/auth/login');

      await page.click('[data-testid="login-button"]');

      // Error messages should have proper ARIA attributes
      const errorMessage = page.locator('[data-testid="error-message"]');
      expect(await errorMessage.getAttribute('role')).toBe('alert');
      expect(await errorMessage.getAttribute('aria-live')).toBe('polite');
    });
  });
});
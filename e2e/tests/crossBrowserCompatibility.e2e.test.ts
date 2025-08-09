/**
 * Cross-browser compatibility and responsive design tests
 */
import { test, expect, devices } from '@playwright/test';
import { TestHelpers } from '../utils/testHelpers';
import { testEnvironments, performanceBenchmarks } from '../fixtures/testData';

// Test across different browsers and devices
const browserConfigs = [
  { name: 'Desktop Chrome', ...devices['Desktop Chrome'] },
  { name: 'Desktop Firefox', ...devices['Desktop Firefox'] },
  { name: 'Desktop Safari', ...devices['Desktop Safari'] },
  { name: 'Mobile Chrome', ...devices['Pixel 5'] },
  { name: 'Mobile Safari', ...devices['iPhone 12'] },
  { name: 'Tablet', ...devices['iPad Pro'] },
];

browserConfigs.forEach(config => {
  test.describe(`Cross-Browser Tests - ${config.name}`, () => {
    test.use(config);

    let helpers: TestHelpers;

    test.beforeEach(async ({ page }) => {
      helpers = new TestHelpers(page);
    });

    test.afterEach(async ({ page: _page }) => {
      await helpers.cleanupTestData();
    });

    test('should render login page correctly', async ({ page }) => {
      await page.goto('/auth/login');

      // Basic layout elements should be visible
      await expect(page.locator('[data-testid="login-form"]')).toBeVisible();
      await expect(page.locator('[data-testid="email-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="password-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="login-button"]')).toBeVisible();

      // Check responsive design
      const viewport = page.viewportSize();
      if (viewport && viewport.width < 768) {
        // Mobile-specific checks
        await expect(page.locator('[data-testid="mobile-login-layout"]')).toBeVisible();
      } else {
        // Desktop-specific checks
        await expect(page.locator('[data-testid="desktop-login-layout"]')).toBeVisible();
      }

      await helpers.takeScreenshot(`login-${config.name.toLowerCase().replace(' ', '-')}`);
    });

    test('should handle authentication flow', async ({ page }) => {
      await helpers.login('projectOwner');

      // Verify successful login across all browsers
      expect(page.url()).toContain('/dashboard');
      await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();

      // Check dashboard layout
      await expect(page.locator('[data-testid="dashboard-content"]')).toBeVisible();
      
      const viewport = page.viewportSize();
      if (viewport && viewport.width < 768) {
        // Mobile dashboard should have hamburger menu
        await expect(page.locator('[data-testid="mobile-menu-button"]')).toBeVisible();
      } else {
        // Desktop should have sidebar
        await expect(page.locator('[data-testid="desktop-sidebar"]')).toBeVisible();
      }

      await helpers.takeScreenshot(`dashboard-${config.name.toLowerCase().replace(' ', '-')}`);
    });

    test('should handle project creation across browsers', async ({ page }) => {
      await helpers.login('projectOwner');
      
      const projectId = await helpers.createProject();
      
      // Verify project was created successfully
      await expect(page.locator('[data-testid="project-header"]')).toBeVisible();
      
      // Check project navigation works
      await helpers.navigateToBacklog(projectId);
      await expect(page.locator('[data-testid="product-backlog"]')).toBeVisible();

      await helpers.navigateToBoard(projectId);
      await expect(page.locator('[data-testid="kanban-board"]')).toBeVisible();

      await helpers.takeScreenshot(`project-${config.name.toLowerCase().replace(' ', '-')}`);
    });

    test('should handle drag and drop on different devices', async ({ page }) => {
      await helpers.login('projectOwner');
      const projectId = await helpers.createProject();
      
      // Create a work item
      await helpers.navigateToBacklog(projectId);
      await helpers.createWorkItem({
        title: 'Cross-browser drag test',
        description: 'Testing drag and drop across browsers',
        type: 'task',
        priority: 'medium',
      });

      await helpers.navigateToBoard(projectId);

      const viewport = page.viewportSize();
      if (viewport && viewport.width < 768) {
        // On mobile, drag and drop might be replaced with tap-to-move
        const workItemCard = page.locator('[data-testid="work-item-card"]').first();
        await workItemCard.click();
        
        // Should open mobile-friendly status change modal
        await expect(page.locator('[data-testid="mobile-status-modal"]')).toBeVisible();
        
        await page.selectOption('[data-testid="status-select"]', 'In Progress');
        await page.click('[data-testid="update-status-button"]');
        
        await helpers.verifyWorkItemInColumn('Cross-browser drag test', 'In Progress');
      } else {
        // Desktop drag and drop
        await helpers.dragWorkItemToColumn('Cross-browser drag test', 'In Progress');
        await helpers.verifyWorkItemInColumn('Cross-browser drag test', 'In Progress');
      }
    });

    test('should maintain performance standards', async ({ page: _page }) => {
      const loadTime = await helpers.measurePageLoadTime();
      
      await helpers.login('projectOwner');
      
      // Performance should meet benchmarks across all browsers
      expect(loadTime).toBeLessThan(performanceBenchmarks.pageLoadTime);

      // Test navigation performance
      const projectId = await helpers.createProject();
      
      const navigationTime = await helpers.measureRenderTime('[data-testid="project-header"]');
      expect(navigationTime).toBeLessThan(performanceBenchmarks.pageLoadTime);

      // Test board rendering performance
      await helpers.navigateToBoard(projectId);
      const boardRenderTime = await helpers.measureRenderTime('[data-testid="kanban-board"]');
      expect(boardRenderTime).toBeLessThan(performanceBenchmarks.chartRenderTime);
    });

    test('should handle form interactions correctly', async ({ page }) => {
      await helpers.login('projectOwner');
      const projectId = await helpers.createProject();
      await helpers.navigateToBacklog(projectId);

      // Test work item creation form
      await page.click('[data-testid="add-work-item-button"]');
      await expect(page.locator('[data-testid="work-item-modal"]')).toBeVisible();

      // Form should be properly sized for viewport
      const modal = page.locator('[data-testid="work-item-modal"]');
      const modalBox = await modal.boundingBox();
      const viewport = page.viewportSize();

      if (viewport && modalBox) {
        // Modal should not exceed viewport bounds
        expect(modalBox.width).toBeLessThanOrEqual(viewport.width);
        expect(modalBox.height).toBeLessThanOrEqual(viewport.height);
      }

      // Form inputs should be accessible
      await page.fill('[data-testid="work-item-title-input"]', 'Cross-browser form test');
      await page.fill('[data-testid="work-item-description-input"]', 'Testing form across browsers');
      
      // Dropdowns should work
      await page.selectOption('[data-testid="work-item-type-select"]', 'story');
      await page.selectOption('[data-testid="work-item-priority-select"]', 'high');

      await page.click('[data-testid="create-work-item-button"]');

      // Form should close and item should be created
      await expect(page.locator('[data-testid="work-item-modal"]')).not.toBeVisible();
      await helpers.verifyWorkItemInBacklog('Cross-browser form test');
    });

    test('should handle keyboard navigation', async ({ page }) => {
      await page.goto('/auth/login');

      // Tab navigation should work across browsers
      await page.keyboard.press('Tab');
      await expect(page.locator('[data-testid="email-input"]')).toBeFocused();

      await page.keyboard.press('Tab');
      await expect(page.locator('[data-testid="password-input"]')).toBeFocused();

      await page.keyboard.press('Tab');
      await expect(page.locator('[data-testid="login-button"]')).toBeFocused();

      // Enter key should submit form
      await page.fill('[data-testid="email-input"]', 'owner@test.com');
      await page.fill('[data-testid="password-input"]', 'testpassword123');
      await page.keyboard.press('Enter');

      await page.waitForURL('/dashboard');
    });

    test('should display charts and visualizations correctly', async ({ page }) => {
      await helpers.login('projectOwner');
      const projectId = await helpers.createProject();

      // Navigate to reports page
      await page.goto(`/projects/${projectId}/reports`);

      // Charts should render properly across browsers
      await expect(page.locator('[data-testid="burndown-chart"]')).toBeVisible();
      await expect(page.locator('[data-testid="velocity-chart"]')).toBeVisible();

      // Check chart responsiveness
      const viewport = page.viewportSize();
      if (viewport && viewport.width < 768) {
        // Mobile charts should be properly sized
        const chart = page.locator('[data-testid="burndown-chart"]');
        const chartBox = await chart.boundingBox();
        
        if (chartBox) {
          expect(chartBox.width).toBeLessThanOrEqual(viewport.width - 40); // Account for padding
        }
      }

      await helpers.takeScreenshot(`charts-${config.name.toLowerCase().replace(' ', '-')}`);
    });

    test('should handle touch interactions on mobile devices', async ({ page }) => {
      const viewport = page.viewportSize();
      
      // Only run touch tests on mobile devices
      if (viewport && viewport.width < 768) {
        await helpers.login('projectOwner');
        const projectId = await helpers.createProject();
        await helpers.navigateToBoard(projectId);

        // Create a work item for touch testing
        await helpers.navigateToBacklog(projectId);
        await helpers.createWorkItem({
          title: 'Touch test item',
          description: 'Testing touch interactions',
          type: 'task',
          priority: 'medium',
        });

        await helpers.navigateToBoard(projectId);

        // Test touch interactions
        const workItemCard = page.locator('[data-testid="work-item-card"]').first();
        
        // Long press should show context menu (if implemented)
        await workItemCard.click({ delay: 1000 });
        
        // Tap should open details
        await workItemCard.click();
        await expect(page.locator('[data-testid="work-item-details-modal"]')).toBeVisible();

        // Swipe gestures (if implemented)
        await page.touchscreen.tap(100, 100);
      }
    });

    test('should handle different screen orientations', async ({ page }) => {
      const viewport = page.viewportSize();
      
      // Only test orientation on mobile devices
      if (viewport && viewport.width < 768) {
        await helpers.login('projectOwner');
        
        // Test portrait orientation (default)
        await expect(page.locator('[data-testid="dashboard-content"]')).toBeVisible();
        await helpers.takeScreenshot(`portrait-${config.name.toLowerCase().replace(' ', '-')}`);

        // Rotate to landscape
        await page.setViewportSize({ width: viewport.height, height: viewport.width });
        
        // Layout should adapt to landscape
        await expect(page.locator('[data-testid="dashboard-content"]')).toBeVisible();
        await helpers.takeScreenshot(`landscape-${config.name.toLowerCase().replace(' ', '-')}`);

        // Rotate back to portrait
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await expect(page.locator('[data-testid="dashboard-content"]')).toBeVisible();
      }
    });

    test('should handle browser-specific features', async ({ page, browserName }) => {
      await helpers.login('projectOwner');

      // Test browser-specific functionality
      switch (browserName) {
        case 'chromium': {
          // Test Chrome-specific features like PWA installation
          await page.goto('/');
          
          // Check if PWA manifest is loaded
          const manifestLink = page.locator('link[rel="manifest"]');
          expect(await manifestLink.getAttribute('href')).toBeTruthy();
          break;
        }
        case 'firefox': {
          // Test Firefox-specific features
          await page.goto('/dashboard');
          
          // Firefox should handle CSS Grid properly
          const gridContainer = page.locator('[data-testid="dashboard-grid"]');
          const computedStyle = await gridContainer.evaluate(el => 
            window.getComputedStyle(el).display
          );
          expect(computedStyle).toBe('grid');
          break;
        }
        case 'webkit': {
          // Test Safari-specific features
          await page.goto('/dashboard');
          
          // Safari should handle flexbox properly
          const flexContainer = page.locator('[data-testid="dashboard-flex"]');
          const computedStyle = await flexContainer.evaluate(el => 
            window.getComputedStyle(el).display
          );
          expect(computedStyle).toBe('flex');
          break;
        }
      }
    });

    test('should maintain accessibility across browsers', async ({ page }) => {
      await page.goto('/auth/login');

      // Check basic accessibility features
      await helpers.checkAccessibility();

      // Test screen reader compatibility
      const emailInput = page.locator('[data-testid="email-input"]');
      const ariaLabel = await emailInput.getAttribute('aria-label');
      const labelText = await page.locator('label[for="email"]').textContent();
      
      expect(ariaLabel || labelText).toBeTruthy();

      // Test keyboard navigation
      await page.keyboard.press('Tab');
      await expect(emailInput).toBeFocused();

      // Test high contrast mode (if supported by browser)
      if (browserName === 'chromium') {
        await page.emulateMedia({ colorScheme: 'dark' });
        await expect(page.locator('[data-testid="login-form"]')).toBeVisible();
      }
    });
  });
});

// Additional responsive design tests
test.describe('Responsive Design Tests', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
  });

  Object.entries(testEnvironments).forEach(([deviceType, devices]) => {
    Object.entries(devices).forEach(([deviceName, dimensions]) => {
      test(`should render correctly on ${deviceType} - ${deviceName}`, async ({ page }) => {
        await page.setViewportSize(dimensions);
        
        await helpers.login('projectOwner');
        const projectId = await helpers.createProject();

        // Test different pages at this viewport size
        const pages = [
          { path: '/dashboard', testId: 'dashboard-content' },
          { path: `/projects/${projectId}`, testId: 'project-header' },
          { path: `/projects/${projectId}/backlog`, testId: 'product-backlog' },
          { path: `/projects/${projectId}/board`, testId: 'kanban-board' },
          { path: `/projects/${projectId}/reports`, testId: 'reports-dashboard' },
        ];

        for (const pageInfo of pages) {
          await page.goto(pageInfo.path);
          await expect(page.locator(`[data-testid="${pageInfo.testId}"]`)).toBeVisible();
          
          // Check that content doesn't overflow
          const content = page.locator(`[data-testid="${pageInfo.testId}"]`);
          const contentBox = await content.boundingBox();
          
          if (contentBox) {
            expect(contentBox.width).toBeLessThanOrEqual(dimensions.width);
          }

          await helpers.takeScreenshot(`${deviceType}-${deviceName}-${pageInfo.path.replace(/[/:]/g, '-')}`);
        }
      });
    });
  });

  test('should handle viewport size changes dynamically', async ({ page }) => {
    await helpers.login('projectOwner');
    
    // Start with desktop size
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.locator('[data-testid="desktop-sidebar"]')).toBeVisible();

    // Resize to tablet
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.waitForTimeout(500); // Allow for responsive changes
    
    // Layout should adapt
    await expect(page.locator('[data-testid="dashboard-content"]')).toBeVisible();

    // Resize to mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    
    // Mobile layout should be active
    await expect(page.locator('[data-testid="mobile-menu-button"]')).toBeVisible();

    // Resize back to desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(500);
    
    // Desktop layout should return
    await expect(page.locator('[data-testid="desktop-sidebar"]')).toBeVisible();
  });

  test('should handle print styles', async ({ page }) => {
    await helpers.login('projectOwner');
    const projectId = await helpers.createProject();
    
    await page.goto(`/projects/${projectId}/reports`);
    
    // Emulate print media
    await page.emulateMedia({ media: 'print' });
    
    // Print-specific elements should be visible
    await expect(page.locator('[data-testid="print-header"]')).toBeVisible();
    
    // Interactive elements should be hidden in print
    await expect(page.locator('[data-testid="interactive-controls"]')).not.toBeVisible();
    
    // Charts should be print-friendly
    const chart = page.locator('[data-testid="burndown-chart"]');
    const chartStyles = await chart.evaluate(el => window.getComputedStyle(el));
    
    // Should use print-friendly colors
    expect(chartStyles.backgroundColor).toBe('rgb(255, 255, 255)'); // White background for print
  });
});
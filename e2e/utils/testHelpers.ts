/**
 * Helper utilities for end-to-end tests
 */
import { Page, expect } from '@playwright/test';
import { testUsers, testProjects, testWorkItems } from '../fixtures/testData';

export class TestHelpers {
  constructor(private page: Page) {}

  // Authentication helpers
  async login(userType: keyof typeof testUsers = 'projectOwner') {
    const user = testUsers[userType];
    
    await this.page.goto('http://localhost:5173/login');
    await this.page.fill('[data-testid="email-input"]', user.email);
    await this.page.fill('[data-testid="password-input"]', user.password);
    await this.page.click('[data-testid="login-button"]');
    
    // Wait for successful login redirect
    await this.page.waitForURL('/dashboard');
    await expect(this.page.locator('[data-testid="user-menu"]')).toBeVisible();
  }

  async logout() {
    await this.page.click('[data-testid="user-menu"]');
    await this.page.click('[data-testid="logout-button"]');
    await this.page.waitForURL('/auth/login');
  }

  async signup(email: string, password: string, name: string) {
    await this.page.goto('/auth/signup');
    await this.page.fill('[data-testid="email-input"]', email);
    await this.page.fill('[data-testid="password-input"]', password);
    await this.page.fill('[data-testid="name-input"]', name);
    await this.page.click('[data-testid="signup-button"]');
    
    // Wait for email verification message or redirect
    await expect(
      this.page.locator('text=Check your email for verification')
    ).toBeVisible({ timeout: 10000 });
  }

  // Project management helpers
  async createProject(projectData = testProjects.scrumProject) {
    await this.page.goto('/projects/create');
    
    await this.page.fill('[data-testid="project-name-input"]', projectData.name);
    await this.page.fill('[data-testid="project-description-input"]', projectData.description);
    await this.page.selectOption('[data-testid="methodology-select"]', projectData.methodology);
    
    await this.page.click('[data-testid="create-project-button"]');
    
    // Wait for project creation and redirect
    await this.page.waitForURL(/\/projects\/[^/]+$/);
    await expect(this.page.locator(`text=${projectData.name}`)).toBeVisible();
    
    // Return project ID from URL
    const url = this.page.url();
    return url.split('/').pop();
  }

  async navigateToProject(projectId: string) {
    await this.page.goto(`/projects/${projectId}`);
    await this.page.waitForLoadState('networkidle');
  }

  async navigateToBacklog(projectId: string) {
    await this.page.goto(`/projects/${projectId}/backlog`);
    await this.page.waitForLoadState('networkidle');
    await expect(this.page.locator('text=Product Backlog')).toBeVisible();
  }

  async navigateToBoard(projectId: string) {
    await this.page.goto(`/projects/${projectId}/board`);
    await this.page.waitForLoadState('networkidle');
    await expect(this.page.locator('[data-testid="kanban-board"]')).toBeVisible();
  }

  async navigateToSprints(projectId: string) {
    await this.page.goto(`/projects/${projectId}/sprints`);
    await this.page.waitForLoadState('networkidle');
  }

  // Work item helpers
  async createWorkItem(workItemData = testWorkItems.userStory) {
    await this.page.click('[data-testid="add-work-item-button"]');
    
    // Wait for modal to open
    await expect(this.page.locator('[data-testid="work-item-modal"]')).toBeVisible();
    
    await this.page.fill('[data-testid="work-item-title-input"]', workItemData.title);
    await this.page.fill('[data-testid="work-item-description-input"]', workItemData.description);
    await this.page.selectOption('[data-testid="work-item-type-select"]', workItemData.type);
    await this.page.selectOption('[data-testid="work-item-priority-select"]', workItemData.priority);
    
    if (workItemData.estimate) {
      await this.page.fill('[data-testid="work-item-estimate-input"]', workItemData.estimate.toString());
    }
    
    await this.page.click('[data-testid="create-work-item-button"]');
    
    // Wait for modal to close and item to appear
    await expect(this.page.locator('[data-testid="work-item-modal"]')).not.toBeVisible();
    await expect(this.page.locator(`text=${workItemData.title}`)).toBeVisible();
  }

  async updateWorkItemStatus(workItemTitle: string, newStatus: string) {
    const workItemCard = this.page.locator(`[data-testid="work-item-card"]:has-text("${workItemTitle}")`);
    await workItemCard.click();
    
    // Wait for work item details modal
    await expect(this.page.locator('[data-testid="work-item-details-modal"]')).toBeVisible();
    
    await this.page.selectOption('[data-testid="work-item-status-select"]', newStatus);
    await this.page.click('[data-testid="save-work-item-button"]');
    
    // Wait for modal to close
    await expect(this.page.locator('[data-testid="work-item-details-modal"]')).not.toBeVisible();
  }

  async dragWorkItemToColumn(workItemTitle: string, targetColumn: string) {
    const workItem = this.page.locator(`[data-testid="work-item-card"]:has-text("${workItemTitle}")`);
    const targetColumnElement = this.page.locator(`[data-testid="board-column"]:has-text("${targetColumn}")`);
    
    await workItem.dragTo(targetColumnElement);
    
    // Wait for the drag operation to complete
    await this.page.waitForTimeout(500);
    
    // Verify the work item is now in the target column
    await expect(
      targetColumnElement.locator(`[data-testid="work-item-card"]:has-text("${workItemTitle}")`)
    ).toBeVisible();
  }

  // Sprint helpers
  async createSprint(sprintName: string, sprintGoal: string) {
    await this.page.click('[data-testid="create-sprint-button"]');
    
    await expect(this.page.locator('[data-testid="sprint-modal"]')).toBeVisible();
    
    await this.page.fill('[data-testid="sprint-name-input"]', sprintName);
    await this.page.fill('[data-testid="sprint-goal-input"]', sprintGoal);
    
    // Set sprint dates (2 weeks from today)
    const today = new Date();
    const startDate = today.toISOString().split('T')[0];
    const endDate = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    await this.page.fill('[data-testid="sprint-start-date-input"]', startDate);
    await this.page.fill('[data-testid="sprint-end-date-input"]', endDate);
    
    await this.page.click('[data-testid="create-sprint-button"]');
    
    // Wait for modal to close and sprint to appear
    await expect(this.page.locator('[data-testid="sprint-modal"]')).not.toBeVisible();
    await expect(this.page.locator(`text=${sprintName}`)).toBeVisible();
  }

  async addWorkItemsToSprint(sprintName: string, workItemTitles: string[]) {
    const sprintCard = this.page.locator(`[data-testid="sprint-card"]:has-text("${sprintName}")`);
    await sprintCard.click();
    
    await expect(this.page.locator('[data-testid="sprint-planning-modal"]')).toBeVisible();
    
    for (const title of workItemTitles) {
      const workItemCheckbox = this.page.locator(
        `[data-testid="backlog-item"]:has-text("${title}") [data-testid="select-checkbox"]`
      );
      await workItemCheckbox.check();
    }
    
    await this.page.click('[data-testid="add-to-sprint-button"]');
    await expect(this.page.locator('[data-testid="sprint-planning-modal"]')).not.toBeVisible();
  }

  // Collaboration helpers
  async addComment(content: string) {
    await this.page.fill('[data-testid="comment-input"]', content);
    await this.page.click('[data-testid="add-comment-button"]');
    
    // Wait for comment to appear
    await expect(this.page.locator(`text=${content}`)).toBeVisible();
  }

  async participateInStandup(yesterday: string, today: string, blockers: string) {
    await this.page.click('[data-testid="join-standup-button"]');
    
    await expect(this.page.locator('[data-testid="standup-modal"]')).toBeVisible();
    
    await this.page.fill('[data-testid="yesterday-input"]', yesterday);
    await this.page.fill('[data-testid="today-input"]', today);
    await this.page.fill('[data-testid="blockers-input"]', blockers);
    
    await this.page.click('[data-testid="submit-standup-button"]');
    await expect(this.page.locator('[data-testid="standup-modal"]')).not.toBeVisible();
  }

  // Utility helpers
  async waitForLoadingToComplete() {
    await this.page.waitForLoadState('networkidle');
    await expect(this.page.locator('[data-testid="loading-spinner"]')).not.toBeVisible();
  }

  async takeScreenshot(name: string) {
    await this.page.screenshot({ path: `e2e/screenshots/${name}.png`, fullPage: true });
  }

  async measurePageLoadTime(): Promise<number> {
    const startTime = Date.now();
    await this.page.waitForLoadState('networkidle');
    return Date.now() - startTime;
  }

  async checkAccessibility() {
    // Basic accessibility checks
    const headings = await this.page.locator('h1, h2, h3, h4, h5, h6').count();
    expect(headings).toBeGreaterThan(0);
    
    // Check for alt text on images
    const images = this.page.locator('img');
    const imageCount = await images.count();
    
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      expect(alt).toBeTruthy();
    }
    
    // Check for form labels
    const inputs = this.page.locator('input[type="text"], input[type="email"], input[type="password"], textarea');
    const inputCount = await inputs.count();
    
    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i);
      const id = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const ariaLabelledBy = await input.getAttribute('aria-labelledby');
      
      if (id) {
        const label = this.page.locator(`label[for="${id}"]`);
        const labelExists = await label.count() > 0;
        expect(labelExists || ariaLabel || ariaLabelledBy).toBeTruthy();
      }
    }
  }

  async simulateSlowNetwork() {
    await this.page.route('**/*', route => {
      setTimeout(() => route.continue(), 1000); // Add 1 second delay
    });
  }

  async simulateOfflineMode() {
    await this.page.context().setOffline(true);
  }

  async restoreOnlineMode() {
    await this.page.context().setOffline(false);
  }

  // Performance testing helpers
  async measureRenderTime(selector: string): Promise<number> {
    const startTime = Date.now();
    await expect(this.page.locator(selector)).toBeVisible();
    return Date.now() - startTime;
  }

  async measureApiResponseTime(apiCall: () => Promise<void>): Promise<number> {
    const startTime = Date.now();
    await apiCall();
    return Date.now() - startTime;
  }

  // Error handling helpers
  async expectErrorMessage(message: string) {
    await expect(this.page.locator(`[data-testid="error-message"]:has-text("${message}")`)).toBeVisible();
  }

  async expectSuccessMessage(message: string) {
    await expect(this.page.locator(`[data-testid="success-message"]:has-text("${message}")`)).toBeVisible();
  }

  async dismissNotification() {
    const notification = this.page.locator('[data-testid="notification"]');
    if (await notification.isVisible()) {
      await this.page.click('[data-testid="dismiss-notification"]');
      await expect(notification).not.toBeVisible();
    }
  }

  // Data validation helpers
  async verifyWorkItemInBacklog(title: string) {
    await expect(
      this.page.locator(`[data-testid="backlog-item"]:has-text("${title}")`)
    ).toBeVisible();
  }

  async verifyWorkItemInColumn(title: string, columnName: string) {
    const column = this.page.locator(`[data-testid="board-column"]:has-text("${columnName}")`);
    await expect(
      column.locator(`[data-testid="work-item-card"]:has-text("${title}")`)
    ).toBeVisible();
  }

  async verifySprintExists(sprintName: string) {
    await expect(
      this.page.locator(`[data-testid="sprint-card"]:has-text("${sprintName}")`)
    ).toBeVisible();
  }

  async verifyProjectExists(projectName: string) {
    await expect(
      this.page.locator(`[data-testid="project-card"]:has-text("${projectName}")`)
    ).toBeVisible();
  }

  // Cleanup helpers
  async cleanupTestData() {
    // This would typically involve API calls to clean up test data
    // For now, we'll just clear local storage
    await this.page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  }
}
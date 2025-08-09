/**
 * End-to-end tests for complete project management workflows
 */
import { test, expect } from '@playwright/test';
import { TestHelpers } from '../utils/testHelpers';
import { testWorkItems, generateProjectName, generateWorkItemTitle } from '../fixtures/testData';

test.describe('Project Management E2E Tests', () => {
  let helpers: TestHelpers;
  let projectId: string;

  test.beforeEach(async ({ page: _page }) => {
    helpers = new TestHelpers(page);
    await helpers.login('projectOwner');
  });

  test.afterEach(async () => {
    await helpers.cleanupTestData();
  });

  test.describe('Complete Project Lifecycle', () => {
    test('should handle full project creation to completion workflow', async ({ page }) => {
      // 1. Create a new project
      projectId = await helpers.createProject({
        name: generateProjectName(),
        description: 'E2E test project for complete workflow',
        methodology: 'scrum',
      });

      await helpers.takeScreenshot('project-created');

      // 2. Navigate to backlog and create work items
      await helpers.navigateToBacklog(projectId);

      // Create multiple work items
      const workItems = [
        { ...testWorkItems.userStory, title: generateWorkItemTitle() },
        { ...testWorkItems.task, title: generateWorkItemTitle() },
        { ...testWorkItems.bug, title: generateWorkItemTitle() },
      ];

      for (const workItem of workItems) {
        await helpers.createWorkItem(workItem);
        await helpers.verifyWorkItemInBacklog(workItem.title);
      }

      await helpers.takeScreenshot('backlog-with-items');

      // 3. Create and plan a sprint
      await helpers.navigateToSprints(projectId);
      
      const sprintName = `E2E Sprint ${Date.now()}`;
      await helpers.createSprint(sprintName, 'Complete initial features');
      
      // Add work items to sprint
      await helpers.addWorkItemsToSprint(sprintName, workItems.map(item => item.title));
      
      await helpers.verifySprintExists(sprintName);
      await helpers.takeScreenshot('sprint-planned');

      // 4. Work with items on the board
      await helpers.navigateToBoard(projectId);

      // Move work items through different statuses
      await helpers.dragWorkItemToColumn(workItems[0].title, 'In Progress');
      await helpers.verifyWorkItemInColumn(workItems[0].title, 'In Progress');

      await helpers.dragWorkItemToColumn(workItems[1].title, 'Done');
      await helpers.verifyWorkItemInColumn(workItems[1].title, 'Done');

      await helpers.takeScreenshot('board-with-progress');

      // 5. Add comments to work items
      const workItemCard = page.locator(`[data-testid="work-item-card"]:has-text("${workItems[0].title}")`);
      await workItemCard.click();

      await expect(page.locator('[data-testid="work-item-details-modal"]')).toBeVisible();
      await helpers.addComment('Great progress on this feature!');
      
      await page.click('[data-testid="close-modal-button"]');

      // 6. Verify project dashboard shows progress
      await helpers.navigateToProject(projectId);
      
      // Check that dashboard shows project metrics
      await expect(page.locator('[data-testid="project-progress"]')).toBeVisible();
      await expect(page.locator('[data-testid="sprint-burndown"]')).toBeVisible();
      
      await helpers.takeScreenshot('project-dashboard');
    });

    test('should handle project settings and team management', async ({ page }) => {
      projectId = await helpers.createProject();

      // Navigate to project settings
      await page.goto(`/projects/${projectId}/settings`);
      await expect(page.locator('text=Project Settings')).toBeVisible();

      // Update project settings
      await page.fill('[data-testid="project-name-input"]', 'Updated Project Name');
      await page.selectOption('[data-testid="methodology-select"]', 'kanban');
      await page.click('[data-testid="save-settings-button"]');

      await helpers.expectSuccessMessage('Project settings updated');

      // Invite team member
      await page.click('[data-testid="invite-member-button"]');
      await page.fill('[data-testid="member-email-input"]', 'newmember@test.com');
      await page.selectOption('[data-testid="member-role-select"]', 'member');
      await page.click('[data-testid="send-invitation-button"]');

      await helpers.expectSuccessMessage('Invitation sent');

      // Verify team member appears in list
      await expect(page.locator('text=newmember@test.com')).toBeVisible();
    });

    test('should handle project archival and deletion', async ({ page }) => {
      projectId = await helpers.createProject();

      // Navigate to project settings
      await page.goto(`/projects/${projectId}/settings`);

      // Archive project
      await page.click('[data-testid="archive-project-button"]');
      await page.click('[data-testid="confirm-archive-button"]');

      await helpers.expectSuccessMessage('Project archived');

      // Verify project is marked as archived
      await expect(page.locator('[data-testid="archived-badge"]')).toBeVisible();

      // Unarchive project
      await page.click('[data-testid="unarchive-project-button"]');
      await page.click('[data-testid="confirm-unarchive-button"]');

      await helpers.expectSuccessMessage('Project unarchived');

      // Delete project (dangerous action)
      await page.click('[data-testid="delete-project-button"]');
      await page.fill('[data-testid="confirm-delete-input"]', 'DELETE');
      await page.click('[data-testid="confirm-delete-button"]');

      // Should redirect to projects list
      await page.waitForURL('/projects');
      await helpers.expectSuccessMessage('Project deleted');
    });
  });

  test.describe('Work Item Management', () => {
    test.beforeEach(async () => {
      projectId = await helpers.createProject();
      await helpers.navigateToBacklog(projectId);
    });

    test('should handle work item CRUD operations', async ({ page }) => {
      const workItemTitle = generateWorkItemTitle();

      // Create work item
      await helpers.createWorkItem({
        ...testWorkItems.userStory,
        title: workItemTitle,
      });

      await helpers.verifyWorkItemInBacklog(workItemTitle);

      // Edit work item
      const workItemCard = page.locator(`[data-testid="backlog-item"]:has-text("${workItemTitle}")`);
      await workItemCard.click();

      await expect(page.locator('[data-testid="work-item-details-modal"]')).toBeVisible();

      const updatedTitle = `${workItemTitle} (Updated)`;
      await page.fill('[data-testid="work-item-title-input"]', updatedTitle);
      await page.selectOption('[data-testid="work-item-priority-select"]', 'critical');
      await page.click('[data-testid="save-work-item-button"]');

      await expect(page.locator('[data-testid="work-item-details-modal"]')).not.toBeVisible();
      await helpers.verifyWorkItemInBacklog(updatedTitle);

      // Delete work item
      await workItemCard.click();
      await page.click('[data-testid="delete-work-item-button"]');
      await page.click('[data-testid="confirm-delete-button"]');

      await expect(page.locator(`text=${updatedTitle}`)).not.toBeVisible();
    });

    test('should handle work item dependencies', async ({ page }) => {
      // Create two work items
      const parentItem = generateWorkItemTitle();
      const dependentItem = generateWorkItemTitle();

      await helpers.createWorkItem({ ...testWorkItems.userStory, title: parentItem });
      await helpers.createWorkItem({ ...testWorkItems.task, title: dependentItem });

      // Add dependency
      const dependentCard = page.locator(`[data-testid="backlog-item"]:has-text("${dependentItem}")`);
      await dependentCard.click();

      await page.click('[data-testid="add-dependency-button"]');
      await page.selectOption('[data-testid="dependency-select"]', parentItem);
      await page.click('[data-testid="save-dependency-button"]');

      // Verify dependency is shown
      await expect(page.locator(`[data-testid="dependency-item"]:has-text("${parentItem}")`)).toBeVisible();

      await page.click('[data-testid="save-work-item-button"]');

      // Verify dependency indicator in backlog
      await expect(
        page.locator(`[data-testid="backlog-item"]:has-text("${dependentItem}") [data-testid="dependency-indicator"]`)
      ).toBeVisible();
    });

    test('should handle bulk operations on work items', async ({ page }) => {
      // Create multiple work items
      const workItems = [
        generateWorkItemTitle(),
        generateWorkItemTitle(),
        generateWorkItemTitle(),
      ];

      for (const title of workItems) {
        await helpers.createWorkItem({ ...testWorkItems.task, title });
      }

      // Select all work items
      await page.click('[data-testid="select-all-checkbox"]');

      // Verify bulk actions are available
      await expect(page.locator('[data-testid="bulk-actions-bar"]')).toBeVisible();

      // Bulk update priority
      await page.click('[data-testid="bulk-edit-button"]');
      await page.selectOption('[data-testid="bulk-priority-select"]', 'high');
      await page.click('[data-testid="apply-bulk-changes-button"]');

      await helpers.expectSuccessMessage('Bulk update completed');

      // Verify all items have updated priority
      for (const title of workItems) {
        const item = page.locator(`[data-testid="backlog-item"]:has-text("${title}")`);
        await expect(item.locator('[data-testid="priority-badge"]:has-text("High")')).toBeVisible();
      }
    });

    test('should handle work item estimation', async ({ page }) => {
      const workItemTitle = generateWorkItemTitle();
      await helpers.createWorkItem({ ...testWorkItems.userStory, title: workItemTitle });

      // Open estimation modal
      const estimateButton = page.locator(
        `[data-testid="backlog-item"]:has-text("${workItemTitle}") [data-testid="estimate-button"]`
      );
      await estimateButton.click();

      await expect(page.locator('[data-testid="estimation-modal"]')).toBeVisible();

      // Select story points
      await page.click('[data-testid="story-points-8"]');
      await page.click('[data-testid="save-estimate-button"]');

      // Verify estimate is saved
      await expect(
        page.locator(`[data-testid="backlog-item"]:has-text("${workItemTitle}") [data-testid="estimate-badge"]:has-text("8")`)
      ).toBeVisible();
    });
  });

  test.describe('Sprint Management', () => {
    test.beforeEach(async () => {
      projectId = await helpers.createProject();
    });

    test('should handle complete sprint lifecycle', async ({ page }) => {
      // Create work items first
      await helpers.navigateToBacklog(projectId);
      
      const workItems = [
        generateWorkItemTitle(),
        generateWorkItemTitle(),
        generateWorkItemTitle(),
      ];

      for (const title of workItems) {
        await helpers.createWorkItem({ ...testWorkItems.userStory, title, estimate: 5 });
      }

      // Create and plan sprint
      await helpers.navigateToSprints(projectId);
      
      const sprintName = `E2E Sprint ${Date.now()}`;
      await helpers.createSprint(sprintName, 'Complete user stories');

      // Add work items to sprint
      await helpers.addWorkItemsToSprint(sprintName, workItems);

      // Start sprint
      const sprintCard = page.locator(`[data-testid="sprint-card"]:has-text("${sprintName}")`);
      await sprintCard.locator('[data-testid="start-sprint-button"]').click();

      await helpers.expectSuccessMessage('Sprint started');

      // Verify sprint is active
      await expect(sprintCard.locator('[data-testid="sprint-status"]:has-text("Active")')).toBeVisible();

      // Work on sprint items
      await helpers.navigateToBoard(projectId);

      // Move items through workflow
      await helpers.dragWorkItemToColumn(workItems[0], 'In Progress');
      await helpers.dragWorkItemToColumn(workItems[1], 'Done');

      // Complete sprint
      await helpers.navigateToSprints(projectId);
      await sprintCard.locator('[data-testid="complete-sprint-button"]').click();

      // Add retrospective notes
      await page.fill('[data-testid="retrospective-notes-input"]', 'Sprint went well, good velocity');
      await page.click('[data-testid="complete-sprint-confirm-button"]');

      await helpers.expectSuccessMessage('Sprint completed');

      // Verify incomplete items moved back to backlog
      await helpers.navigateToBacklog(projectId);
      await helpers.verifyWorkItemInBacklog(workItems[2]); // This one wasn't completed
    });

    test('should handle sprint capacity planning', async ({ page }) => {
      await helpers.navigateToSprints(projectId);

      const sprintName = `Capacity Sprint ${Date.now()}`;
      await helpers.createSprint(sprintName, 'Test capacity planning');

      // Open sprint planning
      const sprintCard = page.locator(`[data-testid="sprint-card"]:has-text("${sprintName}")`);
      await sprintCard.click();

      await expect(page.locator('[data-testid="sprint-planning-modal"]')).toBeVisible();

      // Check capacity indicators
      await expect(page.locator('[data-testid="team-capacity"]')).toBeVisible();
      await expect(page.locator('[data-testid="story-points-total"]')).toBeVisible();

      // Add work items and check capacity warnings
      // This would require pre-created work items with estimates
      await page.click('[data-testid="close-planning-modal"]');
    });

    test('should generate sprint reports', async ({ page }) => {
      // This test would require a completed sprint with data
      await helpers.navigateToSprints(projectId);

      // Navigate to reports
      await page.goto(`/projects/${projectId}/reports`);

      // Check burndown chart
      await expect(page.locator('[data-testid="burndown-chart"]')).toBeVisible();

      // Check velocity chart
      await expect(page.locator('[data-testid="velocity-chart"]')).toBeVisible();

      // Export report
      await page.click('[data-testid="export-report-button"]');
      await page.selectOption('[data-testid="export-format-select"]', 'pdf');
      await page.click('[data-testid="download-report-button"]');

      // Verify download started (this would need to be mocked in real tests)
      await helpers.expectSuccessMessage('Report download started');
    });
  });

  test.describe('Board Operations', () => {
    test.beforeEach(async () => {
      projectId = await helpers.createProject();
      await helpers.navigateToBacklog(projectId);

      // Create some work items for board testing
      const workItems = [
        generateWorkItemTitle(),
        generateWorkItemTitle(),
        generateWorkItemTitle(),
      ];

      for (const title of workItems) {
        await helpers.createWorkItem({ ...testWorkItems.task, title });
      }

      await helpers.navigateToBoard(projectId);
    });

    test('should handle drag and drop operations', async ({ page }) => {
      const workItemTitle = await page.locator('[data-testid="work-item-card"]').first().textContent();
      
      if (workItemTitle) {
        // Test drag from To Do to In Progress
        await helpers.dragWorkItemToColumn(workItemTitle, 'In Progress');
        await helpers.verifyWorkItemInColumn(workItemTitle, 'In Progress');

        // Test drag from In Progress to Done
        await helpers.dragWorkItemToColumn(workItemTitle, 'Done');
        await helpers.verifyWorkItemInColumn(workItemTitle, 'Done');

        // Test drag back to To Do
        await helpers.dragWorkItemToColumn(workItemTitle, 'To Do');
        await helpers.verifyWorkItemInColumn(workItemTitle, 'To Do');
      }
    });

    test('should enforce WIP limits', async ({ page }) => {
      // Set WIP limit for In Progress column
      await page.click('[data-testid="board-settings-button"]');
      await page.fill('[data-testid="in-progress-wip-limit"]', '2');
      await page.click('[data-testid="save-board-settings"]');

      // Try to move more items than the WIP limit allows
      const workItems = await page.locator('[data-testid="work-item-card"]').all();
      
      // Move first two items to In Progress (should succeed)
      for (let i = 0; i < 2 && i < workItems.length; i++) {
        const title = await workItems[i].textContent();
        if (title) {
          await helpers.dragWorkItemToColumn(title, 'In Progress');
        }
      }

      // Try to move third item (should show warning)
      if (workItems.length > 2) {
        const thirdItemTitle = await workItems[2].textContent();
        if (thirdItemTitle) {
          await helpers.dragWorkItemToColumn(thirdItemTitle, 'In Progress');
          await helpers.expectErrorMessage('WIP limit exceeded for In Progress column');
        }
      }
    });

    test('should filter board items', async ({ page }) => {
      // Apply assignee filter
      await page.click('[data-testid="board-filters-button"]');
      await page.selectOption('[data-testid="assignee-filter"]', 'unassigned');
      await page.click('[data-testid="apply-filters-button"]');

      // Verify only unassigned items are shown
      const visibleItems = await page.locator('[data-testid="work-item-card"]').count();
      expect(visibleItems).toBeGreaterThan(0);

      // Apply priority filter
      await page.selectOption('[data-testid="priority-filter"]', 'high');
      await page.click('[data-testid="apply-filters-button"]');

      // Clear filters
      await page.click('[data-testid="clear-filters-button"]');

      // Verify all items are shown again
      const allItems = await page.locator('[data-testid="work-item-card"]').count();
      expect(allItems).toBeGreaterThanOrEqual(visibleItems);
    });

    test('should handle board view switching', async ({ page }) => {
      // Switch to Scrum board view
      await page.click('[data-testid="board-view-toggle"]');
      await page.click('[data-testid="scrum-board-option"]');

      await expect(page.locator('[data-testid="scrum-board"]')).toBeVisible();
      await expect(page.locator('[data-testid="sprint-progress-indicator"]')).toBeVisible();

      // Switch back to Kanban view
      await page.click('[data-testid="board-view-toggle"]');
      await page.click('[data-testid="kanban-board-option"]');

      await expect(page.locator('[data-testid="kanban-board"]')).toBeVisible();
    });
  });

  test.describe('Collaboration Features', () => {
    test.beforeEach(async () => {
      projectId = await helpers.createProject();
    });

    test('should handle daily standup participation', async ({ page }) => {
      await page.goto(`/projects/${projectId}/standups`);

      // Join today's standup
      await helpers.participateInStandup(
        'Completed user authentication feature',
        'Working on password reset functionality',
        'Waiting for API documentation'
      );

      // Verify standup participation is recorded
      await expect(page.locator('[data-testid="standup-participation"]')).toBeVisible();
      await expect(page.locator('text=Completed user authentication feature')).toBeVisible();
    });

    test('should handle retrospective sessions', async ({ page }) => {
      await page.goto(`/projects/${projectId}/retrospectives`);

      // Create new retrospective
      await page.click('[data-testid="create-retrospective-button"]');

      // Add items to different categories
      await page.fill('[data-testid="went-well-input"]', 'Great team collaboration');
      await page.click('[data-testid="add-went-well-button"]');

      await page.fill('[data-testid="needs-improvement-input"]', 'Better estimation needed');
      await page.click('[data-testid="add-needs-improvement-button"]');

      await page.fill('[data-testid="action-item-input"]', 'Schedule estimation training');
      await page.click('[data-testid="add-action-item-button"]');

      // Save retrospective
      await page.click('[data-testid="save-retrospective-button"]');

      await helpers.expectSuccessMessage('Retrospective saved');

      // Verify retrospective items are displayed
      await expect(page.locator('text=Great team collaboration')).toBeVisible();
      await expect(page.locator('text=Better estimation needed')).toBeVisible();
      await expect(page.locator('text=Schedule estimation training')).toBeVisible();
    });

    test('should handle real-time collaboration', async ({ context }) => {
      // Open project in two different browser contexts (simulating different users)
      const page1 = await context.newPage();
      const page2 = await context.newPage();

      const helpers1 = new TestHelpers(page1);
      const helpers2 = new TestHelpers(page2);

      // Login as different users
      await helpers1.login('projectOwner');
      await helpers2.login('teamMember');

      // Both navigate to the same board
      await helpers1.navigateToBoard(projectId);
      await helpers2.navigateToBoard(projectId);

      // User 1 creates a work item
      await helpers1.createWorkItem({ ...testWorkItems.task, title: 'Real-time test item' });

      // User 2 should see the new item appear (in real implementation)
      // For now, we'll just verify the item exists when page 2 refreshes
      await page2.reload();
      await helpers2.verifyWorkItemInColumn('Real-time test item', 'To Do');

      // User 2 moves the item
      await helpers2.dragWorkItemToColumn('Real-time test item', 'In Progress');

      // User 1 should see the change (in real implementation)
      await page1.reload();
      await helpers1.verifyWorkItemInColumn('Real-time test item', 'In Progress');
    });
  });

  test.describe('Performance and Scalability', () => {
    test('should handle large numbers of work items', async ({ page }) => {
      projectId = await helpers.createProject();
      await helpers.navigateToBacklog(projectId);

      // Create many work items (simulate large backlog)
      const itemCount = 50;
      const startTime = Date.now();

      for (let i = 0; i < itemCount; i++) {
        await helpers.createWorkItem({
          ...testWorkItems.task,
          title: `Performance Test Item ${i + 1}`,
        });

        // Add some delay to prevent overwhelming the system
        if (i % 10 === 0) {
          await page.waitForTimeout(100);
        }
      }

      const creationTime = Date.now() - startTime;
      console.log(`Created ${itemCount} items in ${creationTime}ms`);

      // Verify all items are displayed
      const displayedItems = await page.locator('[data-testid="backlog-item"]').count();
      expect(displayedItems).toBe(itemCount);

      // Test pagination or virtual scrolling
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(500);

      // Verify performance is acceptable
      expect(creationTime).toBeLessThan(30000); // Should complete within 30 seconds
    });

    test('should handle concurrent user actions', async ({ context }) => {
      projectId = await helpers.createProject();

      // Create multiple browser contexts
      const contexts = await Promise.all([
        context.newPage(),
        context.newPage(),
        context.newPage(),
      ]);

      const helperInstances = contexts.map(pageContext => new TestHelpers(pageContext));

      // Login all users
      await Promise.all([
        helperInstances[0].login('projectOwner'),
        helperInstances[1].login('teamMember'),
        helperInstances[2].login('viewer'),
      ]);

      // Navigate all to the same project
      await Promise.all(
        helperInstances.map(helper => helper.navigateToBacklog(projectId))
      );

      // Perform concurrent actions
      const concurrentActions = [
        helperInstances[0].createWorkItem({ ...testWorkItems.userStory, title: 'Concurrent Item 1' }),
        helperInstances[1].createWorkItem({ ...testWorkItems.task, title: 'Concurrent Item 2' }),
        helperInstances[2].createWorkItem({ ...testWorkItems.bug, title: 'Concurrent Item 3' }),
      ];

      // All actions should complete successfully
      await Promise.all(concurrentActions);

      // Verify all items were created
      await contexts[0].reload();
      await helperInstances[0].verifyWorkItemInBacklog('Concurrent Item 1');
      await helperInstances[0].verifyWorkItemInBacklog('Concurrent Item 2');
      await helperInstances[0].verifyWorkItemInBacklog('Concurrent Item 3');
    });

    test('should maintain performance with complex board operations', async ({ page: _page }) => {
      projectId = await helpers.createProject();
      await helpers.navigateToBacklog(projectId);

      // Create items for performance testing
      const itemCount = 20;
      for (let i = 0; i < itemCount; i++) {
        await helpers.createWorkItem({
          ...testWorkItems.task,
          title: `Board Performance Item ${i + 1}`,
        });
      }

      await helpers.navigateToBoard(projectId);

      // Measure drag and drop performance
      const dragStartTime = Date.now();
      
      for (let i = 0; i < 5; i++) {
        const itemTitle = `Board Performance Item ${i + 1}`;
        await helpers.dragWorkItemToColumn(itemTitle, 'In Progress');
        await helpers.dragWorkItemToColumn(itemTitle, 'Done');
      }

      const dragTime = Date.now() - dragStartTime;
      console.log(`Completed 10 drag operations in ${dragTime}ms`);

      // Performance should be reasonable
      expect(dragTime).toBeLessThan(10000); // Should complete within 10 seconds
    });
  });
});
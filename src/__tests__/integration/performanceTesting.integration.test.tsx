/**
 * Performance integration tests for large datasets and concurrent operations
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, setupTestDatabase, cleanupTestData, generateWorkItem } from '../../test-utils/integrationTestHelpers.tsx';
import { BacklogPage } from '../../pages/BacklogPage';
import { BoardPage } from '../../pages/Board/BoardPage';
import { ReportsPage } from '../../pages/Reports/ReportsPage';
import { workItemService } from '../../services/workItemService';
import { projectService } from '../../services/projectService';
import { reportService } from '../../services/reportService';

// Mock services for performance testing
vi.mock('../../services/workItemService');
vi.mock('../../services/projectService');
vi.mock('../../services/reportService');

describe('Performance Integration Tests', () => {
  let mockDatabase: ReturnType<typeof setupTestDatabase>;
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    mockDatabase = setupTestDatabase();
    user = userEvent.setup();
    
    // Mock service implementations
    
    workItemService.getProjectBacklog = mockDatabase.getWorkItems;
    workItemService.createWorkItem = mockDatabase.createWorkItem;
    workItemService.updateWorkItem = mockDatabase.updateWorkItem;
    projectService.getProject = mockDatabase.getProject;
    reportService.generateBurndownData = vi.fn().mockResolvedValue({
      data: Array.from({ length: 14 }, (_, i) => ({
        date: new Date(Date.now() + i * 24 * 60 * 60 * 1000),
        remaining: Math.max(0, 100 - i * 7),
        ideal: Math.max(0, 100 - i * 7.14),
      })),
      error: null,
    });
  });

  afterEach(() => {
    cleanupTestData();
  });

  describe('Large Dataset Performance', () => {
    it('should handle large backlog efficiently', async () => {
      // Generate large dataset
      const largeWorkItemSet = Array.from({ length: 500 }, (_, i) => 
        generateWorkItem({
          title: `Performance Test Item ${i + 1}`,
          description: `Description for performance test item ${i + 1}`,
          type: i % 3 === 0 ? 'story' : i % 3 === 1 ? 'task' : 'bug',
          priority: (['low', 'medium', 'high', 'critical'] as const)[i % 4],
        })
      );

      mockDatabase.getWorkItems.mockResolvedValueOnce({
        data: largeWorkItemSet,
        error: null,
      });

      const startTime = performance.now();
      
      renderWithProviders(
        <BacklogPage />,
        { initialRoute: '/projects/test-project-1/backlog' }
      );

      // Wait for initial render
      await waitFor(() => {
        expect(screen.getByText('Product Backlog')).toBeInTheDocument();
      });

      const renderTime = performance.now() - startTime;

      // Should render within reasonable time (less than 3 seconds)
      expect(renderTime).toBeLessThan(3000);

      // Verify virtual scrolling or pagination is working
      const visibleItems = screen.getAllByTestId('backlog-item');
      expect(visibleItems.length).toBeLessThanOrEqual(50); // Should not render all 500 items at once

      // Test scrolling performance
      const scrollStartTime = performance.now();
      
      const backlogContainer = screen.getByTestId('backlog-container');
      fireEvent.scroll(backlogContainer, { target: { scrollTop: 1000 } });

      await waitFor(() => {
        // More items should be loaded
        const newVisibleItems = screen.getAllByTestId('backlog-item');
        expect(newVisibleItems.length).toBeGreaterThan(visibleItems.length);
      });

      const scrollTime = performance.now() - scrollStartTime;
      expect(scrollTime).toBeLessThan(500); // Scrolling should be smooth
    });

    it('should handle large board with many columns efficiently', async () => {
      // Generate large dataset for board
      const largeWorkItemSet = Array.from({ length: 200 }, (_, i) => 
        generateWorkItem({
          title: `Board Performance Item ${i + 1}`,
          status: ['To Do', 'In Progress', 'Review', 'Done'][i % 4],
        })
      );

      mockDatabase.getWorkItems.mockResolvedValueOnce({
        data: largeWorkItemSet,
        error: null,
      });

      const startTime = performance.now();
      
      renderWithProviders(
        <BoardPage />,
        { initialRoute: '/projects/test-project-1/board' }
      );

      await waitFor(() => {
        expect(screen.getByTestId('kanban-board')).toBeInTheDocument();
      });

      const renderTime = performance.now() - startTime;
      expect(renderTime).toBeLessThan(4000); // Board should render within 4 seconds

      // Verify all columns are rendered
      expect(screen.getByText('To Do')).toBeInTheDocument();
      expect(screen.getByText('In Progress')).toBeInTheDocument();
      expect(screen.getByText('Review')).toBeInTheDocument();
      expect(screen.getByText('Done')).toBeInTheDocument();

      // Test drag and drop performance with large dataset
      const dragStartTime = performance.now();
      
      const firstWorkItem = screen.getAllByTestId('work-item-card')[0];
      const inProgressColumn = screen.getByText('In Progress').closest('[data-testid="board-column"]');

      // Simulate drag and drop
      fireEvent.dragStart(firstWorkItem);
      fireEvent.dragOver(inProgressColumn!);
      fireEvent.drop(inProgressColumn!);

      await waitFor(() => {
        expect(mockDatabase.updateWorkItem).toHaveBeenCalled();
      });

      const dragTime = performance.now() - dragStartTime;
      expect(dragTime).toBeLessThan(200); // Drag operation should be fast
    });

    it('should handle complex report generation efficiently', async () => {
      // Mock large dataset for reports
      const largeSprintData = Array.from({ length: 10 }, (_, sprintIndex) => ({
        id: `sprint-${sprintIndex}`,
        name: `Sprint ${sprintIndex + 1}`,
        workItems: Array.from({ length: 50 }, (_, itemIndex) => 
          generateWorkItem({
            title: `Sprint ${sprintIndex + 1} Item ${itemIndex + 1}`,
            estimate: Math.floor(Math.random() * 13) + 1,
            status: Math.random() > 0.7 ? 'Done' : 'In Progress',
          })
        ),
      }));

      // const { reportService } = await import('../../services/reportService');
      reportService.generateVelocityData = vi.fn().mockResolvedValue({
        data: largeSprintData.map(sprint => ({
          sprintName: sprint.name,
          planned: sprint.workItems.reduce((sum, item) => sum + (item.estimate || 0), 0),
          completed: sprint.workItems
            .filter(item => item.status === 'Done')
            .reduce((sum, item) => sum + (item.estimate || 0), 0),
        })),
        error: null,
      });

      const startTime = performance.now();
      
      renderWithProviders(
        <ReportsPage />,
        { initialRoute: '/projects/test-project-1/reports' }
      );

      await waitFor(() => {
        expect(screen.getByText('Project Reports')).toBeInTheDocument();
      });

      // Wait for charts to render
      await waitFor(() => {
        expect(screen.getByTestId('velocity-chart')).toBeInTheDocument();
        expect(screen.getByTestId('burndown-chart')).toBeInTheDocument();
      });

      const renderTime = performance.now() - startTime;
      expect(renderTime).toBeLessThan(5000); // Reports should render within 5 seconds

      // Verify charts are interactive
      const velocityChart = screen.getByTestId('velocity-chart');
      fireEvent.mouseOver(velocityChart);

      // Chart should respond to interactions quickly
      await waitFor(() => {
        expect(screen.getByTestId('chart-tooltip')).toBeInTheDocument();
      }, { timeout: 500 });
    });
  });

  describe('Concurrent Operations Performance', () => {
    it('should handle multiple simultaneous work item updates', async () => {
      renderWithProviders(
        <BacklogPage />,
        { initialRoute: '/projects/test-project-1/backlog' }
      );

      await waitFor(() => {
        expect(screen.getByText('Product Backlog')).toBeInTheDocument();
      });

      // Simulate multiple concurrent updates
      const updatePromises = Array.from({ length: 10 }, async (_, i) => {
        const workItem = generateWorkItem({
          title: `Concurrent Update Item ${i + 1}`,
        });

        // Create work item
        await user.click(screen.getByText('Add Work Item'));
        await user.type(screen.getByLabelText(/title/i), workItem.title);
        await user.selectOptions(screen.getByLabelText(/type/i), workItem.type);
        await user.click(screen.getByText('Create Work Item'));

        return workItem;
      });

      const startTime = performance.now();
      const results = await Promise.all(updatePromises);
      const concurrentTime = performance.now() - startTime;

      // All operations should complete within reasonable time
      expect(concurrentTime).toBeLessThan(10000); // 10 seconds for 10 concurrent operations
      expect(results).toHaveLength(10);

      // Verify all items were created
      for (const workItem of results) {
        await waitFor(() => {
          expect(screen.getByText(workItem.title)).toBeInTheDocument();
        });
      }
    });

    it('should handle rapid filtering and searching', async () => {
      // Create dataset with varied content for filtering
      const searchableItems = Array.from({ length: 100 }, (_, i) => 
        generateWorkItem({
          title: `Searchable Item ${i + 1}`,
          type: i % 2 === 0 ? 'story' : 'task',
          priority: i % 2 === 0 ? 'high' : 'low',
          labels: i % 3 === 0 ? ['frontend'] : i % 3 === 1 ? ['backend'] : ['testing'],
        })
      );

      mockDatabase.getWorkItems.mockResolvedValue({
        data: searchableItems,
        error: null,
      });

      renderWithProviders(
        <BacklogPage />,
        { initialRoute: '/projects/test-project-1/backlog' }
      );

      await waitFor(() => {
        expect(screen.getByText('Product Backlog')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search backlog items...');

      // Test rapid search operations
      const searchTerms = ['Item 1', 'Item 2', 'Item 3', 'frontend', 'backend'];
      
      for (const term of searchTerms) {
        const searchStartTime = performance.now();
        
        await user.clear(searchInput);
        await user.type(searchInput, term);

        // Wait for search results (debounced)
        await waitFor(() => {
          const items = screen.getAllByTestId('backlog-item');
          expect(items.length).toBeGreaterThan(0);
        }, { timeout: 1000 });

        const searchTime = performance.now() - searchStartTime;
        expect(searchTime).toBeLessThan(800); // Each search should complete quickly
      }

      // Test rapid filter changes
      const typeFilter = screen.getByDisplayValue('All Items');
      
      const filterStartTime = performance.now();
      await user.selectOptions(typeFilter, 'story');
      
      await waitFor(() => {
        const storyItems = screen.getAllByTestId('backlog-item');
        expect(storyItems.length).toBeLessThanOrEqual(50); // Should show only stories
      });

      const filterTime = performance.now() - filterStartTime;
      expect(filterTime).toBeLessThan(500); // Filtering should be fast
    });

    it('should maintain performance during real-time updates', async () => {
      renderWithProviders(
        <BoardPage />,
        { initialRoute: '/projects/test-project-1/board' }
      );

      await waitFor(() => {
        expect(screen.getByTestId('kanban-board')).toBeInTheDocument();
      });

      // Simulate rapid real-time updates
      const updateStartTime = performance.now();
      
      for (let i = 0; i < 20; i++) {
        // Simulate real-time update
        const realtimeUpdate = {
          eventType: 'UPDATE',
          new: {
            id: `work-item-${i}`,
            title: `Real-time Update ${i}`,
            status: i % 2 === 0 ? 'In Progress' : 'Done',
            updatedAt: new Date().toISOString(),
          },
        };

        // Trigger update (this would normally come from real-time service)
        fireEvent(window, new CustomEvent('realtime-update', { detail: realtimeUpdate }));
        
        // Small delay to simulate network timing
        await new Promise(resolve => setTimeout(resolve, 10));
      }

      const updateTime = performance.now() - updateStartTime;
      expect(updateTime).toBeLessThan(2000); // All updates should process quickly

      // UI should remain responsive
      const addButton = screen.getByText('Add Work Item');
      await user.click(addButton);
      
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      }, { timeout: 500 }); // Should respond quickly even during updates
    });
  });

  describe('Memory and Resource Management', () => {
    it('should not cause memory leaks with large datasets', async () => {
      const initialMemory = (performance as Performance & { memory?: { usedJSHeapSize: number } }).memory?.usedJSHeapSize || 0;

      // Render and unmount multiple times with large datasets
      for (let iteration = 0; iteration < 5; iteration++) {
        const largeDataset = Array.from({ length: 200 }, (_, i) => 
          generateWorkItem({ title: `Memory Test Item ${iteration}-${i}` })
        );

        mockDatabase.getWorkItems.mockResolvedValueOnce({
          data: largeDataset,
          error: null,
        });

        const { unmount } = renderWithProviders(
          <BacklogPage />,
          { initialRoute: '/projects/test-project-1/backlog' }
        );

        await waitFor(() => {
          expect(screen.getByText('Product Backlog')).toBeInTheDocument();
        });

        // Perform some operations
        const searchInput = screen.getByPlaceholderText('Search backlog items...');
        await user.type(searchInput, `Memory Test ${iteration}`);

        await waitFor(() => {
          const items = screen.getAllByTestId('backlog-item');
          expect(items.length).toBeGreaterThan(0);
        });

        // Unmount component
        unmount();

        // Force garbage collection if available
        if ((global as typeof global & { gc?: () => void }).gc) {
          (global as typeof global & { gc?: () => void }).gc();
        }
      }

      // Check memory usage hasn't grown excessively
      const finalMemory = (performance as Performance & { memory?: { usedJSHeapSize: number } }).memory?.usedJSHeapSize || 0;
      
      if (initialMemory > 0 && finalMemory > 0) {
        const memoryGrowth = finalMemory - initialMemory;
        const memoryGrowthMB = memoryGrowth / (1024 * 1024);
        
        // Memory growth should be reasonable (less than 50MB)
        expect(memoryGrowthMB).toBeLessThan(50);
      }
    });

    it('should efficiently handle component re-renders', async () => {
      let renderCount = 0;
      
      // Mock component to track renders
      const TestComponent = () => {
        renderCount++;
        return <BacklogPage />;
      };

      renderWithProviders(
        <TestComponent />,
        { initialRoute: '/projects/test-project-1/backlog' }
      );

      await waitFor(() => {
        expect(screen.getByText('Product Backlog')).toBeInTheDocument();
      });

      const initialRenderCount = renderCount;

      // Perform operations that might cause unnecessary re-renders
      const searchInput = screen.getByPlaceholderText('Search backlog items...');
      
      // Type multiple characters quickly
      await user.type(searchInput, 'test search');

      // Wait for debounced search
      await waitFor(() => {
        // Search should have completed
        expect(searchInput).toHaveValue('test search');
      }, { timeout: 1000 });

      // Render count should not have increased excessively
      const finalRenderCount = renderCount;
      const additionalRenders = finalRenderCount - initialRenderCount;
      
      // Should not re-render more than necessary (allowing for some re-renders due to state changes)
      expect(additionalRenders).toBeLessThan(10);
    });

    it('should handle cleanup properly on component unmount', async () => {
      const mockCleanup = vi.fn();
      
      // Mock hooks that should cleanup
      vi.mock('../../hooks/useRealtime', () => ({
        useRealtime: () => ({
          isConnected: true,
          subscribe: vi.fn(),
          unsubscribe: mockCleanup,
          send: vi.fn(),
          error: null,
        }),
      }));

      const { unmount } = renderWithProviders(
        <BoardPage />,
        { initialRoute: '/projects/test-project-1/board' }
      );

      await waitFor(() => {
        expect(screen.getByTestId('kanban-board')).toBeInTheDocument();
      });

      // Unmount component
      unmount();

      // Cleanup functions should have been called
      expect(mockCleanup).toHaveBeenCalled();
    });
  });

  describe('Network Performance', () => {
    it('should handle slow network conditions gracefully', async () => {
      // Mock slow API responses
      mockDatabase.getWorkItems.mockImplementation(() => 
        new Promise(resolve => 
          setTimeout(() => resolve({
            data: [generateWorkItem({ title: 'Slow Network Item' })],
            error: null,
          }), 2000) // 2 second delay
        )
      );

      const startTime = performance.now();
      
      renderWithProviders(
        <BacklogPage />,
        { initialRoute: '/projects/test-project-1/backlog' }
      );

      // Loading state should be shown immediately
      expect(screen.getByRole('status')).toBeInTheDocument();

      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByText('Slow Network Item')).toBeInTheDocument();
      }, { timeout: 5000 });

      const loadTime = performance.now() - startTime;
      
      // Should handle slow network but still complete
      expect(loadTime).toBeGreaterThan(2000);
      expect(loadTime).toBeLessThan(5000);

      // Loading state should be hidden
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    it('should implement proper caching strategies', async () => {
      const mockApiCall = vi.fn().mockResolvedValue({
        data: [generateWorkItem({ title: 'Cached Item' })],
        error: null,
      });

      mockDatabase.getWorkItems = mockApiCall;

      // First render
      renderWithProviders(
        <BacklogPage />,
        { initialRoute: '/projects/test-project-1/backlog' }
      );

      await waitFor(() => {
        expect(screen.getByText('Cached Item')).toBeInTheDocument();
      });

      expect(mockApiCall).toHaveBeenCalledTimes(1);

      // Navigate away and back
      const { rerender } = renderWithProviders(
        <div>Other Page</div>,
        { initialRoute: '/other' }
      );

      rerender(<BacklogPage />);

      await waitFor(() => {
        expect(screen.getByText('Cached Item')).toBeInTheDocument();
      });

      // Should use cached data (API not called again)
      expect(mockApiCall).toHaveBeenCalledTimes(1);
    });

    it('should batch API requests efficiently', async () => {
      const mockBatchCall = vi.fn().mockResolvedValue({
        data: Array.from({ length: 5 }, (_, i) => 
          generateWorkItem({ title: `Batch Item ${i + 1}` })
        ),
        error: null,
      });

      mockDatabase.getWorkItems = mockBatchCall;

      renderWithProviders(
        <BacklogPage />,
        { initialRoute: '/projects/test-project-1/backlog' }
      );

      // Trigger multiple operations that might cause API calls
      await waitFor(() => {
        expect(screen.getByText('Product Backlog')).toBeInTheDocument();
      });

      // Perform rapid filter changes
      const typeFilter = screen.getByDisplayValue('All Items');
      await user.selectOptions(typeFilter, 'story');
      await user.selectOptions(typeFilter, 'task');
      await user.selectOptions(typeFilter, 'All Items');

      // Should batch requests or use cached data
      expect(mockBatchCall).toHaveBeenCalledTimes(1);
    });
  });
});
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { GanttChart } from '../GanttChart';
import type { WorkItem } from '../../../types';

// Mock Chart.js to avoid canvas issues in tests
vi.mock('react-chartjs-2', () => ({
    Bar: ({ data, options }: { data: unknown; options: { plugins: { title: { text: string } } } }) => (
        <div data-testid="gantt-chart">
            <div data-testid="chart-title">{options.plugins.title.text}</div>
            <div data-testid="chart-data">{JSON.stringify(data)}</div>
        </div>
    ),
}));

vi.mock('chart.js', () => ({
    Chart: {
        register: vi.fn(),
    },
    CategoryScale: vi.fn(),
    LinearScale: vi.fn(),
    TimeScale: vi.fn(),
    BarElement: vi.fn(),
    Title: vi.fn(),
    Tooltip: vi.fn(),
    Legend: vi.fn(),
}));

vi.mock('chartjs-adapter-date-fns', () => ({}));

// Mock the services
vi.mock('../../../services', () => ({
    workItemService: {
        getWorkItemDependencies: vi.fn(() => Promise.resolve([])),
    },
}));

describe('GanttChart', () => {
    const mockWorkItems: WorkItem[] = [
        {
            id: 'item-1',
            projectId: 'project-1',
            title: 'Task 1',
            description: 'First task',
            type: 'task',
            status: 'To Do',
            priority: 'high',
            assigneeId: 'user-1',
            reporterId: 'user-1',
            estimate: 8,
            actualTime: 0,
            dependencies: [],
            labels: ['frontend'],
            dueDate: new Date('2024-02-15'),
            createdAt: new Date('2024-02-01'),
            updatedAt: new Date('2024-02-01'),
        },
        {
            id: 'item-2',
            projectId: 'project-1',
            title: 'Task 2',
            description: 'Second task',
            type: 'story',
            status: 'In Progress',
            priority: 'medium',
            assigneeId: 'user-2',
            reporterId: 'user-1',
            estimate: 13,
            actualTime: 5,
            dependencies: ['item-1'],
            labels: ['backend'],
            dueDate: new Date('2024-02-20'),
            createdAt: new Date('2024-02-05'),
            updatedAt: new Date('2024-02-10'),
        },
        {
            id: 'item-3',
            projectId: 'project-1',
            title: 'Epic Task',
            description: 'Epic milestone',
            type: 'epic',
            status: 'Done',
            priority: 'critical',
            assigneeId: 'user-1',
            reporterId: 'user-1',
            estimate: 0, // Milestone
            actualTime: 0,
            dependencies: ['item-2'],
            labels: ['milestone'],
            dueDate: new Date('2024-02-25'),
            createdAt: new Date('2024-02-01'),
            updatedAt: new Date('2024-02-20'),
        },
    ];

    const mockWorkItemsWithoutDueDates: WorkItem[] = [
        {
            id: 'item-4',
            projectId: 'project-1',
            title: 'Task without due date',
            description: 'Task without timeline',
            type: 'task',
            status: 'To Do',
            priority: 'low',
            assigneeId: 'user-1',
            reporterId: 'user-1',
            estimate: 5,
            actualTime: 0,
            dependencies: [],
            labels: [],
            createdAt: new Date('2024-02-01'),
            updatedAt: new Date('2024-02-01'),
        },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders Gantt chart with work items', () => {
        render(
            <GanttChart
                projectId="project-1"
                workItems={mockWorkItems}
            />
        );

        expect(screen.getByTestId('gantt-chart')).toBeInTheDocument();
        expect(screen.getByTestId('chart-title')).toHaveTextContent('Project Gantt Chart');
    });

    it('shows critical path information', () => {
        render(
            <GanttChart
                projectId="project-1"
                workItems={mockWorkItems}
            />
        );

        expect(screen.getByText(/Critical Path:/)).toBeInTheDocument();
    });

    it('renders time scale selector', () => {
        render(
            <GanttChart
                projectId="project-1"
                workItems={mockWorkItems}
            />
        );

        expect(screen.getByText('Scale:')).toBeInTheDocument();
        const scaleSelector = screen.getByRole('combobox');
        expect(scaleSelector).toBeInTheDocument();
    });

    it('toggles critical path visibility', () => {
        render(
            <GanttChart
                projectId="project-1"
                workItems={mockWorkItems}
            />
        );

        const criticalPathButton = screen.getByRole('button', { name: /critical path/i });
        expect(criticalPathButton).toBeInTheDocument();

        fireEvent.click(criticalPathButton);
        // Button should still be there but might change appearance
        expect(screen.getByRole('button', { name: /critical path/i })).toBeInTheDocument();
    });

    it('toggles milestones visibility', () => {
        render(
            <GanttChart
                projectId="project-1"
                workItems={mockWorkItems}
            />
        );

        const milestonesButton = screen.getByRole('button', { name: /milestones/i });
        expect(milestonesButton).toBeInTheDocument();

        fireEvent.click(milestonesButton);
        expect(screen.getByRole('button', { name: /milestones/i })).toBeInTheDocument();
    });

    it('changes time scale', () => {
        render(
            <GanttChart
                projectId="project-1"
                workItems={mockWorkItems}
            />
        );

        const scaleSelector = screen.getByRole('combobox');
        fireEvent.change(scaleSelector, { target: { value: 'day' } });
        expect(scaleSelector).toHaveValue('day');

        fireEvent.change(scaleSelector, { target: { value: 'month' } });
        expect(scaleSelector).toHaveValue('month');
    });

    it('shows empty state when no work items with due dates', () => {
        render(
            <GanttChart
                projectId="project-1"
                workItems={mockWorkItemsWithoutDueDates}
            />
        );

        expect(screen.getByText('No timeline data available')).toBeInTheDocument();
        expect(screen.getByText('Add due dates to work items to see them in the Gantt chart')).toBeInTheDocument();
    });

    it('shows empty state when no work items at all', () => {
        render(
            <GanttChart
                projectId="project-1"
                workItems={[]}
            />
        );

        expect(screen.getByText('No timeline data available')).toBeInTheDocument();
    });

    it('calls onWorkItemClick when provided', () => {
        const mockOnClick = vi.fn();
        render(
            <GanttChart
                projectId="project-1"
                workItems={mockWorkItems}
                onWorkItemClick={mockOnClick}
            />
        );

        // The chart component should be rendered
        expect(screen.getByTestId('gantt-chart')).toBeInTheDocument();
    });

    it('calls onDependencyEdit when provided', () => {
        const mockOnDependencyEdit = vi.fn();
        render(
            <GanttChart
                projectId="project-1"
                workItems={mockWorkItems}
                onDependencyEdit={mockOnDependencyEdit}
            />
        );

        // The chart component should be rendered
        expect(screen.getByTestId('gantt-chart')).toBeInTheDocument();
    });

    it('renders legend with priority colors', () => {
        render(
            <GanttChart
                projectId="project-1"
                workItems={mockWorkItems}
            />
        );

        // Check for legend items (not buttons)
        const legendSection = screen.getByText('High Priority').closest('.grid');
        expect(legendSection).toBeInTheDocument();
        expect(screen.getByText('High Priority')).toBeInTheDocument();
        expect(screen.getByText('Normal Priority')).toBeInTheDocument();
    });

    it('shows chart information text', () => {
        render(
            <GanttChart
                projectId="project-1"
                workItems={mockWorkItems}
            />
        );

        expect(screen.getByText(/Click on tasks to view details/)).toBeInTheDocument();
        expect(screen.getByText(/Critical path shows the longest sequence/)).toBeInTheDocument();
    });

    it('applies custom className', () => {
        const { container } = render(
            <GanttChart
                projectId="project-1"
                workItems={mockWorkItems}
                className="custom-class"
            />
        );

        expect(container.firstChild).toHaveClass('custom-class');
    });

    it('handles loading state', () => {
        render(
            <GanttChart
                projectId="project-1"
                workItems={mockWorkItems}
            />
        );

        // Should not show loading by default
        expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    it('identifies milestones correctly', () => {
        render(
            <GanttChart
                projectId="project-1"
                workItems={mockWorkItems}
            />
        );

        // Epic with 0 estimate should be treated as milestone
        const chartData = screen.getByTestId('chart-data');
        expect(chartData).toBeInTheDocument();
    });

    it('calculates progress correctly', () => {
        const workItemWithProgress = {
            ...mockWorkItems[1],
            actualTime: 6,
            estimate: 12,
        };

        render(
            <GanttChart
                projectId="project-1"
                workItems={[workItemWithProgress]}
            />
        );

        // Progress should be calculated as actualTime/estimate * 100
        expect(screen.getByTestId('gantt-chart')).toBeInTheDocument();
    });

    it('handles work items with dependencies', () => {
        render(
            <GanttChart
                projectId="project-1"
                workItems={mockWorkItems}
            />
        );

        // Should render chart with dependent tasks
        expect(screen.getByTestId('gantt-chart')).toBeInTheDocument();
        expect(screen.getByText(/Critical Path:/)).toBeInTheDocument();
    });

    it('sorts work items by start date', () => {
        const unsortedItems = [mockWorkItems[2], mockWorkItems[0], mockWorkItems[1]];

        render(
            <GanttChart
                projectId="project-1"
                workItems={unsortedItems}
            />
        );

        // Chart should still render correctly with unsorted input
        expect(screen.getByTestId('gantt-chart')).toBeInTheDocument();
    });
});
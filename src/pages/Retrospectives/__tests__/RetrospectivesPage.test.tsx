import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { RetrospectivesPage } from '../RetrospectivesPage';

// Mock the components
vi.mock('../../../components/retrospectives', () => ({
  RetrospectiveList: ({ onRetrospectiveSelect }: { onRetrospectiveSelect: (retro: { id: string; title: string }) => void }) => (
    <div data-testid="retrospective-list">
      <button onClick={() => onRetrospectiveSelect({ id: 'retro-1', title: 'Test Retrospective' })}>
        Select Retrospective
      </button>
    </div>
  ),
  RetrospectiveSession: ({ retrospectiveId, onClose }: { retrospectiveId: string; onClose: () => void }) => (
    <div data-testid="retrospective-session">
      <span>Retrospective Session: {retrospectiveId}</span>
      <button onClick={onClose}>Close Session</button>
    </div>
  ),
  SprintReview: ({ sprintId, onClose }: { sprintId: string; onClose: () => void }) => (
    <div data-testid="sprint-review">
      <span>Sprint Review: {sprintId}</span>
      <button onClick={onClose}>Close Review</button>
    </div>
  ),
  SprintReviewList: ({ onSprintSelect }: { onSprintSelect: (sprint: { id: string; name: string }) => void }) => (
    <div data-testid="sprint-review-list">
      <button onClick={() => onSprintSelect({ id: 'sprint-1', name: 'Test Sprint' })}>
        Select Sprint
      </button>
    </div>
  )
}));

const renderWithRouter = (initialEntries = ['/projects/project-1/retrospectives']) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/projects/:projectId/retrospectives" element={<RetrospectivesPage />} />
        <Route path="/retrospectives" element={<RetrospectivesPage />} />
      </Routes>
    </MemoryRouter>
  );
};

describe('RetrospectivesPage', () => {
  it('renders the page with default retrospectives view', () => {
    renderWithRouter();

    expect(screen.getByText('Team Collaboration')).toBeInTheDocument();
    expect(screen.getByText('Conduct retrospectives to gather team feedback and identify improvements.')).toBeInTheDocument();
    expect(screen.getByTestId('retrospective-list')).toBeInTheDocument();
    expect(screen.queryByTestId('sprint-review-list')).not.toBeInTheDocument();
  });

  it('switches to sprint reviews view when tab is clicked', () => {
    renderWithRouter();

    const sprintReviewsTab = screen.getByText('Sprint Reviews');
    fireEvent.click(sprintReviewsTab);

    expect(screen.getByText('Review sprint outcomes, completed work, and team performance metrics.')).toBeInTheDocument();
    expect(screen.getByTestId('sprint-review-list')).toBeInTheDocument();
    expect(screen.queryByTestId('retrospective-list')).not.toBeInTheDocument();
  });

  it('switches back to retrospectives view when tab is clicked', () => {
    renderWithRouter();

    // Switch to sprint reviews first
    fireEvent.click(screen.getByText('Sprint Reviews'));
    expect(screen.getByTestId('sprint-review-list')).toBeInTheDocument();

    // Switch back to retrospectives
    fireEvent.click(screen.getByText('Retrospectives'));
    expect(screen.getByTestId('retrospective-list')).toBeInTheDocument();
    expect(screen.queryByTestId('sprint-review-list')).not.toBeInTheDocument();
  });

  it('shows retrospective session when retrospective is selected', () => {
    renderWithRouter();

    const selectButton = screen.getByText('Select Retrospective');
    fireEvent.click(selectButton);

    expect(screen.getByTestId('retrospective-session')).toBeInTheDocument();
    expect(screen.getByText('Retrospective Session: retro-1')).toBeInTheDocument();
    expect(screen.queryByTestId('retrospective-list')).not.toBeInTheDocument();
  });

  it('shows sprint review when sprint is selected', () => {
    renderWithRouter();

    // Switch to sprint reviews
    fireEvent.click(screen.getByText('Sprint Reviews'));
    
    const selectButton = screen.getByText('Select Sprint');
    fireEvent.click(selectButton);

    expect(screen.getByTestId('sprint-review')).toBeInTheDocument();
    expect(screen.getByText('Sprint Review: sprint-1')).toBeInTheDocument();
    expect(screen.queryByTestId('sprint-review-list')).not.toBeInTheDocument();
  });

  it('closes retrospective session and returns to list', () => {
    renderWithRouter();

    // Select retrospective
    fireEvent.click(screen.getByText('Select Retrospective'));
    expect(screen.getByTestId('retrospective-session')).toBeInTheDocument();

    // Close session
    fireEvent.click(screen.getByText('Close Session'));
    expect(screen.getByTestId('retrospective-list')).toBeInTheDocument();
    expect(screen.queryByTestId('retrospective-session')).not.toBeInTheDocument();
  });

  it('closes sprint review and returns to list', () => {
    renderWithRouter();

    // Switch to sprint reviews and select sprint
    fireEvent.click(screen.getByText('Sprint Reviews'));
    fireEvent.click(screen.getByText('Select Sprint'));
    expect(screen.getByTestId('sprint-review')).toBeInTheDocument();

    // Close review
    fireEvent.click(screen.getByText('Close Review'));
    expect(screen.getByTestId('sprint-review-list')).toBeInTheDocument();
    expect(screen.queryByTestId('sprint-review')).not.toBeInTheDocument();
  });

  it('shows error when project ID is missing', () => {
    render(
      <MemoryRouter initialEntries={['/retrospectives']}>
        <RetrospectivesPage />
      </MemoryRouter>
    );

    expect(screen.getByText('Project ID is required')).toBeInTheDocument();
  });

  it('displays correct tab icons', () => {
    renderWithRouter();

    // Check that both tabs have their respective icons
    const retrospectivesTab = screen.getByText('Retrospectives').closest('button');
    const sprintReviewsTab = screen.getByText('Sprint Reviews').closest('button');

    expect(retrospectivesTab).toBeInTheDocument();
    expect(sprintReviewsTab).toBeInTheDocument();
  });

  it('maintains active tab styling', () => {
    renderWithRouter();

    const retrospectivesTab = screen.getByText('Retrospectives').closest('button');
    const sprintReviewsTab = screen.getByText('Sprint Reviews').closest('button');

    // Initially retrospectives tab should be active
    expect(retrospectivesTab).toHaveClass('bg-white', 'text-gray-900', 'shadow-sm');
    expect(sprintReviewsTab).toHaveClass('text-gray-600');

    // Click sprint reviews tab
    fireEvent.click(sprintReviewsTab!);

    // Now sprint reviews tab should be active
    expect(sprintReviewsTab).toHaveClass('bg-white', 'text-gray-900', 'shadow-sm');
    expect(retrospectivesTab).toHaveClass('text-gray-600');
  });
});
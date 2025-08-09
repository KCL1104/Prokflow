// React import not needed for testing library
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { StandupList } from '../StandupList';
import { useStandups, useStandupParticipation } from '../../../hooks/useStandups';
import { useAuth } from '../../../hooks/useAuth';
import type { User } from '../../../types';

// Mock the hooks
vi.mock('../../../hooks/useStandups');
vi.mock('../../../hooks/useAuth');

const mockUseStandups = vi.mocked(useStandups);
const mockUseStandupParticipation = vi.mocked(useStandupParticipation);
const mockUseAuth = vi.mocked(useAuth);

const mockStandups = [
  {
    id: '1',
    projectId: 'project-1',
    scheduledDate: new Date('2024-01-15T09:00:00Z'),
    status: 'scheduled' as const,
    facilitatorId: 'user-1',
    participants: ['user-1', 'user-2'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    projectId: 'project-1',
    scheduledDate: new Date('2024-01-14T09:00:00Z'),
    status: 'completed' as const,
    facilitatorId: 'user-1',
    participants: ['user-1', 'user-2'],
    duration: 15,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  fullName: 'Test User',
  full_name: 'Test User', // For compatibility
  avatarUrl: undefined,
  avatar_url: undefined, // For compatibility
  timezone: 'UTC',
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-01T00:00:00Z'),
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
} as User;

describe('StandupList', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    });

    mockUseStandups.mockReturnValue({
      standups: mockStandups,
      loading: false,
      error: null,
      createStandup: vi.fn(),
      updateStandup: vi.fn(),
      deleteStandup: vi.fn(),
      fetchStandups: vi.fn(),
    });

    mockUseStandupParticipation.mockReturnValue({
      participation: null,
      participations: [],
      loading: false,
      error: null,
      submitParticipation: vi.fn(),
      updateParticipation: vi.fn(),
      fetchParticipations: vi.fn(),
      fetchUserParticipation: vi.fn(),
    });
  });

  it('renders standup list correctly', () => {
    render(<StandupList projectId="project-1" />);

    expect(screen.getByText('Daily Standups')).toBeInTheDocument();
    expect(screen.getByText('Schedule Standup')).toBeInTheDocument();
  });

  it('displays standups when available', () => {
    render(<StandupList projectId="project-1" />);

    // Should show both standups
    expect(screen.getAllByText('Daily Standup')).toHaveLength(2);
    
    // Check status badges
    expect(screen.getByText('SCHEDULED')).toBeInTheDocument();
    expect(screen.getByText('COMPLETED')).toBeInTheDocument();
  });

  it('shows empty state when no standups exist', () => {
    mockUseStandups.mockReturnValue({
      standups: [],
      loading: false,
      error: null,
      createStandup: vi.fn(),
      updateStandup: vi.fn(),
      deleteStandup: vi.fn(),
      fetchStandups: vi.fn(),
    });

    render(<StandupList projectId="project-1" />);

    expect(screen.getByText('No standups scheduled')).toBeInTheDocument();
    expect(screen.getByText('Schedule your first daily standup to keep the team aligned and track progress.')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    mockUseStandups.mockReturnValue({
      standups: [],
      loading: true,
      error: null,
      createStandup: vi.fn(),
      updateStandup: vi.fn(),
      deleteStandup: vi.fn(),
      fetchStandups: vi.fn(),
    });

    render(<StandupList projectId="project-1" />);

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('shows error state', () => {
    mockUseStandups.mockReturnValue({
      standups: [],
      loading: false,
      error: 'Failed to load standups',
      createStandup: vi.fn(),
      updateStandup: vi.fn(),
      deleteStandup: vi.fn(),
      fetchStandups: vi.fn(),
    });

    render(<StandupList projectId="project-1" />);

    expect(screen.getByText('Failed to load standups')).toBeInTheDocument();
  });

  it('opens create standup modal when schedule button is clicked', () => {
    render(<StandupList projectId="project-1" />);

    fireEvent.click(screen.getByText('Schedule Standup'));

    expect(screen.getByText('Schedule Daily Standup')).toBeInTheDocument();
  });

  it('allows facilitator to start scheduled standup', async () => {
    const mockUpdateStandup = vi.fn();
    mockUseStandups.mockReturnValue({
      standups: mockStandups,
      loading: false,
      error: null,
      createStandup: vi.fn(),
      updateStandup: mockUpdateStandup,
      deleteStandup: vi.fn(),
      fetchStandups: vi.fn(),
    });

    render(<StandupList projectId="project-1" />);

    const startButton = screen.getByText('Start');
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(mockUpdateStandup).toHaveBeenCalledWith('1', 'in_progress');
    });
  });

  it('allows participants to join standup', async () => {
    const mockFetchUserParticipation = vi.fn();
    mockUseStandupParticipation.mockReturnValue({
      participation: null,
      participations: [],
      loading: false,
      error: null,
      submitParticipation: vi.fn(),
      updateParticipation: vi.fn(),
      fetchParticipations: vi.fn(),
      fetchUserParticipation: mockFetchUserParticipation,
    });

    render(<StandupList projectId="project-1" />);

    const joinButton = screen.getByText('Join');
    fireEvent.click(joinButton);

    await waitFor(() => {
      expect(mockFetchUserParticipation).toHaveBeenCalledWith('1');
    });
  });

  it('filters standups by sprint when sprintId is provided', () => {
    const sprintStandups = [
      {
        ...mockStandups[0],
        sprintId: 'sprint-1',
      },
    ];

    mockUseStandups.mockReturnValue({
      standups: sprintStandups,
      loading: false,
      error: null,
      createStandup: vi.fn(),
      updateStandup: vi.fn(),
      deleteStandup: vi.fn(),
      fetchStandups: vi.fn(),
    });

    render(<StandupList projectId="project-1" sprintId="sprint-1" />);

    expect(screen.getByText(/Sprint standups/)).toBeInTheDocument();
  });

  it('shows correct participant count', () => {
    render(<StandupList projectId="project-1" />);

    expect(screen.getAllByText('2 participants')).toHaveLength(2);
  });

  it('shows duration for completed standups', () => {
    render(<StandupList projectId="project-1" />);

    expect(screen.getByText('15 min')).toBeInTheDocument();
  });
});
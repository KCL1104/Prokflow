import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CollaborativeWorkItemForm } from '../CollaborativeWorkItemForm';
import type { WorkItem } from '../../../types';
import React from 'react';

// Mock the hooks and components
vi.mock('../../../hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({
    user: {
      id: 'user-1',
      email: 'test@example.com',
      user_metadata: { full_name: 'Test User' }
    }
  }))
}));

// Mock collaborative components with simple inputs
vi.mock('../collaboration/CollaborativeTextEditor', () => ({
  CollaborativeTextInput: React.forwardRef<HTMLInputElement, {
    workItemId?: string | null;
    projectId: string;
    fieldName: string;
    value: string;
    onChange: (value: string) => void;
    onSave?: (value: string) => void;
    id?: string;
    placeholder?: string;
    className?: string;
  }>(({ value, onChange, id, placeholder, className }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value);
    };
    
    return (
      <input
        ref={ref}
        data-testid="collaborative-text-input"
        id={id}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className={className}
      />
    );
  }),
  CollaborativeTextArea: React.forwardRef<HTMLTextAreaElement, {
    workItemId?: string | null;
    projectId: string;
    fieldName: string;
    value: string;
    onChange: (value: string) => void;
    onSave?: (value: string) => void;
    id?: string;
    placeholder?: string;
    rows?: number;
  }>(({ value, onChange, id, placeholder, rows }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange(e.target.value);
    };
    
    return (
      <textarea
        ref={ref}
        data-testid="collaborative-text-area"
        id={id}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        rows={rows}
      />
    );
  })
}));

// Mock the realtime collaboration provider
vi.mock('../collaboration/RealtimeCollaborationProvider', () => ({
  CollaborationStatus: ({ projectId }: { projectId: string }) => (
    <div data-testid="collaboration-status">Connected to {projectId}</div>
  )
}));

// Mock the hooks
vi.mock('../../../hooks/useRealtimeCollaboration', () => ({
  useRealtimeCollaboration: () => ({
    connected: true,
    connecting: false,
    error: null
  })
}));

vi.mock('../../../hooks/useCollaborativeEditing', () => ({
  useCollaborativeIndicators: vi.fn(() => ({
    hasOtherUsers: false,
    hasEditingUsers: false,
    otherUsers: [],
    editingUsers: [],
    viewingUsers: []
  })),
  useCollaborativeTextEditor: vi.fn(() => ({
    value: '',
    setValue: vi.fn(),
    isEditing: false,
    hasUnsavedChanges: false,
    fieldEditors: [],
    isFieldBeingEdited: false,
    forceSave: vi.fn(),
    editorProps: {
      value: '',
      onChange: vi.fn(),
      onFocus: vi.fn(),
      onBlur: vi.fn()
    }
  }))
}));

vi.mock('../../../hooks/useNotifications', () => ({
  useWorkItemNotifications: vi.fn(() => ({
    notifyWorkItemUpdated: vi.fn()
  }))
}));

// Mock Button component
vi.mock('../common/Button', () => ({
  Button: ({ children, onClick, disabled, loading, type, variant }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    loading?: boolean;
    type?: "button" | "reset" | "submit";
    variant?: string;
  }) => (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      type={type}
      data-variant={variant}
      data-testid={`button-${variant || 'default'}`}
    >
      {loading ? 'Loading...' : children}
    </button>
  )
}));

describe('CollaborativeWorkItemForm', () => {
  const mockWorkItem: WorkItem = {
    id: 'work-item-1',
    projectId: 'project-1',
    title: 'Test Work Item',
    description: 'Test description',
    type: 'story',
    status: 'To Do',
    priority: 'medium',
    assigneeId: 'user-1',
    reporterId: 'user-1',
    estimate: 5,
    actualTime: 0,
    dependencies: [],
    labels: ['frontend'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  };

  const mockOnCancel = vi.fn();
  const defaultProps = {
    projectId: 'project-1',
    onSave: vi.fn(),
    onCancel: mockOnCancel
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders create form when no work item provided', () => {
    render(<CollaborativeWorkItemForm {...defaultProps} />);

    expect(screen.getByText('Create Work Item')).toBeInTheDocument();
    expect(screen.getByDisplayValue('')).toBeInTheDocument(); // Empty title
    expect(screen.getByDisplayValue('story')).toBeInTheDocument(); // Default type
    expect(screen.getByDisplayValue('medium')).toBeInTheDocument(); // Default priority
    expect(screen.getByDisplayValue('0')).toBeInTheDocument(); // Default estimate
  });

  it('renders edit form when work item provided', () => {
    render(<CollaborativeWorkItemForm {...defaultProps} workItem={mockWorkItem} />);

    expect(screen.getByText('Edit Work Item')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Work Item')).toBeInTheDocument();
    expect(screen.getByDisplayValue('story')).toBeInTheDocument();
    expect(screen.getByDisplayValue('medium')).toBeInTheDocument();
    expect(screen.getByDisplayValue('5')).toBeInTheDocument();
  });

  it('shows collaboration status', () => {
    render(<CollaborativeWorkItemForm {...defaultProps} />);

    expect(screen.getByTestId('collaboration-status')).toBeInTheDocument();
    expect(screen.getByText('Connected to project-1')).toBeInTheDocument();
  });

  it('updates form fields correctly', async () => {
    render(<CollaborativeWorkItemForm {...defaultProps} />);

    const titleInput = screen.getByTestId('collaborative-text-input');
    const typeSelect = screen.getByDisplayValue('story');
    const prioritySelect = screen.getByDisplayValue('medium');
    const estimateInput = screen.getByDisplayValue('0');

    fireEvent.change(titleInput, { target: { value: 'New Title' } });
    fireEvent.change(typeSelect, { target: { value: 'task' } });
    fireEvent.change(prioritySelect, { target: { value: 'high' } });
    fireEvent.change(estimateInput, { target: { value: '8' } });

    await waitFor(() => {
      expect(titleInput).toHaveValue('New Title');
      expect(typeSelect).toHaveValue('task');
      expect(prioritySelect).toHaveValue('high');
      expect(estimateInput).toHaveValue('8');
    });
  });

  it('shows unsaved changes indicator', async () => {
    render(<CollaborativeWorkItemForm {...defaultProps} />);

    const titleInput = screen.getByTestId('collaborative-text-input');
    
    fireEvent.change(titleInput, { target: { value: 'Modified Title' } });

    await waitFor(() => {
      expect(screen.getByText('You have unsaved changes')).toBeInTheDocument();
    });
  });

  it('calls onSave with correct data when form is submitted', async () => {
    const mockOnSave = vi.fn<(workItem: Partial<WorkItem>) => Promise<void>>().mockResolvedValue(undefined);
    render(<CollaborativeWorkItemForm {...defaultProps} onSave={mockOnSave} />);

    const titleInput = screen.getByTestId('collaborative-text-input');
    const descriptionTextarea = screen.getByTestId('collaborative-text-area');
    const submitButton = screen.getByRole('button', { name: /create work item/i });

    fireEvent.change(titleInput, { target: { value: 'New Work Item' } });
    fireEvent.change(descriptionTextarea, { target: { value: 'New description' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith({
        title: 'New Work Item',
        description: 'New description',
        type: 'story',
        priority: 'medium',
        estimate: 0
      });
    });
  });

  it('calls onCancel when cancel button is clicked', () => {
    const mockOnCancel = vi.fn();
    render(<CollaborativeWorkItemForm {...defaultProps} onCancel={mockOnCancel} />);

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('disables submit button when title is empty', () => {
    render(<CollaborativeWorkItemForm {...defaultProps} />);

    const submitButton = screen.getByRole('button', { name: /create work item/i });
    expect(submitButton).toBeDisabled();
  });

  it('enables submit button when title is provided', async () => {
    const mockOnSave = vi.fn();
    render(
      <CollaborativeWorkItemForm
        projectId="test-project"
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    const submitButton = screen.getByRole('button', { name: /create work item/i });
    const titleInput = screen.getByTestId('collaborative-text-input');

    // Initial state checks
    expect(submitButton).toBeDisabled();
    expect(titleInput).toHaveValue('');

    // Change the title
    fireEvent.change(titleInput, { target: { value: 'Test Title' } });

    // Wait for the form state to update
    await waitFor(() => {
      expect(titleInput).toHaveValue('Test Title');
    });
    
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
  });

  it('shows loading state during save', async () => {
    const mockOnSave = vi.fn(() => new Promise<void>(resolve => setTimeout(resolve, 100)));
    render(<CollaborativeWorkItemForm {...defaultProps} onSave={mockOnSave} />);

    const titleInput = screen.getByTestId('collaborative-text-input');
    const submitButton = screen.getByRole('button', { name: /create work item/i });

    fireEvent.change(titleInput, { target: { value: 'Test Title' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });
  });

  it('shows editing users when others are editing', async () => {
    // Import the mock and set it up properly
    const mockModule = await import('../../../hooks/useCollaborativeEditing');
    const mockUseCollaborativeIndicators = vi.mocked(mockModule.useCollaborativeIndicators);
    
    // Override the mock for this specific test
    mockUseCollaborativeIndicators.mockReturnValueOnce({
      hasOtherUsers: true,
      hasEditingUsers: true,
      otherUsers: [{ userId: 'user-1', userName: 'Other User', userAvatar: 'avatar.jpg', isEditing: true, editingField: 'title', joinedAt: new Date() }],
      editingUsers: [{ userId: 'user-1', userName: 'Other User', userAvatar: 'avatar.jpg', isEditing: true, editingField: 'title', joinedAt: new Date() }],
      viewingUsers: []
    });

    render(<CollaborativeWorkItemForm {...defaultProps} />);

    expect(screen.getByText('1 user editing')).toBeInTheDocument();
  });

  it('handles save errors gracefully', async () => {
    const errorSave = vi.fn().mockRejectedValue(new Error('Save failed'));
    
    render(
      <CollaborativeWorkItemForm
        projectId="test-project"
        onSave={errorSave}
        onCancel={mockOnCancel}
      />
    );

    const titleInput = screen.getByTestId('collaborative-text-input');
    const submitButton = screen.getByRole('button', { name: /create work item/i });

    // Change the title using act to ensure state updates
    await act(async () => {
      fireEvent.change(titleInput, { target: { value: 'Test Title' } });
    });
    
    // Wait for the input to reflect the change
    await waitFor(() => {
      expect(titleInput).toHaveValue('Test Title');
    });
    
    // Wait for button to be enabled
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
    
    // Click the submit button
    await act(async () => {
      fireEvent.click(submitButton);
    });

    // Should handle error gracefully
    await waitFor(() => {
      expect(errorSave).toHaveBeenCalled();
    }, { timeout: 3000 });

    // Button should be re-enabled after error
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
  });

  it('applies custom className', () => {
    const { container } = render(
      <CollaborativeWorkItemForm {...defaultProps} className="custom-class" />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('shows correct button text for create vs edit', () => {
    const { rerender } = render(<CollaborativeWorkItemForm {...defaultProps} />);
    expect(screen.getByRole('button', { name: /create work item/i })).toBeInTheDocument();

    rerender(<CollaborativeWorkItemForm {...defaultProps} workItem={mockWorkItem} />);
    expect(screen.getByRole('button', { name: /update work item/i })).toBeInTheDocument();
  });

  it('validates estimate input range', async () => {
    render(<CollaborativeWorkItemForm {...defaultProps} />);

    const estimateInput = screen.getByDisplayValue('0');
    
    // Test that input accepts valid values
    fireEvent.change(estimateInput, { target: { value: '13' } });
    await waitFor(() => {
      expect(estimateInput).toHaveValue(13);
    });

    // Input should have min/max attributes
    expect(estimateInput).toHaveAttribute('min', '0');
    expect(estimateInput).toHaveAttribute('max', '100');
  });

  it('tracks changes correctly for existing work item', async () => {
    const mockOnSave = vi.fn();
    render(<CollaborativeWorkItemForm {...defaultProps} workItem={mockWorkItem} onSave={mockOnSave} />);

    const titleInput = screen.getByTestId('collaborative-text-input');
    
    // Make a change to the title
    fireEvent.change(titleInput, { target: { value: 'Modified Title' } });

    // Check if unsaved changes indicator appears
    await waitFor(() => {
      expect(screen.getByText('You have unsaved changes')).toBeInTheDocument();
    });
  });

  it('renders all form fields with correct labels', () => {
    render(<CollaborativeWorkItemForm {...defaultProps} />);
    
    expect(screen.getByText('Title *')).toBeInTheDocument();
    expect(screen.getByText('Type')).toBeInTheDocument();
    expect(screen.getByText('Priority')).toBeInTheDocument();
    expect(screen.getByText('Story Points')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
  });

  it('has correct select options', () => {
    render(<CollaborativeWorkItemForm {...defaultProps} />);

    const typeSelect = screen.getByLabelText('Type');
    const prioritySelect = screen.getByLabelText('Priority');

    // Check type options
    expect(typeSelect).toContainHTML('<option value="story">Story</option>');
    expect(typeSelect).toContainHTML('<option value="task">Task</option>');
    expect(typeSelect).toContainHTML('<option value="bug">Bug</option>');
    expect(typeSelect).toContainHTML('<option value="epic">Epic</option>');

    // Check priority options
    expect(prioritySelect).toContainHTML('<option value="low">Low</option>');
    expect(prioritySelect).toContainHTML('<option value="medium">Medium</option>');
    expect(prioritySelect).toContainHTML('<option value="high">High</option>');
    expect(prioritySelect).toContainHTML('<option value="critical">Critical</option>');
  });
});
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ProjectForm } from '../ProjectForm';
import type { ProjectFormData } from '../../../types/forms';

describe('ProjectForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders form fields correctly', () => {
    render(
      <ProjectForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByLabelText(/project name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByText(/scrum/i)).toBeInTheDocument();
    expect(screen.getByText(/kanban/i)).toBeInTheDocument();
    expect(screen.getByText(/waterfall/i)).toBeInTheDocument();
    expect(screen.getByText(/custom/i)).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    render(
      <ProjectForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const submitButton = screen.getByRole('button', { name: /create project/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/project name is required/i)).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('submits form with valid data', async () => {
    render(
      <ProjectForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const nameInput = screen.getByLabelText(/project name/i);
    const descriptionInput = screen.getByLabelText(/description/i);
    const submitButton = screen.getByRole('button', { name: /create project/i });

    fireEvent.change(nameInput, { target: { value: 'Test Project' } });
    fireEvent.change(descriptionInput, { target: { value: 'Test Description' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Test Project',
          description: 'Test Description',
          methodology: 'scrum'
        })
      );
    });
  });

  it('shows sprint duration field for scrum methodology', () => {
    render(
      <ProjectForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    // Scrum is selected by default
    expect(screen.getByLabelText(/sprint duration/i)).toBeInTheDocument();
  });

  it('hides sprint duration field for non-scrum methodologies', () => {
    render(
      <ProjectForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    // Switch to Kanban
    const kanbanOption = screen.getByLabelText(/kanban/i);
    fireEvent.click(kanbanOption);

    expect(screen.queryByLabelText(/sprint duration/i)).not.toBeInTheDocument();
  });

  it('populates form with initial data', () => {
    const initialData: Partial<ProjectFormData> = {
      name: 'Existing Project',
      description: 'Existing Description',
      methodology: 'kanban'
    };

    render(
      <ProjectForm
        initialData={initialData}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByDisplayValue('Existing Project')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Existing Description')).toBeInTheDocument();
    expect(screen.getByLabelText(/kanban/i)).toBeChecked();
  });

  it('calls onCancel when cancel button is clicked', () => {
    render(
      <ProjectForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('disables form when loading', () => {
    render(
      <ProjectForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        isLoading={true}
      />
    );

    const nameInput = screen.getByLabelText(/project name/i);
    const buttons = screen.getAllByRole('button');
    const submitButton = buttons.find(button => (button as HTMLButtonElement).type === 'submit');

    expect(nameInput).toBeDisabled();
    expect(submitButton).toBeDisabled();
  });
});
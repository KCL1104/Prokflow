import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { LoginForm } from '../LoginForm';
import { AuthProvider } from '../../../contexts/AuthContext';

// Mock the auth context
const mockSignIn = vi.fn();
const mockSignInWithProvider = vi.fn();

vi.mock('../../../contexts/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
  useAuth: () => ({
    signIn: mockSignIn,
    signInWithProvider: mockSignInWithProvider,
    user: null,
    loading: false
  })
}));

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderLoginForm = (props = {}) => {
    return render(
      <AuthProvider>
        <LoginForm {...props} />
      </AuthProvider>
    );
  };

  it('renders login form correctly', () => {
    renderLoginForm();
    
    expect(screen.getByRole('heading', { name: 'Sign In' })).toBeInTheDocument();
    expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('shows validation error for empty fields', async () => {
    renderLoginForm();
    
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    expect(submitButton).toBeDisabled();
  });

  it('enables submit button when form is valid', async () => {
    renderLoginForm();
    
    const emailInput = screen.getByLabelText('Email Address');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(submitButton).not.toBeDisabled();
  });

  it('calls signIn when form is submitted', async () => {
    mockSignIn.mockResolvedValue({ error: null });
    renderLoginForm();
    
    const emailInput = screen.getByLabelText('Email Address');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('displays error message when sign in fails', async () => {
    const errorMessage = 'Invalid credentials';
    mockSignIn.mockResolvedValue({ error: { message: errorMessage } });
    renderLoginForm();
    
    const emailInput = screen.getByLabelText('Email Address');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('toggles password visibility', () => {
    renderLoginForm();
    
    const passwordInput = screen.getByLabelText('Password');
    const toggleButton = screen.getByRole('button', { name: /toggle password visibility/i });

    expect(passwordInput).toHaveAttribute('type', 'password');
    
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');
    
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

<<<<<<< HEAD
  it('calls social login when provider buttons are clicked', async () => {
=======
  it('calls social login with Google when Google button is clicked', async () => {
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
    mockSignInWithProvider.mockResolvedValue({ error: null });
    renderLoginForm();
    
    const googleButton = screen.getByRole('button', { name: /google/i });
<<<<<<< HEAD
    const githubButton = screen.getByRole('button', { name: /github/i });
=======
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)

    fireEvent.click(googleButton);
    await waitFor(() => {
      expect(mockSignInWithProvider).toHaveBeenCalledWith('google');
    });
<<<<<<< HEAD
=======
  });

  it('calls social login with GitHub when GitHub button is clicked', async () => {
    mockSignInWithProvider.mockResolvedValue({ error: null });
    renderLoginForm();
    
    const githubButton = screen.getByRole('button', { name: /github/i });
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)

    fireEvent.click(githubButton);
    await waitFor(() => {
      expect(mockSignInWithProvider).toHaveBeenCalledWith('github');
    });
  });

  it('calls toggle mode when sign up link is clicked', () => {
    const mockToggleMode = vi.fn();
    renderLoginForm({ onToggleMode: mockToggleMode });
    
    const signUpLink = screen.getByRole('button', { name: /sign up/i });
    fireEvent.click(signUpLink);

    expect(mockToggleMode).toHaveBeenCalled();
  });

  it('calls forgot password when link is clicked', () => {
    const mockForgotPassword = vi.fn();
    renderLoginForm({ onForgotPassword: mockForgotPassword });
    
    const forgotPasswordLink = screen.getByRole('button', { name: /forgot password/i });
    fireEvent.click(forgotPasswordLink);

    expect(mockForgotPassword).toHaveBeenCalled();
  });
});
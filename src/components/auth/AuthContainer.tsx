import { useState } from 'react';
import { LoginForm } from './LoginForm';
import { SignUpForm } from './SignUpForm';
import { ForgotPasswordForm } from './ForgotPasswordForm';

type AuthMode = 'login' | 'signup' | 'forgot-password';

interface AuthContainerProps {
  initialMode?: AuthMode;
  onSuccess?: () => void;
}

export function AuthContainer({ initialMode = 'login' }: AuthContainerProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);

  const handleModeChange = (newMode: AuthMode) => {
    setMode(newMode);
  };

  const renderAuthForm = () => {
    switch (mode) {
      case 'signup':
        return (
          <SignUpForm
            onToggleMode={() => handleModeChange('login')}
          />
        );
      case 'forgot-password':
        return (
          <ForgotPasswordForm
            onBackToLogin={() => handleModeChange('login')}
          />
        );
      case 'login':
      default:
        return (
          <LoginForm
            onToggleMode={() => handleModeChange('signup')}
            onForgotPassword={() => handleModeChange('forgot-password')}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Project Management Platform
          </h1>
          <p className="text-gray-600">
            Manage your projects with ease
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        {renderAuthForm()}
      </div>

      <div className="mt-8 text-center">
        <p className="text-xs text-gray-500">
          By signing in, you agree to our{' '}
          <a href="#" className="text-blue-600 hover:text-blue-500">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="text-blue-600 hover:text-blue-500">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
}
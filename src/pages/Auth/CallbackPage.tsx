import { AuthCallback } from '../../components/auth';

export function CallbackPage() {
  const handleSuccess = () => {
    // Redirect to dashboard after successful authentication
    setTimeout(() => {
      window.location.href = '/dashboard';
    }, 2000);
  };

  const handleError = (error: string) => {
    console.error('Authentication error:', error);
    // Redirect to login page after error
    setTimeout(() => {
      window.location.href = '/auth';
    }, 3000);
  };

  return (
    <AuthCallback 
      onSuccess={handleSuccess}
      onError={handleError}
    />
  );
}
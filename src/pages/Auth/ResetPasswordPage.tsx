import { ResetPasswordForm } from '../../components/auth';
import { useNavigate } from 'react-router-dom';

export function ResetPasswordPage() {
  const navigate = useNavigate();

  const handleSuccess = () => {
    // Redirect to dashboard after successful password reset
    setTimeout(() => {
      navigate('/dashboard');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Project Management Platform
          </h1>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <ResetPasswordForm onSuccess={handleSuccess} />
      </div>
    </div>
  );
}
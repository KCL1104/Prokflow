import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
<<<<<<< HEAD
import { Button } from '../components/common/Button';
=======
import { Button } from '../components/ui/button';
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="text-9xl font-bold text-gray-300 mb-4">404</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Page Not Found
        </h1>
        <p className="text-gray-600 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        <div className="space-y-4">
          <Button
            onClick={() => navigate(-1)}
            className="w-full"
          >
            Go Back
          </Button>
          <Link to="/dashboard">
            <Button
              variant="secondary"
              className="w-full"
            >
              Go to Dashboard
            </Button>
          </Link>
        </div>

        {/* Helpful links */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">
            Or try one of these pages:
          </p>
          <div className="space-y-2">
            <Link
              to="/projects"
              className="block text-blue-600 hover:text-blue-800 text-sm"
            >
              📁 Projects
            </Link>
            <Link
              to="/backlog"
              className="block text-blue-600 hover:text-blue-800 text-sm"
            >
              📋 Product Backlog
            </Link>
            <Link
              to="/board"
              className="block text-blue-600 hover:text-blue-800 text-sm"
            >
              📌 Board View
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
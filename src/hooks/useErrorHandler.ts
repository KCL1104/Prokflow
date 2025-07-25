import { useState, useCallback } from 'react';
import { type AppError } from '../utils/errorHandling';

interface UseErrorHandlerReturn {
  error: AppError | null;
  setError: (error: unknown) => void;
  clearError: () => void;
  handleAsyncError: <T>(asyncFn: () => Promise<T>) => Promise<T | null>;
}

export const useErrorHandler = (): UseErrorHandlerReturn => {
  const [error, setErrorState] = useState<AppError | null>(null);

  const setError = useCallback((error: unknown) => {
    if (error instanceof Error) {
      setErrorState({
        message: error.message,
        code: error.name,
      });
    } else if (typeof error === 'string') {
      setErrorState({
        message: error,
        code: 'UNKNOWN_ERROR',
      });
    } else {
      setErrorState({
        message: 'An unexpected error occurred',
        code: 'UNKNOWN_ERROR',
      });
    }
  }, []);

  const clearError = useCallback(() => {
    setErrorState(null);
  }, []);

  const handleAsyncError = useCallback(async <T>(
    asyncFn: () => Promise<T>
  ): Promise<T | null> => {
    try {
      clearError();
      return await asyncFn();
    } catch (err) {
      setError(err);
      return null;
    }
  }, [setError, clearError]);

  return {
    error,
    setError,
    clearError,
    handleAsyncError,
  };
};
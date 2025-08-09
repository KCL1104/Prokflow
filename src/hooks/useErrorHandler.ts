import { useState, useCallback } from 'react';
<<<<<<< HEAD
import { type AppError } from '../utils/errorHandling';

interface UseErrorHandlerReturn {
  error: AppError | null;
  setError: (error: unknown) => void;
=======
import { AppError, isAppError } from '../utils/errors';

interface UseErrorHandlerReturn {
  error: AppError | null;
  setError: (error: unknown, context?: string) => void;
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
  clearError: () => void;
  handleAsyncError: <T>(asyncFn: () => Promise<T>) => Promise<T | null>;
}

<<<<<<< HEAD
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

=======
/**
 * Custom hook for centralized error handling in React components
 * 
 * @returns Object containing error state and handler functions
 * 
 * @example
 * ```tsx
 * const { error, setError, clearError, handleAsyncError } = useErrorHandler();
 * 
 * // Handle async operations with automatic error handling
 * const data = await handleAsyncError(() => fetchData());
 * 
 * // Manually set an error with context
 * setError(new Error('Something went wrong'), 'User Profile Update');
 * ```
 */
export const useErrorHandler = (): UseErrorHandlerReturn => {
  const [error, setErrorState] = useState<AppError | null>(null);

  /**
   * Sets an error in the error state, converting unknown error types to AppError
   * 
   * @param error - The error to set (can be any type)
   * @param context - Optional context message for debugging
   */
  const setError = useCallback((error: unknown, context?: string) => {
    // Log error for debugging purposes
    if (context) {
      console.error(`[${context}]`, error);
    } else {
      console.error('Error occurred:', error);
    }

    // Convert error to AppError for consistent handling
    if (isAppError(error)) {
      setErrorState(error);
    } else if (error instanceof Error) {
      setErrorState(new AppError(error.message, error.name));
    } else if (typeof error === 'string') {
      setErrorState(new AppError(error, 'UNKNOWN_ERROR'));
    } else {
      setErrorState(new AppError('An unexpected error occurred', 'UNKNOWN_ERROR'));
    }
  }, []);

  /**
   * Clears the current error state
   */
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
  const clearError = useCallback(() => {
    setErrorState(null);
  }, []);

<<<<<<< HEAD
=======
  /**
   * Handles async operations with automatic error handling
   * 
   * @param asyncFn - The async function to execute
   * @returns The result of the async function or null if an error occurred
   */
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
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
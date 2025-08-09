import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useErrorHandler } from '../useErrorHandler';
import { AppError, ValidationError, NotFoundError } from '../../utils/errors';

describe('useErrorHandler', () => {
  let mockConsoleError: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    mockConsoleError.mockRestore();
  });

  it('should initialize with no error', () => {
    const { result } = renderHook(() => useErrorHandler());

    expect(result.current.error).toBeNull();
  });

  describe('setError', () => {
    it('should handle AppError instances correctly', () => {
      const { result } = renderHook(() => useErrorHandler());
      const appError = new AppError('Test error', 'TEST_ERROR');

      act(() => {
        result.current.setError(appError);
      });

      expect(result.current.error).toBe(appError);
      expect(mockConsoleError).toHaveBeenCalledWith('Error occurred:', appError);
    });

    it('should convert Error instances to AppError', () => {
      const { result } = renderHook(() => useErrorHandler());
      const error = new Error('Test error');

      act(() => {
        result.current.setError(error);
      });

      expect(result.current.error).toBeInstanceOf(AppError);
      expect(result.current.error?.message).toBe('Test error');
      expect(result.current.error?.code).toBe('Error');
    });

    it('should convert string errors to AppError', () => {
      const { result } = renderHook(() => useErrorHandler());
      const errorMessage = 'String error message';

      act(() => {
        result.current.setError(errorMessage);
      });

      expect(result.current.error).toBeInstanceOf(AppError);
      expect(result.current.error?.message).toBe(errorMessage);
      expect(result.current.error?.code).toBe('UNKNOWN_ERROR');
    });

    it('should handle unknown error types', () => {
      const { result } = renderHook(() => useErrorHandler());
      const unknownError = { someProperty: 'value' };

      act(() => {
        result.current.setError(unknownError);
      });

      expect(result.current.error).toBeInstanceOf(AppError);
      expect(result.current.error?.message).toBe('An unexpected error occurred');
      expect(result.current.error?.code).toBe('UNKNOWN_ERROR');
    });

    it('should log error with context when provided', () => {
      const { result } = renderHook(() => useErrorHandler());
      const error = new Error('Test error');
      const context = 'User Profile Update';

      act(() => {
        result.current.setError(error, context);
      });

      expect(mockConsoleError).toHaveBeenCalledWith(`[${context}]`, error);
    });

    it('should handle ValidationError correctly', () => {
      const { result } = renderHook(() => useErrorHandler());
      const validationError = new ValidationError('Invalid input', { field: 'email' });

      act(() => {
        result.current.setError(validationError);
      });

      expect(result.current.error).toBe(validationError);
      expect(result.current.error?.code).toBe('VALIDATION_ERROR');
      expect(result.current.error?.details).toEqual({ field: 'email' });
    });

    it('should handle NotFoundError correctly', () => {
      const { result } = renderHook(() => useErrorHandler());
      const notFoundError = new NotFoundError('User', '123');

      act(() => {
        result.current.setError(notFoundError);
      });

      expect(result.current.error).toBe(notFoundError);
      expect(result.current.error?.code).toBe('NOT_FOUND');
      expect(result.current.error?.message).toBe("User with id '123' not found");
    });
  });

  describe('clearError', () => {
    it('should clear the error state', () => {
      const { result } = renderHook(() => useErrorHandler());
      const error = new AppError('Test error', 'TEST_ERROR');

      // Set an error first
      act(() => {
        result.current.setError(error);
      });

      expect(result.current.error).toBe(error);

      // Clear the error
      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });

    it('should be safe to call when no error is set', () => {
      const { result } = renderHook(() => useErrorHandler());

      expect(result.current.error).toBeNull();

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('handleAsyncError', () => {
    it('should return result when async function succeeds', async () => {
      const { result } = renderHook(() => useErrorHandler());
      const successValue = 'success';
      const asyncFn = vi.fn().mockResolvedValue(successValue);

      let returnValue: string | null = null;
      await act(async () => {
        returnValue = await result.current.handleAsyncError(asyncFn);
      });

      expect(returnValue).toBe(successValue);
      expect(result.current.error).toBeNull();
      expect(asyncFn).toHaveBeenCalledOnce();
    });

    it('should handle async function errors', async () => {
      const { result } = renderHook(() => useErrorHandler());
      const error = new Error('Async error');
      const asyncFn = vi.fn().mockRejectedValue(error);

      let returnValue: unknown = undefined;
      await act(async () => {
        returnValue = await result.current.handleAsyncError(asyncFn);
      });

      expect(returnValue).toBeNull();
      expect(result.current.error).toBeInstanceOf(AppError);
      expect(result.current.error?.message).toBe('Async error');
      expect(asyncFn).toHaveBeenCalledOnce();
    });

    it('should clear existing error before executing async function', async () => {
      const { result } = renderHook(() => useErrorHandler());
      const initialError = new AppError('Initial error', 'INITIAL_ERROR');
      const successValue = 'success';
      const asyncFn = vi.fn().mockResolvedValue(successValue);

      // Set initial error
      act(() => {
        result.current.setError(initialError);
      });

      expect(result.current.error).toBe(initialError);

      // Execute successful async function
      let returnValue: string | null = null;
      await act(async () => {
        returnValue = await result.current.handleAsyncError(asyncFn);
      });

      expect(returnValue).toBe(successValue);
      expect(result.current.error).toBeNull();
    });

    it('should handle async function that throws AppError', async () => {
      const { result } = renderHook(() => useErrorHandler());
      const appError = new ValidationError('Validation failed', { field: 'name' });
      const asyncFn = vi.fn().mockRejectedValue(appError);

      let returnValue: unknown = undefined;
      await act(async () => {
        returnValue = await result.current.handleAsyncError(asyncFn);
      });

      expect(returnValue).toBeNull();
      expect(result.current.error).toBe(appError);
      expect(result.current.error?.code).toBe('VALIDATION_ERROR');
    });

    it('should handle async function that throws string error', async () => {
      const { result } = renderHook(() => useErrorHandler());
      const stringError = 'String error message';
      const asyncFn = vi.fn().mockRejectedValue(stringError);

      let returnValue: unknown = undefined;
      await act(async () => {
        returnValue = await result.current.handleAsyncError(asyncFn);
      });

      expect(returnValue).toBeNull();
      expect(result.current.error).toBeInstanceOf(AppError);
      expect(result.current.error?.message).toBe(stringError);
      expect(result.current.error?.code).toBe('UNKNOWN_ERROR');
    });

    it('should handle async function with generic type', async () => {
      const { result } = renderHook(() => useErrorHandler());
      
      interface TestData {
        id: number;
        name: string;
      }
      
      const testData: TestData = { id: 1, name: 'Test' };
      const asyncFn = vi.fn().mockResolvedValue(testData);

      let returnValue: TestData | null = null;
      await act(async () => {
        returnValue = await result.current.handleAsyncError<TestData>(asyncFn);
      });

      expect(returnValue).toEqual(testData);
      expect(result.current.error).toBeNull();
    });
  });

  describe('hook stability', () => {
    it('should maintain function references across re-renders', () => {
      const { result, rerender } = renderHook(() => useErrorHandler());

      const initialSetError = result.current.setError;
      const initialClearError = result.current.clearError;
      const initialHandleAsyncError = result.current.handleAsyncError;

      rerender();

      expect(result.current.setError).toBe(initialSetError);
      expect(result.current.clearError).toBe(initialClearError);
      expect(result.current.handleAsyncError).toBe(initialHandleAsyncError);
    });
  });

  describe('error state persistence', () => {
    it('should maintain error state across re-renders', () => {
      const { result, rerender } = renderHook(() => useErrorHandler());
      const error = new AppError('Persistent error', 'PERSISTENT_ERROR');

      act(() => {
        result.current.setError(error);
      });

      expect(result.current.error).toBe(error);

      rerender();

      expect(result.current.error).toBe(error);
    });
  });

  describe('edge cases', () => {
    it('should handle null error', () => {
      const { result } = renderHook(() => useErrorHandler());

      act(() => {
        result.current.setError(null);
      });

      expect(result.current.error).toBeInstanceOf(AppError);
      expect(result.current.error?.message).toBe('An unexpected error occurred');
    });

    it('should handle undefined error', () => {
      const { result } = renderHook(() => useErrorHandler());

      act(() => {
        result.current.setError(undefined);
      });

      expect(result.current.error).toBeInstanceOf(AppError);
      expect(result.current.error?.message).toBe('An unexpected error occurred');
    });

    it('should handle empty string error', () => {
      const { result } = renderHook(() => useErrorHandler());

      act(() => {
        result.current.setError('');
      });

      expect(result.current.error).toBeInstanceOf(AppError);
      expect(result.current.error?.message).toBe('');
      expect(result.current.error?.code).toBe('UNKNOWN_ERROR');
    });

    it('should handle async function that returns undefined', async () => {
      const { result } = renderHook(() => useErrorHandler());
      const asyncFn = vi.fn().mockResolvedValue(undefined);

      let returnValue: unknown = 'initial';
      await act(async () => {
        returnValue = await result.current.handleAsyncError(asyncFn);
      });

      expect(returnValue).toBeUndefined();
      expect(result.current.error).toBeNull();
    });
  });
});
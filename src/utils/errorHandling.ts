<<<<<<< HEAD
export interface AppError {
  message: string;
  code?: string;
  details?: any;
}

export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NetworkError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'NetworkError';
  }
}

export function handleError(error: unknown): AppError {
  if (error instanceof ValidationError) {
    return {
      message: error.message,
      code: 'VALIDATION_ERROR',
      details: { field: error.field }
    };
  }

  if (error instanceof NetworkError) {
    return {
      message: error.message,
      code: 'NETWORK_ERROR',
      details: { status: error.status }
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      code: 'UNKNOWN_ERROR'
    };
  }

  return {
    message: 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR'
  };
}

export function getErrorMessage(error: unknown): string {
  const appError = handleError(error);
  return appError.message;
}
=======
import { isKnownError } from './typeGuards';
// Error classes are available but not used in this file currently

export interface ErrorInfo {
  message: string;
  code?: string;
  details?: unknown;
}

/**
 * Standardized error handling utility
 */
export class ErrorHandler {
  static handleApiError(error: unknown, context: string): ErrorInfo {
    if (isKnownError(error)) {
      return {
        message: `${context}: ${error.message}`,
        details: error.stack,
      };
    }

    return {
      message: `${context}: An unexpected error occurred`,
      details: error,
    };
  }

  static handleDragDropError(error: unknown, itemId: string, targetStatus: string): ErrorInfo {
    const baseMessage = `Failed to move item ${itemId} to ${targetStatus}`;
    
    if (isKnownError(error)) {
      if (error.message.includes('WIP limit')) {
        return {
          message: `Cannot move item: WIP limit reached for ${targetStatus}`,
          code: 'WIP_LIMIT_EXCEEDED',
        };
      }
      
      if (error.message.includes('permission')) {
        return {
          message: 'You do not have permission to move this item',
          code: 'PERMISSION_DENIED',
        };
      }
    }

    return {
      message: baseMessage,
      details: error,
    };
  }

  static createRetryableError(message: string, retryAction: () => void): ErrorInfo & { retry: () => void } {
    return {
      message,
      retry: retryAction,
    };
  }
}

/**
 * Extract error message from unknown error type
 */
export const getErrorMessage = (error: unknown): string => {
  if (isKnownError(error)) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }
  
  return 'An unexpected error occurred';
};

/**
 * Hook for consistent error state management
 */
export const useErrorHandler = () => {
  const handleError = (error: unknown, context: string): ErrorInfo => {
    const errorInfo = ErrorHandler.handleApiError(error, context);
    
    // Log error for debugging
    console.error(`[${context}]`, errorInfo);
    
    return errorInfo;
  };

  return { handleError };
};
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)

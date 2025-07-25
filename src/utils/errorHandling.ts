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
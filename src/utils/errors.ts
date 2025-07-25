// Custom error classes for the application

export class AppError extends Error {
  public readonly code: string;
  public readonly status?: number;
  public readonly details?: Record<string, any>;

  constructor(
    message: string,
    code: string = 'UNKNOWN_ERROR',
    status?: number,
    details?: Record<string, any>
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.status = status;
    this.details = details;

    // Maintains proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 'VALIDATION_ERROR', 400, details);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    const message = id ? `${resource} with id '${id}' not found` : `${resource} not found`;
    super(message, 'NOT_FOUND', 404);
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized access') {
    super(message, 'UNAUTHORIZED', 401);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden access') {
    super(message, 'FORBIDDEN', 403);
    this.name = 'ForbiddenError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 'CONFLICT', 409, details);
    this.name = 'ConflictError';
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 'DATABASE_ERROR', 500, details);
    this.name = 'DatabaseError';
  }
}

// Error handler utility
export function handleSupabaseError(error: any, context?: string): never {
  const contextMessage = context ? `${context}: ` : '';
  
  if (error?.code === 'PGRST116') {
    throw new NotFoundError('Resource');
  }
  
  if (error?.code === '23505') {
    throw new ConflictError(`${contextMessage}Resource already exists`, { originalError: error });
  }
  
  if (error?.code === '23503') {
    throw new ValidationError(`${contextMessage}Referenced resource does not exist`, { originalError: error });
  }
  
  if (error?.code === '42501') {
    throw new ForbiddenError(`${contextMessage}Insufficient permissions`);
  }
  
  // Generic database error
  throw new DatabaseError(`${contextMessage}${error?.message || 'Database operation failed'}`, { originalError: error });
}

// Utility to check if error is an instance of our custom errors
export function isAppError(error: any): error is AppError {
  return error instanceof AppError;
}

// Utility to format error for API responses
export function formatErrorResponse(error: any) {
  if (isAppError(error)) {
    return {
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID()
      }
    };
  }

  // Generic error
  return {
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID()
    }
  };
}
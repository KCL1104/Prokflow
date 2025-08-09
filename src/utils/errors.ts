// Custom error classes for the application

export class AppError extends Error {
  public readonly code: string;
  public readonly status?: number;
<<<<<<< HEAD
  public readonly details?: Record<string, any>;
=======
  public readonly details?: Record<string, unknown>;
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)

  constructor(
    message: string,
    code: string = 'UNKNOWN_ERROR',
    status?: number,
<<<<<<< HEAD
    details?: Record<string, any>
=======
    details?: Record<string, unknown>
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
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
<<<<<<< HEAD
  constructor(message: string, details?: Record<string, any>) {
=======
  constructor(message: string, details?: Record<string, unknown>) {
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
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
<<<<<<< HEAD
  constructor(message: string, details?: Record<string, any>) {
=======
  constructor(message: string, details?: Record<string, unknown>) {
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
    super(message, 'CONFLICT', 409, details);
    this.name = 'ConflictError';
  }
}

export class DatabaseError extends AppError {
<<<<<<< HEAD
  constructor(message: string, details?: Record<string, any>) {
=======
  constructor(message: string, details?: Record<string, unknown>) {
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
    super(message, 'DATABASE_ERROR', 500, details);
    this.name = 'DatabaseError';
  }
}

// Error handler utility
<<<<<<< HEAD
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
=======
export function handleSupabaseError(error: unknown, context?: string): never {
  const contextMessage = context ? `${context}: ` : '';
  
  // Type guard for error objects with code property
  const hasCode = (err: unknown): err is { code: string } => {
    return typeof err === 'object' && err !== null && 'code' in err;
  };
  
  // Type guard for error objects with message property
  const hasMessage = (err: unknown): err is { message: string } => {
    return typeof err === 'object' && err !== null && 'message' in err;
  };
  
  if (hasCode(error)) {
    if (error.code === 'PGRST116') {
      throw new NotFoundError('Resource');
    }
    
    if (error.code === '23505') {
      throw new ConflictError(`${contextMessage}Resource already exists`, { originalError: error });
    }
    
    if (error.code === '23503') {
      throw new ValidationError(`${contextMessage}Referenced resource does not exist`, { originalError: error });
    }
    
    if (error.code === '42501') {
      throw new ForbiddenError(`${contextMessage}Insufficient permissions`);
    }
  }
  
  // Generic database error
  const message = hasMessage(error) ? error.message : 'Database operation failed';
  throw new DatabaseError(`${contextMessage}${message}`, { originalError: error });
}

// Utility to check if error is an instance of our custom errors
export function isAppError(error: unknown): error is AppError {
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
  return error instanceof AppError;
}

// Utility to format error for API responses
<<<<<<< HEAD
export function formatErrorResponse(error: any) {
=======
export function formatErrorResponse(error: unknown) {
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
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
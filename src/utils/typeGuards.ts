import type { WorkItem, Sprint } from '../types';

/**
 * Type guard to check if a value is a valid WorkItem
 */
export const isWorkItem = (value: unknown): value is WorkItem => {
  if (!value || typeof value !== 'object') return false;
  
  const item = value as Record<string, unknown>;
  
  // Required fields validation
  const hasRequiredFields = (
    typeof item.id === 'string' &&
    typeof item.projectId === 'string' &&
    typeof item.title === 'string' &&
    typeof item.type === 'string' &&
    typeof item.status === 'string' &&
    typeof item.priority === 'string' &&
    Array.isArray(item.labels) &&
    Array.isArray(item.dependencies) &&
    item.createdAt instanceof Date &&
    item.updatedAt instanceof Date
  );

  if (!hasRequiredFields) return false;

  // Validate enum values
  const validTypes = ['story', 'task', 'bug', 'epic'];
  const validPriorities = ['low', 'medium', 'high', 'critical'];
  
  return (
    validTypes.includes(item.type as string) &&
    validPriorities.includes(item.priority as string) &&
    (item.assigneeId === undefined || typeof item.assigneeId === 'string') &&
    (item.estimate === undefined || typeof item.estimate === 'number') &&
    (item.dueDate === undefined || item.dueDate instanceof Date)
  );
};

/**
 * Type guard to check if a value is a valid Sprint
 */
export const isSprint = (value: unknown): value is Sprint => {
  if (!value || typeof value !== 'object') return false;
  
  const sprint = value as Record<string, unknown>;
  
  return (
    typeof sprint.id === 'string' &&
    typeof sprint.projectId === 'string' &&
    typeof sprint.name === 'string' &&
    typeof sprint.status === 'string' &&
    sprint.startDate instanceof Date &&
    sprint.endDate instanceof Date &&
    Array.isArray(sprint.workItems) &&
    sprint.createdAt instanceof Date
  );
};

/**
 * Safely parse a date string or return null
 */
export const safeParseDate = (dateValue: unknown): Date | null => {
  if (dateValue instanceof Date) return dateValue;
  if (typeof dateValue === 'string') {
    const parsed = new Date(dateValue);
    return isNaN(parsed.getTime()) ? null : parsed;
  }
  return null;
};

/**
 * Type guard for checking if an error is a known error type
 */
export const isKnownError = (error: unknown): error is Error => {
  return error instanceof Error;
};
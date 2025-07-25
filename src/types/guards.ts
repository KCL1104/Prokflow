// Type guard functions for runtime type checking

import type {
  Project,
  WorkItem,
  Sprint,
  Workflow,
  WorkflowState,
  User,
  Comment,
  Attachment,
  TeamMember,
  ApiError,
  ValidationError,
} from './index';

// Basic type guards
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

export function isDate(value: unknown): value is Date {
  return value instanceof Date && !isNaN(value.getTime());
}

export function isArray<T>(value: unknown): value is T[] {
  return Array.isArray(value);
}

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

// Domain-specific type guards
export function isProject(value: unknown): value is Project {
  if (!isObject(value)) return false;
  
  return (
    isString(value.id) &&
    isString(value.name) &&
    isString(value.description) &&
    ['scrum', 'kanban', 'waterfall', 'custom'].includes(value.methodology as string) &&
    isString(value.workflowId) &&
    isString(value.ownerId) &&
    isArray(value.teamMembers) &&
    isObject(value.settings) &&
    isDate(value.createdAt) &&
    isDate(value.updatedAt)
  );
}

export function isWorkItem(value: unknown): value is WorkItem {
  if (!isObject(value)) return false;
  
  return (
    isString(value.id) &&
    isString(value.projectId) &&
    isString(value.title) &&
    isString(value.description) &&
    ['story', 'task', 'bug', 'epic'].includes(value.type as string) &&
    isString(value.status) &&
    ['low', 'medium', 'high', 'critical'].includes(value.priority as string) &&
    isString(value.reporterId) &&
    isArray(value.dependencies) &&
    isArray(value.labels) &&
    isDate(value.createdAt) &&
    isDate(value.updatedAt)
  );
}

export function isSprint(value: unknown): value is Sprint {
  if (!isObject(value)) return false;
  
  return (
    isString(value.id) &&
    isString(value.projectId) &&
    isString(value.name) &&
    isString(value.goal) &&
    isDate(value.startDate) &&
    isDate(value.endDate) &&
    ['planning', 'active', 'completed'].includes(value.status as string) &&
    isNumber(value.capacity) &&
    isArray(value.workItems) &&
    isDate(value.createdAt)
  );
}

export function isWorkflow(value: unknown): value is Workflow {
  if (!isObject(value)) return false;
  
  return (
    isString(value.id) &&
    isString(value.name) &&
    isBoolean(value.isDefault) &&
    isString(value.methodology) &&
    isArray(value.states) &&
    isArray(value.transitions)
  );
}

export function isWorkflowState(value: unknown): value is WorkflowState {
  if (!isObject(value)) return false;
  
  return (
    isString(value.id) &&
    isString(value.name) &&
    ['todo', 'in_progress', 'done'].includes(value.category as string) &&
    isString(value.color)
  );
}

export function isUser(value: unknown): value is User {
  if (!isObject(value)) return false;
  
  return (
    isString(value.id) &&
    isString(value.email) &&
    isString(value.timezone) &&
    isDate(value.createdAt) &&
    isDate(value.updatedAt)
  );
}

export function isTeamMember(value: unknown): value is TeamMember {
  if (!isObject(value)) return false;
  
  return (
    isString(value.id) &&
    isString(value.userId) &&
    isString(value.projectId) &&
    ['owner', 'admin', 'member', 'viewer'].includes(value.role as string) &&
    isDate(value.joinedAt)
  );
}

export function isComment(value: unknown): value is Comment {
  if (!isObject(value)) return false;
  
  return (
    isString(value.id) &&
    isString(value.workItemId) &&
    isString(value.userId) &&
    isString(value.content) &&
    isDate(value.createdAt) &&
    isDate(value.updatedAt)
  );
}

export function isAttachment(value: unknown): value is Attachment {
  if (!isObject(value)) return false;
  
  return (
    isString(value.id) &&
    isString(value.workItemId) &&
    isString(value.userId) &&
    isString(value.filename) &&
    isString(value.filePath) &&
    isNumber(value.fileSize) &&
    isString(value.mimeType) &&
    isDate(value.createdAt)
  );
}

// Error type guards
export function isApiError(error: unknown): error is ApiError {
  if (!isObject(error) || !(error instanceof Error)) return false;
  
  const apiError = error as any;
  return (
    isString(apiError.code) &&
    (typeof apiError.status === 'undefined' || isNumber(apiError.status))
  );
}

export function isValidationError(value: unknown): value is ValidationError {
  if (!isObject(value)) return false;
  
  return (
    isString(value.field) &&
    isString(value.message) &&
    isString(value.code)
  );
}

// Array type guards
export function isProjectArray(value: unknown): value is Project[] {
  return isArray(value) && value.every(isProject);
}

export function isWorkItemArray(value: unknown): value is WorkItem[] {
  return isArray(value) && value.every(isWorkItem);
}

export function isSprintArray(value: unknown): value is Sprint[] {
  return isArray(value) && value.every(isSprint);
}

export function isUserArray(value: unknown): value is User[] {
  return isArray(value) && value.every(isUser);
}

// Utility type guards
export function hasProperty<T extends object, K extends string>(
  obj: T,
  prop: K
): obj is T & Record<K, unknown> {
  return prop in obj;
}

export function hasRequiredProperties<T extends object, K extends keyof T>(
  obj: T,
  props: K[]
): obj is Required<Pick<T, K>> & T {
  return props.every(prop => prop in obj && obj[prop] !== undefined);
}

// Generic validation function
export function validateType<T>(
  value: unknown,
  guard: (value: unknown) => value is T,
  errorMessage?: string
): T {
  if (!guard(value)) {
    throw new Error(errorMessage || `Invalid type: expected ${guard.name}`);
  }
  return value;
}

// Assertion functions
export function assertIsProject(value: unknown): asserts value is Project {
  if (!isProject(value)) {
    throw new Error('Expected Project object');
  }
}

export function assertIsWorkItem(value: unknown): asserts value is WorkItem {
  if (!isWorkItem(value)) {
    throw new Error('Expected WorkItem object');
  }
}

export function assertIsSprint(value: unknown): asserts value is Sprint {
  if (!isSprint(value)) {
    throw new Error('Expected Sprint object');
  }
}

export function assertIsUser(value: unknown): asserts value is User {
  if (!isUser(value)) {
    throw new Error('Expected User object');
  }
}
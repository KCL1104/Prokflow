// Core domain types
export interface Project {
  id: string;
  name: string;
  description: string;
  methodology: 'scrum' | 'kanban' | 'waterfall' | 'custom';
  workflowId: string;
  ownerId: string;
  teamMembers: TeamMember[];
  settings: ProjectSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectSettings {
  sprintDuration?: number; // days
  wipLimits?: Record<string, number>;
  workingDays: number[];
  timezone: string;
  estimationUnit: 'hours' | 'story_points' | 'days';
}

export interface TeamMember {
  id: string;
  userId: string;
  projectId: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  joinedAt: Date;
}

export interface WorkItem {
  id: string;
  projectId: string;
  title: string;
  description: string;
  type: 'story' | 'task' | 'bug' | 'epic';
  status: string; // Dynamic based on workflow
  priority: 'low' | 'medium' | 'high' | 'critical';
  assigneeId?: string;
  reporterId: string;
  estimate?: number;
  actualTime?: number;
  sprintId?: string;
  parentId?: string; // For subtasks
  dependencies: string[];
  labels: string[];
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Sprint {
  id: string;
  projectId: string;
  name: string;
  goal: string;
  startDate: Date;
  endDate: Date;
  status: 'planning' | 'active' | 'completed';
  capacity: number;
  workItems: string[];
  retrospectiveNotes?: string;
  createdAt: Date;
}

export interface Workflow {
  id: string;
  name: string;
  isDefault: boolean;
  methodology: string;
  states: WorkflowState[];
  transitions: WorkflowTransition[];
}

export interface WorkflowState {
  id: string;
  name: string;
  category: 'todo' | 'in_progress' | 'done';
  color: string;
  wipLimit?: number;
}

export interface WorkflowTransition {
  from: string;
  to: string;
  conditions?: TransitionCondition[];
}

export interface TransitionCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains';
  value: any;
}

// API Request/Response types
export interface CreateProjectRequest {
  name: string;
  description: string;
  methodology: Project['methodology'];
  settings?: Partial<ProjectSettings>;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  settings?: Partial<ProjectSettings>;
}

export interface CreateWorkItemRequest {
  projectId: string;
  title: string;
  description: string;
  type: WorkItem['type'];
  priority: WorkItem['priority'];
  assigneeId?: string;
  estimate?: number;
  parentId?: string;
  labels?: string[];
  dueDate?: Date;
}

export interface UpdateWorkItemRequest {
  title?: string;
  description?: string;
  status?: string;
  priority?: WorkItem['priority'];
  assigneeId?: string;
  estimate?: number;
  labels?: string[];
  dueDate?: Date;
}

export interface CreateWorkflowRequest {
  name: string;
  methodology: string;
  states: Omit<WorkflowState, 'id'>[];
  transitions: WorkflowTransition[];
}

// Error handling types
export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
    timestamp: string;
    requestId: string;
  };
}

// Additional API Request/Response types
export interface CreateSprintRequest {
  projectId: string;
  name: string;
  goal?: string;
  startDate: Date;
  endDate: Date;
  capacity?: number;
}

export interface UpdateSprintRequest {
  name?: string;
  goal?: string;
  startDate?: Date;
  endDate?: Date;
  capacity?: number;
  status?: Sprint['status'];
  retrospectiveNotes?: string;
}

export interface AddTeamMemberRequest {
  userId: string;
  role: TeamMember['role'];
}

export interface UpdateTeamMemberRequest {
  role: TeamMember['role'];
}

export interface CreateCommentRequest {
  workItemId: string;
  content: string;
}

export interface UpdateCommentRequest {
  content: string;
}

export interface CreateAttachmentRequest {
  workItemId: string;
  filename: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
}

// API Response wrapper types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form validation utility types
export type ValidationRule<T = any> = {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: T) => string | null;
};

export type ValidationRules<T> = {
  [K in keyof T]?: ValidationRule<T[K]>;
};

export type ValidationErrors<T> = {
  [K in keyof T]?: string;
};

export interface FormState<T> {
  values: T;
  errors: ValidationErrors<T>;
  touched: { [K in keyof T]?: boolean };
  isValid: boolean;
  isSubmitting: boolean;
}

// State management utility types
export type LoadingState = 'idle' | 'loading' | 'succeeded' | 'failed';

export interface AsyncState<T> {
  data: T | null;
  status: LoadingState;
  error: string | null;
}

export interface PaginatedState<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
  status: LoadingState;
  error: string | null;
}

// Filter and sort utility types
export interface FilterOptions {
  search?: string;
  status?: string[];
  assignee?: string[];
  priority?: string[];
  type?: string[];
  labels?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

export interface QueryOptions {
  filters?: FilterOptions;
  sort?: SortOptions;
  pagination?: {
    page: number;
    limit: number;
  };
}

// Enhanced error handling types
export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
    timestamp: string;
    requestId: string;
  };
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ApiError extends Error {
  code: string;
  status?: number;
  details?: Record<string, any>;
  validationErrors?: ValidationError[];
}

// Real-time event types
export interface RealtimeEvent<T = any> {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  record: T;
  old_record?: T;
  timestamp: string;
}

export interface WorkItemEvent extends RealtimeEvent<WorkItem> {
  table: 'work_items';
}

export interface ProjectEvent extends RealtimeEvent<Project> {
  table: 'projects';
}

export interface SprintEvent extends RealtimeEvent<Sprint> {
  table: 'sprints';
}

// Chart and analytics types
export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: number;
    fill?: boolean;
  }[];
}

export interface BurndownData {
  date: string;
  remainingPoints: number;
  idealRemaining: number;
}

export interface VelocityData {
  sprintName: string;
  completedPoints: number;
  committedPoints: number;
  sprintNumber: number;
}

export interface ProjectMetrics {
  totalWorkItems: number;
  completedWorkItems: number;
  averageCycleTime: number;
  averageLeadTime: number;
  throughput: number;
  velocity: VelocityData[];
  burndownData: BurndownData[];
}

export interface TeamMetrics {
  memberId: string;
  memberName: string;
  completedItems: number;
  averageCycleTime: number;
  workload: number;
  utilization: number;
}

// Additional domain types
export interface Comment {
  id: string;
  workItemId: string;
  userId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Attachment {
  id: string;
  workItemId: string;
  userId: string;
  filename: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  createdAt: Date;
}

export interface User {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  timezone: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkItemDependency {
  id: string;
  workItemId: string;
  dependsOnId: string;
  createdAt: Date;
}

// Re-export types from other modules for convenience
export * from './api';
export * from './forms';
export * from './utils';
export * from './guards';
export * from './constants';
export type { Database } from './database';
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
<<<<<<< HEAD
=======
  name: string;
  email: string;
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
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
<<<<<<< HEAD
  value: any;
=======
  value: string | number | boolean | string[];
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
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
<<<<<<< HEAD
  methodology: string;
=======
  methodology: 'scrum' | 'kanban' | 'waterfall' | 'custom';
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
  states: Omit<WorkflowState, 'id'>[];
  transitions: WorkflowTransition[];
}

// Error handling types
export interface ErrorResponse {
  error: {
    code: string;
    message: string;
<<<<<<< HEAD
    details?: Record<string, any>;
=======
    details?: Record<string, unknown>;
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
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

<<<<<<< HEAD
=======
// Standup request types
export interface CreateStandupRequest {
  projectId: string;
  sprintId?: string;
  scheduledDate: Date;
  facilitatorId: string;
  participants: string[];
  duration?: number;
  notes?: string;
}

export interface UpdateStandupRequest {
  scheduledDate?: Date;
  status?: Standup['status'];
  participants?: string[];
  duration?: number;
  notes?: string;
}

export interface CreateStandupParticipationRequest {
  standupId: string;
  yesterday: string;
  today: string;
  blockers: string;
}

export interface UpdateStandupParticipationRequest {
  yesterday?: string;
  today?: string;
  blockers?: string;
  status?: StandupParticipation['status'];
}

>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
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
<<<<<<< HEAD
export type ValidationRule<T = any> = {
=======
export type ValidationRule<T = unknown> = {
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
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
<<<<<<< HEAD
    details?: Record<string, any>;
=======
    details?: Record<string, unknown>;
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
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
<<<<<<< HEAD
  details?: Record<string, any>;
=======
  details?: Record<string, unknown>;
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
  validationErrors?: ValidationError[];
}

// Real-time event types
<<<<<<< HEAD
export interface RealtimeEvent<T = any> {
=======
export interface RealtimeEvent<T = unknown> {
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
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
<<<<<<< HEAD
  avatarUrl?: string;
  timezone: string;
  createdAt: Date;
  updatedAt: Date;
=======
  full_name?: string; // For compatibility with Supabase auth
  avatarUrl?: string;
  avatar_url?: string; // For compatibility with Supabase auth
  timezone: string;
  createdAt: Date;
  updatedAt: Date;
  created_at?: string | null; // For compatibility with Supabase auth
  updated_at?: string | null; // For compatibility with Supabase auth
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
}

export interface WorkItemDependency {
  id: string;
  workItemId: string;
  dependsOnId: string;
  createdAt: Date;
}

<<<<<<< HEAD
=======
// Standup and collaboration types
export interface Standup {
  id: string;
  projectId: string;
  sprintId?: string;
  scheduledDate: Date;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  facilitatorId: string;
  participants: string[]; // User IDs
  duration?: number; // in minutes
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StandupParticipation {
  id: string;
  standupId: string;
  userId: string;
  yesterday: string;
  today: string;
  blockers: string;
  status: 'pending' | 'submitted' | 'skipped';
  submittedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface StandupReminder {
  id: string;
  standupId: string;
  userId: string;
  reminderType: 'initial' | 'follow_up' | 'final';
  scheduledAt: Date;
  sentAt?: Date;
  status: 'pending' | 'sent' | 'failed';
  createdAt: Date;
}

// Retrospective types
export interface Retrospective {
  id: string;
  projectId: string;
  sprintId: string;
  title: string;
  status: 'draft' | 'in_progress' | 'completed';
  facilitatorId: string;
  participants: string[]; // User IDs
  templateId?: string;
  scheduledDate?: Date;
  completedAt?: Date;
  feedback?: RetrospectiveFeedback[];
  actionItems?: RetrospectiveActionItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface RetrospectiveFeedback {
  id: string;
  retrospectiveId: string;
  userId: string;
  category: 'went_well' | 'needs_improvement' | 'action_items';
  content: string;
  votes: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface RetrospectiveActionItem {
  id: string;
  retrospectiveId: string;
  title: string;
  description: string;
  assigneeId?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface RetrospectiveTemplate {
  id: string;
  name: string;
  description: string;
  categories: {
    name: string;
    description: string;
    color: string;
  }[];
  isDefault: boolean;
  createdBy: string;
  createdAt: Date;
}

// Retrospective request types
export interface CreateRetrospectiveRequest {
  projectId: string;
  sprintId: string;
  title: string;
  facilitatorId: string;
  participants?: string[];
  templateId?: string;
  scheduledDate?: Date;
  status?: Retrospective['status'];
}

export interface UpdateRetrospectiveRequest {
  title?: string;
  status?: Retrospective['status'];
  participants?: string[];
  scheduledDate?: Date;
  completedAt?: Date;
}

export interface CreateRetrospectiveFeedbackRequest {
  retrospectiveId: string;
  userId: string;
  category: RetrospectiveFeedback['category'];
  content: string;
}

export interface UpdateRetrospectiveFeedbackRequest {
  content?: string;
  votes?: number;
}

export interface CreateRetrospectiveActionItemRequest {
  retrospectiveId: string;
  title: string;
  description?: string;
  assigneeId?: string;
  priority?: RetrospectiveActionItem['priority'];
  dueDate?: Date;
}

export interface UpdateRetrospectiveActionItemRequest {
  title?: string;
  description?: string;
  assigneeId?: string;
  priority?: RetrospectiveActionItem['priority'];
  status?: RetrospectiveActionItem['status'];
  dueDate?: Date;
}

export interface CreateRetrospectiveTemplateRequest {
  name: string;
  description?: string;
  categories: RetrospectiveTemplate['categories'];
  createdBy: string;
}

>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
// Re-export types from other modules for convenience
export * from './api';
export * from './forms';
export * from './utils';
export * from './guards';
export * from './constants';
<<<<<<< HEAD
export type { Database } from './database';
=======
export * from './realtime';
export type { Database } from './database';
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)

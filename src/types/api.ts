// API-specific types and interfaces

import type { Database } from './database';

// Database table row types (for easier access)
export type ProjectRow = Database['public']['Tables']['projects']['Row'];
export type WorkItemRow = Database['public']['Tables']['work_items']['Row'];
export type SprintRow = Database['public']['Tables']['sprints']['Row'];
export type WorkflowRow = Database['public']['Tables']['workflows']['Row'];
export type WorkflowStateRow = Database['public']['Tables']['workflow_states']['Row'];
export type WorkflowTransitionRow = Database['public']['Tables']['workflow_transitions']['Row'];
export type UserRow = Database['public']['Tables']['users']['Row'];
export type ProjectMemberRow = Database['public']['Tables']['project_members']['Row'];
export type CommentRow = Database['public']['Tables']['comments']['Row'];
export type AttachmentRow = Database['public']['Tables']['attachments']['Row'];

// Database insert types
export type ProjectInsert = Database['public']['Tables']['projects']['Insert'];
export type WorkItemInsert = Database['public']['Tables']['work_items']['Insert'];
export type SprintInsert = Database['public']['Tables']['sprints']['Insert'];
export type WorkflowInsert = Database['public']['Tables']['workflows']['Insert'];
export type WorkflowStateInsert = Database['public']['Tables']['workflow_states']['Insert'];
export type WorkflowTransitionInsert = Database['public']['Tables']['workflow_transitions']['Insert'];
export type UserInsert = Database['public']['Tables']['users']['Insert'];
export type ProjectMemberInsert = Database['public']['Tables']['project_members']['Insert'];
export type CommentInsert = Database['public']['Tables']['comments']['Insert'];
export type AttachmentInsert = Database['public']['Tables']['attachments']['Insert'];

// Database update types
export type ProjectUpdate = Database['public']['Tables']['projects']['Update'];
export type WorkItemUpdate = Database['public']['Tables']['work_items']['Update'];
export type SprintUpdate = Database['public']['Tables']['sprints']['Update'];
export type WorkflowUpdate = Database['public']['Tables']['workflows']['Update'];
export type WorkflowStateUpdate = Database['public']['Tables']['workflow_states']['Update'];
export type WorkflowTransitionUpdate = Database['public']['Tables']['workflow_transitions']['Update'];
export type UserUpdate = Database['public']['Tables']['users']['Update'];
export type ProjectMemberUpdate = Database['public']['Tables']['project_members']['Update'];
export type CommentUpdate = Database['public']['Tables']['comments']['Update'];
export type AttachmentUpdate = Database['public']['Tables']['attachments']['Update'];

// Database enum types
export type MethodologyType = Database['public']['Enums']['methodology_type'];
export type PriorityType = Database['public']['Enums']['priority_type'];
export type ProjectRole = Database['public']['Enums']['project_role'];
export type SprintStatus = Database['public']['Enums']['sprint_status'];
export type WorkItemType = Database['public']['Enums']['work_item_type'];
export type WorkflowStateCategory = Database['public']['Enums']['workflow_state_category'];

// API endpoint response types
export interface ProjectsResponse {
  projects: ProjectRow[];
  total: number;
}

export interface WorkItemsResponse {
  workItems: WorkItemRow[];
  total: number;
}

export interface SprintsResponse {
  sprints: SprintRow[];
  total: number;
}

export interface WorkflowsResponse {
  workflows: WorkflowRow[];
  total: number;
}

export interface ProjectMembersResponse {
  members: (ProjectMemberRow & { user: UserRow })[];
  total: number;
}

export interface CommentsResponse {
  comments: (CommentRow & { user: UserRow })[];
  total: number;
}

export interface AttachmentsResponse {
  attachments: (AttachmentRow & { user: UserRow })[];
  total: number;
}

// API query parameters
export interface ProjectQueryParams {
  search?: string;
  methodology?: MethodologyType[];
  ownerId?: string;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'created_at' | 'updated_at';
  sortOrder?: 'asc' | 'desc';
}

export interface WorkItemQueryParams {
  projectId?: string;
  sprintId?: string;
  assigneeId?: string;
  reporterId?: string;
  status?: string[];
  type?: WorkItemType[];
  priority?: PriorityType[];
  labels?: string[];
  search?: string;
  parentId?: string;
  includeSubtasks?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'title' | 'priority' | 'created_at' | 'updated_at' | 'position';
  sortOrder?: 'asc' | 'desc';
}

export interface SprintQueryParams {
  projectId?: string;
  status?: SprintStatus[];
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'start_date' | 'end_date' | 'created_at';
  sortOrder?: 'asc' | 'desc';
}

// Supabase function return types
export interface SprintVelocityResult {
  velocity: number;
}

export interface WipLimitCheckResult {
  canAdd: boolean;
  currentCount: number;
  limit: number;
}

export interface AvailableTransitionsResult {
  state_name: string;
  state_color: string;
}

export interface ProjectMetricsResult {
  total_work_items: number;
  completed_work_items: number;
  average_cycle_time: number;
  average_lead_time: number;
  throughput: number;
  velocity_data: Array<{
    sprint_name: string;
    completed_points: number;
    committed_points: number;
  }>;
}

export interface SprintBurndownResult {
  date: string;
  remaining_points: number;
  ideal_remaining: number;
}

// File upload types
export interface FileUploadOptions {
  bucket: string;
  path: string;
  file: File;
  upsert?: boolean;
}

export interface FileUploadResult {
  path: string;
  fullPath: string;
  id: string;
}

// Batch operation types
export interface BatchWorkItemUpdate {
  ids: string[];
  updates: Partial<WorkItemUpdate>;
}

export interface BatchWorkItemMove {
  ids: string[];
  sprintId?: string;
  status?: string;
  position?: number;
}

// Real-time subscription types
export interface RealtimeSubscriptionConfig {
  table: string;
  filter?: string;
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
}

export interface RealtimePayload<T = any> {
  commit_timestamp: string;
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: T;
  old: T;
  schema: string;
  table: string;
}

// Note: Avoiding circular imports - these types are defined in index.ts
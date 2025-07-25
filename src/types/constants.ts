// Type-related constants and enums

// Methodology types
export const METHODOLOGY_TYPES = {
  SCRUM: 'scrum',
  KANBAN: 'kanban',
  WATERFALL: 'waterfall',
  CUSTOM: 'custom',
} as const;

export const METHODOLOGY_LABELS = {
  [METHODOLOGY_TYPES.SCRUM]: 'Scrum',
  [METHODOLOGY_TYPES.KANBAN]: 'Kanban',
  [METHODOLOGY_TYPES.WATERFALL]: 'Waterfall',
  [METHODOLOGY_TYPES.CUSTOM]: 'Custom',
} as const;

// Work item types
export const WORK_ITEM_TYPES = {
  STORY: 'story',
  TASK: 'task',
  BUG: 'bug',
  EPIC: 'epic',
} as const;

export const WORK_ITEM_TYPE_LABELS = {
  [WORK_ITEM_TYPES.STORY]: 'User Story',
  [WORK_ITEM_TYPES.TASK]: 'Task',
  [WORK_ITEM_TYPES.BUG]: 'Bug',
  [WORK_ITEM_TYPES.EPIC]: 'Epic',
} as const;

// Priority types
export const PRIORITY_TYPES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const;

export const PRIORITY_LABELS = {
  [PRIORITY_TYPES.LOW]: 'Low',
  [PRIORITY_TYPES.MEDIUM]: 'Medium',
  [PRIORITY_TYPES.HIGH]: 'High',
  [PRIORITY_TYPES.CRITICAL]: 'Critical',
} as const;

export const PRIORITY_COLORS = {
  [PRIORITY_TYPES.LOW]: '#10B981',
  [PRIORITY_TYPES.MEDIUM]: '#F59E0B',
  [PRIORITY_TYPES.HIGH]: '#EF4444',
  [PRIORITY_TYPES.CRITICAL]: '#DC2626',
} as const;

// Project roles
export const PROJECT_ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MEMBER: 'member',
  VIEWER: 'viewer',
} as const;

export const PROJECT_ROLE_LABELS = {
  [PROJECT_ROLES.OWNER]: 'Owner',
  [PROJECT_ROLES.ADMIN]: 'Admin',
  [PROJECT_ROLES.MEMBER]: 'Member',
  [PROJECT_ROLES.VIEWER]: 'Viewer',
} as const;

// Sprint statuses
export const SPRINT_STATUSES = {
  PLANNING: 'planning',
  ACTIVE: 'active',
  COMPLETED: 'completed',
} as const;

export const SPRINT_STATUS_LABELS = {
  [SPRINT_STATUSES.PLANNING]: 'Planning',
  [SPRINT_STATUSES.ACTIVE]: 'Active',
  [SPRINT_STATUSES.COMPLETED]: 'Completed',
} as const;

export const SPRINT_STATUS_COLORS = {
  [SPRINT_STATUSES.PLANNING]: '#6B7280',
  [SPRINT_STATUSES.ACTIVE]: '#3B82F6',
  [SPRINT_STATUSES.COMPLETED]: '#10B981',
} as const;

// Workflow state categories
export const WORKFLOW_STATE_CATEGORIES = {
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  DONE: 'done',
} as const;

export const WORKFLOW_STATE_CATEGORY_LABELS = {
  [WORKFLOW_STATE_CATEGORIES.TODO]: 'To Do',
  [WORKFLOW_STATE_CATEGORIES.IN_PROGRESS]: 'In Progress',
  [WORKFLOW_STATE_CATEGORIES.DONE]: 'Done',
} as const;

// Estimation units
export const ESTIMATION_UNITS = {
  HOURS: 'hours',
  STORY_POINTS: 'story_points',
  DAYS: 'days',
} as const;

export const ESTIMATION_UNIT_LABELS = {
  [ESTIMATION_UNITS.HOURS]: 'Hours',
  [ESTIMATION_UNITS.STORY_POINTS]: 'Story Points',
  [ESTIMATION_UNITS.DAYS]: 'Days',
} as const;

// Loading states
export const LOADING_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCEEDED: 'succeeded',
  FAILED: 'failed',
} as const;

// View modes
export const VIEW_MODES = {
  LIST: 'list',
  BOARD: 'board',
  GANTT: 'gantt',
  CALENDAR: 'calendar',
} as const;

export const VIEW_MODE_LABELS = {
  [VIEW_MODES.LIST]: 'List View',
  [VIEW_MODES.BOARD]: 'Board View',
  [VIEW_MODES.GANTT]: 'Gantt Chart',
  [VIEW_MODES.CALENDAR]: 'Calendar View',
} as const;

// Theme modes
export const THEME_MODES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
} as const;

// Component sizes
export const COMPONENT_SIZES = {
  XS: 'xs',
  SM: 'sm',
  MD: 'md',
  LG: 'lg',
  XL: 'xl',
} as const;

// Component variants
export const COMPONENT_VARIANTS = {
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
  INFO: 'info',
} as const;

// Error codes
export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
} as const;

// API endpoints
export const API_ENDPOINTS = {
  PROJECTS: '/api/projects',
  WORK_ITEMS: '/api/work-items',
  SPRINTS: '/api/sprints',
  WORKFLOWS: '/api/workflows',
  USERS: '/api/users',
  AUTH: '/api/auth',
  UPLOAD: '/api/upload',
} as const;

// Default values
export const DEFAULT_VALUES = {
  PAGE_SIZE: 20,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  DEBOUNCE_DELAY: 300,
  CACHE_TTL: 5 * 60 * 1000, // 5 minutes
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
} as const;

// Validation limits
export const VALIDATION_LIMITS = {
  PROJECT_NAME_MIN: 2,
  PROJECT_NAME_MAX: 100,
  PROJECT_DESCRIPTION_MAX: 500,
  WORK_ITEM_TITLE_MIN: 3,
  WORK_ITEM_TITLE_MAX: 200,
  WORK_ITEM_DESCRIPTION_MAX: 2000,
  SPRINT_NAME_MIN: 2,
  SPRINT_NAME_MAX: 100,
  SPRINT_GOAL_MAX: 500,
  COMMENT_CONTENT_MAX: 1000,
  USER_NAME_MIN: 2,
  USER_NAME_MAX: 100,
  PASSWORD_MIN: 8,
  ESTIMATE_MIN: 0,
  ESTIMATE_MAX: 1000,
  CAPACITY_MIN: 1,
  CAPACITY_MAX: 1000,
} as const;

// Date formats
export const DATE_FORMATS = {
  ISO: 'YYYY-MM-DD',
  DISPLAY: 'MMM DD, YYYY',
  DATETIME: 'MMM DD, YYYY HH:mm',
  TIME: 'HH:mm',
  RELATIVE: 'relative',
} as const;

// Chart colors
export const CHART_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#06B6D4', // Cyan
  '#F97316', // Orange
  '#84CC16', // Lime
  '#EC4899', // Pink
  '#6B7280', // Gray
] as const;

// Working days (0 = Sunday, 1 = Monday, etc.)
export const DEFAULT_WORKING_DAYS = [1, 2, 3, 4, 5] as const;

// File types
export const ALLOWED_FILE_TYPES = {
  IMAGES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  DOCUMENTS: ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  SPREADSHEETS: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  ARCHIVES: ['application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed'],
} as const;

// Keyboard shortcuts
export const KEYBOARD_SHORTCUTS = {
  NEW_PROJECT: 'ctrl+shift+p',
  NEW_WORK_ITEM: 'ctrl+shift+w',
  NEW_SPRINT: 'ctrl+shift+s',
  SEARCH: 'ctrl+k',
  SAVE: 'ctrl+s',
  CANCEL: 'escape',
} as const;
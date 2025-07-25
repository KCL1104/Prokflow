// Utility types for common patterns and operations

// Generic utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Array utility types
export type NonEmptyArray<T> = [T, ...T[]];
export type ArrayElement<T> = T extends (infer U)[] ? U : never;

// Function utility types
export type AsyncFunction<T extends any[], R> = (...args: T) => Promise<R>;
export type EventHandler<T = Event> = (event: T) => void;
export type Callback<T = void> = () => T;

// Date utility types
export type DateString = string; // ISO date string
export type TimeRange = {
  start: Date;
  end: Date;
};

// ID types for type safety
export type ProjectId = string & { readonly brand: unique symbol };
export type WorkItemId = string & { readonly brand: unique symbol };
export type SprintId = string & { readonly brand: unique symbol };
export type UserId = string & { readonly brand: unique symbol };
export type WorkflowId = string & { readonly brand: unique symbol };

// Status types
export type Status = 'idle' | 'loading' | 'success' | 'error';
export type ActionStatus = 'pending' | 'fulfilled' | 'rejected';

// Theme and UI types
export type ThemeMode = 'light' | 'dark' | 'system';
export type ViewMode = 'list' | 'board' | 'gantt' | 'calendar';
export type SidebarState = 'expanded' | 'collapsed' | 'hidden';

// Permission types
export type Permission = 
  | 'project:read'
  | 'project:write'
  | 'project:delete'
  | 'project:admin'
  | 'workitem:read'
  | 'workitem:write'
  | 'workitem:delete'
  | 'sprint:read'
  | 'sprint:write'
  | 'sprint:delete'
  | 'workflow:read'
  | 'workflow:write'
  | 'workflow:delete';

export type RolePermissions = {
  [role in 'owner' | 'admin' | 'member' | 'viewer']: Permission[];
};

// Search and filter types
export type SearchableFields<T> = {
  [K in keyof T]: T[K] extends string | number ? K : never;
}[keyof T];

export type FilterableFields<T> = {
  [K in keyof T]: T[K] extends string | number | boolean | Date ? K : never;
}[keyof T];

export type SortableFields<T> = {
  [K in keyof T]: T[K] extends string | number | Date ? K : never;
}[keyof T];

// Validation utility types
export type ValidatorFunction<T> = (value: T) => string | null;
export type AsyncValidatorFunction<T> = (value: T) => Promise<string | null>;

export interface FieldValidator<T> {
  sync?: ValidatorFunction<T>;
  async?: AsyncValidatorFunction<T>;
  debounceMs?: number;
}

// State machine types
export type StateTransition<S extends string, E extends string> = {
  from: S;
  to: S;
  event: E;
  guard?: () => boolean;
  action?: () => void;
};

export type StateMachine<S extends string, E extends string> = {
  initialState: S;
  states: S[];
  transitions: StateTransition<S, E>[];
};

// Event types
export interface CustomEvent<T = any> {
  type: string;
  payload: T;
  timestamp: number;
  source?: string;
}

export type EventListener<T = any> = (event: CustomEvent<T>) => void;

// Cache types
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export type CacheKey = string;
export type CacheStore<T> = Map<CacheKey, CacheEntry<T>>;

// Retry utility types
export interface RetryOptions {
  maxAttempts: number;
  delay: number;
  backoff?: 'linear' | 'exponential';
  maxDelay?: number;
  shouldRetry?: (error: Error) => boolean;
}

// Debounce and throttle types
export interface DebounceOptions {
  delay: number;
  immediate?: boolean;
}

export interface ThrottleOptions {
  delay: number;
  leading?: boolean;
  trailing?: boolean;
}

// Local storage types
export type StorageKey = string;
export type StorageValue = string | number | boolean | object | null;

export interface StorageOptions {
  serialize?: (value: any) => string;
  deserialize?: (value: string) => any;
  ttl?: number;
}

// URL and routing types
export type RouteParams = Record<string, string>;
export type QueryParams = Record<string, string | string[] | undefined>;

export interface RouteConfig {
  path: string;
  component: React.ComponentType;
  exact?: boolean;
  guards?: Array<() => boolean | Promise<boolean>>;
}

// Component prop types
export type ComponentSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type ComponentVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
export type ComponentPosition = 'top' | 'bottom' | 'left' | 'right';

// Form field types
export type FieldType = 
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'date'
  | 'datetime-local'
  | 'select'
  | 'multiselect'
  | 'textarea'
  | 'checkbox'
  | 'radio'
  | 'file';

export interface FieldOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

// Chart and visualization types
export type ChartType = 'line' | 'bar' | 'pie' | 'doughnut' | 'scatter' | 'area';
export type ChartColor = string;
export type ChartDataPoint = {
  x: number | string | Date;
  y: number;
  label?: string;
};

// Note: Avoiding circular imports - these types are defined in other files
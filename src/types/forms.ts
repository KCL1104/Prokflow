<<<<<<< HEAD
=======
// Re-export ProjectSettings from index for convenience
export type { ProjectSettings } from './index';

>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
export interface WorkItemFormData {
  title: string;
  description: string;
  type: 'story' | 'task' | 'bug' | 'epic';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assigneeId?: string;
  estimate?: number;
  labels: string[];
  dueDate?: string;
  acceptanceCriteria?: string;
  projectId?: string;
}

export interface ProjectFormData {
  name: string;
  description: string;
  methodology: 'scrum' | 'kanban' | 'waterfall' | 'custom';
  settings: {
    sprintDuration?: number;
    wipLimits?: Record<string, number>;
    workingDays: number[];
    timezone: string;
    estimationUnit: 'hours' | 'story_points' | 'days';
  };
}

export type ValidationErrors<T> = Partial<Record<keyof T, string>>;

export interface FormValidationOptions<T> {
  initialData?: Partial<T>;
  validate: (data: T) => ValidationErrors<T>;
}
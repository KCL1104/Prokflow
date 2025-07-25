// Work Item Types
export const WORK_ITEM_TYPES = [
  { value: 'all', label: 'All Items' },
  { value: 'story', label: 'Stories' },
  { value: 'task', label: 'Tasks' },
  { value: 'bug', label: 'Bugs' },
  { value: 'epic', label: 'Epics' }
] as const;

export const WORK_ITEM_TYPE_DETAILS = [
  { value: 'story', label: 'User Story', description: 'A feature from the user perspective', icon: '📖' },
  { value: 'task', label: 'Task', description: 'A specific piece of work to be done', icon: '✓' },
  { value: 'bug', label: 'Bug', description: 'A defect that needs to be fixed', icon: '🐛' },
  { value: 'epic', label: 'Epic', description: 'A large feature that spans multiple stories', icon: '📦' }
] as const;

// Priority Options
export const PRIORITY_OPTIONS = [
  { value: 'all', label: 'All Priorities' },
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' }
] as const;

export const PRIORITY_DETAILS = [
  { value: 'low', label: 'Low', color: 'text-gray-600', bgColor: 'bg-gray-100 text-gray-800 border-gray-200' },
  { value: 'medium', label: 'Medium', color: 'text-yellow-600', bgColor: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  { value: 'high', label: 'High', color: 'text-orange-600', bgColor: 'bg-orange-100 text-orange-800 border-orange-200' },
  { value: 'critical', label: 'Critical', color: 'text-red-600', bgColor: 'bg-red-100 text-red-800 border-red-200' }
] as const;

// Status Options
export const STATUS_OPTIONS = [
  { value: 'To Do', label: 'To Do' },
  { value: 'In Progress', label: 'In Progress' },
  { value: 'Review', label: 'Review' },
  { value: 'Done', label: 'Done' }
] as const;

export const STATUS_DETAILS = [
  { value: 'To Do', label: 'To Do', color: 'bg-gray-100 text-gray-800' },
  { value: 'In Progress', label: 'In Progress', color: 'bg-blue-100 text-blue-800' },
  { value: 'Review', label: 'Review', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'Done', label: 'Done', color: 'bg-green-100 text-green-800' }
] as const;

export const STORY_POINT_OPTIONS = [
  { value: 0, label: '0', description: 'No effort required' },
  { value: 0.5, label: '½', description: 'Minimal effort' },
  { value: 1, label: '1', description: 'Very small' },
  { value: 2, label: '2', description: 'Small' },
  { value: 3, label: '3', description: 'Medium-small' },
  { value: 5, label: '5', description: 'Medium' },
  { value: 8, label: '8', description: 'Large' },
  { value: 13, label: '13', description: 'Very large' },
  { value: 21, label: '21', description: 'Extra large' },
  { value: 34, label: '34', description: 'Too large - consider breaking down' },
  { value: -1, label: '?', description: 'Unknown - needs more information' }
] as const;

export const LARGE_STORY_THRESHOLD = 21;
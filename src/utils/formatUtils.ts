/**
 * Formatting utility functions
 */

export function formatStoryPoints(points: number | undefined): string {
  if (points === undefined) return 'Not estimated';
  return `${points} ${points === 1 ? 'point' : 'points'}`;
}

export function formatPriority(priority: string): string {
  return priority.charAt(0).toUpperCase() + priority.slice(1);
}

export function formatWorkItemType(type: string): string {
  return type.charAt(0).toUpperCase() + type.slice(1);
}

export function formatMethodology(methodology: string): string {
  switch (methodology) {
    case 'scrum':
      return 'Scrum';
    case 'kanban':
      return 'Kanban';
    case 'waterfall':
      return 'Waterfall';
    case 'custom':
      return 'Custom';
    default:
      return methodology;
  }
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${remainingMinutes}m`;
}
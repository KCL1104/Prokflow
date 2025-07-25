/**
 * Date utility functions for the project management platform
 */

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString();
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString();
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function getWorkingDays(startDate: Date, endDate: Date, workingDays: number[] = [1, 2, 3, 4, 5]): number {
  let count = 0;
  const current = new Date(startDate);
  
  while (current <= endDate) {
    if (workingDays.includes(current.getDay())) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }
  
  return count;
}

export function isDateInRange(date: Date, startDate: Date, endDate: Date): boolean {
  return date >= startDate && date <= endDate;
}

export function getDaysDifference(startDate: Date, endDate: Date): number {
  const timeDiff = endDate.getTime() - startDate.getTime();
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
}
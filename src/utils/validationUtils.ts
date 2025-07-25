/**
 * Validation utility functions
 */

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidProjectName(name: string): boolean {
  return name.trim().length >= 3 && name.trim().length <= 100;
}

export function isValidWorkItemTitle(title: string): boolean {
  return title.trim().length >= 1 && title.trim().length <= 200;
}

export function isValidSprintName(name: string): boolean {
  return name.trim().length >= 1 && name.trim().length <= 50;
}

export function isValidDateRange(startDate: Date, endDate: Date): boolean {
  return startDate < endDate;
}

export function isValidStoryPoints(points: number): boolean {
  return points >= 0 && points <= 100 && Number.isInteger(points);
}

export function isValidPassword(password: string): boolean {
  // At least 8 characters, one uppercase, one lowercase, one number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validateProjectData(data: {
  name: string;
  description: string;
}): ValidationResult {
  const errors: string[] = [];
  
  if (!isValidProjectName(data.name)) {
    errors.push('Project name must be between 3 and 100 characters');
  }
  
  if (data.description.trim().length > 500) {
    errors.push('Project description must be less than 500 characters');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}
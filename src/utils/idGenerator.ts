/**
 * Utility functions for generating unique identifiers
 */

/**
 * Generates a UUID v4 compatible string
 * More robust than Math.random() for unique ID generation
 */
export const generateUUID = (): string => {
  // Use crypto.randomUUID if available (modern browsers)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Fallback implementation for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * Generates a short, URL-safe ID for temporary/mock usage
 * Format: timestamp_randomString (e.g., "1703123456789_abc123")
 */
export const generateMockId = (): string => {
  const timestamp = Date.now();
  const randomPart = Math.random().toString(36).substring(2, 9);
  return `mock_${timestamp}_${randomPart}`;
};

/**
 * Generates a human-readable ID with prefix
 * Format: prefix_timestamp_randomString (e.g., "standup_1703123456789_abc123")
 */
export const generatePrefixedId = (prefix: string): string => {
  const timestamp = Date.now();
  const randomPart = Math.random().toString(36).substring(2, 9);
  return `${prefix}_${timestamp}_${randomPart}`;
};
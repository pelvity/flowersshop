import { v4 as uuidv4 } from 'uuid';

/**
 * Checks if a string is a valid UUID
 */
export const isValidUUID = (id: string): boolean => {
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidPattern.test(id);
};

/**
 * Converts a string or number to a UUID format
 * If it's already a valid UUID, returns it unchanged
 * Otherwise creates a deterministic UUID-like string from the input
 */
export const toUUID = (id: string | number): string => {
  // If it's already a proper UUID, return it
  if (typeof id === 'string' && isValidUUID(id)) {
    return id;
  }
  
  // For existing numeric IDs, convert to UUID format
  return `00000000-0000-0000-0000-${id.toString().padStart(12, '0')}`;
};

/**
 * Generate a new UUID
 */
export const generateUUID = (): string => {
  return uuidv4();
}; 
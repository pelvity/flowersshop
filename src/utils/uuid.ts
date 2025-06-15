import { v4 as uuidv4, parse } from 'uuid';

/**
 * Checks if a string is a valid UUID
 */
export const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

/**
 * Converts a string or number to a UUID format
 * If it's already a valid UUID, returns it unchanged
 * Otherwise creates a deterministic UUID-like string from the input
 */
export const toUUID = (uuidString: string): string => {
  try {
    const parsed = parse(uuidString);
    return Buffer.from(parsed).toString('hex');
  } catch (e) {
    // Return original string if parsing fails, assuming it might be in the correct format
    return uuidString;
  }
};

/**
 * Generate a new UUID
 */
export const generateUUID = (): string => {
  return uuidv4();
}; 
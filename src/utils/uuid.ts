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
  // If it's already a valid UUID with dashes, return it as is
  if (isValidUUID(uuidString)) {
    return uuidString;
  }
  
  try {
    // Try to parse it as a UUID without dashes
    const parsed = parse(uuidString);
    // Format it as a standard UUID with dashes
    return [
      parsed.slice(0, 8),
      parsed.slice(8, 12),
      parsed.slice(12, 16),
      parsed.slice(16, 20),
      parsed.slice(20)
    ].join('-');
  } catch (e) {
    // Return original string if parsing fails
    return uuidString;
  }
};

/**
 * Generate a new UUID
 */
export const generateUUID = (): string => {
  return uuidv4();
}; 
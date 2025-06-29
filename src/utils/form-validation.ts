/**
 * Shared form validation utilities
 */

/**
 * Validates an email address format
 */
export const validateEmail = (email: string): boolean => {
  const regex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
  return regex.test(email);
};

/**
 * Validates a phone number format
 * Accepts formats like: +123 456 789, 123-456-7890, (123) 456 7890
 */
export const validatePhone = (phone: string): boolean => {
  // Remove all non-digit characters for comparison
  const cleaned = phone.replace(/\s+/g, '');
  if (cleaned.length < 9) return false;
  
  const regex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{3,6}$/;
  return regex.test(phone.replace(/\s/g, ''));
};

/**
 * Sanitizes phone input by removing any non-digit or non-allowed characters
 * Only allows digits, spaces, plus, parentheses and hyphens
 */
export const sanitizePhoneInput = (value: string): string => {
  // Allow only digits, spaces, +, (), and -
  return value.replace(/[^\d\s+()-]/g, '');
};

/**
 * Validates that text has minimum length
 */
export const validateMinLength = (text: string, minLength: number): boolean => {
  return text.trim().length >= minLength;
};

/**
 * Formats a phone number for display
 * Converts numbers to XXX XXX XXX format
 */
export const formatPhoneNumber = (value: string): string => {
  // Remove all non-digit characters
  const cleaned = value.replace(/\D/g, '');
  
  // Format the number as XXX XXX XXX
  const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
  
  if (match) {
    const formatted = [
      match[1] ? match[1] : '',
      match[2] ? ' ' + match[2] : '',
      match[3] ? ' ' + match[3] : ''
    ].join('').trim();
    
    return formatted;
  }
  
  return value;
};

/**
 * Validates an address has minimum required information
 */
export const validateAddress = (address: string, minLength: number = 5): boolean => {
  return address.trim().length >= minLength;
}; 
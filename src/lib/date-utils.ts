/**
 * Formats a date string according to the specified locale
 * @param dateString - The date string to format
 * @param locale - The locale to use for formatting (e.g., 'en', 'uk')
 * @returns Formatted date string
 */
export function formatDate(dateString: string, locale: string): string {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    
    // Format options for the date
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    };
    
    return new Intl.DateTimeFormat(locale, options).format(date);
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
}

/**
 * Formats a date string with time according to the specified locale
 * @param dateString - The date string to format
 * @param locale - The locale to use for formatting (e.g., 'en', 'uk')
 * @returns Formatted date and time string
 */
export function formatDateTime(dateString: string, locale: string): string {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    
    // Format options for date and time
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    
    return new Intl.DateTimeFormat(locale, options).format(date);
  } catch (error) {
    console.error('Error formatting date and time:', error);
    return dateString;
  }
} 
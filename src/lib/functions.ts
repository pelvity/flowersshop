/**
 * Format a numeric price to a string with currency symbol based on locale
 */
export function formatPrice(price: number, locale = 'pl-PL', currency = 'PLN'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}

/**
 * Get currency code based on locale
 */
export function getCurrencyByLocale(locale: string): string {
  const currencies: Record<string, string> = {
    'pl': 'PLN',
    'en': 'PLN', // Still using PLN as the shop is in Poland
    'uk': 'PLN',
    'ru': 'PLN'
  };
  
  // Extract base locale (e.g., 'en' from 'en-US')
  const baseLocale = locale.split('-')[0];
  return currencies[baseLocale] || 'PLN'; // Default to PLN
}

/**
 * Parse a price string to a number
 */
export function parsePrice(priceString: string): number {
  return parseFloat(priceString.replace(/[^\d.-]/g, ''));
} 
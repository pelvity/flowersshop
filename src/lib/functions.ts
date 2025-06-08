/**
 * Format a numeric price to a string with currency symbol
 */
export function formatPrice(price: number): string {
  return `₴${price.toFixed(0)}`;
}

/**
 * Parse a price string to a number
 */
export function parsePrice(priceString: string): number {
  return parseFloat(priceString.replace(/[^\d.-]/g, ''));
} 
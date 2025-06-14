import { getMessages as getNextIntlMessages } from 'next-intl/server';
import { locales, defaultLocale } from '@config/i18n';

/**
 * Load messages for a given locale
 * This is a compatibility layer for code that was using the old getMessages utility
 */
export async function getMessages(locale: string = defaultLocale) {
  console.log(`[GET_MESSAGES] Compatibility layer called for locale: ${locale}`);
  
  // Validate the locale
  const actualLocale = locales.includes(locale as any) ? locale : defaultLocale;
  
  try {
    // For the default locale, we can return an empty object as no translations are needed
    if (actualLocale === defaultLocale) {
      return {};
    }
    
    // Try to load messages directly from the JSON file
    try {
      const messages = (await import(`../../messages/${actualLocale}.json`)).default;
      console.log(`[GET_MESSAGES] Successfully loaded messages for ${actualLocale} via direct import`);
      return messages;
    } catch (importError) {
      console.error(`[GET_MESSAGES] Direct import failed:`, importError);
      
      // Fallback to next-intl getMessages as a last resort
      const messages = await getNextIntlMessages();
      console.log(`[GET_MESSAGES] Fallback to next-intl getMessages successful`);
      return messages;
    }
  } catch (error) {
    console.error(`[GET_MESSAGES] All attempts to load messages failed:`, error);
    // Return an empty object to prevent further errors
    return {};
  }
} 
import { locales, defaultLocale } from '../../config/i18n';

/**
 * Load messages for a given locale
 */
export async function getMessages(locale: string = defaultLocale) {
  // Validate the locale
  const actualLocale = locales.includes(locale as any) ? locale : defaultLocale;
  
  try {
    // Import the messages
    const messages = (await import(`../../messages/${actualLocale}.json`)).default;
    return messages;
  } catch (error) {
    console.error(`Could not load messages for locale: ${actualLocale}`, error);
    
    // Fallback to default locale if there was an error
    if (actualLocale !== defaultLocale) {
      return getMessages(defaultLocale);
    }
    
    // If we're already at the default locale and it failed, return an empty object
    return {};
  }
} 
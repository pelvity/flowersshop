import {getRequestConfig} from 'next-intl/server';
import {locales, defaultLocale} from '@config/i18n';

export default getRequestConfig(async ({requestLocale}) => {
  // Validate that the incoming `locale` parameter is valid
  let locale = await requestLocale;
  
  // If no locale is found or it's invalid, use the default locale
  if (!locale || !locales.includes(locale as any)) {
    locale = defaultLocale;
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
    timeZone: 'Europe/Kiev',
    now: new Date(),
  };
}); 
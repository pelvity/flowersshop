export const locales = ['en', 'uk', 'ru'] as const;
export const defaultLocale = 'en' as const;
 
export type Locale = (typeof locales)[number]; 
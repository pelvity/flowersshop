'use client';

import { NextIntlClientProvider } from 'next-intl';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { locales, defaultLocale } from '../../config/i18n';

interface I18nProviderProps {
  children: React.ReactNode;
  locale?: string;
  messages?: Record<string, any>;
}

export default function I18nProvider({ 
  children,
  locale = defaultLocale,
  messages 
}: I18nProviderProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  
  // Detect if the component is mounted to avoid hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  // If not mounted, render children without provider to avoid hydration mismatch
  if (!mounted) {
    return <>{children}</>;
  }

  // Use valid locale or default to 'en'
  const currentLocale = locales.includes(locale as any) ? locale : defaultLocale;
  
  return (
    <NextIntlClientProvider locale={currentLocale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
} 
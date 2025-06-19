'use client';

import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import { locales } from '../../config/i18n';

export default function LanguageSwitcher() {
  const t = useTranslations('LanguageSwitcher');
  
  // Skip translation for invalid locales
  const safeTitle = (locale: string) => {
    try {
      return t('title', { locale });
    } catch (error) {
      return `Switch to ${locale.toUpperCase()}`;
    }
  };
  
  const safeAriaLabel = (locale: string) => {
    try {
      return t('ariaLabel', { locale });
    } catch (error) {
      return `Switch language to ${locale.toUpperCase()}`;
    }
  };
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [mounted, setMounted] = useState(false);
  
  // Only show language switcher after component is mounted to avoid hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) return null;
  
  function onSelectChange(newLocale: string) {
    startTransition(() => {
      // Regular expression to remove the locale prefix
      const newPath = pathname.replace(/^\/(en|uk|ru|pl)/, '');
      router.replace(`/${newLocale}${newPath}`);
    });
  }
  
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600">
        {(() => {
          try {
            return t('label');
          } catch (error) {
            return 'Language';
          }
        })()}:
      </span>
      {locales.map((loc) => (
        <button
          key={loc}
          onClick={() => onSelectChange(loc)}
          disabled={isPending}
          className={`px-2 py-1 text-xs rounded ${
            locale === loc ? 'bg-pink-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
          }`}
          aria-label={safeAriaLabel(loc)}
          title={safeTitle(loc)}
        >
          {loc.toUpperCase()}
        </button>
      ))}
    </div>
  );
} 
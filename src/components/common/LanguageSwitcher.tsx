'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useTransition, useState } from 'react';
import { locales } from '../../../config/i18n';

interface LanguageOption {
  value: string;
  label: string;
  flag: string;
}

const languageOptions: LanguageOption[] = [
  { value: 'en', label: 'English', flag: '🇬🇧' },
  { value: 'uk', label: 'Українська', flag: '🇺🇦' },
  { value: 'ru', label: 'Русский', flag: '🇷🇺' }
];

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  
  // Extract current locale from pathname
  const currentPathname = pathname || '';
  const currentLocale = locales.find(locale => 
    currentPathname.startsWith(`/${locale}/`) || currentPathname === `/${locale}`
  ) || 'en';
  
  // Get the selected language option
  const selectedOption = languageOptions.find(option => option.value === currentLocale) || languageOptions[0];
  
  // Handle language change
  const handleLanguageChange = (locale: string) => {
    setIsOpen(false);
    
    // Get the path without the locale prefix
    let newPath = currentPathname;
    for (const loc of locales) {
      if (currentPathname.startsWith(`/${loc}/`)) {
        newPath = currentPathname.substring(loc.length + 2); // Remove /{locale}/ from the beginning
        break;
      } else if (currentPathname === `/${loc}`) {
        newPath = '/';
        break;
      }
    }
    
    // Add the new locale prefix if it's not the default locale
    const newPathWithLocale = locale === 'en' ? newPath : `/${locale}${newPath === '/' ? '' : newPath}`;
    
    startTransition(() => {
      router.push(newPathWithLocale);
    });
  };
  
  return (
    <div className="relative">
      <button
        type="button"
        className="inline-flex items-center gap-x-1 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-50 px-3 py-2"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span className="mr-1">{selectedOption.flag}</span>
        <span>{selectedOption.label}</span>
        <svg
          className={`h-5 w-5 ${isOpen ? 'rotate-180' : ''} transition-transform`}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      
      {isOpen && (
        <div className="absolute right-0 z-10 mt-2 w-40 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            {languageOptions.map((option) => (
              <button
                key={option.value}
                className={`block px-4 py-2 text-sm w-full text-left ${
                  option.value === currentLocale 
                    ? 'bg-gray-100 text-gray-900' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => handleLanguageChange(option.value)}
                disabled={isPending}
              >
                <span className="mr-2">{option.flag}</span>
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 
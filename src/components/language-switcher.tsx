'use client';

import { useLanguage } from '@/context/language-context';

export default function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage();
  
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600">{t('language')}:</span>
      <button 
        className={`px-2 py-1 text-xs rounded ${language === 'uk' ? 'bg-pink-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
        onClick={() => setLanguage('uk')}
      >
        UA
      </button>
      <button 
        className={`px-2 py-1 text-xs rounded ${language === 'en' ? 'bg-pink-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
        onClick={() => setLanguage('en')}
      >
        EN
      </button>
    </div>
  );
} 
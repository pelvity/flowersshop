'use client';

import { useTranslations } from 'next-intl';

export default function CatalogHeader() {
  const t = useTranslations();

  return (
    <div className="text-center mb-12">
      <h1 className="text-4xl font-extrabold text-pink-700 mb-4">{t('catalog.ourCollection')}</h1>
      <p className="text-xl text-pink-400 max-w-3xl mx-auto">
        {t('catalog.browseSelection')}
      </p>
    </div>
  );
} 

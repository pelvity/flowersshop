'use client';

import { useTranslations } from 'next-intl';

export default function CatalogPage() {
  const t = useTranslations();
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Catalog</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Placeholder for catalog items */}
        <div className="p-4 border rounded-lg shadow-sm">
          <div className="h-48 bg-gray-200 rounded-md mb-4"></div>
          <h3 className="font-medium">Product Example</h3>
          <p className="text-gray-600">$19.99</p>
          <button className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md">
            {t('common.buttons.add_to_cart')}
          </button>
        </div>
      </div>
    </div>
  );
} 
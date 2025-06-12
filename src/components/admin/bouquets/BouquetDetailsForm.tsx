'use client';

import { useTranslations } from 'next-intl';

type BouquetDetailsFormProps = {
  bouquet: {
    name: string;
    price: string;
    discount_price: string;
    description: string;
    category_id: string;
    in_stock: boolean;
    featured: boolean;
  };
  categories: Array<{ id: string; name: string }>;
  submitting: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
};

export default function BouquetDetailsForm({ 
  bouquet, 
  categories, 
  submitting, 
  onChange 
}: BouquetDetailsFormProps) {
  const t = useTranslations('admin');

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">{t('bouquets.details')}</h2>
      
      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
        <div className="sm:col-span-4">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            {t('common.name')} *
          </label>
          <div className="mt-1">
            <input
              type="text"
              name="name"
              id="name"
              required
              value={bouquet.name}
              onChange={onChange}
              disabled={submitting}
              className="shadow-sm focus:ring-pink-500 focus:border-pink-500 block w-full sm:text-sm border-gray-300 rounded-md"
            />
          </div>
        </div>
        
        <div className="sm:col-span-6">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            {t('common.description')}
          </label>
          <div className="mt-1">
            <textarea
              id="description"
              name="description"
              rows={3}
              value={bouquet.description || ''}
              onChange={onChange}
              disabled={submitting}
              className="shadow-sm focus:ring-pink-500 focus:border-pink-500 block w-full sm:text-sm border-gray-300 rounded-md"
            />
          </div>
        </div>
        
        <div className="sm:col-span-2">
          <label htmlFor="price" className="block text-sm font-medium text-gray-700">
            {t('common.price')} *
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">$</span>
            </div>
            <input
              type="number"
              name="price"
              id="price"
              required
              min="0"
              step="0.01"
              value={bouquet.price}
              onChange={onChange}
              disabled={submitting}
              className="focus:ring-pink-500 focus:border-pink-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
            />
          </div>
        </div>
        
        <div className="sm:col-span-2">
          <label htmlFor="discount_price" className="block text-sm font-medium text-gray-700">
            {t('common.discountPrice')}
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">$</span>
            </div>
            <input
              type="number"
              name="discount_price"
              id="discount_price"
              min="0"
              step="0.01"
              value={bouquet.discount_price}
              onChange={onChange}
              disabled={submitting}
              className="focus:ring-pink-500 focus:border-pink-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
            />
          </div>
        </div>
        
        <div className="sm:col-span-2">
          <label htmlFor="category_id" className="block text-sm font-medium text-gray-700">
            {t('common.category')}
          </label>
          <div className="mt-1">
            <select
              id="category_id"
              name="category_id"
              value={bouquet.category_id}
              onChange={onChange}
              disabled={submitting}
              className="shadow-sm focus:ring-pink-500 focus:border-pink-500 block w-full sm:text-sm border-gray-300 rounded-md"
            >
              <option value="">{t('common.selectCategory')}</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="sm:col-span-3">
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="in_stock"
                name="in_stock"
                type="checkbox"
                checked={bouquet.in_stock}
                onChange={onChange}
                disabled={submitting}
                className="focus:ring-pink-500 h-4 w-4 text-pink-600 border-gray-300 rounded"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="in_stock" className="font-medium text-gray-700">
                {t('common.inStock')}
              </label>
            </div>
          </div>
        </div>
        
        <div className="sm:col-span-3">
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="featured"
                name="featured"
                type="checkbox"
                checked={bouquet.featured}
                onChange={onChange}
                disabled={submitting}
                className="focus:ring-pink-500 h-4 w-4 text-pink-600 border-gray-300 rounded"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="featured" className="font-medium text-gray-700">
                {t('common.featured')}
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Category } from '@/lib/supabase';
import { useTranslations } from 'next-intl';

interface CategoryFormProps {
  category?: Category;
  isEdit?: boolean;
  onSubmit?: (formData: { name: string; description: string }) => Promise<void>;
}

export default function CategoryForm({ category, isEdit = false, onSubmit }: CategoryFormProps) {
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split('/')[1]; // Extract locale from URL path
  const t = useTranslations('admin');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: category?.name || '',
    description: category?.description || '',
  });

  // Update form data when category prop changes
  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        description: category.description || '',
      });
    }
  }, [category]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // If onSubmit prop is provided, use it
      if (onSubmit) {
        await onSubmit(formData);
        return;
      }
      
      // Otherwise handle the submission internally
      const supabase = createClient();
      
      if (isEdit && category) {
        // Update existing category
        const { error: updateError } = await supabase
          .from('categories')
          .update({
            name: formData.name,
            description: formData.description,
          })
          .eq('id', category.id);
        
        if (updateError) throw updateError;
      } else {
        // Create new category
        const { error: createError } = await supabase
          .from('categories')
          .insert([
            {
              name: formData.name,
              description: formData.description,
            },
          ]);
        
        if (createError) throw createError;
      }
      
      // Navigate back to the categories list with locale
      router.push(`/${locale}/admin/categories`);
      router.refresh();
    } catch (err: any) {
      console.error('Error saving category:', err);
      setError(err.message || t('categories.errorSaving'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="md:grid md:grid-cols-3 md:gap-6">
        <div className="md:col-span-1">
          <div className="px-4 sm:px-0">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              {isEdit ? t('categories.edit') : t('categories.createNew')}
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              {isEdit 
                ? t('categories.editDescription') 
                : t('categories.createDescription')}
            </p>
          </div>
        </div>
        <div className="mt-5 md:mt-0 md:col-span-2">
          <form onSubmit={handleSubmit}>
            <div className="shadow sm:rounded-md sm:overflow-hidden">
              <div className="px-4 py-5 bg-white space-y-6 sm:p-6">
                {error && (
                  <div className="rounded-md bg-red-50 p-4">
                    <div className="flex">
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">{t('common.error')}</h3>
                        <div className="mt-2 text-sm text-red-700">
                          <p>{error}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    {t('categories.name')} *
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    required
                    className="mt-1 focus:ring-pink-500 focus:border-pink-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  />
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    {t('categories.description')}
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    className="mt-1 focus:ring-pink-500 focus:border-pink-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    placeholder={t('categories.descriptionPlaceholder')}
                    value={formData.description || ''}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              
              <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                <button
                  type="button"
                  className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 mr-3 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                  onClick={() => router.push(`/${locale}/admin/categories`)}
                  disabled={isSubmitting}
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                  disabled={isSubmitting}
                >
                  {isSubmitting 
                    ? t('common.saving') 
                    : isEdit 
                      ? t('categories.update') 
                      : t('categories.create')}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 
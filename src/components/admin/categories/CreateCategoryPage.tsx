'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import CategoryForm from '../CategoryForm';
import { useTranslations } from 'next-intl';
import MediaUploader from '../shared/MediaUploader';
import { CategoryMediaRepository } from '@/lib/repositories/category-media-repository';
import { generateUUID } from '@/utils/uuid';
import { ArrowLeft, Save, Plus } from 'lucide-react';
import Link from 'next/link';

export default function CreateCategoryPage({ locale }: { locale: string }) {
  const t = useTranslations('admin');
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [media, setMedia] = useState<any[]>([]);
  const [categoryCreated, setCategoryCreated] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [tempCategoryId, setTempCategoryId] = useState<string>(generateUUID());

  // Handle form submission in this component
  const handleCreateCategory = async (formData: {
    name: string;
    description: string;
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      
      // Use the pre-generated UUID for the new category
      const newCategoryId = tempCategoryId;
      
      // Create new category
      const { data, error: createError } = await supabase
        .from('categories')
        .insert([
          {
            id: newCategoryId,
            name: formData.name,
            description: formData.description,
          },
        ])
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      // Set the category ID for media uploads
      setCategoryId(newCategoryId);
      setCategoryName(formData.name);
      setCategoryCreated(true);
      
      // Don't redirect yet - allow user to add media first
    } catch (err: any) {
      console.error('Error creating category:', err);
      setError(err.message || t('categories.errorCreating'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleMediaChange = (newMedia: any[]) => {
    setMedia(newMedia);
  };

  const handleFinish = () => {
    router.push(`/${locale}/admin/categories`);
    router.refresh();
  };

  if (error) {
    return (
      <div className="container mx-auto py-4 sm:py-8">
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mx-4 sm:mx-0">
          <p>{t('common.error')}: {error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            {t('common.retry')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-4 sm:py-8">
      <div className="flex items-center mb-6 px-4 sm:px-0">
        <Link href={`/${locale}/admin/categories`} className="mr-4 text-gray-500 hover:text-gray-700">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{t('categories.createNew')}</h1>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center my-8">
          <div className="text-center">
            <div className="spinner border-t-4 border-pink-500 border-solid rounded-full w-12 h-12 animate-spin"></div>
            <p className="mt-2 text-gray-600">{t('common.loading')}</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6 sm:space-y-8">
        {!categoryCreated ? (
            <>
              <div className="px-4 sm:px-0">
                <div className="bg-white shadow rounded-lg p-4 sm:p-6">
            <CategoryForm 
              isEdit={false} 
              onSubmit={handleCreateCategory}
            />
          </div>
              </div>
              
              <div className="bg-white shadow rounded-lg p-4 sm:p-6 mx-4 sm:mx-0">
                <div className="mb-4 p-4 rounded-md bg-blue-50 border border-blue-300">
                  <h3 className="text-sm font-medium text-blue-800 mb-1">{t('common.note')}</h3>
                  <p className="text-sm text-blue-700">
                    {t('categories.mediaUploadNote') || "You'll be able to upload media after creating the category. Complete the form above first."}
                  </p>
                </div>
                
                <div className="opacity-50 pointer-events-none">
                  <MediaUploader
                    entityType="categories"
                    entityId={tempCategoryId}
                    media={[]}
                    onMediaChange={() => {}}
                  />
                </div>
              </div>
            </>
        ) : (
            <>
              <div className="bg-green-50 p-4 rounded-lg mx-4 sm:mx-0">
            <h2 className="text-xl font-semibold text-green-800 mb-2">
              {t('categories.createSuccess')}
            </h2>
            <p className="text-green-700 mb-4">
              {t('categories.categoryCreated')}: <strong>{categoryName}</strong>
            </p>
            <p className="text-sm text-green-600 mb-4">
              {t('categories.addMediaPrompt')}
            </p>
          </div>
        
        {categoryId && (
                <div className="bg-white shadow rounded-lg p-4 sm:p-6 mx-4 sm:mx-0">
                  <h2 className="text-lg font-semibold mb-4">{t('media.categoryMedia')}</h2>
            <MediaUploader
              entityType="categories"
              entityId={categoryId}
              media={media}
              onMediaChange={handleMediaChange}
            />
          </div>
              )}
              
              <div className="flex justify-end px-4 sm:px-0">
                <button
                  onClick={handleFinish}
                  className="inline-flex items-center justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  {t('categories.finishAndReturn')}
                </button>
              </div>
            </>
        )}
      </div>
      )}
    </div>
  );
} 
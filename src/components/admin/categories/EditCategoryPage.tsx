'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import CategoryForm from '../CategoryForm';
import { useTranslations } from 'next-intl';
import MediaUploader from '../shared/MediaUploader';
import { CategoryMediaRepository } from '@/lib/repositories/category-media-repository';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

export default function EditCategoryPage({ id, locale }: { id: string; locale: string }) {
  const t = useTranslations('admin');
  const router = useRouter();
  const [category, setCategory] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [media, setMedia] = useState<any[]>([]);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const categoryMediaRepo = new CategoryMediaRepository();

  useEffect(() => {
    const fetchCategory = async () => {
      setIsLoading(true);
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          throw error;
        }

        setCategory(data);

        // Fetch media for this category
        const mediaItems = await categoryMediaRepo.getMediaForCategory(id);
        setMedia(mediaItems);
      } catch (err: any) {
        console.error('Error fetching category:', err);
        setError(err.message || t('categories.errorFetching'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategory();
  }, [id, t]);

  const handleSubmit = async (formData: {
    name: string;
    description: string;
  }) => {
    setIsSaving(true);
    setError(null);

    try {
      const supabase = createClient();
      
      // Update category
      const { error: updateError } = await supabase
        .from('categories')
        .update({
          name: formData.name,
          description: formData.description,
        })
        .eq('id', id);

      if (updateError) {
        throw updateError;
      }

      // Show success message
      setSaveSuccess(true);
      
      // Update local category state
      setCategory({
        ...category,
        name: formData.name,
        description: formData.description
      });
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (err: any) {
      console.error('Error updating category:', err);
      setError(err.message || t('categories.errorUpdating'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleMediaChange = (newMedia: any[]) => {
    setMedia(newMedia);
  };
  
  const handleThumbnailChange = (thumbnailUrl: string) => {
    // Update category with thumbnail URL if needed
    console.log('Thumbnail changed:', thumbnailUrl);
  };

  const deleteMedia = async (mediaId: string) => {
    try {
      console.log('Deleting media with ID:', mediaId);
      const success = await categoryMediaRepo.delete(mediaId);
      
      if (success) {
        console.log('Media deleted successfully');
        setMedia(media.filter(item => item.id !== mediaId));
      } else {
        console.error('Failed to delete media');
        setError(t('media.deleteFailed'));
      }
    } catch (err: any) {
      console.error('Error deleting media:', err);
      setError(err.message || t('media.deleteFailed'));
    }
  };

  const setMediaAsThumbnail = async (mediaId: string) => {
    console.log('Setting media as thumbnail:', mediaId);
    // Implement if needed
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="spinner border-t-4 border-pink-500 border-solid rounded-full w-12 h-12 animate-spin mb-3"></div>
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!category) {
    return <div className="p-4">{t('categories.notFound')}</div>;
  }

  return (
    <div className="container mx-auto py-4 sm:py-8">
      <div className="flex items-center mb-6 px-4 sm:px-0">
        <Link href={`/${locale}/admin/categories`} className="mr-4 text-gray-500 hover:text-gray-700">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
          {t('categories.edit')}: {category.name}
        </h1>
      </div>
      
      {error && (
        <div className="mb-6 p-4 rounded-md bg-red-50 border border-red-300 mx-4 sm:mx-0">
          <p className="text-red-800">{error}</p>
        </div>
      )}
      
      {saveSuccess && (
        <div className="mb-6 p-4 rounded-md bg-green-50 border border-green-300 mx-4 sm:mx-0">
          <p className="text-green-800">{t('categories.updateSuccess')}</p>
        </div>
      )}
      
      <form onSubmit={(e) => {
        e.preventDefault();
        handleSubmit({
          name: category.name,
          description: category.description || ''
        });
      }} className="space-y-6 sm:space-y-8">
        <div className="px-4 sm:px-0">
          <div className="bg-white shadow rounded-lg p-4 sm:p-6">
          <CategoryForm 
            category={category}
            isEdit={true}
              onSubmit={(formData) => {
                setCategory({
                  ...category,
                  ...formData
                });
                return Promise.resolve();
              }}
          />
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-4 sm:p-6 mx-4 sm:mx-0">
          <h2 className="text-lg font-semibold mb-4">{t('media.categoryMedia')}</h2>
          <MediaUploader
            entityType="categories"
            entityId={id}
            media={media}
            onMediaChange={handleMediaChange}
            onThumbnailChange={handleThumbnailChange}
            onDelete={deleteMedia}
            onSetThumbnail={setMediaAsThumbnail}
          />
        </div>
        
        <div className="flex flex-col sm:flex-row justify-end px-4 sm:px-0 gap-3">
          <Link
            href={`/${locale}/admin/categories`}
            className="w-full sm:w-auto bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 text-center"
          >
            {t('common.cancel')}
          </Link>
          <button
            type="submit"
            disabled={isSaving}
            className="w-full sm:w-auto inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
          >
            {isSaving ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {t('common.saving')}
              </>
            ) : (
              <>
                <Save size={16} className="mr-2" />
                {t('common.save')}
              </>
            )}
          </button>
      </div>
      </form>
    </div>
  );
} 
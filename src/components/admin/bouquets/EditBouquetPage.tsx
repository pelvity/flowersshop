'use client';

import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useBouquetData } from '@/hooks/useBouquetData';
import { useBouquetForm } from '@/hooks/useBouquetForm';
import BouquetDetailsForm from './BouquetDetailsForm';
import BouquetFlowersForm from './BouquetFlowersForm';
import BouquetMediaUploader from './BouquetMediaUploader';
import BouquetTagsManager from './BouquetTagsManager';

export default function ClientBouquetEditPage({ id, locale }: { id: string; locale: string }) {
  const t = useTranslations('admin');
  
  // Use the custom hook to fetch and manage bouquet data
  const {
    bouquet,
    setBouquet,
    categories,
    availableFlowers,
    loading,
    error,
    setError
  } = useBouquetData(id);
        
  // Use the form hook to handle form operations
  const {
    submitting,
    handleChange,
    handleSubmit,
    addFlower,
    updateFlowerQuantity,
    removeFlower,
    handleMediaChange,
    handleThumbnailChange,
    deleteMedia,
    setMediaAsThumbnail
  } = useBouquetForm(id, bouquet, setBouquet, setError, locale, availableFlowers);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="spinner border-t-4 border-pink-500 border-solid rounded-full w-12 h-12 animate-spin mb-3"></div>
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center mb-6">
        <Link href={`/${locale}/admin/bouquets`} className="mr-4 text-gray-500 hover:text-gray-700">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{t('bouquets.edit')}</h1>
      </div>
      
      {error && (
        <div className="mb-6 p-4 rounded-md bg-red-50 border border-red-300">
          <p className="text-red-800">{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Bouquet Details Section */}
        <BouquetDetailsForm
          bouquet={bouquet}
          categories={categories}
          submitting={submitting}
                    onChange={handleChange}
        />
        
        {/* Flowers Section */}
        <BouquetFlowersForm
          flowers={bouquet.flowers}
          availableFlowers={availableFlowers}
          submitting={submitting}
          onAddFlower={addFlower}
          onUpdateQuantity={updateFlowerQuantity}
          onRemoveFlower={removeFlower}
        />
        
        {/* Tags Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('tags.title')}</h3>
          <BouquetTagsManager bouquetId={id} initialTags={bouquet.tags} />
        </div>
        
        {/* Media Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <BouquetMediaUploader 
            bouquetId={id}
            media={bouquet.media}
            onMediaChange={handleMediaChange}
            onThumbnailChange={handleThumbnailChange}
            onDelete={deleteMedia}
            onSetThumbnail={setMediaAsThumbnail}
          />
        </div>
        
        <div className="flex justify-end">
          <Link
            href={`/${locale}/admin/bouquets`}
            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 mr-3"
          >
            {t('common.cancel')}
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
          >
            {submitting ? (
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
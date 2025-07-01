'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, X } from 'lucide-react';
import Link from 'next/link';
import { createLoggingClient } from '@/utils/supabase-logger';
import { ApiLogger } from '@/utils/api-logger';
import { FlowerRepository, Flower } from '@/lib/supabase';
import { ColorRepository } from '@/lib/repositories/color-repository';
import { Color } from '@/lib/repositories/repository-types';
import MediaUploader, { MediaItem } from '@/components/admin/shared/MediaUploader';
import { getFileUrl } from '@/utils/cloudflare-worker';

// Create a logger for this component
const logger = new ApiLogger('EditFlowerPage');

// Define type for Supabase category
type Category = {
  id: string;
  name: string;
  description: string | null;
};

// Define our extended flower type to match component needs
type FlowerData = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  in_stock: boolean;
  low_stock_threshold: number;
  scientific_name?: string | null;
  is_available?: boolean;
  category_id?: string | null;
  image_url?: string | null;
  image_path?: string | null;
  created_at: string;
  updated_at: string;
};

// Define type for color with translation
type ColorWithTranslation = Color & {
  translated_name: string;
};

// Convert from Flower to FlowerData
function adaptFlower(flower: Flower): FlowerData {
  return {
    ...flower,
    in_stock: flower.in_stock > 0
  };
}

export default function ClientFlowerEditPage({ id, locale }: { id: string; locale: string }) {
  const t = useTranslations('admin');
  const router = useRouter();
  
  const [flower, setFlower] = useState<FlowerData | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [availableColors, setAvailableColors] = useState<ColorWithTranslation[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch flower data, categories, and colors
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      const startTime = logger.request('GET', `flower/${id}`);
      
      try {
        const supabase = createLoggingClient();
        
        // Use FlowerRepository to get the flower
        const flowerData = await FlowerRepository.getById(id).catch(err => {
          throw new Error(`Failed to fetch flower: ${err.message}`);
        });
        
        if (!flowerData) {
          throw new Error("Flower not found");
        }
        
        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*')
          .order('name');
        
        if (categoriesError) throw categoriesError;
        
        // Fetch colors with translations
        const colorRepo = new ColorRepository();
        const colorsData = await colorRepo.getAllWithTranslations(locale);
        
        // Fetch flower colors
        const flowerColors = await colorRepo.getColorsForFlower(id);
        const flowerColorIds = flowerColors.map(color => color.id);
        
        // Fetch flower media
        const { data: mediaData, error: mediaError } = await supabase
          .from('flower_media')
          .select('*')
          .eq('flower_id', id)
          .order('display_order');
          
        if (mediaError) throw mediaError;
        
        // Process media items to add URLs
        const processedMedia = (mediaData || []).map((item: any) => ({
          ...item,
          file_url: item.file_url || (item.file_path ? getFileUrl(item.file_path) : null),
          media_type: item.media_type || 'image'
        }));
        
        // Convert to our component's data format
        const adaptedFlower = adaptFlower(flowerData);
        setFlower(adaptedFlower);
        setSelectedColors(flowerColorIds);
        setCategories(categoriesData || []);
        setAvailableColors(colorsData);
        setMedia(processedMedia);
        
        logger.response('GET', `flower/${id}`, 200, startTime);
      } catch (err) {
        logger.error('GET', `flower/${id}`, err);
        console.error('Error fetching flower data:', err);
        setError('Failed to load flower data. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [id, locale]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const startTime = logger.request('PUT', `flower/${id}`);
    
    try {
      if (!flower) throw new Error("No flower data to update");
      
      // Use FlowerRepository to update the flower
      await FlowerRepository.update(id, {
        name: flower.name,
        price: flower.price,
        description: flower.description,
        in_stock: flower.in_stock ? 1 : 0, // Convert boolean back to number
      });
      
      // If we have a thumbnail, update the flower's thumbnail via separate API
      if (flower.image_url || flower.image_path) {
        try {
          await fetch(`/api/admin/flowers/${id}/thumbnail`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              image_url: flower.image_url,
              image_path: flower.image_path,
            }),
          });
        } catch (thumbnailErr) {
          console.error('Error updating flower thumbnail:', thumbnailErr);
          // Continue anyway as this is non-critical
        }
      }
      
      // Update flower colors
      const colorRepo = new ColorRepository();
      await colorRepo.setColorsForFlower(id, selectedColors);
      
      logger.response('PUT', `flower/${id}`, 200, startTime);
      
      // Show success message
      alert(t('flowers.updateSuccess'));
      
      // Navigate back to flowers list
      router.push(`/${locale}/admin/flowers`);
    } catch (err) {
      logger.error('PUT', `flower/${id}`, err);
      console.error('Error updating flower:', err);
      setError('Failed to update flower. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    if (!flower) return;
    
    if (type === 'checkbox') {
      setFlower({
        ...flower,
        [name === 'is_available' ? 'in_stock' : name]: (e.target as HTMLInputElement).checked
      });
    } else if (name === 'price') {
      // Ensure price is a valid number
      const numValue = parseFloat(value) || 0;
      setFlower({
        ...flower,
        [name]: numValue
      });
    } else {
      setFlower({
        ...flower,
        [name]: value === '' ? null : value
      });
    }
  };

  const handleColorSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const colorId = e.target.value;
    if (colorId && !selectedColors.includes(colorId)) {
      setSelectedColors([...selectedColors, colorId]);
    }
  };

  const handleRemoveColor = (colorId: string) => {
    setSelectedColors(selectedColors.filter(id => id !== colorId));
  };
  
  // Handle media deletion
  const handleDeleteMedia = async (mediaId: string) => {
    try {
      const response = await fetch(`/api/admin/flowers/media?id=${mediaId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete media: ${response.statusText}`);
      }
      
      // Remove from state
      setMedia(media.filter(item => item.id !== mediaId));
    } catch (err) {
      console.error('Error deleting media:', err);
      setError('Failed to delete media. Please try again.');
    }
  };
  
  // Handle setting a thumbnail
  const handleSetThumbnail = (mediaId: string) => {
    // Update the media array
    const updatedMedia = media.map(item => ({
      ...item,
      is_thumbnail: item.id === mediaId
    }));
    
    // Get the thumbnail item
    const thumbnailItem = updatedMedia.find(item => item.id === mediaId);
    if (thumbnailItem && flower) {
      // Update the flower with the new thumbnail
      setFlower({
        ...flower,
        image_url: thumbnailItem.file_url || '',
        image_path: thumbnailItem.file_path
      });
    }
    
    setMedia(updatedMedia);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-4 text-pink-700">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!flower) {
    return <div className="text-red-500">{t('flowers.loadError')}</div>;
  }
  
  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <Link href={`/${locale}/admin/flowers`} className="flex items-center text-pink-600 hover:text-pink-800">
          <ArrowLeft className="mr-2" />
          <span>{t('flowers.backToList')}</span>
        </Link>
        <h1 className="text-2xl font-bold text-pink-800">{t('flowers.editFlower')}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-pink-700">{t('flowers.basicInfo')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">{t('flowers.name')}</label>
              <input
                type="text"
                id="name"
                name="name"
                value={flower.name || ''}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500"
                required
              />
            </div>
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700">{t('flowers.price')}</label>
              <input
                type="number"
                id="price"
                name="price"
                value={flower.price || ''}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500"
                required
              />
            </div>
          </div>
          <div className="mt-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">{t('flowers.description')}</label>
            <textarea
              id="description"
              name="description"
              value={flower.description || ''}
              onChange={handleChange}
              rows={4}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500"
            />
          </div>
          <div className="mt-6 flex items-center">
            <input
              type="checkbox"
              id="in_stock"
              name="in_stock"
              checked={flower.in_stock}
              onChange={handleChange}
              className="h-4 w-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
            />
            <label htmlFor="in_stock" className="ml-2 block text-sm text-gray-900">{t('flowers.inStock')}</label>
          </div>
        </div>

        {/* Color Selection */}
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-pink-700">{t('flowers.colorSelection')}</h2>
          <div className="flex items-center gap-4">
            <select
              onChange={handleColorSelect}
              className="border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500"
              defaultValue=""
            >
              <option value="" disabled>{t('flowers.selectColor')}</option>
              {availableColors.filter(c => !selectedColors.includes(c.id)).map(color => (
                <option key={color.id} value={color.id}>
                  {color.translated_name}
                </option>
              ))}
            </select>
          </div>
          <div className="mt-4">
            {selectedColors.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {selectedColors.map(colorId => {
                  const color = availableColors.find(c => c.id === colorId);
                  if (!color) return null;
                  return (
                    <div key={colorId} className="flex items-center bg-pink-100 text-pink-800 text-sm font-medium px-3 py-1 rounded-full">
                      <span>{color.translated_name}</span>
                      <button type="button" onClick={() => handleRemoveColor(colorId)} className="ml-2 text-pink-600 hover:text-pink-800">
                        <X size={16} />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500">{t('flowers.noColorsSelected')}</p>
            )}
          </div>
        </div>

        {/* Media Uploader */}
        <div className="p-6 bg-white rounded-lg shadow-md">
          <MediaUploader
            media={media}
            onMediaChange={setMedia}
            onDelete={handleDeleteMedia}
            onSetThumbnail={handleSetThumbnail}
            entityId={id}
            entityType="flowers"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 mt-8">
          <Link href={`/${locale}/admin/flowers`} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
            {t('common.cancel')}
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 disabled:bg-pink-300 flex items-center"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                {t('common.saving')}
              </>
            ) : (
              <>
                <Save className="mr-2" size={18} />
                {t('common.save')}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
} 
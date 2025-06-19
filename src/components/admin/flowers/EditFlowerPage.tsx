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
      <div className="flex justify-center my-8">
        <div className="text-center">
          <div className="spinner border-t-4 border-pink-500 border-solid rounded-full w-12 h-12 animate-spin"></div>
          <p className="mt-2 text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (error || !flower) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
        <p>Error: {error || 'Flower not found.'}</p>
        <button
          onClick={() => router.refresh()}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center mb-6">
        <Link
          href={`/${locale}/admin/flowers`}
          className="mr-4 text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{t('flowers.edit')}</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Info Section */}
          <div className="md:col-span-2">
            <h2 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
              {t('flowers.basicInfo')}
            </h2>
          </div>
          
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              {t('flowers.name')}
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={flower.name}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>

          {/* Price */}
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
              {t('flowers.price')}
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                type="number"
                step="0.01"
                min="0"
                id="price"
                name="price"
                value={flower.price}
                onChange={handleChange}
                required
                className="w-full pl-7 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-1">
              {t('flowers.category')}
            </label>
            <select
              id="category_id"
              name="category_id"
              value={flower.category_id || ''}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              <option value="">-- {t('common.select')} --</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>

          {/* Colors Dropdown */}
          <div>
            <label htmlFor="color_select" className="block text-sm font-medium text-gray-700 mb-1">
              {t('flowers.colors')}
            </label>
            <select
              id="color_select"
              name="color_select"
              value=""
              onChange={handleColorSelect}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              <option value="">-- {t('common.select')} --</option>
              {availableColors.map(color => (
                <option 
                  key={color.id} 
                  value={color.id}
                  disabled={selectedColors.includes(color.id)}
                >
                  {color.translated_name}
                </option>
              ))}
            </select>
            
            {/* Selected Colors */}
            <div className="mt-2 flex flex-wrap gap-2">
              {selectedColors.map(colorId => {
                const color = availableColors.find(c => c.id === colorId);
                if (!color) return null;
                
                return (
                  <div 
                    key={colorId}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium"
                    style={{ 
                      backgroundColor: `${color.hex_code}20`, 
                      color: "#be185d",
                      borderColor: color.hex_code
                    }}
                  >
                    <div 
                      className="w-3 h-3 mr-1 rounded-full" 
                      style={{ backgroundColor: color.hex_code }}
                    />
                    <span style={{ color: "#be185d" }}>{color.translated_name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveColor(colorId)}
                      className="ml-1 hover:text-gray-900 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Status Checkbox */}
          <div className="flex items-center mt-4">
            <input
              type="checkbox"
              id="is_available"
              name="is_available"
              checked={flower.in_stock}
              onChange={handleChange}
              className="h-4 w-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
            />
            <label htmlFor="is_available" className="ml-2 block text-sm text-gray-700">
              {t('flowers.inStock')}
            </label>
          </div>

          {/* Description - Full width */}
          <div className="md:col-span-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              {t('flowers.description')}
            </label>
            <textarea
              id="description"
              name="description"
              value={flower.description || ''}
              onChange={handleChange}
              rows={4}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
            ></textarea>
          </div>
          
          {/* Media Uploader - Full width */}
          <div className="md:col-span-2 mt-6 pt-6 border-t border-gray-200">
            <MediaUploader
              entityType="flowers"
              entityId={id}
              media={media}
              onMediaChange={(newMedia) => setMedia(newMedia)}
              onThumbnailChange={(thumbnailUrl, thumbnailPath) => {
                if (flower) {
                  setFlower({
                    ...flower,
                    image_url: thumbnailUrl,
                    image_path: thumbnailPath
                  });
                }
              }}
              onDelete={handleDeleteMedia}
              onSetThumbnail={handleSetThumbnail}
            />
          </div>
        </div>

        {/* Form buttons */}
        <div className="flex justify-end mt-8 pt-6 border-t border-gray-200 space-x-3">
          <Link
            href={`/${locale}/admin/flowers`}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            {t('common.cancel')}
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
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
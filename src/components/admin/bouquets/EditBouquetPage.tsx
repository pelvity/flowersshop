'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Plus, Minus, X, Image, Film, Upload, GripVertical, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { createLoggingClient } from '@/utils/supabase-logger';
import { ApiLogger } from '@/utils/api-logger';
import { toUUID } from '@/utils/uuid';

// Create a logger for this component
const logger = new ApiLogger('EditBouquetPage');

// Define types for Supabase responses
type Flower = {
  id: string;
  name: string;
  price: number;
  description?: string | null;
  in_stock: number;
};

type BouquetFlower = {
  id: string;
  bouquet_id: string;
  flower_id: string;
  quantity: number;
  flowers: Flower;
};

type FlowerWithQuantity = {
  id: string;
  flower_id?: string;
  name: string;
  price: number;
  quantity: number;
};

type BouquetMedia = {
  id: string;
  bouquet_id: string;
  media_type: 'image' | 'video';
  file_path: string;
  file_name: string;
  file_size: number;
  content_type: string;
  display_order: number;
  is_thumbnail: boolean;
  created_at?: string;
  updated_at?: string;
  // For local state management
  file?: File;
  url?: string;
  isUploading?: boolean;
  uploadProgress?: number;
};

export default function ClientBouquetEditPage({ id, locale }: { id: string; locale: string }) {
  const t = useTranslations('admin');
  const router = useRouter();
  const bouquetId = toUUID(id);
  
  const [bouquet, setBouquet] = useState({
    id: bouquetId,
    name: '',
    price: '',
    discount_price: '',
    description: '',
    category_id: '',
    in_stock: true,
    featured: false,
    image_url: '',
    flowers: [] as { id: string; name: string; quantity: number; price: number; flower_id?: string }[],
    media: [] as BouquetMedia[]
  });

  const [categories, setCategories] = useState<any[]>([]);
  const [availableFlowers, setAvailableFlowers] = useState<any[]>([]);
  const [isFlowerDropdownOpen, setIsFlowerDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Filter available flowers based on search term
  const filteredFlowers = availableFlowers.filter(flower => 
    flower.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !bouquet.flowers.some(f => f.id === flower.id)
  );

  // Fetch bouquet data and related data
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      const startTime = logger.request('GET', `bouquet/${bouquetId}`);
      
      try {
        const supabase = createLoggingClient();
        
        // Fetch the bouquet
        const { data: bouquetData, error: bouquetError } = await supabase
          .from('bouquets')
          .select('*')
          .eq('id', bouquetId)
          .single();
        
        if (bouquetError) throw bouquetError;
        
        // Fetch the bouquet flowers with flower details
        const { data: bouquetFlowers, error: flowersError } = await supabase
          .from('bouquet_flowers')
          .select(`
            id,
            bouquet_id,
            flower_id,
            quantity,
            flowers (
              id,
              name,
              price,
              description,
              in_stock
            )
          `)
          .eq('bouquet_id', bouquetId);
        
        if (flowersError) throw flowersError;
        
        // Fetch all categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*')
          .order('name');
        
        if (categoriesError) throw categoriesError;
        
        // Fetch all available flowers for selection
        const { data: allFlowers, error: allFlowersError } = await supabase
          .from('flowers')
          .select('*')
          .order('name');
        
        if (allFlowersError) throw allFlowersError;
        
        // Transform the bouquet flowers data to the format expected by the component
        const transformedFlowers = [];
        if (bouquetFlowers && bouquetFlowers.length > 0) {
          for (const bf of bouquetFlowers) {
            const flower = bf.flowers as any; // Use type assertion to avoid TypeScript errors
            transformedFlowers.push({
              id: bf.id,
              flower_id: bf.flower_id,
              name: flower?.name || '',
              price: flower?.price || 0,
              quantity: bf.quantity
            });
          }
        }
        
        // Set the state with fetched data
        setBouquet({
          ...bouquetData,
          price: bouquetData.price.toString(),
          discount_price: bouquetData.discount_price ? bouquetData.discount_price.toString() : '',
          flowers: transformedFlowers
        });
        
        setCategories(categoriesData || []);
        setAvailableFlowers(allFlowers || []);
        
        logger.response('GET', `bouquet/${bouquetId}`, 200, startTime, {
          bouquetData,
          bouquetFlowers: bouquetFlowers?.length || 0
        });
      } catch (err) {
        logger.error('GET', `bouquet/${bouquetId}`, err);
        console.error('Error fetching bouquet data:', err);
        setError('Failed to load bouquet data. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [bouquetId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const startTime = logger.request('PUT', `bouquet/${bouquetId}`);
    
    try {
      const supabase = createLoggingClient();
      
      // Prepare bouquet data (convert string prices to numbers)
      const bouquetData = {
        name: bouquet.name,
        description: bouquet.description,
        price: parseFloat(bouquet.price),
        discount_price: bouquet.discount_price ? parseFloat(bouquet.discount_price) : null,
        category_id: bouquet.category_id,
        in_stock: bouquet.in_stock,
        featured: bouquet.featured,
        image_url: bouquet.image_url
      };
      
      // Update bouquet details
      const { error: updateError } = await supabase
        .from('bouquets')
        .update(bouquetData)
        .eq('id', bouquetId);
      
      if (updateError) throw updateError;
      
      // First delete all existing flower associations
      const { error: deleteError } = await supabase
        .from('bouquet_flowers')
        .delete()
        .eq('bouquet_id', bouquetId);
      
      if (deleteError) throw deleteError;
      
      // Then create new flower associations
      if (bouquet.flowers.length > 0) {
        const bouquetFlowersToInsert = bouquet.flowers.map(flower => ({
          bouquet_id: bouquetId,
          flower_id: toUUID(flower.flower_id || flower.id),
          quantity: flower.quantity
        }));
        
        const { error: insertError } = await supabase
          .from('bouquet_flowers')
          .insert(bouquetFlowersToInsert);
        
        if (insertError) throw insertError;
      }
      
      logger.response('PUT', `bouquet/${bouquetId}`, 200, startTime);
      
      // Show success message
      alert(t('bouquets.updateSuccess'));
      
      // Navigate back to bouquets list
      router.push(`/${locale}/admin/bouquets`);
    } catch (err) {
      logger.error('PUT', `bouquet/${bouquetId}`, err);
      console.error('Error updating bouquet:', err);
      setError('Failed to update bouquet. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      setBouquet({
        ...bouquet,
        [name]: (e.target as HTMLInputElement).checked
      });
    } else {
      setBouquet({
        ...bouquet,
        [name]: value
      });
    }
  };

  const addFlower = (flowerId: string) => {
    const flowerToAdd = availableFlowers.find(f => f.id === flowerId);
    if (!flowerToAdd) return;

    setBouquet({
      ...bouquet,
      flowers: [
        ...bouquet.flowers,
        {
          id: `new-${Date.now()}`,
          flower_id: toUUID(flowerToAdd.id),
          name: flowerToAdd.name,
          price: flowerToAdd.price,
          quantity: 1
        }
      ]
    });
    setIsFlowerDropdownOpen(false);
  };

  const updateFlowerQuantity = (flowerId: string, change: number) => {
    const updatedFlowers = bouquet.flowers.map(flower => {
      if (flower.id === flowerId) {
        const newQuantity = Math.max(1, flower.quantity + change);
        return { ...flower, quantity: newQuantity };
      }
      return flower;
    });

    setBouquet({
      ...bouquet,
      flowers: updatedFlowers
    });
  };

  const removeFlower = (flowerId: string) => {
    setBouquet({
      ...bouquet,
      flowers: bouquet.flowers.filter(flower => flower.id !== flowerId)
    });
  };

  if (error) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
          <p>Error: {error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center mb-6">
        <Link
          href={`/${locale}/admin/bouquets`}
          className="mr-4 text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{t('bouquets.edit')}</h1>
      </div>

      {loading ? (
        <div className="flex justify-center my-8">
          <div className="text-center">
            <div className="spinner border-t-4 border-pink-500 border-solid rounded-full w-12 h-12 animate-spin"></div>
            <p className="mt-2 text-gray-600">{t('common.loading')}</p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Info Section */}
            <div className="md:col-span-2">
              <h2 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
                {t('bouquets.basicInfo')}
              </h2>
            </div>
            
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                {t('bouquets.name')}
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={bouquet.name}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>

            {/* Price */}
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                {t('bouquets.price')}
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="text"
                  id="price"
                  name="price"
                  value={bouquet.price}
                  onChange={handleChange}
                  required
                  className="w-full pl-7 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
            </div>

            {/* Discount Price */}
            <div>
              <label htmlFor="discount_price" className="block text-sm font-medium text-gray-700 mb-1">
                {t('bouquets.discountPrice')}
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="text"
                  id="discount_price"
                  name="discount_price"
                  value={bouquet.discount_price}
                  onChange={handleChange}
                  className="w-full pl-7 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                  placeholder="Leave empty for no discount"
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-1">
                {t('bouquets.category')}
              </label>
              <select
                id="category_id"
                name="category_id"
                value={bouquet.category_id}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Checkboxes */}
            <div className="flex items-center mt-4">
              <input
                type="checkbox"
                id="in_stock"
                name="in_stock"
                checked={bouquet.in_stock}
                onChange={handleChange}
                className="h-4 w-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
              />
              <label htmlFor="in_stock" className="ml-2 block text-sm text-gray-700">
                {t('bouquets.inStock')}
              </label>
              
              <input
                type="checkbox"
                id="featured"
                name="featured"
                checked={bouquet.featured}
                onChange={handleChange}
                className="h-4 w-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500 ml-6"
              />
              <label htmlFor="featured" className="ml-2 block text-sm text-gray-700">
                {t('bouquets.featured')}
              </label>
            </div>

            {/* Description - Full width */}
            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                {t('bouquets.description')}
              </label>
              <textarea
                id="description"
                name="description"
                value={bouquet.description || ''}
                onChange={handleChange}
                rows={4}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              ></textarea>
            </div>

            {/* Image Section */}
            <div className="md:col-span-2 mt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
                {t('bouquets.image')}
              </h2>
            </div>

            {/* Image Upload - Full width */}
            <div className="md:col-span-2">
              <div className="mt-1 flex items-center">
                <div className="mr-4 h-40 w-40 overflow-hidden rounded-md bg-gray-100 flex items-center justify-center">
                  {bouquet.image_url ? (
                    <img
                      src={bouquet.image_url}
                      alt={bouquet.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-400">No image</span>
                  )}
                </div>
                <div className="flex flex-col">
                  <input
                    type="file"
                    id="image"
                    name="image"
                    accept="image/*"
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-medium
                      file:bg-pink-50 file:text-pink-700
                      hover:file:bg-pink-100
                    "
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    {t('bouquets.imageRequirements')}
                  </p>
                  {/* Image URL input for testing purposes */}
                  <input
                    type="text"
                    name="image_url"
                    value={bouquet.image_url || ''}
                    onChange={handleChange}
                    placeholder="Image URL"
                    className="mt-2 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
              </div>
            </div>

            {/* Flower Selection Section */}
            <div className="md:col-span-2 mt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
                {t('bouquets.flowerSelection')}
              </h2>
            </div>

            {/* Selected Flowers List */}
            <div className="md:col-span-2">
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium text-gray-700">{t('bouquets.selectedFlowers')}</h3>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsFlowerDropdownOpen(!isFlowerDropdownOpen)}
                      className="px-3 py-1 bg-pink-600 text-white rounded-md hover:bg-pink-700 flex items-center text-sm"
                    >
                      <Plus size={16} className="mr-1" /> 
                      {t('bouquets.addFlower')}
                    </button>

                    {/* Flower Dropdown */}
                    {isFlowerDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-60 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                        <div className="p-2">
                          <input
                            type="text"
                            placeholder={t('common.search')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-pink-500 text-sm"
                          />
                        </div>
                        <ul className="max-h-60 overflow-y-auto">
                          {filteredFlowers.length === 0 ? (
                            <li className="px-4 py-2 text-gray-500 text-sm">{t('common.noResults')}</li>
                          ) : (
                            filteredFlowers.map(flower => (
                              <li 
                                key={flower.id} 
                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm flex items-center justify-between"
                                onClick={() => addFlower(flower.id)}
                              >
                                <span>{flower.name}</span>
                                <span className="text-gray-500">${flower.price}</span>
                              </li>
                            ))
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {/* Selected Flowers */}
                {bouquet.flowers.length === 0 ? (
                  <div className="text-gray-500 text-sm p-4 border border-dashed border-gray-300 rounded-md">
                    {t('bouquets.noFlowersSelected')}
                  </div>
                ) : (
                  <div className="border border-gray-200 rounded-md overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {t('flowers.name')}
                          </th>
                          <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {t('flowers.price')}
                          </th>
                          <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {t('flowers.quantity')}
                          </th>
                          <th scope="col" className="relative px-4 py-2 w-10">
                            <span className="sr-only">{t('common.actions')}</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {bouquet.flowers.map((flower) => (
                          <tr key={flower.id}>
                            <td className="px-4 py-3 whitespace-nowrap text-sm">{flower.name}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm">${flower.price}</td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="flex items-center">
                                <button
                                  type="button"
                                  onClick={() => updateFlowerQuantity(flower.id, -1)}
                                  className="p-1 text-gray-400 hover:text-gray-600"
                                >
                                  <Minus size={14} />
                                </button>
                                <span className="mx-2 w-8 text-center">{flower.quantity}</span>
                                <button
                                  type="button"
                                  onClick={() => updateFlowerQuantity(flower.id, 1)}
                                  className="p-1 text-gray-400 hover:text-gray-600"
                                >
                                  <Plus size={14} />
                                </button>
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                type="button"
                                onClick={() => removeFlower(flower.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <X size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Form buttons */}
          <div className="flex justify-end mt-8 pt-6 border-t border-gray-200 space-x-3">
            <Link
              href={`/${locale}/admin/bouquets`}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              {t('common.cancel')}
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 flex items-center"
            >
              <Save size={16} className="mr-1" />
              {submitting ? t('common.saving') : t('common.save')}
            </button>
          </div>
        </form>
      )}
    </div>
  );
} 
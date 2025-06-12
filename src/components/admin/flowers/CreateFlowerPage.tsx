'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { createLoggingClient } from '@/utils/supabase-logger';
import { ApiLogger } from '@/utils/api-logger';
import { generateUUID } from '@/utils/uuid';
import ImageUploadR2 from '@/components/common/ImageUploadR2';

// Create a logger for this component
const logger = new ApiLogger('CreateFlowerPage');

// Define type for Supabase category
type Category = {
  id: string;
  name: string;
  description: string | null;
};

export default function ClientCreateFlowerPage({ locale }: { locale: string }) {
  const t = useTranslations('admin');
  const router = useRouter();
  
  // Initial empty state for a new flower
  const [flower, setFlower] = useState({
    name: '',
    price: 0,
    description: '',
    colors: [] as string[],
    is_available: true,
    category_id: '',
    image_url: '',
    image_path: '',
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [colorInput, setColorInput] = useState('');

  // Fetch categories
  useEffect(() => {
    async function fetchCategories() {
      setLoading(true);
      const startTime = logger.request('GET', 'categories');
      
      try {
        const supabase = createLoggingClient();
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('name');
        
        if (error) throw error;
        
        setCategories(data || []);
        logger.response('GET', 'categories', 200, startTime);
      } catch (err) {
        logger.error('GET', 'categories', err);
        console.error('Error fetching categories:', err);
        setError('Failed to load categories. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const startTime = logger.request('POST', 'flowers');
    
    try {
      // Validate required fields
      if (!flower.name || flower.price <= 0) {
        throw new Error('Please fill in all required fields');
      }
      
      const supabase = createLoggingClient();
      const newFlowerId = generateUUID();
      
      const { error } = await supabase
        .from('flowers')
        .insert([
          {
            id: newFlowerId,
            name: flower.name,
            price: flower.price,
            description: flower.description || null,
            colors: flower.colors.length ? flower.colors : null,
            is_available: flower.is_available,
            category_id: flower.category_id || null,
            image_url: flower.image_url || null,
            image_path: flower.image_path || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]);
      
      if (error) throw error;
      
      logger.response('POST', 'flowers', 200, startTime);
      
      // Show success message
      alert(t('flowers.createSuccess'));
      
      // Navigate back to flowers list
      router.push(`/${locale}/admin/flowers`);
    } catch (err: any) {
      logger.error('POST', 'flowers', err);
      console.error('Error creating flower:', err);
      setError(err.message || 'Failed to create flower. Please try again.');
      setSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      setFlower({
        ...flower,
        [name]: (e.target as HTMLInputElement).checked
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
        [name]: value
      });
    }
  };

  const handleAddColor = () => {
    if (colorInput.trim() && !flower.colors.includes(colorInput.trim())) {
      setFlower({
        ...flower,
        colors: [...flower.colors, colorInput.trim()]
      });
      setColorInput('');
    }
  };

  const handleRemoveColor = (color: string) => {
    setFlower({
      ...flower,
      colors: flower.colors.filter(c => c !== color)
    });
  };

  const handleImageUploaded = (url: string, path: string) => {
    setFlower({
      ...flower,
      image_url: url,
      image_path: path
    });
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center mb-6">
        <Link
          href={`/${locale}/admin/flowers`}
          className="mr-4 text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{t('flowers.create')}</h1>
      </div>

      {loading ? (
        <div className="flex justify-center my-8">
          <div className="text-center">
            <div className="spinner border-t-4 border-pink-500 border-solid rounded-full w-12 h-12 animate-spin"></div>
            <p className="mt-2 text-gray-600">{t('common.loading')}</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
          <p>Error: {error}</p>
          <button 
            onClick={() => router.refresh()}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      ) : (
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
                {t('flowers.name')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={flower.name}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="Enter flower name"
              />
            </div>

            {/* Price */}
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                {t('flowers.price')} <span className="text-red-500">*</span>
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
                  placeholder="0.00"
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
                value={flower.category_id}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="">-- {t('common.select')} --</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>

            {/* Colors */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('flowers.colors')}
              </label>
              <div className="flex">
                <input
                  type="text"
                  value={colorInput}
                  onChange={(e) => setColorInput(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                  placeholder="Add a color..."
                />
                <button
                  type="button"
                  onClick={handleAddColor}
                  className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded-r-md"
                >
                  Add
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {flower.colors.map((color, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-pink-100 text-pink-800"
                  >
                    {color}
                    <button
                      type="button"
                      onClick={() => handleRemoveColor(color)}
                      className="ml-1 text-pink-500 hover:text-pink-700"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Status Checkbox */}
            <div className="flex items-center mt-4">
              <input
                type="checkbox"
                id="is_available"
                name="is_available"
                checked={flower.is_available}
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
                value={flower.description}
                onChange={handleChange}
                rows={4}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="Enter flower description"
              ></textarea>
            </div>

            {/* Image Section - Using R2 integration */}
            <div className="md:col-span-2 mt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
                {t('flowers.image')}
              </h2>
              <div className="mt-4">
                <ImageUploadR2 
                  initialImageUrl={flower.image_url || undefined}
                  onImageUploaded={handleImageUploaded}
                  folder="flowers"
                  className="relative w-full max-w-md mx-auto"
                  imageClassName="max-h-64 object-contain"
                />
              </div>
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
      )}
    </div>
  );
} 
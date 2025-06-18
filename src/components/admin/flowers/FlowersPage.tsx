'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Loader } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { FlowerRepository, Flower } from '@/lib/supabase';
import { ColorRepository } from '@/lib/repositories/color-repository';
import { Color } from '@/lib/repositories/repository-types';
import { createLoggingClient } from '@/utils/supabase-logger';
import { ApiLogger } from '@/utils/api-logger';
import { formatPrice } from '@/lib/functions';

// Create a logger for this component
const logger = new ApiLogger('FlowersPage');

// Define type for category
type Category = {
  id: string;
  name: string;
  description: string | null;
};

// Define type for color with translation
type ColorWithTranslation = Color & {
  translated_name: string;
};

// Extended flower type with optional properties
interface ExtendedFlower extends Flower {
  category_id?: string;
  colors?: ColorWithTranslation[];
}

export default function ClientFlowersAdminPage({ locale }: { locale: string }) {
  const t = useTranslations('admin');
  const [flowers, setFlowers] = useState<ExtendedFlower[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch flowers and categories on component mount
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      const startTime = logger.request('GET', 'flowers');
      
      try {
        // Fetch flowers using the repository
        const flowersData = await FlowerRepository.getAll();
        
        // Fetch categories for mapping category IDs to names
        const supabase = createLoggingClient();
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*')
          .order('name');
        
        if (categoriesError) throw categoriesError;
        
        // Initialize color repository
        const colorRepo = new ColorRepository();
        
        // Fetch translated colors for each flower
        const colorsData = await colorRepo.getAllWithTranslations(locale);
        
        // Get colors for each flower and add to flower data
        const extendedFlowers: ExtendedFlower[] = await Promise.all(
          flowersData.map(async (flower) => {
            const flowerColors = await colorRepo.getColorsForFlower(flower.id);
            
            // Map flower colors to include translations
            const translatedColors = flowerColors.map(color => {
              const colorWithTranslation = colorsData.find(c => c.id === color.id);
              return colorWithTranslation || { 
                ...color,
                translated_name: color.name
              };
            });
            
            return {
              ...flower,
              colors: translatedColors
            };
          })
        );
        
        // Cast to extended flower type
        setFlowers(extendedFlowers);
        setCategories(categoriesData || []);
        
        logger.response('GET', 'flowers', 200, startTime);
      } catch (err) {
        logger.error('GET', 'flowers', err);
        console.error('Error fetching flowers:', err);
        setError('Failed to load flowers. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [locale]);
  
  // Get category name by ID
  const getCategoryName = (categoryId: string | null | undefined): string => {
    if (!categoryId) return 'Uncategorized';
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'Uncategorized';
  };
  
  // Filter flowers based on search query
  const filteredFlowers = flowers.filter(flower => 
    flower.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    getCategoryName(flower.category_id).toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle flower deletion
  const handleDelete = async (flowerId: string, flowerName: string) => {
    if (window.confirm(`Are you sure you want to delete "${flowerName}"? This action cannot be undone.`)) {
      try {
        await FlowerRepository.delete(flowerId);
        setFlowers(flowers.filter(flower => flower.id !== flowerId));
      } catch (err) {
        console.error('Error deleting flower:', err);
        alert('Failed to delete flower. Please try again.');
      }
    }
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

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
        <p>Error: {error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">{t('navigation.flowers')}</h1>
        <Link 
          href={`/${locale}/admin/flowers/create`} 
          className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-md flex items-center"
        >
          <Plus size={16} className="mr-1" />
          {t('common.create')}
        </Link>
      </div>
      
      {/* Search and filters */}
      <div className="mb-6 flex">
        <div className="relative flex-grow max-w-md">
          <input
            type="text"
            placeholder={t('common.search')}
            className="w-full border border-gray-300 rounded-md py-2 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <Search size={18} />
          </div>
        </div>
      </div>
      
      {filteredFlowers.length === 0 ? (
        <div className="bg-white shadow p-6 text-center rounded-lg">
          <p className="text-gray-500 mb-4">No flowers found.</p>
          <Link
            href={`/${locale}/admin/flowers/create`}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700"
          >
            <Plus size={16} className="mr-2" />
            {t('flowers.create')}
          </Link>
        </div>
      ) : (
        /* Flowers table */
        <div className="bg-white shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('flowers.name')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('flowers.price')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('flowers.category')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('flowers.status')}
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">{t('common.actions')}</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredFlowers.map((flower) => (
                <tr key={flower.id}>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{flower.name}</div>
                    {/* Display color chips */}
                    {flower.colors && flower.colors.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {flower.colors.map(color => (
                          <div 
                            key={color.id}
                            className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium"
                            style={{ 
                              backgroundColor: `${color.hex_code}20`, 
                              color: color.hex_code,
                              borderColor: color.hex_code
                            }}
                          >
                            <div 
                              className="w-2 h-2 mr-1 rounded-full" 
                              style={{ backgroundColor: color.hex_code }}
                            />
                            {color.translated_name}
                          </div>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">{formatPrice(flower.price, locale)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">{getCategoryName(flower.category_id)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      flower.in_stock > 0
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {flower.in_stock > 0 ? t('flowers.inStock') : t('flowers.outOfStock')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <Link 
                        href={`/${locale}/admin/flowers/${flower.id}/edit`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <Edit size={18} />
                      </Link>
                      <button 
                        className="text-red-600 hover:text-red-900"
                        onClick={() => handleDelete(flower.id, flower.name)}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 
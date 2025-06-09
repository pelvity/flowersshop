'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { createLoggingClient } from '@/utils/supabase-logger';
import { ApiLogger } from '@/utils/api-logger';
import { toUUID } from '@/utils/uuid';

// Create a logger for this component
const logger = new ApiLogger('BouquetsPage');

// Define types for Supabase responses
type Bouquet = {
  id: string;
  name: string;
  price: number;
  discount_price: number | null;
  description: string | null;
  category_id: string | null;
  featured: boolean;
  in_stock: boolean;
  created_at: string;
  updated_at: string;
  image_url?: string | null;
};

type Category = {
  id: string;
  name: string;
  description: string | null;
};

export default function ClientBouquetsAdminPage({ locale }: { locale: string }) {
  const t = useTranslations('admin');
  const [bouquets, setBouquets] = useState<Bouquet[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch bouquets and categories on component mount
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      const startTime = logger.request('GET', 'bouquets');
      
      try {
        const supabase = createLoggingClient();
        
        // Fetch bouquets and categories in parallel
        const [bouquetsResult, categoriesResult] = await Promise.all([
          supabase.from('bouquets').select('*').order('name'),
          supabase.from('categories').select('*').order('name')
        ]);
        
        if (bouquetsResult.error) throw bouquetsResult.error;
        if (categoriesResult.error) throw categoriesResult.error;
        
        setBouquets(bouquetsResult.data || []);
        setCategories(categoriesResult.data || []);
        
        logger.response('GET', 'bouquets', 200, startTime, {
          bouquetsCount: bouquetsResult.data?.length || 0,
          categoriesCount: categoriesResult.data?.length || 0
        });
      } catch (err) {
        logger.error('GET', 'bouquets', err);
        console.error('Error fetching data:', err);
        setError('Failed to load bouquets. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);
  
  // Filter bouquets based on search query
  const filteredBouquets = bouquets.filter(bouquet => 
    bouquet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    getCategoryName(bouquet.category_id).toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Get category name by ID
  const getCategoryName = (categoryId: string | null): string => {
    if (!categoryId) return 'Uncategorized';
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'Uncategorized';
  };
  
  // Format price for display
  const formatPrice = (price: number): string => {
    return `$${price.toFixed(2)}`;
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
        <h1 className="text-2xl font-bold text-gray-900">{t('navigation.bouquets')}</h1>
        <Link 
          href={`/${locale}/admin/bouquets/create`} 
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
      
      {filteredBouquets.length === 0 ? (
        <div className="bg-white shadow p-6 text-center rounded-lg">
          <p className="text-gray-500 mb-4">No bouquets found.</p>
          <Link
            href={`/${locale}/admin/bouquets/create`}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700"
          >
            <Plus size={16} className="mr-2" />
            {t('bouquets.create')}
          </Link>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('bouquets.name')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('bouquets.price')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('bouquets.category')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('bouquets.status')}
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">{t('common.actions')}</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBouquets.map((bouquet) => (
                <tr key={bouquet.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{bouquet.name}</div>
                    {bouquet.featured && (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        {t('bouquets.featured')}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {formatPrice(bouquet.price)}
                    {bouquet.discount_price && (
                      <span className="ml-2 line-through text-gray-400">
                        {formatPrice(bouquet.discount_price)}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {getCategoryName(bouquet.category_id)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      bouquet.in_stock
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {bouquet.in_stock ? t('bouquets.inStock') : t('bouquets.outOfStock')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <Link 
                        href={`/${locale}/admin/bouquets/${bouquet.id}/edit`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <Edit size={18} />
                      </Link>
                      <button className="text-red-600 hover:text-red-900">
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
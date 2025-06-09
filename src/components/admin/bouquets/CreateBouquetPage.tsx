'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Plus, Minus, X } from 'lucide-react';
import Link from 'next/link';
import BouquetForm from '@/components/admin/BouquetForm';
import { Category, Tag, Flower } from '@/lib/supabase';
import { createLoggingClient } from '@/utils/supabase-logger';
import { ApiLogger } from '@/utils/api-logger';
import { toUUID, generateUUID } from '@/utils/uuid';

// Create a logger for this component
const logger = new ApiLogger('CreateBouquetPage');

interface CreateBouquetPageProps {
  locale: string;
}

export default function ClientCreateBouquetPage({ locale }: CreateBouquetPageProps) {
  const t = useTranslations('admin');
  const router = useRouter();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [flowers, setFlowers] = useState<Flower[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      const startTime = logger.request('GET', 'form-data');
      
      try {
        const supabase = createLoggingClient();
        
        // Fetch categories, tags, and flowers in parallel
        const [categoriesResult, tagsResult, flowersResult] = await Promise.all([
          supabase.from('categories').select('*').order('name'),
          supabase.from('tags').select('*').order('name'),
          supabase.from('flowers').select('*').order('name')
        ]);
        
        if (categoriesResult.error) throw categoriesResult.error;
        if (tagsResult.error) throw tagsResult.error;
        if (flowersResult.error) throw flowersResult.error;
        
        setCategories(categoriesResult.data || []);
        setTags(tagsResult.data || []);
        setFlowers(flowersResult.data || []);
        
        logger.response('GET', 'form-data', 200, startTime, {
          categoriesCount: categoriesResult.data?.length || 0,
          tagsCount: tagsResult.data?.length || 0,
          flowersCount: flowersResult.data?.length || 0
        });
      } catch (err) {
        logger.error('GET', 'form-data', err);
        console.error('Error fetching form data:', err);
        setError('Failed to load form data. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);
  
  if (error) {
    return (
      <div className="container mx-auto py-8">
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
    <div className="container mx-auto py-8">
      <div className="flex items-center mb-6">
        <Link href={`/${locale}/admin/bouquets`} className="mr-4 text-gray-500 hover:text-gray-700">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{t('bouquets.create')}</h1>
      </div>
      
      {loading ? (
        <div className="flex justify-center my-8">
          <div className="text-center">
            <div className="spinner border-t-4 border-pink-500 border-solid rounded-full w-12 h-12 animate-spin"></div>
            <p className="mt-2 text-gray-600">{t('common.loading')}</p>
          </div>
        </div>
      ) : (
        <BouquetForm 
          isEdit={false} 
          categories={categories}
          tags={tags}
          availableFlowers={flowers}
        />
      )}
    </div>
  );
} 
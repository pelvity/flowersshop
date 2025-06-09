import { Suspense } from 'react';
import { BouquetRepository, CategoryRepository } from '@/lib/supabase';
import BouquetsClient from '@/components/admin/BouquetsClient';

export default async function BouquetsManagementPage() {
  
  // Fetch bouquets and categories in parallel
  const [bouquets, categories] = await Promise.all([
    BouquetRepository.getAll(),
    CategoryRepository.getAll()
  ]);
  
  return (
    <Suspense fallback={<BouquetsLoading />}>
      <BouquetsClient 
        initialBouquets={bouquets}
        initialCategories={categories}
      />
    </Suspense>
  );
}

function BouquetsLoading() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading bouquets...</p>
      </div>
    </div>
  );
} 
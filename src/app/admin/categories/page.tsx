import { Suspense } from 'react';
import { CategoryRepository } from '@/lib/supabase';
import CategoriesClient from '@/components/admin/CategoriesClient';

export default async function CategoriesManagementPage() {
  const categories = await CategoryRepository.getAll();
  
  return (
    <Suspense fallback={<CategoriesLoading />}>
      <CategoriesClient initialCategories={categories} />
    </Suspense>
  );
}

function CategoriesLoading() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading categories...</p>
      </div>
    </div>
  );
} 
import { Suspense } from 'react';
import { FlowerRepository } from '@/lib/supabase';
import FlowersClient from '@/components/admin/FlowersClient';

export default async function FlowersManagementPage() {
  
  const flowers = await FlowerRepository.getAll();
  
  return (
    <Suspense fallback={<FlowersLoading />}>
      <FlowersClient initialFlowers={flowers} />
    </Suspense>
  );
}

function FlowersLoading() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading flowers...</p>
      </div>
    </div>
  );
} 
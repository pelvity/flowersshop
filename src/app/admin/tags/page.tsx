import { Suspense } from 'react';
import { TagRepository } from '@/lib/supabase';
import TagsClient from '@/components/admin/TagsClient';

export default async function TagsManagementPage() {
  const tags = await TagRepository.getAll();
  
  return (
    <Suspense fallback={<TagsLoading />}>
      <TagsClient initialTags={tags} />
    </Suspense>
  );
}

function TagsLoading() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading tags...</p>
      </div>
    </div>
  );
} 
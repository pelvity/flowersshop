import { notFound } from 'next/navigation';
import { TagRepository } from '@/lib/supabase';
import TagForm from '@/components/admin/TagForm';

interface EditTagPageProps {
  params: {
    id: string;
  };
}

export default async function EditTagPage({ params }: EditTagPageProps) {
  const tag = await TagRepository.getById(params.id);
  
  if (!tag) {
    notFound();
  }
  
  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Edit Tag</h1>
      <TagForm tag={tag} isEdit={true} />
    </div>
  );
} 
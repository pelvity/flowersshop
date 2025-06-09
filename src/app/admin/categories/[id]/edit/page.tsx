import { notFound } from 'next/navigation';
import { CategoryRepository } from '@/lib/supabase';
import CategoryForm from '@/components/admin/CategoryForm';

interface EditCategoryPageProps {
  params: {
    id: string;
  };
}

export default async function EditCategoryPage({ params }: EditCategoryPageProps) {
  const category = await CategoryRepository.getById(params.id);
  
  if (!category) {
    notFound();
  }
  
  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Edit Category</h1>
      <CategoryForm category={category} isEdit={true} />
    </div>
  );
} 
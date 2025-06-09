import { notFound } from 'next/navigation';
import { BouquetRepository } from '@/lib/supabase';
import BouquetForm from '@/components/admin/BouquetForm';

interface EditBouquetPageProps {
  params: {
    id: string;
  };
}

export default async function EditBouquetPage({ params }: EditBouquetPageProps) {
  const bouquet = await BouquetRepository.getById(params.id);
  
  if (!bouquet) {
    notFound();
  }
  
  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Edit Bouquet</h1>
      <BouquetForm bouquet={bouquet} isEdit={true} />
    </div>
  );
} 
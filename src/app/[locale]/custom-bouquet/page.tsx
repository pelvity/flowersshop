import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import CustomBouquetClient from '@/components/client/custom-bouquet-client';
import { FlowerRepository } from '@/lib/repositories/flower-repository';
import { getValidImageUrl } from '@/components/flowers/flower-media-gallery';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'customBouquet' });
  
  return {
    title: t('title'),
    description: t('customizeDescription'),
  };
}

export default async function CustomBouquetPage() {
  // Get flowers with colors and media
  const flowerRepository = new FlowerRepository();
  const flowers = await flowerRepository.getAll();
  
  // Process flowers to ensure they have the expected structure for the client component
  const processedFlowers = flowers.map(flower => {
    const thumbnail = flower.media?.find(m => m.is_thumbnail) || flower.media?.[0];
    const imageUrl = thumbnail ? getValidImageUrl(thumbnail) : '/placeholder.svg';
    
    return {
      id: flower.id,
      name: flower.name,
      description: flower.description || null,
      price: flower.price,
      in_stock: 1, // Convert boolean to number
      low_stock_threshold: 5, // Default value
      created_at: flower.created_at,
      updated_at: flower.updated_at,
      // Add custom properties needed by the client
      image: imageUrl,
      colors: flower.colors?.map(c => c.color.name) || []
    };
  });
  
  return <CustomBouquetClient initialFlowers={processedFlowers} />;
} 
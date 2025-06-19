import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import CustomBouquetClient from '@/components/client/custom-bouquet-client';
import { FlowerRepository } from '@/lib/repositories/flower-repository';
import { BouquetRepository } from '@/lib/repositories/bouquet-repository';
import { getValidImageUrlServer } from '@/utils/image-utils';
import { Bouquet as SupabaseBouquet } from '@/lib/supabase';

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
  const bouquetRepository = new BouquetRepository();
  
  console.log('Fetching flowers and bouquets...');
  
  // Fetch both flowers and template bouquets in parallel
  const [flowers, bouquetsResult] = await Promise.all([
    flowerRepository.getAll({ includeColors: true }),
    bouquetRepository.getAll({ inStock: true }, { page: 1, pageSize: 10 })
  ]);
  
  console.log(`Fetched ${flowers.length} flowers and ${bouquetsResult.data.length} bouquets`);
  
  // Check if bouquets have media
  if (bouquetsResult.data.length > 0) {
    const firstBouquet = bouquetsResult.data[0];
    console.log('First bouquet:', {
      id: firstBouquet.id,
      name: firstBouquet.name,
      hasMedia: !!firstBouquet.media,
      mediaCount: firstBouquet.media?.length || 0
    });
  }
  
  // Process flowers to ensure they have the expected structure for the client component
  const processedFlowers = flowers.map(flower => {
    const thumbnail = flower.media?.find(m => m.is_thumbnail) || flower.media?.[0];
    const imageUrl = thumbnail ? getValidImageUrlServer(thumbnail) : '/placeholder.svg';
    
    // Log the original flower colors to understand their structure
    console.log(`Flower ${flower.name} original colors:`, flower.colors);
    
    // Extract color names from the flower colors
    // The client component expects an array of strings, not FlowerColor objects
    let colorNames: string[] = [];
    
    if (flower.colors && Array.isArray(flower.colors)) {
      // Extract color names from FlowerColor objects
      colorNames = flower.colors.map(colorObj => {
        // Check if it's a FlowerColor object with a color property
        if (colorObj && typeof colorObj === 'object' && 'color' in colorObj && colorObj.color) {
          return colorObj.color.name;
        }
        // If it's already a simple color object with a name
        else if (colorObj && typeof colorObj === 'object' && 'name' in colorObj) {
          return colorObj.name;
        }
        // If it's a string already
        else if (typeof colorObj === 'string') {
          return colorObj;
        }
        // Otherwise, return null to be filtered out
        return null;
      }).filter((name): name is string => name !== null);
    }
    
    console.log(`Processed color names for ${flower.name}:`, colorNames);
    
    return {
      ...(flower as any), // Using 'any' to bypass type checking due to inconsistencies
      image: imageUrl,
      // Override the colors property with just the array of color names
      colors: colorNames,
      // The client component expects in_stock to be a number, but repository provides boolean
      in_stock: flower.in_stock ? 1 : 0,
    };
  });
  
  // Log the processed flowers to verify colors
  console.log('Final processed flowers with colors:', 
    processedFlowers.map(f => ({ id: f.id, name: f.name, colors: f.colors })));
  
  // Convert repository bouquets to the Supabase Bouquet type expected by the client
  const templateBouquets = bouquetsResult.data.map(bouquet => {
    // Make sure media is properly included
    const processedMedia = bouquet.media?.map(media => ({
      id: media.id,
      bouquet_id: media.bouquet_id,
      file_name: media.file_name,
      file_path: media.file_path,
      file_url: media.file_url || `/storage/bouquets/${media.file_path}`,
      is_thumbnail: media.is_thumbnail,
      media_type: media.media_type || 'image',
      created_at: media.created_at,
      updated_at: media.updated_at
    }));
    
    // Ensure all required properties are present
    return {
      ...bouquet,
      description: bouquet.description || null,
      discount_price: bouquet.discount_price || null,
      category_id: bouquet.category_id || null,
      media: processedMedia || [],
      // If there are any type incompatibilities, ensure they're handled here
    } as unknown as SupabaseBouquet;
  });
  
  console.log(`Processed ${templateBouquets.length} template bouquets`);
  if (templateBouquets.length > 0) {
    console.log('First processed template bouquet:', {
      id: templateBouquets[0].id,
      name: templateBouquets[0].name,
      hasMedia: !!templateBouquets[0].media,
      mediaCount: templateBouquets[0].media?.length || 0
    });
  }
  
  return <CustomBouquetClient 
    initialFlowers={processedFlowers} 
    initialTemplateBouquets={templateBouquets}
  />;
} 
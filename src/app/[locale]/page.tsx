import HomeClient from '@/components/client/home-client';
import { catalogRepository } from '@/lib/repositories/catalog';

export default async function HomePage({ 
  params 
}: { 
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params;
  
  // Fetch featured bouquets for the home page
  const featuredBouquets = await catalogRepository.getFeaturedBouquets();
  
  return (
    <HomeClient 
      locale={locale}
      initialFeaturedBouquets={featuredBouquets}
    />
  );
}
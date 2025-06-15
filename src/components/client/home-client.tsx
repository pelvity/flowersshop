'use client';

import Hero from "../hero";
import FeaturedProducts from "../featured-products";
import Contact from "../contact";
import { Bouquet, BouquetMedia } from '@/lib/supabase';
import { useMemo } from 'react';

interface HomeClientProps {
  locale: string;
  initialFeaturedBouquets: Bouquet[];
}

export default function HomeClient({ locale, initialFeaturedBouquets }: HomeClientProps) {
  // Debug featured bouquets
  console.log('[HOME-CLIENT] Featured bouquets count:', initialFeaturedBouquets?.length || 0);
  console.log('[HOME-CLIENT] First bouquet has media?', initialFeaturedBouquets?.[0]?.media ? 'Yes' : 'No');
  if (initialFeaturedBouquets?.[0]?.media) {
    console.log('[HOME-CLIENT] First bouquet media count:', initialFeaturedBouquets[0].media.length);
    console.log('[HOME-CLIENT] First bouquet first media item:', initialFeaturedBouquets[0].media[0]);
  }
  
  // Extract media from featured bouquets for the hero carousel
  const heroCarouselMedia = useMemo(() => {
    // Collect all media from bouquets
    const allMedia: BouquetMedia[] = [];
    
    // Get up to 3 media items from each bouquet
    initialFeaturedBouquets.forEach(bouquet => {
      if (bouquet.media && bouquet.media.length > 0) {
        // Take up to 3 images from each bouquet
        const bouquetMedia = bouquet.media.slice(0, 3);
        allMedia.push(...bouquetMedia);
      }
    });
    
    // Debug the collected media
    console.log('[HOME-CLIENT] Total media items collected:', allMedia.length);
    if (allMedia.length > 0) {
      console.log('[HOME-CLIENT] First media item has valid URL?', allMedia[0]?.file_url ? 'Yes' : 'No');
    }
    
    // Limit to 10 images total for performance
    return allMedia.slice(0, 10);
  }, [initialFeaturedBouquets]);
  
  return (
    <>
      <Hero carouselMedia={heroCarouselMedia} />
      <FeaturedProducts featuredBouquets={initialFeaturedBouquets} />
      <Contact />
    </>
  );
} 
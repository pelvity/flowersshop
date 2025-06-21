'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from "react";
import { useParams } from 'next/navigation';
import { Bouquet, Category, Tag } from "@/lib/supabase";
import { useCart } from '@/context/cart-context';
import BouquetCard from './bouquets/bouquet-card';

interface FeaturedProductsProps {
  featuredBouquets?: Bouquet[];
}

export default function FeaturedProducts({ featuredBouquets = [] }: FeaturedProductsProps) {
  const t = useTranslations('home.featured');
  const params = useParams();
  const locale = params.locale as string;
  // Safety check for locale
  const safeLocale = locale === 'cart' ? 'uk' : locale;
  
  // Skip translations altogether if locale is invalid
  const isValidLocale = !['cart'].includes(locale);
  
  // Use a custom translation function that always provides defaults
  const tWithDefault = (key: string, defaultValue: string) => {
    if (!isValidLocale) {
      return defaultValue;
    }
    
    try {
      return t(key, { defaultValue });
    } catch (error) {
      return defaultValue;
    }
  };
  const [products, setProducts] = useState<Bouquet[]>(featuredBouquets);
  const [isLoading, setIsLoading] = useState(featuredBouquets.length === 0);
  const { addProduct } = useCart();
  
  useEffect(() => {
    // Only fetch if no bouquets were provided as props
    if (featuredBouquets.length > 0) {
      setIsLoading(false);
      return;
    }
    
    async function fetchFeaturedBouquets() {
      try {
        setIsLoading(true);
        const response = await fetch('/api/bouquets/featured');
        if (!response.ok) {
          throw new Error('Failed to fetch featured bouquets');
        }
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error('Error fetching featured bouquets:', error);
        // Fallback to empty array
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchFeaturedBouquets();
  }, [featuredBouquets]);

  const handleAddToCart = (bouquetId: string) => {
    addProduct(bouquetId, 1);
  };
  
  if (isLoading) {
    return (
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              {tWithDefault('title', 'Featured Bouquets')}
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
              {tWithDefault('subtitle', 'Discover our most popular bouquets')}
            </p>
          </div>
          <div className="mt-10 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
          </div>
        </div>
      </section>
    );
  }
  
  return (
    <section className="py-8 sm:py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            {tWithDefault('title', 'Featured Bouquets')}
          </h2>
          <p className="mt-3 sm:mt-4 max-w-2xl mx-auto text-lg sm:text-xl text-gray-500">
            {tWithDefault('subtitle', 'Discover our most popular bouquets')}
          </p>
        </div>

        <div className="mt-8 sm:mt-10 grid grid-cols-1 gap-y-8 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
          {products.length > 0 ? (
            products.map((product) => (
              <BouquetCard
                key={product.id}
                bouquet={product}
                onAddToCart={handleAddToCart}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-8 sm:py-12">
              <p className="text-gray-500">{tWithDefault('noProducts', 'No featured products available')}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
} 

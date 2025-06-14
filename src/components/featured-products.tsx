'use client';

import { Card } from "./ui";
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from "react";
import Link from "next/link";
import { Bouquet } from "@/lib/supabase";
import { useParams } from 'next/navigation';
import { ImageIcon } from 'lucide-react';

export default function FeaturedProducts() {
  const t = useTranslations();
  const params = useParams();
  const locale = params.locale as string;
  const [products, setProducts] = useState<Bouquet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
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
  }, []);
  
  if (isLoading) {
    return (
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Featured Arrangements
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
              Discover our most popular bouquets
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
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Featured Arrangements
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
            Discover our most popular bouquets
          </p>
        </div>

        <div className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {products.length > 0 ? (
            products.map((product) => (
              <Link href={`/${locale}/bouquet/${product.id}`} key={product.id}>
                <Card className="flex flex-col overflow-hidden transition-all hover:shadow-lg h-full">
                  <div className="flex-shrink-0">
                    {product.image ? (
                      <div 
                        className="w-full h-48 bg-pink-50"
                        style={{ 
                          backgroundImage: `url(${product.image})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center'
                        }}
                      />
                    ) : (
                      <div className="w-full h-48 flex items-center justify-center bg-gray-200">
                        <ImageIcon className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 p-6 flex flex-col">
                    <div className="flex-1">
                      <h3 className="text-xl font-medium text-gray-900">{product.name}</h3>
                      <p className="mt-2 text-base text-gray-500">{product.description}</p>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xl font-medium text-pink-600">
                        ${product.discount_price || product.price}
                      </span>
                      <span className="text-pink-600 hover:text-pink-800 font-medium">
                        View Details
                      </span>
                    </div>
                  </div>
                </Card>
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500">No featured products available</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
} 

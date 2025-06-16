'use client';

import { Container, Section } from "@/components/ui";
import Link from "next/link";
import { notFound } from "next/navigation";
import { catalogRepository } from "@/lib/repositories/catalog";
import AddToCartButton from "@/components/client/add-to-cart-button";
import { ImageIcon } from "lucide-react";
import { BouquetMediaGallery, Lightbox } from "@/components/bouquets/bouquet-media-gallery";
import { useState, useEffect } from "react";
import { Bouquet } from "@/lib/supabase";

interface BouquetClientPageProps {
  initialBouquet?: Bouquet;
  initialCategory?: any;
  id: string;
  locale: string;
}

export default function BouquetClientPage({ 
  initialBouquet, 
  initialCategory, 
  id, 
  locale 
}: BouquetClientPageProps) {
  const [bouquet, setBouquet] = useState<Bouquet | null>(initialBouquet || null);
  const [category, setCategory] = useState<any | null>(initialCategory || null);
  const [loading, setLoading] = useState(!initialBouquet);
  const [showLightbox, setShowLightbox] = useState(false);

  useEffect(() => {
    async function loadBouquet() {
      if (initialBouquet) {
        return;
      }

      try {
        const bouquetData = await catalogRepository.getBouquetById(id);

        if (!bouquetData) {
          notFound();
        }

        setBouquet(bouquetData);

        if (bouquetData.category_id) {
          const categoryData = await catalogRepository.getCategoryById(bouquetData.category_id);
          setCategory(categoryData);
        }
      } catch (error) {
        console.error('Error loading bouquet page:', error);
        notFound();
      } finally {
        setLoading(false);
      }
    }

    loadBouquet();
  }, [id, initialBouquet]);

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setShowLightbox(true);
  };

  if (loading || !bouquet) {
    return (
      <Section className="bg-gradient-to-b from-pink-50 to-white py-12">
        <Container>
          <div className="flex items-center justify-center min-h-[400px]">
            <p className="text-pink-500">Loading...</p>
          </div>
        </Container>
      </Section>
    );
  }

  return (
    <main>
      {showLightbox && (
        <Lightbox 
          bouquet={bouquet} 
          onClose={() => setShowLightbox(false)} 
        />
      )}

      <Section className="bg-gradient-to-b from-pink-50 to-white py-12">
        <Container>
          <div className="bg-white rounded-lg shadow-md overflow-hidden border border-pink-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="relative h-[500px] md:h-[600px] p-0">
                {bouquet.media && bouquet.media.length > 0 ? (
                  <div className="w-full h-full">
                    <BouquetMediaGallery
                      media={bouquet.media}
                      alt={bouquet.name}
                      onImageClick={handleImageClick}
                      height="h-full"
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full bg-gray-200">
                    <ImageIcon className="w-16 h-16 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="p-8 flex flex-col">
                <div className="flex-grow">
                  <div className="mb-6">
                    {category && (
                      <Link 
                        href={`/${locale}/catalog?category=${category.id}`}
                        className="inline-block bg-pink-50 text-pink-600 text-sm px-3 py-1 rounded-full mb-3 hover:bg-pink-100 transition-colors"
                      >
                        {category.name}
                      </Link>
                    )}
                    <h1 className="text-3xl font-bold text-pink-700">{bouquet.name}</h1>
                  </div>

                  <div className="mb-6">
                    <p className="text-gray-700">{bouquet.description}</p>
                  </div>

                  {bouquet.tags && bouquet.tags.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {bouquet.tags.map((tag: string, index: number) => (
                          <span 
                            key={index} 
                            className="inline-block bg-pink-50 text-pink-600 text-xs px-2 py-1 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Price</h3>
                    <div className="flex items-center">
                      {bouquet.discount_price ? (
                        <>
                          <span className="text-2xl font-bold text-amber-600">₴{bouquet.discount_price}</span>
                          <span className="ml-2 text-lg text-gray-400 line-through">₴{bouquet.price}</span>
                        </>
                      ) : (
                        <span className="text-2xl font-bold text-amber-600">₴{bouquet.price}</span>
                      )}
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Availability</h3>
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-2 ${bouquet.in_stock ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className={bouquet.in_stock ? 'text-green-600' : 'text-red-600'}>
                        {bouquet.in_stock ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mt-auto">
                  <AddToCartButton 
                    bouquetId={id} 
                    available={bouquet.in_stock}
                  />
                  <Link
                    href={`/${locale}/catalog`}
                    className="inline-flex items-center justify-center text-center bg-white hover:bg-pink-50 text-pink-600 border border-pink-200 px-6 py-3 rounded-md shadow-sm transition-colors"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </main>
  );
}

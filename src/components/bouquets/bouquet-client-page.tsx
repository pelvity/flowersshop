'use client';

import { Container, Section } from "@/components/ui";
import Link from "next/link";
import { notFound } from "next/navigation";
import { catalogRepository } from "@/lib/repositories/catalog";
import AddToCartButton from "@/components/client/add-to-cart-button";
import { CalendarIcon, Clock, FileTextIcon, FlowerIcon, ImageIcon, Tag } from "lucide-react";
import { BouquetMediaGallery, Lightbox } from "@/components/bouquets/bouquet-media-gallery";
import { useState, useEffect } from "react";
import { Bouquet } from "@/lib/supabase";
import { useTranslations } from "next-intl";
import { formatPrice } from "@/lib/functions";

interface BouquetClientPageProps {
  initialBouquet?: Bouquet;
  initialCategory?: any;
  id: string;
  locale: string;
}

// Extended bouquet type to include flowers information
interface ExtendedBouquet extends Bouquet {
  flowers?: Array<{
    id: string;
    name: string;
    quantity: number;
    flower_id?: string;
  }>;
}

export default function BouquetClientPage({ 
  initialBouquet, 
  initialCategory, 
  id, 
  locale 
}: BouquetClientPageProps) {
  const t = useTranslations();
  const [bouquet, setBouquet] = useState<ExtendedBouquet | null>(initialBouquet as ExtendedBouquet || null);
  const [category, setCategory] = useState<any | null>(initialCategory || null);
  const [loading, setLoading] = useState(!initialBouquet);
  const [showLightbox, setShowLightbox] = useState(false);
  const [relatedBouquets, setRelatedBouquets] = useState<Bouquet[]>([]);

  useEffect(() => {
    async function loadBouquet() {
      if (initialBouquet) {
        setBouquet(initialBouquet as ExtendedBouquet);
        setCategory(initialCategory);
        
        // Get related bouquets based on category or tags
        if (initialBouquet.category_id || (initialBouquet.tags && initialBouquet.tags.length > 0)) {
          try {
            const related = await catalogRepository.getRelatedBouquets(
              id, 
              initialBouquet.category_id || undefined, 
              initialBouquet.tags?.map((tag: any) => typeof tag === 'object' ? tag.id : tag) || []
            );
            setRelatedBouquets(related || []);
          } catch (error) {
            console.error('Error loading related bouquets:', error);
          }
        }
        
        return;
      }

      try {
        const bouquetData = await catalogRepository.getBouquetById(id);

        if (!bouquetData) {
          notFound();
        }

        setBouquet(bouquetData as ExtendedBouquet);

        if (bouquetData.category_id) {
          const categoryData = await catalogRepository.getCategoryById(bouquetData.category_id);
          setCategory(categoryData);
        }
        
        // Get related bouquets
        if (bouquetData.category_id || (bouquetData.tags && bouquetData.tags.length > 0)) {
          try {
            const related = await catalogRepository.getRelatedBouquets(
              id, 
              bouquetData.category_id || undefined, 
              bouquetData.tags?.map((tag: any) => typeof tag === 'object' ? tag.id : tag) || []
            );
            setRelatedBouquets(related || []);
          } catch (error) {
            console.error('Error loading related bouquets:', error);
          }
        }
      } catch (error) {
        console.error('Error loading bouquet page:', error);
        notFound();
      } finally {
        setLoading(false);
      }
    }

    loadBouquet();
  }, [id, initialBouquet, initialCategory]);

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setShowLightbox(true);
  };

  // Format date for display
  const formatDate = (dateString?: string | null): string => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      
      // Format options for the date
      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      };
      
      return new Intl.DateTimeFormat(locale, options).format(date);
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  if (loading || !bouquet) {
    return (
      <Section className="bg-gradient-to-b from-pink-50 to-white py-12">
        <Container>
          <div className="flex items-center justify-center min-h-[400px]">
            <p className="text-pink-500">{t('common.loading')}</p>
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
                    
                    {/* Creation and update info */}
                    <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-500">
                      {bouquet.created_at && (
                        <div className="flex items-center">
                          <CalendarIcon size={14} className="mr-1" />
                          <span>{t('product.created')}: {formatDate(bouquet.created_at)}</span>
                        </div>
                      )}
                      {bouquet.updated_at && bouquet.updated_at !== bouquet.created_at && (
                        <div className="flex items-center">
                          <Clock size={14} className="mr-1" />
                          <span>{t('product.updated')}: {formatDate(bouquet.updated_at)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">{t('product.description')}</h3>
                    <p className="text-gray-700">{bouquet.description}</p>
                  </div>

                  {/* Flowers in bouquet */}
                  {bouquet.flowers && bouquet.flowers.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-sm font-medium text-gray-500 mb-2">{t('product.includes')}</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {bouquet.flowers.map((flower: any, index: number) => (
                          <div key={index} className="bg-white rounded-lg shadow-sm border border-pink-100 overflow-hidden flex flex-col">
                            <div className="relative h-24 bg-gray-50">
                              {flower.image ? (
                                <img 
                                  src={flower.image} 
                                  alt={flower.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="flex items-center justify-center h-full">
                                  <FlowerIcon size={24} className="text-gray-300" />
                                </div>
                              )}
                            </div>
                            <div className="p-3">
                              <div className="flex items-center justify-between">
                                <h4 className="text-sm font-medium text-gray-700">{flower.name}</h4>
                                <span className="inline-flex items-center justify-center bg-pink-50 text-pink-600 font-medium text-xs h-5 min-w-5 px-1.5 rounded-full">
                                  {flower.quantity}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tags section with improved styling */}
                  {bouquet.tags && bouquet.tags.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
                        <Tag size={16} className="mr-1" />
                        {t('catalog.tags')}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {bouquet.tags.map((tag: any, index: number) => {
                          const tagName = typeof tag === 'object' ? tag.name : tag;
                          const tagId = typeof tag === 'object' ? tag.id : tag;
                          
                          return (
                            <Link 
                              key={index} 
                              href={`/${locale}/catalog?tag=${tagId}`}
                              className="inline-block bg-pink-50 text-pink-600 text-xs px-3 py-1 rounded-full hover:bg-pink-100 transition-colors"
                            >
                              {tagName}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">{t('product.price')}</h3>
                    <div className="flex items-center">
                      {bouquet.discount_price ? (
                        <>
                          <span className="text-2xl font-bold text-amber-600">{formatPrice(bouquet.discount_price, locale)}</span>
                          <span className="ml-2 text-lg text-gray-400 line-through">{formatPrice(bouquet.price, locale)}</span>
                          <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                            {Math.round((1 - bouquet.discount_price / bouquet.price) * 100)}% {t('product.discount')}
                          </span>
                        </>
                      ) : (
                        <span className="text-2xl font-bold text-amber-600">{formatPrice(bouquet.price, locale)}</span>
                      )}
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">{t('product.availability')}</h3>
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-2 ${bouquet.in_stock ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className={bouquet.in_stock ? 'text-green-600' : 'text-red-600'}>
                        {bouquet.in_stock ? t('catalog.inStock') : t('catalog.outOfStock')}
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
                    {t('cart.continueShopping')}
                  </Link>
                </div>
              </div>
            </div>
          </div>
          
          {/* Related bouquets section */}
          {relatedBouquets.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-pink-700 mb-6">{t('product.related')}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {relatedBouquets.slice(0, 4).map((relatedBouquet) => (
                  <Link 
                    key={relatedBouquet.id} 
                    href={`/${locale}/bouquet/${relatedBouquet.id}`}
                    className="group bg-white rounded-lg overflow-hidden shadow-md border border-pink-100 hover:shadow-lg transition-all"
                  >
                    <div className="relative h-48 overflow-hidden">
                      {relatedBouquet.media && relatedBouquet.media.length > 0 ? (
                        <div className="w-full h-full">
                          <img
                            src={relatedBouquet.media.find((m: any) => m.is_thumbnail)?.file_url || relatedBouquet.media[0]?.file_url || ''}
                            alt={relatedBouquet.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full bg-gray-200">
                          <ImageIcon className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-pink-700 group-hover:text-pink-800 transition-colors">{relatedBouquet.name}</h3>
                      <div className="mt-2 flex items-center">
                        {relatedBouquet.discount_price ? (
                          <>
                            <span className="font-bold text-amber-600">{formatPrice(relatedBouquet.discount_price, locale)}</span>
                            <span className="ml-2 text-sm text-gray-400 line-through">{formatPrice(relatedBouquet.price, locale)}</span>
                          </>
                        ) : (
                          <span className="font-bold text-amber-600">{formatPrice(relatedBouquet.price, locale)}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </Container>
      </Section>
    </main>
  );
}

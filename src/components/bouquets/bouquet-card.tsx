'use client';

import { Bouquet, Category, Tag } from "@/lib/supabase";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Card } from "../ui";
import { BouquetMediaGallery, Lightbox } from "@/components/bouquets/bouquet-media-gallery";
import { useState } from "react";
import { useParams } from "next/navigation";
import { formatPrice } from '@/lib/functions';

interface BouquetCardProps {
  bouquet: Bouquet;
  category?: Category;
  tags?: Tag[];
  onAddToCart: (bouquetId: string) => void;
  isTemplate?: boolean;
  onCustomize?: (bouquet: Bouquet) => void;
}

export default function BouquetCard({ 
  bouquet, 
  category, 
  tags = [], 
  onAddToCart,
  isTemplate = false,
  onCustomize
}: BouquetCardProps) {
  const t = useTranslations('catalog');
  const router = useRouter();
  const { locale } = useParams();
  const [showLightbox, setShowLightbox] = useState(false);

  const navigateToBouquet = (bouquetId: string) => {
    router.push(`/${locale}/bouquet/${bouquetId}`);
  };

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setShowLightbox(true);
  };

  return (
    <>
      {showLightbox && (
        <Lightbox 
          bouquet={bouquet} 
          onClose={() => setShowLightbox(false)} 
        />
      )}
      
      <Card 
        key={bouquet.id} 
        className="group flex cursor-pointer flex-col overflow-hidden rounded-lg border border-pink-100 bg-white shadow-sm transition-all duration-300 hover:shadow-lg"
        onClick={() => navigateToBouquet(bouquet.id)}
      >
        <div className="relative">
          <BouquetMediaGallery 
            media={bouquet.media || []}
            alt={bouquet.name} 
            onImageClick={handleImageClick}
          />
          {category && (
            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-pink-600 text-xs font-medium px-3 py-1 rounded-full shadow-sm border border-pink-100">
              {category?.name}
            </div>
          )}
          {!bouquet.in_stock && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
              <span className="rounded-md bg-pink-50 px-2 py-1 text-sm font-medium text-pink-700 ring-1 ring-inset ring-pink-600/20">{t('outOfStock')}</span>
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col p-4">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-pink-800 transition-colors group-hover:text-pink-600">
              {bouquet.name}
            </h3>
            {bouquet.description && (
              <p className="mt-2 text-sm text-gray-500 h-[40px] overflow-hidden">
                {bouquet.description}
              </p>
            )}
          </div>
          
          <div>
            {tags.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {tags.slice(0, 3).map(tag => (
                  <span key={tag.id} className="inline-block bg-pink-50 text-pink-700 text-xs font-medium px-2 py-1 rounded-full">
                    {tag.name}
                  </span>
                ))}
                {tags.length > 3 && (
                  <span className="inline-block bg-pink-50 text-pink-700 text-xs font-medium px-2 py-1 rounded-full">
                    +{tags.length - 3}
                  </span>
                )}
              </div>
            )}
            <div className="flex items-end justify-between mt-3">
              <div className="flex flex-col mr-4">
                {bouquet.discount_price && (
                  <span className="text-sm text-gray-400 line-through">
                    {formatPrice(bouquet.price, locale as string)}
                  </span>
                )}
                <span className="text-xl font-bold text-amber-600">
                  {formatPrice(bouquet.discount_price || bouquet.price, locale as string)}
                </span>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  if (isTemplate && onCustomize) {
                    onCustomize(bouquet);
                  } else {
                    onAddToCart(bouquet.id);
                  }
                }}
                className="z-10 bg-gradient-to-r from-pink-500 to-pink-400 text-white px-3 py-1.5 rounded-md text-sm font-semibold shadow-sm transition-all duration-200 hover:from-pink-600 hover:to-pink-500 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!bouquet.in_stock}
              >
                {isTemplate ? t('customizeThis') : t('addToCart')}
              </button>
            </div>
          </div>
        </div>
      </Card>
    </>
  );
} 
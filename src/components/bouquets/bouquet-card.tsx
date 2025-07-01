'use client';

import { Bouquet, Category, Tag } from "@/lib/supabase";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Card } from "../ui";
import { BouquetMediaGallery, Lightbox } from "@/components/bouquets/bouquet-media-gallery";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { formatPrice } from '@/lib/functions';
import { ShoppingCart, CheckCircle } from 'lucide-react';
import { useCart } from "@/context/cart-context";

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
  const { openCart } = useCart();
  const [showLightbox, setShowLightbox] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isAddedToCart, setIsAddedToCart] = useState(false);

  const navigateToBouquet = (bouquetId: string) => {
    router.push(`/${locale}/bouquet/${bouquetId}`);
  };

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setShowLightbox(true);
  };
  
  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    
    if (isTemplate && onCustomize) {
      onCustomize(bouquet);
    } else {
      // Show adding state
      setIsAddingToCart(true);
      
      // Add to cart
      onAddToCart(bouquet.id);
      
      // Show success state
      setTimeout(() => {
        setIsAddingToCart(false);
        setIsAddedToCart(true);
        
        // Reset after a delay and open cart
        setTimeout(() => {
          setIsAddedToCart(false);
          openCart();
        }, 1000);
      }, 500);
    }
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
        className="group flex cursor-pointer flex-col overflow-hidden rounded-lg border border-pink-100 bg-white shadow-sm transition-all duration-300 hover:shadow-lg h-full"
        onClick={() => navigateToBouquet(bouquet.id)}
      >
        <div className="relative aspect-[4/3] sm:aspect-square">
          <BouquetMediaGallery 
            media={bouquet.media || []}
            alt={bouquet.name} 
            onImageClick={handleImageClick}
          />
          {category && (
            <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-pink-600 text-xs font-medium px-2 py-0.5 rounded-full shadow-sm border border-pink-100">
              {category?.name}
            </div>
          )}
          {!bouquet.in_stock && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
              <span className="rounded-md bg-pink-50 px-2 py-1 text-sm font-medium text-pink-700 ring-1 ring-inset ring-pink-600/20">{t('outOfStock')}</span>
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col p-3 sm:p-4">
          <div className="flex-1">
            <h3 className="text-base sm:text-lg font-bold text-pink-800 transition-colors group-hover:text-pink-600 line-clamp-1">
              {bouquet.name}
            </h3>
            {bouquet.description && (
              <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-500 line-clamp-2 h-[32px] sm:h-[40px] overflow-hidden">
                {bouquet.description}
              </p>
            )}
          </div>
          
          <div>
            {tags.length > 0 && (
              <div className="mb-2 sm:mb-4 flex flex-wrap gap-1 sm:gap-2">
                {tags.slice(0, 2).map(tag => (
                  <span key={tag.id} className="inline-block bg-pink-50 text-pink-700 text-[10px] sm:text-xs font-medium px-1.5 py-0.5 rounded-full">
                    {tag.name}
                  </span>
                ))}
                {tags.length > 2 && (
                  <span className="inline-block bg-pink-50 text-pink-700 text-[10px] sm:text-xs font-medium px-1.5 py-0.5 rounded-full">
                    +{tags.length - 2}
                  </span>
                )}
              </div>
            )}
            <div className="flex items-end justify-between mt-2 sm:mt-3">
              <div className="flex flex-col mr-2 sm:mr-4">
                {bouquet.discount_price && (
                  <span className="text-xs sm:text-sm text-gray-400 line-through">
                    {formatPrice(bouquet.price, locale as string)}
                  </span>
                )}
                <span className="text-base sm:text-xl font-bold text-amber-600">
                  {formatPrice(bouquet.discount_price || bouquet.price, locale as string)}
                </span>
              </div>
              <button 
                onClick={handleAddToCart}
                className={`z-10 flex items-center justify-center min-w-[70px] sm:min-w-[90px] px-2 sm:px-3 py-1 sm:py-1.5 rounded text-xs sm:text-sm font-semibold shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                  isAddedToCart 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gradient-to-r from-pink-500 to-pink-400 hover:from-pink-600 hover:to-pink-500 text-white hover:shadow-md'
                }`}
                disabled={!bouquet.in_stock || isAddingToCart || isAddedToCart}
              >
                {isAddingToCart ? (
                  <span className="flex items-center">
                    <span className="w-4 h-4 border-2 border-white border-b-transparent rounded-full animate-spin mr-1"></span>
                    ...
                  </span>
                ) : isAddedToCart ? (
                  <span className="flex items-center">
                    <CheckCircle size={14} className="mr-1" />
                    {t('added')}
                  </span>
                ) : (
                  <span className="flex items-center">
                    {!isTemplate && <ShoppingCart size={14} className="mr-1" />}
                    {isTemplate ? t('customizeThis') : t('addToCart')}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </Card>
    </>
  );
} 
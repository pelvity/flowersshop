'use client';

import { useState } from "react";
import { Category as BaseCategory } from "@/lib/supabase";
import { useTranslations } from "next-intl";
import { Card } from "../ui";
import Image from "next/image";
import { ChevronDown, ChevronUp } from 'lucide-react';
import { getFileUrl } from "@/utils/cloudflare-worker";

// Extend the base Category type to include media and thumbnail_url
interface CategoryMedia {
  id: string;
  category_id: string;
  file_path: string;
  file_url?: string;
  file_name: string;
  media_type: 'image' | 'video';
  is_thumbnail: boolean;
  display_order: number;
}

interface Category extends BaseCategory {
  media?: CategoryMedia[];
  thumbnail_url?: string;
}

interface CategoryCardProps {
  category: Category;
  onClick: (categoryId: string) => void;
  imageUrl?: string;
}

export default function CategoryCard({ category, onClick, imageUrl }: CategoryCardProps) {
  const t = useTranslations('catalog');
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  
  const handleClick = () => {
    onClick(category.id);
  };
  
  const toggleDescription = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setIsDescriptionExpanded(!isDescriptionExpanded);
  };

  // Get the best image URL for this category
  const getCategoryImageUrl = () => {
    // First check if we have a thumbnail URL
    if (category.thumbnail_url) {
      return category.thumbnail_url;
    }
    
    // Then check if we have media with a thumbnail
    if (category.media && category.media.length > 0) {
      // Look for thumbnail first
      const thumbnail = category.media.find(m => m.is_thumbnail);
      if (thumbnail) {
        return thumbnail.file_url || getFileUrl(thumbnail.file_path);
      }
      
      // Otherwise use the first media item
      const firstMedia = category.media[0];
      return firstMedia.file_url || getFileUrl(firstMedia.file_path);
    }
    
    // Fall back to provided imageUrl or placeholder
    return imageUrl || '/placeholder.svg';
  };

  const categoryImageUrl = getCategoryImageUrl();
  const isPlaceholder = categoryImageUrl === '/placeholder.svg';

  return (
    <div className="group cursor-pointer" onClick={handleClick}>
      <Card className="h-full overflow-hidden transition-all duration-300 hover:shadow-lg border border-pink-100 bg-white">
        <div className={`relative aspect-[4/3] overflow-hidden ${isPlaceholder ? 'bg-gray-100' : ''}`}>
          {isPlaceholder ? (
            <div className="w-full h-full flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
              <Image 
                src={categoryImageUrl}
                alt={category.name}
                width={80}
                height={80}
                className="text-gray-500 opacity-50"
              />
            </div>
          ) : (
            <Image
              src={categoryImageUrl}
              alt={category.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          )}
        </div>
        
        <div className="p-4">
          <h3 className="text-lg font-bold text-pink-700 mb-1">{category.name}</h3>
          
          {category.description && (
            <div className="text-sm text-gray-600">
              {isDescriptionExpanded ? (
                <>
                  <p>{category.description}</p>
                  <button 
                    onClick={toggleDescription} 
                    className="mt-2 text-pink-500 flex items-center text-xs font-medium hover:text-pink-700"
                  >
                    {t('categoryView.showLess')} 
                    <ChevronUp size={16} className="ml-1" />
                  </button>
                </>
              ) : (
                <>
                  <p className="line-clamp-2">{category.description}</p>
                  <button 
                    onClick={toggleDescription} 
                    className="mt-1 text-pink-500 flex items-center text-xs font-medium hover:text-pink-700"
                  >
                    {t('categoryView.showMore')}
                    <ChevronDown size={16} className="ml-1" />
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
} 
'use client';

import { useState, useEffect, useRef } from "react";
import { Container, Section, Card } from "../ui";
import Image from "next/image";
import { useCart } from "@/context/cart-context";
import { Search, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations } from 'next-intl';
import { Bouquet, Category, Tag, BouquetMedia } from "@/lib/supabase";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/supabase";
import { getFileUrl } from "@/utils/cloudflare-worker";

// Custom CSS for the scrollbar
const scrollbarStyles = `
  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }
  
  .no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`;

// Get a valid URL for the image
const getValidImageUrl = (mediaItem: BouquetMedia) => {
  if (!mediaItem) return "/placeholder-bouquet.jpg";
  if (mediaItem.file_url) return mediaItem.file_url;
  if (mediaItem.file_path) return getFileUrl(mediaItem.file_path);
  return "/placeholder-bouquet.jpg";
};

// New props interface to receive initial data from server component
interface CatalogClientProps {
  initialBouquets: Bouquet[];
  initialCategories: Category[];
  initialTags: Tag[];
}

// BouquetMediaGallery component for displaying bouquet images in a carousel
interface BouquetMediaGalleryProps {
  media: BouquetMedia[];
  alt: string;
  onImageClick: () => void;
}

function BouquetMediaGallery({ media, alt, onImageClick }: BouquetMediaGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // If no media present, show placeholder
  if (!media || media.length === 0) {
    return (
      <div className="relative w-full h-48 overflow-hidden group cursor-pointer bg-gray-50" onClick={onImageClick}>
        <div className="w-full h-full transition-transform duration-300 group-hover:scale-105">
          <Image 
            src="/placeholder-bouquet.jpg"
            alt={alt || "Bouquet image"} 
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      </div>
    );
  }
  
  // For single image
  if (media.length === 1) {
    return (
      <div className="relative w-full h-48 overflow-hidden group cursor-pointer" onClick={onImageClick}>
        <div className="w-full h-full transition-transform duration-300 group-hover:scale-105">
          <Image 
            src={getValidImageUrl(media[0])}
            alt={alt || media[0].file_name || "Bouquet image"}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={true}
          />
        </div>
      </div>
    );
  }
  
  // For multiple images
  return (
    <div className="relative w-full h-48 overflow-hidden group">
      {/* Main image */}
      <div 
        className="w-full h-full cursor-pointer transition-transform duration-300 group-hover:scale-105" 
        onClick={onImageClick}
      >
        <Image 
          src={getValidImageUrl(media[currentIndex])}
          alt={alt || media[currentIndex].file_name || "Bouquet image"}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={true}
        />
      </div>
      
      {/* Navigation arrows - show on hover */}
      <button 
        className="absolute left-1 top-1/2 -translate-y-1/2 bg-white/70 rounded-full p-1.5 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-md"
        onClick={(e) => {
          e.stopPropagation();
          setCurrentIndex(prev => (prev === 0 ? media.length - 1 : prev - 1));
        }}
      >
        <ChevronLeft size={18} className="text-pink-600" />
      </button>
      <button 
        className="absolute right-1 top-1/2 -translate-y-1/2 bg-white/70 rounded-full p-1.5 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-md"
        onClick={(e) => {
          e.stopPropagation();
          setCurrentIndex(prev => (prev === media.length - 1 ? 0 : prev + 1));
        }}
      >
        <ChevronRight size={18} className="text-pink-600" />
      </button>
      
      {/* Thumbnail scrolling container - show on hover */}
      <div 
        ref={scrollContainerRef}
        className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 overflow-x-auto py-1.5 px-3 bg-white/70 rounded-full max-w-[80%] no-scrollbar opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      >
        {media.map((item, idx) => (
          <div 
            key={item.id} 
            className={`w-7 h-7 rounded-full flex-shrink-0 border-2 cursor-pointer transition-all duration-200 ${
              idx === currentIndex ? 'border-pink-500 scale-110' : 'border-white/50 hover:border-pink-200'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex(idx);
            }}
          >
            <Image 
              src={getValidImageUrl(item)}
              alt={`Thumbnail ${idx + 1}`}
              width={28}
              height={28}
              className="rounded-full object-cover w-full h-full"
            />
          </div>
        ))}
      </div>
      
      {/* Image counter */}
      <div className="absolute bottom-2 right-2 bg-black/60 rounded-full px-2 py-0.5 text-white text-xs shadow-sm">
        {currentIndex + 1}/{media.length}
      </div>
    </div>
  );
}

// Lightbox component for displaying enlarged images
function Lightbox({ bouquet, onClose, initialIndex = 0 }: { bouquet: Bouquet; onClose: () => void; initialIndex?: number }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const media = bouquet.media || [];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const nextImage = () => {
    setCurrentIndex(prev => (prev === media.length - 1 ? 0 : prev + 1));
  };

  const prevImage = () => {
    setCurrentIndex(prev => (prev === 0 ? media.length - 1 : prev - 1));
  };
  
  const currentMedia = media[currentIndex];
  if (!currentMedia) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <button className="absolute top-4 right-4 text-white hover:text-pink-300 transition-colors z-50" onClick={onClose}>
        <X size={32} />
      </button>

      {media.length > 1 && (
        <>
          <button 
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/70 rounded-full p-2 hover:bg-white text-pink-600 shadow-lg z-50"
            onClick={(e) => { e.stopPropagation(); prevImage(); }}
          >
            <ChevronLeft size={28} />
          </button>
          <button 
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/70 rounded-full p-2 hover:bg-white text-pink-600 shadow-lg z-50"
            onClick={(e) => { e.stopPropagation(); nextImage(); }}
          >
            <ChevronRight size={28} />
          </button>
        </>
      )}
      
      <div className="relative w-full h-full max-w-4xl max-h-[90vh]" onClick={e => e.stopPropagation()}>
        <Image
          src={getValidImageUrl(currentMedia)}
          alt={bouquet.name}
          layout="fill"
          objectFit="contain"
          className="rounded-lg"
        />
      </div>

       <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 rounded-full px-3 py-1 text-white text-sm">
        {currentIndex + 1} / {media.length}
      </div>
    </div>
  );
}

export default function CatalogClient({ initialBouquets, initialCategories, initialTags }: CatalogClientProps) {
  const t = useTranslations('catalog');
  const { addProduct } = useCart();
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');
  
  const [lightboxBouquet, setLightboxBouquet] = useState<Bouquet | null>(null);
  
  // Create Supabase client for any additional data fetching
  const supabase = createClientComponentClient<Database>();
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(categoryParam || null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredBouquets, setFilteredBouquets] = useState<Bouquet[]>(initialBouquets);
  
  // Add scrollbar styles once when component mounts
  useEffect(() => {
    // Add the styles to the head
    const styleTag = document.createElement('style');
    styleTag.innerHTML = scrollbarStyles;
    document.head.appendChild(styleTag);
    
    // Remove the style tag when component unmounts
    return () => {
      document.head.removeChild(styleTag);
    };
  }, []);
  
  // Load initial products and apply filters when dependencies change
  useEffect(() => {
    async function applyFilters() {
      // Start with all bouquets
      let result = [...initialBouquets];
      
      // Filter by category if selected
      if (selectedCategory !== null) {
        result = result.filter(bouquet => bouquet.category_id === selectedCategory);
      }
      
      // Filter by tags if selected
      if (selectedTags.length > 0) {
        result = result.filter(bouquet => {
          // Check if any of the bouquet's tags are in the selected tags
          const bouquetTagsArray = bouquet.tags || [];
          return selectedTags.some(tagId => bouquetTagsArray.includes(tagId));
        });
      }
      
      // Filter by search query if provided
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        result = result.filter(bouquet => 
          bouquet.name.toLowerCase().includes(query) || 
          (bouquet.description && bouquet.description.toLowerCase().includes(query))
        );
      }
      
      setFilteredBouquets(result);
    }

    applyFilters();
  }, [selectedCategory, selectedTags, searchQuery, initialBouquets]);
  
  // Handle tag selection/deselection
  const toggleTag = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId) 
        : [...prev, tagId]
    );
  };
  
  // Handle adding product to cart
  const handleAddToCart = (bouquetId: string) => {
    addProduct(bouquetId, 1);
  };
  
  const openLightbox = (bouquet: Bouquet) => {
    setLightboxBouquet(bouquet);
  };

  const closeLightbox = () => {
    setLightboxBouquet(null);
  };

  // Handle product click to navigate to detail page
  const navigateToBouquet = (bouquetId: string) => {
    router.push(`/bouquet/${bouquetId}`);
  };
  
  return (
    <Section className="bg-gradient-to-b from-pink-50 to-white">
      <Container>
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-pink-700 mb-4">{t('ourCollection')}</h1>
          <p className="text-xl text-pink-400 max-w-3xl mx-auto">
            {t('browseSelection')}
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8 max-w-md mx-auto">
              <div className="relative">
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              className="w-full border border-pink-200 rounded-full py-2 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-pink-400 shadow-sm text-pink-600"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-pink-400">
              <Search size={18} />
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-8">
          {/* Category and Tag Filters */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow-md rounded-lg p-6 sticky top-24 border border-pink-100">
              <div className="mb-6">
                <h3 className="text-lg font-medium text-pink-600 mb-3 border-b border-pink-100 pb-2">{t('categories')}</h3>
                <div className="space-y-2">
                  <div 
                    className={`cursor-pointer px-3 py-2 rounded-md transition-colors ${selectedCategory === null ? 'bg-pink-100 text-pink-700 font-medium' : 'hover:bg-pink-50 text-gray-700'}`}
                    onClick={() => setSelectedCategory(null)}
                  >
                    {t('allCategories')}
                  </div>
                  {initialCategories.map(category => (
                    <div 
                      key={category.id}
                      className={`cursor-pointer px-3 py-2 rounded-md transition-colors ${selectedCategory === category.id ? 'bg-pink-100 text-pink-700 font-medium' : 'hover:bg-pink-50 text-gray-700'}`}
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      {category.name}
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-pink-600 mb-3 border-b border-pink-100 pb-2">{t('tags')}</h3>
                <div className="flex flex-wrap gap-2">
                  {initialTags.map(tag => (
                    <div 
                      key={tag.id}
                      className={`cursor-pointer px-3 py-1 rounded-full text-sm transition-colors ${
                        selectedTags.includes(tag.id) 
                          ? 'bg-gradient-to-r from-pink-500 to-pink-400 text-white shadow-sm' 
                          : 'bg-pink-50 hover:bg-pink-100 text-pink-700'
                      }`}
                      onClick={() => toggleTag(tag.id)}
                    >
                      {tag.name}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Bouquet Grid */}
          <div className="lg:col-span-3">
            {filteredBouquets.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border border-pink-100 shadow-sm">
                <p className="text-pink-400">{t('noResults')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBouquets.map((bouquet) => {
                  // Find the category for this bouquet
                  const category = initialCategories.find(cat => cat.id === bouquet.category_id);
                  
                  // Get tags for this bouquet (if tags array exists)
                  const bouquetTags = initialTags.filter(tag => 
                    bouquet.tags && Array.isArray(bouquet.tags) && bouquet.tags.includes(tag.id)
                  );
                  
                  return (
                    <Card key={bouquet.id} className="flex flex-col overflow-hidden transition-all hover:shadow-lg border border-pink-100 bg-white">
                      <div className="relative">
                        <BouquetMediaGallery 
                          media={bouquet.media || []}
                          alt={bouquet.name} 
                          onImageClick={() => openLightbox(bouquet)}
                        />
                        {category && (
                          <div className="absolute top-2 right-2 bg-white border border-pink-200 text-pink-600 text-xs px-3 py-1 rounded-full shadow-sm">
                            {category?.name}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 p-6 flex flex-col">
                        <div className="flex-1">
                          <h3 
                            className="text-xl font-medium text-pink-700 cursor-pointer hover:text-pink-500"
                            onClick={() => navigateToBouquet(bouquet.id)}
                          >
                            {bouquet.name}
                          </h3>
                          <p className="mt-2 text-base text-gray-600">{bouquet.description}</p>
                          <div className="mt-3 flex flex-wrap gap-1">
                            {bouquetTags.map(tag => (
                              <span key={tag.id} className="inline-block bg-pink-50 text-pink-600 text-xs px-2 py-1 rounded-full">
                                {tag.name}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                          <span className="text-xl font-medium text-amber-600">
                            ₴{bouquet.discount_price || bouquet.price}
                            {bouquet.discount_price && (
                              <span className="text-sm line-through text-gray-400 ml-2">₴{bouquet.price}</span>
                            )}
                          </span>
                          <div className="flex space-x-2">
                            {/* We'll add customization option later if needed */}
                            <button 
                              onClick={() => handleAddToCart(bouquet.id)}
                              className="bg-gradient-to-r from-pink-500 to-pink-400 hover:from-pink-600 hover:to-pink-500 text-white px-4 py-2 rounded-md text-sm shadow-sm transition-colors"
                              disabled={!bouquet.in_stock}
                            >
                              {bouquet.in_stock ? t('addToCart') : t('outOfStock')}
                            </button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </Container>
      {lightboxBouquet && <Lightbox bouquet={lightboxBouquet} onClose={closeLightbox} />}
    </Section>
  );
} 
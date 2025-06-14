'use client';

import { useState, useEffect } from "react";
import { Container, Section, Card } from "../ui";
import { useCart } from "@/context/cart-context";
import { useTranslations } from 'next-intl';
import { Search } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Bouquet, Category, Tag } from "@/lib/supabase";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/supabase";
import { BouquetMediaGallery, Lightbox } from "../bouquets/bouquet-media-gallery";

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

// New props interface to receive initial data from server component
interface CatalogClientProps {
  initialBouquets: Bouquet[];
  initialCategories: Category[];
  initialTags: Tag[];
}

export default function CatalogClientNew({ initialBouquets, initialCategories, initialTags }: CatalogClientProps) {
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
  const [sortOption, setSortOption] = useState<string>("featured");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
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
    applyFilters();
  }, [selectedCategory, selectedTags, searchQuery, sortOption, initialBouquets]);
  
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
    
    // Sort the results
    switch (sortOption) {
      case "price-low":
        result.sort((a, b) => (a.discount_price || a.price) - (b.discount_price || b.price));
        break;
      case "price-high":
        result.sort((a, b) => (b.discount_price || b.price) - (a.discount_price || a.price));
        break;
      case "newest":
        result.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
        break;
      case "featured":
      default:
        // Keep the original order or apply featured sorting logic
        break;
    }
    
    setFilteredBouquets(result);
  }
  
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
  
  const navigateToBouquet = (bouquetId: string) => {
    router.push(`/bouquet/${bouquetId}`);
  };
  
  // Render the bouquet card based on the view mode
  const renderBouquet = (bouquet: Bouquet) => {
    // Find the category for this bouquet
    const category = initialCategories.find(cat => cat.id === bouquet.category_id);
    
    // Get tags for this bouquet (if tags array exists)
    const bouquetTags = initialTags.filter(tag => 
      bouquet.tags && Array.isArray(bouquet.tags) && bouquet.tags.includes(tag.id)
    );
    
    if (viewMode === "list") {
      // List view
      return (
        <Card 
          key={bouquet.id} 
          className="group flex flex-row cursor-pointer overflow-hidden rounded-lg border border-pink-100 bg-white shadow-sm transition-all duration-300 hover:shadow-lg"
          onClick={() => navigateToBouquet(bouquet.id)}
        >
          <div className="w-1/3 relative">
            <BouquetMediaGallery 
              media={bouquet.media || []}
              alt={bouquet.name} 
              onImageClick={(e) => {
                e.stopPropagation();
                openLightbox(bouquet);
              }}
            />
            {!bouquet.in_stock && (
              <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                <span className="rounded-md bg-pink-50 px-2 py-1 text-sm font-medium text-pink-700 ring-1 ring-inset ring-pink-600/20">{t('outOfStock')}</span>
              </div>
            )}
          </div>
          
          <div className="w-2/3 flex flex-col p-4">
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-bold text-pink-800 transition-colors group-hover:text-pink-600">
                  {bouquet.name}
                </h3>
                {category && (
                  <span className="bg-white/90 backdrop-blur-sm text-pink-600 text-xs font-medium px-2 py-0.5 rounded-full shadow-sm border border-pink-100">
                    {category?.name}
                  </span>
                )}
              </div>
              
              {bouquet.description && (
                <p className="mt-2 text-sm text-gray-500">
                  {bouquet.description.length > 120 
                    ? `${bouquet.description.substring(0, 120)}...` 
                    : bouquet.description}
                </p>
              )}
              
              <div className="mt-3 flex flex-wrap gap-2">
                {bouquetTags.slice(0, 5).map(tag => (
                  <span key={tag.id} className="inline-block bg-pink-50 text-pink-700 text-xs font-medium px-2 py-0.5 rounded-full">
                    {tag.name}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-4">
              <div className="flex flex-col">
                {bouquet.discount_price && (
                  <span className="text-sm text-gray-400 line-through">₴{bouquet.price}</span>
                )}
                <span className="text-xl font-bold text-amber-600">
                  ₴{bouquet.discount_price || bouquet.price}
                </span>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddToCart(bouquet.id);
                }}
                className="z-10 bg-gradient-to-r from-pink-500 to-pink-400 text-white px-3 py-1.5 rounded-md text-sm font-semibold shadow-sm transition-all duration-200 hover:from-pink-600 hover:to-pink-500 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!bouquet.in_stock}
              >
                {t('addToCart')}
              </button>
            </div>
          </div>
        </Card>
      );
    } else {
      // Grid view
      return (
        <Card 
          key={bouquet.id} 
          className="group flex flex-col cursor-pointer overflow-hidden rounded-lg border border-pink-100 bg-white shadow-sm transition-all duration-300 hover:shadow-lg"
          onClick={() => navigateToBouquet(bouquet.id)}
        >
          <div className="relative">
            <BouquetMediaGallery 
              media={bouquet.media || []}
              alt={bouquet.name} 
              onImageClick={(e) => {
                e.stopPropagation();
                openLightbox(bouquet);
              }}
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
              <div className="mb-4 flex flex-wrap gap-2">
                {bouquetTags.slice(0, 3).map(tag => (
                  <span key={tag.id} className="inline-block bg-pink-50 text-pink-700 text-xs font-medium px-2 py-1 rounded-full">
                    {tag.name}
                  </span>
                ))}
              </div>
              <div className="flex items-end justify-between">
                <div className="flex flex-col">
                  {bouquet.discount_price && (
                    <span className="text-sm text-gray-400 line-through">₴{bouquet.price}</span>
                  )}
                  <span className="text-xl font-bold text-amber-600">
                    ₴{bouquet.discount_price || bouquet.price}
                  </span>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToCart(bouquet.id);
                  }}
                  className="z-10 bg-gradient-to-r from-pink-500 to-pink-400 text-white px-3 py-1.5 rounded-md text-sm font-semibold shadow-sm transition-all duration-200 hover:from-pink-600 hover:to-pink-500 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!bouquet.in_stock}
                >
                  {t('addToCart')}
                </button>
              </div>
            </div>
          </div>
        </Card>
      );
    }
  };
  
  // Rest of the component rendering...
  return (
    <>
      {lightboxBouquet && (
        <Lightbox 
          bouquet={lightboxBouquet} 
          onClose={closeLightbox} 
        />
      )}
      
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
            
            {/* Bouquet Grid/List */}
            <div className="lg:col-span-3">
              {/* Sort and View options */}
              <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                <div className="flex items-center">
                  <label className="text-gray-600 mr-2">{t('sortBy')}:</label>
                  <select 
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className="border border-pink-200 rounded-md px-3 py-1.5 text-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-400 shadow-sm"
                  >
                    <option value="featured">{t('featured')}</option>
                    <option value="price-low">{t('priceLowToHigh')}</option>
                    <option value="price-high">{t('priceHighToLow')}</option>
                    <option value="newest">{t('newest')}</option>
                  </select>
                </div>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setViewMode("grid")}
                    className={`p-1.5 rounded-md ${viewMode === "grid" ? 'bg-pink-100 text-pink-700' : 'text-gray-500 hover:bg-pink-50'}`}
                    aria-label="Grid view"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="7" height="7" />
                      <rect x="14" y="3" width="7" height="7" />
                      <rect x="3" y="14" width="7" height="7" />
                      <rect x="14" y="14" width="7" height="7" />
                    </svg>
                  </button>
                  <button 
                    onClick={() => setViewMode("list")}
                    className={`p-1.5 rounded-md ${viewMode === "list" ? 'bg-pink-100 text-pink-700' : 'text-gray-500 hover:bg-pink-50'}`}
                    aria-label="List view"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="8" y1="6" x2="21" y2="6" />
                      <line x1="8" y1="12" x2="21" y2="12" />
                      <line x1="8" y1="18" x2="21" y2="18" />
                      <line x1="3" y1="6" x2="3.01" y2="6" />
                      <line x1="3" y1="12" x2="3.01" y2="12" />
                      <line x1="3" y1="18" x2="3.01" y2="18" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* Results count */}
              <div className="mb-4 text-sm text-gray-500">
                {t('showing')} {filteredBouquets.length} {t('results')}
              </div>
              
              {filteredBouquets.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border border-pink-100 shadow-sm">
                  <p className="text-pink-400">{t('noResults')}</p>
                </div>
              ) : (
                <div className={viewMode === "grid" 
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  : "flex flex-col gap-4"
                }>
                  {filteredBouquets.map(bouquet => renderBouquet(bouquet))}
                </div>
              )}
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
} 

'use client';

import { useState, useEffect } from "react";
import { Container, Section, Card } from "../ui";
import { useCart } from "@/context/cart-context";
import { Search } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTranslations } from 'next-intl';
import { Bouquet, Category, Tag } from "@/lib/supabase";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/supabase";
import BouquetCard from "../bouquets/bouquet-card";
import CategoryCard from "../categories/category-card";
import { fetchTagsForBouquet } from "@/lib/api-client";
import Image from "next/image";

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

// Props interface to receive initial data from server component
interface CatalogClientProps {
  initialBouquets: Bouquet[];
  initialCategories: Category[];
  initialTags: Tag[];
  initialFlowers: any[]; // List of flowers for filtering
  showCategoriesAsCards?: boolean; // New prop to control the display mode
}

export default function CatalogClient({ 
  initialBouquets, 
  initialCategories, 
  initialTags, 
  initialFlowers,
  showCategoriesAsCards = false
}: CatalogClientProps) {
  const t = useTranslations('catalog');
  const { addProduct } = useCart();
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');
  
  // Create Supabase client for any additional data fetching
  const supabase = createClientComponentClient<Database>();
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(categoryParam || null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedFlowers, setSelectedFlowers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredBouquets, setFilteredBouquets] = useState<Bouquet[]>(initialBouquets);
  const [bouquetTagsMap, setBouquetTagsMap] = useState<Record<string, Tag[]>>({});
  const [isLoadingTags, setIsLoadingTags] = useState(true);
  const [showFlowerFilters, setShowFlowerFilters] = useState(false);
  const [showBouquets, setShowBouquets] = useState(!showCategoriesAsCards || (categoryParam !== null));
  
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
  
  // Load tags for each bouquet
  useEffect(() => {
    const loadTagsForBouquets = async () => {
      setIsLoadingTags(true);
        const tagsMap: Record<string, Tag[]> = {};
        
        for (const bouquet of initialBouquets) {
        try {
          const tags = await fetchTagsForBouquet(bouquet.id);
          tagsMap[bouquet.id] = tags;
        } catch (error) {
          console.error(`Failed to load tags for bouquet ${bouquet.id}:`, error);
          tagsMap[bouquet.id] = [];
        }
        }
        
        setBouquetTagsMap(tagsMap);
        setIsLoadingTags(false);
    };
    
    loadTagsForBouquets();
  }, [initialBouquets]);
  
  // Filter bouquets based on selected category, tags, and search query
  useEffect(() => {
    async function applyFilters() {
      let result = [...initialBouquets];
      
      // Filter by category if selected
      if (selectedCategory) {
        result = result.filter(bouquet => bouquet.category_id === selectedCategory);
      }
      
      // Filter by selected tags if any
      if (selectedTags.length > 0) {
        result = result.filter(bouquet => {
          const bouquetTags = bouquetTagsMap[bouquet.id] || [];
          return selectedTags.some(tagId => 
            bouquetTags.some(tag => tag.id === tagId)
          );
        });
      }
      
      // Filter by selected flowers if any
      if (selectedFlowers.length > 0) {
        result = result.filter(bouquet => {
          // Check if bouquet.flowers exists and is an array
          const bouquetFlowers = bouquet.flowers || [];
          if (!Array.isArray(bouquetFlowers) || bouquetFlowers.length === 0) {
            return false;
          }
          return selectedFlowers.some(flowerId => 
            bouquetFlowers.some((flower: any) => flower.flower_id === flowerId)
          );
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
  }, [selectedCategory, selectedTags, selectedFlowers, searchQuery, initialBouquets, bouquetTagsMap]);

  const handleAddToCart = (bouquetId: string) => {
    const bouquet = initialBouquets.find(b => b.id === bouquetId);
    if (bouquet) {
      addProduct(bouquet.id);
    }
  };

  // Function to handle category selection
  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    if (showCategoriesAsCards) {
      setShowBouquets(true);
    }
    
    // Update URL with the category parameter
    const newParams = new URLSearchParams(searchParams);
    newParams.set('category', categoryId);
    router.push(`?${newParams.toString()}`);
  };

  // Function to go back to categories
  const handleBackToCategories = () => {
    setShowBouquets(false);
    setSelectedCategory(null);
    
    // Remove category parameter from URL
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('category');
    router.push(`?${newParams.toString()}`);
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

        {/* Display categories as cards if showCategoriesAsCards is true and no category is selected */}
        {showCategoriesAsCards && !showBouquets ? (
          <>
            {/* Search Bar for categories view */}
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
            
            {/* Categories Grid using CategoryCard component */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {initialCategories
                .filter(category => 
                  searchQuery ? category.name.toLowerCase().includes(searchQuery.toLowerCase()) : true
                )
                .map(category => (
                  <CategoryCard
                    key={category.id}
                    category={category}
                    onClick={handleCategorySelect}
                  />
                ))}
            </div>
          </>
        ) : (
          <>
            {/* Show back button if we're in bouquet view with categories as cards */}
            {showCategoriesAsCards && (
              <div className="mb-8">
              <button 
                onClick={handleBackToCategories}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
              >
                  ← {t('backToCategories')}
              </button>
              </div>
            )}

            {/* Search Bar for bouquets view */}
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
                  
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-pink-600 mb-3 border-b border-pink-100 pb-2">{t('tags')}</h3>
                    <div className="space-y-2">
                      {initialTags.map(tag => (
                        <div 
                          key={tag.id}
                          className={`cursor-pointer px-3 py-2 rounded-md transition-colors flex items-center ${selectedTags.includes(tag.id) ? 'bg-pink-100 text-pink-700 font-medium' : 'hover:bg-pink-50 text-gray-700'}`}
                          onClick={() => {
                            setSelectedTags(prev => 
                              prev.includes(tag.id) 
                                ? prev.filter(id => id !== tag.id) 
                                : [...prev, tag.id]
                            );
                          }}
                        >
                          <div className={`w-4 h-4 mr-2 rounded-sm border ${selectedTags.includes(tag.id) ? 'bg-pink-500 border-pink-500' : 'border-gray-400'}`}>
                            {selectedTags.includes(tag.id) && (
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-4 h-4">
                                <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                            {tag.name}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h3 
                      className="text-lg font-medium text-pink-600 mb-3 border-b border-pink-100 pb-2 flex justify-between items-center cursor-pointer"
                      onClick={() => setShowFlowerFilters(!showFlowerFilters)}
                    >
                      {t('flowers')}
                      <span className="text-sm">
                        {showFlowerFilters ? '−' : '+'}
                      </span>
                    </h3>
                    
                    {showFlowerFilters && (
                      <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar">
                        {initialFlowers.map(flower => (
                          <div 
                            key={flower.id}
                            className={`cursor-pointer px-3 py-2 rounded-md transition-colors flex items-center ${selectedFlowers.includes(flower.id) ? 'bg-pink-100 text-pink-700 font-medium' : 'hover:bg-pink-50 text-gray-700'}`}
                            onClick={() => {
                              setSelectedFlowers(prev => 
                                prev.includes(flower.id) 
                                  ? prev.filter(id => id !== flower.id) 
                                  : [...prev, flower.id]
                              );
                            }}
                          >
                            <div className={`w-4 h-4 mr-2 rounded-sm border ${selectedFlowers.includes(flower.id) ? 'bg-pink-500 border-pink-500' : 'border-gray-400'}`}>
                              {selectedFlowers.includes(flower.id) && (
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-4 h-4">
                                  <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                              {flower.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
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
                      
                      // Get tags for this bouquet from our map
                      const bouquetTags = bouquetTagsMap[bouquet.id] || [];
                      
                      return (
                        <BouquetCard 
                          key={bouquet.id}
                          bouquet={bouquet}
                          category={category}
                          tags={bouquetTags}
                          onAddToCart={handleAddToCart}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </Container>
    </Section>
  );
} 
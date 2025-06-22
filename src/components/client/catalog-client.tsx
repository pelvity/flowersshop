'use client';

import { useState, useEffect } from "react";
import { Container, Section } from "../ui";
import { useCart } from "@/context/cart-context";
import { Search } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTranslations } from 'next-intl';
import { Bouquet, Category, Tag } from "@/lib/supabase";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/supabase";
import BouquetCard from "../bouquets/bouquet-card";
import { fetchTagsForBouquet } from "@/lib/api-client";

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
  initialFlowers: any[]; // List of flowers for filtering
}

export default function CatalogClient({ initialBouquets, initialCategories, initialTags, initialFlowers }: CatalogClientProps) {
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
          // Check if any of the bouquet's tags match the selected tags
          // Access our loaded tag map instead of the bouquet.tags property
          const bouquetTags = bouquetTagsMap[bouquet.id] || [];
          return selectedTags.some(selectedTagId => 
            bouquetTags.some(tag => tag.id === selectedTagId)
          );
        });
      }
      
      // Filter by flowers if selected
      if (selectedFlowers.length > 0) {
        result = result.filter(bouquet => {
          // Check if the bouquet contains any of the selected flowers
          const bouquetFlowers = bouquet.flowers || [];
          return selectedFlowers.some(selectedFlowerId => 
            bouquetFlowers.some((flower: any) => flower.flower_id === selectedFlowerId)
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
  
  // Load tags for all bouquets
  useEffect(() => {
    async function loadBouquetTags() {
      if (!initialBouquets || initialBouquets.length === 0) {
        setIsLoadingTags(false);
        return;
      }
      
      setIsLoadingTags(true);
      const tagsMap: Record<string, Tag[]> = {};
      
      try {
        // Load tags for each bouquet
        for (const bouquet of initialBouquets) {
          try {
            const bouquetTags = await fetchTagsForBouquet(bouquet.id);
            tagsMap[bouquet.id] = bouquetTags;
          } catch (error) {
            console.error(`Error loading tags for bouquet ${bouquet.id}:`, error);
            tagsMap[bouquet.id] = [];
          }
        }
      } catch (error) {
        console.error('Error loading bouquet tags:', error);
      } finally {
        setBouquetTagsMap(tagsMap);
        setIsLoadingTags(false);
      }
    }
    
    loadBouquetTags();
  }, [initialBouquets]);
  
  // Handle tag selection/deselection
  const toggleTag = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId) 
        : [...prev, tagId]
    );
  };
  
  // Handle flower selection/deselection
  const toggleFlower = (flowerId: string) => {
    setSelectedFlowers(prev => 
      prev.includes(flowerId) 
        ? prev.filter(id => id !== flowerId) 
        : [...prev, flowerId]
    );
  };
  
  // Handle adding product to cart
  const handleAddToCart = (bouquetId: string) => {
    addProduct(bouquetId, 1);
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
              
              <div className="mb-6">
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
              
              {/* Flowers filter section */}
              <div className="mb-6">
                <div 
                  className="flex items-center justify-between cursor-pointer mb-3 border-b border-pink-100 pb-2"
                  onClick={() => setShowFlowerFilters(!showFlowerFilters)}
                >
                  <h3 className="text-lg font-medium text-pink-600">
                    {t('flowers')}
                  </h3>
                  <span className={`transform transition-transform ${showFlowerFilters ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </div>
                
                {showFlowerFilters && (
                  <div className="max-h-60 overflow-y-auto no-scrollbar">
                    {initialFlowers.map(flower => (
                      <div 
                        key={flower.id}
                        className={`flex items-center gap-2 cursor-pointer px-3 py-2 rounded-md transition-colors ${
                          selectedFlowers.includes(flower.id) 
                            ? 'bg-pink-100 text-pink-700 font-medium'
                            : 'hover:bg-pink-50 text-gray-700'
                        }`}
                        onClick={() => toggleFlower(flower.id)}
                      >
                        <input 
                          type="checkbox" 
                          checked={selectedFlowers.includes(flower.id)}
                          onChange={() => {}} // Handled by parent div click
                          className="accent-pink-500"
                        />
                        {flower.name}
                      </div>
                    ))}
                  </div>
                )}
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
      </Container>
    </Section>
  );
} 
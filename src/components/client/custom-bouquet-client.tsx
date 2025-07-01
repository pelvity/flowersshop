'use client';

import { useState, useEffect, useMemo } from "react";
import { Container, Section, Card } from "../ui";
import Image from "next/image";
import { useTranslations, useLocale } from 'next-intl';
import { Plus, Minus, X, ShoppingCart, PlusCircle, CheckCircle } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { useCart } from "@/context/cart-context";
import { Flower as FlowerType, FlowerQuantity, Bouquet } from "@/lib/supabase";
import { v4 as uuidv4 } from 'uuid';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/supabase";
import { toUUID } from "@/utils/uuid";
import { formatPrice } from '@/lib/functions';
import { getValidImageUrlClient } from "@/utils/image-utils-client";
import BouquetCard from "../bouquets/bouquet-card";

// The Flower type from lib/supabase doesn't have colors or image, so we extend it.
interface Flower extends FlowerType {
  colors?: string[];
  image?: string | null;
}

// Update props to include initialFlowers and initialTemplateBouquets
interface CustomBouquetClientProps {
  initialFlowers: Flower[];
  initialTemplateBouquets?: Bouquet[];
}

// Color selection modal component
interface ColorSelectionModalProps {
  flower: Flower;
  onSelect: (flower: Flower, color: string) => void;
  onClose: () => void;
  getColorHex: (colorName: string | undefined) => string;
}

function ColorSelectionModal({ flower, onSelect, onClose, getColorHex }: ColorSelectionModalProps) {
  const t = useTranslations('customBouquet');
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={24} />
        </button>
        
        <div className="flex items-center mb-4">
          {flower.image && (
            <div className="relative h-16 w-16 mr-4">
              <Image 
                src={flower.image} 
                alt={flower.name} 
                fill 
                className="object-cover rounded-md"
              />
            </div>
          )}
          <div>
            <h3 className="text-xl font-bold text-pink-700">{flower.name}</h3>
            <p className="text-gray-500">{t('selectColor')}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3 mt-4">
          {(flower.colors && flower.colors.length > 0 ? flower.colors : ['mixed']).map(color => (
            <button
              key={color}
              onClick={() => onSelect(flower, color)}
              className="flex items-center p-3 border border-pink-100 rounded-md hover:bg-pink-50 transition-colors"
            >
              <div 
                className="inline-flex items-center px-2.5 py-1 rounded-md mr-2"
                style={{ 
                  backgroundColor: `${getColorHex(color)}20`, 
                  color: "#be185d",
                  borderColor: getColorHex(color)
                }}
              >
                <div 
                  className="w-3 h-3 mr-1 rounded-full" 
                  style={{ backgroundColor: getColorHex(color) }}
                />
                <span className="text-sm font-medium capitalize" style={{ color: "#be185d" }}>{color}</span>
              </div>
            </button>
          ))}
        </div>
        
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
          >
            {t('cancel')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CustomBouquetClient({ initialFlowers, initialTemplateBouquets = [] }: CustomBouquetClientProps) {
  const t = useTranslations('customBouquet');
  const router = useRouter();
  const searchParams = useSearchParams();
  const bouquetId = searchParams.get('bouquetId');
  const locale = useLocale();
  const { addCustomBouquet, addProduct, openCart } = useCart();
  
  // Create Supabase client
  const supabase = createClientComponentClient<Database>();
  const [bouquetDetails, setBouquetDetails] = useState<any>(null);
  
  // State for custom bouquet
  const [selectedFlowers, setSelectedFlowers] = useState<FlowerQuantity[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [step, setStep] = useState<'template' | 'customize' | 'review'>(
    bouquetId ? 'customize' : 'template'
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Success notification state
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  
  // State for template bouquets
  const [templateBouquets, setTemplateBouquets] = useState<Bouquet[]>(initialTemplateBouquets);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  
  // State for color selection modal
  const [colorModalOpen, setColorModalOpen] = useState(false);
  const [selectedFlowerForColor, setSelectedFlowerForColor] = useState<Flower | null>(null);
  
  // Add CSS for animation when component mounts
  useEffect(() => {
    // Add animation styles to the document head if not already present
    if (typeof document !== 'undefined') {
      const styleId = 'custom-bouquet-animations';
      if (!document.getElementById(styleId)) {
        const styleTag = document.createElement('style');
        styleTag.id = styleId;
        styleTag.textContent = `
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in {
            animation: fadeIn 0.3s ease-out forwards;
          }
        `;
        document.head.appendChild(styleTag);
      }
    }
  }, []);
  
  // Fetch template bouquets when component mounts if none were provided
  useEffect(() => {
    async function fetchTemplateBouquets() {
      if (initialTemplateBouquets.length > 0) {
        setTemplateBouquets(initialTemplateBouquets);
        return;
      }
      
      setLoadingTemplates(true);
      try {
        const { data, error } = await supabase
          .from('bouquets')
          .select('*, media(*)')
          .eq('in_stock', true)
          .order('name');
          
        if (error) throw error;
        setTemplateBouquets(data || []);
      } catch (error) {
        console.error('Error fetching template bouquets:', error);
      } finally {
        setLoadingTemplates(false);
      }
    }
    
    fetchTemplateBouquets();
  }, [supabase, initialTemplateBouquets]);
  
  // Update step when bouquetId changes
  useEffect(() => {
    if (bouquetId) {
      setStep('customize');
    }
  }, [bouquetId]);

  // Fetch bouquet details if bouquetId is provided
  useEffect(() => {
    async function fetchBouquetDetails() {
      if (!bouquetId) return;
      
      setLoading(true);
      try {
        // First get the bouquet
        
        // Make sure we're using the correct UUID format with dashes
        let formattedUUID = bouquetId;
        if (!formattedUUID.includes('-')) {
          // Add dashes if they're missing (8-4-4-4-12 format)
          formattedUUID = [
            bouquetId.slice(0, 8),
            bouquetId.slice(8, 12),
            bouquetId.slice(12, 16),
            bouquetId.slice(16, 20),
            bouquetId.slice(20)
          ].join('-');
        }
        
        const { data: bouquet, error: bouquetError } = await supabase
          .from('bouquets')
          .select('*')
          .eq('id', formattedUUID)
          .single();
        
        if (bouquetError) {
          console.error('Error fetching bouquet:', bouquetError);
          throw bouquetError;
        }
        
        // Then get the bouquet flowers
        const { data: bouquetFlowers, error: flowersError } = await supabase
          .from('bouquet_flowers')
          .select(`
            id,
            bouquet_id,
            flower_id,
            quantity
          `)
          .eq('bouquet_id', formattedUUID);
          
        if (flowersError) {
          console.error('Error fetching bouquet flowers:', flowersError);
          throw flowersError;
        }
        
        if (bouquetFlowers && bouquetFlowers.length > 0) {
          // Convert to FlowerQuantity[] format
          const flowersInBouquet: FlowerQuantity[] = bouquetFlowers.map(bf => {
            const flowerInfo = initialFlowers.find(f => f.id === bf.flower_id);
            const defaultColor = flowerInfo?.colors?.[0] || 'mixed';
            
            return {
              flowerId: bf.flower_id,
              quantity: bf.quantity,
              color: defaultColor
            };
          });
          
          setSelectedFlowers(flowersInBouquet);
          setBouquetDetails(bouquet);
        } else {
          setBouquetDetails(bouquet);
          // Even if no flowers found, we should still set the bouquet details
        }
      } catch (error) {
        console.error('Error fetching bouquet details:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchBouquetDetails();
  }, [bouquetId, supabase]);
  
  // Calculate total price whenever selected flowers change
  useEffect(() => {
    // Calculate total price from selected flowers
    const price = selectedFlowers.reduce((total, flowerQty) => {
      const flower = initialFlowers.find(f => f.id === flowerQty.flowerId);
      if (flower) {
        return total + (flower.price * flowerQty.quantity);
      }
      return total;
    }, 0);
    
    setTotalPrice(price);
  }, [selectedFlowers, initialFlowers]);
  
  // Filter flowers based on search query
  const filteredFlowers = useMemo(() => {
    if (!searchQuery.trim()) {
      return initialFlowers;
    }
    
    return initialFlowers.filter(flower => 
      flower.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (flower.description && flower.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [initialFlowers, searchQuery]);
  
  // Helper function to add a flower
  const addFlower = (flower: Flower, color: string) => {
    setSelectedFlowers(prev => {
      // Check if this flower with the same color already exists
      const existingIndex = prev.findIndex(item => 
        item.flowerId === flower.id && item.color === color
      );
      
      if (existingIndex >= 0) {
        // Update quantity of existing flower
        const updatedFlowers = [...prev];
        updatedFlowers[existingIndex] = {
          ...updatedFlowers[existingIndex],
          quantity: updatedFlowers[existingIndex].quantity + 1
        };
        return updatedFlowers;
      } else {
        // Add new flower
        return [...prev, { flowerId: flower.id, quantity: 1, color }];
      }
    });
  };
  
  // Helper function to add a flower with default color
  const addFlowerWithDefaultColor = (flower: Flower) => {
    // If the flower has colors, always show the color selection modal
    if (flower.colors && flower.colors.length > 0) {
      setSelectedFlowerForColor(flower);
      setColorModalOpen(true);
    } else {
      // If no colors defined for this flower, use 'mixed' as fallback
      addFlower(flower, 'mixed');
    }
  };
  
  // Helper function to handle color selection from modal
  const handleColorSelect = (flower: Flower, color: string) => {
    addFlower(flower, color);
    setColorModalOpen(false);
    setSelectedFlowerForColor(null);
  };
  
  // Helper function to remove a flower
  const removeFlower = (index: number) => {
    setSelectedFlowers(prev => {
      if (prev[index].quantity > 1) {
        // Decrease quantity
        const updatedFlowers = [...prev];
        updatedFlowers[index] = {
          ...updatedFlowers[index],
          quantity: updatedFlowers[index].quantity - 1
        };
        return updatedFlowers;
      } else {
        // Remove the flower entirely
        return prev.filter((_, i) => i !== index);
      }
    });
  };
  
  // Helper function to change flower color
  const changeFlowerColor = (index: number, color: string) => {
    setSelectedFlowers(prev => {
      const updatedFlowers = [...prev];
      updatedFlowers[index] = {
        ...updatedFlowers[index],
        color
      };
      return updatedFlowers;
    });
  };
  
  // Add to cart with bouquetId as basedOn if we're customizing an existing bouquet
  const addToCart = () => {
    // Show loading state
    setLoading(true);
    
    // Add flower names to the selected flowers
    const flowersWithNames = selectedFlowers.map(flower => {
      const flowerInfo = initialFlowers.find(f => f.id === flower.flowerId);
      return {
        ...flower,
        flowerName: flowerInfo?.name || 'Flower'
      };
    });
    
    // Add to cart with bouquetId as basedOn if we're customizing an existing bouquet
    addCustomBouquet(
      flowersWithNames,
      bouquetId || undefined,
      bouquetDetails?.name ? `Custom ${bouquetDetails.name}` : t('title')
    );
    
    // Stop loading and show success feedback
    setTimeout(() => {
      setLoading(false);
      
      // Show success notification
      setShowSuccessNotification(true);
      
      // Hide notification after 3 seconds
      setTimeout(() => {
        setShowSuccessNotification(false);
        // Return to templates view after notification
        setStep('template');
        
        // Clear selection if starting a new bouquet
        if (!bouquetId) {
          setSelectedFlowers([]);
        }
        
        // Open cart drawer
        openCart();
      }, 1500);
    }, 500);
  };
  
  // Function to select a template bouquet
  const selectTemplateBouquet = (bouquet: Bouquet) => {
    // Set step to customize immediately
    setStep('customize');
    
    // Navigate to the URL with the bouquet ID
    router.push(`/${locale}/custom-bouquet?bouquetId=${bouquet.id}`);
    
    // Force a page reload to ensure the component is re-initialized with the new bouquetId
    // This is needed because the router.push doesn't trigger a full page reload
    window.location.href = `/${locale}/custom-bouquet?bouquetId=${bouquet.id}`;
  };
  
  // Add to cart directly from template card
  const handleAddToCart = (bouquetId: string) => {
    addProduct(bouquetId);
  };
  
  // Templates view
  const renderTemplates = () => (
    <div className="py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-pink-700 mb-4">{t('createYourOwn')}</h1>
        <p className="text-xl text-pink-400 max-w-3xl mx-auto">
          {t('customizeDescription')}
        </p>
      </div>
      
      <div className="mb-8 flex flex-col items-center">
        <h2 className="text-2xl font-bold text-pink-600 mb-6">{t('chooseTemplate')}</h2>
        
        {loadingTemplates ? (
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
            {/* Start from scratch card */}
            <Card 
              onClick={() => setStep('customize')}
              className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow border border-pink-100 flex flex-col h-full bg-white"
            >
              <div className="relative h-48 bg-gradient-to-r from-pink-100 to-pink-200 flex items-center justify-center">
                <PlusCircle size={64} className="text-pink-500" />
              </div>
              <div className="p-4 flex-grow flex flex-col">
                <h3 className="font-semibold text-lg text-pink-700">{t('startFromScratch')}</h3>
                <p className="text-sm text-gray-500 mt-1 flex-grow">
                  {t('startFromScratchDescription')}
                </p>
                <div className="mt-4">
                  <button className="w-full bg-gradient-to-r from-pink-500 to-pink-400 hover:from-pink-600 hover:to-pink-500 text-white px-4 py-2 rounded-md font-medium shadow-sm transition-colors">
                    {t('start')}
                  </button>
                </div>
              </div>
            </Card>
            
            {/* Template bouquets using BouquetCard */}
            {templateBouquets.map(bouquet => (
              <BouquetCard 
                key={bouquet.id}
                bouquet={bouquet} 
                onAddToCart={handleAddToCart}
                isTemplate={true}
                onCustomize={selectTemplateBouquet}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
  
  // Customization view
  const renderCustomize = () => (
    <div className="py-8">
      <div className="mb-8 flex justify-between items-center">
        <button 
          onClick={() => setStep('template')} 
          className="text-pink-600 hover:text-pink-700 font-medium"
        >
          ← {t('backToTemplates')}
        </button>
        
        <h1 className="text-3xl font-bold text-pink-700">
          {t('title')}
        </h1>
        
        <button 
          onClick={() => setStep('review')}
          className="bg-gradient-to-r from-pink-500 to-pink-400 hover:from-pink-600 hover:to-pink-500 text-white px-4 py-2 rounded-md shadow-sm transition-colors"
          disabled={selectedFlowers.length === 0}
        >
          {t('continueToReview')}
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Flower selection panel */}
        <div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-medium text-pink-700">{t('selectFlowers')}</h2>
            <div className="relative">
              <input
                type="text"
                placeholder={t('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border border-pink-200 rounded-full py-1 px-3 pl-8 focus:outline-none focus:ring-2 focus:ring-pink-400 shadow-sm text-pink-600 text-sm"
              />
              <div className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-pink-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredFlowers.map(flower => (
              <Card 
                key={flower.id} 
                className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow border border-pink-100"
                onClick={() => addFlowerWithDefaultColor(flower)}
              >
                <div className="relative h-24">
                  <Image 
                    src={flower.image || '/placeholder.svg'} 
                    alt={flower.name} 
                    fill 
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                  
                  {/* Add to bouquet button overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 flex items-center justify-center transition-all duration-200 opacity-0 hover:opacity-100">
                    <div className="bg-white rounded-full p-2 shadow-md">
                      <Plus size={20} className="text-pink-600" />
                    </div>
                  </div>
                </div>
                
                <div className="p-3">
                  <p className="font-medium text-pink-700 truncate">{flower.name}</p>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-sm text-gray-500">{formatPrice(flower.price, locale)} {t('each')}</p>
                  </div>
                  
                  {/* Color chips - show as tags */}
                  {flower.colors && flower.colors.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {flower.colors.slice(0, 3).map(color => (
                        <div 
                          key={color}
                          className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium"
                          style={{ 
                            backgroundColor: `${getColorHex(color)}20`, 
                            color: "#be185d",
                            borderColor: getColorHex(color)
                          }}
                        >
                          <div 
                            className="w-2 h-2 mr-1 rounded-full" 
                            style={{ backgroundColor: getColorHex(color) }}
                          />
                          <span style={{ color: "#be185d" }}>{color}</span>
                        </div>
                      ))}
                      {flower.colors.length > 3 && (
                        <div className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-600">
                          +{flower.colors.length - 3}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Selected flowers panel */}
        <div className="space-y-4">
          <h2 className="text-xl font-medium text-pink-700">{t('selectedFlowers')}</h2>
          
          {selectedFlowers.length > 0 ? (
            <div className="space-y-3">
              {selectedFlowers.map((item, index) => {
                const flower = initialFlowers.find(f => f.id === item.flowerId);
                if (!flower) return null;

                return (
                  <Card key={index} className="p-3 flex items-center justify-between border border-pink-100">
                    <div className="flex items-center">
                      <Image 
                        src={flower.image || '/placeholder.svg'} 
                        alt={flower.name} 
                        width={40} 
                        height={40} 
                        className="rounded-md object-cover"
                      />
                      <div className="ml-3">
                        <p className="font-medium text-pink-700">{flower.name}</p>
                        <div className="flex items-center mt-1">
                          <button onClick={() => removeFlower(index)} className="p-1 text-gray-500 hover:text-red-500"><Minus size={14} /></button>
                          <span className="mx-2 text-pink-600">{item.quantity}</span>
                          <button onClick={() => addFlower(flower, item.color)} className="p-1 text-gray-500 hover:text-green-500"><Plus size={14} /></button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end">
                      <p className="font-medium text-amber-600">
                        {formatPrice(flower.price * item.quantity, locale)}
                      </p>
                      <div className="flex items-center mt-1">
                        <div 
                          className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium"
                          style={{ 
                            backgroundColor: `${getColorHex(item.color)}20`, 
                            color: "#be185d",
                            borderColor: getColorHex(item.color)
                          }}
                        >
                          <div 
                            className="w-2 h-2 mr-1 rounded-full" 
                            style={{ backgroundColor: getColorHex(item.color) }}
                          />
                          <span className="capitalize" style={{ color: "#be185d" }}>{item.color}</span>
                        </div>
                        <select
                          value={item.color}
                          onChange={(e) => changeFlowerColor(index, e.target.value)}
                          className="ml-2 text-xs border border-pink-200 rounded py-1 px-2 focus:outline-none focus:ring-1 focus:ring-pink-400 bg-white"
                          aria-label={t('color')}
                        >
                          {(flower.colors && flower.colors.length > 0 ? flower.colors : ['mixed']).map((color: string) => (
                            <option key={color} value={color}>{color}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 px-4 border-2 border-dashed border-pink-100 rounded-lg">
              <p className="text-pink-400">{t('emptySelection')}</p>
            </div>
          )}

          <div className="border-t border-pink-100 pt-4 mt-4">
            <div className="flex justify-between items-center font-bold text-pink-700 text-lg">
              <span>{t('totalPrice')}:</span>
              <span>{formatPrice(totalPrice, locale)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  
  // Review view
  const renderReview = () => (
    <div className="py-8">
      <div className="mb-8 flex justify-between items-center">
        <button 
          onClick={() => setStep('customize')} 
          className="text-pink-600 hover:text-pink-700 font-medium"
        >
          ← {t('backToCustomize')}
        </button>
        <h1 className="text-3xl font-bold text-pink-700">{t('reviewYourBouquet')}</h1>
        <div/>
      </div>

      <div className="max-w-3xl mx-auto">
        <Card className="p-6 border border-pink-100">
          <h2 className="text-2xl font-semibold text-pink-700 mb-4">{t('yourBouquetSummary')}</h2>
          
          <div className="space-y-4 mb-6">
            {selectedFlowers.map((item, index) => {
              const flower = initialFlowers.find(f => f.id === item.flowerId);
              if (!flower) return null;

              return (
                <div key={index} className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Image 
                      src={flower.image || '/placeholder.svg'} 
                      alt={flower.name} 
                      width={48} 
                      height={48} 
                      className="rounded-md object-cover"
                    />
                    <div className="ml-4">
                      <p className="font-medium text-pink-700">{flower.name}</p>
                      <div className="flex items-center">
                        <p className="text-sm text-gray-500">
                          {t('quantity')}: {item.quantity}
                        </p>
                        <div className="flex items-center ml-3">
                          <div 
                            className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium"
                            style={{ 
                              backgroundColor: `${getColorHex(item.color)}20`, 
                              color: "#be185d",
                              borderColor: getColorHex(item.color)
                            }}
                          >
                            <div 
                              className="w-2 h-2 mr-1 rounded-full" 
                              style={{ backgroundColor: getColorHex(item.color) }}
                            />
                            <span className="capitalize" style={{ color: "#be185d" }}>{item.color}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="font-medium text-amber-600">
                    {formatPrice(flower.price * item.quantity, locale)}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="border-t border-pink-200 my-4"></div>

          <div className="flex justify-between items-center font-bold text-pink-700 text-xl">
            <span>{t('totalPrice')}:</span>
            <span>{formatPrice(totalPrice, locale)}</span>
          </div>
          
          <div className="mt-8 text-center">
            <button
              onClick={addToCart}
              disabled={loading}
              className={`w-full bg-gradient-to-r from-pink-500 to-pink-400 hover:from-pink-600 hover:to-pink-500 text-white px-6 py-3 rounded-md font-medium shadow-sm transition-colors flex items-center justify-center ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  {t('addingToCart')}
                </div>
              ) : (
                <>
                  <ShoppingCart size={20} className="mr-2" />
                  {t('addToCart')}
                </>
              )}
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
  
  const renderStep = () => {
    switch (step) {
      case 'customize':
        return renderCustomize();
      case 'review':
        return renderReview();
      case 'template':
      default:
        return renderTemplates();
    }
  };

  const getColorHex = (colorName: string | undefined): string => {
    if (!colorName) return '#cccccc'; // Default gray
    switch (colorName.toLowerCase()) {
      case 'red': return '#ef4444';
      case 'pink': return '#ec4899';
      case 'white': return '#ffffff';
      case 'yellow': return '#f59e0b';
      case 'purple': return '#8b5cf6';
      case 'orange': return '#f97316';
      case 'blue': return '#3b82f6';
      case 'green': return '#10b981';
      case 'violet': return '#8b5cf6';
      case 'peach': return '#ffcba4';
      case 'lavender': return '#e6e6fa';
      case 'cream': return '#fff8dc';
      case 'burgundy': return '#800020';
      case 'coral': return '#ff7f50';
      case 'mixed': return 'linear-gradient(to right, #ef4444, #f59e0b, #8b5cf6, #3b82f6)';
      default: return '#cccccc';
    }
  };

  return (
    <Section className="bg-gradient-to-b from-pink-50 to-white">
      <Container>
        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
            <p className="mt-4 text-pink-500">{t('loadingBouquet')}</p>
          </div>
        ) : (
          renderStep()
        )}
        
        {/* Color selection modal */}
        {colorModalOpen && selectedFlowerForColor && (
          <ColorSelectionModal 
            flower={selectedFlowerForColor}
            onSelect={handleColorSelect}
            onClose={() => {
              setColorModalOpen(false);
              setSelectedFlowerForColor(null);
            }}
            getColorHex={getColorHex}
          />
        )}
        
        {/* Success notification */}
        {showSuccessNotification && (
          <div className="fixed bottom-8 right-8 bg-green-100 border border-green-200 text-green-800 px-5 py-3 rounded-md shadow-lg flex items-center z-50 animate-fade-in">
            <CheckCircle className="mr-2 text-green-600" size={20} />
            <span className="font-medium">{t('addToCart')}</span>
          </div>
        )}
      </Container>
    </Section>
  );
} 

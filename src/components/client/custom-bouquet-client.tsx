'use client';

import { useState, useEffect, useMemo } from "react";
import { Container, Section, Card } from "../ui";
import Image from "next/image";
import { useLanguage } from "@/context/language-context";
import { Plus, Minus, X, ShoppingCart } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { useCart } from "@/context/cart-context";
import { Flower, FlowerQuantity } from "@/lib/supabase";
import { v4 as uuidv4 } from 'uuid';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/supabase";
import { toUUID } from "@/utils/uuid";

// Update props to include initialFlowers
interface CustomBouquetClientProps {
  initialFlowers: Flower[];
}

export default function CustomBouquetClient({ initialFlowers }: CustomBouquetClientProps) {
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const bouquetId = searchParams.get('bouquetId');
  
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
  
  // Fetch bouquet details if bouquetId is provided
  useEffect(() => {
    async function fetchBouquetDetails() {
      if (!bouquetId) return;
      
      setLoading(true);
      try {
        // First get the bouquet
        const { data: bouquet, error: bouquetError } = await supabase
          .from('bouquets')
          .select('*')
          .eq('id', toUUID(bouquetId))
          .single();
        
        if (bouquetError) throw bouquetError;
        
        // Then get the bouquet flowers
        const { data: bouquetFlowers, error: flowersError } = await supabase
          .from('bouquet_flowers')
          .select(`
            id,
            bouquet_id,
            flower_id,
            quantity
          `)
          .eq('bouquet_id', toUUID(bouquetId));
          
        if (flowersError) throw flowersError;
        
        // Convert to FlowerQuantity[] format
        if (bouquetFlowers && bouquetFlowers.length > 0) {
          const flowersInBouquet: FlowerQuantity[] = bouquetFlowers.map(bf => ({
            flowerId: bf.flower_id,
            quantity: bf.quantity,
            // Default color, could be improved in the future
            color: 'mixed'
          }));
          
          setSelectedFlowers(flowersInBouquet);
          setBouquetDetails(bouquet);
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
    if (!searchQuery.trim()) return initialFlowers;
    
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
    // Use the first color as default or a fallback
    const defaultColor = flower.colors && flower.colors.length > 0 ? flower.colors[0] : 'mixed';
    addFlower(flower, defaultColor);
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
  
  // Add the custom bouquet to cart
  const addToCart = () => {
    const { addCustomBouquet } = useCart();
    
    // Add to cart with bouquetId as basedOn if we're customizing an existing bouquet
    addCustomBouquet(
      selectedFlowers,
      bouquetId || undefined,
      bouquetDetails?.name ? `Custom ${bouquetDetails.name}` : 'Custom Bouquet'
    );
    
    // Go to cart page
    router.push('/cart');
  };
  
  // Templates view
  const renderTemplates = () => (
    <div className="py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-pink-700 mb-4">{t('createCustomBouquet')}</h1>
        <p className="text-xl text-pink-400 max-w-3xl mx-auto">
          {t('customBouquetDescription')}
        </p>
      </div>
      
      <div className="mb-8 text-center">
        <button 
          onClick={() => setStep('customize')}
          className="bg-gradient-to-r from-pink-500 to-pink-400 hover:from-pink-600 hover:to-pink-500 text-white px-6 py-3 rounded-md font-medium shadow-sm transition-colors"
        >
          {t('startFromScratch')}
        </button>
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
          {t('createCustomBouquet')}
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
                placeholder={t('searchFlowers') || "Search flowers..."}
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
          
          {filteredFlowers.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-pink-100 shadow-sm">
              <p className="text-pink-400">{t('noFlowersFound') || "No flowers found matching your search"}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {filteredFlowers.map(flower => (
                <Card 
                  key={flower.id} 
                  className="border border-pink-100 bg-white hover:shadow-md transition-all cursor-pointer"
                >
                  <div 
                    className="p-4" 
                    onClick={() => addFlowerWithDefaultColor(flower)}
                  >
                    <div className="relative mb-3">
                      <div 
                        className="w-full h-32 bg-pink-50 rounded-md flex items-center justify-center text-pink-300"
                        style={{ 
                          backgroundImage: `url(/flowers/${flower.id}.jpg)`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center'
                        }}
                      >
                        {flower.name.charAt(0)}
                      </div>
                      <div className="absolute top-0 right-0 bg-pink-100 rounded-bl-md p-1">
                        <Plus size={16} className="text-pink-600" />
                      </div>
                    </div>
                    <h3 className="text-lg font-medium text-pink-700">{flower.name}</h3>
                    <p className="text-sm text-gray-500 mb-2">{flower.description}</p>
                    <p className="text-amber-600 font-medium">₴{flower.price} {t('perStem')}</p>
                    
                    <div className="mt-3">
                      <p className="text-sm text-pink-600 mb-2">{t('selectColor')}:</p>
                      <div className="flex flex-wrap gap-2">
                        {flower.colors && flower.colors.map(color => (
                          <button
                            key={color}
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent card click
                              addFlower(flower, color);
                            }}
                            className="px-3 py-1 text-xs rounded-full bg-pink-50 text-pink-700 hover:bg-pink-100 transition-colors flex items-center"
                          >
                            <div 
                              className="w-3 h-3 mr-1 rounded-full" 
                              style={{ backgroundColor: getColorHex(color) }}
                            ></div>
                            {color}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
          <div className="mt-4 text-center text-gray-500 text-sm">
            <p>{t('clickFlowerToAdd') || 'Click on any flower to add it to your bouquet. Choose specific colors below each flower.'}</p>
          </div>
        </div>
        
        {/* Selected flowers summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-pink-100 p-6 shadow-sm sticky top-24">
            <h2 className="text-xl font-medium text-pink-700 mb-4">{t('yourBouquet')}</h2>
            
            {selectedFlowers.length === 0 ? (
              <p className="text-gray-500 text-center py-8">{t('noBouquetFlowers')}</p>
            ) : (
              <div className="space-y-4">
                {selectedFlowers.map((item, index) => {
                  const flower = initialFlowers.find(f => f.id === item.flowerId);
                  if (!flower) return null;
                  
                  return (
                    <div key={index} className="flex items-center justify-between border-b border-pink-50 pb-3">
                      <div className="flex items-center">
                        <div 
                          className="w-12 h-12 bg-pink-50 rounded-md flex items-center justify-center text-pink-300"
                          style={{ 
                            backgroundImage: `url(/flowers/${flower.id}.jpg)`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                          }}
                        >
                          {flower.name.charAt(0)}
                        </div>
                        <div className="ml-3">
                          <p className="text-pink-700 font-medium">{flower.name}</p>
                          <div className="flex items-center">
                            <p className="text-xs text-pink-500 mr-2">{t('color')}:</p>
                            <div className="flex items-center border border-pink-100 rounded overflow-hidden">
                              <div 
                                className="w-4 h-4 mr-1 ml-1"
                                style={{ backgroundColor: getColorHex(item.color), borderRadius: '50%' }}
                              ></div>
                              <select
                                value={item.color}
                                onChange={(e) => changeFlowerColor(index, e.target.value)}
                                className="text-xs text-pink-600 bg-pink-50 py-1 pl-0 pr-2 border-0 focus:ring-0 focus:outline-none"
                              >
                                {flower.colors && flower.colors.map(color => (
                                  <option key={color} value={color}>{color}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <button 
                          onClick={() => removeFlower(index)}
                          className="text-pink-400 hover:text-pink-600 p-1"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="mx-2 text-gray-700 min-w-[20px] text-center">{item.quantity}</span>
                        <button 
                          onClick={() => addFlower(flower, item.color || (flower.colors && flower.colors.length > 0 ? flower.colors[0] : 'mixed'))}
                          className="text-pink-400 hover:text-pink-600 p-1"
                        >
                          <Plus size={14} />
                        </button>
                        <button 
                          onClick={() => setSelectedFlowers(prev => prev.filter((_, i) => i !== index))}
                          className="ml-2 text-gray-400 hover:text-gray-600 p-1"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
                
                <div className="pt-4">
                  <div className="flex justify-between items-center text-lg font-medium">
                    <span className="text-gray-700">{t('totalPrice')}:</span>
                    <span className="text-amber-600">₴{totalPrice}</span>
                  </div>
                  
                  {selectedFlowers.length > 0 && (
                    <button
                      onClick={() => setSelectedFlowers([])}
                      className="w-full mt-4 border border-pink-200 text-pink-600 hover:bg-pink-50 px-4 py-2 rounded-md text-sm transition-colors"
                    >
                      {t('clearBouquet')}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
  
  // Review order view
  const renderReview = () => (
    <div className="py-8">
      <div className="mb-8 flex justify-between items-center">
        <button 
          onClick={() => setStep('customize')} 
          className="text-pink-600 hover:text-pink-700 font-medium"
        >
          ← {t('backToCustomize')}
        </button>
        
        <h1 className="text-3xl font-bold text-pink-700">{t('bouquetSummary')}</h1>
        
        <div></div> {/* Empty div for flex spacing */}
      </div>
      
      <div className="bg-white rounded-lg border border-pink-100 p-8 shadow-sm mb-8">
        <h2 className="text-2xl font-medium text-pink-700 mb-6 text-center">{t('bouquetSummary')}</h2>
        
        <div className="max-w-2xl mx-auto">
          <div className="space-y-4 mb-8">
            {selectedFlowers.map((item, index) => {
              const flower = initialFlowers.find(f => f.id === item.flowerId);
              if (!flower) return null;
              
              return (
                <div key={index} className="flex items-center justify-between border-b border-pink-50 pb-3">
                  <div className="flex items-center">
                    <div 
                      className="w-12 h-12 bg-pink-50 rounded-md flex items-center justify-center text-pink-300"
                      style={{ 
                        backgroundImage: `url(/flowers/${flower.id}.jpg)`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}
                    >
                      {flower.name.charAt(0)}
                    </div>
                    <div className="ml-3">
                      <p className="text-pink-700 font-medium">{flower.name}</p>
                      <p className="text-sm text-gray-500">
                        <span className="flex items-center">
                          <div 
                            className="w-3 h-3 mr-1 rounded-full" 
                            style={{ backgroundColor: getColorHex(item.color) }}
                          ></div>
                          <span className="text-pink-500">{item.color}</span>
                        </span> • {item.quantity} {item.quantity === 1 ? t('stem') : t('stems')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-amber-600 font-medium">
                    ₴{flower.price * item.quantity}
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="border-t border-pink-100 pt-4">
            <div className="flex justify-between items-center text-xl font-bold">
              <span className="text-gray-700">{t('totalPrice')}:</span>
              <span className="text-amber-600">₴{totalPrice}</span>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <button 
              onClick={addToCart}
              className="bg-gradient-to-r from-pink-500 to-pink-400 hover:from-pink-600 hover:to-pink-500 text-white px-8 py-3 rounded-md font-medium shadow-sm transition-colors flex items-center justify-center mx-auto"
            >
              <ShoppingCart size={18} className="mr-2" />
              {t('addToCart')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
  
  // Add color to hex mapping function
  const getColorHex = (colorName: string | undefined): string => {
    if (!colorName) return '#FFFFFF';
    
    const colorMap: Record<string, string> = {
      'red': '#FF5252',
      'pink': '#FF80AB',
      'white': '#FFFFFF',
      'yellow': '#FFD54F',
      'orange': '#FFAB40',
      'purple': '#CE93D8',
      'blue': '#82B1FF',
      'green': '#66BB6A',
      'coral': '#FF8A65',
      'mixed': 'linear-gradient(to right, #FF5252, #FF80AB, #FFD54F, #CE93D8)'
    };
    
    return colorMap[colorName.toLowerCase()] || '#FFFFFF';
  };
  
  return (
    <Section className="bg-gradient-to-b from-pink-50 to-white">
      <Container>
        {step === 'template' && renderTemplates()}
        {step === 'customize' && renderCustomize()}
        {step === 'review' && renderReview()}
      </Container>
    </Section>
  );
} 
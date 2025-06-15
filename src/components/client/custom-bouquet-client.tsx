'use client';

import { useState, useEffect, useMemo } from "react";
import { Container, Section, Card } from "../ui";
import Image from "next/image";
import { useTranslations, useLocale } from 'next-intl';
import { Plus, Minus, X, ShoppingCart } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { useCart } from "@/context/cart-context";
import { Flower as FlowerType, FlowerQuantity } from "@/lib/supabase";
import { v4 as uuidv4 } from 'uuid';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/supabase";
import { toUUID } from "@/utils/uuid";
import { formatPrice } from '@/lib/functions';

// The Flower type from lib/supabase doesn't have colors or image, so we extend it.
interface Flower extends FlowerType {
  colors?: string[];
  image?: string | null;
}

// Update props to include initialFlowers
interface CustomBouquetClientProps {
  initialFlowers: Flower[];
}

export default function CustomBouquetClient({ initialFlowers }: CustomBouquetClientProps) {
  const t = useTranslations('customBouquet');
  const router = useRouter();
  const searchParams = useSearchParams();
  const bouquetId = searchParams.get('bouquetId');
  const locale = useLocale();
  
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
      bouquetDetails?.name ? `Custom ${bouquetDetails.name}` : t('title')
    );
    
    // Go to cart page
    router.push('/cart');
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
                </div>
                <div className="p-3">
                  <p className="font-medium text-pink-700 truncate">{flower.name}</p>
                  <p className="text-sm text-gray-500">{formatPrice(flower.price, locale)} {t('each')}</p>
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
                          <button onClick={() => addFlowerWithDefaultColor(flower)} className="p-1 text-gray-500 hover:text-green-500"><Plus size={14} /></button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end">
                      <p className="font-medium text-amber-600">
                        {formatPrice(flower.price * item.quantity, locale)}
                      </p>
                      <select
                        value={item.color}
                        onChange={(e) => changeFlowerColor(index, e.target.value)}
                        className="mt-1 text-xs border border-pink-200 rounded py-0.5 px-1 focus:outline-none focus:ring-1 focus:ring-pink-400"
                      >
                        {(flower.colors || ['mixed']).map((color: string) => (
                          <option key={color} value={color}>{color}</option>
                        ))}
                      </select>
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
                      <p className="text-sm text-gray-500">
                        {t('quantity')}: {item.quantity}, {t('color')}: {item.color}
                      </p>
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
              className="w-full bg-gradient-to-r from-pink-500 to-pink-400 hover:from-pink-600 hover:to-pink-500 text-white px-6 py-3 rounded-md font-medium shadow-sm transition-colors flex items-center justify-center"
            >
              <ShoppingCart size={20} className="mr-2" />
              {t('addToCart')}
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
      </Container>
    </Section>
  );
} 

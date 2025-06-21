'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '@/context/cart-context';
import { X, ShoppingCart, Plus, Minus, Trash2, Flower } from 'lucide-react';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';
import { Bouquet as BaseBouquet } from '@/lib/supabase';
import { formatPrice } from '@/lib/functions';

interface Bouquet extends BaseBouquet {
  image_url?: string | null;
  flowers?: Array<{ id: string; flower_id: string; name: string; quantity: number; }>;
}

export default function CartDrawer() {
  const { 
    items, 
    totalItems, 
    totalPrice, 
    isCartOpen, 
    closeCart, 
    removeItem, 
    updateItemQuantity 
  } = useCart();
  const t = useTranslations('common');
  const cartT = useTranslations('cart');
  const supabase = createClientComponentClient<Database>();
  const locale = useLocale();
  const [products, setProducts] = useState<Bouquet[]>([]);
  const [expandedBouquets, setExpandedBouquets] = useState<Record<string, boolean>>({});
  const placeholderImage = '/placeholder.svg';
  const [productPrices, setProductPrices] = useState<Record<string, number>>({});
  const [displayTotalPrice, setDisplayTotalPrice] = useState(totalPrice);

  // Synchronize total price display
  useEffect(() => {
    setDisplayTotalPrice(totalPrice);
  }, [totalPrice]);

  // Initialize product prices from cart items
  useEffect(() => {
    const priceMap: Record<string, number> = {};
    
    items.forEach(item => {
      if (item.bouquetId && item.price > 0) {
        priceMap[item.bouquetId] = item.price;
      }
    });
    
    setProductPrices(prev => ({...prev, ...priceMap}));
  }, [items]);

  // Fetch product data when cart opens or items change
  useEffect(() => {
    async function fetchProducts() {
      if (items.length === 0) {
        setProducts([]);
        return;
      }

      const productIds = items
        .map(item => item.bouquetId)
        .filter((id): id is string => id !== null && id !== undefined);

      if (productIds.length > 0) {
        try {
          // First get the bouquet details
          const { data: bouquetsData, error: bouquetsError } = await supabase
            .from('bouquets')
            .select('*')
            .in('id', productIds);

          if (bouquetsError) {
            console.error('Error fetching products for cart:', bouquetsError);
            setProducts([]);
            return;
          }

          // Update product prices from the database
          const newPriceMap: Record<string, number> = {};
          bouquetsData?.forEach(bouquet => {
            const price = bouquet.discount_price || bouquet.price;
            newPriceMap[bouquet.id] = Number(price);
          });
          
          setProductPrices(prev => ({...prev, ...newPriceMap}));

          // Get all bouquet media
          const { data: mediaData, error: mediaError } = await supabase
            .from('bouquet_media')
            .select('*')
            .in('bouquet_id', productIds)
            .eq('is_thumbnail', true);

          if (mediaError) {
            console.error('Error fetching bouquet media:', mediaError);
          }
          
          // Get flowers for all bouquets
          const { data: flowersData, error: flowersError } = await supabase
            .from('bouquet_flowers')
            .select(`
              id,
              bouquet_id,
              flower_id,
              quantity,
              flower:flowers(id, name)
            `)
            .in('bouquet_id', productIds);
            
          if (flowersError) {
            console.error('Error fetching bouquet flowers:', flowersError);
          }
          
          // Group flowers by bouquet_id
          const flowersByBouquetId: Record<string, any[]> = {};
          if (flowersData && flowersData.length > 0) {
            flowersData.forEach(item => {
              if (!flowersByBouquetId[item.bouquet_id]) {
                flowersByBouquetId[item.bouquet_id] = [];
              }
              
              // Use safe type assertion
              const flower = item.flower as any;
              
              flowersByBouquetId[item.bouquet_id].push({
                id: item.id,
                flower_id: item.flower_id,
                name: flower ? flower.name : 'Unknown Flower',
                quantity: item.quantity
              });
            });
          }
          
          // Group media by bouquet_id
          const mediaByBouquetId: Record<string, any> = {};
          if (mediaData && mediaData.length > 0) {
            mediaData.forEach(item => {
              if (!mediaByBouquetId[item.bouquet_id]) {
                mediaByBouquetId[item.bouquet_id] = item;
              }
            });
          }
          
          // Enhance bouquet data with media and flowers
          const enhancedProducts = bouquetsData?.map(bouquet => {
            const media = mediaByBouquetId[bouquet.id];
            const flowers = flowersByBouquetId[bouquet.id] || [];
            
            return {
              ...bouquet,
              image_url: media?.file_url || null,
              flowers
            };
          }) || [];
          
          setProducts(enhancedProducts);
        } catch (e) {
          console.error('Error processing bouquet data:', e);
          setProducts([]);
        }
      } else {
        setProducts([]);
      }
    }

    // Always fetch products when items change
    fetchProducts();
  }, [items, supabase]);
  
  // Toggle expanded state for a bouquet
  const toggleBouquetExpanded = (bouquetId: string) => {
    setExpandedBouquets(prev => ({
      ...prev,
      [bouquetId]: !prev[bouquetId]
    }));
  };

  // Get the most accurate price for an item
  const getItemPrice = (item: any) => {
    // For custom bouquets, use item price
    if (item.customBouquet) {
      return item.price * item.quantity;
    }
    
    // For regular bouquets, use the most up-to-date price
    if (item.bouquetId) {
      // Use product price if available, otherwise use item price
      const currentPrice = productPrices[item.bouquetId] || item.price;
      return currentPrice * item.quantity;
    }
    
    // Fallback
    return item.price * item.quantity;
  };

  // Get individual item unit price (without quantity)
  const getItemUnitPrice = (item: any) => {
    if (item.bouquetId) {
      return productPrices[item.bouquetId] || item.price;
    }
    return item.price;
  };

  // Calculate the real-time total price
  const calculateRealTotalPrice = () => {
    return items.reduce((total, item) => {
      return total + getItemPrice(item);
    }, 0);
  };

  // Real-time total price
  const realTotalPrice = calculateRealTotalPrice();
  
  return (
    <>
      {/* Cart side panel - always in DOM but transforms based on isCartOpen */}
      <div 
        className={`fixed inset-y-0 right-0 max-w-md w-full bg-white shadow-xl flex flex-col z-50 transform transition-transform duration-300 ease-in-out ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-pink-100">
          <h2 className="text-xl font-medium text-pink-700 flex items-center">
            <ShoppingCart className="mr-2" size={20} />
            {cartT('cart')} ({totalItems})
          </h2>
          <button 
            onClick={closeCart}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Close cart"
          >
            <X size={24} />
          </button>
        </div>
        
        {/* Cart items */}
        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="text-center py-10">
              <ShoppingCart className="mx-auto text-gray-300 mb-4" size={48} />
              <p className="text-gray-500">{cartT('cartEmpty')}</p>
              <button 
                onClick={closeCart}
                className="mt-4 text-pink-600 hover:text-pink-700 font-medium"
              >
                {cartT('continueShopping')}
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-pink-100">
              {items.map(item => {
                // Regular product
                if (item.bouquetId) {
                  const product = products.find(p => p.id === item.bouquetId);
                  const itemPrice = getItemPrice(item);
                  const unitPrice = getItemUnitPrice(item);
                  
                  return (
                    <li key={item.id} className="py-4">
                      <div className="flex items-start">
                        <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-pink-100 relative">
                          <Image
                            src={product?.image_url || placeholderImage}
                            alt={product?.name || "Product"}
                            width={80}
                            height={80}
                            className="h-full w-full object-cover object-center"
                          />
                        </div>
                        
                        <div className="ml-4 flex-1">
                          <div className="flex justify-between">
                            <h3 className="text-base font-medium text-pink-700">{product?.name || "Loading..."}</h3>
                            <p className="text-base font-medium text-amber-600">{formatPrice(itemPrice, locale)}</p>
                          </div>
                          <p className="mt-1 text-sm text-gray-500">{formatPrice(unitPrice, locale)} {t('each')}</p>
                          
                          {/* Bouquet flowers section */}
                          {product?.flowers && product.flowers.length > 0 && (
                            <div className="mt-2 mb-2">
                              <button 
                                onClick={() => toggleBouquetExpanded(product.id)}
                                className="text-xs flex items-center text-pink-600 hover:text-pink-700"
                              >
                                <span className={`transform transition-transform mr-1 ${expandedBouquets[product.id] ? 'rotate-90' : ''}`}>
                                  ▶
                                </span>
                                {product.flowers.length} {product.flowers.length === 1 ? t('flower') : t('flowers')}
                              </button>
                              
                              {expandedBouquets[product.id] && (
                                <ul className="mt-2 ml-2 space-y-1 border-l-2 border-pink-100 pl-3">
                                  {product.flowers.map((flower) => (
                                    <li key={flower.id} className="text-xs text-gray-600 flex items-center space-x-1">
                                      <Flower size={12} className="text-pink-400" />
                                      <span className="flex-1">{flower.name}</span>
                                      <span className="font-medium text-pink-600">×{flower.quantity}</span>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center border border-gray-200 rounded">
                              <button 
                                onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                                className="p-1 text-gray-500 hover:text-pink-600"
                                aria-label="Decrease quantity"
                              >
                                <Minus size={16} />
                              </button>
                              <span className="px-2 text-gray-700">{item.quantity}</span>
                              <button 
                                onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                                className="p-1 text-gray-500 hover:text-pink-600"
                                aria-label="Increase quantity"
                              >
                                <Plus size={16} />
                              </button>
                            </div>
                            
                            <button 
                              onClick={() => removeItem(item.id)}
                              className="text-gray-400 hover:text-pink-600"
                              aria-label="Remove item"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                }
                
                // Custom bouquet
                if (item.customBouquet) {
                  const { name, basedOn } = item.customBouquet;
                  const baseProduct = basedOn ? products.find(p => p.id === basedOn) : null;
                  
                  return (
                    <li key={item.id} className="py-4">
                      <div className="flex items-start">
                        <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-pink-100 bg-pink-50 relative">
                          <Image
                            src={baseProduct?.image_url || placeholderImage}
                            alt={name || "Custom Bouquet"}
                            width={80}
                            height={80}
                            className="h-full w-full object-cover object-center"
                          />
                        </div>
                        
                        <div className="ml-4 flex-1">
                          <div className="flex justify-between">
                            <h3 className="text-base font-medium text-pink-700">{name}</h3>
                            <p className="text-base font-medium text-amber-600">{formatPrice(getItemPrice(item), locale)}</p>
                          </div>
                          <p className="mt-1 text-sm text-gray-500">{t('customBouquet')}</p>
                          
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center border border-gray-200 rounded">
                              <button 
                                onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                                className="p-1 text-gray-500 hover:text-pink-600"
                                aria-label="Decrease quantity"
                              >
                                <Minus size={16} />
                              </button>
                              <span className="px-2 text-gray-700">{item.quantity}</span>
                              <button 
                                onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                                className="p-1 text-gray-500 hover:text-pink-600"
                                aria-label="Increase quantity"
                              >
                                <Plus size={16} />
                              </button>
                            </div>
                            
                            <button 
                              onClick={() => removeItem(item.id)}
                              className="text-gray-400 hover:text-pink-600"
                              aria-label="Remove item"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                }
                
                return null;
              })}
            </ul>
          )}
        </div>
        
        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-pink-100 p-4">
            <div className="flex justify-between text-base font-medium text-gray-900 mb-4">
              <p>{cartT('subtotal')}</p>
              <p className="text-amber-600">{formatPrice(realTotalPrice, locale)}</p>
            </div>
            <div className="flex flex-col space-y-2">
              <Link 
                href={`/${locale}/checkout`}
                className="w-full bg-gradient-to-r from-pink-500 to-pink-400 hover:from-pink-600 hover:to-pink-500 text-white px-6 py-3 rounded-md font-medium shadow-sm transition-colors text-center"
                onClick={closeCart}
              >
                {cartT('checkout')}
              </Link>
              <button 
                onClick={closeCart}
                className="w-full bg-white border border-pink-200 text-pink-600 hover:bg-pink-50 px-6 py-3 rounded-md font-medium transition-colors"
              >
                {cartT('continueShopping')}
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Invisible close area - only when cart is open */}
      {isCartOpen && (
        <div 
          className="fixed inset-0 z-40 cursor-pointer"
          onClick={closeCart}
          aria-hidden="true"
        ></div>
      )}
    </>
  );
} 

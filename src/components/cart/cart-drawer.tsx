'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '@/context/cart-context';
import { X, ShoppingCart, Plus, Minus, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';
import { Bouquet as BaseBouquet } from '@/lib/supabase';
import { formatPrice } from '@/lib/functions';

interface Bouquet extends BaseBouquet {
  image_url?: string | null;
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
  const t = useTranslations();
  const cartT = useTranslations('cart');
  const supabase = createClientComponentClient<Database>();
  const locale = useLocale();
  const [products, setProducts] = useState<Bouquet[]>([]);
  const placeholderImage = '/placeholder.svg';

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
        const { data, error } = await supabase
          .from('bouquets')
          .select('*')
          .in('id', productIds);

        if (error) {
          console.error('Error fetching products for cart:', error);
          setProducts([]);
        } else {
          // Enhance products with image URLs
          const productsWithUrls = data?.map(product => {
            let imageUrl = placeholderImage;
            
            if (product.image) {
              try {
                const { data: urlData } = supabase.storage.from('bouquets').getPublicUrl(product.image);
                if (urlData?.publicUrl) {
                  imageUrl = urlData.publicUrl;
                }
              } catch (e) {
                console.error('Error generating image URL:', e);
              }
            }
            
            return {
              ...product,
              image_url: imageUrl
            };
          }) || [];
          
          setProducts(productsWithUrls);
        }
      } else {
        setProducts([]);
      }
    }

    fetchProducts();
  }, [items, supabase]);
  
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
                  if (!product) return null; // Or show a loading state
                  
                  return (
                    <li key={item.id} className="py-4">
                      <div className="flex items-start">
                        <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-pink-100 relative">
                          <Image
                            src={product.image_url || placeholderImage}
                            alt={product.name || "Product"}
                            width={80}
                            height={80}
                            className="h-full w-full object-cover object-center"
                          />
                        </div>
                        
                        <div className="ml-4 flex-1">
                          <div className="flex justify-between">
                            <h3 className="text-base font-medium text-pink-700">{product.name}</h3>
                            <p className="text-base font-medium text-amber-600">{formatPrice(product.price * item.quantity, locale)}</p>
                          </div>
                          <p className="mt-1 text-sm text-gray-500">{formatPrice(product.price, locale)} {t('common.each')}</p>
                          
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
                            <p className="text-base font-medium text-amber-600">{formatPrice(item.price * item.quantity, locale)}</p>
                          </div>
                          <p className="mt-1 text-sm text-gray-500">{t('common.customBouquet')}</p>
                          
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
              <p className="text-amber-600">{formatPrice(totalPrice, locale)}</p>
            </div>
            <div className="flex flex-col space-y-2">
              <Link 
                href="/checkout"
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

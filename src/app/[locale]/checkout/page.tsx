'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Section, Container } from "@/components/ui";
import { useTranslations, useLocale } from 'next-intl';
import { useCart } from "@/context/cart-context";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import CheckoutItem from '@/components/checkout/checkout-item';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';
import { Bouquet as BaseBouquet } from '@/lib/supabase';
import { formatPrice } from '@/lib/functions';

interface Bouquet extends BaseBouquet {
  image_url?: string | null;
  flowers?: Array<{ id: string; flower_id: string; name: string; quantity: number; }>;
}

export default function CheckoutPage() {
  const t = useTranslations('checkout');
  const currentLocale = useLocale();
  const { items, totalPrice: cartTotalPrice, clearCart } = useCart();
  const router = useRouter();
  const supabase = createClientComponentClient<Database>();
  const [products, setProducts] = useState<Bouquet[]>([]);
  const [calculatedTotalPrice, setCalculatedTotalPrice] = useState(0);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    paymentMethod: 'cash',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Use the calculated price or fall back to cart price
  const totalPrice = calculatedTotalPrice > 0 ? calculatedTotalPrice : cartTotalPrice;
  
  // Fetch products data including flowers
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
            console.error('Error fetching products for checkout:', bouquetsError);
            setProducts([]);
            return;
          }

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
          
          // Calculate total price based on the actual bouquet prices from the database
          let calculatedTotal = 0;
          
          items.forEach(item => {
            if (item.bouquetId) {
              const bouquet = enhancedProducts.find(p => p.id === item.bouquetId);
              if (bouquet) {
                const price = bouquet.discount_price || bouquet.price;
                calculatedTotal += Number(price) * item.quantity;
              } else {
                calculatedTotal += item.price * item.quantity;
              }
            } else if (item.customBouquet) {
              calculatedTotal += item.price * item.quantity;
            }
          });
          
          // Set the calculated total price
          setCalculatedTotalPrice(calculatedTotal);
          
        } catch (e) {
          console.error('Error processing bouquet data:', e);
          setProducts([]);
        }
      } else {
        setProducts([]);
      }
    }

    fetchProducts();
  }, [items, supabase]);
  
  // Add debug logs for price formatting
  useEffect(() => {
    console.log('Debug - Current Locale:', currentLocale);
    console.log('Debug - Cart Total Price (raw):', cartTotalPrice);
    console.log('Debug - Calculated Total Price (raw):', calculatedTotalPrice);
    console.log('Debug - Final Total Price (raw):', totalPrice);
    console.log('Debug - Formatted Price:', formatPrice(totalPrice, currentLocale));
    console.log('Debug - Items:', items);
    console.log('Debug - Products:', products);
  }, [currentLocale, cartTotalPrice, calculatedTotalPrice, totalPrice, items, products]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Send order confirmation email
      const response = await fetch('/api/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formData,
          items,
          totalPrice,
          locale: currentLocale
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send order confirmation');
      }

      setIsSuccess(true);
      clearCart();

      // Redirect to success page after a delay
      setTimeout(() => {
        router.push(`/${currentLocale}`);
      }, 3000);
    } catch (error) {
      console.error('Error submitting order:', error);
      // Show a more user-friendly message
      alert(t('orderProcessingError'));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isSuccess) {
    return (
      <Section className="bg-gradient-to-b from-pink-50 to-white py-12">
        <Container>
          <div className="max-w-2xl mx-auto text-center">
            <div className="rounded-full w-20 h-20 bg-green-100 flex items-center justify-center mx-auto mb-6">
              <Check className="text-green-600" size={36} />
            </div>
            <h1 className="text-3xl font-bold text-pink-700 mb-4">{t('orderSuccess')}</h1>
            <p className="text-gray-700 mb-8">{t('orderSuccessDescription')}</p>
            <Link 
              href={`/${currentLocale}`}
              className="bg-gradient-to-r from-pink-500 to-pink-400 hover:from-pink-600 hover:to-pink-500 text-white px-6 py-3 rounded-md font-medium shadow-sm transition-colors inline-block"
            >
              {t('continueShopping')}
            </Link>
          </div>
        </Container>
      </Section>
    );
  }
  
  if (items.length === 0) {
    return (
      <Section className="bg-gradient-to-b from-pink-50 to-white py-12">
        <Container>
          <div className="text-center py-16">
            <h1 className="text-3xl font-bold text-pink-700 mb-4">{t('emptyCart')}</h1>
            <p className="text-gray-600 mb-8">{t('cartEmptyCheckout')}</p>
            <Link href={`/${currentLocale}/catalog`} className="text-pink-600 hover:text-pink-700 font-medium">
              {t('backToCatalog')}
            </Link>
          </div>
        </Container>
      </Section>
    );
  }
  
  return (
    <Section className="bg-gradient-to-b from-pink-50 to-white py-12">
      <Container>
        <Link href={`/${currentLocale}/catalog`} className="flex items-center text-pink-600 hover:text-pink-700 mb-8">
          <ChevronLeft size={20} />
          <span>{t('backToCatalog')}</span>
        </Link>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <div className="bg-white rounded-lg shadow-md border border-pink-100 p-6 sticky top-24">
              <h2 className="text-xl font-medium text-pink-700 mb-4">{t('orderSummary')}</h2>
              
              <div className="space-y-4 mb-6">
                {items.map(item => {
                  const product = item.bouquetId ? products.find(p => p.id === item.bouquetId) : undefined;
                  return <CheckoutItem key={item.id} item={item} product={product} />;
                })}
              </div>
              
              <div className="border-t border-pink-100 pt-4">
                <div className="flex justify-between text-base font-medium text-gray-900 mb-2">
                  <p>{t('subtotal')}</p>
                  <p className="text-amber-600">{formatPrice(totalPrice, currentLocale)}</p>
                </div>
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <p>{t('shipping')}</p>
                  <p>{formatPrice(100, currentLocale)}</p>
                </div>
                <div className="flex justify-between text-lg font-bold text-gray-900 mt-4 pt-4 border-t border-pink-100">
                  <p>{t('total')}</p>
                  <p className="text-amber-600">{formatPrice(totalPrice + 100, currentLocale)}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Checkout Form */}
          <div className="lg:col-span-2 order-1 lg:order-2">
            <div className="bg-white rounded-lg shadow-md border border-pink-100 p-6">
              <h1 className="text-2xl font-bold text-pink-700 mb-6">{t('checkout')}</h1>
              
              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        {t('fullName')} *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-pink-400"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        {t('checkoutEmail')} *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-pink-400"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      {t('phoneNumber')} *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-pink-400"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                      {t('address')} *
                    </label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      required
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-pink-400"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                      {t('city')} *
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      required
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-pink-400"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-1">
                      {t('paymentMethod')} *
                    </label>
                    <select
                      id="paymentMethod"
                      name="paymentMethod"
                      required
                      value={formData.paymentMethod}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-pink-400"
                    >
                      <option value="cash">{t('cashOnDelivery')}</option>
                      <option value="card">{t('cardPayment')}</option>
                    </select>
                  </div>
                  
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-pink-500 to-pink-400 hover:from-pink-600 hover:to-pink-500 text-white py-3 px-4 rounded-md font-medium shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-2 disabled:opacity-70"
                    >
                      {isSubmitting ? t('processing') : t('placeOrder')}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
} 

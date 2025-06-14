'use client';

import React, { useState, useMemo } from 'react';
import { Section, Container } from "@/components/ui";
import { useTranslations } from 'next-intl';
import { useCart } from "@/context/cart-context";
import getRepositories from "@/lib/repositories";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, Check } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const t = useTranslations();
  const { items, totalPrice, clearCart } = useCart();
  const repositories = useMemo(() => getRepositories(), []);
  const router = useRouter();
  
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
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      clearCart();
      
      // Redirect to success page after a delay
      setTimeout(() => {
        router.push('/');
      }, 3000);
    }, 1500);
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
              href="/"
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
            <Link href="/catalog" className="text-pink-600 hover:text-pink-700 font-medium">
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
        <Link href="/catalog" className="flex items-center text-pink-600 hover:text-pink-700 mb-8">
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
                  // Regular product
                  if (item.productId) {
                    const product = repositories.products.getById(item.productId);
                    if (!product) return null;
                    
                    return (
                      <div key={item.id} className="flex items-start border-b border-pink-50 pb-3">
                        <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-md border border-pink-100">
                          <Image
                            src={product.image}
                            alt={product.name}
                            width={56}
                            height={56}
                            className="h-full w-full object-cover object-center"
                          />
                        </div>
                        
                        <div className="ml-3 flex-1">
                          <p className="text-sm font-medium text-pink-700">{product.name}</p>
                          <p className="text-xs text-gray-500">
                            {t('quantity')}: {item.quantity}
                          </p>
                          <p className="text-sm font-medium text-amber-600">₴{item.price * item.quantity}</p>
                        </div>
                      </div>
                    );
                  }
                  
                  // Custom bouquet
                  if (item.customBouquet) {
                    const { name } = item.customBouquet;
                    
                    return (
                      <div key={item.id} className="flex items-start border-b border-pink-50 pb-3">
                        <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-md border border-pink-100 bg-pink-50 flex items-center justify-center">
                          <Image
                            src="/placeholder.svg"
                            alt={name}
                            width={56}
                            height={56}
                            className="h-full w-full object-cover object-center"
                          />
                        </div>
                        
                        <div className="ml-3 flex-1">
                          <p className="text-sm font-medium text-pink-700">{name}</p>
                          <p className="text-xs text-gray-500">
                            {t('quantity')}: {item.quantity}
                          </p>
                          <p className="text-sm font-medium text-amber-600">₴{item.price * item.quantity}</p>
                        </div>
                      </div>
                    );
                  }
                  
                  return null;
                })}
              </div>
              
              <div className="border-t border-pink-100 pt-4">
                <div className="flex justify-between text-base font-medium text-gray-900 mb-2">
                  <p>{t('subtotal')}</p>
                  <p className="text-amber-600">₴{totalPrice}</p>
                </div>
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <p>{t('shipping')}</p>
                  <p>₴100</p>
                </div>
                <div className="flex justify-between text-lg font-bold text-gray-900 mt-4 pt-4 border-t border-pink-100">
                  <p>{t('total')}</p>
                  <p className="text-amber-600">₴{totalPrice + 100}</p>
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
                    <textarea
                      id="address"
                      name="address"
                      required
                      value={formData.address}
                      onChange={handleChange}
                      rows={3}
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
                      className="w-full bg-gradient-to-r from-pink-500 to-pink-400 hover:from-pink-600 hover:to-pink-500 text-white px-6 py-3 rounded-md font-medium shadow-sm transition-colors disabled:opacity-70"
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

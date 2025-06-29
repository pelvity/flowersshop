'use client';

import React, { useState, useEffect } from 'react';
import { Section, Container } from "@/components/ui";
import { useTranslations, useLocale } from 'next-intl';
import { useCart } from "@/context/cart-context";
import Link from "next/link";
import { ChevronLeft, Check, Mail, Send, AlertCircle, Phone, User, Home, CreditCard } from "lucide-react";
import { useRouter } from "next/navigation";
import CheckoutItem from '@/components/checkout/checkout-item';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';
import { Bouquet as BaseBouquet, FlowerQuantity } from '@/lib/supabase';
import { formatPrice } from '@/lib/functions';
import { getStoreSetting } from '@/lib/store-settings';
import { FormField, FormButton, StatusMessage } from '@/components/ui/form';
import { validateEmail, validateMinLength, validatePhone, formatPhoneNumber as formatPhone, validateAddress, sanitizePhoneInput } from '@/utils/form-validation';

interface Bouquet extends BaseBouquet {
  image_url?: string | null;
  flowers?: Array<{ id: string; flower_id: string; name: string; quantity: number; }>;
}

// Match the CartItem interface from cart-context.tsx
interface CartItem {
  id: string;
  bouquetId?: string;
  customBouquet?: {
    flowers: FlowerQuantity[];
    basedOn?: string;
    name: string;
  };
  quantity: number;
  price: number;
  image?: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  paymentMethod?: string;
  general?: string;
}

export default function CheckoutPage() {
  const t = useTranslations('checkout');
  const currentLocale = useLocale();
  const { items, totalPrice: cartTotalPrice, clearCart } = useCart();
  const router = useRouter();
  const supabase = createClientComponentClient<Database>();
  const [products, setProducts] = useState<Bouquet[]>([]);
  const [calculatedTotalPrice, setCalculatedTotalPrice] = useState(0);
  const [shopOwnerTelegramUsername, setShopOwnerTelegramUsername] = useState('vvrtem');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    paymentMethod: 'cash',
    notificationType: 'email',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  
  // Use the calculated price or fall back to cart price
  const totalPrice = calculatedTotalPrice > 0 ? calculatedTotalPrice : cartTotalPrice;
  
  // Format order date for display
  const orderDate = new Date().toLocaleDateString(currentLocale === 'en' ? 'en-US' : 'pl-PL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  
  // Create telegram message with order details
  const createTelegramMessage = () => {
    const orderItems = items.map(item => {
      const product = item.bouquetId ? products.find(p => p.id === item.bouquetId) : undefined;
      const name = product?.name || (item.customBouquet?.name || 'Custom Bouquet');
      return `${name} x${item.quantity} - ${formatPrice(item.price * item.quantity, currentLocale)}`;
    }).join('\n');
    
    const message = `
Nowe zamówienie

Dane klienta:
${formData.name}
${formData.email}
${formData.phone}
${formData.address}

Zamówienie:
${orderItems}

Suma częściowa: ${formatPrice(totalPrice, currentLocale)}
Dostawa: ${formatPrice(100, currentLocale)}
Razem: ${formatPrice(totalPrice + 100, currentLocale)}

Data: ${orderDate}
Płatność: ${formData.paymentMethod === 'cash' ? 'Płatność przy odbiorze' : 'Płatność kartą'}
`;
    
    return encodeURIComponent(message);
  };
  
  // Fetch store settings
  useEffect(() => {
    const fetchStoreSettings = async () => {
      try {
        const telegramUsername = await getStoreSetting('store_telegram_username', 'vvrtem');
        setShopOwnerTelegramUsername(telegramUsername);
      } catch (error) {
        console.error('Error fetching store settings:', error);
      }
    };
    
    fetchStoreSettings();
  }, []);
  
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
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is edited
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };
  
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    // First sanitize the input to allow only digits, +, -, spaces, and parentheses
    const sanitized = sanitizePhoneInput(e.target.value);
    // Then format it nicely
    const formatted = formatPhone(sanitized);
    setFormData(prev => ({ ...prev, phone: formatted }));
    
    // Clear error when field is edited
    if (errors.phone) {
      setErrors(prev => ({ ...prev, phone: undefined }));
    }
  };
  
  // Form validation
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;
    
    // Name validation
    if (!validateMinLength(formData.name, 3)) {
      newErrors.name = formData.name.trim() ? t('nameMinLength') : t('nameRequired');
      isValid = false;
    }
    
    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = t('emailRequired');
      isValid = false;
    } else if (!validateEmail(formData.email)) {
      newErrors.email = t('emailInvalid');
      isValid = false;
    }
    
    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = t('phoneRequired');
      isValid = false;
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = t('phoneInvalid');
      isValid = false;
    }
    
    // Address validation
    if (!validateAddress(formData.address, 5)) {
      newErrors.address = formData.address.trim() ? t('addressMinLength') : t('addressRequired');
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };
  
  const sendEmailNotification = async () => {
    try {
      // Send order confirmation email
      const emailResponse = await fetch('/api/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formData: { ...formData, notificationType: 'email' },
          items,
          orderId: "EMAIL-" + Date.now(),
          orderDate,
          totalPrice,
          shippingPrice: 100,
          orderTotal: totalPrice + 100,
          locale: currentLocale
        }),
      });

      const emailResult = await emailResponse.json();

      if (!emailResponse.ok) {
        throw new Error(emailResult.error || 'Failed to send order confirmation');
      }
      
      return true;
    } catch (error) {
      console.error('Error sending email notification:', error);
      throw error;
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      // Scroll to the first error
      const firstErrorField = Object.keys(errors)[0];
      const element = document.getElementById(firstErrorField);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.focus();
      }
      return;
    }
    
    setIsSubmitting(true);

    try {
      // Send email notification
      await sendEmailNotification();
      
      setIsSuccess(true);
      clearCart();

      // No longer redirecting to success page
      // Instead, just show success state on the button
    } catch (error) {
      console.error('Error submitting order:', error);
      setErrors({ general: t('orderProcessingError') });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };
  
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
        
        <StatusMessage 
          type={errors.general ? 'error' : isSuccess ? 'success' : 'idle'}
          message={errors.general || (isSuccess ? t('orderSuccess') : '')}
          className="mb-6"
        />
        
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
                    <FormField
                      id="name"
                      name="name"
                      type="text"
                      label={t('fullName')}
                      required
                      placeholder="Jan Kowalski"
                      icon={User}
                      value={formData.name}
                      onChange={handleChange}
                      errorMessage={errors.name}
                      autoComplete="name"
                    />
                    
                    <FormField
                      id="email"
                      name="email"
                      type="email"
                      label={t('checkoutEmail')}
                      required
                      placeholder="jan@example.com"
                      icon={Mail}
                      value={formData.email}
                      onChange={handleChange}
                      errorMessage={errors.email}
                      autoComplete="email"
                    />
                  </div>
                  
                  <FormField
                    id="phone"
                    name="phone"
                    type="tel"
                    label={t('phoneNumber')}
                    required
                    placeholder="123 456 789"
                    icon={Phone}
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    errorMessage={errors.phone}
                    autoComplete="tel"
                  />
                  
                  <FormField
                    id="address"
                    name="address"
                    type="text"
                    label={t('address')}
                    required
                    placeholder="ul. Kwiatowa 10, 00-001 Warszawa"
                    icon={Home}
                    value={formData.address}
                    onChange={handleChange}
                    errorMessage={errors.address}
                    autoComplete="street-address"
                  />
                  
                  <div>
                    <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-1">
                      {t('paymentMethod')} *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <CreditCard className="h-5 w-5 text-gray-400" />
                      </div>
                      <select
                        id="paymentMethod"
                        name="paymentMethod"
                        required
                        value={formData.paymentMethod}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md py-2 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-pink-400 appearance-none bg-white"
                      >
                        <option value="cash">{t('cashOnDelivery')}</option>
                        <option value="card">{t('cardPayment')}</option>
                      </select>
                    </div>
                  </div>
                  
                  {/* Notification Options */}
                  <div>
                    <p className="block text-sm font-medium text-gray-700 mb-3">
                      {t('notificationPreference')}
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* Email Button */}
                      <FormButton
                        type="submit"
                        disabled={isSubmitting}
                        isLoading={isSubmitting}
                        loadingText={t('processing')}
                        icon={isSuccess ? Check : Mail}
                        fullWidth={false}
                        className="flex-1"
                      >
                        {isSuccess ? t('emailSent') : t('emailNotification')}
                      </FormButton>
                      
                      {/* Telegram Button */}
                      <FormButton
                        type="button"
                        disabled={isSubmitting}
                        icon={isSuccess ? Check : Send}
                        variant="secondary"
                        fullWidth={false}
                        className="flex-1 bg-[#0088cc] hover:bg-[#0077b5] focus:ring-[#0088cc]"
                        onClick={() => {
                          // Validate form
                          if (!validateForm()) {
                            // Scroll to the first error
                            const firstErrorField = Object.keys(errors)[0];
                            const element = document.getElementById(firstErrorField);
                            if (element) {
                              element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                              element.focus();
                            }
                            return;
                          }
                          
                          setIsSubmitting(true);
                          try {
                            // Open Telegram with predefined message
                            window.open(`https://t.me/${shopOwnerTelegramUsername}?text=${createTelegramMessage()}`, '_blank');
                            
                            // Mark as success but don't redirect
                            setIsSuccess(true);
                            clearCart();
                          } catch (error) {
                            console.error('Error processing with Telegram:', error);
                            setErrors({ general: t('orderProcessingError') });
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          } finally {
                            setIsSubmitting(false);
                          }
                        }}
                      >
                        {isSuccess ? t('messageSent') : t('telegramNotification')}
                      </FormButton>
                    </div>
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

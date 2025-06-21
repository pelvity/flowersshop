import React, { useState } from 'react';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import { Flower } from 'lucide-react';
import { formatPrice } from '@/lib/functions';

interface CheckoutItemProps {
  item: {
    id: string;
    bouquetId?: string;
    customBouquet?: {
      name: string;
      basedOn?: string;
    };
    quantity: number;
    price: number;
  };
  product?: {
    id: string;
    name: string;
    price?: number;
    discount_price?: number | null;
    image_url?: string | null;
    flowers?: Array<{ id: string; flower_id: string; name: string; quantity: number; }>;
  };
}

export default function CheckoutItem({ item, product }: CheckoutItemProps) {
  const t = useTranslations('common');
  const locale = useLocale();
  const [isExpanded, setIsExpanded] = useState(false);
  const placeholderImage = '/placeholder.svg';
  
  const toggleFlowersExpanded = () => {
    setIsExpanded(prev => !prev);
  };
  
  // Get the correct price - use product price if available
  const getItemPrice = () => {
    if (product && (product.price !== undefined || product.discount_price !== undefined)) {
      return product.discount_price || product.price || item.price;
    }
    return item.price;
  };
  
  const itemPrice = getItemPrice();
  
  // Regular bouquet
  if (item.bouquetId && product) {
    return (
      <div className="flex items-start border-b border-pink-50 pb-4 pt-3">
        <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-pink-100">
          <Image
            src={product.image_url || placeholderImage}
            alt={product.name}
            width={80}
            height={80}
            className="h-full w-full object-cover object-center"
          />
        </div>
        
        <div className="ml-4 flex-1">
          <div className="flex justify-between">
            <h3 className="text-base font-medium text-pink-700">{product.name}</h3>
            <p className="text-base font-medium text-amber-600">{formatPrice(itemPrice * item.quantity, locale)}</p>
          </div>
          <p className="mt-1 text-sm text-gray-500">{formatPrice(itemPrice, locale)} {t('each')}</p>
          
          {/* Bouquet flowers section */}
          {product.flowers && product.flowers.length > 0 && (
            <div className="mt-2 mb-2">
              <button 
                onClick={toggleFlowersExpanded}
                className="text-xs flex items-center text-pink-600 hover:text-pink-700"
              >
                <span className={`transform transition-transform mr-1 ${isExpanded ? 'rotate-90' : ''}`}>
                  ▶
                </span>
                {product.flowers.length} {product.flowers.length === 1 ? t('flower') : t('flowers')}
              </button>
              
              {isExpanded && (
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
          
          <div className="flex mt-1">
            <p className="text-sm text-gray-500 mr-2">{t('quantity')}:</p>
            <p className="text-sm font-medium">{item.quantity}</p>
          </div>
        </div>
      </div>
    );
  }
  
  // Custom bouquet
  if (item.customBouquet) {
    const { name } = item.customBouquet;
    
    return (
      <div className="flex items-start border-b border-pink-50 pb-4 pt-3">
        <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-pink-100 bg-pink-50 relative">
          <Image
            src={placeholderImage}
            alt={name}
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
          <p className="mt-1 text-sm text-gray-500">{t('customBouquet')}</p>
          
          <div className="flex mt-1">
            <p className="text-sm text-gray-500 mr-2">{t('quantity')}:</p>
            <p className="text-sm font-medium">{item.quantity}</p>
          </div>
        </div>
      </div>
    );
  }
  
  return null;
} 
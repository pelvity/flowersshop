'use client';

import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/cart-context';
import { useTranslations } from 'next-intl';

export default function CartButton() {
  const { totalItems, openCart } = useCart();
  const t = useTranslations();
  
  return (
    <button 
      onClick={openCart}
      className="flex items-center text-pink-600 hover:text-pink-700 transition-colors relative"
      aria-label="Open cart"
    >
      <ShoppingCart size={24} />
      {totalItems > 0 && (
        <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {totalItems}
        </span>
      )}
    </button>
  );
} 

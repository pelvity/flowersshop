'use client';

import { useState } from 'react';
import { useCart } from '@/context/cart-context';
import { ShoppingCart } from 'lucide-react';

interface AddToCartButtonProps {
  bouquetId: string;
  available: boolean;
}

export default function AddToCartButton({ bouquetId, available }: AddToCartButtonProps) {
  const { addProduct } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = () => {
    if (!available) return;
    
    setIsAdding(true);
    
    addProduct(bouquetId, quantity);
    
    setTimeout(() => {
      setIsAdding(false);
    }, 1000);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center">
        <button
          onClick={() => setQuantity(Math.max(1, quantity - 1))}
          className="px-3 py-1 border border-pink-200 rounded-l-md bg-white text-pink-600 hover:bg-pink-50"
          aria-label="Decrease quantity"
        >
          -
        </button>
        <input
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
          className="w-12 text-center py-1 border-t border-b border-pink-200 text-pink-600"
          aria-label="Quantity"
        />
        <button
          onClick={() => setQuantity(quantity + 1)}
          className="px-3 py-1 border border-pink-200 rounded-r-md bg-white text-pink-600 hover:bg-pink-50"
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>
      
      <button
        onClick={handleAddToCart}
        disabled={!available || isAdding}
        className={`flex items-center justify-center gap-2 px-6 py-3 rounded-md shadow-sm transition-colors ${
          available 
            ? 'bg-gradient-to-r from-pink-500 to-pink-400 hover:from-pink-600 hover:to-pink-500 text-white'
            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
        }`}
      >
        <ShoppingCart size={18} />
        {isAdding ? 'Added!' : available ? 'Add to Cart' : 'Out of Stock'}
      </button>
    </div>
  );
} 
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { CartItem, FlowerQuantity } from '@/lib/repositories/types';
import createCartRepository from '@/lib/repositories/cart';
import { calculateCustomBouquetPrice } from '@/lib/repositories/index';
import getRepositories from '@/lib/repositories';

// Define the shape of the cart context
interface CartContextType {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  isCartOpen: boolean;
  addProduct: (productId: number, quantity?: number) => void;
  addCustomBouquet: (flowers: FlowerQuantity[], basedOnProductId?: number, name?: string) => void;
  removeItem: (id: string) => void;
  updateItemQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
}

// Create the context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Provider component
export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // Create repository instances - memoize to prevent recreation on each render
  const cartRepository = useMemo(() => createCartRepository(), []);
  const repositories = useMemo(() => getRepositories(), []);
  
  // Load cart when component mounts
  useEffect(() => {
    if (typeof window === 'undefined') return; // Skip during SSR
    
    const loadCart = () => {
      const loadedItems = cartRepository.getItems();
      setItems(loadedItems);
      calculateTotals(loadedItems);
    };
    
    loadCart();
    
    // Listen for storage events from other tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'flower_shop_cart') {
        loadCart();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  
  // Calculate cart totals
  const calculateTotals = (cartItems: CartItem[]) => {
    const itemCount = cartItems.reduce((count, item) => count + item.quantity, 0);
    const price = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    setTotalItems(itemCount);
    setTotalPrice(price);
  };
  
  // Add a regular product to the cart
  const addProduct = (productId: number, quantity = 1) => {
    const product = repositories.products.getById(productId);
    if (!product) return;
    
    const item: CartItem = {
      id: uuidv4(),
      productId,
      quantity,
      price: product.priceValue
    };
    
    cartRepository.addItem(item);
    const updatedItems = cartRepository.getItems();
    setItems(updatedItems);
    calculateTotals(updatedItems);
    
    // Automatically open the cart
    setIsCartOpen(true);
  };
  
  // Add a custom bouquet to the cart
  const addCustomBouquet = (flowers: FlowerQuantity[], basedOnProductId?: number, name?: string) => {
    const basedOnProduct = basedOnProductId 
      ? repositories.products.getById(basedOnProductId) 
      : undefined;
    
    const bouquetPrice = calculateCustomBouquetPrice(flowers);
    const bouquetName = name || (basedOnProduct 
      ? `Custom ${basedOnProduct.name}` 
      : 'Custom Bouquet');
    
    const item: CartItem = {
      id: uuidv4(),
      customBouquet: {
        flowers,
        basedOn: basedOnProductId,
        name: bouquetName
      },
      quantity: 1,
      price: bouquetPrice
    };
    
    cartRepository.addItem(item);
    const updatedItems = cartRepository.getItems();
    setItems(updatedItems);
    calculateTotals(updatedItems);
    
    // Automatically open the cart
    setIsCartOpen(true);
  };
  
  // Remove an item from the cart
  const removeItem = (id: string) => {
    cartRepository.removeItem(id);
    const updatedItems = cartRepository.getItems();
    setItems(updatedItems);
    calculateTotals(updatedItems);
  };
  
  // Update an item's quantity
  const updateItemQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    
    cartRepository.updateItem(id, { quantity });
    const updatedItems = cartRepository.getItems();
    setItems(updatedItems);
    calculateTotals(updatedItems);
  };
  
  // Clear the entire cart
  const clearCart = () => {
    cartRepository.clearCart();
    setItems([]);
    calculateTotals([]);
  };
  
  // Open cart panel
  const openCart = () => {
    setIsCartOpen(true);
  };
  
  // Close cart panel
  const closeCart = () => {
    setIsCartOpen(false);
  };
  
  // Create context value
  const contextValue: CartContextType = {
    items,
    totalItems,
    totalPrice,
    isCartOpen,
    addProduct,
    addCustomBouquet,
    removeItem,
    updateItemQuantity,
    clearCart,
    openCart,
    closeCart
  };
  
  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use the cart context
export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}; 
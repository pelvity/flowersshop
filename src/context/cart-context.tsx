'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { FlowerQuantity, calculateCustomBouquetPrice } from '@/lib/supabase';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';
import { toUUID } from '@/utils/uuid';

// Define CartItem type
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
}

// Interface for cart repository
interface CartRepository {
  getItems: () => CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateItem: (id: string, update: Partial<CartItem>) => void;
  clearCart: () => void;
}

// Create cart repository with localStorage
const createCartRepository = (): CartRepository => {
  const STORAGE_KEY = 'flower_shop_cart';
  
  const getItems = (): CartItem[] => {
    if (typeof window === 'undefined') return [];
    
    try {
      const items = localStorage.getItem(STORAGE_KEY);
      return items ? JSON.parse(items) : [];
    } catch (error) {
      console.error('Failed to parse cart:', error);
      return [];
    }
  };
  
  const saveItems = (items: CartItem[]) => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Failed to save cart:', error);
    }
  };
  
  const addItem = (newItem: CartItem) => {
    const existingItems = getItems();
    
    // Check if it's the same product (for non-custom bouquets)
    if (newItem.bouquetId) {
      const existingItem = existingItems.find(item => 
        item.bouquetId === newItem.bouquetId && !item.customBouquet
      );
      
      if (existingItem) {
        // Update quantity instead of adding new item
        updateItem(existingItem.id, { 
          quantity: existingItem.quantity + newItem.quantity 
        });
        return;
      }
    }
    
    // Otherwise add as new item
    const updatedItems = [...existingItems, newItem];
    saveItems(updatedItems);
  };
  
  const removeItem = (id: string) => {
    const existingItems = getItems();
    const updatedItems = existingItems.filter(item => item.id !== id);
    saveItems(updatedItems);
  };
  
  const updateItem = (id: string, update: Partial<CartItem>) => {
    const existingItems = getItems();
    const updatedItems = existingItems.map(item => 
      item.id === id ? { ...item, ...update } : item
    );
    saveItems(updatedItems);
  };
  
  const clearCart = () => {
    saveItems([]);
  };
  
  return {
    getItems,
    addItem,
    removeItem,
    updateItem,
    clearCart
  };
};

// Define the shape of the cart context
interface CartContextType {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  isCartOpen: boolean;
  addProduct: (bouquetId: string, quantity?: number) => void;
  addCustomBouquet: (flowers: FlowerQuantity[], basedOnBouquetId?: string, name?: string) => void;
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
  const [bouquetsCache, setBouquetsCache] = useState<Record<string, any>>({});
  
  // Create supabase client and repository
  const supabase = useMemo(() => createClientComponentClient<Database>(), []);
  const cartRepository = useMemo(() => createCartRepository(), []);
  
  // Load cart when component mounts
  useEffect(() => {
    if (typeof window === 'undefined') return; // Skip during SSR
    
    const loadCart = () => {
      const loadedItems = cartRepository.getItems();
      setItems(loadedItems);
      calculateTotals(loadedItems);
      
      // Prefetch bouquet data for items in cart
      loadedItems.forEach(item => {
        if (item.bouquetId) {
          fetchBouquetIfNeeded(item.bouquetId);
        }
      });
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
  
  // Fetch bouquet data if not in cache
  const fetchBouquetIfNeeded = async (bouquetId: string) => {
    if (bouquetsCache[bouquetId]) return;
    
    try {
      const { data: bouquet } = await supabase
        .from('bouquets')
        .select('*')
        .eq('id', toUUID(bouquetId))
        .single();
      
      if (bouquet) {
        setBouquetsCache(prev => ({
          ...prev,
          [bouquetId]: bouquet
        }));
        
        // Update any existing items with this bouquet ID to have the correct price
        const existingItems = cartRepository.getItems();
        const itemsToUpdate = existingItems.filter(item => item.bouquetId === bouquetId && item.price === 0);
        
        if (itemsToUpdate.length > 0) {
          const price = bouquet.discount_price || bouquet.price;
          
          // Update each item with the correct price
          for (const item of itemsToUpdate) {
            cartRepository.updateItem(item.id, { price: Number(price) });
          }
          
          // Reload items to reflect price updates
          const updatedItems = cartRepository.getItems();
          setItems(updatedItems);
          calculateTotals(updatedItems);
        }
      }
    } catch (error) {
      console.error(`Failed to fetch bouquet ${bouquetId}:`, error);
    }
  };
  
  // Calculate cart totals
  const calculateTotals = (cartItems: CartItem[]) => {
    const itemCount = cartItems.reduce((count, item) => count + item.quantity, 0);
    const price = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    setTotalItems(itemCount);
    setTotalPrice(price);
  };
  
  // Add a regular product to the cart
  const addProduct = async (bouquetId: string, quantity = 1) => {
    // Fetch bouquet data if not in cache
    if (!bouquetsCache[bouquetId]) {
      await fetchBouquetIfNeeded(bouquetId);
    }
    
    const bouquet = bouquetsCache[bouquetId];
    if (!bouquet) {
      // Fallback if bouquet not found
      console.warn(`Bouquet ${bouquetId} not found, adding generic item`);
      const item: CartItem = {
        id: uuidv4(),
        bouquetId,
        quantity,
        price: 0 // Will be updated once data is loaded
      };
      
      cartRepository.addItem(item);
      const updatedItems = cartRepository.getItems();
      setItems(updatedItems);
      calculateTotals(updatedItems);
      setIsCartOpen(true);
      return;
    }
    
    // Add with bouquet data
    const price = bouquet.discount_price || bouquet.price;
    const item: CartItem = {
      id: uuidv4(),
      bouquetId,
      quantity,
      price: Number(price)
    };
    
    cartRepository.addItem(item);
    const updatedItems = cartRepository.getItems();
    setItems(updatedItems);
    calculateTotals(updatedItems);
    
    // Automatically open the cart
    setIsCartOpen(true);
  };
  
  // Add a custom bouquet to the cart
  const addCustomBouquet = async (flowers: FlowerQuantity[], basedOnBouquetId?: string, name?: string) => {
    let bouquetName = 'Custom Bouquet';
    
    // Try to get the base bouquet name
    if (basedOnBouquetId) {
      if (!bouquetsCache[basedOnBouquetId]) {
        await fetchBouquetIfNeeded(basedOnBouquetId);
      }
      
      const baseBouquet = bouquetsCache[basedOnBouquetId];
      if (baseBouquet) {
        bouquetName = `Custom ${baseBouquet.name}`;
      }
    }
    
    // Use provided name if available
    if (name) {
      bouquetName = name;
    }
    
    // When creating a custom bouquet, we need flower data for price calculation
    // We'll make an API call to get this data
    try {
      const flowerIds = flowers.map(f => toUUID(f.flowerId as string));
      const { data: flowerData } = await supabase
        .from('flowers')
        .select('id, price')
        .in('id', flowerIds);
      
      // Cast the data to the correct type that calculateCustomBouquetPrice expects
      const bouquetPrice = calculateCustomBouquetPrice(
        flowers, 
        flowerData || []
      );
      
      const item: CartItem = {
        id: uuidv4(),
        customBouquet: {
          flowers,
          basedOn: basedOnBouquetId,
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
      
    } catch (error) {
      console.error('Failed to create custom bouquet:', error);
    }
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
import { CartRepository, CartItem } from './types';

// Constant for localStorage key
const CART_STORAGE_KEY = 'flower_shop_cart';

export class CartRepositoryImpl implements CartRepository {
  private items: CartItem[] = [];
  
  constructor() {
    this.loadFromStorage();
  }
  
  // Load cart from localStorage
  private loadFromStorage(): void {
    if (typeof window === 'undefined') return; // Skip during SSR
    
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        this.items = JSON.parse(savedCart);
      }
    } catch (error) {
      console.error('Error loading cart from storage:', error);
      this.items = [];
    }
  }
  
  // Save cart to localStorage
  private saveToStorage(): void {
    if (typeof window === 'undefined') return; // Skip during SSR
    
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(this.items));
    } catch (error) {
      console.error('Error saving cart to storage:', error);
    }
  }
  
  // Get all items in the cart
  getItems(): CartItem[] {
    return [...this.items];
  }
  
  // Add an item to the cart
  addItem(item: CartItem): void {
    // Check if this is a duplicate item
    const existingIndex = this.items.findIndex(i => {
      // For regular products, compare productId
      if (item.productId && i.productId === item.productId) {
        return true;
      }
      
      // For custom bouquets, check if based on the same template
      if (item.customBouquet && i.customBouquet) {
        // If both have basedOn and they're the same
        if (item.customBouquet.basedOn && i.customBouquet.basedOn === item.customBouquet.basedOn) {
          return true;
        }
        
        // If neither has basedOn (from scratch), compare name
        if (!item.customBouquet.basedOn && !i.customBouquet.basedOn && 
            i.customBouquet.name === item.customBouquet.name) {
          return true;
        }
      }
      
      return false;
    });
    
    if (existingIndex >= 0) {
      // Update quantity of existing item
      this.items[existingIndex].quantity += item.quantity;
    } else {
      // Add new item
      this.items.push({ ...item });
    }
    
    this.saveToStorage();
  }
  
  // Update an item in the cart
  updateItem(id: string, updates: Partial<CartItem>): void {
    const index = this.items.findIndex(item => item.id === id);
    if (index >= 0) {
      this.items[index] = { ...this.items[index], ...updates };
      this.saveToStorage();
    }
  }
  
  // Remove an item from the cart
  removeItem(id: string): void {
    this.items = this.items.filter(item => item.id !== id);
    this.saveToStorage();
  }
  
  // Clear the entire cart
  clearCart(): void {
    this.items = [];
    this.saveToStorage();
  }
  
  // Calculate the total price of all items in the cart
  getTotal(): number {
    return this.items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  }
}

// Factory function
export const createCartRepository = (): CartRepository => {
  return new CartRepositoryImpl();
};

export default createCartRepository; 
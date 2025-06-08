// Common data types
export type Category = {
  id: number;
  name: string;
  slug: string;
  description: string;
};

export type Tag = {
  id: number;
  name: string;
  slug: string;
};

export type Flower = {
  id: number;
  name: string;
  image: string;
  price: number; // Price per stem
  colors: string[]; // Available colors
  description: string;
};

export type FlowerQuantity = {
  flowerId: number;
  quantity: number;
  color?: string; // Selected color
};

export type Product = {
  id: number;
  name: string;
  description: string;
  price: string; // Using string to include currency symbol
  priceValue: number; // Numeric value for calculations
  image: string;
  categoryId: number;
  tags: number[]; // Array of tag IDs
  isCustomizable?: boolean; // Can this bouquet be customized?
  baseFlowers?: FlowerQuantity[]; // Base flowers for customizable bouquets
};

// Repository interfaces
export interface CategoryRepository {
  getAll(): Category[];
  getById(id: number): Category | undefined;
  getBySlug(slug: string): Category | undefined;
}

export interface TagRepository {
  getAll(): Tag[];
  getById(id: number): Tag | undefined;
  getBySlug(slug: string): Tag | undefined;
}

export interface FlowerRepository {
  getAll(): Flower[];
  getById(id: number): Flower | undefined;
}

export interface ProductRepository {
  getAll(): Product[];
  getById(id: number): Product | undefined;
  getByCategory(categoryId: number): Product[];
  getByTag(tagId: number): Product[];
  search(query: string): Product[];
  getCustomizableProducts(): Product[];
}

// Cart types
export type CartItem = {
  id: string; // Unique identifier for cart item
  productId?: number; // Regular product
  customBouquet?: {
    basedOn?: number; // Product ID if based on a template
    flowers: FlowerQuantity[]; // Custom flowers
    name: string;
  };
  quantity: number;
  price: number; // Per item price
};

export interface CartRepository {
  getItems(): CartItem[];
  addItem(item: CartItem): void;
  updateItem(id: string, updates: Partial<CartItem>): void;
  removeItem(id: string): void;
  clearCart(): void;
  getTotal(): number;
} 
import { 
  CategoryRepository, 
  TagRepository, 
  ProductRepository, 
  FlowerRepository,
  Category,
  Tag,
  Product,
  Flower,
  FlowerQuantity
} from './types';
import { categories, tags, products, flowers } from './data';

// Implementation of category repository
class CategoryRepositoryImpl implements CategoryRepository {
  getAll(): Category[] {
    return categories;
  }
  
  getById(id: number): Category | undefined {
    return categories.find(category => category.id === id);
  }
  
  getBySlug(slug: string): Category | undefined {
    return categories.find(category => category.slug === slug);
  }
}

// Implementation of tag repository
class TagRepositoryImpl implements TagRepository {
  getAll(): Tag[] {
    return tags;
  }
  
  getById(id: number): Tag | undefined {
    return tags.find(tag => tag.id === id);
  }
  
  getBySlug(slug: string): Tag | undefined {
    return tags.find(tag => tag.slug === slug);
  }
}

// Implementation of flower repository
class FlowerRepositoryImpl implements FlowerRepository {
  getAll(): Flower[] {
    return flowers;
  }
  
  getById(id: number): Flower | undefined {
    return flowers.find(flower => flower.id === id);
  }
}

// Implementation of product repository
class ProductRepositoryImpl implements ProductRepository {
  getAll(): Product[] {
    return products;
  }
  
  getById(id: number): Product | undefined {
    return products.find(product => product.id === id);
  }
  
  getByCategory(categoryId: number): Product[] {
    return products.filter(product => product.categoryId === categoryId);
  }
  
  getByTag(tagId: number): Product[] {
    return products.filter(product => product.tags.includes(tagId));
  }
  
  search(query: string): Product[] {
    const lowercaseQuery = query.toLowerCase();
    return products.filter(product => 
      product.name.toLowerCase().includes(lowercaseQuery) ||
      product.description.toLowerCase().includes(lowercaseQuery) ||
      this.getProductTags(product).some(tag => tag.name.toLowerCase().includes(lowercaseQuery)) ||
      this.getProductCategory(product)?.name.toLowerCase().includes(lowercaseQuery)
    );
  }
  
  getCustomizableProducts(): Product[] {
    return products.filter(product => product.isCustomizable);
  }
  
  // Helper methods
  private getProductTags(product: Product): Tag[] {
    return tags.filter(tag => product.tags.includes(tag.id));
  }
  
  private getProductCategory(product: Product): Category | undefined {
    return categories.find(category => category.id === product.categoryId);
  }
}

// Helper functions for working with products and flowers
export function calculateCustomBouquetPrice(items: FlowerQuantity[]): number {
  const flowerRepo = new FlowerRepositoryImpl();
  
  return items.reduce((total, item) => {
    const flower = flowerRepo.getById(item.flowerId);
    if (flower) {
      return total + (flower.price * item.quantity);
    }
    return total;
  }, 0);
}

// Factory for repositories
export const getRepositories = () => {
  return {
    categories: new CategoryRepositoryImpl(),
    tags: new TagRepositoryImpl(),
    products: new ProductRepositoryImpl(),
    flowers: new FlowerRepositoryImpl(),
  };
};

// Default export
export default getRepositories; 
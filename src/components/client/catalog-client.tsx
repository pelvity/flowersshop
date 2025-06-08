'use client';

import { useState, useEffect } from "react";
import { Container, Section, Card } from "../ui";
import Image from "next/image";
import { useLanguage } from "@/context/language-context";
import { useCart } from "@/context/cart-context";
import { Search } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import getRepositories from "@/lib/repositories";
import { Product } from "@/lib/repositories/types";
import React from "react";

export default function CatalogClient() {
  const { t } = useLanguage();
  const { addProduct } = useCart();
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');
  
  // Memoize repositories to prevent recreation on each render
  const repositories = React.useMemo(() => getRepositories(), []);
  
  const [selectedCategory, setSelectedCategory] = useState<number | null>(
    categoryParam ? parseInt(categoryParam) : null
  );
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  
  // Load initial products and apply filters when dependencies change
  useEffect(() => {
    let result = repositories.products.getAll();
    
    // Filter by category if selected
    if (selectedCategory !== null) {
      result = repositories.products.getByCategory(selectedCategory);
    }
    
    // Filter by tags if selected
    if (selectedTags.length > 0) {
      result = result.filter(product => 
        selectedTags.some(tagId => product.tags.includes(tagId))
      );
    }
    
    // Filter by search query if provided
    if (searchQuery.trim() !== "") {
      result = repositories.products.search(searchQuery);
    }
    
    setFilteredProducts(result);
  }, [selectedCategory, selectedTags, searchQuery, repositories]);
  
  // Handle tag selection/deselection
  const toggleTag = (tagId: number) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId) 
        : [...prev, tagId]
    );
  };
  
  // Handle adding product to cart
  const handleAddToCart = (productId: number) => {
    addProduct(productId, 1);
  };
  
  // Handle product click to navigate to detail page
  const navigateToProduct = (productId: number) => {
    router.push(`/product/${productId}`);
  };
  
  return (
    <Section className="bg-gradient-to-b from-pink-50 to-white">
      <Container>
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-pink-700 mb-4">{t('ourCollection')}</h1>
          <p className="text-xl text-pink-400 max-w-3xl mx-auto">
            {t('browseSelection')}
          </p>
        </div>
        
        {/* Search Bar */}
        <div className="mb-8 max-w-md mx-auto">
          <div className="relative">
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              className="w-full border border-pink-200 rounded-full py-2 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-pink-400 shadow-sm text-pink-600"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-pink-400">
              <Search size={18} />
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-8">
          {/* Category and Tag Filters */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow-md rounded-lg p-6 sticky top-24 border border-pink-100">
              <div className="mb-6">
                <h3 className="text-lg font-medium text-pink-600 mb-3 border-b border-pink-100 pb-2">{t('categories')}</h3>
                <div className="space-y-2">
                  <div 
                    className={`cursor-pointer px-3 py-2 rounded-md transition-colors ${selectedCategory === null ? 'bg-pink-100 text-pink-700 font-medium' : 'hover:bg-pink-50 text-gray-700'}`}
                    onClick={() => setSelectedCategory(null)}
                  >
                    {t('allCategories')}
                  </div>
                  {repositories.categories.getAll().map(category => (
                    <div 
                      key={category.id}
                      className={`cursor-pointer px-3 py-2 rounded-md transition-colors ${selectedCategory === category.id ? 'bg-pink-100 text-pink-700 font-medium' : 'hover:bg-pink-50 text-gray-700'}`}
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      {category.name}
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-pink-600 mb-3 border-b border-pink-100 pb-2">{t('tags')}</h3>
                <div className="flex flex-wrap gap-2">
                  {repositories.tags.getAll().map(tag => (
                    <div 
                      key={tag.id}
                      className={`cursor-pointer px-3 py-1 rounded-full text-sm transition-colors ${
                        selectedTags.includes(tag.id) 
                          ? 'bg-gradient-to-r from-pink-500 to-pink-400 text-white shadow-sm' 
                          : 'bg-pink-50 hover:bg-pink-100 text-pink-700'
                      }`}
                      onClick={() => toggleTag(tag.id)}
                    >
                      {tag.name}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Product Grid */}
          <div className="lg:col-span-3">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border border-pink-100 shadow-sm">
                <p className="text-pink-400">{t('noResults')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => {
                  const category = repositories.categories.getById(product.categoryId);
                  const productTags = repositories.tags.getAll().filter(tag => product.tags.includes(tag.id));
                  
                  return (
                    <Card key={product.id} className="flex flex-col overflow-hidden transition-all hover:shadow-lg border border-pink-100 bg-white">
                      <div 
                        className="relative cursor-pointer" 
                        onClick={() => navigateToProduct(product.id)}
                      >
                        <Image 
                          src={product.image} 
                          alt={product.name} 
                          width={400} 
                          height={300}
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute top-2 right-2 bg-white border border-pink-200 text-pink-600 text-xs px-3 py-1 rounded-full shadow-sm">
                          {category?.name}
                        </div>
                      </div>
                      <div className="flex-1 p-6 flex flex-col">
                        <div className="flex-1">
                          <h3 
                            className="text-xl font-medium text-pink-700 cursor-pointer hover:text-pink-500"
                            onClick={() => navigateToProduct(product.id)}
                          >
                            {product.name}
                          </h3>
                          <p className="mt-2 text-base text-gray-600">{product.description}</p>
                          <div className="mt-3 flex flex-wrap gap-1">
                            {productTags.map(tag => (
                              <span key={tag.id} className="inline-block bg-pink-50 text-pink-600 text-xs px-2 py-1 rounded-full">
                                {tag.name}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                          <span className="text-xl font-medium text-amber-600">{product.price}</span>
                          <div className="flex space-x-2">
                            {product.isCustomizable && (
                              <Link 
                                href={`/custom-bouquet?productId=${product.id}`}
                                className="bg-white border border-pink-400 text-pink-600 hover:bg-pink-50 px-3 py-2 rounded-md text-sm shadow-sm transition-colors"
                              >
                                {t('customize')}
                              </Link>
                            )}
                            <button 
                              onClick={() => handleAddToCart(product.id)}
                              className="bg-gradient-to-r from-pink-500 to-pink-400 hover:from-pink-600 hover:to-pink-500 text-white px-4 py-2 rounded-md text-sm shadow-sm transition-colors"
                            >
                              {t('addToCart')}
                            </button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </Container>
    </Section>
  );
} 
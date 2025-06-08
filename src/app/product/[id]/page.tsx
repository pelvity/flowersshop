'use client';

import { Section, Container, Card } from "@/components/ui";
import { useLanguage } from "@/context/language-context";
import { useCart } from "@/context/cart-context";
import { useParams } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, ChevronLeft, Heart } from "lucide-react";
import getRepositories from "@/lib/repositories";
import { Product } from "@/lib/repositories/types";

export default function ProductPage() {
  const { t } = useLanguage();
  const { addProduct } = useCart();
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  
  // Memoize repositories to prevent recreation on each render
  const repositories = useMemo(() => getRepositories(), []);
  
  useEffect(() => {
    if (params.id) {
      const productId = parseInt(params.id as string);
      const foundProduct = repositories.products.getById(productId);
      
      if (foundProduct) {
        setProduct(foundProduct);
      }
      
      setIsLoading(false);
    }
  }, [params.id, repositories]);
  
  const handleAddToCart = () => {
    if (product) {
      addProduct(product.id, quantity);
    }
  };
  
  if (isLoading) {
    return (
      <Section>
        <Container>
          <div className="h-96 flex items-center justify-center">
            <p className="text-pink-500">Loading...</p>
          </div>
        </Container>
      </Section>
    );
  }
  
  if (!product) {
    return (
      <Section>
        <Container>
          <div className="text-center py-16">
            <h1 className="text-3xl font-bold text-pink-700 mb-4">{t('productNotFound')}</h1>
            <p className="text-gray-600 mb-8">{t('productNotFoundDesc')}</p>
            <Link href="/catalog" className="text-pink-600 hover:text-pink-700 font-medium">
              {t('backToCatalog')}
            </Link>
          </div>
        </Container>
      </Section>
    );
  }
  
  // Get product category and tags
  const category = repositories.categories.getById(product.categoryId);
  const productTags = repositories.tags.getAll().filter(tag => product.tags.includes(tag.id));
  
  return (
    <Section className="bg-gradient-to-b from-pink-50 to-white py-12">
      <Container>
        <Link href="/catalog" className="flex items-center text-pink-600 hover:text-pink-700 mb-8">
          <ChevronLeft size={20} />
          <span>{t('backToCatalog')}</span>
        </Link>
        
        <div className="bg-white rounded-lg shadow-md border border-pink-100 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Product Image */}
            <div className="p-6">
              <div className="relative aspect-square overflow-hidden rounded-lg border border-pink-100">
                <Image 
                  src={product.image} 
                  alt={product.name} 
                  fill 
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </div>
            
            {/* Product Details */}
            <div className="p-6 flex flex-col">
              <div className="mb-2">
                {category && (
                  <Link href={`/catalog?category=${category.id}`} className="text-sm text-pink-600 hover:underline">
                    {category.name}
                  </Link>
                )}
              </div>
              
              <h1 className="text-3xl font-bold text-pink-700 mb-2">{product.name}</h1>
              <p className="text-2xl font-medium text-amber-600 mb-4">{product.price}</p>
              
              <div className="border-t border-b border-pink-100 py-4 my-4">
                <p className="text-gray-700">{product.description}</p>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-6">
                {productTags.map(tag => (
                  <span key={tag.id} className="inline-block bg-pink-50 text-pink-600 text-xs px-3 py-1 rounded-full">
                    {tag.name}
                  </span>
                ))}
              </div>
              
              <div className="flex items-center mb-6">
                <label htmlFor="quantity" className="mr-4 text-gray-700">
                  {t('quantity')}:
                </label>
                <div className="flex items-center border border-gray-300 rounded">
                  <button 
                    onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                    className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                  >
                    -
                  </button>
                  <input
                    id="quantity"
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-12 text-center border-x border-gray-300 py-1"
                    min="1"
                  />
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
              </div>
              
              <div className="mt-auto flex space-x-4">
                {product.isCustomizable && (
                  <Link 
                    href={`/custom-bouquet?productId=${product.id}`}
                    className="flex-1 bg-white border border-pink-400 text-pink-600 hover:bg-pink-50 px-4 py-3 rounded-md font-medium shadow-sm transition-colors text-center"
                  >
                    {t('customize')}
                  </Link>
                )}
                
                <button 
                  onClick={handleAddToCart}
                  className="flex-1 bg-gradient-to-r from-pink-500 to-pink-400 hover:from-pink-600 hover:to-pink-500 text-white px-4 py-3 rounded-md font-medium shadow-sm transition-colors flex items-center justify-center"
                >
                  <ShoppingCart size={20} className="mr-2" />
                  {t('addToCart')}
                </button>
                
                <button className="bg-white border border-pink-200 text-pink-600 hover:bg-pink-50 p-3 rounded-md shadow-sm transition-colors">
                  <Heart size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
} 
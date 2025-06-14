'use client';

import { Section, Container, Card } from "@/components/ui";
import { useTranslations } from 'next-intl';
import { useCart } from "@/context/cart-context";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, ChevronLeft, Heart, ImageIcon } from "lucide-react";
import { BouquetRepository, CategoryRepository, Bouquet } from "@/lib/supabase";

export default function ProductPage() {
  const t = useTranslations();
  const { addProduct } = useCart();
  const params = useParams();
  const locale = params.locale as string;
  const [bouquet, setBouquet] = useState<Bouquet | null>(null);
  const [category, setCategory] = useState<any | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function loadBouquet() {
      if (!params.id) return;
      
      try {
        setIsLoading(true);
        // Use the Supabase repository to fetch the bouquet
        const bouquetData = await BouquetRepository.getById(params.id as string);
        
        if (bouquetData) {
          setBouquet(bouquetData);
          
          // If the bouquet has a category, fetch it
          if (bouquetData.category_id) {
            const categoryData = await CategoryRepository.getById(bouquetData.category_id);
            setCategory(categoryData);
          }
        }
      } catch (err) {
        console.error('Error loading bouquet:', err);
        setError('Failed to load product data');
      } finally {
        setIsLoading(false);
      }
    }
    
    loadBouquet();
  }, [params.id]);
  
  const handleAddToCart = () => {
    if (bouquet) {
      addProduct(bouquet.id, quantity);
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
  
  if (error) {
    return (
      <Section>
        <Container>
          <div className="text-center py-16">
            <h1 className="text-3xl font-bold text-pink-700 mb-4">Error</h1>
            <p className="text-gray-600 mb-8">{error}</p>
            <Link href={`/${locale}/catalog`} className="text-pink-600 hover:text-pink-700 font-medium">
              Back to Catalog
            </Link>
          </div>
        </Container>
      </Section>
    );
  }
  
  if (!bouquet) {
    return (
      <Section>
        <Container>
          <div className="text-center py-16">
            <h1 className="text-3xl font-bold text-pink-700 mb-4">Product Not Found</h1>
            <p className="text-gray-600 mb-8">We couldn't find the product you're looking for.</p>
            <Link href={`/${locale}/catalog`} className="text-pink-600 hover:text-pink-700 font-medium">
              Back to Catalog
            </Link>
          </div>
        </Container>
      </Section>
    );
  }
  
  return (
    <Section className="bg-gradient-to-b from-pink-50 to-white py-12">
      <Container>
        <Link href={`/${locale}/catalog`} className="flex items-center text-pink-600 hover:text-pink-700 mb-8">
          <ChevronLeft size={20} />
          <span>Back to Catalog</span>
        </Link>
        
        <div className="bg-white rounded-lg shadow-md border border-pink-100 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Product Image */}
            <div className="p-6">
              <div className="relative aspect-square overflow-hidden rounded-lg border border-pink-100">
                {bouquet.image ? (
                  <Image 
                    src={bouquet.image}
                    alt={bouquet.name}
                    fill 
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full bg-gray-200">
                    <ImageIcon className="w-16 h-16 text-gray-400" />
                  </div>
                )}
              </div>
            </div>
            
            {/* Product Details */}
            <div className="p-6 flex flex-col">
              <div className="mb-2">
                {category && (
                  <Link href={`/${locale}/catalog?category=${category.id}`} className="text-sm text-pink-600 hover:underline">
                    {category.name}
                  </Link>
                )}
              </div>
              
              <h1 className="text-3xl font-bold text-pink-700 mb-2">{bouquet.name}</h1>
              <p className="text-2xl font-medium text-amber-600 mb-4">
                ${bouquet.discount_price || bouquet.price}
              </p>
              
              <div className="border-t border-b border-pink-100 py-4 my-4">
                <p className="text-gray-700">{bouquet.description}</p>
              </div>
              
              {bouquet.tags && bouquet.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {bouquet.tags.map((tag: string, index: number) => (
                    <span key={index} className="inline-block bg-pink-50 text-pink-600 text-xs px-3 py-1 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              
              <div className="flex items-center mb-6">
                <label htmlFor="quantity" className="mr-4 text-gray-700">
                  Quantity:
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
                <button 
                  onClick={handleAddToCart}
                  disabled={!bouquet.in_stock}
                  className={`flex-1 ${bouquet.in_stock 
                    ? 'bg-gradient-to-r from-pink-500 to-pink-400 hover:from-pink-600 hover:to-pink-500 text-white' 
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  } px-4 py-3 rounded-md font-medium shadow-sm transition-colors flex items-center justify-center`}
                >
                  <ShoppingCart size={20} className="mr-2" />
                  {bouquet.in_stock ? 'Add to Cart' : 'Out of Stock'}
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
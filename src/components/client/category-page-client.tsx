'use client';

import { Container, Section, Card } from "../ui";
import { useLanguage } from "@/context/language-context";
import { categories, getProductsByCategory } from "@/lib/db";
import Link from "next/link";

export default function CategoryPageClient() {
  const { t } = useLanguage();
  
  return (
    <Section className="bg-gradient-to-b from-pink-50 to-white py-12">
      <Container>
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-pink-700 mb-4">{t('flowerCategories')}</h1>
          <p className="text-xl text-pink-400 max-w-3xl mx-auto">
            {t('exploreCategories')}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category) => {
            const productCount = getProductsByCategory(category.id).length;
            
            return (
              <Card 
                key={category.id} 
                className="flex flex-col overflow-hidden transition-all hover:shadow-lg border border-pink-100 bg-white"
              >
                <div className="p-8 flex flex-col h-full relative">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-pink-50 rounded-bl-full opacity-50"></div>
                  <div className="flex-1 relative z-10">
                    <h3 className="text-2xl font-bold text-pink-700 mb-3">{category.name}</h3>
                    <p className="text-gray-600 mb-3">{category.description}</p>
                    <p className="text-pink-400 text-sm font-medium">
                      {productCount} {productCount === 1 ? 'item' : 'items'}
                    </p>
                  </div>
                  <div className="mt-6 relative z-10">
                    <Link 
                      href={`/catalog?category=${category.id}`}
                      className="inline-block bg-gradient-to-r from-pink-500 to-pink-400 hover:from-pink-600 hover:to-pink-500 text-white px-6 py-3 rounded-md font-medium transition-colors shadow-sm"
                    >
                      {t('browse')}
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </Container>
    </Section>
  );
} 
'use client';

import { useTranslations } from 'next-intl';
import Image from "next/image";
import Link from "next/link";
import { Bouquet, Category } from "@/lib/supabase";
import { ImageIcon } from 'lucide-react';
import { useParams } from 'next/navigation';

export function FeaturedBouquetsSection({ bouquets }: { bouquets: Bouquet[] }) {
  const t = useTranslations();
  const { locale } = useParams();

  if (bouquets.length === 0) return null;

  return (
    <div className="mb-16">
      <h2 className="text-2xl font-bold text-pink-600 mb-6">{t('home.featured.title')}</h2>
      <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4 xl:gap-x-8">
        {bouquets.map((bouquet) => (
          <div key={bouquet.id} className="group relative">
            <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-lg bg-gray-200 xl:aspect-h-8 xl:aspect-w-7">
              {bouquet.image ? (
                <Image
                  src={bouquet.image}
                  alt={bouquet.name}
                  layout="fill"
                  objectFit="cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-gray-200">
                  <ImageIcon className="w-12 h-12 text-gray-400" />
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="text-lg font-medium text-pink-700">{bouquet.name}</h3>
              <p className="text-gray-600 mt-2 text-sm line-clamp-2">{bouquet.description || ''}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xl font-medium text-amber-600">
                  ${bouquet.discount_price || bouquet.price}
                </span>
                <Link
                  href={`/${locale}/bouquet/${bouquet.id}`}
                  className="bg-gradient-to-r from-pink-500 to-pink-400 hover:from-pink-600 hover:to-pink-500 text-white px-4 py-2 rounded-md text-sm shadow-sm transition-colors"
                >
                  {t('common.buttons.view_details')}
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CategoriesSection({ categories }: { categories: Category[] }) {
  const t = useTranslations();
  const { locale } = useParams();

  return (
    <div>
      <h2 className="text-2xl font-bold text-pink-600 mb-6">{t('catalog.allCategories')}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <Link 
            key={category.id} 
            href={`/${locale}/catalog?category=${category.id}`}
            className="bg-white rounded-lg shadow-md overflow-hidden border border-pink-100 hover:shadow-lg transition-shadow"
          >
            <div className="p-6">
              <h3 className="text-xl font-medium text-pink-700">{category.name}</h3>
              <p className="text-gray-600 mt-2">{category.description || ''}</p>
              <div className="mt-4 text-pink-500">{t('home.featured.view_all')} →</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
} 

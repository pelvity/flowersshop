'use client';

import Link from "next/link";
import { Button } from "./ui";
import LanguageSwitcher from "./language-switcher";
import { useLanguage } from "@/context/language-context";
import CartButton from "./cart/cart-button";

export default function Header() {
  const { t } = useLanguage();
  const locale = t('locale');
  
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex-shrink-0">
            <Link href={`/${locale}`} className="flex items-center">
              <span className="text-2xl font-bold text-pink-600">Flower Paradise</span>
            </Link>
          </div>
          <nav className="hidden md:flex space-x-10">
            <Link href={`/${locale}`} className="text-base font-medium text-gray-700 hover:text-pink-600">
              {t('home')}
            </Link>
            <Link href={`/${locale}/catalog`} className="text-base font-medium text-gray-700 hover:text-pink-600">
              {t('catalog')}
            </Link>
            <Link href={`/${locale}/categories`} className="text-base font-medium text-gray-700 hover:text-pink-600">
              {t('categories')}
            </Link>
            <Link href={`/${locale}/custom-bouquet`} className="text-base font-medium text-gray-700 hover:text-pink-600">
              {t('customBouquet')}
            </Link>
            <Link href={`/${locale}/about`} className="text-base font-medium text-gray-700 hover:text-pink-600">
              {t('aboutUs')}
            </Link>
            <Link href={`/${locale}/contact`} className="text-base font-medium text-gray-700 hover:text-pink-600">
              {t('contact')}
            </Link>
          </nav>
          <div className="flex items-center space-x-6">
            <LanguageSwitcher />
            <CartButton />
            <div className="hidden sm:flex">
              <Button>
                {t('orderNow')}
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile menu, show/hide based on menu state */}
      <div className="md:hidden border-t border-gray-200 bg-white">
        <div className="space-y-1 px-4 pt-2 pb-3">
          <Link href={`/${locale}`} className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-pink-600">
            {t('home')}
          </Link>
          <Link href={`/${locale}/catalog`} className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-pink-600">
            {t('catalog')}
          </Link>
          <Link href={`/${locale}/categories`} className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-pink-600">
            {t('categories')}
          </Link>
          <Link href={`/${locale}/custom-bouquet`} className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-pink-600">
            {t('customBouquet')}
          </Link>
          <Link href={`/${locale}/about`} className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-pink-600">
            {t('aboutUs')}
          </Link>
          <Link href={`/${locale}/contact`} className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-pink-600">
            {t('contact')}
          </Link>
        </div>
      </div>
    </header>
  );
} 
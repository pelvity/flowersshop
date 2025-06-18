'use client';

import Link from 'next/link';
import { Button } from "./ui";
import LanguageSwitcher from "./language-switcher";
import { useTranslations } from 'next-intl';
import CartButton from "./cart/cart-button";
import { useParams } from 'next/navigation';

export default function Header() {
  console.log('[HEADER] Rendering Header component');
  
  try {
  const t = useTranslations();
    const { locale } = useParams();
    console.log('[HEADER] Successfully initialized translations');
    
    const getLocalePath = (path: string) => `/${locale}${path}`;
  
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex-shrink-0">
              <Link href={getLocalePath("/")} className="flex items-center">
              <span className="text-2xl font-bold text-pink-600">Flower Paradise</span>
            </Link>
          </div>
          <nav className="hidden md:flex space-x-10">
              <Link href={getLocalePath("/")} className="text-base font-medium text-gray-700 hover:text-pink-600">
              {t('common.header.home')}
            </Link>
              <Link href={getLocalePath("/catalog")} className="text-base font-medium text-gray-700 hover:text-pink-600">
              {t('catalog.ourCollection')}
            </Link>
              <Link href={getLocalePath("/custom-bouquet")} className="text-base font-medium text-gray-700 hover:text-pink-600">
              {t('catalog.customize')}
            </Link>
              <Link href={getLocalePath("/contact")} className="text-base font-medium text-gray-700 hover:text-pink-600">
              {t('common.header.contact')}
            </Link>
          </nav>
          <div className="flex items-center space-x-6">
            <LanguageSwitcher />
            <CartButton />
          </div>
        </div>
      </div>
      
      {/* Mobile menu, show/hide based on menu state */}
      <div className="md:hidden border-t border-gray-200 bg-white">
        <div className="space-y-1 px-4 pt-2 pb-3">
            <Link href={getLocalePath("/")} className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-pink-600">
            {t('common.header.home')}
          </Link>
            <Link href={getLocalePath("/catalog")} className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-pink-600">
            {t('catalog.ourCollection')}
          </Link>
            <Link href={getLocalePath("/custom-bouquet")} className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-pink-600">
            {t('catalog.customize')}
          </Link>
            <Link href={getLocalePath("/contact")} className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-pink-600">
            {t('common.header.contact')}
          </Link>
        </div>
      </div>
    </header>
  );
  } catch (error) {
    console.error('[HEADER] Error rendering Header:', error);
    return <div>Error loading header. See console for details.</div>;
  }
} 
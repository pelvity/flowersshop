'use client';

import Link from 'next/link';
import { Button } from "./ui";
import LanguageSwitcher from "./language-switcher";
import { useTranslations } from 'next-intl';
import CartButton from "./cart/cart-button";
import { useParams } from 'next/navigation';
import { useState } from 'react';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const t = useTranslations();
    const { locale } = useParams();
    
    const getLocalePath = (path: string) => `/${locale}${path}`;

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href={getLocalePath("/")} className="flex items-center">
                <span className="text-2xl font-bold text-pink-600">Flower Paradise</span>
              </Link>
            </div>
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
          
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex">
              <LanguageSwitcher />
            </div>
            <CartButton />
            
            {/* Mobile menu button */}
            <button
              type="button"
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-pink-600 hover:bg-gray-100 focus:outline-none"
              aria-controls="mobile-menu"
              aria-expanded="false"
              onClick={toggleMobileMenu}
            >
              <span className="sr-only">Open main menu</span>
              {/* Icon when menu is closed */}
              <svg
                className={`${mobileMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              {/* Icon when menu is open */}
              <svg
                className={`${mobileMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu, show/hide based on menu state */}
      <div
        className={`${mobileMenuOpen ? 'block' : 'hidden'} md:hidden border-t border-gray-200 bg-white`}
        id="mobile-menu"
      >
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
          <div className="px-3 py-2">
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </header>
  );
} 
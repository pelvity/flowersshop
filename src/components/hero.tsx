'use client';

import { Button } from "./ui";
import { useTranslations } from 'next-intl';
import Link from "next/link";
import HeroCarousel from "./hero-carousel";
import { BouquetMedia } from "@/lib/supabase";

interface HeroProps {
  carouselMedia: BouquetMedia[];
}

export default function Hero({ carouselMedia = [] }: HeroProps) {
  const t = useTranslations();
  
  // Safe translation helper
  const safeT = (key: string, defaultValue: string) => {
    try {
      return t(key, { defaultValue });
    } catch (error) {
      return defaultValue;
    }
  };
  
  // Safe locale helper
  const safeLocale = () => {
    try {
      return t('locale', { defaultValue: 'uk' });
    } catch (error) {
      return 'uk';
    }
  };
  
  // Function to scroll to the contact section
  const scrollToContact = () => {
    const contactSection = document.getElementById('contact-section');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  return (
    <div className="relative bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
          <svg
            className="hidden lg:block absolute right-0 inset-y-0 h-full w-48 text-white transform translate-x-1/2"
            fill="currentColor"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <polygon points="50,0 100,0 50,100 0,100" />
          </svg>

          <div className="pt-6 sm:pt-16 lg:pt-8 xl:pt-16">
            <div className="px-4 sm:px-6 text-center lg:text-left">
              <h1 className="text-3xl tracking-tight font-extrabold text-gray-900 sm:text-4xl md:text-5xl lg:text-6xl">
                <span className="block">{safeT('home.hero.title', 'Beautiful Bouquets for Every Occasion')}</span>
              </h1>
              <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                {safeT('home.hero.subtitle', 'Handcrafted with love and delivered with care')}
              </p>
              <div className="mt-5 sm:mt-8 flex flex-col sm:flex-row justify-center lg:justify-start">
                <div className="rounded-md shadow w-full sm:w-auto">
                  <Link href={`/${safeLocale()}/catalog`} className="w-full sm:w-auto">
                    <Button size="lg" className="w-full sm:w-auto">
                      {safeT('catalog.ourCollection', 'Our Collection')}
                    </Button>
                  </Link>
                </div>
                <div className="mt-3 sm:mt-0 sm:ml-3 w-full sm:w-auto">
                  <Button 
                    variant="outline" 
                    size="lg"
                    onClick={scrollToContact}
                    className="w-full sm:w-auto"
                  >
                    {safeT('common.header.contact', 'Contact Us')}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile-first approach for carousel */}
      <div className="mt-8 sm:mt-12 lg:mt-0 lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
        <HeroCarousel media={carouselMedia} />
      </div>
    </div>
  );
} 

'use client';

import Link from "next/link";
import { useTranslations } from 'next-intl';
import { useEffect, useState } from "react";
import { getStoreSettings } from "@/lib/store-settings";
import SocialMediaLinks from "./common/SocialMediaLinks";

export default function Footer() {
  const t = useTranslations();
  const [storeAddress, setStoreAddress] = useState<string>(t('common.footer.address'));
  const [storePhone, setStorePhone] = useState<string>('+380 12 345 6789');
  const [storeEmail, setStoreEmail] = useState<string>('info@flowerparadise.com');
  
  // Fetch store settings
  useEffect(() => {
    const fetchStoreSettings = async () => {
      try {
        const settings = await getStoreSettings();
        if (settings.store_address) {
          setStoreAddress(settings.store_address);
        }
        if (settings.store_phone) {
          setStorePhone(settings.store_phone);
        }
        if (settings.store_email) {
          setStoreEmail(settings.store_email);
        }
      } catch (error) {
        console.error('Error fetching store settings:', error);
      }
    };
    
    fetchStoreSettings();
  }, []);
  
  return (
    <footer className="bg-gray-900 text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4 md:gap-8">
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">{t('common.footer.about')}</h3>
            <p className="text-sm sm:text-base text-gray-400">{t('common.footer.aboutText')}</p>
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">{t('common.footer.quickLinks')}</h3>
            <ul className="space-y-1 sm:space-y-2 text-sm sm:text-base">
              <li>
                <Link href="/" className="text-gray-400 hover:text-pink-500">
                  {t('common.header.home')}
                </Link>
              </li>
              <li>
                <Link href="/catalog" className="text-gray-400 hover:text-pink-500">
                  {t('catalog.ourCollection')}
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-400 hover:text-pink-500">
                  {t('common.header.about')}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-pink-500">
                  {t('common.header.contact')}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">{t('common.footer.contact')}</h3>
            <address className="text-sm sm:text-base text-gray-400 not-italic">
              <p>{storeAddress}</p>
              <p className="mt-1 sm:mt-2">
                <a href={`tel:${storePhone.replace(/\s/g, '')}`} className="hover:text-pink-500">{storePhone}</a>
              </p>
              <p className="mt-1">
                <a href={`mailto:${storeEmail}`} className="hover:text-pink-500">{storeEmail}</a>
              </p>
            </address>
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">{t('common.footer.followUs')}</h3>
            <SocialMediaLinks 
              iconSize={24}
              iconClassName="text-gray-400 hover:text-pink-500 transition-colors"
            />
          </div>
        </div>
        <div className="mt-6 sm:mt-8 border-t border-gray-800 pt-6 sm:pt-8 text-center">
          <p className="text-xs sm:text-sm text-gray-400">© {new Date().getFullYear()} Flower Paradise. {t('common.footer.rightsReserved')}</p>
        </div>
      </div>
    </footer>
  );
} 
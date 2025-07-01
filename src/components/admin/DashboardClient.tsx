'use client';

import { useState } from 'react';
import { Package, Flower2, Tag, ChevronRight, ShoppingBasket, Edit } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Bouquet } from '@/lib/supabase';
import { useTranslations } from 'next-intl';
import { formatPrice } from '@/lib/functions';

interface DashboardStats {
  totalBouquets: number;
  totalFlowers: number;
  totalCategories: number;
  totalFeaturedBouquets: number;
  totalInStockBouquets: number;
}

interface DashboardClientProps {
  locale: string;
  initialStats: DashboardStats;
  initialFeaturedBouquets: Bouquet[];
}

export default function DashboardClient({ 
  locale,
  initialStats, 
  initialFeaturedBouquets
}: DashboardClientProps) {
  const [stats, setStats] = useState<DashboardStats>(initialStats);
  const [featuredBouquets, setFeaturedBouquets] = useState<Bouquet[]>(initialFeaturedBouquets);
  const t = useTranslations('admin');

  const StatCard = ({ title, value, icon: Icon, link, linkText, colorClass }: any) => (
    <div className={`${colorClass} text-white rounded-xl shadow-lg p-6 flex flex-col`}>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <p className="font-semibold text-lg">{title}</p>
          <p className="text-5xl font-bold">{value}</p>
        </div>
        <div className="bg-white/20 p-3 rounded-full">
          <Icon className="h-7 w-7" />
        </div>
      </div>
      <div className="mt-auto pt-4">
        <Link href={link} className="text-sm text-white/80 hover:text-white flex items-center font-medium">
          {linkText}
          <ChevronRight className="h-4 w-4 ml-1" />
        </Link>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">{t('dashboard.welcome')}</h1>
        <p className="text-gray-500 mt-1">{t('dashboard.welcomeSubtitle')}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        <StatCard 
          title={t('dashboard.totalBouquets')}
          value={stats.totalBouquets}
          icon={Package}
          link={`/${locale}/admin/bouquets`}
          linkText={t('dashboard.viewAll')}
          colorClass="bg-gradient-to-br from-pink-500 to-rose-500"
        />
        <StatCard 
          title={t('dashboard.totalFlowers')}
          value={stats.totalFlowers}
          icon={Flower2}
          link={`/${locale}/admin/flowers`}
          linkText={t('dashboard.viewAll')}
          colorClass="bg-gradient-to-br from-violet-500 to-purple-500"
        />
        <StatCard 
          title={t('dashboard.categories')}
          value={stats.totalCategories}
          icon={Tag}
          link={`/${locale}/admin/categories`}
          linkText={t('dashboard.manage')}
          colorClass="bg-gradient-to-br from-sky-500 to-blue-500"
        />
        <StatCard 
          title={t('dashboard.featuredBouquets')}
          value={stats.totalFeaturedBouquets}
          icon={Package}
          link={`/${locale}/admin/bouquets`}
          linkText={t('dashboard.manage')}
          colorClass="bg-gradient-to-br from-amber-500 to-orange-500"
        />
        <StatCard 
          title={t('dashboard.inStockBouquets')}
          value={stats.totalInStockBouquets}
          icon={ShoppingBasket}
          link={`/${locale}/admin/bouquets`}
          linkText={t('dashboard.viewStockLevels')}
          colorClass="bg-gradient-to-br from-emerald-500 to-green-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">{t('dashboard.quickActions')}</h2>
            <div className="space-y-3">
              <Link href={`/${locale}/admin/bouquets/create`} className="flex items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition group">
                <Package className="h-5 w-5 text-pink-500 mr-4" />
                <span className="text-gray-700 font-medium group-hover:text-pink-600">{t('dashboard.addNewBouquet')}</span>
                <ChevronRight className="h-5 w-5 text-gray-400 ml-auto group-hover:text-pink-600" />
              </Link>
              <Link href={`/${locale}/admin/flowers/create`} className="flex items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition group">
                <Flower2 className="h-5 w-5 text-pink-500 mr-4" />
                <span className="text-gray-700 font-medium group-hover:text-pink-600">{t('dashboard.addNewFlower')}</span>
                <ChevronRight className="h-5 w-5 text-gray-400 ml-auto group-hover:text-pink-600" />
              </Link>
              <Link href={`/${locale}/admin/categories`} className="flex items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition group">
                <Tag className="h-5 w-5 text-pink-500 mr-4" />
                <span className="text-gray-700 font-medium group-hover:text-pink-600">{t('dashboard.manageCategories')}</span>
                <ChevronRight className="h-5 w-5 text-gray-400 ml-auto group-hover:text-pink-600" />
              </Link>
            </div>
        </div>
        
        {/* Featured Bouquets */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-md">
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800">{t('dashboard.featuredBouquetsTitle')}</h3>
              <Link href={`/${locale}/admin/bouquets`} className="text-sm text-pink-600 hover:text-pink-800 font-medium">
                {t('dashboard.viewAll')}
              </Link>
          </div>
          {featuredBouquets.length > 0 ? (
            <div className="flow-root">
              <ul className="divide-y divide-gray-200">
                {featuredBouquets.map(bouquet => (
                  <li key={bouquet.id} className="p-4 flex items-center space-x-4 hover:bg-gray-50 transition">
                    <div className="flex-shrink-0">
                       <Image 
                         src={bouquet.image || '/placeholder.svg'} 
                         alt={bouquet.name}
                         width={40}
                         height={40}
                         className="w-10 h-10 rounded-full object-cover"
                       />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 truncate">{bouquet.name}</p>
                      <p className="text-sm text-gray-500">{formatPrice(bouquet.price, locale)}</p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bouquet.in_stock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {bouquet.in_stock ? t('dashboard.inStock') : t('dashboard.outOfStock')}
                    </span>
                    <Link href={`/${locale}/admin/bouquets/${bouquet.id}/edit`} className="text-gray-400 hover:text-pink-600 p-2 rounded-full hover:bg-gray-100 transition">
                        <Edit className="w-5 h-5" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="text-center py-12 px-6">
                <Package className="w-12 h-12 mx-auto text-gray-300" />
                <h3 className="mt-2 text-lg font-medium text-gray-800">{t('dashboard.noFeaturedBouquets')}</h3>
                <p className="mt-1 text-sm text-gray-500">{t('dashboard.noFeaturedBouquetsHint')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 
'use client';

import { useState } from 'react';
import { Package, Flower2, Tag, AlertCircle, ChevronRight, ShoppingBasket, Edit } from 'lucide-react';
import Link from 'next/link';
import { Flower, Bouquet } from '@/lib/supabase';
import { useTranslations } from 'next-intl';

interface DashboardStats {
  totalBouquets: number;
  totalFlowers: number;
  lowStockFlowers: number;
  totalCategories: number;
  totalFeaturedBouquets: number;
  totalInStockBouquets: number;
}

interface DashboardClientProps {
  locale: string;
  initialStats: DashboardStats;
  initialFeaturedBouquets: Bouquet[];
  initialLowStockFlowers: Flower[];
}

export default function DashboardClient({ 
  locale,
  initialStats, 
  initialFeaturedBouquets, 
  initialLowStockFlowers 
}: DashboardClientProps) {
  const [stats, setStats] = useState<DashboardStats>(initialStats);
  const [featuredBouquets, setFeaturedBouquets] = useState<Bouquet[]>(initialFeaturedBouquets);
  const [lowStockFlowers, setLowStockFlowers] = useState<Flower[]>(initialLowStockFlowers);
  const t = useTranslations('admin');

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6 text-pink-700">{t('dashboard.title')}</h1>
      
      {/* Admin Quick Links */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-medium mb-4 text-pink-700">{t('dashboard.quickActions')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link href={`/${locale}/admin/bouquets/create`} className="flex items-center p-3 bg-pink-50 hover:bg-pink-100 rounded-lg transition">
            <span className="bg-pink-100 p-2 rounded-md mr-3">
              <Package className="h-5 w-5 text-pink-600" />
            </span>
            <span className="text-pink-700">{t('dashboard.addNewBouquet')}</span>
          </Link>
          
          <Link href={`/${locale}/admin/flowers/create`} className="flex items-center p-3 bg-pink-50 hover:bg-pink-100 rounded-lg transition">
            <span className="bg-pink-100 p-2 rounded-md mr-3">
              <Flower2 className="h-5 w-5 text-pink-600" />
            </span>
            <span className="text-pink-700">{t('dashboard.addNewFlower')}</span>
          </Link>
          
          <Link href={`/${locale}/admin/categories`} className="flex items-center p-3 bg-pink-50 hover:bg-pink-100 rounded-lg transition">
            <span className="bg-pink-100 p-2 rounded-md mr-3">
              <Tag className="h-5 w-5 text-pink-600" />
            </span>
            <span className="text-pink-700">{t('dashboard.manageCategories')}</span>
          </Link>
          
          <Link href={`/${locale}/admin/flowers`} className="flex items-center p-3 bg-pink-50 hover:bg-pink-100 rounded-lg transition">
            <span className="bg-pink-100 p-2 rounded-md mr-3">
              <Edit className="h-5 w-5 text-pink-600" />
            </span>
            <span className="text-pink-700">{t('dashboard.updateInventory')}</span>
          </Link>
          
          <Link href={`/${locale}/admin/bouquets`} className="flex items-center p-3 bg-pink-50 hover:bg-pink-100 rounded-lg transition">
            <span className="bg-pink-100 p-2 rounded-md mr-3">
              <ShoppingBasket className="h-5 w-5 text-pink-600" />
            </span>
            <span className="text-pink-700">{t('dashboard.manageBouquets')}</span>
          </Link>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-pink-600 mb-1">{t('dashboard.totalBouquets')}</p>
              <h3 className="text-3xl font-bold text-pink-700">{stats.totalBouquets}</h3>
            </div>
            <span className="bg-pink-100 p-3 rounded-full">
              <Package className="h-6 w-6 text-pink-600" />
            </span>
          </div>
          <div className="mt-4">
            <Link href={`/${locale}/admin/bouquets`} className="text-sm text-pink-600 hover:text-pink-800 flex items-center">
              {t('dashboard.viewAllBouquets')}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-pink-600 mb-1">{t('dashboard.totalFlowers')}</p>
              <h3 className="text-3xl font-bold text-pink-700">{stats.totalFlowers}</h3>
            </div>
            <span className="bg-pink-100 p-3 rounded-full">
              <Flower2 className="h-6 w-6 text-pink-600" />
            </span>
          </div>
          <div className="mt-4">
            <Link href={`/${locale}/admin/flowers`} className="text-sm text-pink-600 hover:text-pink-800 flex items-center">
              {t('dashboard.viewAllFlowers')}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-pink-600 mb-1">{t('dashboard.lowStockFlowers')}</p>
              <h3 className="text-3xl font-bold text-pink-700">{stats.lowStockFlowers}</h3>
            </div>
            <span className="bg-pink-100 p-3 rounded-full">
              <AlertCircle className="h-6 w-6 text-pink-600" />
            </span>
          </div>
          <div className="mt-4">
            <Link href={`/${locale}/admin/flowers`} className="text-sm text-pink-600 hover:text-pink-800 flex items-center">
              {t('dashboard.checkInventory')}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-pink-600 mb-1">{t('dashboard.categories')}</p>
              <h3 className="text-3xl font-bold text-pink-700">{stats.totalCategories}</h3>
            </div>
            <span className="bg-pink-100 p-3 rounded-full">
              <Tag className="h-6 w-6 text-pink-600" />
            </span>
          </div>
          <div className="mt-4">
            <Link href={`/${locale}/admin/categories`} className="text-sm text-pink-600 hover:text-pink-800 flex items-center">
              {t('dashboard.manageCategories')}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-pink-600 mb-1">{t('dashboard.featuredBouquets')}</p>
              <h3 className="text-3xl font-bold text-pink-700">{stats.totalFeaturedBouquets}</h3>
            </div>
            <span className="bg-pink-100 p-3 rounded-full">
              <Package className="h-6 w-6 text-pink-600" />
            </span>
          </div>
          <div className="mt-4">
            <Link href={`/${locale}/admin/bouquets`} className="text-sm text-pink-600 hover:text-pink-800 flex items-center">
              {t('dashboard.manageFeatured')}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-pink-600 mb-1">{t('dashboard.inStockBouquets')}</p>
              <h3 className="text-3xl font-bold text-pink-700">{stats.totalInStockBouquets}</h3>
            </div>
            <span className="bg-pink-100 p-3 rounded-full">
              <ShoppingBasket className="h-6 w-6 text-pink-600" />
            </span>
          </div>
          <div className="mt-4">
            <Link href={`/${locale}/admin/bouquets`} className="text-sm text-pink-600 hover:text-pink-800 flex items-center">
              {t('dashboard.viewStockLevels')}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
        </div>
      </div>
      
      {/* Recently Updated */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Featured Bouquets */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium mb-4 text-pink-700">{t('dashboard.featuredBouquets')}</h3>
          {featuredBouquets.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {featuredBouquets.map(bouquet => (
                <li key={bouquet.id} className="py-3 flex items-center justify-between">
                  <span className="font-medium text-pink-700">{bouquet.name}</span>
                  <span className={`text-sm font-semibold ${bouquet.in_stock ? 'text-pink-600' : 'text-red-600'}`}>
                    {bouquet.in_stock ? t('dashboard.inStock') : t('dashboard.outOfStock')}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-pink-600">{t('dashboard.noFeaturedBouquets')}</p>
          )}
        </div>
        
        {/* Low Stock Flowers */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium mb-4 text-pink-700">{t('dashboard.lowStockFlowers')}</h3>
          {lowStockFlowers.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {lowStockFlowers.map(flower => (
                <li key={flower.id} className="py-3 flex items-center justify-between">
                  <span className="font-medium text-pink-700">{flower.name}</span>
                  <span className="text-sm font-semibold text-pink-600">
                    {flower.in_stock} {t('dashboard.remaining')}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-pink-600">{t('dashboard.allFlowersWellStocked')}</p>
          )}
        </div>
      </div>
    </div>
  );
} 
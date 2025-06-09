'use client';

import { useState } from 'react';
import { Package, Flower2, Tag, AlertCircle, ChevronRight, ShoppingBasket, Edit } from 'lucide-react';
import Link from 'next/link';
import { Flower, Bouquet } from '@/lib/supabase';

interface DashboardStats {
  totalBouquets: number;
  totalFlowers: number;
  lowStockFlowers: number;
  totalCategories: number;
  totalFeaturedBouquets: number;
  totalInStockBouquets: number;
}

interface DashboardClientProps {
  initialStats: DashboardStats;
  initialFeaturedBouquets: Bouquet[];
  initialLowStockFlowers: Flower[];
}

export default function DashboardClient({ 
  initialStats, 
  initialFeaturedBouquets, 
  initialLowStockFlowers 
}: DashboardClientProps) {
  const [stats, setStats] = useState<DashboardStats>(initialStats);
  const [featuredBouquets, setFeaturedBouquets] = useState<Bouquet[]>(initialFeaturedBouquets);
  const [lowStockFlowers, setLowStockFlowers] = useState<Flower[]>(initialLowStockFlowers);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Inventory Management Dashboard</h1>
      
      {/* Admin Quick Links */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-medium mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link href="/admin/bouquets/new" className="flex items-center p-3 bg-pink-50 hover:bg-pink-100 rounded-lg transition">
            <span className="bg-pink-100 p-2 rounded-md mr-3">
              <Package className="h-5 w-5 text-pink-600" />
            </span>
            <span>Add New Bouquet</span>
          </Link>
          
          <Link href="/admin/flowers/new" className="flex items-center p-3 bg-green-50 hover:bg-green-100 rounded-lg transition">
            <span className="bg-green-100 p-2 rounded-md mr-3">
              <Flower2 className="h-5 w-5 text-green-600" />
            </span>
            <span>Add New Flower</span>
          </Link>
          
          <Link href="/admin/categories" className="flex items-center p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition">
            <span className="bg-blue-100 p-2 rounded-md mr-3">
              <Tag className="h-5 w-5 text-blue-600" />
            </span>
            <span>Manage Categories</span>
          </Link>
          
          <Link href="/admin/flowers" className="flex items-center p-3 bg-amber-50 hover:bg-amber-100 rounded-lg transition">
            <span className="bg-amber-100 p-2 rounded-md mr-3">
              <Edit className="h-5 w-5 text-amber-600" />
            </span>
            <span>Update Inventory</span>
          </Link>
          
          <Link href="/admin/bouquets" className="flex items-center p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition">
            <span className="bg-purple-100 p-2 rounded-md mr-3">
              <ShoppingBasket className="h-5 w-5 text-purple-600" />
            </span>
            <span>Manage Bouquets</span>
          </Link>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Bouquets</p>
              <h3 className="text-3xl font-bold text-gray-900">{stats.totalBouquets}</h3>
            </div>
            <span className="bg-pink-100 p-3 rounded-full">
              <Package className="h-6 w-6 text-pink-600" />
            </span>
          </div>
          <div className="mt-4">
            <Link href="/admin/bouquets" className="text-sm text-pink-600 hover:text-pink-800 flex items-center">
              View all bouquets
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Flowers</p>
              <h3 className="text-3xl font-bold text-gray-900">{stats.totalFlowers}</h3>
            </div>
            <span className="bg-green-100 p-3 rounded-full">
              <Flower2 className="h-6 w-6 text-green-600" />
            </span>
          </div>
          <div className="mt-4">
            <Link href="/admin/flowers" className="text-sm text-green-600 hover:text-green-800 flex items-center">
              View all flowers
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 mb-1">Low Stock Flowers</p>
              <h3 className="text-3xl font-bold text-gray-900">{stats.lowStockFlowers}</h3>
            </div>
            <span className="bg-red-100 p-3 rounded-full">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </span>
          </div>
          <div className="mt-4">
            <Link href="/admin/flowers" className="text-sm text-red-600 hover:text-red-800 flex items-center">
              Check inventory
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 mb-1">Categories</p>
              <h3 className="text-3xl font-bold text-gray-900">{stats.totalCategories}</h3>
            </div>
            <span className="bg-blue-100 p-3 rounded-full">
              <Tag className="h-6 w-6 text-blue-600" />
            </span>
          </div>
          <div className="mt-4">
            <Link href="/admin/categories" className="text-sm text-blue-600 hover:text-blue-800 flex items-center">
              Manage categories
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 mb-1">Featured Bouquets</p>
              <h3 className="text-3xl font-bold text-gray-900">{stats.totalFeaturedBouquets}</h3>
            </div>
            <span className="bg-purple-100 p-3 rounded-full">
              <Package className="h-6 w-6 text-purple-600" />
            </span>
          </div>
          <div className="mt-4">
            <Link href="/admin/bouquets" className="text-sm text-purple-600 hover:text-purple-800 flex items-center">
              Manage featured
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 mb-1">In-Stock Bouquets</p>
              <h3 className="text-3xl font-bold text-gray-900">{stats.totalInStockBouquets}</h3>
            </div>
            <span className="bg-emerald-100 p-3 rounded-full">
              <ShoppingBasket className="h-6 w-6 text-emerald-600" />
            </span>
          </div>
          <div className="mt-4">
            <Link href="/admin/bouquets" className="text-sm text-emerald-600 hover:text-emerald-800 flex items-center">
              View stock levels
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
        </div>
      </div>
      
      {/* Recently Updated */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Featured Bouquets */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium mb-4">Featured Bouquets</h3>
          {featuredBouquets.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {featuredBouquets.map(bouquet => (
                <li key={bouquet.id} className="py-3 flex items-center justify-between">
                  <span className="font-medium text-gray-800">{bouquet.name}</span>
                  <span className={`text-sm font-semibold ${bouquet.in_stock ? 'text-green-600' : 'text-red-600'}`}>
                    {bouquet.in_stock ? 'In Stock' : 'Out of Stock'}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No featured bouquets.</p>
          )}
        </div>
        
        {/* Low Stock Flowers */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium mb-4 text-red-600">Low Stock Flowers</h3>
          {lowStockFlowers.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {lowStockFlowers.map(flower => (
                <li key={flower.id} className="py-3 flex items-center justify-between">
                  <span className="font-medium text-gray-800">{flower.name}</span>
                  <span className="text-sm font-semibold text-red-600">
                    {flower.in_stock} remaining
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">All flowers are well-stocked.</p>
          )}
        </div>
      </div>
    </div>
  );
} 
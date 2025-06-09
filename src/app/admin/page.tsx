'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Package, 
  Grid, 
  Tag, 
  Flower2, 
  DollarSign, 
  Users, 
  ShoppingCart, 
  TrendingUp, 
  Clock, 
  Edit,
  Plus 
} from 'lucide-react';
import getRepositories from '@/lib/repositories';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalBouquets: 0,
    totalFlowers: 0,
    totalCategories: 0,
    totalTags: 0,
    totalOrders: 12, // Simulated value
    totalRevenue: 2850, // Simulated value in $
    totalCustomers: 45, // Simulated value
  });
  
  const [popularBouquets, setPopularBouquets] = useState([
    { id: 1, name: 'Romantic Rose Collection', sales: 24, price: 69.99, image: '/bouquets/romantic-roses.jpg' },
    { id: 2, name: 'Spring Celebration', sales: 18, price: 49.99, image: '/bouquets/spring-mix.jpg' },
    { id: 3, name: 'Wedding Elegance', sales: 15, price: 129.99, image: '/bouquets/wedding.jpg' },
  ]);
  
  const [lowStockFlowers, setLowStockFlowers] = useState([
    { id: 1, name: 'Red Roses', stock: 8, threshold: 10 },
    { id: 2, name: 'White Lilies', stock: 5, threshold: 15 },
    { id: 3, name: 'Purple Orchids', stock: 3, threshold: 5 },
  ]);
  
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const repositories = getRepositories();
        const products = repositories.products.getAll();
        const categories = repositories.categories.getAll();
        
        setStats(prev => ({
          ...prev,
          totalBouquets: products.length,
          totalCategories: categories.length,
          totalFlowers: 35, // Simulated value
          totalTags: 24, // Simulated value
        }));
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const mainStats = [
    {
      name: 'Bouquets',
      value: stats.totalBouquets,
      icon: Package,
      href: '/admin/bouquets',
      color: 'bg-pink-100 text-pink-800',
    },
    {
      name: 'Orders',
      value: stats.totalOrders,
      icon: ShoppingCart,
      href: '/admin/orders',
      color: 'bg-purple-100 text-purple-800',
    },
    {
      name: 'Revenue',
      value: `$${stats.totalRevenue}`,
      icon: DollarSign,
      href: '/admin/reports',
      color: 'bg-green-100 text-green-800',
    },
    {
      name: 'Customers',
      value: stats.totalCustomers,
      icon: Users,
      href: '/admin/customers',
      color: 'bg-blue-100 text-blue-800',
    },
  ];
  
  const catalogStats = [
    {
      name: 'Flowers',
      value: stats.totalFlowers,
      icon: Flower2,
      href: '/admin/flowers',
      color: 'bg-red-100 text-red-800',
    },
    {
      name: 'Categories',
      value: stats.totalCategories,
      icon: Grid,
      href: '/admin/categories',
      color: 'bg-amber-100 text-amber-800',
    },
    {
      name: 'Tags',
      value: stats.totalTags,
      icon: Tag,
      href: '/admin/tags',
      color: 'bg-indigo-100 text-indigo-800',
    },
  ];
  
  const recentActivities = [
    { id: 1, action: 'Bouquet created', target: 'Summer Romance', time: '1 hour ago', icon: Package },
    { id: 2, action: 'Order completed', target: '#1234', time: '2 hours ago', icon: ShoppingCart },
    { id: 3, action: 'Flower stock updated', target: 'Red Roses', time: '3 hours ago', icon: Flower2 },
    { id: 4, action: 'Category added', target: 'Seasonal Specials', time: '1 day ago', icon: Grid },
  ];
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Welcome to Flower Shop Admin</h1>
        <p className="text-gray-600 mt-1">Manage your bouquets, flowers, and more</p>
      </div>
      
      {/* Main Stats */}
      <h2 className="text-lg font-medium text-gray-900 mb-3">Business Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {mainStats.map((stat) => (
          <Link 
            key={stat.name}
            href={stat.href}
            className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className={`flex-shrink-0 rounded-md p-3 ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">{stat.value}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      {/* Secondary Stats */}
      <h2 className="text-lg font-medium text-gray-900 mb-3">Catalog Management</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {catalogStats.map((stat) => (
          <Link 
            key={stat.name}
            href={stat.href}
            className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className={`flex-shrink-0 rounded-md p-3 ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">{stat.value}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Popular Bouquets */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">Popular Bouquets</h2>
            <Link href="/admin/bouquets" className="text-sm text-pink-600 hover:text-pink-700">
              View all
            </Link>
          </div>
          <div className="border-t border-gray-200">
            <ul className="divide-y divide-gray-200">
              {popularBouquets.map((bouquet) => (
                <li key={bouquet.id} className="px-4 py-4 sm:px-6 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-12 w-12 rounded-full bg-gray-100 overflow-hidden">
                      <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                        <Package className="h-6 w-6 text-gray-400" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">{bouquet.name}</p>
                      <p className="text-sm text-gray-500">
                        ${bouquet.price} · {bouquet.sales} sold
                      </p>
                    </div>
                  </div>
                  <Link
                    href={`/admin/bouquets/${bouquet.id}/edit`}
                    className="text-pink-600 hover:text-pink-800"
                  >
                    <Edit className="h-5 w-5" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Low Stock Alert */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">Low Stock Alert</h2>
            <Link href="/admin/flowers" className="text-sm text-pink-600 hover:text-pink-700">
              Manage inventory
            </Link>
          </div>
          <div className="border-t border-gray-200">
            <ul className="divide-y divide-gray-200">
              {lowStockFlowers.map((flower) => (
                <li key={flower.id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 rounded-full p-2 bg-red-100">
                        <Flower2 className="h-5 w-5 text-red-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-900">{flower.name}</p>
                        <p className="text-xs text-gray-500">
                          Current stock: <span className="font-medium text-red-600">{flower.stock}</span> 
                          <span className="mx-1">•</span> 
                          Threshold: {flower.threshold}
                        </p>
                      </div>
                    </div>
                    <Link
                      href={`/admin/flowers/${flower.id}/edit`}
                      className="text-pink-600 hover:text-pink-800 ml-4"
                    >
                      <Edit className="h-5 w-5" />
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      
      {/* Quick actions */}
      <div className="bg-white shadow rounded-lg mb-8">
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link 
              href="/admin/bouquets/new"
              className="px-4 py-3 bg-pink-50 text-pink-700 rounded-md hover:bg-pink-100 flex items-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              New Bouquet
            </Link>
            <Link 
              href="/admin/flowers/new"
              className="px-4 py-3 bg-red-50 text-red-700 rounded-md hover:bg-red-100 flex items-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Flower
            </Link>
            <Link 
              href="/admin/categories/new"
              className="px-4 py-3 bg-amber-50 text-amber-700 rounded-md hover:bg-amber-100 flex items-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              New Category
            </Link>
            <Link 
              href="/admin/tags/new"
              className="px-4 py-3 bg-indigo-50 text-indigo-700 rounded-md hover:bg-indigo-100 flex items-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              New Tag
            </Link>
          </div>
        </div>
      </div>
      
      {/* Recent Activity */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
          <TrendingUp className="h-5 w-5 text-gray-400" />
        </div>
        <div className="border-t border-gray-200">
          <ul className="divide-y divide-gray-200">
            {recentActivities.map((activity) => (
              <li key={activity.id} className="px-4 py-4 sm:px-6">
                <div className="flex items-center">
                  <div className="rounded-md bg-gray-100 p-2 mr-4">
                    <activity.icon className="h-5 w-5 text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {activity.action}: <span className="font-semibold">{activity.target}</span>
                    </p>
                    <div className="flex items-center mt-1">
                      <Clock className="h-4 w-4 text-gray-400 mr-1" />
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <div className="border-t border-gray-200 px-4 py-4 sm:px-6">
            <Link href="/admin/activity" className="text-sm font-medium text-pink-600 hover:text-pink-700">
              View all activity
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 
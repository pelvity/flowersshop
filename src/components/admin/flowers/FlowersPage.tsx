'use client';

import { useState } from 'react';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function ClientFlowersAdminPage({ locale }: { locale: string }) {
  const t = useTranslations('admin');
  const [flowers, setFlowers] = useState([
    { id: 1, name: 'Red Rose', price: '$2.99', category: 'Roses', inStock: true, quantity: 120 },
    { id: 2, name: 'White Lily', price: '$3.49', category: 'Lilies', inStock: true, quantity: 85 },
    { id: 3, name: 'Purple Tulip', price: '$1.99', category: 'Tulips', inStock: true, quantity: 150 },
    { id: 4, name: 'Yellow Sunflower', price: '$2.49', category: 'Sunflowers', inStock: false, quantity: 0 },
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter flowers based on search query
  const filteredFlowers = flowers.filter(flower => 
    flower.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    flower.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">{t('navigation.flowers')}</h1>
        <Link 
          href={`/${locale}/admin/flowers/create`} 
          className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-md flex items-center"
        >
          <Plus size={16} className="mr-1" />
          {t('common.create')}
        </Link>
      </div>
      
      {/* Search and filters */}
      <div className="mb-6 flex">
        <div className="relative flex-grow max-w-md">
          <input
            type="text"
            placeholder={t('common.search')}
            className="w-full border border-gray-300 rounded-md py-2 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <Search size={18} />
          </div>
        </div>
      </div>
      
      {/* Flowers table */}
      <div className="bg-white shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('flowers.name')}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('flowers.price')}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('flowers.category')}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('flowers.quantity')}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('flowers.status')}
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">{t('common.actions')}</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredFlowers.map((flower) => (
              <tr key={flower.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">{flower.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{flower.price}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{flower.category}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{flower.quantity}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    flower.inStock
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {flower.inStock ? t('flowers.inStock') : t('flowers.outOfStock')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <Link 
                      href={`/${locale}/admin/flowers/${flower.id}/edit`}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <Edit size={18} />
                    </Link>
                    <button className="text-red-600 hover:text-red-900">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 
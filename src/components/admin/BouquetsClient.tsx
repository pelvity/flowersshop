'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Package, Plus, Edit, Trash2, Search, Filter, Eye } from 'lucide-react';
import { Bouquet, Category, BouquetRepository } from '@/lib/supabase';

interface BouquetsClientProps {
  initialBouquets: Bouquet[];
  initialCategories: Category[];
}

export default function BouquetsClient({ initialBouquets, initialCategories }: BouquetsClientProps) {
  const [bouquets, setBouquets] = useState<Bouquet[]>(initialBouquets);
  const [categories] = useState<Category[]>(initialCategories);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Filter bouquets by search term and category
  const filteredBouquets = bouquets.filter(bouquet => {
    const matchesSearch = 
      bouquet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (bouquet.description && bouquet.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = categoryFilter === 'all' || bouquet.category_id === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  // Handle bouquet deletion
  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this bouquet?')) {
      try {
        setIsLoading(true);
        // This is now an issue, as client components can't use server-side functions.
        // For now, we'll just filter from the UI. A full implementation would need an API route.
        // await BouquetRepository.delete(id);
        setBouquets(bouquets.filter(bouquet => bouquet.id !== id));
        alert('Bouquet deleted. Note: This only updates the UI for now.');
      } catch (err) {
        console.error('Error deleting bouquet:', err);
        setError('Failed to delete bouquet. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading bouquets...</p>
        </div>
      </div>
    );
  }

  // Get category name by ID
  const getCategoryName = (categoryId: string): string => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'Unknown Category';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Manage Bouquets</h1>
          <p className="text-sm text-gray-600 mt-1">
            Create, edit, and manage your flower arrangements
          </p>
        </div>
        <Link 
          href="/admin/bouquets/new"
          className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-md flex items-center"
        >
          <Plus className="h-5 w-5 mr-1" />
          Create Bouquet
        </Link>
      </div>
      
      {/* Search and filters */}
      <div className="bg-white p-4 shadow rounded-lg mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search bouquets..."
              className="pl-10 w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-pink-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center">
            <Filter className="h-4 w-4 text-gray-400 mr-2" />
            <span className="text-sm text-gray-600 mr-2">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 p-4 rounded-lg shadow mb-6">
          <h3 className="text-lg font-medium text-red-700">An Error Occurred</h3>
          <p className="mt-2 text-red-600">{error}</p>
        </div>
      )}
      
      {/* Bouquets Grid */}
      {filteredBouquets.length === 0 ? (
        <div className="bg-white p-8 text-center rounded-lg shadow">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No bouquets found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || categoryFilter !== 'all' 
              ? 'Try adjusting your filters' 
              : 'Get started by creating a new bouquet'}
          </p>
          <div className="mt-6">
            <Link
              href="/admin/bouquets/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700"
            >
              <Plus className="h-5 w-5 mr-1" />
              Create Bouquet
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBouquets.map((bouquet) => (
            <div key={bouquet.id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="h-48 bg-gray-200 relative">
                {/* Image placeholder */}
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                  <Package className="h-12 w-12 text-gray-400" />
                </div>
                
                {/* Badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  {bouquet.featured && (
                    <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-1 rounded">
                      Featured
                    </span>
                  )}
                  {!bouquet.in_stock && (
                    <span className="bg-red-100 text-red-800 text-xs font-semibold px-2 py-1 rounded">
                      Out of Stock
                    </span>
                  )}
                  {bouquet.discount_price && (
                    <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded">
                      Sale
                    </span>
                  )}
                </div>
              </div>
              
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-pink-600 uppercase tracking-wider">
                    {getCategoryName(bouquet.category_id as string)}
                  </span>
                  <div className="flex items-center">
                    {bouquet.discount_price ? (
                      <div className="flex items-baseline">
                        <span className="text-gray-500 text-sm line-through mr-2">
                          ${bouquet.price.toFixed(2)}
                        </span>
                        <span className="text-pink-600 font-semibold">
                          ${bouquet.discount_price.toFixed(2)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-900 font-semibold">
                        ${bouquet.price.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
                
                <h3 className="mt-2 text-lg font-semibold text-gray-900">{bouquet.name}</h3>
                
                <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                  {bouquet.description}
                </p>
                
                <div className="mt-2">
                  <div className="flex flex-wrap gap-1 mb-3">
                    {Array.isArray(bouquet.tags) && bouquet.tags.map((tag) => (
                      <span 
                        key={tag} 
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-pink-100 text-pink-800"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="mt-4 flex justify-between">
                  <div className="flex space-x-2">
                    <Link
                      href={`/admin/bouquets/${bouquet.id}/edit`}
                      className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(bouquet.id)}
                      disabled={isLoading}
                      className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </button>
                  </div>
                  <Link
                    href={`/bouquet/${bouquet.id}`}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm rounded-md text-pink-600 bg-pink-100 hover:bg-pink-200"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 
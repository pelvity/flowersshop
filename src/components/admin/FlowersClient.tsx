'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Flower2, Plus, Edit, Trash2, ArrowUpDown, Search } from 'lucide-react';
import { Flower } from '@/lib/supabase';

interface FlowersClientProps {
  initialFlowers: Flower[];
}

export default function FlowersClient({ initialFlowers }: FlowersClientProps) {
  const [flowers, setFlowers] = useState<Flower[]>(initialFlowers);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'stock' | 'price'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Filter flowers by search term
  const filteredFlowers = flowers.filter(flower => 
    flower.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (flower.scientific_name && flower.scientific_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Sort flowers
  const sortedFlowers = [...filteredFlowers].sort((a, b) => {
    if (sortBy === 'name') {
      return sortDirection === 'asc' 
        ? a.name.localeCompare(b.name) 
        : b.name.localeCompare(a.name);
    } else if (sortBy === 'stock') {
      return sortDirection === 'asc' 
        ? a.in_stock - b.in_stock 
        : b.in_stock - a.in_stock;
    } else { // price
      return sortDirection === 'asc' 
        ? a.price - b.price 
        : b.price - a.price;
    }
  });

  // Toggle sort direction and field
  const handleSort = (field: 'name' | 'stock' | 'price') => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };

  // Handle flower deletion
  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this flower?')) {
      try {
        setIsLoading(true);
        // This should be an API call, but for now we'll just filter the UI
        setFlowers(flowers.filter(flower => flower.id !== id));
        alert('Flower deleted. Note: This only updates the UI for now.');
      } catch (err) {
        console.error('Error deleting flower:', err);
        setError('Failed to delete flower. Please try again later.');
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
          <p className="mt-4 text-gray-600">Loading flowers...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Flower Inventory</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage your individual flowers for bouquet creation
          </p>
        </div>
        <Link 
          href="/admin/flowers/new"
          className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-md flex items-center"
        >
          <Plus className="h-5 w-5 mr-1" />
          Add New Flower
        </Link>
      </div>
      
      {/* Search and filters */}
      <div className="bg-white p-4 shadow rounded-lg mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:w-64 mb-4 sm:mb-0">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search flowers..."
              className="pl-10 w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-pink-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex space-x-2">
            <button 
              onClick={() => handleSort('name')} 
              className={`px-3 py-1 border rounded-md text-sm flex items-center ${
                sortBy === 'name' ? 'bg-pink-50 border-pink-300 text-pink-800' : 'bg-white border-gray-300'
              }`}
            >
              Name
              <ArrowUpDown className="h-3 w-3 ml-1" />
            </button>
            <button 
              onClick={() => handleSort('stock')} 
              className={`px-3 py-1 border rounded-md text-sm flex items-center ${
                sortBy === 'stock' ? 'bg-pink-50 border-pink-300 text-pink-800' : 'bg-white border-gray-300'
              }`}
            >
              Stock
              <ArrowUpDown className="h-3 w-3 ml-1" />
            </button>
            <button 
              onClick={() => handleSort('price')} 
              className={`px-3 py-1 border rounded-md text-sm flex items-center ${
                sortBy === 'price' ? 'bg-pink-50 border-pink-300 text-pink-800' : 'bg-white border-gray-300'
              }`}
            >
              Price
              <ArrowUpDown className="h-3 w-3 ml-1" />
            </button>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 p-4 rounded-lg shadow mb-6">
          <h3 className="text-lg font-medium text-red-700">An Error Occurred</h3>
          <p className="mt-2 text-red-600">{error}</p>
        </div>
      )}

      {/* Flowers List */}
      {sortedFlowers.length === 0 ? (
        <div className="bg-white p-8 text-center rounded-lg shadow">
          <Flower2 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No flowers found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? 'Try a different search term' : 'Get started by adding a new flower'}
          </p>
          <div className="mt-6">
            <Link
              href="/admin/flowers/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700"
            >
              <Plus className="h-5 w-5 mr-1" />
              Add New Flower
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Flower
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Colors
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedFlowers.map((flower) => (
                <tr key={flower.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-pink-100 flex items-center justify-center">
                        <Flower2 className="h-5 w-5 text-pink-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{flower.name}</div>
                        <div className="text-sm text-gray-500">{flower.scientific_name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {Array.isArray(flower.colors) && flower.colors.map((color) => (
                        <span 
                          key={color} 
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-pink-100 text-pink-800"
                        >
                          {color}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${flower.in_stock <= flower.low_stock_threshold ? 'text-red-600' : 'text-gray-900'}`}>
                      {flower.in_stock} in stock
                    </div>
                    {flower.in_stock <= flower.low_stock_threshold && (
                      <div className="text-xs text-red-500">Low stock</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${flower.price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      flower.is_available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {flower.is_available ? 'Available' : 'Unavailable'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link href={`/admin/flowers/${flower.id}/edit`} className="text-pink-600 hover:text-pink-900 mr-4">
                      <Edit className="h-4 w-4 inline-block mr-1" />
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(flower.id)}
                      disabled={isLoading}
                      className="text-red-600 hover:text-red-900 disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4 inline-block mr-1" />
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 
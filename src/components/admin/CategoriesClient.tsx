'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Grid, Plus, Edit, Trash2, Search } from 'lucide-react';
import { Category, CategoryRepository } from '@/lib/supabase';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';

interface CategoriesClientProps {
  initialCategories: Category[];
}

export default function CategoriesClient({ initialCategories }: CategoriesClientProps) {
  const params = useParams();
  const locale = params.locale as string;
  
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const t = useTranslations('admin');

  // Filter categories by search term
  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Handle category deletion
  const handleDelete = async (id: string) => {
    if (window.confirm(t('confirmation.deleteCategory'))) {
      try {
        setIsLoading(true);
        // This is just UI update for now, a full implementation would use an API route
        setCategories(categories.filter(category => category.id !== id));
        alert(t('categories.categoryUpdated'));
      } catch (err) {
        console.error('Error deleting category:', err);
        setError(t('common.error'));
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
          <p className="mt-4 text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Manage Categories</h1>
          <p className="text-sm text-gray-600 mt-1">
            Create, edit, and manage your bouquet categories
          </p>
        </div>
        <Link 
          href={`/${locale}/admin/categories/new`}
          className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-md flex items-center"
        >
          <Plus className="h-5 w-5 mr-1" />
          Create Category
        </Link>
      </div>
      
      {/* Search */}
      <div className="bg-white p-4 shadow rounded-lg mb-6">
        <div className="relative w-full md:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder={t('categories.searchCategories')}
            className="pl-10 w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-pink-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 p-4 rounded-lg shadow mb-6">
          <h3 className="text-lg font-medium text-red-700">{t('common.error')}</h3>
          <p className="mt-2 text-red-600">{error}</p>
        </div>
      )}
      
      {/* Categories List */}
      {filteredCategories.length === 0 ? (
        <div className="bg-white p-8 text-center rounded-lg shadow">
          <Grid className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No categories found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? 'Try adjusting your search' : 'Get started by creating a new category'}
          </p>
          <div className="mt-6">
            <Link
              href={`/${locale}/admin/categories/new`}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700"
            >
              <Plus className="h-5 w-5 mr-1" />
              Create Category
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('common.name')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('common.description')}
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('common.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCategories.map((category) => (
                <tr key={category.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-pink-100 flex items-center justify-center">
                        <Grid className="h-5 w-5 text-pink-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{category.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500 max-w-md truncate">
                      {category.description || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link href={`/${locale}/admin/categories/${category.id}/edit`} className="text-pink-600 hover:text-pink-900 mr-4">
                      <Edit className="h-4 w-4 inline-block mr-1" />
                      {t('common.edit')}
                    </Link>
                    <button
                      onClick={() => handleDelete(category.id)}
                      disabled={isLoading}
                      className="text-red-600 hover:text-red-900 disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4 inline-block mr-1" />
                      {t('common.delete')}
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
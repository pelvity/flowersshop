'use client';

import { useState, useEffect } from 'react';
import { Grid, Plus, Edit, Trash2, Search, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface Category {
  id: string;
  name: string;
  description?: string;
}

// API functions
async function getCategories(): Promise<Category[]> {
  const response = await fetch('/api/categories');
  if (!response.ok) {
    throw new Error('Failed to fetch categories');
  }
  return response.json();
}

async function createCategory(name: string, description?: string): Promise<Category> {
  const response = await fetch('/api/categories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, description }),
  });
  if (!response.ok) {
    throw new Error('Failed to create category');
  }
  return response.json();
}

async function updateCategory(id: string, name: string, description?: string): Promise<Category> {
  const response = await fetch(`/api/categories?id=${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, description }),
  });
  if (!response.ok) {
    throw new Error('Failed to update category');
  }
  return response.json();
}

async function deleteCategory(id: string): Promise<void> {
  const response = await fetch(`/api/categories?id=${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete category');
  }
}

export default function CategoriesPage() {
  const t = useTranslations('admin');
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        const categoriesData = await getCategories();
        setCategories(categoriesData);
      } catch (err) {
        setError(t('categories.loadError'));
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategories();
  }, [t]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    try {
      const newCategory = await createCategory(newCategoryName.trim(), newCategoryDescription.trim() || undefined);
      setCategories([...categories, newCategory]);
      setNewCategoryName('');
      setNewCategoryDescription('');
    } catch (err) {
      setError(t('categories.createError'));
    }
  };

  const handleUpdate = async (category: Category) => {
    if (!category.name.trim()) return;

    try {
      const updatedCategory = await updateCategory(category.id, category.name.trim(), category.description);
      setCategories(categories.map(c => c.id === updatedCategory.id ? updatedCategory : c));
      setEditingCategory(null);
    } catch (err) {
      setError(t('categories.updateError'));
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(t('categories.confirmDelete'))) {
      try {
        await deleteCategory(id);
        setCategories(categories.filter(c => c.id !== id));
      } catch (err) {
        setError(t('categories.deleteError'));
      }
    }
  };
  
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{t('categories.manageCategories')}</h1>
          <p className="text-sm text-gray-600 mt-1">
            {t('categories.description')}
          </p>
        </div>
      </div>

      <div className="bg-white p-4 shadow rounded-lg mb-6">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label htmlFor="categoryName" className="block text-sm font-medium text-gray-700 mb-1">
              {t('categories.name')}
            </label>
            <input
              id="categoryName"
              type="text"
              value={newCategoryName}
              onChange={e => setNewCategoryName(e.target.value)}
              placeholder={t('categories.namePlaceholder')}
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-pink-500"
              required
            />
          </div>
          <div>
            <label htmlFor="categoryDescription" className="block text-sm font-medium text-gray-700 mb-1">
              {t('categories.description')} ({t('common.optional')})
            </label>
            <textarea
              id="categoryDescription"
              value={newCategoryDescription}
              onChange={e => setNewCategoryDescription(e.target.value)}
              placeholder={t('categories.descriptionPlaceholder')}
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-pink-500"
              rows={3}
            />
          </div>
          <button
            type="submit"
            className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-md flex items-center"
          >
            <Plus className="h-5 w-5 mr-1" />
            {t('categories.createCategory')}
          </button>
        </form>
      </div>

      <div className="bg-white p-4 shadow rounded-lg">
        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder={t('common.search')}
            className="pl-10 w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-pink-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="h-8 w-8 text-pink-500 animate-spin" />
          </div>
        ) : error ? (
          <div className="text-red-600 bg-red-50 p-4 rounded-md">{error}</div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredCategories.map(category => (
              <li key={category.id} className="py-4">
                {editingCategory?.id === category.id ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editingCategory.name}
                      onChange={e => setEditingCategory({ ...editingCategory, name: e.target.value })}
                      className="border border-gray-300 rounded-md py-1 px-2 w-full"
                      autoFocus
                    />
                    <textarea
                      value={editingCategory.description || ''}
                      onChange={e => setEditingCategory({ ...editingCategory, description: e.target.value })}
                      className="border border-gray-300 rounded-md py-1 px-2 w-full"
                      rows={2}
                    />
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleUpdate(editingCategory)}
                        className="bg-pink-600 text-white px-3 py-1 rounded-md text-sm"
                      >
                        {t('common.save')}
                      </button>
                      <button 
                        onClick={() => setEditingCategory(null)}
                        className="bg-gray-200 text-gray-800 px-3 py-1 rounded-md text-sm"
                      >
                        {t('common.cancel')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center font-medium">
                        <Grid className="h-4 w-4 mr-2 text-gray-500" />
                        {category.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setEditingCategory(category)} className="text-gray-500 hover:text-pink-600">
                          <Edit className="h-5 w-5" />
                        </button>
                        <button onClick={() => handleDelete(category.id)} className="text-gray-500 hover:text-red-600">
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                    {category.description && (
                      <p className="text-gray-600 mt-1 ml-6">{category.description}</p>
                    )}
                  </div>
                )}
              </li>
            ))}
            {filteredCategories.length === 0 && (
              <li className="py-4 text-center text-gray-500">{t('common.noResults')}</li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
} 
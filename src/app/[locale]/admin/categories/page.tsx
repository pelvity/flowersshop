'use client';

import { useState, useEffect } from 'react';
import { Grid, Plus, Edit, Trash2, Search, Loader2, Image as ImageIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import MediaUploader, { MediaItem } from '@/components/admin/shared/MediaUploader';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';
import Image from 'next/image';
import { getFileUrl } from '@/utils/cloudflare-worker';
import { Lightbox, Category as LightboxCategory } from '@/components/categories/category-media-gallery';

interface Category {
  id: string;
  name: string;
  description?: string;
  media?: MediaItem[];
  thumbnail_url?: string;
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

async function getCategoryMedia(categoryId: string): Promise<MediaItem[]> {
  const response = await fetch(`/api/admin/categories/media?categoryId=${categoryId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch category media');
  }
  return response.json();
}

// Helper function to get a valid image URL
const getValidImageUrl = (mediaItem: MediaItem | null) => {
  if (!mediaItem) return "/placeholder.jpg";
  if (mediaItem.file_url) return mediaItem.file_url;
  if (mediaItem.file_path) return getFileUrl(mediaItem.file_path);
  return "/placeholder.jpg";
};

export default function CategoriesPage() {
  const t = useTranslations('admin');
  const pathname = usePathname();
  const locale = pathname.split('/')[1]; // Extract locale from URL path
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<LightboxCategory | null>(null);
  const [showLightbox, setShowLightbox] = useState(false);
  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        const categoriesData = await getCategories();
        
        // Initialize each category with empty media array
        const categoriesWithMedia = categoriesData.map(category => ({
          ...category,
          media: [] as MediaItem[]
        }));
        
        setCategories(categoriesWithMedia);
        
        // Load media for all categories at once
        for (const category of categoriesWithMedia) {
          try {
            const mediaItems = await getCategoryMedia(category.id);
            setCategories(prevCategories => 
              prevCategories.map(c => 
                c.id === category.id 
                  ? { 
                      ...c, 
                      media: mediaItems,
                      thumbnail_url: mediaItems.find(m => m.is_thumbnail)?.file_url || undefined
                    }
                  : c
              )
            );
          } catch (err) {
            console.error(`Failed to load media for category ${category.id}:`, err);
          }
        }
      } catch (err) {
        setError(t('categories.loadError'));
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategories();
  }, [t]);

  // Remove the useEffect for loading media when a category is expanded since we're loading all media upfront

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    try {
      const newCategory = await createCategory(newCategoryName.trim(), newCategoryDescription.trim() || undefined);
      setCategories([...categories, { ...newCategory, media: [] }]);
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
      setCategories(categories.map(c => 
        c.id === updatedCategory.id 
          ? { ...updatedCategory, media: c.media, thumbnail_url: c.thumbnail_url } 
          : c
      ));
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
        if (expandedCategory === id) {
          setExpandedCategory(null);
        }
      } catch (err) {
        setError(t('categories.deleteError'));
      }
    }
  };
  
  const handleMediaChange = (categoryId: string, media: MediaItem[]) => {
    setCategories(prevCategories => 
      prevCategories.map(category => 
        category.id === categoryId 
          ? { 
              ...category, 
              media,
              thumbnail_url: media.find(m => m.is_thumbnail)?.file_url || category.thumbnail_url
            }
          : category
      )
    );
  };

  const handleThumbnailChange = (categoryId: string, thumbnailUrl: string) => {
    setCategories(prevCategories => 
      prevCategories.map(category => 
        category.id === categoryId 
          ? { ...category, thumbnail_url: thumbnailUrl }
          : category
      )
    );
  };

  const handleToggleExpand = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };
  
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Handle opening lightbox
  const handleOpenLightbox = (e: React.MouseEvent, category: Category) => {
    e.stopPropagation();
    setSelectedCategory({
      id: category.id,
      name: category.name,
      description: category.description,
      media: category.media,
      thumbnail_url: category.thumbnail_url
    });
    setShowLightbox(true);
  };

  return (
    <div>
      {showLightbox && selectedCategory && (
        <Lightbox 
          category={selectedCategory} 
          onClose={() => setShowLightbox(false)} 
        />
      )}
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{t('categories.title')}</h1>
          <p className="text-sm text-gray-600 mt-1">
            {t('categories.pageDescription')}
          </p>
        </div>
        <Link 
          href={`/${locale}/admin/categories/create`}
          className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-md flex items-center"
        >
          <Plus className="h-5 w-5 mr-1" />
          {t('categories.createNew')}
        </Link>
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
          <div className="overflow-hidden border border-gray-200 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('categories.name')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('categories.description')}
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">{t('common.actions')}</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
            {filteredCategories.map(category => (
                  <React.Fragment key={category.id}>
                    <tr className="hover:bg-pink-50/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                      {category.thumbnail_url && (
                            <div className="h-10 w-10 rounded-md overflow-hidden border border-gray-200 flex-shrink-0 mr-3">
                          <img 
                            src={category.thumbnail_url} 
                            alt={category.name}
                            className="w-full h-full object-cover" 
                          />
                        </div>
                      )}
                          <div className="font-medium text-gray-900">{category.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-gray-500 truncate max-w-xs">
                          {category.description || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end items-center space-x-2">
                            <Link 
                              href={`/${locale}/admin/categories/${category.id}/edit`}
                            className="text-indigo-600 hover:text-indigo-900 p-1"
                              title={t('common.edit')}
                            >
                              <Edit className="h-5 w-5" />
                            </Link>
                            <button 
                              onClick={() => handleDelete(category.id)} 
                            className="text-red-600 hover:text-red-900 p-1"
                              title={t('common.delete')}
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                      </td>
                    </tr>
                    
                    {/* Display media row */}
                    {category.media && category.media.length > 0 && (
                      <tr>
                        <td colSpan={3} className="px-6 py-3 bg-gray-50/50">
                          <div className="flex items-center space-x-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-pink-200 scrollbar-track-transparent">
                            {category.media.map(mediaItem => (
                              <div 
                                key={mediaItem.id} 
                                className="relative h-20 w-20 rounded-md overflow-hidden shadow flex-shrink-0 border border-pink-100 cursor-pointer"
                                onClick={(e) => handleOpenLightbox(e, category)}
                              >
                                <Image
                                  src={getValidImageUrl(mediaItem)}
                                  alt={mediaItem.file_name || category.name}
                                  fill
                                  sizes="5rem"
                                  className="object-cover"
                                />
                                {mediaItem.media_type === 'video' && (
                                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white" stroke="none">
                                      <polygon points="5 3 19 12 5 21 5 3"></polygon>
                                    </svg>
                        </div>
                                )}
                                {mediaItem.is_thumbnail && (
                                  <div className="absolute top-1 right-1 bg-pink-600 rounded-full w-4 h-4"></div>
                        )}
                      </div>
                            ))}
                    </div>
                        </td>
                      </tr>
                    )}
                    
                    {/* Media Uploader (expanded row) */}
                    {expandedCategory === category.id && (
                      <tr>
                        <td colSpan={3} className="px-6 py-4 bg-gray-50">
                        <MediaUploader
                          entityType="categories"
                          entityId={category.id}
                          media={category.media || []}
                          onMediaChange={(media) => handleMediaChange(category.id, media)}
                          onThumbnailChange={(thumbnailUrl) => handleThumbnailChange(category.id, thumbnailUrl)}
                        />
                        </td>
                      </tr>
                )}
                  </React.Fragment>
            ))}
                
            {filteredCategories.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-center text-gray-500">{t('common.noResults')}</td>
                  </tr>
            )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
} 
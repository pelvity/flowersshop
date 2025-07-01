'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, X, Flower2 } from 'lucide-react';
import { Bouquet, Category, Tag, Flower, BouquetFlower } from '@/lib/supabase';
import { useParams } from 'next/navigation';
import BouquetTagsManager from './bouquets/BouquetTagsManager';
import { useTranslations } from 'next-intl';
import { formatPrice, getCurrencyByLocale } from '@/lib/functions';

interface BouquetFormProps {
  bouquet?: Bouquet;
  isEdit?: boolean;
  categories?: Category[];
  tags?: Tag[];
  availableFlowers?: Flower[];
}

interface FlowerWithQuantity {
  id: string;
  name: string;
  price: number;
  description?: string | null;
  in_stock: number;
  quantity: number;
}

export default function BouquetForm({ bouquet, isEdit = false, categories: initialCategories, tags: initialTags, availableFlowers: initialFlowers }: BouquetFormProps) {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations('admin');
  
  // Get currency code from locale
  const currencyCode = getCurrencyByLocale(locale);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>(initialCategories || []);
  const [tags, setTags] = useState<Tag[]>(initialTags || []);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [flowers, setFlowers] = useState<Flower[]>(initialFlowers || []);
  const [bouquetFlowers, setBouquetFlowers] = useState<FlowerWithQuantity[]>([]);
  
  const [formData, setFormData] = useState({
    name: bouquet?.name || '',
    description: bouquet?.description || '',
    price: bouquet?.price || 0,
    discount_price: bouquet?.discount_price || null,
    category_id: bouquet?.category_id || '',
    featured: bouquet?.featured || false,
    in_stock: bouquet?.in_stock || true,
  });

  const [selectedFlowerId, setSelectedFlowerId] = useState<string>('');
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1);

  // Fetch categories, tags, and flowers
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Only fetch categories, tags, and flowers if they weren't provided via props
        const dataPromises = [];
        let needsFetching = false;
        
        if (!initialCategories) {
          dataPromises.push(fetch('/api/categories').then(res => res.json()));
          needsFetching = true;
        } else {
          dataPromises.push(Promise.resolve(initialCategories));
        }
        
        if (!initialTags) {
          dataPromises.push(fetch('/api/tags').then(res => res.json()));
          needsFetching = true;
        } else {
          dataPromises.push(Promise.resolve(initialTags));
        }
        
        if (!initialFlowers) {
          dataPromises.push(fetch('/api/flowers').then(res => res.json()));
          needsFetching = true;
        } else {
          dataPromises.push(Promise.resolve(initialFlowers));
        }
        
        if (needsFetching) {
          const [categoriesData, tagsData, flowersData] = await Promise.all(dataPromises);
          
          if (!initialCategories) setCategories(categoriesData);
          if (!initialTags) setTags(tagsData);
          if (!initialFlowers) setFlowers(flowersData);
        }

        // If editing, fetch the bouquet flowers and set initial tags
        if (isEdit && bouquet) {
          const bouquetWithFlowers = await fetch(`/api/bouquets/${bouquet.id}/flowers`).then(res => res.json());
          if (bouquetWithFlowers && bouquetWithFlowers.flowers) {
            // Transform the data to include the full flower details with quantity
            const flowersWithQuantities = bouquetWithFlowers.flowers.map((bf: any) => ({
              ...bf.flowers,
              quantity: bf.quantity
            }));
            setBouquetFlowers(flowersWithQuantities);
          }
          
          // Set initial tags if available
          // Use type assertion to handle potential missing tags property
          const bouquetTags = (bouquet as any).tags;
          if (bouquetTags && Array.isArray(bouquetTags)) {
            // Convert string tags to Tag objects if needed
            const initialTagObjects = bouquetTags.map(tag => {
              if (typeof tag === 'string') {
                const foundTag = tags.find(t => t.name === tag || t.id === tag);
                return foundTag || { id: tag, name: tag, created_at: '', updated_at: '' };
              }
              return tag as Tag;
            });
            setSelectedTags(initialTagObjects);
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(t('bouquets.loadError'));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [isEdit, bouquet, initialCategories, initialTags, initialFlowers, tags, t]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'price' || name === 'discount_price') {
      const numValue = value === '' ? (name === 'discount_price' ? null : 0) : parseFloat(value);
      setFormData(prev => ({ ...prev, [name]: numValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAddFlower = () => {
    if (!selectedFlowerId) return;
    
    const flowerToAdd = flowers.find(f => f.id === selectedFlowerId);
    if (!flowerToAdd) return;
    
    // Check if flower already exists in bouquet
    const existingIndex = bouquetFlowers.findIndex(bf => bf.id === selectedFlowerId);
    
    if (existingIndex >= 0) {
      // Update quantity if flower already exists
      const updatedFlowers = [...bouquetFlowers];
      updatedFlowers[existingIndex].quantity += selectedQuantity;
      setBouquetFlowers(updatedFlowers);
    } else {
      // Add new flower with quantity
      setBouquetFlowers([
        ...bouquetFlowers,
        { ...flowerToAdd, quantity: selectedQuantity }
      ]);
    }
    
    // Reset selection
    setSelectedFlowerId('');
    setSelectedQuantity(1);
  };

  const handleRemoveFlower = (flowerId: string) => {
    setBouquetFlowers(bouquetFlowers.filter(bf => bf.id !== flowerId));
  };

  const updateFlowerQuantity = (flowerId: string, quantity: number) => {
    setBouquetFlowers(
      bouquetFlowers.map(bf => 
        bf.id === flowerId ? { ...bf, quantity } : bf
      )
    );
  };

  // Handle tag selection from the TagsManager component
  const handleTagsChange = (newTags: Tag[]) => {
    setSelectedTags(newTags);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Prepare bouquet data
      const bouquetData = {
        ...formData,
        tags: selectedTags.map(tag => tag.id),
        flowers: bouquetFlowers.map(bf => ({
          id: bf.id,
          quantity: bf.quantity
        }))
      };
      
      // Make the API call
      let response;
      if (isEdit && bouquet) {
        response = await fetch(`/api/bouquets/${bouquet.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(bouquetData),
        });
      } else {
        response = await fetch('/api/bouquets', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(bouquetData),
        });
      }
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      // Navigate back to the bouquets list with proper locale
      router.push(`/${locale}/admin/bouquets`);
      router.refresh();
    } catch (err) {
      console.error('Error saving bouquet:', err);
      setError(t('bouquets.saveError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate total price based on flower prices and quantities
  const calculateTotalPrice = () => {
    return bouquetFlowers.reduce((total, flower) => total + (flower.price * flower.quantity), 0);
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
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Bouquet Details */}
      <div className="bg-white shadow-md rounded-lg p-4 sm:p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">{t('bouquets.basicInfo')}</h3>
        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
          <div className="col-span-1 sm:col-span-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">{t('common.name')}</label>
            <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm" />
          </div>
          <div className="col-span-1 sm:col-span-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">{t('common.description')}</label>
            <textarea name="description" id="description" value={formData.description} onChange={handleChange} rows={3} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"></textarea>
          </div>
          <div className="col-span-1 sm:col-span-3">
            <label htmlFor="price" className="block text-sm font-medium text-gray-700">{t('common.price')} ({currencyCode})</label>
            <input type="number" name="price" id="price" value={formData.price} onChange={handleChange} required min="0" step="0.01" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm" />
          </div>
          <div className="col-span-1 sm:col-span-3">
            <label htmlFor="discount_price" className="block text-sm font-medium text-gray-700">{t('common.discountPrice')} ({currencyCode})</label>
            <input type="number" name="discount_price" id="discount_price" value={formData.discount_price || ''} onChange={handleChange} min="0" step="0.01" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm" />
          </div>
          <div className="col-span-1 sm:col-span-3">
            <label htmlFor="category_id" className="block text-sm font-medium text-gray-700">{t('common.category')}</label>
            <select name="category_id" id="category_id" value={formData.category_id} onChange={handleChange} className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm">
              <option value="">{t('common.selectCategory')}</option>
              {categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
          </div>
          <div className="col-span-1 sm:col-span-3 flex items-center justify-start space-x-4 pt-5">
            <div className="flex items-center">
              <input type="checkbox" name="in_stock" id="in_stock" checked={formData.in_stock} onChange={handleChange} className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded" />
              <label htmlFor="in_stock" className="ml-2 block text-sm text-gray-900">{t('common.inStock')}</label>
            </div>
            <div className="flex items-center">
              <input type="checkbox" name="featured" id="featured" checked={formData.featured} onChange={handleChange} className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded" />
              <label htmlFor="featured" className="ml-2 block text-sm text-gray-900">{t('common.featured')}</label>
            </div>
          </div>
        </div>
      </div>
      
      {/* Flower Selection */}
      <div className="bg-white shadow-md rounded-lg p-4 sm:p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">{t('bouquets.flowerSelection')}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
          <div className="sm:col-span-6">
            <label htmlFor="flower" className="block text-sm font-medium text-gray-700">{t('bouquets.flower')}</label>
            <select id="flower" value={selectedFlowerId} onChange={(e) => setSelectedFlowerId(e.target.value)} className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm">
              <option value="">{t('bouquets.selectFlower')}</option>
              {flowers.map(flower => <option key={flower.id} value={flower.id}>{flower.name} ({formatPrice(flower.price, locale)})</option>)}
            </select>
          </div>
          <div className="sm:col-span-3">
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">{t('bouquets.quantity')}</label>
            <input type="number" id="quantity" value={selectedQuantity} onChange={(e) => setSelectedQuantity(parseInt(e.target.value))} min="1" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm" />
          </div>
          <div className="sm:col-span-3">
            <button type="button" onClick={handleAddFlower} className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500">
              <Plus className="h-5 w-5 mr-2" />
              {t('bouquets.add')}
            </button>
          </div>
        </div>
        
        {/* Selected Flowers List */}
        <div className="mt-6">
          <h4 className="text-md font-medium text-gray-800">{t('bouquets.selectedFlowers')}</h4>
          {bouquetFlowers.length === 0 ? (
            <p className="mt-2 text-sm text-gray-500">{t('bouquets.noFlowersSelected')}</p>
          ) : (
            <ul className="mt-2 divide-y divide-gray-200">
              {bouquetFlowers.map(flower => (
                <li key={flower.id} className="py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="flex-grow">
                    <p className="font-medium">{flower.name}</p>
                    <p className="text-sm text-gray-500">{formatPrice(flower.price, locale)} x {flower.quantity} = {formatPrice(flower.price * flower.quantity, locale)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="number" value={flower.quantity} onChange={(e) => updateFlowerQuantity(flower.id, parseInt(e.target.value))} min="1" className="w-20 border-gray-300 rounded-md shadow-sm sm:text-sm" />
                    <button type="button" onClick={() => handleRemoveFlower(flower.id)} className="text-red-500 hover:text-red-700 p-1">
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Total Price Suggestion */}
        <div className="mt-6 border-t pt-4">
          <p className="text-md font-medium">{t('bouquets.totalFlowersCost')}: <span className="text-pink-600 font-bold">{formatPrice(calculateTotalPrice(), locale)}</span></p>
          <p className="text-sm text-gray-500">{t('bouquets.suggestedPrice')}</p>
        </div>
      </div>
      
      {/* Tags */}
      {isEdit && bouquet && (
        <div className="bg-white shadow-md rounded-lg p-4 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t('tags.manageTags')}</h3>
          <BouquetTagsManager bouquetId={bouquet.id} initialTags={selectedTags} onTagsChange={handleTagsChange} />
        </div>
      )}
      
      {/* Submit Button */}
      <div className="flex justify-end pt-4">
        <button type="submit" disabled={isSubmitting} className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-2 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500">
          {isSubmitting ? t('common.saving') : isEdit ? t('bouquets.update') : t('bouquets.create')}
        </button>
      </div>
    </form>
  );
} 
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, X, Flower2 } from 'lucide-react';
import { Bouquet, Category, Tag, Flower, BouquetFlower } from '@/lib/supabase';
import { useParams } from 'next/navigation';

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
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>(initialCategories || []);
  const [tags, setTags] = useState<Tag[]>(initialTags || []);
  const [flowers, setFlowers] = useState<Flower[]>(initialFlowers || []);
  const [bouquetFlowers, setBouquetFlowers] = useState<FlowerWithQuantity[]>([]);
  
  const [formData, setFormData] = useState({
    name: bouquet?.name || '',
    description: bouquet?.description || '',
    price: bouquet?.price || 0,
    discount_price: bouquet?.discount_price || null,
    category_id: bouquet?.category_id || '',
    tags: bouquet?.tags || [],
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

        // If editing, fetch the bouquet flowers
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
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load required data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [isEdit, bouquet, initialCategories, initialTags, initialFlowers]);

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

  const handleTagToggle = (tagName: string) => {
    setFormData(prev => {
      const currentTags = [...prev.tags];
      if (currentTags.includes(tagName)) {
        return { ...prev, tags: currentTags.filter(t => t !== tagName) };
      } else {
        return { ...prev, tags: [...currentTags, tagName] };
      }
    });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Prepare bouquet data
      const bouquetData = {
        ...formData,
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
      setError('Failed to save bouquet. Please try again.');
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
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="md:grid md:grid-cols-3 md:gap-6">
        <div className="md:col-span-1">
          <div className="px-4 sm:px-0">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              {isEdit ? 'Edit Bouquet' : 'New Bouquet'}
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              {isEdit 
                ? 'Update the details of this bouquet.' 
                : 'Create a new bouquet for your shop.'}
            </p>
          </div>
        </div>
        <div className="mt-5 md:mt-0 md:col-span-2">
          <form onSubmit={handleSubmit}>
            <div className="shadow overflow-hidden sm:rounded-md">
              <div className="px-4 py-5 bg-white sm:p-6">
                {error && (
                  <div className="rounded-md bg-red-50 p-4 mb-6">
                    <div className="flex">
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">Error</h3>
                        <div className="mt-2 text-sm text-red-700">
                          <p>{error}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-6 gap-6">
                  <div className="col-span-6 sm:col-span-4">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      required
                      className="mt-1 focus:ring-pink-500 focus:border-pink-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  <div className="col-span-6">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows={3}
                      className="mt-1 focus:ring-pink-500 focus:border-pink-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      placeholder="Describe this bouquet"
                      value={formData.description || ''}
                      onChange={handleChange}
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  {/* Flower selection section */}
                  <div className="col-span-6 border-t border-gray-200 pt-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Bouquet Flowers</h3>
                    
                    <div className="grid grid-cols-6 gap-3">
                      <div className="col-span-6 sm:col-span-3">
                        <label htmlFor="flower" className="block text-sm font-medium text-gray-700">
                          Flower
                        </label>
                        <select
                          id="flower"
                          className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                          value={selectedFlowerId}
                          onChange={(e) => setSelectedFlowerId(e.target.value)}
                          disabled={isSubmitting}
                        >
                          <option value="">Select a flower</option>
                          {flowers.map((flower) => (
                            <option key={flower.id} value={flower.id}>
                              {flower.name} - ${flower.price.toFixed(2)}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="col-span-6 sm:col-span-2">
                        <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                          Quantity
                        </label>
                        <input
                          type="number"
                          id="quantity"
                          min="1"
                          className="mt-1 focus:ring-pink-500 focus:border-pink-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          value={selectedQuantity}
                          onChange={(e) => setSelectedQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                          disabled={isSubmitting}
                        />
                      </div>
                      
                      <div className="col-span-6 sm:col-span-1">
                        <label className="invisible block text-sm font-medium text-gray-700">
                          Add
                        </label>
                        <button
                          type="button"
                          className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                          onClick={handleAddFlower}
                          disabled={!selectedFlowerId || isSubmitting}
                        >
                          <Plus className="-ml-0.5 mr-2 h-4 w-4" />
                          Add
                        </button>
                      </div>
                    </div>
                    
                    {/* Selected flowers list */}
                    <div className="mt-6">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Flowers</h4>
                      
                      {bouquetFlowers.length === 0 ? (
                        <p className="text-sm text-gray-500">No flowers added to this bouquet yet.</p>
                      ) : (
                        <ul className="divide-y divide-gray-200 border rounded-md">
                          {bouquetFlowers.map((flower) => (
                            <li key={flower.id} className="py-3 px-4 flex items-center justify-between">
                              <div className="flex items-center">
                                <Flower2 className="h-5 w-5 text-pink-500 mr-2" />
                                <span className="text-sm font-medium text-gray-900">{flower.name}</span>
                              </div>
                              
                              <div className="flex items-center">
                                <div className="flex items-center mr-4">
                                  <label htmlFor={`qty-${flower.id}`} className="sr-only">Quantity</label>
                                  <input
                                    type="number"
                                    id={`qty-${flower.id}`}
                                    className="w-16 border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                                    value={flower.quantity}
                                    min="1"
                                    onChange={(e) => updateFlowerQuantity(flower.id, Math.max(1, parseInt(e.target.value) || 1))}
                                    disabled={isSubmitting}
                                  />
                                </div>
                                
                                <span className="text-sm text-gray-500 mr-4">
                                  ${(flower.price * flower.quantity).toFixed(2)}
                                </span>
                                
                                <button
                                  type="button"
                                  className="text-red-500 hover:text-red-700"
                                  onClick={() => handleRemoveFlower(flower.id)}
                                  disabled={isSubmitting}
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            </li>
                          ))}
                          
                          <li className="py-3 px-4 flex justify-between bg-gray-50">
                            <span className="text-sm font-medium text-gray-700">Total Flowers Cost:</span>
                            <span className="text-sm font-medium text-gray-900">
                              ${calculateTotalPrice().toFixed(2)}
                            </span>
                          </li>
                        </ul>
                      )}
                    </div>
                  </div>
                  
                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                      Price *
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="number"
                        name="price"
                        id="price"
                        required
                        min="0"
                        step="0.01"
                        className="focus:ring-pink-500 focus:border-pink-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                        placeholder="0.00"
                        value={formData.price}
                        onChange={handleChange}
                        disabled={isSubmitting}
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Suggested price based on flowers: ${calculateTotalPrice().toFixed(2)}
                    </p>
                  </div>
                  
                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="discount_price" className="block text-sm font-medium text-gray-700">
                      Discount Price (Optional)
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="number"
                        name="discount_price"
                        id="discount_price"
                        min="0"
                        step="0.01"
                        className="focus:ring-pink-500 focus:border-pink-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                        placeholder="0.00"
                        value={formData.discount_price || ''}
                        onChange={handleChange}
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                  
                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="category_id" className="block text-sm font-medium text-gray-700">
                      Category
                    </label>
                    <select
                      id="category_id"
                      name="category_id"
                      className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                      value={formData.category_id || ''}
                      onChange={handleChange}
                      disabled={isSubmitting}
                    >
                      <option value="">Select a category</option>
                      {categories?.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="col-span-6">
                    <fieldset>
                      <legend className="text-sm font-medium text-gray-700">Tags</legend>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {tags?.map(tag => (
                          <span 
                            key={tag.id}
                            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium cursor-pointer ${
                              formData.tags.includes(tag.name)
                                ? 'bg-pink-100 text-pink-800 hover:bg-pink-200'
                                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                            }`}
                            onClick={() => handleTagToggle(tag.name)}
                          >
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    </fieldset>
                  </div>
                  
                  <div className="col-span-6 sm:col-span-3">
                    <div className="flex items-center">
                      <input
                        id="featured"
                        name="featured"
                        type="checkbox"
                        className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                        checked={formData.featured}
                        onChange={handleChange}
                        disabled={isSubmitting}
                      />
                      <label htmlFor="featured" className="ml-2 block text-sm text-gray-700">
                        Featured bouquet
                      </label>
                    </div>
                  </div>
                  
                  <div className="col-span-6 sm:col-span-3">
                    <div className="flex items-center">
                      <input
                        id="in_stock"
                        name="in_stock"
                        type="checkbox"
                        className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                        checked={formData.in_stock}
                        onChange={handleChange}
                        disabled={isSubmitting}
                      />
                      <label htmlFor="in_stock" className="ml-2 block text-sm text-gray-700">
                        In stock
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                <button
                  type="button"
                  className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 mr-3 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                  onClick={() => router.push(`/${locale}/admin/bouquets`)}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : isEdit ? 'Update Bouquet' : 'Create Bouquet'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 
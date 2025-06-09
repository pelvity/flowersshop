'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

export default function ClientCreateFlowerPage({ locale }: { locale: string }) {
  const t = useTranslations('admin');
  const router = useRouter();
  
  // Initial empty state for a new flower
  const [flower, setFlower] = useState({
    name: '',
    price: '',
    description: '',
    category: 'Roses',
    inStock: true,
    quantity: 0,
    image: ''
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Validate required fields
    if (!flower.name || !flower.price) {
      alert('Please fill in all required fields');
      setLoading(false);
      return;
    }
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      // Show success message
      alert(t('flowers.createSuccess'));
      // Navigate back to flowers list
      router.push(`/${locale}/admin/flowers`);
    }, 500);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      setFlower({
        ...flower,
        [name]: (e.target as HTMLInputElement).checked
      });
    } else if (name === 'quantity') {
      setFlower({
        ...flower,
        [name]: parseInt(value) || 0
      });
    } else {
      setFlower({
        ...flower,
        [name]: value
      });
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center mb-6">
        <Link
          href={`/${locale}/admin/flowers`}
          className="mr-4 text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{t('flowers.create')}</h1>
      </div>

      {loading ? (
        <div className="flex justify-center my-8">
          <div className="text-center">
            <div className="spinner border-t-4 border-pink-500 border-solid rounded-full w-12 h-12 animate-spin"></div>
            <p className="mt-2 text-gray-600">{t('common.loading')}</p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Info Section */}
            <div className="md:col-span-2">
              <h2 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
                {t('flowers.basicInfo')}
              </h2>
            </div>
            
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                {t('flowers.name')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={flower.name}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="Enter flower name"
              />
            </div>

            {/* Price */}
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                {t('flowers.price')} <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="text"
                  id="price"
                  name="price"
                  value={flower.price}
                  onChange={handleChange}
                  required
                  className="w-full pl-7 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                {t('flowers.category')}
              </label>
              <select
                id="category"
                name="category"
                value={flower.category}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="Roses">Roses</option>
                <option value="Lilies">Lilies</option>
                <option value="Tulips">Tulips</option>
                <option value="Sunflowers">Sunflowers</option>
                <option value="Orchids">Orchids</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Quantity */}
            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                {t('flowers.quantity')}
              </label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                min="0"
                value={flower.quantity}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>

            {/* Status Checkbox */}
            <div className="flex items-center mt-4">
              <input
                type="checkbox"
                id="inStock"
                name="inStock"
                checked={flower.inStock}
                onChange={handleChange}
                className="h-4 w-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
              />
              <label htmlFor="inStock" className="ml-2 block text-sm text-gray-700">
                {t('flowers.inStock')}
              </label>
            </div>

            {/* Description - Full width */}
            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                {t('flowers.description')}
              </label>
              <textarea
                id="description"
                name="description"
                value={flower.description}
                onChange={handleChange}
                rows={4}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="Enter flower description"
              ></textarea>
            </div>

            {/* Image Section */}
            <div className="md:col-span-2 mt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
                {t('flowers.image')}
              </h2>
            </div>

            {/* Image Upload - Full width */}
            <div className="md:col-span-2">
              <div className="mt-1 flex items-center">
                <div className="mr-4 h-40 w-40 overflow-hidden rounded-md bg-gray-100 flex items-center justify-center">
                  {flower.image ? (
                    <img
                      src={flower.image}
                      alt={flower.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-400">No image</span>
                  )}
                </div>
                <div className="flex flex-col">
                  <input
                    type="file"
                    id="image"
                    name="image"
                    accept="image/*"
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-medium
                      file:bg-pink-50 file:text-pink-700
                      hover:file:bg-pink-100
                    "
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    {t('flowers.imageRequirements')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Form buttons */}
          <div className="flex justify-end mt-8 pt-6 border-t border-gray-200 space-x-3">
            <Link
              href={`/${locale}/admin/flowers`}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              {t('common.cancel')}
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 flex items-center"
            >
              <Save size={16} className="mr-1" />
              {t('common.save')}
            </button>
          </div>
        </form>
      )}
    </div>
  );
} 
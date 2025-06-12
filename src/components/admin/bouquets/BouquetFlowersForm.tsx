'use client';

import { useState } from 'react';
import { Plus, Minus, X } from 'lucide-react';
import { useTranslations } from 'next-intl';

type Flower = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  flower_id?: string;
};

type BouquetFlowersFormProps = {
  flowers: Flower[];
  availableFlowers: Array<{
    id: string;
    name: string;
    price: number;
    description?: string | null;
    in_stock: number;
  }>;
  submitting: boolean;
  onAddFlower: (flowerId: string) => void;
  onUpdateQuantity: (flowerId: string, change: number) => void;
  onRemoveFlower: (flowerId: string) => void;
};

export default function BouquetFlowersForm({
  flowers,
  availableFlowers,
  submitting,
  onAddFlower,
  onUpdateQuantity,
  onRemoveFlower
}: BouquetFlowersFormProps) {
  const t = useTranslations('admin');
  const [searchTerm, setSearchTerm] = useState('');
  const [isFlowerDropdownOpen, setIsFlowerDropdownOpen] = useState(false);
  
  // Filter available flowers based on search term and existing selections
  const filteredFlowers = availableFlowers.filter(flower => 
    flower.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !flowers.some(f => f.flower_id === flower.id)
  );

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">{t('bouquets.flowers')}</h2>
      
      <div className="mb-6">
        <div className="flex items-center">
          <div className="relative w-full">
            <input
              type="text"
              placeholder={t('bouquets.searchFlowers')}
              className="shadow-sm focus:ring-pink-500 focus:border-pink-500 block w-full pr-10 sm:text-sm border-gray-300 rounded-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setIsFlowerDropdownOpen(true)}
              disabled={submitting}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          
          {isFlowerDropdownOpen && filteredFlowers.length > 0 && (
            <div className="absolute z-10 mt-1 w-full max-w-xs bg-white shadow-lg rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto max-h-60 focus:outline-none sm:text-sm">
              {filteredFlowers.map((flower) => (
                <div
                  key={flower.id}
                  className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-100"
                  onClick={() => {
                    onAddFlower(flower.id);
                    setIsFlowerDropdownOpen(false);
                    setSearchTerm('');
                  }}
                >
                  <div className="flex items-center">
                    <span className="font-medium block truncate">{flower.name}</span>
                    <span className="ml-2 text-sm text-gray-500">${flower.price.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <div>
        {flowers.length === 0 ? (
          <p className="text-gray-500 italic">{t('bouquets.noFlowers')}</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {flowers.map((flower) => (
              <li key={flower.id} className="py-4 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{flower.name}</p>
                    <p className="text-sm text-gray-500">${flower.price.toFixed(2)} each</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="flex items-center border rounded-md">
                    <button
                      type="button"
                      className="p-2 text-gray-500 hover:text-gray-600"
                      onClick={() => onUpdateQuantity(flower.id, -1)}
                      disabled={flower.quantity <= 1 || submitting}
                    >
                      <Minus size={16} />
                    </button>
                    <span className="px-2 text-gray-700">{flower.quantity}</span>
                    <button
                      type="button"
                      className="p-2 text-gray-500 hover:text-gray-600"
                      onClick={() => onUpdateQuantity(flower.id, 1)}
                      disabled={submitting}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  
                  <button
                    type="button"
                    className="ml-4 text-red-500 hover:text-red-600"
                    onClick={() => onRemoveFlower(flower.id)}
                    disabled={submitting}
                  >
                    <X size={18} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
} 
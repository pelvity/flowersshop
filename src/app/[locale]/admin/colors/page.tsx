'use client';

import { useState, useEffect } from 'react';
import { Palette, Plus, Edit, Trash2, Search, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface Color {
  id: string;
  name: string;
  hex_code: string;
  created_at: string;
  updated_at: string;
}

// API functions
async function getColors(): Promise<Color[]> {
  const response = await fetch('/api/admin/colors');
  if (!response.ok) {
    throw new Error('Failed to fetch colors');
  }
  const result = await response.json();
  return result.data || [];
}

async function createColor(name: string, hex: string): Promise<Color> {
  const response = await fetch('/api/admin/colors', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, hex }),
  });
  if (!response.ok) {
    throw new Error('Failed to create color');
  }
  const result = await response.json();
  return result.data;
}

async function updateColor(id: string, name: string, hex: string): Promise<Color> {
  const response = await fetch(`/api/admin/colors/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, hex }),
  });
  if (!response.ok) {
    throw new Error('Failed to update color');
  }
  const result = await response.json();
  return result.data;
}

async function deleteColor(id: string): Promise<void> {
  const response = await fetch(`/api/admin/colors/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete color');
  }
}

export default function ColorsPage() {
  const t = useTranslations('admin');
  const [colors, setColors] = useState<Color[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingColor, setEditingColor] = useState<Color | null>(null);
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#FFFFFF');

  useEffect(() => {
    const fetchColors = async () => {
      try {
        setIsLoading(true);
        const colorsData = await getColors();
        setColors(colorsData);
      } catch (err) {
        setError('Failed to load colors. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchColors();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColorName.trim() || !newColorHex.trim()) return;

    try {
      const newColor = await createColor(newColorName.trim(), newColorHex.trim());
      setColors([...colors, newColor]);
      setNewColorName('');
      setNewColorHex('#FFFFFF');
    } catch (err) {
      setError('Failed to create color.');
    }
  };

  const handleUpdate = async (color: Color) => {
    if (!color.name.trim() || !color.hex_code.trim()) return;

    try {
      const updatedColor = await updateColor(color.id, color.name.trim(), color.hex_code.trim());
      setColors(colors.map(c => c.id === updatedColor.id ? updatedColor : c));
      setEditingColor(null);
    } catch (err) {
      setError('Failed to update color.');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(t('colors.confirmDelete'))) {
      try {
        await deleteColor(id);
        setColors(colors.filter(c => c.id !== id));
      } catch (err) {
        setError('Failed to delete color.');
      }
    }
  };
  
  const filteredColors = colors.filter(color =>
    color.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{t('colors.title')}</h1>
          <p className="text-sm text-gray-600 mt-1">
            Create, edit, and delete colors for flowers
          </p>
        </div>
      </div>

      <div className="bg-white p-4 shadow rounded-lg mb-6">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label htmlFor="colorName" className="block text-sm font-medium text-gray-700 mb-1">
              {t('colors.colorName')}
            </label>
            <input
              id="colorName"
              type="text"
              value={newColorName}
              onChange={e => setNewColorName(e.target.value)}
              placeholder={t('colors.colorName')}
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-pink-500"
              required
            />
          </div>
          <div>
            <label htmlFor="colorHex" className="block text-sm font-medium text-gray-700 mb-1">
              {t('colors.colorHex')}
            </label>
            <div className="flex items-center">
              <input
                id="colorHex"
                type="color"
                value={newColorHex}
                onChange={e => setNewColorHex(e.target.value)}
                className="h-10 w-10 border border-gray-300 rounded-md mr-2"
              />
              <input
                type="text"
                value={newColorHex}
                onChange={e => setNewColorHex(e.target.value)}
                placeholder="#FFFFFF"
                className="flex-1 border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-md flex items-center"
          >
            <Plus className="h-5 w-5 mr-1" />
            {t('colors.addColor')}
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
            {filteredColors.map(color => (
              <li key={color.id} className="py-4">
                {editingColor?.id === color.id ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editingColor.name}
                      onChange={e => setEditingColor({ ...editingColor, name: e.target.value })}
                      className="border border-gray-300 rounded-md py-1 px-2 w-full"
                      autoFocus
                    />
                    <div className="flex items-center">
                      <input
                        type="color"
                        value={editingColor.hex_code}
                        onChange={e => setEditingColor({ ...editingColor, hex_code: e.target.value })}
                        className="h-8 w-8 border border-gray-300 rounded-md mr-2"
                      />
                      <input
                        type="text"
                        value={editingColor.hex_code}
                        onChange={e => setEditingColor({ ...editingColor, hex_code: e.target.value })}
                        className="flex-1 border border-gray-300 rounded-md py-1 px-2"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleUpdate(editingColor)}
                        className="bg-pink-600 text-white px-3 py-1 rounded-md text-sm"
                      >
                        {t('common.save')}
                      </button>
                      <button 
                        onClick={() => setEditingColor(null)}
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
                        <div 
                          className="h-5 w-5 rounded-full mr-2" 
                          style={{ backgroundColor: color.hex_code }}
                        />
                        {color.name}
                        <span className="ml-2 text-sm text-gray-500">{color.hex_code}</span>
                      </span>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setEditingColor(color)} className="text-gray-500 hover:text-pink-600">
                          <Edit className="h-5 w-5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(color.id)} 
                          className="text-gray-500 hover:text-red-600"
                          title={t('colors.deleteColor')}
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </li>
            ))}
            {filteredColors.length === 0 && (
              <li className="py-4 text-center text-gray-500">{t('common.noResults')}</li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
} 
'use client';

import { useState, useEffect } from 'react';
import { Edit, Trash2, Plus, Check, X } from 'lucide-react';
import { Color } from '@/lib/colors';

export default function ColorsManagementPage() {
  const [colors, setColors] = useState<Color[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    hex: '#000000',
    isActive: true,
  });
  
  // Load colors on mount
  useEffect(() => {
    fetchColors();
  }, []);
  
  // Fetch colors from API
  const fetchColors = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/admin/colors');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch colors');
      }
      
      setColors(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Failed to fetch colors:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };
  
  // Open form to create a new color
  const handleCreate = () => {
    setFormData({
      name: '',
      hex: '#000000',
      isActive: true,
    });
    setEditingId(null);
    setIsFormOpen(true);
  };
  
  // Open form to edit an existing color
  const handleEdit = (color: Color) => {
    setFormData({
      name: color.name,
      hex: color.hex,
      isActive: color.isActive,
    });
    setEditingId(color.id);
    setIsFormOpen(true);
  };
  
  // Submit form to create or update a color
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      const isEditing = !!editingId;
      const url = isEditing 
        ? `/api/admin/colors/${editingId}` 
        : '/api/admin/colors';
      
      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to save color');
      }
      
      // Refresh colors
      await fetchColors();
      
      // Reset form
      setFormData({
        name: '',
        hex: '#000000',
        isActive: true,
      });
      setEditingId(null);
      setIsFormOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Failed to save color:', err);
    }
  };
  
  // Delete a color
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this color?')) {
      return;
    }
    
    setError(null);
    
    try {
      const response = await fetch(`/api/admin/colors/${id}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete color');
      }
      
      // Refresh colors
      await fetchColors();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Failed to delete color:', err);
    }
  };
  
  if (isLoading && colors.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading colors...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Colors Management</h1>
        <button
          onClick={handleCreate}
          className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-md flex items-center"
        >
          <Plus className="h-5 w-5 mr-1" />
          Add New Color
        </button>
      </div>
      
      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded border border-red-200 mb-6">
          {error}
        </div>
      )}
      
      {/* Color Form */}
      {isFormOpen && (
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            {editingId ? 'Edit Color' : 'Add New Color'}
          </h2>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Color Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="hex" className="block text-sm font-medium text-gray-700 mb-1">
                  Color Code
                </label>
                <div className="flex">
                  <input
                    type="color"
                    id="hex"
                    name="hex"
                    value={formData.hex}
                    onChange={handleInputChange}
                    className="h-10 w-12 border border-gray-300 rounded-l-md cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.hex}
                    onChange={handleInputChange}
                    name="hex"
                    className="flex-1 border border-gray-300 border-l-0 rounded-r-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-pink-500"
                    required
                  />
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Active</span>
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Inactive colors won't be available for selection in the store
              </p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setIsFormOpen(false);
                  setEditingId(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-md"
              >
                {editingId ? 'Update Color' : 'Add Color'}
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Colors Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Color
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hex Code
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
            {colors.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                  No colors found. Add your first color!
                </td>
              </tr>
            ) : (
              colors.map((color) => (
                <tr key={color.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full border border-gray-200" style={{ backgroundColor: color.hex }}></div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{color.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{color.hex}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {color.isActive ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(color)}
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(color.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
} 
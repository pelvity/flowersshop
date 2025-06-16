'use client';

import { useState, useEffect, useRef } from 'react';
import { Tag as TagIcon, Plus, X, Search, AlertCircle } from 'lucide-react';
import { Tag } from '@/lib/repositories/repository-types';

interface BouquetTagsManagerProps {
  bouquetId: string;
  initialTags?: Tag[];
}

export default function BouquetTagsManager({
  bouquetId,
  initialTags = []
}: BouquetTagsManagerProps) {
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<Tag[]>(initialTags);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Create refs to track input and dropdown elements
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch all available tags
  useEffect(() => {
    const fetchTags = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/tags');
        
        if (!response.ok) {
          throw new Error('Failed to fetch tags');
        }
        
        const data = await response.json();
        setAvailableTags(data);
      } catch (err) {
        console.error('Error fetching tags:', err);
        setError('Failed to load tags. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTags();
  }, []);

  // Set initial tags when they become available
  useEffect(() => {
    if (initialTags?.length) {
      setSelectedTags(initialTags);
    }
  }, [initialTags]);

  // Filter available tags based on search term and exclude already selected tags
  const filteredTags = availableTags
    .filter(tag => 
      tag.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
      !selectedTags.some(selected => selected.id === tag.id)
    );

  // Update the bouquet with new tags
  const updateBouquetTags = async (updatedTags: Tag[]) => {
    try {
      setIsSaving(true);
      
      // Convert tags to array of IDs for the API
      const tagIds = updatedTags.map(tag => tag.id);
      
      const response = await fetch(`/api/bouquets/${bouquetId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tags: tagIds }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update bouquet tags');
      }
      
      // Update was successful
      setSelectedTags(updatedTags);
      setError(null);
    } catch (err) {
      console.error('Error updating bouquet tags:', err);
      setError(err instanceof Error ? err.message : 'Failed to update bouquet tags');
      // Revert to previous tags on error
      setSelectedTags(selectedTags);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddTag = (tag: Tag) => {
    const newSelectedTags = [...selectedTags, tag];
    setSelectedTags(newSelectedTags);
    updateBouquetTags(newSelectedTags);
    setSearchTerm('');
  };

  const handleRemoveTag = (tagId: string) => {
    const newSelectedTags = selectedTags.filter(tag => tag.id !== tagId);
    setSelectedTags(newSelectedTags);
    updateBouquetTags(newSelectedTags);
  };

  const handleCreateTag = async () => {
    // Don't create empty tags
    if (!searchTerm.trim()) return;
    
    // Don't create a tag that already exists
    if (availableTags.some(t => t.name.toLowerCase() === searchTerm.toLowerCase())) {
      const existingTag = availableTags.find(t => t.name.toLowerCase() === searchTerm.toLowerCase());
      if (existingTag && !selectedTags.some(st => st.id === existingTag.id)) {
        handleAddTag(existingTag);
      }
      return;
    }

    setIsCreating(true);
    setError(null);
    
    try {
      // Create new tag on the server
      const response = await fetch('/api/tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: searchTerm.trim() }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create tag');
      }
      
      const newTag = await response.json();
      
      // Add new tag to available tags
      setAvailableTags(prev => [...prev, newTag]);
      
      // Add to selected tags and update bouquet
      handleAddTag(newTag);
      setSearchTerm('');
      setIsDropdownOpen(false);
    } catch (err) {
      console.error('Error creating tag:', err);
      setError(err instanceof Error ? err.message : 'Failed to create tag');
    } finally {
      setIsCreating(false);
    }
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Only close the dropdown if the click was outside the input AND outside the dropdown
      if (
        searchInputRef.current && 
        !searchInputRef.current.contains(event.target as Node) &&
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    // Add the event listener
    document.addEventListener('mousedown', handleClickOutside);
    
    // Cleanup
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (isLoading) {
    return <div className="text-gray-500">Loading tags...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col">
        <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
          Tags
        </label>
        
        {/* Selected tags */}
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedTags.map(tag => (
            <div 
              key={tag.id} 
              className="bg-pink-50 text-pink-700 px-3 py-1 rounded-full flex items-center text-sm"
            >
              <TagIcon className="h-3 w-3 mr-1" />
              <span>{tag.name}</span>
              <button 
                type="button"
                onClick={() => handleRemoveTag(tag.id)}
                className="ml-1 text-pink-500 hover:text-pink-700 focus:outline-none"
                disabled={isSaving}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          {selectedTags.length === 0 && (
            <div className="text-sm text-gray-500">No tags selected</div>
          )}
        </div>
        
        {/* Error message */}
        {error && (
          <div className="mb-2 text-red-600 bg-red-50 p-2 rounded-md flex items-center text-sm">
            <AlertCircle className="h-4 w-4 mr-1" />
            <span>{error}</span>
          </div>
        )}
        
        {/* Tag search and dropdown */}
        <div className="relative">
          <div className="flex">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                ref={searchInputRef}
                type="text"
                id="tag-search"
                placeholder="Search tags..."
                className="pl-10 block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-pink-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setIsDropdownOpen(true)}
                onClick={() => setIsDropdownOpen(true)}
                disabled={isCreating || isSaving}
              />
            </div>
            <button
              type="button"
              onClick={handleCreateTag}
              disabled={isCreating || isSaving || !searchTerm.trim()}
              className={`ml-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white ${
                isCreating || isSaving || !searchTerm.trim() ? 'bg-pink-400 cursor-not-allowed' : 'bg-pink-600 hover:bg-pink-700'
              } focus:outline-none`}
            >
              {isCreating ? (
                <>
                  <div className="animate-spin h-4 w-4 mr-1 border-2 border-white border-t-transparent rounded-full"></div>
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </>
              )}
            </button>
          </div>
          
          {/* Dropdown for tag selection */}
          {isDropdownOpen && filteredTags.length > 0 && (
            <div 
              ref={dropdownRef}
              className="absolute z-50 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm"
            >
              {filteredTags.map(tag => (
                <div
                  key={tag.id}
                  className="cursor-pointer hover:bg-gray-100 py-2 px-3 flex items-center"
                  onClick={() => {
                    handleAddTag(tag);
                    setIsDropdownOpen(false);
                  }}
                >
                  <TagIcon className="h-4 w-4 mr-2 text-gray-500" />
                  {tag.name}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 
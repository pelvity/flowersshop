'use client';

import { useState, useEffect } from 'react';
import { Tag, Plus, Edit, Trash2, Search, Loader2 } from 'lucide-react';

interface Tag {
  id: string;
  name: string;
}

// Mock API functions - replace with actual API calls
async function getTags(): Promise<Tag[]> {
  const response = await fetch('/api/tags');
  if (!response.ok) {
    throw new Error('Failed to fetch tags');
  }
  return response.json();
}

async function createTag(name: string): Promise<Tag> {
  const response = await fetch('/api/tags', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  if (!response.ok) {
    throw new Error('Failed to create tag');
  }
  return response.json();
}

async function updateTag(id: string, name: string): Promise<Tag> {
  const response = await fetch(`/api/tags?id=${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  if (!response.ok) {
    throw new Error('Failed to update tag');
  }
  return response.json();
}

async function deleteTag(id: string): Promise<void> {
  const response = await fetch(`/api/tags?id=${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete tag');
  }
}


export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [newTagName, setNewTagName] = useState('');

  useEffect(() => {
    const fetchTags = async () => {
      try {
        setIsLoading(true);
        const tagsData = await getTags();
        setTags(tagsData);
      } catch (err) {
        setError('Failed to load tags. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchTags();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;

    try {
      const newTag = await createTag(newTagName.trim());
      setTags([...tags, newTag]);
      setNewTagName('');
    } catch (err) {
      setError('Failed to create tag.');
    }
  };

  const handleUpdate = async (tag: Tag) => {
    if (!tag.name.trim()) return;

    try {
      const updatedTag = await updateTag(tag.id, tag.name.trim());
      setTags(tags.map(t => t.id === updatedTag.id ? updatedTag : t));
      setEditingTag(null);
    } catch (err) {
      setError('Failed to update tag.');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this tag?')) {
      try {
        await deleteTag(id);
        setTags(tags.filter(t => t.id !== id));
      } catch (err) {
        setError('Failed to delete tag.');
      }
    }
  };
  
  const filteredTags = tags.filter(tag =>
    tag.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Manage Tags</h1>
          <p className="text-sm text-gray-600 mt-1">
            Create, edit, and delete tags for bouquets
          </p>
        </div>
      </div>

      <div className="bg-white p-4 shadow rounded-lg mb-6">
        <form onSubmit={handleCreate} className="flex gap-4">
          <input
            type="text"
            value={newTagName}
            onChange={e => setNewTagName(e.target.value)}
            placeholder="New tag name"
            className="flex-grow border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
          <button
            type="submit"
            className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-md flex items-center"
          >
            <Plus className="h-5 w-5 mr-1" />
            Add Tag
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
            placeholder="Search tags..."
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
            {filteredTags.map(tag => (
              <li key={tag.id} className="py-3 flex items-center justify-between">
                {editingTag?.id === tag.id ? (
                  <input
                    type="text"
                    value={editingTag.name}
                    onChange={e => setEditingTag({ ...editingTag, name: e.target.value })}
                    onBlur={() => handleUpdate(editingTag)}
                    onKeyDown={e => e.key === 'Enter' && handleUpdate(editingTag)}
                    className="border border-gray-300 rounded-md py-1 px-2"
                    autoFocus
                  />
                ) : (
                  <span className="flex items-center">
                    <Tag className="h-4 w-4 mr-2 text-gray-500" />
                    {tag.name}
                  </span>
                )}
                <div className="flex items-center gap-2">
                  <button onClick={() => setEditingTag(tag)} className="text-gray-500 hover:text-pink-600">
                    <Edit className="h-5 w-5" />
                  </button>
                  <button onClick={() => handleDelete(tag.id)} className="text-gray-500 hover:text-red-600">
                    <Trash2 className="h-5 w-5" />
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
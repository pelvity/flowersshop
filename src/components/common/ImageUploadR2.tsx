'use client';

import { useState } from 'react';
import { getPublicUrl } from '@/utils/r2-storage';

type ImageUploadR2Props = {
  initialImageUrl?: string;
  onImageUploaded?: (url: string, path: string) => void;
  folder?: string;
  className?: string;
  imageClassName?: string;
  entityId?: string;
};

export default function ImageUploadR2({
  initialImageUrl,
  onImageUploaded,
  folder = 'images',
  className = '',
  imageClassName = '',
  entityId = '',
}: ImageUploadR2Props) {
  const [imageUrl, setImageUrl] = useState<string>(initialImageUrl || '');
  const [uploading, setUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setError(null);

      // Create form data for API request
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);
      if (entityId) {
        formData.append('entityId', entityId);
      }

      // Upload using the API route
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const data = await response.json();

      // Update state and trigger callback
      setImageUrl(data.url);
      if (onImageUploaded) {
        onImageUploaded(data.url, data.path);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      setError('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="mb-4 w-full">
        {imageUrl ? (
          <div className="relative">
            <img 
              src={imageUrl} 
              alt="Uploaded" 
              className={`w-full h-auto object-cover rounded-lg ${imageClassName}`}
            />
            <button
              type="button"
              onClick={() => {
                setImageUrl('');
                if (onImageUploaded) {
                  onImageUploaded('', '');
                }
              }}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="mt-1 text-sm text-gray-500">Click to upload image</p>
          </div>
        )}

        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className={`absolute inset-0 w-full h-full opacity-0 cursor-pointer ${imageUrl ? 'hidden' : ''}`}
          disabled={uploading}
        />
      </div>

      {uploading && (
        <div className="mt-2 text-center">
          <div className="spinner border-t-2 border-blue-500 border-solid rounded-full w-5 h-5 animate-spin"></div>
          <p className="text-sm text-gray-500 mt-1">Uploading...</p>
        </div>
      )}

      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
} 
'use client';

import { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Film, X } from 'lucide-react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

// Add a browser-compatible UUID function
function generateUUID(): string {
  // Use browser crypto API to generate a UUID
  if (typeof window !== 'undefined' && window.crypto) {
    return window.crypto.randomUUID();
  }
  
  // Fallback for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

type BouquetMedia = {
  id: string;
  bouquet_id: string;
  media_type: 'image' | 'video';
  file_path: string;
  file_url?: string;
  file_name: string;
  file_size: number;
  content_type: string;
  display_order: number;
  is_thumbnail: boolean;
  // For local state management
  file?: File;
  url?: string;
  isUploading?: boolean;
  uploadProgress?: number;
};

type MediaItemProps = {
  item: BouquetMedia;
  index: number;
  isThumbnail: boolean;
  moveItem: (dragIndex: number, hoverIndex: number) => void;
  onDelete: (id: string) => void;
  onSetThumbnail: (id: string) => void;
};

type MediaItemType = {
  id: string;
  index: number;
};

const MediaItem = ({ item, index, isThumbnail, moveItem, onDelete, onSetThumbnail }: MediaItemProps) => {
  const ref = useRef<HTMLDivElement>(null);
  
  const [{ isDragging }, drag] = useDrag({
    type: 'MEDIA_ITEM',
    item: { id: item.id, index } as MediaItemType,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });
  
  const [, drop] = useDrop({
    accept: 'MEDIA_ITEM',
    hover: (draggedItem: MediaItemType, monitor: any) => {
      if (!ref.current) return;
      const dragIndex = draggedItem.index;
      const hoverIndex = index;
      
      // Don't replace items with themselves
      if (dragIndex === hoverIndex) return;
      
      // Time to actually perform the action
      moveItem(dragIndex, hoverIndex);
      
      // Update the dragged item's index for future checks
      draggedItem.index = hoverIndex;
    },
  });
  
  drag(drop(ref));
  
  const mediaUrl = item.file_url || item.url || '';
  const isImage = item.media_type === 'image';
  
  return (
    <div
      ref={ref}
      className={`relative rounded-md overflow-hidden border ${isThumbnail ? 'border-pink-500' : 'border-gray-200'} 
                ${isDragging ? 'opacity-50' : 'opacity-100'}`}
      style={{ width: '150px', height: '150px' }}
    >
      {item.isUploading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
          <div className="text-center">
            <div className="spinner border-t-4 border-pink-500 border-solid rounded-full w-8 h-8 animate-spin mb-2 mx-auto"></div>
            <span className="text-white text-xs">{item.uploadProgress || 0}%</span>
          </div>
        </div>
      )}
      
      {isImage ? (
        <img
          src={mediaUrl}
          alt={item.file_name}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="flex items-center justify-center h-full bg-gray-100">
          <Film size={40} className="text-gray-400" />
        </div>
      )}
      
      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 p-1 flex justify-between items-center">
        <button
          type="button"
          onClick={() => onSetThumbnail(item.id)}
          className={`p-1 rounded-full ${isThumbnail ? 'bg-pink-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
          title={isThumbnail ? "Current thumbnail" : "Set as thumbnail"}
        >
          <ImageIcon size={14} />
        </button>
        <button
          type="button"
          onClick={() => onDelete(item.id)}
          className="p-1 rounded-full bg-gray-700 text-gray-300 hover:bg-red-600 hover:text-white"
          title="Delete"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};

type BouquetMediaUploaderProps = {
  bouquetId: string;
  media: BouquetMedia[];
  onMediaChange: (media: BouquetMedia[]) => void;
  onThumbnailChange?: (thumbnailUrl: string, thumbnailPath: string) => void;
};

export default function BouquetMediaUploader({
  bouquetId,
  media,
  onMediaChange,
  onThumbnailChange,
}: BouquetMediaUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setError(null);
    setUploading(true);
    
    try {
      const newMedia = [...media];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const isVideo = file.type.startsWith('video/');
        const mediaType = isVideo ? 'video' : 'image';
        
        // Create a temporary ID for the media
        const tempId = `temp-${Date.now()}-${i}`;
        const tempUrl = URL.createObjectURL(file);
        
        // Add to local state for immediate preview
        const tempMedia: BouquetMedia = {
          id: tempId,
          bouquet_id: bouquetId,
          media_type: mediaType,
          file_path: '',
          file_name: file.name,
          file_size: file.size,
          content_type: file.type,
          display_order: media.length + i,
          is_thumbnail: media.length === 0 && i === 0, // First media is thumbnail by default
          file,
          url: tempUrl,
          isUploading: true,
          uploadProgress: 0
        };
        
        newMedia.push(tempMedia);
        onMediaChange([...newMedia]);
        
        try {
          // Create form data for API request
          const formData = new FormData();
          formData.append('file', file);
          formData.append('folder', 'bouquets');
          formData.append('entityId', bouquetId);

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

          // Update the media item with the server response
          const updatedMedia = newMedia.map(item => 
            item.id === tempId 
              ? { 
                  ...item, 
                  id: `new-${Date.now()}-${i}`,
                  file_path: data.path,
                  file_url: data.url,
                  url: data.url,
                  isUploading: false,
                  uploadProgress: 100
                } 
              : item
          );
          
          onMediaChange(updatedMedia);
          
          // If this is the first image and it's set as thumbnail, call onThumbnailChange
          const thumbnailMedia = updatedMedia.find(item => item.id === `new-${Date.now()}-${i}` && item.is_thumbnail);
          if (thumbnailMedia && onThumbnailChange) {
            onThumbnailChange(thumbnailMedia.file_url || thumbnailMedia.url || '', thumbnailMedia.file_path);
          }
        } catch (uploadErr) {
          console.error('Error uploading file to R2:', uploadErr);
          setError(`Failed to upload ${file.name}: ${uploadErr}`);
          
          // Update the temp media to show error
          const updatedMedia = newMedia.filter(item => item.id !== tempId);
          onMediaChange(updatedMedia);
        }
      }
    } catch (err) {
      console.error('Error in media upload:', err);
      setError('An unexpected error occurred during upload.');
    } finally {
      setUploading(false);
      
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  const handleDeleteMedia = (mediaId: string) => {
    // Note: We don't delete from R2 storage here, that can be handled by a cleanup script later
    const updatedMedia = media.filter(item => item.id !== mediaId);
    
    // If the deleted item was the thumbnail and we have other media, set the first one as thumbnail
    const wasThumbnail = media.find(item => item.id === mediaId)?.is_thumbnail || false;
    if (wasThumbnail && updatedMedia.length > 0) {
      updatedMedia[0].is_thumbnail = true;
      
      // Call onThumbnailChange if provided
      if (onThumbnailChange) {
        onThumbnailChange(updatedMedia[0].file_url || updatedMedia[0].url || '', updatedMedia[0].file_path);
      }
    } else if (wasThumbnail && updatedMedia.length === 0 && onThumbnailChange) {
      // If it was the only item and it was the thumbnail, clear the thumbnail
      onThumbnailChange('', '');
    }
    
    onMediaChange(updatedMedia);
  };
  
  const handleSetThumbnail = (mediaId: string) => {
    const updatedMedia = media.map(item => ({
      ...item,
      is_thumbnail: item.id === mediaId
    }));
    
    // Call onThumbnailChange if provided
    const thumbnailMedia = updatedMedia.find(item => item.is_thumbnail);
    if (thumbnailMedia && onThumbnailChange) {
      onThumbnailChange(thumbnailMedia.file_url || thumbnailMedia.url || '', thumbnailMedia.file_path);
    }
    
    onMediaChange(updatedMedia);
  };
  
  const moveMedia = (dragIndex: number, hoverIndex: number) => {
    const draggedItem = media[dragIndex];
    if (draggedItem) {
      const newMedia = [...media];
      newMedia.splice(dragIndex, 1);
      newMedia.splice(hoverIndex, 0, draggedItem);
      
      // Update display order
      const updatedMedia = newMedia.map((item, index) => ({
        ...item,
        display_order: index
      }));
      
      onMediaChange(updatedMedia);
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Media</h3>
        <div>
          <input
            type="file"
            multiple
            accept="image/*, video/*"
            onChange={handleFileChange}
            className="hidden"
            ref={fileInputRef}
            disabled={uploading}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload Media
          </button>
        </div>
      </div>
      
      {error && (
        <div className="rounded-md bg-red-50 p-4">
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
      
      {uploading && (
        <div className="flex justify-center my-4">
          <div className="text-center">
            <div className="spinner border-t-4 border-pink-500 border-solid rounded-full w-10 h-10 animate-spin mb-2 mx-auto"></div>
            <p className="text-sm text-gray-500">Uploading media...</p>
          </div>
        </div>
      )}
      
      <DndProvider backend={HTML5Backend}>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {media.map((item, index) => (
            <MediaItem
              key={item.id}
              item={item}
              index={index}
              isThumbnail={item.is_thumbnail}
              moveItem={moveMedia}
              onDelete={handleDeleteMedia}
              onSetThumbnail={handleSetThumbnail}
            />
          ))}
          
          {media.length === 0 && !uploading && (
            <div className="col-span-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-md">
              <div className="text-center">
                <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-1 text-sm text-gray-500">No media added to this bouquet</p>
                <p className="mt-1 text-xs text-gray-400">Upload images or videos to showcase your bouquet</p>
              </div>
            </div>
          )}
        </div>
      </DndProvider>
    </div>
  );
} 
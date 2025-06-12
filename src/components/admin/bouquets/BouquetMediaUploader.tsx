'use client';

import { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Film, X } from 'lucide-react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { getFileUrl, uploadToWorker, deleteFromWorker } from '@/utils/cloudflare-worker';

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
  
  // Make sure we have a valid URL with proper protocol
  let mediaUrl = '';

  // Try to get URL from different properties in order of preference
  if (item.url && item.url.startsWith('http')) {
    // If we have a client-side URL object URL, use it
    mediaUrl = item.url;
  } else if (item.file_url && item.file_url.startsWith('http')) {
    // If we have a stored file_url from the database, use it
    mediaUrl = item.file_url;
  } else if (item.file_path) {
    // If we only have a file_path, construct the URL using worker utility
    mediaUrl = getFileUrl(item.file_path);
  }

  // Final fallback - use a placeholder image
  if (!mediaUrl) {
    mediaUrl = '/placeholder-bouquet.jpg';
  }

  // Default to image type if not specified
  const isImage = item.media_type !== 'video';

  return (
    <div className="flex flex-col items-center">
    <div
      ref={ref}
        className={`relative rounded-md overflow-hidden border ${
          isThumbnail 
            ? 'border-pink-500 ring-2 ring-pink-500 shadow-lg' 
            : 'border-gray-200'
        } ${isDragging ? 'opacity-50' : 'opacity-100'}`}
        style={{ width: '150px', height: '150px', margin: '0 auto' }}
    >
      {item.isUploading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
          <div className="text-center">
            <div className="spinner border-t-4 border-pink-500 border-solid rounded-full w-8 h-8 animate-spin mb-2 mx-auto"></div>
            <span className="text-white text-xs">{item.uploadProgress || 0}%</span>
          </div>
        </div>
      )}
        
        {isThumbnail && (
          <div className="absolute top-0 left-0 w-full bg-gradient-to-r from-pink-500 to-pink-600 text-white text-xs px-2 py-1 z-20 font-medium text-center">
            DEFAULT
          </div>
        )}

      {mediaUrl ? (
        isImage ? (
          <>
            {/* Show loading state initially */}
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="spinner border-t-4 border-pink-300 border-solid rounded-full w-8 h-8 animate-spin"></div>
            </div>

            <img
              src={mediaUrl}
              alt={item.file_name || 'Bouquet image'}
              className="w-full h-full object-cover relative z-10"
              onLoad={() => console.log('Image loaded successfully:', mediaUrl)}
              onError={(e) => {
                console.error('Image failed to load:', mediaUrl);
                // Set a fallback image on error
                (e.target as HTMLImageElement).src = '/placeholder-bouquet.jpg';
              }}
            />
          </>
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-100">
            <Film size={40} className="text-gray-400" />
          </div>
        )
      ) : (
        <div className="flex items-center justify-center h-full bg-gray-100">
          <ImageIcon size={40} className="text-gray-400" />
        </div>
      )}
      
        {/* Delete button in top right corner */}
        <button
          type="button"
          onClick={() => onDelete(item.id)}
          className="absolute top-1 right-1 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-md z-20"
          title="Delete"
        >
          <X size={14} />
        </button>
      </div>
      
      {/* Radio button below the media container */}
      <div className="mt-2">
        <label className="flex items-center cursor-pointer">
          <input
            type="radio"
            className="form-radio h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 mr-2"
            checked={isThumbnail}
            onChange={() => onSetThumbnail(item.id)}
          />
          <span className="text-sm text-gray-700">Default</span>
        </label>
      </div>
    </div>
  );
};

type BouquetMediaUploaderProps = {
  bouquetId: string;
  media: BouquetMedia[];
  onMediaChange: (media: BouquetMedia[]) => void;
  onThumbnailChange?: (thumbnailUrl: string, thumbnailPath: string) => void;
  onDelete?: (mediaId: string) => Promise<void>;
  onSetThumbnail?: (mediaId: string) => void;
};

export default function BouquetMediaUploader({
  bouquetId,
  media,
  onMediaChange,
  onThumbnailChange,
  onDelete,
  onSetThumbnail,
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
      const uploadPromises = [];
      
      // Create temporary media items for immediate display
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
        
        // Create a promise for each file upload to handle them all together
        const uploadPromise = (async () => {
          try {
            // Upload using our worker utility
            const uploadResult = await uploadToWorker(file, 'bouquets', bouquetId);

            // Check if upload was successful
            if (!uploadResult.success) {
              const errorMessage = uploadResult.error || 'Upload failed';
              const errorDetails = uploadResult.details ? JSON.stringify(uploadResult.details) : '';
              console.error('Upload error:', { error: errorMessage, details: uploadResult.details });
              throw new Error(`${errorMessage}${errorDetails ? ` - ${errorDetails}` : ''}`);
            }

          // After successful upload, save to Supabase
          const { createClient } = await import('@/utils/supabase/client');
          const supabase = createClient();

          // Create a new media record in the database
          const { data: dbMedia, error: dbError } = await supabase
            .from('bouquet_media')
            .insert({
              bouquet_id: bouquetId,
              media_type: mediaType,
                file_path: uploadResult.path,
                file_url: uploadResult.url,
              file_name: file.name,
              file_size: file.size,
              content_type: file.type,
              display_order: media.length + i,
              is_thumbnail: media.length === 0 && i === 0
            })
            .select()
            .single();

          if (dbError) {
            console.error('Error saving media to database:', dbError);
            throw new Error('Failed to save media to database');
          }

            return { 
              success: true, 
              tempId, 
              dbMedia: { 
                ...dbMedia,
                url: uploadResult.url,
                file_url: uploadResult.url,
                media_type: mediaType
              } 
            };
          } catch (uploadErr) {
            console.error('Error uploading file:', uploadErr);
            return { success: false, tempId, error: uploadErr };
          }
        })();
        
        uploadPromises.push(uploadPromise);
      }
      
      // Update UI with temporary items immediately
      onMediaChange([...newMedia]);
      
      // Wait for all uploads to complete
      const results = await Promise.all(uploadPromises);
      
      // Process results and update the media array with actual database items
      let updatedMedia = [...newMedia];
      let successfulUploads = false;
      
      for (const result of results) {
        if (result.success) {
          successfulUploads = true;
          // Replace the temp item with the database item
          updatedMedia = updatedMedia.map(item => 
            item.id === result.tempId 
              ? { 
                  ...result.dbMedia,
                  isUploading: false,
                  uploadProgress: 100
                } 
              : item
          );

          // If this is a thumbnail, update thumbnail reference
          if (result.dbMedia.is_thumbnail && onThumbnailChange) {
            onThumbnailChange(result.dbMedia.file_url || '', result.dbMedia.file_path);
          }
        } else {
          // Remove failed uploads from the array
          updatedMedia = updatedMedia.filter(item => item.id !== result.tempId);
        }
      }
      
      // Update the UI with final media array
      onMediaChange(updatedMedia);
      
      if (successfulUploads) {
        // Force a synchronous state update to ensure the UI reflects the changes
        setTimeout(() => {
          onMediaChange([...updatedMedia]);
        }, 100);
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
  
  const handleDeleteMedia = async (mediaId: string) => {
    try {
      // Ask for confirmation before deleting
      if (!window.confirm('Are you sure you want to delete this media? This action cannot be undone.')) {
        return;
      }
      
      // If the parent component provided a delete function, use it
      if (onDelete) {
        await onDelete(mediaId);
        return;
      }
      
      // Otherwise handle deletion internally
      // First, update the local state
      const mediaToDelete = media.find(item => item.id === mediaId);
      const updatedMedia = media.filter(item => item.id !== mediaId);

      // If the deleted item was the thumbnail and we have other media, set the first one as thumbnail
      const wasThumbnail = mediaToDelete?.is_thumbnail || false;
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

      // Update UI immediately for better UX
      onMediaChange(updatedMedia);

      // Delete from database if it's a real DB entry (not a temp ID)
      if (mediaId && !mediaId.startsWith('temp-') && !mediaId.startsWith('new-')) {
        // Import the Supabase client
        const { createClient } = await import('@/utils/supabase/client');
        const supabase = createClient();

        const { error } = await supabase
          .from('bouquet_media')
          .delete()
          .eq('id', mediaId);

        if (error) {
          console.error('Error deleting media from database:', error);
          throw error;
        }

        console.log('Successfully deleted media from database:', mediaId);

        // Also delete from R2 storage using worker if we have a file path
        if (mediaToDelete?.file_path) {
          try {
            const deleteResult = await deleteFromWorker(mediaToDelete.file_path);

            if (!deleteResult.success) {
              console.warn('Failed to delete file from storage:', deleteResult.error);
              // Don't throw error here - we want to continue even if storage deletion fails
            } else {
              console.log('Successfully deleted file from R2 storage');
            }
          } catch (storageError) {
            console.warn('Error deleting from storage, will require cleanup later:', storageError);
          }
          }
        }
    } catch (error) {
      console.error('Error in handleDeleteMedia:', error);
      setError('Failed to delete media. Please try again.');
    }
  };
  
  const handleSetThumbnail = (mediaId: string) => {
    // If parent component provided a setThumbnail function, use it
    if (onSetThumbnail) {
      onSetThumbnail(mediaId);
      return;
    }

    // Otherwise handle setting thumbnail internally
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
      
      {/* Simplified instructions */}
      <div className="text-sm text-gray-500 mb-4">
        Upload images and select one as the default display image using the radio buttons below each photo.
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
                <p className="mt-1 text-xs text-gray-400 mb-4">Upload images or videos to showcase your bouquet</p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700"
                >
                  <Upload className="mr-1 h-4 w-4" />
                  Upload Media
                </button>
              </div>
            </div>
          )}
        </div>
      </DndProvider>
    </div>
  );
} 
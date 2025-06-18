'use client';

import { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Film, X } from 'lucide-react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { getFileUrl, uploadToWorker, deleteFromWorker } from '@/utils/cloudflare-worker';
import { useTranslations } from 'next-intl';

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

export type MediaItem = {
  id: string;
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
  // The following fields will be added by the wrapper components
  [key: string]: any; // Allow for entityType_id field (e.g. bouquet_id, flower_id)
};

type MediaItemProps = {
  item: MediaItem;
  index: number;
  isThumbnail: boolean;
  moveItem: (dragIndex: number, hoverIndex: number) => void;
  onDelete: (id: string) => void;
  onSetThumbnail: (id: string) => void;
  handleImageError: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
};

type MediaItemType = {
  id: string;
  index: number;
};

const MediaItem = ({ item, index, isThumbnail, moveItem, onDelete, onSetThumbnail, handleImageError }: MediaItemProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const t = useTranslations('admin');
  
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
          {t('media.thumbnail')}
        </div>
      )}
      
      {!isImage && (
        <div className="absolute top-0 right-0 bg-black bg-opacity-60 text-white text-xs px-2 py-1 z-20">
          {t('media.video')}
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
              alt={item.file_name || 'Media image'}
              className="w-full h-full object-cover relative z-10"
              onLoad={() => console.log('Image loaded successfully:', mediaUrl)}
              onError={handleImageError}
            />
          </>
        ) : (
          // Video player for video content
          <div className="relative w-full h-full bg-black">
            <video
              src={mediaUrl}
              className="w-full h-full object-contain"
              controls
              controlsList="nodownload"
              preload="metadata"
              onError={(e) => {
                console.error('Video loading error:', e);
                // Show fallback icon if video fails to load
                const target = e.target as HTMLVideoElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  const fallback = document.createElement('div');
                  fallback.className = 'absolute inset-0 flex items-center justify-center';
                  fallback.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>';
                  parent.appendChild(fallback);
                }
              }}
            >
              Your browser does not support HTML5 video.
            </video>
            {/* Play button overlay to make it clear this is a video */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-black bg-opacity-30 rounded-full p-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="text-white"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
              </div>
            </div>
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
          title={t('common.delete')}
        >
          <X size={14} />
        </button>
      </div>
      
      {/* Radio button below the media container */}
      <div className="mt-2">
        <label className={`flex items-center cursor-pointer ${!isImage ? 'opacity-50' : ''}`} title={!isImage ? t('media.onlyPhotoThumbnail') : t('media.setAsThumbnail')}>
          <input
            type="radio"
            className="form-radio h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 mr-2"
            checked={isThumbnail}
            onChange={() => isImage && onSetThumbnail(item.id)}
            disabled={!isImage}
          />
          <span className="text-sm text-gray-700">{t('media.thumbnail')}</span>
        </label>
      </div>
    </div>
  );
};

type MediaUploaderProps = {
  entityType: 'bouquets' | 'flowers';
  entityId: string;
  media: MediaItem[];
  onMediaChange: (media: MediaItem[]) => void;
  onThumbnailChange?: (thumbnailUrl: string, thumbnailPath: string) => void;
  onDelete?: (mediaId: string) => Promise<void>;
  onSetThumbnail?: (mediaId: string) => void;
};

export default function MediaUploader({
  entityType,
  entityId,
  media,
  onMediaChange,
  onThumbnailChange,
  onDelete,
  onSetThumbnail,
}: MediaUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = useTranslations('admin');
  
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    (e.target as HTMLImageElement).style.display = 'none';
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setError(null);
    
    // Check if any video is being uploaded and verify there's at least one image
    const videoFiles = Array.from(files).filter(file => file.type.startsWith('video/'));
    const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
    const hasExistingImages = media.some(item => item.media_type === 'image');
    
    // If there are videos being uploaded but no images (neither existing nor new), show an error
    if (videoFiles.length > 0 && !hasExistingImages && imageFiles.length === 0) {
      setError(t('media.photoRequiredForVideo'));
      return;
    }
    
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
        
        // For thumbnail selection:
        // 1. If it's the first upload and it's an image, make it the thumbnail
        // 2. If there are no existing thumbnails and it's an image, make it the thumbnail
        // 3. Never make a video a thumbnail automatically
        const shouldBeThumbnail = 
          (!isVideo && (
            (media.length === 0 && i === 0) || // First media ever
            (!media.some(m => m.is_thumbnail)) // No existing thumbnail
          ));
        
        // Create the entity ID field key based on entityType
        const entityIdField = `${entityType.slice(0, -1)}_id`; // 'bouquets' -> 'bouquet_id', 'flowers' -> 'flower_id'
        
        // Add to local state for immediate preview
        const tempMedia: MediaItem = {
          id: tempId,
          media_type: mediaType,
          file_path: '',
          file_name: file.name,
          file_size: file.size,
          content_type: file.type,
          display_order: media.length + i,
          is_thumbnail: shouldBeThumbnail,
          file,
          url: tempUrl,
          isUploading: true,
          uploadProgress: 0
        };
        
        // Add the dynamic entity ID field
        tempMedia[entityIdField] = entityId;
        
        newMedia.push(tempMedia);
        
        // Create a promise for each file upload to handle them all together
        const uploadPromise = (async () => {
          try {
            // Upload using our worker utility
            const uploadResult = await uploadToWorker(file, entityType, entityId);

            // Check if upload was successful
            if (!uploadResult.success) {
              const errorMessage = uploadResult.error || 'Upload failed';
              const errorDetails = uploadResult.details ? JSON.stringify(uploadResult.details) : '';
              console.error('Upload error:', { error: errorMessage, details: uploadResult.details });
              throw new Error(`${errorMessage}${errorDetails ? ` - ${errorDetails}` : ''}`);
            }

            // Prepare the API payload with the entity-specific ID field
            const apiPayload: any = {
              media_type: mediaType,
              file_path: uploadResult.path,
              file_url: uploadResult.url,
              file_name: file.name,
              file_size: file.size,
              content_type: file.type,
              display_order: media.length + i,
              is_thumbnail: shouldBeThumbnail
            };
            
            // Add the entity ID field
            apiPayload[entityIdField] = entityId;

            // After successful upload, save to database via our server API
            const response = await fetch(`/api/admin/${entityType}/media`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(apiPayload),
            });

            if (!response.ok) {
              const errorData = await response.json();
              console.error(`Error saving ${entityType} media to database:`, errorData);
              throw new Error(`Failed to save ${entityType} media to database`);
            }

            const dbMedia = await response.json();

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
      if (!window.confirm(t('media.deleteConfirm'))) {
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
      
      // Delete from database if it's a real DB entry (not a temp ID)
      if (mediaId && !mediaId.startsWith('temp-') && !mediaId.startsWith('new-')) {
        // Delete using our API endpoint
        const response = await fetch(`/api/admin/${entityType}/media?id=${mediaId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error(`Error deleting ${entityType} media from database:`, errorData);
          setError(errorData.error || `Failed to delete ${entityType} media from database`);
          return; // Stop the process if we couldn't delete from database
        }

        console.log(`Successfully deleted ${entityType} media from database:`, mediaId);

        // Only if deletion was successful, update the local state
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

        // Update UI
        onMediaChange(updatedMedia);

        // Also delete from R2 storage using worker if we have a file path
        if (mediaToDelete?.file_path) {
          try {
            const deleteResult = await deleteFromWorker(mediaToDelete.file_path);

            if (!deleteResult.success) {
              console.warn(`Failed to delete file from storage:`, deleteResult.error);
              // Don't throw error here - we want to continue even if storage deletion fails
            } else {
              console.log(`Successfully deleted file from R2 storage`);
            }
          } catch (storageError) {
            console.warn(`Error deleting from storage, will require cleanup later:`, storageError);
          }
        }
      } else {
        // For temp files, just update the UI
        const updatedMedia = media.filter(item => item.id !== mediaId);
        onMediaChange(updatedMedia);
      }
    } catch (error) {
      console.error(`Error in handleDeleteMedia:`, error);
      setError(t('media.deleteError'));
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

  // Entity-specific title
  const entityTitle = entityType === 'bouquets' ? t('media.bouquetMedia') : t('media.flowerMedia');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">{entityTitle}</h3>
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
            {t('media.uploadButton')}
          </button>
        </div>
      </div>
      
      {/* Simplified instructions */}
      <div className="text-sm text-gray-500 mb-4">
        {t('media.instructions')}
        <br />
        <strong>{t('common.note')}:</strong> {t('media.videoRequirement')}
        <br />
        <span className="italic">{t('media.thumbnailNote')}</span>
      </div>
      
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{t('common.error')}</h3>
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
            <p className="text-sm text-gray-500">{t('media.uploading')}</p>
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
              handleImageError={handleImageError}
            />
          ))}
          
          {media.length === 0 && !uploading && (
            <div className="col-span-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-md">
              <div className="text-center">
                <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-1 text-sm text-gray-500">{t('media.noMedia')}</p>
                <p className="mt-1 text-xs text-gray-400 mb-4">{t('media.uploadPrompt')}</p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700"
                >
                  <Upload className="mr-1 h-4 w-4" />
                  {t('media.uploadButton')}
                </button>
              </div>
            </div>
          )}
        </div>
      </DndProvider>
    </div>
  );
} 
 
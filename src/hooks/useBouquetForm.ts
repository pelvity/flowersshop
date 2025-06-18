'use client';

import { useState } from 'react';
import { createLoggingClient } from '@/utils/supabase-logger';
import { ApiLogger } from '@/utils/api-logger';
import { useRouter } from 'next/navigation';
import { Bouquet, FlowerWithQuantity, BouquetMedia } from './useBouquetData';

// Create logger
const logger = new ApiLogger('useBouquetForm');

export function useBouquetForm(
  bouquetId: string, 
  bouquet: Bouquet,
  setBouquet: React.Dispatch<React.SetStateAction<Bouquet>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>,
  locale: string,
  availableFlowers: Array<{ id: string; name: string; price: number; }>
) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  
  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    if (type === 'checkbox') {
      setBouquet({
        ...bouquet,
        [name]: (e.target as HTMLInputElement).checked
      });
    } else {
      setBouquet({
        ...bouquet,
        [name]: value
      });
    }
  };
  
  // Handle flower operations
  const addFlower = (flowerId: string) => {
    // Find the flower in the passed availableFlowers array
    const availableFlower = availableFlowers.find((f: { id: string }) => f.id === flowerId);
    if (!availableFlower) return;
    
    const newFlower = {
      id: `temp-${Date.now()}`,
      flower_id: flowerId,
      name: availableFlower.name,
      price: availableFlower.price,
      quantity: 1
    };
    
    setBouquet({
      ...bouquet,
      flowers: [...bouquet.flowers, newFlower]
    });
  };
  
  const updateFlowerQuantity = (flowerId: string, change: number) => {
    const updatedFlowers = bouquet.flowers.map(flower => {
      if (flower.id === flowerId) {
        const newQuantity = Math.max(1, flower.quantity + change);
        return { ...flower, quantity: newQuantity };
      }
      return flower;
    });
    
    setBouquet({
      ...bouquet,
      flowers: updatedFlowers
    });
  };
  
  const removeFlower = (flowerId: string) => {
    setBouquet({
      ...bouquet,
      flowers: bouquet.flowers.filter(flower => flower.id !== flowerId)
    });
  };
  
  // Handle media operations
  const handleMediaChange = (updatedMedia: BouquetMedia[]) => {
    setBouquet(prev => ({
      ...prev,
      media: updatedMedia
    }));
  };
  
  // Delete a media item
  const deleteMedia = async (mediaId: string) => {
    // Check if media has a temporary ID or exists in the database
    if (mediaId.startsWith('temp-') || mediaId.startsWith('new-')) {
      // Just remove it from the local state if it's a temporary media
      setBouquet(prev => ({
        ...prev,
        media: prev.media.filter(m => m.id !== mediaId)
      }));
      return;
    }

    try {
      const supabase = createLoggingClient();
      
      // Delete from the database
      const { error } = await supabase
        .from('bouquet_media')
        .delete()
        .eq('id', mediaId);

      if (error) {
        console.error('Error deleting media:', error);
        throw error;
      }

      // Remove from local state if database deletion was successful
      setBouquet(prev => ({
        ...prev,
        media: prev.media.filter(m => m.id !== mediaId)
      }));
    } catch (err) {
      console.error('Failed to delete media:', err);
      alert('Failed to delete media. Please try again.');
    }
  };
  
  // Set a media item as the thumbnail
  const setMediaAsThumbnail = (mediaId: string) => {
    const updatedMedia = bouquet.media.map(media => ({
      ...media,
      is_thumbnail: media.id === mediaId
    }));
    
    setBouquet(prev => ({
      ...prev,
      media: updatedMedia
    }));
  };
  
  const handleThumbnailChange = (thumbnailUrl: string, thumbnailPath: string) => {
    // Instead of setting non-existent columns on the bouquet, we'll just 
    // keep track of which media item is the thumbnail in the media array
    const updatedMedia = bouquet.media.map(media => ({
      ...media,
      is_thumbnail: media.file_path === thumbnailPath
    }));
    
    setBouquet(prev => ({
      ...prev,
      media: updatedMedia
    }));
  };
  
  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    
    // Validate that if there are videos, there's at least one image set as a thumbnail
    const hasVideos = bouquet.media.some(media => media.media_type === 'video');
    const hasThumbnail = bouquet.media.some(media => media.media_type === 'image' && media.is_thumbnail);
    
    if (hasVideos && !hasThumbnail) {
      setError('You must set at least one photo as a thumbnail when you have videos. Photos are used as thumbnails for videos.');
      setSubmitting(false);
      return;
    }
    
    const startTime = logger.request('PUT', `bouquet/${bouquetId}`);
    
    try {
      const supabase = createLoggingClient();
      
      // Process thumbnail selection - find the media item marked as thumbnail
      const thumbnailMedia = bouquet.media.find(media => media.is_thumbnail);
      
      // Get the appropriate thumbnail URL
      let thumbnailUrl = null;
      if (thumbnailMedia) {
        // Use URL in order of preference
        if (thumbnailMedia.file_url && thumbnailMedia.file_url.startsWith('http')) {
          thumbnailUrl = thumbnailMedia.file_url;
        } else if (thumbnailMedia.url && thumbnailMedia.url.startsWith('http')) {
          thumbnailUrl = thumbnailMedia.url;
        }
      }

      // Update the bouquet
      const { error } = await supabase
        .from('bouquets')
        .update({
          name: bouquet.name,
          price: parseFloat(bouquet.price),
          discount_price: bouquet.discount_price ? parseFloat(bouquet.discount_price) : null,
          description: bouquet.description,
          category_id: bouquet.category_id || null,
          in_stock: bouquet.in_stock,
          featured: bouquet.featured,
          updated_at: new Date().toISOString()
        })
        .eq('id', bouquetId);

      if (error) throw error;
      
      // Handle thumbnails in bouquet_media table
      if (thumbnailMedia) {
        // First update the selected thumbnail
        const { error: thumbnailError } = await supabase
          .from('bouquet_media')
          .update({ is_thumbnail: true, file_url: thumbnailUrl })
          .eq('id', thumbnailMedia.id);
        
        if (thumbnailError) {
          console.error('Error updating thumbnail status:', thumbnailError);
        }
        
        // Set other media items as non-thumbnail
        const { error: resetThumbnailsError } = await supabase
          .from('bouquet_media')
          .update({ is_thumbnail: false })
          .neq('id', thumbnailMedia.id)
          .eq('bouquet_id', bouquetId);
        
        if (resetThumbnailsError) {
          console.error('Error resetting thumbnail status:', resetThumbnailsError);
        }
      }

      // Also insert any media items that are still marked with temporary IDs
      const tempMedia = bouquet.media.filter(m => m.id.startsWith('new-') || m.id.startsWith('temp-'));

      if (tempMedia.length > 0) {
        // Format the media items for database insertion
        const mediaToInsert = tempMedia.map(m => ({
          bouquet_id: bouquetId,
          media_type: m.media_type,
          file_path: m.file_path,
          file_url: m.file_url || m.url,
          file_name: m.file_name,
          file_size: m.file_size,
          content_type: m.content_type,
          display_order: m.display_order,
          is_thumbnail: m.is_thumbnail
        }));

        const { error: mediaError } = await supabase
          .from('bouquet_media')
          .insert(mediaToInsert);

        if (mediaError) {
          console.error('Error inserting media:', mediaError);
        }
      }
      
      // Handle bouquet flowers
      // First, get existing associations from DB to find what needs updating/deleting
      const { data: existingAssociations, error: associationsError } = await supabase
        .from('bouquet_flowers')
        .select('id, flower_id')
        .eq('bouquet_id', bouquetId);
        
      if (associationsError) {
        console.error('Error fetching bouquet flowers:', associationsError);
      } else {
        // Create a map of existing associations for easy lookup
        const existingMap = new Map();
        existingAssociations?.forEach(item => {
          existingMap.set(item.id, item.flower_id);
        });
        
        // Find items to update, add, and delete
        const itemsToUpdate: any[] = [];
        const itemsToAdd: any[] = [];
        const idsToDelete: string[] = [];
        
        // Check current flowers against existing ones
        bouquet.flowers.forEach(flower => {
          if (flower.id.startsWith('temp-')) {
            // This is a new flower association
            itemsToAdd.push({
              bouquet_id: bouquetId,
              flower_id: flower.flower_id,
              quantity: flower.quantity
            });
          } else if (existingMap.has(flower.id)) {
            // This is an existing association that might need updating
            itemsToUpdate.push({
              id: flower.id,
              quantity: flower.quantity
            });
            // Remove from map to mark as processed
            existingMap.delete(flower.id);
          }
        });
        
        // Any items left in the map need to be deleted
        existingMap.forEach((_, id) => {
          idsToDelete.push(id);
        });
        
        // Execute the database operations
        // 1. Add new associations
        if (itemsToAdd.length > 0) {
          const { error: addError } = await supabase
            .from('bouquet_flowers')
            .insert(itemsToAdd);
            
          if (addError) {
            console.error('Error adding bouquet flowers:', addError);
          }
        }
        
        // 2. Update existing associations
        for (const item of itemsToUpdate) {
          const { error: updateError } = await supabase
            .from('bouquet_flowers')
            .update({ quantity: item.quantity })
            .eq('id', item.id);
            
          if (updateError) {
            console.error('Error updating bouquet flower:', updateError);
          }
        }
        
        // 3. Delete removed associations
        if (idsToDelete.length > 0) {
          const { error: deleteError } = await supabase
            .from('bouquet_flowers')
            .delete()
            .in('id', idsToDelete);
            
          if (deleteError) {
            console.error('Error deleting bouquet flowers:', deleteError);
          }
        }
      }
      
      logger.response('PUT', `bouquet/${bouquetId}`, 200, startTime);
      alert('Bouquet updated successfully');
      router.push(`/${locale}/admin/bouquets`);
      
    } catch (err) {
      logger.error('PUT', `bouquet/${bouquetId}`, err);
      console.error('Error updating bouquet:', err);
      setError('Error updating bouquet. Please try again.');
      setSubmitting(false);
    }
  };
  
  return {
    submitting,
    handleChange,
    handleSubmit,
    addFlower,
    updateFlowerQuantity,
    removeFlower,
    handleMediaChange,
    handleThumbnailChange,
    deleteMedia,
    setMediaAsThumbnail
  };
} 
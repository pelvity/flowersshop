'use client';

import { BouquetMedia, Bouquet } from "@/lib/supabase";
import Image from "next/image";
import { useState, useRef } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { getFileUrl } from "@/utils/cloudflare-worker";
import { NextResponse } from 'next/server';
import { createLoggingClient } from '@/utils/supabase-logger';
import { ApiLogger } from '@/utils/api-logger';
import { toUUID } from '@/utils/uuid';
import { invalidateCacheKey, invalidateByPattern } from '@/lib/redis';

// Create an API logger for bouquet detail endpoints
const logger = new ApiLogger('BouquetDetailAPI');

// Helper function to invalidate bouquet cache
async function invalidateBouquetCache(bouquetId: string) {
  try {
    // Delete specific bouquet cache
    await invalidateCacheKey(`bouquet:${bouquetId}`);
    
    // Delete list caches that might contain this bouquet
    await invalidateByPattern('bouquets:*');
    
    // Delete featured bouquets cache if exists
    await invalidateCacheKey('featured:bouquets');
    
    // Delete category bouquets cache if exists
    await invalidateByPattern('category:*:bouquets');
  } catch (error) {
    logger.error('CACHE', `Failed to invalidate cache for bouquet: ${bouquetId}`, error);
    // Don't throw error, just log it - we don't want cache issues to break the main flow
  }
}

// Get a valid URL for the image
export const getValidImageUrl = (mediaItem: BouquetMedia) => {
  if (!mediaItem) {
    return "";
  }
  
  if (mediaItem.file_url) {
    return mediaItem.file_url;
  }
  
  if (mediaItem.file_path) {
    const url = `/storage/bouquets/${mediaItem.file_path}`;
    return url;
  }
  
  return "";
};

// Get a video poster/thumbnail (first frame)
export const getVideoPoster = (mediaItem: BouquetMedia) => {
  // If this is not a video, return the regular image URL
  if (mediaItem.media_type !== 'video') {
    return getValidImageUrl(mediaItem);
  }
  
  // For videos, use our thumbnail API
  if (mediaItem.id) {
    return `/api/media/thumbnail?id=${mediaItem.id}`;
  }
  
  // Fallback to the regular URL
  return getValidImageUrl(mediaItem);
};

// Lightbox component for displaying enlarged images
export function Lightbox({ bouquet, onClose, initialIndex = 0 }: { bouquet: Bouquet; onClose: () => void; initialIndex?: number }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const media = bouquet.media || [];

  const nextImage = () => {
    setCurrentIndex(prev => (prev === media.length - 1 ? 0 : prev + 1));
  };

  const prevImage = () => {
    setCurrentIndex(prev => (prev === 0 ? media.length - 1 : prev - 1));
  };

  const currentMedia = media[currentIndex];
  if (!currentMedia) return null;
  
  // Check if the current media is a video
  const isVideo = currentMedia.media_type === 'video';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <button className="absolute top-4 right-4 text-white hover:text-pink-300 transition-colors z-50" onClick={onClose}>
        <X size={32} />
      </button>

      {media.length > 1 && (
        <>
          <button 
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/70 rounded-full p-2 hover:bg-white text-pink-600 shadow-lg z-50"
            onClick={(e) => { e.stopPropagation(); prevImage(); }}
          >
            <ChevronLeft size={28} />
          </button>
          <button 
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/70 rounded-full p-2 hover:bg-white text-pink-600 shadow-lg z-50"
            onClick={(e) => { e.stopPropagation(); nextImage(); }}
          >
            <ChevronRight size={28} />
          </button>
        </>
      )}
      
      <div className="relative w-full h-full max-w-4xl max-h-[90vh]" onClick={e => e.stopPropagation()}>
        {isVideo ? (
          <video
            src={getValidImageUrl(currentMedia)}
            className="w-full h-full max-w-full max-h-full object-contain rounded-lg"
            controls
            autoPlay
            controlsList="nodownload"
            poster={getValidImageUrl(currentMedia)}
          >
            Your browser does not support HTML5 video.
          </video>
        ) : (
          <Image
            src={getValidImageUrl(currentMedia)}
            alt={bouquet.name}
            layout="fill"
            objectFit="contain"
            className="rounded-lg"
          />
        )}
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 rounded-full px-3 py-1 text-white text-sm">
        {currentIndex + 1} / {media.length}
      </div>
    </div>
  );
}

// BouquetMediaGallery component for displaying bouquet images in a carousel
interface BouquetMediaGalleryProps {
  media: BouquetMedia[];
  alt: string;
  onImageClick: (event: React.MouseEvent<HTMLDivElement>) => void;
  height?: string; // Optional height prop
}

export function BouquetMediaGallery({ media, alt, onImageClick, height = "h-48" }: BouquetMediaGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  if (!media || media.length === 0) {
    return (
      <div 
        className={`relative w-full ${height} overflow-hidden group cursor-pointer bg-gray-100 flex items-center justify-center`} 
        onClick={onImageClick}
      >
        <div className="w-full h-full transition-transform duration-300 group-hover:scale-105">
           {/* No image component here, just a placeholder background */}
        </div>
      </div>
    );
  }
  
  if (media.length === 1) {
    const isVideo = media[0].media_type === 'video';
    
    return (
      <div className={`relative w-full ${height} overflow-hidden group cursor-pointer`} onClick={onImageClick}>
        <div className="relative w-full h-full transition-transform duration-300 group-hover:scale-105">
          <Image 
            src={isVideo ? getVideoPoster(media[0]) : getValidImageUrl(media[0])}
            alt={alt || media[0].file_name || "Bouquet image"}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={true}
          />
          {isVideo && (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="bg-black/50 rounded-full p-4 shadow-lg transform transition-transform group-hover:scale-110">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="white" stroke="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
              </div>
              
              <div className="mt-2 bg-black/70 px-3 py-1 rounded-full text-white text-xs font-medium">
                Video
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
  
  return (
    <div className={`relative w-full ${height} overflow-hidden group`}>
      <div 
        className="relative w-full h-full cursor-pointer transition-transform duration-300 group-hover:scale-105" 
        onClick={onImageClick}
      >
        <div className="relative w-full h-full">
          <Image 
            src={media[currentIndex].media_type === 'video' 
              ? getVideoPoster(media[currentIndex]) 
              : getValidImageUrl(media[currentIndex])}
            alt={alt || media[currentIndex].file_name || "Bouquet image"}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={true}
          />
          
          {media[currentIndex].media_type === 'video' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="bg-black/50 rounded-full p-4 shadow-lg transform transition-transform group-hover:scale-110">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="white" stroke="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
              </div>
              
              <div className="mt-2 bg-black/70 px-3 py-1 rounded-full text-white text-xs font-medium">
                Video
              </div>
            </div>
          )}
        </div>
      </div>
      
      <button 
        className="absolute left-1 top-1/2 -translate-y-1/2 bg-white/70 rounded-full p-1.5 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-md"
        onClick={(e) => {
          e.stopPropagation();
          setCurrentIndex(prev => (prev === 0 ? media.length - 1 : prev - 1));
        }}
      >
        <ChevronLeft size={18} className="text-pink-600" />
      </button>
      <button 
        className="absolute right-1 top-1/2 -translate-y-1/2 bg-white/70 rounded-full p-1.5 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-md"
        onClick={(e) => {
          e.stopPropagation();
          setCurrentIndex(prev => (prev === media.length - 1 ? 0 : prev + 1));
        }}
      >
        <ChevronRight size={18} className="text-pink-600" />
      </button>
      
      <div 
        ref={scrollContainerRef}
        className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 overflow-x-auto py-1.5 px-3 bg-white/70 rounded-full max-w-[80%] no-scrollbar opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      >
        {media.map((item, idx) => (
          <div 
            key={item.id} 
            className={`w-7 h-7 rounded-full flex-shrink-0 border-2 cursor-pointer transition-all duration-200 ${
              idx === currentIndex ? 'border-pink-500 scale-110' : 'border-white/50 hover:border-pink-200'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex(idx);
            }}
          >
            <div className="relative w-full h-full">
              <Image 
                src={item.media_type === 'video' ? getVideoPoster(item) : getValidImageUrl(item)}
                alt={`Thumbnail ${idx + 1}`}
                width={28}
                height={28}
                className="rounded-full object-cover w-full h-full"
              />
              {item.media_type === 'video' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="white" stroke="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                  </svg>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="absolute bottom-2 right-2 bg-black/60 rounded-full px-2 py-0.5 text-white text-xs shadow-sm">
        {currentIndex + 1}/{media.length}
      </div>
    </div>
  );
} 
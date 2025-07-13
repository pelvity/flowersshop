'use client';

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { getFileUrl } from "@/utils/cloudflare-worker";
import { MediaItem } from '@/components/admin/shared/MediaUploader';

// Helper function to get a valid image URL
export const getValidImageUrl = (mediaItem: MediaItem | null) => {
  if (!mediaItem) return "/placeholder.jpg";
  if (mediaItem.file_url) return mediaItem.file_url;
  if (mediaItem.file_path) return getFileUrl(mediaItem.file_path);
  return "/placeholder.jpg";
};

// Category type for the lightbox
export interface Category {
  id: string;
  name: string;
  description?: string;
  media?: MediaItem[];
  thumbnail_url?: string;
}

// Lightbox component for displaying enlarged category images
export function Lightbox({ category, onClose, initialIndex = 0 }: { 
  category: Category; 
  onClose: () => void; 
  initialIndex?: number 
}) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const media = category.media || [];

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
            alt={category.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-contain rounded-lg"
          />
        )}
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 rounded-full px-3 py-1 text-white text-sm">
        {currentIndex + 1} / {media.length}
      </div>
    </div>
  );
} 
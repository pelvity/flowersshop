'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { BouquetMedia } from '@/lib/supabase';
import { getValidImageUrl } from '@/components/bouquets/bouquet-media-gallery';

interface HeroCarouselProps {
  media: BouquetMedia[];
}

// Default sample images to use when no media is available
const DEFAULT_IMAGES = [
  '/images/flowers/sample-1.jpg',
  '/images/flowers/sample-2.jpg',
  '/images/flowers/sample-3.jpg'
];

export default function HeroCarousel({ media = [] }: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [previousIndex, setPreviousIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  
  // Determine if we should use default images or actual media
  const useDefaultImages = !media || media.length === 0;
  const displayMedia = useDefaultImages ? DEFAULT_IMAGES : media;

  console.log('Carousel mounted/updated', { 
    mediaCount: displayMedia.length, 
    currentIndex, 
    isUsingDefaultImages: useDefaultImages 
  });

  // Auto-advance the carousel every 5 seconds
  useEffect(() => {
    if (displayMedia.length <= 1) {
      // console.log('Auto-advance disabled: only one image available');
      return;
    }
    
    console.log('Setting up auto-advance timer');
    const interval = setInterval(() => {
      // console.log('Auto-advance timer triggered, calling goToNext()');
      goToNext();
    }, 5000);
    
    return () => {
      console.log('Clearing auto-advance timer');
      clearInterval(interval);
    };
  }, [currentIndex, displayMedia.length]);

  const goToNext = useCallback(() => {
    // console.log('goToNext called', { currentIndex, mediaLength: displayMedia.length, isTransitioning });
    
    if (isTransitioning || displayMedia.length <= 1) {
      // console.log('Cannot go to next: transitioning or only one image');
      return;
    }
    
    setIsTransitioning(true);
    setFadeOut(true);
    setPreviousIndex(currentIndex);
    
    const nextIndex = currentIndex === displayMedia.length - 1 ? 0 : currentIndex + 1;
    console.log('Will transition to index', nextIndex);
    
    // Wait for fade out, then change image and fade in
    setTimeout(() => {
      console.log('Setting new currentIndex', nextIndex);
      setCurrentIndex(nextIndex);
      setFadeOut(false);
    }, 350);
    
    // Reset transition state after animation completes
    setTimeout(() => {
      console.log('Transition complete, resetting transition state');
      setIsTransitioning(false);
    }, 700);
  }, [isTransitioning, currentIndex, displayMedia.length]);

  const goToPrev = useCallback(() => {
    console.log('goToPrev called', { currentIndex, mediaLength: displayMedia.length, isTransitioning });
    
    if (isTransitioning || displayMedia.length <= 1) {
      console.log('Cannot go to prev: transitioning or only one image');
      return;
    }
    
    setIsTransitioning(true);
    setFadeOut(true);
    setPreviousIndex(currentIndex);
    
    const prevIndex = currentIndex === 0 ? displayMedia.length - 1 : currentIndex - 1;
    console.log('Will transition to index', prevIndex);
    
    // Wait for fade out, then change image and fade in
    setTimeout(() => {
      console.log('Setting new currentIndex', prevIndex);
      setCurrentIndex(prevIndex);
      setFadeOut(false);
    }, 350);
    
    // Reset transition state after animation completes
    setTimeout(() => {
      console.log('Transition complete, resetting transition state');
      setIsTransitioning(false);
    }, 700);
  }, [isTransitioning, currentIndex, displayMedia.length]);

  const goToSlide = useCallback((index: number) => {
    console.log('goToSlide called', { requestedIndex: index, currentIndex, isTransitioning });
    
    if (isTransitioning || index === currentIndex) {
      console.log('Cannot go to slide: transitioning or same index');
      return;
    }
    
    setIsTransitioning(true);
    setFadeOut(true);
    setPreviousIndex(currentIndex);
    
    // Wait for fade out, then change image and fade in
    setTimeout(() => {
      console.log('Setting new currentIndex', index);
      setCurrentIndex(index);
      setFadeOut(false);
    }, 350);
    
    // Reset transition state after animation completes
    setTimeout(() => {
      console.log('Transition complete, resetting transition state');
      setIsTransitioning(false);
    }, 700);
  }, [isTransitioning, currentIndex]);

  // Make sure currentIndex is valid
  const safeCurrentIndex = Math.min(currentIndex, displayMedia.length - 1);
  const safePreviousIndex = Math.min(previousIndex, displayMedia.length - 1);
  
  console.log('Rendering carousel', { 
    safeCurrentIndex, 
    safePreviousIndex, 
    isTransitioning, 
    fadeOut, 
    displayingImageIndex: isTransitioning && fadeOut ? safePreviousIndex : safeCurrentIndex 
  });
  
  // If we're still showing a placeholder despite our efforts
  if (displayMedia.length === 0) {
    console.log('No images available, showing placeholder');
    return (
      <div className="relative h-56 w-full sm:h-72 md:h-96 lg:w-full lg:h-full bg-gradient-to-r from-pink-100 to-pink-50 flex items-center justify-center">
        <span className="text-pink-400 font-medium">Beautiful flower arrangements</span>
      </div>
    );
  }

  // Determine which image to show based on transition state
  const imageIndex = isTransitioning && fadeOut ? safePreviousIndex : safeCurrentIndex;

  return (
    <div className="relative h-56 w-full sm:h-72 md:h-96 lg:w-full lg:h-full overflow-hidden">
      {/* Image with fade animation */}
      <div 
        className="absolute inset-0 transition-opacity duration-700 ease-in-out"
        style={{ opacity: fadeOut ? 0 : 1 }}
      >
        {useDefaultImages ? (
          <Image
            src={displayMedia[imageIndex] as string}
            alt={`Flower arrangement ${imageIndex + 1}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        ) : (
          <Image
            src={getValidImageUrl(displayMedia[imageIndex] as BouquetMedia)}
            alt={`Bouquet image ${imageIndex + 1}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        )}
      </div>

      {/* Navigation arrows - only show if more than one image */}
      {displayMedia.length > 1 && (
        <>
          <button 
            onClick={goToPrev}
            disabled={isTransitioning}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/70 rounded-full p-2 hover:bg-white text-pink-600 shadow-lg z-10 transition-opacity duration-300 opacity-70 hover:opacity-100"
            aria-label="Previous image"
          >
            <ChevronLeft size={24} />
          </button>
          <button 
            onClick={goToNext}
            disabled={isTransitioning}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/70 rounded-full p-2 hover:bg-white text-pink-600 shadow-lg z-10 transition-opacity duration-300 opacity-70 hover:opacity-100"
            aria-label="Next image"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}

      {/* Indicator dots */}
      {displayMedia.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
          {displayMedia.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                safeCurrentIndex === index 
                  ? 'bg-white scale-110 shadow-sm' 
                  : 'bg-white/50 hover:bg-white/70'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Overlay gradient for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent pointer-events-none" />
    </div>
  );
} 
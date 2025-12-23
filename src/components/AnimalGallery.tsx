import React, { useState } from 'react';
import { UnsplashImage } from '../types/animal';
import { FALLBACK_IMAGE } from '../utils/constants';

interface AnimalGalleryProps {
  images: UnsplashImage[];
  animalName: string;
}

export default function AnimalGallery({ images, animalName }: AnimalGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Debug logging
  if (import.meta.env.DEV) {
    console.log('[AnimalGallery] Images:', images, 'Animal:', animalName);
  }

  if (!images || images.length === 0) {
    if (import.meta.env.DEV) {
      console.warn('[AnimalGallery] No images found for:', animalName);
    }
    return (
      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-12 text-center">
        <div className="text-gray-500 dark:text-gray-400">
          <p className="text-lg mb-2">No images available</p>
          <p className="text-sm">{animalName}</p>
        </div>
      </div>
    );
  }

  const currentImage = images[currentIndex];
  
  if (import.meta.env.DEV) {
    console.log('[AnimalGallery] Current image URLs:', currentImage.urls);
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const goToImage = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <>
      <div className="space-y-4">
        {/* Main Image */}
        <div className="relative bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden group flex items-center justify-center min-h-96">
          <img
            src={currentImage.urls.regular}
            alt={currentImage.alt_description || animalName}
            className="max-w-full max-h-96 object-contain cursor-pointer"
            loading="lazy"
            onClick={() => setIsFullscreen(true)}
            onError={(e) => {
              // Try small size if regular fails
              if (currentImage.urls.small && (e.target as HTMLImageElement).src !== currentImage.urls.small) {
                (e.target as HTMLImageElement).src = currentImage.urls.small;
              } else {
                (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
              }
            }}
          />

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Previous image"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>

              <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Next image"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </>
          )}

          {/* Fullscreen Button */}
          <button
            onClick={() => setIsFullscreen(true)}
            className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Fullscreen"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
              />
            </svg>
          </button>

          {/* Image Counter */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
              {currentIndex + 1} / {images.length}
            </div>
          )}
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="grid grid-cols-6 gap-2">
            {images.map((image, index) => (
              <button
                key={image.id}
                onClick={() => goToImage(index)}
                className={`relative aspect-square rounded-lg overflow-hidden transition-all ${
                  index === currentIndex
                    ? 'ring-2 ring-primary-600 opacity-100'
                    : 'opacity-60 hover:opacity-100'
                }`}
              >
                <img
                  src={image.urls.thumb}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
                  }}
                />
              </button>
            ))}
          </div>
        )}

        {/* Photo Credit */}
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Photo by{' '}
          <a
            href={`https://unsplash.com/@${currentImage.user.username}?utm_source=animal-atlas&utm_medium=referral`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-600 hover:underline"
          >
            {currentImage.user.name}
          </a>{' '}
          on{' '}
          <a
            href="https://unsplash.com?utm_source=animal-atlas&utm_medium=referral"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-600 hover:underline"
          >
            Unsplash
          </a>
        </div>
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div
          className="fixed inset-0 z-50 bg-black flex items-center justify-center"
          onClick={() => setIsFullscreen(false)}
        >
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-4 right-4 text-white p-2 hover:bg-white/10 rounded-full transition-colors"
            aria-label="Close fullscreen"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrevious();
                }}
                className="absolute left-4 text-white p-3 hover:bg-white/10 rounded-full transition-colors"
                aria-label="Previous image"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToNext();
                }}
                className="absolute right-4 text-white p-3 hover:bg-white/10 rounded-full transition-colors"
                aria-label="Next image"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </>
          )}

          <img
            src={currentImage.urls.full}
            alt={currentImage.alt_description || animalName}
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
            onError={(e) => {
              (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
            }}
          />
        </div>
      )}
    </>
  );
}

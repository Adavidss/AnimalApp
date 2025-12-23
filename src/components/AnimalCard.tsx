import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { EnrichedAnimal } from '../types/animal';
import { CONSERVATION_STATUS, FALLBACK_IMAGE } from '../utils/constants';
import { addToFavorites, removeFromFavorites, isFavorite } from '../utils/favorites';

interface AnimalCardProps {
  animal: EnrichedAnimal;
}

export default function AnimalCard({ animal }: AnimalCardProps) {
  // Use smaller image size for faster loading in cards
  const imageUrl = animal.images[0]?.urls.small || animal.images[0]?.urls.regular || FALLBACK_IMAGE;
  const conservationStatus = animal.conservationStatus?.category;
  const status = conservationStatus ? CONSERVATION_STATUS[conservationStatus] : null;
  const [isInFavorites, setIsInFavorites] = useState(false);

  useEffect(() => {
    setIsInFavorites(isFavorite(animal.name));
  }, [animal.name]);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isInFavorites) {
      removeFromFavorites(animal.name);
    } else {
      addToFavorites(animal);
    }
    setIsInFavorites(!isInFavorites);
  };

  return (
    <Link
      to={`/animal/${encodeURIComponent(animal.name)}`}
      className="group bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden animate-fade-in"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
        <img
          src={imageUrl}
          alt={animal.name}
          className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
          }}
        />

        {/* Favorites button */}
        <button
          onClick={handleFavoriteClick}
          className="absolute top-2 left-2 p-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full hover:bg-white dark:hover:bg-gray-800 transition-colors shadow-lg z-10"
          aria-label={isInFavorites ? 'Remove from favorites' : 'Add to favorites'}
          title={isInFavorites ? 'Remove from favorites' : 'Add to favorites'}
        >
          {isInFavorites ? (
            <svg
              className="w-5 h-5 text-yellow-500 fill-current"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ) : (
            <svg
              className="w-5 h-5 text-gray-400 hover:text-yellow-500 transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
          )}
        </button>

        {/* Conservation status badge */}
        {status && (
          <div
            className={`absolute top-2 right-2 ${status.bgColor} ${status.color} px-2 py-1 rounded-full text-xs font-semibold shadow-lg`}
          >
            {status.label}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-2">
        {/* Name */}
        <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-1">
          {animal.name}
        </h3>

        {/* Scientific name */}
        {animal.taxonomy?.scientific_name && (
          <p className="text-sm text-gray-500 dark:text-gray-400 italic line-clamp-1">
            {animal.taxonomy.scientific_name}
          </p>
        )}

        {/* Description excerpt */}
        {animal.wikipedia?.extract && (
          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
            {animal.wikipedia.extract}
          </p>
        )}
      </div>
    </Link>
  );
}

/**
 * Compact animal card for featured sections
 */
export function CompactAnimalCard({ animal }: AnimalCardProps) {
  const imageUrl = animal.images[0]?.urls.small || FALLBACK_IMAGE;
  const [isInFavorites, setIsInFavorites] = useState(false);

  useEffect(() => {
    setIsInFavorites(isFavorite(animal.name));
  }, [animal.name]);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isInFavorites) {
      removeFromFavorites(animal.name);
    } else {
      addToFavorites(animal);
    }
    setIsInFavorites(!isInFavorites);
  };

  return (
    <div className="group flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-all relative">
      <Link
        to={`/animal/${encodeURIComponent(animal.name)}`}
        className="flex items-center gap-3 flex-1 min-w-0"
      >
        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0 relative">
          <img
            src={imageUrl}
            alt={animal.name}
            className="max-w-full max-h-full object-contain rounded-lg"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
            }}
          />
          {/* Favorites button for compact card */}
          <button
            onClick={handleFavoriteClick}
            className="absolute top-0 right-0 p-1 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full hover:bg-white dark:hover:bg-gray-800 transition-colors shadow-md z-10"
            aria-label={isInFavorites ? 'Remove from favorites' : 'Add to favorites'}
            title={isInFavorites ? 'Remove from favorites' : 'Add to favorites'}
          >
            {isInFavorites ? (
              <svg
                className="w-3.5 h-3.5 text-yellow-500 fill-current"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ) : (
              <svg
                className="w-3.5 h-3.5 text-gray-400 hover:text-yellow-500 transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
            )}
          </button>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors truncate">
            {animal.name}
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400 italic truncate">
            {animal.taxonomy?.scientific_name || 'Unknown species'}
          </p>
        </div>
      </Link>
    </div>
  );
}

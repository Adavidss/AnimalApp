import React from 'react';
import { Link } from 'react-router-dom';
import { EnrichedAnimal } from '../types/animal';
import { CONSERVATION_STATUS, FALLBACK_IMAGE } from '../utils/constants';

interface AnimalCardProps {
  animal: EnrichedAnimal;
}

export default function AnimalCard({ animal }: AnimalCardProps) {
  const imageUrl = animal.images[0]?.urls.regular || FALLBACK_IMAGE;
  const conservationStatus = animal.conservationStatus?.category;
  const status = conservationStatus ? CONSERVATION_STATUS[conservationStatus] : null;

  return (
    <Link
      to={`/animal/${encodeURIComponent(animal.name)}`}
      className="group bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden animate-fade-in"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={imageUrl}
          alt={animal.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
          }}
        />

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

        {/* Metadata */}
        <div className="flex flex-wrap gap-2 pt-2">
          {animal.characteristics?.habitat && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs">
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {animal.characteristics.habitat}
            </span>
          )}

          {animal.characteristics?.diet && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs">
              🍽️ {animal.characteristics.diet}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

/**
 * Compact animal card for featured sections
 */
export function CompactAnimalCard({ animal }: AnimalCardProps) {
  const imageUrl = animal.images[0]?.urls.small || FALLBACK_IMAGE;

  return (
    <Link
      to={`/animal/${encodeURIComponent(animal.name)}`}
      className="group flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-all"
    >
      <img
        src={imageUrl}
        alt={animal.name}
        className="w-16 h-16 rounded-lg object-cover"
        loading="lazy"
        onError={(e) => {
          (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
        }}
      />
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors truncate">
          {animal.name}
        </h4>
        <p className="text-sm text-gray-500 dark:text-gray-400 italic truncate">
          {animal.taxonomy?.scientific_name || 'Unknown species'}
        </p>
      </div>
    </Link>
  );
}

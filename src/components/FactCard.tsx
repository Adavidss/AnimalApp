import React from 'react';
import { AnimalFact } from '../data/animalFacts';

interface FactCardProps {
  fact: AnimalFact;
  onShuffle?: () => void;
  showCategory?: boolean;
  showAnimal?: boolean;
}

const categoryIcons: Record<string, string> = {
  anatomy: '🧬',
  behavior: '🎭',
  records: '🏆',
  surprising: '✨',
  history: '📜',
  adaptation: '🌿',
};

const categoryColors: Record<string, string> = {
  anatomy: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  behavior: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
  records: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
  surprising: 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300',
  history: 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300',
  adaptation: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
};

export default function FactCard({ fact, onShuffle, showCategory = true, showAnimal = true }: FactCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
      {/* Header with category and shuffle button */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {showCategory && (
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${categoryColors[fact.category]}`}>
              <span className="mr-1">{categoryIcons[fact.category]}</span>
              {fact.category.charAt(0).toUpperCase() + fact.category.slice(1)}
            </span>
          )}
          {showAnimal && fact.animal && (
            <a
              href={`https://en.wikipedia.org/wiki/${encodeURIComponent(fact.animal.replace(/\s+/g, '_'))}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 hover:underline font-medium transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              {fact.animal}
            </a>
          )}
        </div>
        {onShuffle && (
          <button
            onClick={onShuffle}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Shuffle fact"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Fact text */}
      <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
        {fact.fact}
      </p>

      {/* Verified badge */}
      {fact.verified && (
        <div className="mt-4 flex items-center text-sm text-green-600 dark:text-green-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Verified
        </div>
      )}
    </div>
  );
}

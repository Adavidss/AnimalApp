import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  getFavorites,
  removeFromFavorites,
  clearFavorites,
  getFavoritesByCategory,
  exportFavorites,
  FavoriteAnimal,
} from '../utils/favorites';
import { getMainCategories, getCategoryTheme } from '../utils/categories';
import { EmptyState } from '../components/ErrorState';
import { trackFavoriteForAchievements } from '../utils/achievements';

export default function Favorites() {
  const [favorites, setFavorites] = useState<FavoriteAnimal[]>([]);
  const [filteredFavorites, setFilteredFavorites] = useState<FavoriteAnimal[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'name'>('recent');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const categories = getMainCategories();

  useEffect(() => {
    loadFavorites();
    // Refresh favorites when the page becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadFavorites();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  useEffect(() => {
    filterAndSortFavorites();
  }, [favorites, selectedCategory, sortBy]);

  // Listen for storage changes to refresh favorites
  useEffect(() => {
    const handleStorageChange = () => {
      loadFavorites();
    };

    window.addEventListener('storage', handleStorageChange);
    // Poll for changes since storage events don't fire in same tab
    const interval = setInterval(() => {
      const currentFavorites = getFavorites();
      if (currentFavorites.length !== favorites.length) {
        loadFavorites();
      }
    }, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [favorites.length]);

  const loadFavorites = () => {
    const allFavorites = getFavorites();
    setFavorites(allFavorites);

    // Track achievements
    trackFavoriteForAchievements(allFavorites.length);
  };

  const filterAndSortFavorites = () => {
    let filtered = getFavoritesByCategory(selectedCategory);

    // Sort
    if (sortBy === 'recent') {
      filtered.sort((a, b) => b.addedAt - a.addedAt);
    } else {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    setFilteredFavorites(filtered);
  };

  const handleRemove = (animalName: string) => {
    removeFromFavorites(animalName);
    loadFavorites();
  };

  const handleClearAll = () => {
    clearFavorites();
    loadFavorites();
    setShowClearConfirm(false);
  };

  const handleExport = () => {
    const json = exportFavorites();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `animal-atlas-favorites-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getCategoryColor = (category: string) => {
    const theme = getCategoryTheme(category as any);
    return theme.primaryColor;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Favorites Grid - Moved to top */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Header - Compact */}
            <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <span>⭐</span>
                  Your Favorites
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {favorites.length} animal{favorites.length !== 1 ? 's' : ''} saved
                </p>
              </div>
              {favorites.length > 0 && (
                <div className="flex gap-2">
                  <button
                    onClick={handleExport}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2 text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                    Export
                  </button>
                  <button
                    onClick={() => setShowClearConfirm(true)}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2 text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    Clear All
                  </button>
                </div>
              )}
            </div>

            {/* Filters - Compact */}
            {favorites.length > 0 && (
              <div className="mb-6 space-y-3 bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Filter by Category
                  </label>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    <button
                      onClick={() => setSelectedCategory('all')}
                      className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                        selectedCategory === 'all'
                          ? 'bg-yellow-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      All ({favorites.length})
                    </button>
                    {categories.map((category) => {
                      const count = favorites.filter((f) => f.category === category.id).length;
                      if (count === 0) return null;
                      return (
                        <button
                          key={category.id}
                          onClick={() => setSelectedCategory(category.id)}
                          className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${
                            selectedCategory === category.id
                              ? 'bg-yellow-600 text-white'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                        >
                          <span>{category.emoji}</span>
                          {category.name} ({count})
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Sort by
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSortBy('recent')}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        sortBy === 'recent'
                          ? 'bg-yellow-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      Most Recent
                    </button>
                    <button
                      onClick={() => setSortBy('name')}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        sortBy === 'name'
                          ? 'bg-yellow-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      Name (A-Z)
                    </button>
                  </div>
                </div>
              </div>
            )}

            {filteredFavorites.length === 0 ? (
              <EmptyState
                title={favorites.length === 0 ? 'No favorites yet' : 'No animals in this category'}
                message={
                  favorites.length === 0
                    ? 'Start exploring and save your favorite animals'
                    : 'Try selecting a different category'
                }
                action={
                  favorites.length === 0 ? (
                    <Link
                      to="/explorer"
                      className="px-6 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-medium rounded-lg transition-colors"
                    >
                      Explore Animals
                    </Link>
                  ) : undefined
                }
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredFavorites.map((favorite) => (
                  <Link
                    key={favorite.id}
                    to={`/animal/${encodeURIComponent(favorite.name)}`}
                    className="group bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden block cursor-pointer"
                  >
                    {/* Image */}
                    <div className="relative h-48 bg-gray-200 dark:bg-gray-700 overflow-hidden flex items-center justify-center">
                      {favorite.imageUrl ? (
                        <img
                          src={favorite.imageUrl}
                          alt={favorite.name}
                          className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-6xl">
                          🦁
                        </div>
                      )}

                      {/* Category Badge */}
                      <div
                        className="absolute top-4 right-4 px-3 py-1 text-white text-xs font-medium rounded-full"
                        style={{ backgroundColor: getCategoryColor(favorite.category) }}
                      >
                        {favorite.category}
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleRemove(favorite.name);
                        }}
                        className="absolute top-4 left-4 p-2 bg-red-600 hover:bg-red-700 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        title="Remove from favorites"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-3">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                          {favorite.name}
                        </h3>
                        {favorite.scientificName && (
                          <p className="text-sm italic text-gray-600 dark:text-gray-400">
                            {favorite.scientificName}
                          </p>
                        )}
                      </div>

                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        Added {new Date(favorite.addedAt).toLocaleDateString()}
                      </p>

                      <div className="mt-4 text-center px-4 py-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 font-medium rounded-lg">
                        View Details →
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Clear All Favorites?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              This will remove all {favorites.length} animal{favorites.length !== 1 ? 's' : ''} from your favorites. This action cannot be undone.
            </p>
            <div className="flex gap-4">
              <button
                onClick={handleClearAll}
                className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
              >
                Clear All
              </button>
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

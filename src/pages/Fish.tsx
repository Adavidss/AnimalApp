import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { searchFishSpecies, getFishPictureUrl, FishSpecies } from '../api/fishbase';
import { searchINatSpecies, INatTaxon } from '../api/inaturalist';
import { getCategoryTheme } from '../utils/categories';
import Loader from '../components/Loader';
import { EmptyState } from '../components/ErrorState';

export default function Fish() {
  const [fishSpecies, setFishSpecies] = useState<INatTaxon[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [initialLoaded, setInitialLoaded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const categoryTheme = getCategoryTheme('fish');
  const PER_PAGE = 30;

  useEffect(() => {
    loadFishByPage();
  }, [currentPage]);

  const loadFishByPage = async () => {
    setLoading(true);
    try {
      const results = await searchINatSpecies('actinopterygii', currentPage, PER_PAGE);
      setFishSpecies(results);
      setHasMore(results.length === PER_PAGE);
      setInitialLoaded(true);
    } catch (error) {
      console.error('Error loading fish by page:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setCurrentPage(1);
      loadFishByPage();
      return;
    }

    setLoading(true);
    try {
      const results = await searchINatSpecies(searchQuery + ' fish', 1, PER_PAGE);
      setFishSpecies(results);
      setCurrentPage(1);
      setHasMore(results.length === PER_PAGE);
    } catch (error) {
      console.error('Error searching fish:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNextPage = () => {
    if (hasMore && !loading) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1 && !loading) {
      setCurrentPage(prev => prev - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <section
        className="py-16 bg-gradient-to-br"
        style={{
          backgroundImage: `linear-gradient(to bottom right, ${categoryTheme.primaryColor}20, ${categoryTheme.accentColor}20)`
        }}
      >
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="text-6xl">{categoryTheme.emoji}</div>
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white">
              {categoryTheme.name}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              {categoryTheme.description}
            </p>
            <div className="px-6 py-3 bg-white dark:bg-gray-800 rounded-lg shadow-md inline-block">
              <div className="text-2xl font-bold" style={{ color: categoryTheme.primaryColor }}>
                {fishSpecies.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Species Found</div>
            </div>
          </div>
        </div>
      </section>

      {/* Search */}
      <section className="py-8 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-16 z-30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search fish species (e.g., tuna, salmon, shark)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full px-4 py-3 pl-12 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 dark:text-white"
                />
                <svg
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <button
                onClick={handleSearch}
                disabled={loading}
                className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                Search
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Species Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader />
              </div>
            ) : fishSpecies.length === 0 ? (
              <EmptyState
                title="No fish species found"
                message="Try searching for popular fish like tuna, salmon, or bass"
                action={
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setCurrentPage(1);
                      loadFishByPage();
                    }}
                    className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Reload Fish
                  </button>
                }
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {fishSpecies.map((fish, index) => (
                    <div
                      key={fish.id || index}
                      className="group bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:scale-105"
                    >
                      <div className="relative h-48 bg-gradient-to-br from-teal-100 to-blue-100 dark:from-teal-900/30 dark:to-blue-900/30 overflow-hidden">
                        {fish.default_photo?.medium_url ? (
                          <img
                            src={fish.default_photo.medium_url}
                            alt={fish.preferred_common_name || fish.name}
                            className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-300"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              const parent = e.currentTarget.parentElement;
                              if (parent) {
                                parent.innerHTML = '<div class="w-full h-full flex items-center justify-center text-8xl">🐟</div>';
                              }
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-8xl">
                            🐟
                          </div>
                        )}
                        {fish.rank && (
                          <div className="absolute top-4 right-4 px-3 py-1 bg-teal-600 text-white text-xs font-medium rounded-full capitalize">
                            {fish.rank}
                          </div>
                        )}
                      </div>

                      <div className="p-6 space-y-3">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                          {fish.preferred_common_name || fish.name}
                        </h3>
                        {fish.name && fish.name !== fish.preferred_common_name && (
                          <p className="text-sm italic text-gray-600 dark:text-gray-400">
                            {fish.name}
                          </p>
                        )}

                        {fish.conservation_status && (
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            <span className="font-semibold">Status:</span> {fish.conservation_status.status_name}
                          </p>
                        )}

                        {fish.wikipedia_url && (
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            <span className="font-semibold">Type:</span> {fish.iconic_taxon_name}
                          </p>
                        )}

                        <Link
                          to={`/animal/${encodeURIComponent(fish.preferred_common_name || fish.name)}`}
                          className="block mt-4 text-center px-4 py-2 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 font-medium rounded-lg hover:bg-teal-200 dark:hover:bg-teal-900/50 transition-colors"
                        >
                          Learn More →
                        </Link>
                      </div>
                    </div>
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {!loading && fishSpecies.length > 0 && (
              <div className="mt-8 flex items-center justify-center gap-4">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </button>

                <div className="px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                  <span className="text-gray-900 dark:text-white font-medium">
                    Page {currentPage}
                  </span>
                </div>

                <button
                  onClick={handleNextPage}
                  disabled={!hasMore}
                  className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  Next
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

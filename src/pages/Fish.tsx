import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { searchINatSpecies, INatTaxon } from '../api/inaturalist';
import { getCategoryTheme } from '../utils/categories';
import Loader from '../components/Loader';
import { EmptyState } from '../components/ErrorState';
import { addToFavorites, removeFromFavorites, isFavorite } from '../utils/favorites';
import Pagination from '../components/Pagination';
import { getAutocompleteSuggestions } from '../utils/searchHelpers';
import { addToRecentSearches } from '../utils/cache';

export default function Fish() {
  const [fishSpecies, setFishSpecies] = useState<INatTaxon[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [_initialLoaded, setInitialLoaded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const categoryTheme = getCategoryTheme('fish');
  const PER_PAGE = 10;
  const [allFishSpecies, setAllFishSpecies] = useState<INatTaxon[]>([]);

  useEffect(() => {
    loadFishByPage();
  }, [currentPage]);

  const loadFishByPage = async () => {
    setLoading(true);
    try {
      const results = await searchINatSpecies('actinopterygii', currentPage, PER_PAGE);
      if (currentPage === 1) {
        setAllFishSpecies(results);
      } else {
        // Append new results to existing ones
        setAllFishSpecies(prev => [...prev, ...results]);
      }
      setFishSpecies(results);
      setHasMore(results.length === PER_PAGE);
      setInitialLoaded(true);
    } catch (error) {
      console.error('Error loading fish by page:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Update suggestions when query changes
    if (searchQuery.trim().length > 1) {
      setSuggestions(getAutocompleteSuggestions(searchQuery.trim(), 5));
    } else {
      setSuggestions([]);
    }
  }, [searchQuery]);

  useEffect(() => {
    // Close suggestions when clicking outside
    function handleClickOutside(event: MouseEvent) {
      if (
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setCurrentPage(1);
      setAllFishSpecies([]);
      loadFishByPage();
      return;
    }

    addToRecentSearches(searchQuery.trim());
    setLoading(true);
    setShowSuggestions(false);
    setCurrentPage(1);
    try {
      const results = await searchINatSpecies(searchQuery + ' fish', 1, PER_PAGE);
      setFishSpecies(results);
      setAllFishSpecies(results);
      setHasMore(results.length === PER_PAGE);
    } catch (error) {
      console.error('Error searching fish:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    handleSearch();
    setShowSuggestions(false);
  };

  // For browsing (no search), show accumulated results; for search, show current page results
  const displayFish = searchQuery.trim() ? fishSpecies : allFishSpecies;
  const totalPages = searchQuery.trim() 
    ? Math.ceil((hasMore ? (currentPage * PER_PAGE) : fishSpecies.length) / PER_PAGE)
    : hasMore ? currentPage + 1 : currentPage;
  const paginatedFish = searchQuery.trim() 
    ? fishSpecies.slice(0, PER_PAGE)
    : displayFish.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

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
          </div>
        </div>
      </section>

      {/* Search */}
      <section className="py-8 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-16 z-30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex gap-4">
              <div className="flex-1 relative" ref={searchInputRef}>
                <input
                  type="text"
                  placeholder="Search fish species (e.g., tuna, salmon, shark)..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (e.target.value.length > 1) {
                      setShowSuggestions(true);
                    }
                  }}
                  onFocus={() => {
                    if (suggestions.length > 0) setShowSuggestions(true);
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch();
                      setShowSuggestions(false);
                    }
                  }}
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
                
                {/* Autocomplete Suggestions */}
                {showSuggestions && suggestions.length > 0 && (
                  <div
                    ref={suggestionsRef}
                    className="absolute z-10 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto"
                  >
                    {suggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-white"
                      >
                        {suggestion}
                      </div>
                    ))}
                  </div>
                )}
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
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedFish.map((fish, index) => (
                    <div
                      key={fish.id || index}
                      className="group bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:scale-105"
                    >
                      <div className="relative h-48 bg-gradient-to-br from-teal-100 to-blue-100 dark:from-teal-900/30 dark:to-blue-900/30 overflow-hidden flex items-center justify-center">
                        {fish.default_photo?.medium_url ? (
                          <img
                            src={fish.default_photo.medium_url}
                            alt={fish.preferred_common_name || fish.name}
                            className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
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
                        {/* Favorite Button */}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const fishName = fish.preferred_common_name || fish.name;
                            const favoriteAnimal = {
                              id: fish.id?.toString() || fishName,
                              name: fishName,
                              taxonomy: {
                                scientific_name: fish.name || ''
                              },
                              images: fish.default_photo?.medium_url ? [{
                                urls: {
                                  small: fish.default_photo.medium_url,
                                  regular: fish.default_photo.medium_url
                                }
                              }] : []
                            };
                            
                            if (isFavorite(fishName)) {
                              removeFromFavorites(fishName);
                            } else {
                              addToFavorites(favoriteAnimal as any);
                            }
                            // Trigger re-render
                            setFishSpecies([...fishSpecies]);
                          }}
                          className="absolute top-4 left-4 p-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full hover:bg-white dark:hover:bg-gray-800 transition-colors shadow-lg z-10"
                          aria-label={isFavorite(fish.preferred_common_name || fish.name) ? 'Remove from favorites' : 'Add to favorites'}
                          title={isFavorite(fish.preferred_common_name || fish.name) ? 'Remove from favorites' : 'Add to favorites'}
                        >
                          {isFavorite(fish.preferred_common_name || fish.name) ? (
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
                
                {/* Pagination */}
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={(page) => {
                    setCurrentPage(page);
                    if (!searchQuery.trim() && page > allFishSpecies.length / PER_PAGE) {
                      // Need to load more data
                      loadFishByPage();
                    }
                  }}
                  itemsPerPage={PER_PAGE}
                  totalItems={searchQuery.trim() 
                    ? (hasMore ? currentPage * PER_PAGE : fishSpecies.length)
                    : displayFish.length}
                  showingStart={(currentPage - 1) * PER_PAGE + 1}
                  showingEnd={Math.min(currentPage * PER_PAGE, displayFish.length)}
                />
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

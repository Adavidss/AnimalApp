import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { searchINatSpecies } from '../api/inaturalist';
import { getCategoryTheme } from '../utils/categories';
import Loader from '../components/Loader';
import { EmptyState } from '../components/ErrorState';
import { addToFavorites, removeFromFavorites, isFavorite } from '../utils/favorites';
import { getAutocompleteSuggestions } from '../utils/searchHelpers';
import { addToRecentSearches } from '../utils/cache';
import Pagination from '../components/Pagination';

export default function Reptiles() {
  const [species, setSpecies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'reptilia' | 'amphibia' | 'all'>('all');
  const [initialLoaded, setInitialLoaded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const categoryTheme = getCategoryTheme('reptiles');
  const PER_PAGE = 10;

  useEffect(() => {
    if (!initialLoaded) {
      loadInitialSpecies();
    }
  }, [initialLoaded]);

  useEffect(() => {
    loadSpeciesByType();
  }, [selectedType, currentPage]);

  const loadInitialSpecies = async () => {
    setLoading(true);
    try {
      // Load both reptiles and amphibians
      const [reptiles, amphibians] = await Promise.all([
        searchINatSpecies('reptilia', 1, PER_PAGE),
        searchINatSpecies('amphibia', 1, PER_PAGE)
      ]);

      const combined = [...reptiles, ...amphibians];
      setSpecies(combined);
      setHasMore(reptiles.length === PER_PAGE || amphibians.length === PER_PAGE);
      setInitialLoaded(true);
    } catch (error) {
      console.error('Error loading species:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSpeciesByType = async () => {
    if (selectedType === 'all') {
      setCurrentPage(1);
      loadInitialSpecies();
      return;
    }

    setLoading(true);
    try {
      const results = await searchINatSpecies(selectedType, currentPage, PER_PAGE);
      setSpecies(results);
      setHasMore(results.length === PER_PAGE);
    } catch (error) {
      console.error('Error loading species by type:', error);
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
      loadInitialSpecies();
      return;
    }

    addToRecentSearches(searchQuery.trim());
    setLoading(true);
    setShowSuggestions(false);
    try {
      const results = await searchINatSpecies(searchQuery, 1, PER_PAGE);
      setSpecies(results);
      setCurrentPage(1);
      setHasMore(results.length === PER_PAGE);
    } catch (error) {
      console.error('Error searching species:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    handleSearch();
    setShowSuggestions(false);
  };

  const totalPages = Math.ceil((hasMore ? (currentPage * PER_PAGE) : species.length) / PER_PAGE);
  const paginatedSpecies = species.slice(0, PER_PAGE);

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
                {species.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Species Found</div>
            </div>
          </div>
        </div>
      </section>

      {/* Search */}
      <section className="py-8 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-16 z-30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto space-y-4">
            <div className="flex gap-4">
              <div className="flex-1 relative" ref={searchInputRef}>
                <input
                  type="text"
                  placeholder="Search reptiles and amphibians..."
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
                  className="w-full px-4 py-3 pl-12 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 dark:text-white"
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
                className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                Search
              </button>
            </div>

            <div className="flex gap-2">
              {[
                { id: 'all' as const, label: 'All' },
                { id: 'reptilia' as const, label: 'Reptiles' },
                { id: 'amphibia' as const, label: 'Amphibians' }
              ].map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedType === type.id
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {type.label}
                </button>
              ))}
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
            ) : species.length === 0 ? (
              <EmptyState
                title="No species found"
                message="Try searching for snakes, lizards, turtles, or frogs"
                action={
                  <button
                    onClick={loadInitialSpecies}
                    className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Load Species
                  </button>
                }
              />
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedSpecies.map((animal, index) => (
                  <div
                    key={index}
                    className="group bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:scale-105"
                  >
                    <div className="relative h-48 bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 overflow-hidden flex items-center justify-center">
                      {animal.default_photo?.medium_url ? (
                        <img
                          src={animal.default_photo.medium_url}
                          alt={animal.preferred_common_name || animal.name}
                          className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const parent = e.currentTarget.parentElement;
                            if (parent) {
                              parent.innerHTML = '<div class="w-full h-full flex items-center justify-center text-8xl">🦎</div>';
                            }
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-8xl">
                          🦎
                        </div>
                      )}
                      {/* Favorite Button */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const animalName = animal.preferred_common_name || animal.name;
                          const favoriteAnimal = {
                            id: animal.id?.toString() || animalName,
                            name: animalName,
                            taxonomy: {
                              scientific_name: animal.name || ''
                            },
                            images: animal.default_photo?.medium_url ? [{
                              urls: {
                                small: animal.default_photo.medium_url,
                                regular: animal.default_photo.large_url || animal.default_photo.medium_url
                              }
                            }] : []
                          };
                          
                          if (isFavorite(animalName)) {
                            removeFromFavorites(animalName);
                          } else {
                            addToFavorites(favoriteAnimal as any);
                          }
                          // Trigger re-render
                          setSpecies([...species]);
                        }}
                        className="absolute top-4 left-4 p-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full hover:bg-white dark:hover:bg-gray-800 transition-colors shadow-lg z-10"
                        aria-label={isFavorite(animal.preferred_common_name || animal.name) ? 'Remove from favorites' : 'Add to favorites'}
                        title={isFavorite(animal.preferred_common_name || animal.name) ? 'Remove from favorites' : 'Add to favorites'}
                      >
                        {isFavorite(animal.preferred_common_name || animal.name) ? (
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
                      
                      {animal.rank && (
                        <div className="absolute top-4 right-4 px-3 py-1 bg-orange-600 text-white text-xs font-medium rounded-full capitalize">
                          {animal.rank}
                        </div>
                      )}
                    </div>

                    <div className="p-6 space-y-3">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {animal.preferred_common_name || animal.name}
                      </h3>
                      {animal.name && animal.name !== animal.preferred_common_name && (
                        <p className="text-sm italic text-gray-600 dark:text-gray-400">
                          {animal.name}
                        </p>
                      )}

                      {animal.observations_count && (
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          <span className="font-semibold">Observations:</span> {animal.observations_count.toLocaleString()}
                        </p>
                      )}

                      <Link
                        to={`/animal/${encodeURIComponent(animal.preferred_common_name || animal.name)}`}
                        className="block mt-4 text-center px-4 py-2 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 font-medium rounded-lg hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors"
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
                  onPageChange={setCurrentPage}
                  itemsPerPage={PER_PAGE}
                  totalItems={hasMore ? currentPage * PER_PAGE : species.length}
                  showingStart={(currentPage - 1) * PER_PAGE + 1}
                  showingEnd={Math.min(currentPage * PER_PAGE, species.length)}
                />
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

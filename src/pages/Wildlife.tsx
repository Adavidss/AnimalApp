import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { searchINatSpecies, INatTaxon } from '../api/inaturalist';
import { getCategoryTheme } from '../utils/categories';
import Loader from '../components/Loader';
import { EmptyState } from '../components/ErrorState';

export default function Wildlife() {
  const [animals, setAnimals] = useState<INatTaxon[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [initialLoaded, setInitialLoaded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const categoryTheme = getCategoryTheme('wildlife');
  const PER_PAGE = 30;

  useEffect(() => {
    loadAnimalsByType();
  }, [selectedType, currentPage]);

  const loadAnimalsByType = async () => {
    setLoading(true);
    try {
      let query = 'mammalia'; // Default to mammals
      if (selectedType === 'Mammalia') query = 'mammalia';
      else if (selectedType === 'Aves') query = 'aves';
      else if (selectedType === 'Reptilia') query = 'reptilia';
      else if (selectedType === 'Amphibia') query = 'amphibia';
      else if (selectedType === 'all') query = 'animalia';

      const results = await searchINatSpecies(query, currentPage, PER_PAGE);
      setAnimals(results);
      setHasMore(results.length === PER_PAGE);
      setInitialLoaded(true);
    } catch (error) {
      console.error('Error loading animals by type:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setCurrentPage(1);
      loadAnimalsByType();
      return;
    }

    setLoading(true);
    try {
      const results = await searchINatSpecies(searchQuery, 1, PER_PAGE);
      setAnimals(results);
      setCurrentPage(1);
      setHasMore(results.length === PER_PAGE);
    } catch (error) {
      console.error('Error searching wildlife:', error);
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

  // No need to filter by type since we already load the correct type
  const filteredAnimals = searchQuery === ''
    ? animals
    : animals.filter(animal =>
        animal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        animal.preferred_common_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );

  const animalTypes = ['all', 'Mammalia', 'Aves', 'Reptilia', 'Amphibia'];

  const getAnimalEmoji = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('lion')) return '🦁';
    if (n.includes('elephant')) return '🐘';
    if (n.includes('giraffe')) return '🦒';
    if (n.includes('zebra')) return '🦓';
    if (n.includes('tiger')) return '🐯';
    if (n.includes('bear')) return '🐻';
    if (n.includes('wolf')) return '🐺';
    if (n.includes('fox')) return '🦊';
    if (n.includes('deer')) return '🦌';
    if (n.includes('monkey') || n.includes('ape')) return '🐵';
    if (n.includes('gorilla')) return '🦍';
    if (n.includes('panda')) return '🐼';
    if (n.includes('koala')) return '🐨';
    if (n.includes('rhino')) return '🦏';
    if (n.includes('hippo')) return '🦛';
    if (n.includes('crocodile') || n.includes('alligator')) return '🐊';
    if (n.includes('kangaroo')) return '🦘';
    if (n.includes('sloth')) return '🦥';
    if (n.includes('otter')) return '🦦';
    if (n.includes('bat')) return '🦇';
    return '🦁';
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
            <div className="flex gap-4 justify-center">
              <div className="px-6 py-3 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <div className="text-2xl font-bold" style={{ color: categoryTheme.primaryColor }}>
                  {filteredAnimals.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Species</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-16 z-30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto space-y-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search wildlife..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 pl-12 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 dark:text-white"
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
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                Search
              </button>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2">
              {animalTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                    selectedType === type
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {type === 'all' ? 'All Types' : type}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Animals Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader />
              </div>
            ) : filteredAnimals.length === 0 ? (
              <EmptyState
                title="No animals found"
                message="Try adjusting your search or filters"
                action={
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedType('all');
                      setCurrentPage(1);
                      loadAnimalsByType();
                    }}
                    className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Reload Wildlife
                  </button>
                }
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAnimals.map((animal, index) => (
                  <div
                    key={animal.id || index}
                    className="group bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:scale-105"
                  >
                    <div className="relative h-48 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 overflow-hidden">
                      {animal.default_photo?.medium_url ? (
                        <img
                          src={animal.default_photo.medium_url}
                          alt={animal.preferred_common_name || animal.name}
                          className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-300"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const parent = e.currentTarget.parentElement;
                            if (parent) {
                              parent.innerHTML = `<div class="w-full h-full flex items-center justify-center text-6xl">${getAnimalEmoji(animal.name)}</div>`;
                            }
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-6xl">
                          {getAnimalEmoji(animal.name)}
                        </div>
                      )}
                      {animal.rank && (
                        <div className="absolute top-4 right-4 px-3 py-1 bg-green-600 text-white text-xs font-medium rounded-full capitalize">
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

                      {animal.iconic_taxon_name && (
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          <span className="font-semibold">Type:</span> {animal.iconic_taxon_name}
                        </p>
                      )}

                      {animal.conservation_status && (
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          <span className="font-semibold">Status:</span> {animal.conservation_status.status_name}
                        </p>
                      )}

                      <Link
                        to={`/animal/${encodeURIComponent(animal.preferred_common_name || animal.name)}`}
                        className="block mt-4 text-center px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-medium rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                      >
                        Learn More →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {!loading && filteredAnimals.length > 0 && (
              <div className="mt-8 flex items-center justify-center gap-4">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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

import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAnimal } from '../context/AnimalContext';
import SearchBar from '../components/SearchBar';
import Filters from '../components/Filters';
import AnimalCard from '../components/AnimalCard';
import { SkeletonGrid } from '../components/Loader';
import { EmptyState } from '../components/ErrorState';
import Pagination from '../components/Pagination';
import { searchAnimals } from '../api/animals';
import { AnimalFilters, EnrichedAnimal, Animal } from '../types/animal';
import { isEndangered } from '../api/iucn';
import { getDidYouMeanSuggestion } from '../utils/searchHelpers';

export default function Explorer() {
  const [searchParams] = useSearchParams();
  const { filters, setFilters, enrichAnimal } = useAnimal();
  const [animals, setAnimals] = useState<EnrichedAnimal[]>([]);
  const [allAnimals, setAllAnimals] = useState<EnrichedAnimal[]>([]); // Store original results
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  // Initialize from URL search params
  useEffect(() => {
    const searchQuery = searchParams.get('search');
    if (searchQuery && searchQuery !== filters.searchQuery) {
      handleSearch(searchQuery);
    }
  }, [searchParams]);

  // Apply filters when they change if no search query - moved to handleFiltersChange

  const handleSearch = async (query?: string) => {
    const searchTerm = query !== undefined ? query : filters.searchQuery || '';
    
    // Allow searching even with empty query if filters are active
    const hasActiveFilters = (filters.category && filters.category !== 'all') ||
                              (filters.habitat && filters.habitat !== 'all') ||
                              filters.endangeredOnly;

    if (!searchTerm.trim() && !hasActiveFilters) {
      // No search query and no active filters - don't search
      return;
    }

    setLoading(true);
    setError(null);
    setFilters({ ...filters, searchQuery: searchTerm });

    try {
      let results: Animal[] = [];
      
      if (searchTerm.trim()) {
        // Search with query across all APIs (limit to 100 for now, enrich more as needed)
        results = await searchAnimals(searchTerm, 100);
      } else {
        // No query but has filters - browse by filters
        await browseByFilters(filters);
        return;
      }

      if (results.length === 0) {
        // Check for "did you mean?" suggestion
        const suggestion = getDidYouMeanSuggestion(searchTerm);
        
        if (suggestion) {
          setError(`No animals found for "${searchTerm}". Did you mean "${suggestion}"?`);
        } else {
          setError(`No animals found for "${searchTerm}"`);
        }
        setAllAnimals([]);
        setAnimals([]);
        return;
      }

      // Enrich all animals (but limit to reasonable number for performance)
      // We'll enrich up to 100 animals, but only show 10 per page
      const enriched: EnrichedAnimal[] = [];
      const enrichLimit = Math.min(results.length, 100);
      
      for (const animal of results.slice(0, enrichLimit)) {
        try {
          const enrichedAnimal = await enrichAnimal(
            animal.name,
            animal.taxonomy.scientific_name
          );
          if (enrichedAnimal) {
            enriched.push({
              ...enrichedAnimal,
              taxonomy: animal.taxonomy,
              locations: animal.locations,
              characteristics: animal.characteristics,
            });
          }
        } catch (err) {
          console.error(`Error enriching ${animal.name}:`, err);
        }
      }

      setAllAnimals(enriched); // Store all enriched results
      setAnimals(enriched); // Will be paginated
      setPage(1);
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to search animals. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFiltersChange = async (newFilters: AnimalFilters) => {
    setFilters(newFilters);
    
    // If there are search results, apply filters to them
    if (allAnimals.length > 0) {
      applyFilters(newFilters);
    } else {
      // If no search results but filters are active, search by category/habitat
      const hasActiveFilters = (newFilters.category && newFilters.category !== 'all') ||
                                (newFilters.habitat && newFilters.habitat !== 'all') ||
                                newFilters.endangeredOnly;
      
      if (hasActiveFilters) {
        await browseByFilters(newFilters);
      } else {
        // Clear results if all filters are cleared
        setAnimals([]);
        setAllAnimals([]);
      }
    }
  };

  const browseByFilters = async (appliedFilters: AnimalFilters) => {
    setLoading(true);
    setError(null);
    
    try {
      // Use popular animals as a starting point for browsing
      const { POPULAR_ANIMALS } = await import('../utils/searchHelpers');
      const searchQueries: string[] = [];
      
      // Build search queries based on category filter
      if (appliedFilters.category && appliedFilters.category !== 'all') {
        // Search for popular animals in that category
        const categoryExamples: Record<string, string[]> = {
          mammal: ['Lion', 'Tiger', 'Elephant', 'Bear', 'Wolf', 'Fox'],
          bird: ['Eagle', 'Owl', 'Parrot', 'Penguin'],
          reptile: ['Snake', 'Crocodile', 'Turtle', 'Lizard'],
          amphibian: ['Frog', 'Toad', 'Salamander'],
          fish: ['Shark', 'Dolphin', 'Whale', 'Fish']
        };
        searchQueries.push(...(categoryExamples[appliedFilters.category] || POPULAR_ANIMALS.slice(0, 5)));
      } else {
        // No category filter, use popular animals
        searchQueries.push(...POPULAR_ANIMALS.slice(0, 10));
      }
      
      // Search for animals
      const allResults: Animal[] = [];
      const seenNames = new Set<string>();
      
      for (const query of searchQueries) {
        try {
          const results = await searchAnimals(query);
          for (const animal of results) {
            if (!seenNames.has(animal.name)) {
              seenNames.add(animal.name);
              allResults.push(animal);
            }
          }
        } catch (err) {
          console.debug(`Error searching for ${query}:`, err);
        }
      }
      
      if (allResults.length === 0) {
        setError('No animals found matching the selected filters.');
        setAnimals([]);
        setAllAnimals([]);
        return;
      }
      
      // Enrich animals - limit to 5 at a time to prevent bugs
      const enriched: EnrichedAnimal[] = [];
      for (const animal of allResults.slice(0, 5)) {
        try {
          const enrichedAnimal = await enrichAnimal(
            animal.name,
            animal.taxonomy.scientific_name
          );
          if (enrichedAnimal) {
            enriched.push({
              ...enrichedAnimal,
              taxonomy: animal.taxonomy,
              locations: animal.locations,
              characteristics: animal.characteristics,
            });
          }
        } catch (err) {
          console.error(`Error enriching ${animal.name}:`, err);
        }
      }
      
      // Apply filters to enriched results
      const filtered = applyFiltersToAnimals(enriched, appliedFilters);
      
      setAllAnimals(filtered);
      setAnimals(filtered);
      setPage(1);
    } catch (err) {
      console.error('Browse error:', err);
      setError('Failed to browse animals. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersToAnimals = (animalsToFilter: EnrichedAnimal[], appliedFilters: AnimalFilters): EnrichedAnimal[] => {
    let filtered = [...animalsToFilter];

    // Apply category filter (improved matching)
    if (appliedFilters.category && appliedFilters.category !== 'all') {
      filtered = filtered.filter((animal) => {
        const animalClass = animal.taxonomy?.class?.toLowerCase() || '';
        const animalOrder = animal.taxonomy?.order?.toLowerCase() || '';
        
        switch (appliedFilters.category) {
          case 'mammal':
            return animalClass === 'mammalia';
          case 'bird':
            return animalClass === 'aves';
          case 'reptile':
            return animalClass === 'reptilia';
          case 'amphibian':
            return animalClass === 'amphibia';
          case 'fish':
            return animalClass.includes('fish') || animalOrder.includes('fish') || 
                   animalClass === 'actinopterygii' || animalClass === 'chondrichthyes';
          default:
            return true;
        }
      });
    }

    // Apply habitat filter (improved matching to match API version)
    if (appliedFilters.habitat && appliedFilters.habitat !== 'all') {
      filtered = filtered.filter((animal) => {
        const habitat = animal.characteristics?.habitat?.toLowerCase() || '';
        const locations = (animal.locations || []).map((l) => l.toLowerCase()).join(' ');
        const combined = `${habitat} ${locations}`;
        
        switch (appliedFilters.habitat) {
          case 'land':
            return (
              combined.includes('forest') ||
              combined.includes('grassland') ||
              combined.includes('desert') ||
              combined.includes('mountain') ||
              combined.includes('jungle') ||
              combined.includes('savanna') ||
              combined.includes('plain') ||
              combined.includes('tundra') ||
              combined.includes('woodland')
            );
          case 'ocean':
            return (
              combined.includes('ocean') ||
              combined.includes('sea') ||
              combined.includes('marine') ||
              combined.includes('reef') ||
              combined.includes('coast') ||
              combined.includes('pelagic')
            );
          case 'freshwater':
            return (
              combined.includes('river') ||
              combined.includes('lake') ||
              combined.includes('stream') ||
              combined.includes('pond') ||
              combined.includes('wetland') ||
              combined.includes('marsh') ||
              combined.includes('swamp')
            );
          case 'air':
            return (
              combined.includes('flying') ||
              combined.includes('sky') ||
              combined.includes('air') ||
              animal.taxonomy?.class?.toLowerCase() === 'aves'
            );
          default:
            return true;
        }
      });
    }

    // Apply endangered filter
    if (appliedFilters.endangeredOnly) {
      filtered = filtered.filter((animal) =>
        animal.conservationStatus && isEndangered(animal.conservationStatus)
      );
    }

    return filtered;
  };

  const applyFilters = (appliedFilters: AnimalFilters) => {
    if (allAnimals.length === 0) return;

    const filtered = applyFiltersToAnimals(allAnimals, appliedFilters);
    setAnimals(filtered);
    setPage(1);
  };

  const paginatedAnimals = animals.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const totalPages = Math.ceil(animals.length / itemsPerPage);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Animal Explorer
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Search and filter through thousands of animal species
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <SearchBar
            onSearch={handleSearch}
            placeholder="Search by animal name..."
            loading={loading}
          />
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Filters filters={filters} onFiltersChange={handleFiltersChange} />
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            {/* Results Count */}
            {allAnimals.length > 0 && !loading && (
              <div className="mb-6 text-gray-600 dark:text-gray-400">
                Found {allAnimals.length} animal{allAnimals.length !== 1 ? 's' : ''}
                {filters.searchQuery && ` for "${filters.searchQuery}"`}
                {allAnimals.length > itemsPerPage && ` (showing page ${page} of ${totalPages})`}
              </div>
            )}

            {/* Loading State */}
            {loading && <SkeletonGrid count={12} />}

            {/* Error State */}
            {error && !loading && (
              <EmptyState
                title="No Results Found"
                message={error}
                action={
                  error.includes('Did you mean') ? (
                    <div className="flex flex-col gap-2 items-center">
                      <button
                        onClick={async () => {
                          const match = error.match(/"([^"]+)"/g);
                          if (match && match.length >= 2) {
                            const suggestion = match[1].replace(/"/g, '');
                            await handleSearch(suggestion);
                          }
                        }}
                        className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
                      >
                        {(() => {
                          const match = error.match(/"([^"]+)"/g);
                          if (match && match.length >= 2) {
                            const suggestion = match[1].replace(/"/g, '');
                            return `Search for "${suggestion}"`;
                          }
                          return 'Search Suggestion';
                        })()}
                      </button>
                      <button
                        onClick={() => {
                          setAnimals([]);
                          setError(null);
                          setFilters({ ...filters, searchQuery: '' });
                        }}
                        className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
                      >
                        Clear Search
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setAnimals([]);
                        setError(null);
                        setFilters({ ...filters, searchQuery: '' });
                      }}
                      className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
                    >
                      Clear Search
                    </button>
                  )
                }
              />
            )}

            {/* Animals Grid */}
            {!loading && !error && animals.length > 0 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {paginatedAnimals.map((animal) => (
                    <AnimalCard key={animal.id} animal={animal} />
                  ))}
                </div>

                {/* Pagination */}
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                  itemsPerPage={itemsPerPage}
                  totalItems={animals.length}
                  showingStart={(page - 1) * itemsPerPage + 1}
                  showingEnd={Math.min(page * itemsPerPage, animals.length)}
                />
              </>
            )}

            {/* Empty State */}
            {!loading && !error && animals.length === 0 && !filters.searchQuery && (
              <EmptyState
                icon={<div className="text-6xl">🔍</div>}
                title="Start Exploring"
                message="Search for any animal to get started, or use the filters to browse by category and habitat."
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

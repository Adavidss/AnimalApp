import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAnimal } from '../context/AnimalContext';
import SearchBar from '../components/SearchBar';
import Filters from '../components/Filters';
import AnimalCard from '../components/AnimalCard';
import Loader, { SkeletonGrid } from '../components/Loader';
import { EmptyState } from '../components/ErrorState';
import { searchAnimals, filterByCategory, filterByHabitat } from '../api/animals';
import { AnimalFilters, EnrichedAnimal, Animal } from '../types/animal';
import { isEndangered } from '../api/iucn';

export default function Explorer() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { filters, setFilters, enrichAnimal } = useAnimal();
  const [animals, setAnimals] = useState<EnrichedAnimal[]>([]);
  const [allAnimals, setAllAnimals] = useState<EnrichedAnimal[]>([]); // Store original results
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const itemsPerPage = 12;

  // Initialize from URL search params
  useEffect(() => {
    const searchQuery = searchParams.get('search');
    if (searchQuery && searchQuery !== filters.searchQuery) {
      handleSearch(searchQuery);
    }
  }, [searchParams]);

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setFilters({ ...filters, searchQuery: query });

    try {
      const results = await searchAnimals(query);

      if (results.length === 0) {
        setAnimals([]);
        setError(`No animals found for "${query}"`);
        return;
      }

      // Enrich each animal
      const enriched: EnrichedAnimal[] = [];
      for (const animal of results.slice(0, 12)) {
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

      setAllAnimals(enriched); // Store original results
      setAnimals(enriched);
      setPage(1);
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to search animals. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFiltersChange = (newFilters: AnimalFilters) => {
    setFilters(newFilters);
    applyFilters(newFilters);
  };

  const applyFilters = (appliedFilters: AnimalFilters) => {
    if (allAnimals.length === 0) return;

    let filtered = [...allAnimals]; // Filter from original results

    // Apply category filter
    if (appliedFilters.category && appliedFilters.category !== 'all') {
      filtered = filtered.filter((animal) => {
        const animalClass = animal.taxonomy?.class?.toLowerCase() || '';
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
            return animalClass.includes('fish');
          default:
            return true;
        }
      });
    }

    // Apply habitat filter
    if (appliedFilters.habitat && appliedFilters.habitat !== 'all') {
      filtered = filtered.filter((animal) => {
        const habitat = animal.characteristics?.habitat?.toLowerCase() || '';
        switch (appliedFilters.habitat) {
          case 'land':
            return (
              habitat.includes('forest') ||
              habitat.includes('grassland') ||
              habitat.includes('desert')
            );
          case 'ocean':
            return habitat.includes('ocean') || habitat.includes('sea');
          case 'freshwater':
            return habitat.includes('river') || habitat.includes('lake');
          case 'air':
            return habitat.includes('flying');
          default:
            return true;
        }
      });
    }

    // Apply endangered filter
    if (appliedFilters.endangeredOnly) {
      filtered = filtered.filter((animal) =>
        isEndangered(animal.conservationStatus?.category || null)
      );
    }

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
            {animals.length > 0 && !loading && (
              <div className="mb-6 text-gray-600 dark:text-gray-400">
                Showing {paginatedAnimals.length} of {animals.length} animals
                {filters.searchQuery && ` for "${filters.searchQuery}"`}
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
                  <button
                    onClick={() => setAnimals([])}
                    className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Clear Search
                  </button>
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
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Previous
                    </button>

                    <span className="px-4 py-2 text-gray-700 dark:text-gray-300">
                      Page {page} of {totalPages}
                    </span>

                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Next
                    </button>
                  </div>
                )}
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

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { searchAnimals } from '../api/animals';
import { fetchIUCNStatus } from '../api/iucn';
import AnimalCard from '../components/AnimalCard';
import Loader from '../components/Loader';
import { EmptyState } from '../components/ErrorState';
import { CONSERVATION_STATUS } from '../utils/constants';
import { EnrichedAnimal, ConservationStatus } from '../types/animal';
import Pagination from '../components/Pagination';

const PER_PAGE = 10;

export default function Conservation() {
  const [animals, setAnimals] = useState<EnrichedAnimal[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<ConservationStatus | 'all'>('all');
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAnimals();
  }, [selectedStatus, page]);


  const loadAnimals = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Use popular endangered/at-risk animals as examples
      const endangeredExamples = [
        'Tiger', 'Lion', 'Elephant', 'Panda', 'Gorilla', 'Rhino', 'Cheetah',
        'Leopard', 'Polar Bear', 'Blue Whale', 'Orangutan', 'Jaguar', 'Snow Leopard',
        'African Wild Dog', 'Red Panda', 'Sea Turtle', 'Hawksbill Turtle', 'Loggerhead Turtle',
        'Giant Panda', 'Sumatran Orangutan', 'Bornean Orangutan', 'Black Rhino', 'White Rhino',
        'Vaquita', 'Amur Leopard', 'Sumatran Tiger', 'Mountain Gorilla', 'Cross River Gorilla'
      ];

      // Search for animals - limit to avoid crashes
      const allResults: EnrichedAnimal[] = [];
      const seenNames = new Set<string>();

      // Only load 10 animals at a time based on page
      const startIndex = (page - 1) * PER_PAGE;
      const endIndex = startIndex + PER_PAGE;
      const queriesToProcess = endangeredExamples.slice(startIndex, endIndex);

      // Add delay between API calls to avoid rate limiting
      const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

      for (let i = 0; i < queriesToProcess.length; i++) {
        const query = queriesToProcess[i];
        try {
          // Add delay between requests (except first one)
          if (i > 0) {
            await delay(500); // 500ms delay between requests
          }

          const results = await searchAnimals(query);
          for (const animal of results) {
            if (!seenNames.has(animal.name)) {
              seenNames.add(animal.name);
              
              // Skip enrichment for conservation page to avoid too many API calls
              // Just get conservation status directly if available
              let conservationStatus = null;
              if (animal.taxonomy?.scientific_name) {
                try {
                  // Small delay before IUCN call
                  await delay(300);
                  const status = await fetchIUCNStatus(animal.taxonomy.scientific_name);
                  if (status) {
                    conservationStatus = status;
                  }
                } catch (err) {
                  // Continue without status
                  console.debug(`Could not fetch IUCN status for ${animal.name}`);
                }
              }

              // Filter by selected status
              if (selectedStatus === 'all' || 
                  (conservationStatus && conservationStatus.category === selectedStatus)) {
                // Skip enrichment to avoid too many API calls - just use basic animal data
                // Users can click through to see full details
                allResults.push({
                  id: (animal as any).id || animal.name,
                  name: animal.name,
                  taxonomy: animal.taxonomy,
                  images: (animal as any).images || [],
                  conservationStatus: conservationStatus || undefined,
                  locations: animal.locations,
                  characteristics: animal.characteristics,
                  wikipedia: undefined,
                } as EnrichedAnimal);
              }
            }
          }
        } catch (err: any) {
          // Silently handle errors - don't block loading
          if (err?.message?.includes('429') || err?.message?.includes('rate limit')) {
            console.warn(`Rate limited for ${query}, skipping...`);
            // Continue with next animal
            continue;
          }
          console.debug(`Error searching for ${query}:`, err);
        }
      }

      // Sort by status severity (most endangered first)
      allResults.sort((a, b) => {
        const statusOrder: Record<string, number> = {
          'EX': 0, 'EW': 1, 'CR': 2, 'EN': 3, 'VU': 4, 'NT': 5, 'LC': 6, 'DD': 7, 'NE': 8
        };
        const aStatus = a.conservationStatus?.category || 'NE';
        const bStatus = b.conservationStatus?.category || 'NE';
        return statusOrder[aStatus] - statusOrder[bStatus];
      });

      setAnimals(allResults);
    } catch (err) {
      console.error('Error loading conservation animals:', err);
      setError('Failed to load animals. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Animals are already paginated from loadAnimals, so use directly
  const paginatedAnimals = animals;
  const totalPages = Math.ceil(30 / PER_PAGE); // Total potential animals / per page

  const statusList: ConservationStatus[] = ['CR', 'EN', 'VU', 'NT', 'LC', 'DD', 'EX', 'EW', 'NE'];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
            <span className="text-4xl">🛡️</span>
            Conservation Status
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Explore animals by their conservation status and learn about endangered species
          </p>
        </div>

        {/* Status Filter */}
        <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Filter by Conservation Status
          </h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setSelectedStatus('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedStatus === 'all'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              All
            </button>
            {statusList.map((status: ConservationStatus) => {
              const statusInfo = CONSERVATION_STATUS[status];
              const count = animals.filter(a => 
                a.conservationStatus?.category === status
              ).length;
              
              return (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedStatus === status
                      ? `${statusInfo.bgColor} ${statusInfo.color}`
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  title={statusInfo.description}
                >
                  {statusInfo.label} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-12">
            <Loader />
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <EmptyState
            title="Error"
            message={error}
            action={
              <button
                onClick={loadAnimals}
                className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
              >
                Try Again
              </button>
            }
          />
        )}

        {/* Empty State */}
        {!loading && !error && animals.length === 0 && (
          <EmptyState
            title="No animals found"
            message={`No animals found with ${selectedStatus === 'all' ? 'any' : CONSERVATION_STATUS[selectedStatus].label.toLowerCase()} conservation status.`}
          />
        )}

        {/* Animals Grid */}
        {!loading && !error && animals.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {paginatedAnimals.map((animal) => (
                <AnimalCard key={animal.name} animal={animal} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
                itemsPerPage={PER_PAGE}
              />
            )}
          </>
        )}

        {/* Info Section */}
        <div className="mt-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
            About Conservation Status
          </h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Conservation status helps us understand the risk of extinction for different animal species. 
            The IUCN Red List categories range from Least Concern (LC) to Extinct (EX), with species 
            marked as Vulnerable (VU), Endangered (EN), or Critically Endangered (CR) requiring urgent 
            conservation action.
          </p>
          <Link
            to="/explorer"
            className="text-primary-600 dark:text-primary-400 hover:underline font-medium"
          >
            Explore more animals →
          </Link>
        </div>
      </div>
    </div>
  );
}



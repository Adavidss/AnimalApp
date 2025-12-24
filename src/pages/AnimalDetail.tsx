import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAnimal } from '../context/AnimalContext';
import AnimalGallery from '../components/AnimalGallery';
import MapView from '../components/MapView';
import SoundPlayer from '../components/SoundPlayer';
import MigrationMap from '../components/MigrationMap';
import SizeVisualization from '../components/SizeVisualization';
import { SkeletonDetail } from '../components/Loader';
import Loader from '../components/Loader';
import ErrorState from '../components/ErrorState';
import { fetchAnimalByName } from '../api/animals';
import { CONSERVATION_STATUS } from '../utils/constants';
import { EnrichedAnimal } from '../types/animal';
import { trackAnimalView } from '../utils/animalDiscovery';
import { trackAnimalViewForAchievements, trackEndangeredSpecies } from '../utils/achievements';
import { isEndangered } from '../api/iucn';
import { addToFavorites, removeFromFavorites, isFavorite } from '../utils/favorites';
import { getHabitatTypes } from '../api/worms';
import { searchMovebankStudies, getMovebankLocations, getMovebankStudy, getStudyIndividuals } from '../api/movebank';

export default function AnimalDetail() {
  const { name } = useParams<{ name: string }>();
  const navigate = useNavigate();
  const { enrichAnimal } = useAnimal();
  const [animal, setAnimal] = useState<EnrichedAnimal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'taxonomy' | 'habitat' | 'conservation' | 'sounds' | 'migration'>('overview');
  const [isAnimalFavorite, setIsAnimalFavorite] = useState(false);
  const [loadingMigration, setLoadingMigration] = useState(false);

  useEffect(() => {
    if (animal) {
      setIsAnimalFavorite(isFavorite(animal.name));
    }
  }, [animal]);

  useEffect(() => {
    if (name) {
      loadAnimal(decodeURIComponent(name));
    }
  }, [name]);

  // Load migration data when migration tab is active
  useEffect(() => {
    if (activeTab === 'migration' && animal && !animal.migration && !loadingMigration) {
      loadMigrationData();
    }
  }, [activeTab, animal]);

  const loadMigrationData = async () => {
    if (!animal || loadingMigration) return;
    
    setLoadingMigration(true);
    try {
      // Try searching with common name and scientific name
      const searchTerms = [animal.name];
      if (animal.taxonomy?.scientific_name) {
        searchTerms.push(animal.taxonomy.scientific_name);
        // Also try genus only
        const genus = animal.taxonomy.scientific_name.split(' ')[0];
        if (genus) searchTerms.push(genus);
      }

      let studies: any[] = [];
      for (const term of searchTerms) {
        try {
          const foundStudies = await searchMovebankStudies(term);
          if (foundStudies && foundStudies.length > 0) {
            studies = foundStudies;
            break;
          }
        } catch (err) {
          console.debug(`No Movebank studies found for ${term}`);
        }
      }

      if (studies.length > 0) {
        // Use the first study
        const study = studies[0];
        const studyDetails = await getMovebankStudy(study.id);
        const individuals = await getStudyIndividuals(study.id);
        
        // Get locations for the first individual, or all if no individuals
        const individualId = individuals.length > 0 ? individuals[0] : undefined;
        const locations = await getMovebankLocations(study.id, individualId, 1000);

        if (locations.length > 0 && studyDetails) {
          setAnimal({
            ...animal,
            migration: locations,
            migrationStudy: studyDetails,
          });
        }
      }
    } catch (error) {
      console.error('Error loading migration data:', error);
    } finally {
      setLoadingMigration(false);
    }
  };

  // Ensure activeTab exists in available tabs, switch to first available if not
  useEffect(() => {
    if (!animal) return;
    
    const conservationStatus = animal.conservationStatus?.category;
    const status = conservationStatus ? CONSERVATION_STATUS[conservationStatus] : null;
    
    const availableTabs = [
      { 
        id: 'overview', 
        show: (animal.wikipedia?.extract) || 
              (animal.characteristics && Object.entries(animal.characteristics).filter(([_key, value]) => value && value !== 'N/A').length > 0)
      },
      { 
        id: 'taxonomy', 
        show: animal.taxonomy && (animal.taxonomy.kingdom || animal.taxonomy.phylum || animal.taxonomy.class || animal.taxonomy.order || animal.taxonomy.family || animal.taxonomy.genus || animal.taxonomy.scientific_name)
      },
      { 
        id: 'habitat', 
        show: (animal.occurrences && animal.occurrences.length > 0) || (animal.locations && animal.locations.length > 0)
      },
      { 
        id: 'conservation', 
        show: status || (animal.conservationStatus && animal.conservationStatus.category)
      },
      { id: 'sounds', show: animal.sounds && animal.sounds.length > 0 },
      { id: 'migration', show: animal.migration && animal.migration.length > 0 },
    ].filter(tab => tab.show !== false);
    
    // If current active tab is not in available tabs, switch to first available
    if (availableTabs.length > 0 && !availableTabs.find(t => t.id === activeTab)) {
      setActiveTab(availableTabs[0].id as any);
    }
  }, [animal, activeTab]);

  const loadAnimal = async (animalName: string) => {
    setLoading(true);
    setError(null);

    try {
      // Fetch base animal data
      const animals = await fetchAnimalByName(animalName);

      if (!animals || animals.length === 0) {
        setError('Animal not found');
        return;
      }

      const baseAnimal = animals[0];

      // Enrich with additional data
      const enriched = await enrichAnimal(
        baseAnimal.name,
        baseAnimal.taxonomy.scientific_name
      );

      if (enriched) {
        const enrichedAnimal = {
          ...enriched,
          taxonomy: baseAnimal.taxonomy,
          locations: baseAnimal.locations,
          characteristics: baseAnimal.characteristics,
        };
        setAnimal(enrichedAnimal);

        // Track animal view for trending statistics and achievements
        trackAnimalView(baseAnimal.name);
        trackAnimalViewForAchievements(baseAnimal.name, baseAnimal.taxonomy?.class);
        
        // Track endangered species for conservation achievement
        if (enrichedAnimal.conservationStatus && isEndangered(enrichedAnimal.conservationStatus)) {
          trackEndangeredSpecies(enrichedAnimal.name);
        }
      } else {
        setError('Failed to load animal details');
      }
    } catch (err) {
      console.error('Error loading animal:', err);
      setError('Failed to load animal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <SkeletonDetail />
          </div>
        </div>
      </div>
    );
  }

  if (error || !animal) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4">
          <ErrorState
            title="Animal Not Found"
            message={error || 'The animal you are looking for does not exist.'}
            retry={() => loadAnimal(name!)}
          />
        </div>
      </div>
    );
  }

  const conservationStatus = animal.conservationStatus?.category;
  const status = conservationStatus ? CONSERVATION_STATUS[conservationStatus] : null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="mb-6 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back
          </button>

          {/* Header */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                    {animal.name}
                  </h1>
                  {/* Favorite Button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      if (isAnimalFavorite) {
                        removeFromFavorites(animal.name);
                        setIsAnimalFavorite(false);
                      } else {
                        addToFavorites(animal);
                        setIsAnimalFavorite(true);
                      }
                    }}
                    className="p-2 bg-white dark:bg-gray-800 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-lg"
                    aria-label={isAnimalFavorite ? 'Remove from favorites' : 'Add to favorites'}
                    title={isAnimalFavorite ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    {isAnimalFavorite ? (
                      <svg className="w-6 h-6 text-yellow-500 fill-current" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6 text-gray-400 hover:text-yellow-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    )}
                  </button>
                </div>
                {animal.taxonomy?.scientific_name && (
                  <p className="text-xl italic text-gray-600 dark:text-gray-400">
                    {animal.taxonomy.scientific_name}
                  </p>
                )}
              </div>

              {status && (
                <div
                  className={`${status.bgColor} ${status.color} px-4 py-2 rounded-lg font-semibold text-sm shadow-lg`}
                  title={status.description}
                >
                  {status.label}
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              {animal.characteristics?.diet && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Diet</div>
                  <div className="font-semibold text-gray-900 dark:text-white capitalize">
                    {animal.characteristics.diet}
                  </div>
                </div>
              )}

              {animal.characteristics?.lifespan && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Lifespan</div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {animal.characteristics.lifespan}
                  </div>
                </div>
              )}

              {animal.characteristics?.habitat && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Habitat</div>
                  <div className="font-semibold text-gray-900 dark:text-white capitalize">
                    {animal.characteristics.habitat}
                  </div>
                </div>
              )}

              {animal.characteristics?.weight && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Weight</div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {animal.characteristics.weight}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Image Gallery */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Gallery</h2>
            <AnimalGallery images={animal.images} animalName={animal.name} />
          </div>


          {/* Size Visualization */}
          {(animal.characteristics?.length || animal.characteristics?.height || animal.characteristics?.weight) && (
            <div className="mb-6">
              <SizeVisualization
                animalName={animal.name}
                length={animal.characteristics.length ? parseFloat(animal.characteristics.length) : undefined}
                height={animal.characteristics.height ? parseFloat(animal.characteristics.height) : undefined}
                weight={animal.characteristics.weight ? parseFloat(animal.characteristics.weight) : undefined}
              />
            </div>
          )}

          {/* Tabs */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="flex -mb-px overflow-x-auto">
                {[
                  { 
                    id: 'overview', 
                    label: 'Overview', 
                    icon: '📖',
                    show: (animal.wikipedia?.extract) || 
                          (animal.characteristics && Object.entries(animal.characteristics).filter(([_key, value]) => value && value !== 'N/A').length > 0)
                  },
                  { 
                    id: 'taxonomy', 
                    label: 'Taxonomy', 
                    icon: '🔬',
                    show: animal.taxonomy && (animal.taxonomy.kingdom || animal.taxonomy.phylum || animal.taxonomy.class || animal.taxonomy.order || animal.taxonomy.family || animal.taxonomy.genus || animal.taxonomy.scientific_name)
                  },
                  { 
                    id: 'habitat', 
                    label: 'Habitat & Range', 
                    icon: '🌍',
                    show: (animal.occurrences && animal.occurrences.length > 0) || (animal.locations && animal.locations.length > 0)
                  },
      { 
        id: 'conservation', 
        label: 'Conservation', 
        icon: '🛡️',
        show: status || (animal.conservationStatus && animal.conservationStatus.category)
      },
                  { id: 'sounds', label: 'Sounds', icon: '🔊', show: animal.sounds && animal.sounds.length > 0 },
                  { id: 'migration', label: 'Migration', icon: '🗺️', show: animal.migration && animal.migration.length > 0 },
                ].filter(tab => tab.show !== false).map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                    }`}
                  >
                    <span>{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-8">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {animal.wikipedia?.extract && (
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                        Description
                      </h3>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {animal.wikipedia.extract}
                      </p>
                      {animal.wikipedia.url && (
                        <a
                          href={animal.wikipedia.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 mt-4 text-primary-600 hover:text-primary-700 font-medium"
                        >
                          Read more on Wikipedia
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                        </a>
                      )}
                    </div>
                  )}

                  {/* Characteristics - only show if there are characteristics */}
                  {animal.characteristics && Object.entries(animal.characteristics).filter(([_key, value]) => value && value !== 'N/A').length > 0 && (
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                        Characteristics
                      </h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        {Object.entries(animal.characteristics)
                          .filter(([_key, value]) => value && value !== 'N/A')
                          .map(([key, value]) => (
                            <div
                              key={key}
                              className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700"
                            >
                              <span className="text-gray-600 dark:text-gray-400 capitalize">
                                {key.replace(/_/g, ' ')}:
                              </span>
                              <span className="font-medium text-gray-900 dark:text-white">
                                {String(value)}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Taxonomy Tab - only show if taxonomy data exists */}
              {activeTab === 'taxonomy' && (
                <div className="space-y-4">
                  {animal.taxonomy && (animal.taxonomy.kingdom || animal.taxonomy.phylum || animal.taxonomy.class || animal.taxonomy.order || animal.taxonomy.family || animal.taxonomy.genus || animal.taxonomy.scientific_name || animal.marineData) ? (
                    <>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                        Taxonomic Classification
                      </h3>
                      
                      {/* Marine habitat info and taxonomic details */}
                      {animal.marineData && (() => {
                        const habitats = getHabitatTypes(animal.marineData);
                        const hasHabitats = habitats.length > 0;
                        const marineTaxon = animal.marineData;
                        const hasMarineTaxonomy = marineTaxon.kingdom || marineTaxon.phylum || marineTaxon.class || 
                                                 marineTaxon.order || marineTaxon.family || marineTaxon.genus || 
                                                 marineTaxon.rank || marineTaxon.status;
                        
                        if (!hasHabitats && !hasMarineTaxonomy) return null;
                        
                        return (
                          <div className="mb-6 space-y-4">
                            {/* Habitat Types */}
                            {hasHabitats && (
                              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <div className="flex flex-wrap gap-2 items-center">
                                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Habitat Type:</span>
                                  {habitats.map((habitat) => (
                                    <span
                                      key={habitat}
                                      className="px-3 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium"
                                    >
                                      {habitat}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {/* Marine Taxonomic Details (if different from main taxonomy or if main taxonomy is missing) */}
                            {hasMarineTaxonomy && (
                              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                                  Marine Taxonomy Details
                                </h4>
                                <div className="space-y-2">
                                  {marineTaxon.kingdom && (
                                    <div className="flex justify-between py-1 border-b border-gray-200 dark:border-gray-600">
                                      <span className="text-gray-600 dark:text-gray-400">Kingdom:</span>
                                      <span className="font-medium text-gray-900 dark:text-white">{marineTaxon.kingdom}</span>
                                    </div>
                                  )}
                                  {marineTaxon.phylum && (
                                    <div className="flex justify-between py-1 border-b border-gray-200 dark:border-gray-600">
                                      <span className="text-gray-600 dark:text-gray-400">Phylum:</span>
                                      <span className="font-medium text-gray-900 dark:text-white">{marineTaxon.phylum}</span>
                                    </div>
                                  )}
                                  {marineTaxon.class && (
                                    <div className="flex justify-between py-1 border-b border-gray-200 dark:border-gray-600">
                                      <span className="text-gray-600 dark:text-gray-400">Class:</span>
                                      <span className="font-medium text-gray-900 dark:text-white">{marineTaxon.class}</span>
                                    </div>
                                  )}
                                  {marineTaxon.order && (
                                    <div className="flex justify-between py-1 border-b border-gray-200 dark:border-gray-600">
                                      <span className="text-gray-600 dark:text-gray-400">Order:</span>
                                      <span className="font-medium text-gray-900 dark:text-white">{marineTaxon.order}</span>
                                    </div>
                                  )}
                                  {marineTaxon.family && (
                                    <div className="flex justify-between py-1 border-b border-gray-200 dark:border-gray-600">
                                      <span className="text-gray-600 dark:text-gray-400">Family:</span>
                                      <span className="font-medium text-gray-900 dark:text-white">{marineTaxon.family}</span>
                                    </div>
                                  )}
                                  {marineTaxon.genus && (
                                    <div className="flex justify-between py-1 border-b border-gray-200 dark:border-gray-600">
                                      <span className="text-gray-600 dark:text-gray-400">Genus:</span>
                                      <span className="font-medium text-gray-900 dark:text-white">{marineTaxon.genus}</span>
                                    </div>
                                  )}
                                  {marineTaxon.rank && (
                                    <div className="flex justify-between py-1 border-b border-gray-200 dark:border-gray-600">
                                      <span className="text-gray-600 dark:text-gray-400">Rank:</span>
                                      <span className="font-medium text-gray-900 dark:text-white capitalize">{marineTaxon.rank}</span>
                                    </div>
                                  )}
                                  {marineTaxon.status && (
                                    <div className="flex justify-between py-1">
                                      <span className="text-gray-600 dark:text-gray-400">Status:</span>
                                      <span className={`font-medium ${marineTaxon.status === 'accepted' ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                                        {marineTaxon.status}
                                      </span>
                                    </div>
                                  )}
                                  {marineTaxon.scientificname && (
                                    <div className="flex justify-between py-1 border-t border-gray-200 dark:border-gray-600 mt-2 pt-2">
                                      <span className="text-gray-600 dark:text-gray-400">Scientific Name:</span>
                                      <span className="font-medium text-gray-900 dark:text-white italic">{marineTaxon.scientificname}</span>
                                    </div>
                                  )}
                                  {marineTaxon.authority && (
                                    <div className="flex justify-between py-1">
                                      <span className="text-gray-600 dark:text-gray-400">Authority:</span>
                                      <span className="font-medium text-gray-900 dark:text-white text-sm">{marineTaxon.authority}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                      
                      <div className="space-y-3">
                        {animal.taxonomy.kingdom && (
                          <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="w-32 text-gray-600 dark:text-gray-400 font-medium">
                              Kingdom
                            </div>
                            <div className="flex-1 text-gray-900 dark:text-white font-semibold">
                              {animal.taxonomy.kingdom}
                            </div>
                          </div>
                        )}
                        {animal.taxonomy.phylum && (
                          <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="w-32 text-gray-600 dark:text-gray-400 font-medium">
                              Phylum
                            </div>
                            <div className="flex-1 text-gray-900 dark:text-white font-semibold">
                              {animal.taxonomy.phylum}
                            </div>
                          </div>
                        )}
                        {animal.taxonomy.class && (
                          <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="w-32 text-gray-600 dark:text-gray-400 font-medium">
                              Class
                            </div>
                            <div className="flex-1 text-gray-900 dark:text-white font-semibold">
                              {animal.taxonomy.class}
                            </div>
                          </div>
                        )}
                        {animal.taxonomy.order && (
                          <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="w-32 text-gray-600 dark:text-gray-400 font-medium">
                              Order
                            </div>
                            <div className="flex-1 text-gray-900 dark:text-white font-semibold">
                              {animal.taxonomy.order}
                            </div>
                          </div>
                        )}
                        {animal.taxonomy.family && (
                          <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="w-32 text-gray-600 dark:text-gray-400 font-medium">
                              Family
                            </div>
                            <div className="flex-1 text-gray-900 dark:text-white font-semibold">
                              {animal.taxonomy.family}
                            </div>
                          </div>
                        )}
                        {animal.taxonomy.genus && (
                          <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="w-32 text-gray-600 dark:text-gray-400 font-medium">
                              Genus
                            </div>
                            <div className="flex-1 text-gray-900 dark:text-white font-semibold">
                              {animal.taxonomy.genus}
                            </div>
                          </div>
                        )}
                        {animal.taxonomy.scientific_name && (
                          <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="w-32 text-gray-600 dark:text-gray-400 font-medium">
                              Scientific Name
                            </div>
                            <div className="flex-1 text-gray-900 dark:text-white font-semibold italic">
                              {animal.taxonomy.scientific_name}
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  ) : null}
                </div>
              )}

              {/* Habitat Tab - only show if habitat data exists */}
              {activeTab === 'habitat' && (
                <div className="space-y-6">
                  {(animal.occurrences && animal.occurrences.length > 0) || (animal.locations && animal.locations.length > 0) ? (
                    <>
                      {animal.occurrences && animal.occurrences.length > 0 && (
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                            Geographic Distribution
                          </h3>
                          <MapView occurrences={animal.occurrences} animalName={animal.name} />
                        </div>
                      )}

                      {animal.locations && animal.locations.length > 0 && (
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                            Known Locations
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {animal.locations.map((location, index) => (
                              <span
                                key={index}
                                className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 rounded-full text-sm"
                              >
                                {location}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  ) : null}
                </div>
              )}

              {/* Conservation Tab - show conservation section */}
              {activeTab === 'conservation' && (
                <div className="space-y-6">
                  {(status || animal.conservationStatus) ? (
                    <>
                  {status && (
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                        Conservation Status
                      </h3>
                      <div className={`${status.bgColor} ${status.color} rounded-lg p-6`}>
                        <div className="flex items-center gap-4 mb-4">
                          <div className="text-4xl">🛡️</div>
                          <div>
                            <div className="text-2xl font-bold">{status.label}</div>
                            <div className="text-sm opacity-90">{status.description}</div>
                          </div>
                        </div>

                        {animal.conservationStatus?.population_trend && (
                          <div className="mt-4 pt-4 border-t border-current/20">
                            <p>
                              <strong>Population Trend:</strong>{' '}
                              {animal.conservationStatus.population_trend}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {!status && animal.conservationStatus && (
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                        Conservation Status
                      </h3>
                      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6">
                        <p className="text-gray-900 dark:text-white font-semibold">
                          Status: {animal.conservationStatus.category || 'Unknown'}
                        </p>
                        {animal.conservationStatus.population_trend && (
                          <p className="text-gray-600 dark:text-gray-400 mt-2">
                            Population Trend: {animal.conservationStatus.population_trend}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                    </>
                  ) : (
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-12 text-center">
                      <p className="text-gray-600 dark:text-gray-400">
                        No conservation status information available for this species
                      </p>
                    </div>
                  )}

                  {animal.characteristics?.biggest_threat && (
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                        Threats
                      </h3>
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                        <p className="text-red-900 dark:text-red-100">
                          {animal.characteristics.biggest_threat}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Sounds Tab */}
              {activeTab === 'sounds' && animal.sounds && (
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    Animal Sounds & Calls
                  </h3>
                  <SoundPlayer recordings={animal.sounds} animalName={animal.name} />
                </div>
              )}

              {/* Migration Tab */}
              {activeTab === 'migration' && (
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    Migration Tracking Data
                  </h3>
                  {loadingMigration ? (
                    <div className="flex justify-center py-12">
                      <Loader />
                    </div>
                  ) : animal.migration && animal.migrationStudy && animal.migration.length > 0 ? (
                    <MigrationMap
                      locations={animal.migration}
                      study={animal.migrationStudy}
                      animalName={animal.name}
                    />
                  ) : (
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-12 text-center">
                      <svg
                        className="w-16 h-16 mx-auto mb-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                        />
                      </svg>
                      <p className="text-gray-600 dark:text-gray-400">
                        No migration tracking data available for this species
                      </p>
                    </div>
                  )}
                </div>
              )}


            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

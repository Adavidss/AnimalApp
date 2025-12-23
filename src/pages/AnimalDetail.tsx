import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAnimal } from '../context/AnimalContext';
import AnimalGallery from '../components/AnimalGallery';
import MapView from '../components/MapView';
import SoundPlayer from '../components/SoundPlayer';
import MigrationMap from '../components/MigrationMap';
import BirdSightings from '../components/BirdSightings';
import MarineInfo from '../components/MarineInfo';
import FactCard from '../components/FactCard';
import SizeVisualization from '../components/SizeVisualization';
import Loader, { SkeletonDetail } from '../components/Loader';
import ErrorState from '../components/ErrorState';
import { fetchAnimalByName } from '../api/animals';
import { CONSERVATION_STATUS } from '../utils/constants';
import { EnrichedAnimal } from '../types/animal';
import { getFactsByAnimal, getRandomFact, AnimalFact } from '../data/animalFacts';
import { trackAnimalView } from '../utils/animalDiscovery';
import { trackAnimalViewForAchievements } from '../utils/achievements';

export default function AnimalDetail() {
  const { name } = useParams<{ name: string }>();
  const navigate = useNavigate();
  const { enrichAnimal } = useAnimal();
  const [animal, setAnimal] = useState<EnrichedAnimal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'taxonomy' | 'habitat' | 'conservation' | 'sounds' | 'migration' | 'sightings' | 'marine'>('overview');
  const [currentFact, setCurrentFact] = useState<AnimalFact | null>(null);

  useEffect(() => {
    if (name) {
      loadAnimal(decodeURIComponent(name));
    }
  }, [name]);

  // Load random fact when animal changes
  useEffect(() => {
    if (animal) {
      shuffleFact();
    }
  }, [animal?.name]);

  const shuffleFact = () => {
    if (animal) {
      const facts = getFactsByAnimal(animal.name);
      if (facts.length > 0) {
        setCurrentFact(facts[Math.floor(Math.random() * facts.length)]);
      } else {
        setCurrentFact(getRandomFact());
      }
    }
  };

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
        trackAnimalViewForAchievements(baseAnimal.name);
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
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  {animal.name}
                </h1>
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

          {/* Fun Facts */}
          {currentFact && (
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Fun Fact</h2>
              <FactCard fact={currentFact} onShuffle={shuffleFact} showAnimal={false} />
            </div>
          )}

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
                  { id: 'overview', label: 'Overview', icon: '📖' },
                  { id: 'taxonomy', label: 'Taxonomy', icon: '🔬' },
                  { id: 'habitat', label: 'Habitat & Range', icon: '🌍' },
                  { id: 'conservation', label: 'Conservation', icon: '🛡️' },
                  { id: 'sounds', label: 'Sounds', icon: '🔊', show: animal.sounds && animal.sounds.length > 0 },
                  { id: 'migration', label: 'Migration', icon: '🗺️', show: animal.migration && animal.migration.length > 0 },
                  { id: 'sightings', label: 'Bird Sightings', icon: '🦅', show: animal.birdSightings && animal.birdSightings.length > 0 },
                  { id: 'marine', label: 'Marine Info', icon: '🌊', show: animal.marineData },
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

                  {/* Characteristics */}
                  {animal.characteristics && (
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                        Characteristics
                      </h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        {Object.entries(animal.characteristics)
                          .filter(([key, value]) => value && value !== 'N/A')
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

              {/* Taxonomy Tab */}
              {activeTab === 'taxonomy' && (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    Taxonomic Classification
                  </h3>
                  <div className="space-y-3">
                    {animal.taxonomy && (
                      <>
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
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Habitat Tab */}
              {activeTab === 'habitat' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                      Geographic Distribution
                    </h3>
                    {animal.occurrences && animal.occurrences.length > 0 ? (
                      <MapView occurrences={animal.occurrences} animalName={animal.name} />
                    ) : (
                      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-12 text-center">
                        <p className="text-gray-600 dark:text-gray-400">
                          Geographic data not available
                        </p>
                      </div>
                    )}
                  </div>

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
                </div>
              )}

              {/* Conservation Tab */}
              {activeTab === 'conservation' && (
                <div className="space-y-6">
                  {status ? (
                    <>
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
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-600 dark:text-gray-400">
                        Conservation status information not available
                      </p>
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
              {activeTab === 'migration' && animal.migration && animal.migrationStudy && (
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    Migration Tracking Data
                  </h3>
                  <MigrationMap
                    locations={animal.migration}
                    study={animal.migrationStudy}
                    animalName={animal.name}
                  />
                </div>
              )}

              {/* Bird Sightings Tab */}
              {activeTab === 'sightings' && animal.birdSightings && (
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    Recent Bird Sightings
                  </h3>
                  <BirdSightings
                    observations={animal.birdSightings}
                    speciesName={animal.name}
                  />
                </div>
              )}

              {/* Marine Info Tab */}
              {activeTab === 'marine' && animal.marineData && (
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    Marine Taxonomy & Distribution
                  </h3>
                  <MarineInfo
                    taxon={animal.marineData}
                    distribution={animal.marineDistribution || []}
                    vernacularNames={animal.marineVernacular || []}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

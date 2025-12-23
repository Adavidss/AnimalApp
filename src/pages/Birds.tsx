import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getNearbyObservations, getNotableObservations } from '../api/ebird';
import { EBirdObservation } from '../types/animal';
import { searchINatSpecies } from '../api/inaturalist';
import { getCategoryTheme } from '../utils/categories';
import { getRandomBirdImages } from '../api/additionalApis';
import Loader from '../components/Loader';
import { EmptyState } from '../components/ErrorState';

export default function Birds() {
  const [activeTab, setActiveTab] = useState<'explore' | 'sightings' | 'calls' | 'checklist' | 'identify'>('explore');
  const [loading, setLoading] = useState(false);
  const [birdSpecies, setBirdSpecies] = useState<any[]>([]);
  const [recentSightings, setRecentSightings] = useState<EBirdObservation[]>([]);
  const [birdImages, setBirdImages] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationGranted, setLocationGranted] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const categoryTheme = getCategoryTheme('birds');

  useEffect(() => {
    loadInitialData();
    requestLocation();
  }, []);

  const requestLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setLocationGranted(true);
          loadNearbyBirds(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.log('Location access denied:', error);
          setLocationGranted(false);
        }
      );
    }
  };

  const loadInitialData = async () => {
    setLoading(true);
    try {
      // Load featured bird species
      const species = await searchINatSpecies('bird');
      setBirdSpecies(species.slice(0, 12));

      // Load bird images
      const images = await getRandomBirdImages(6);
      setBirdImages(images);

      // Load notable sightings
      const notable = await getNotableObservations('US', 7);
      setRecentSightings(notable.slice(0, 10));
    } catch (error) {
      console.error('Error loading bird data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadNearbyBirds = async (lat: number, lng: number) => {
    try {
      const nearby = await getNearbyObservations(lat, lng, 25, 7);
      if (nearby.length > 0) {
        setRecentSightings(nearby);
      }
    } catch (error) {
      console.error('Error loading nearby birds:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const results = await searchINatSpecies(searchQuery);
      setBirdSpecies(results);
    } catch (error) {
      console.error('Error searching birds:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'explore' as const, label: 'Explore Birds', icon: '🦜' },
    { id: 'sightings' as const, label: 'Recent Sightings', icon: '📍' },
    { id: 'calls' as const, label: 'Bird Calls', icon: '🔊' },
    { id: 'checklist' as const, label: 'My Checklist', icon: '✅' },
    { id: 'identify' as const, label: 'Identify', icon: '🔍' },
  ];

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

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
              <div className="px-6 py-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <div className="text-3xl mb-2">🔊</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">Bird Calls</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Listen & learn</div>
              </div>
              <div className="px-6 py-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <div className="text-3xl mb-2">📍</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {locationGranted ? 'Nearby Sightings' : 'Notable Sightings'}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {recentSightings.length} recent
                </div>
              </div>
              <div className="px-6 py-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <div className="text-3xl mb-2">✅</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">Checklist</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Track your sightings</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <section className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-16 z-30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex gap-2 overflow-x-auto pb-2 pt-4">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Content based on active tab */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Explore Tab */}
            {activeTab === 'explore' && (
              <div className="space-y-8">
                {/* Search Bar */}
                <div className="flex gap-4">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder="Search for bird species..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      className="w-full px-4 py-3 pl-12 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
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
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Search
                  </button>
                </div>

                {/* Bird Species Grid */}
                {loading ? (
                  <div className="flex justify-center py-12">
                    <Loader />
                  </div>
                ) : birdSpecies.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {birdSpecies.map((species, index) => (
                      <div
                        key={species.id || index}
                        className="group bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:scale-105"
                      >
                        <div className="relative h-48 bg-gray-200 dark:bg-gray-700 overflow-hidden">
                          {species.default_photo?.medium_url || birdImages[index % birdImages.length] ? (
                            <img
                              src={species.default_photo?.medium_url || birdImages[index % birdImages.length]}
                              alt={species.name || species.preferred_common_name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-6xl">
                              🐦
                            </div>
                          )}
                        </div>
                        <div className="p-4 space-y-2">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                            {species.preferred_common_name || species.name}
                          </h3>
                          {species.name && species.name !== species.preferred_common_name && (
                            <p className="text-sm italic text-gray-600 dark:text-gray-400">
                              {species.name}
                            </p>
                          )}
                          <Link
                            to={`/animal/${encodeURIComponent(species.preferred_common_name || species.name)}`}
                            className="block mt-3 text-center px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                          >
                            Learn More →
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title="No birds found"
                    message="Try searching for a different species"
                  />
                )}
              </div>
            )}

            {/* Recent Sightings Tab */}
            {activeTab === 'sightings' && (
              <div className="space-y-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    {locationGranted ? '📍 Birds Near You' : '🌟 Notable Bird Sightings'}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    {locationGranted
                      ? `Recent bird sightings within 25 km of your location`
                      : 'Notable and rare bird sightings across the United States'}
                  </p>
                  {!locationGranted && (
                    <button
                      onClick={requestLocation}
                      className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      Enable Location for Nearby Birds
                    </button>
                  )}
                </div>

                {recentSightings.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {recentSightings.map((sighting, index) => (
                      <div
                        key={index}
                        className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                              {sighting.comName}
                            </h3>
                            <p className="text-sm italic text-gray-600 dark:text-gray-400">
                              {sighting.sciName}
                            </p>
                            <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                              📍 {sighting.locName}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                              {new Date(sighting.obsDt).toLocaleDateString()} • {sighting.howMany || 1} observed
                            </p>
                          </div>
                          <Link
                            to={`/animal/${encodeURIComponent(sighting.comName)}`}
                            className="ml-4 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-sm font-medium rounded hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                          >
                            View
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title="No recent sightings"
                    message="Check back later for new bird observations"
                  />
                )}
              </div>
            )}

            {/* Bird Calls Tab */}
            {activeTab === 'calls' && (
              <div className="bg-white dark:bg-gray-800 p-12 rounded-lg shadow-md text-center">
                <div className="text-6xl mb-4">🔊</div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Bird Calls Library
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Listen to and learn bird calls from around the world using xeno-canto recordings
                </p>
                <div className="inline-block px-6 py-3 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg">
                  Coming Soon
                </div>
              </div>
            )}

            {/* Checklist Tab */}
            {activeTab === 'checklist' && (
              <div className="bg-white dark:bg-gray-800 p-12 rounded-lg shadow-md text-center">
                <div className="text-6xl mb-4">✅</div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Birdwatching Checklist
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Track your bird sightings, build your life list, and earn achievements
                </p>
                <div className="inline-block px-6 py-3 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg">
                  Coming Soon
                </div>
              </div>
            )}

            {/* Identify Tab */}
            {activeTab === 'identify' && (
              <div className="bg-white dark:bg-gray-800 p-12 rounded-lg shadow-md text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Bird Identification Guide
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Identify birds by size, color, habitat, and region
                </p>
                <div className="inline-block px-6 py-3 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg">
                  Coming Soon
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

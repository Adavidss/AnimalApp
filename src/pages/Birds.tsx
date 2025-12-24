import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getNearbyObservations, getNotableObservations } from '../api/ebird';
import { EBirdObservation } from '../types/animal';
import { getCategoryTheme } from '../utils/categories';
import Loader from '../components/Loader';
import { EmptyState } from '../components/ErrorState';
import { fetchAnimalSounds, searchXenoCantoRecordings } from '../api/xenocanto';
import { XenoCantoRecording } from '../types/animal';
import { searchINatSpecies, INatTaxon } from '../api/inaturalist';
import SoundPlayer from '../components/SoundPlayer';
import { fetchWikipediaSummary } from '../api/wikipedia';
import { getAutocompleteSuggestions } from '../utils/searchHelpers';
import { addToFavorites, removeFromFavorites, isFavorite } from '../utils/favorites';
import Pagination from '../components/Pagination';

export default function Birds() {
  const [activeTab, setActiveTab] = useState<'explore' | 'sightings' | 'sounds'>('explore');
  const [loading, setLoading] = useState(false);
  const [recentSightings, setRecentSightings] = useState<EBirdObservation[]>([]);
  const [locationGranted, setLocationGranted] = useState(false);
  const [_userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  
  // Bird search (Explore tab) - single bird display
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBird, setSelectedBird] = useState<any | null>(null);
  const [birdWikipedia, setBirdWikipedia] = useState<any | null>(null);
  const [birdSounds, setBirdSounds] = useState<XenoCantoRecording[]>([]);
  const [loadingBirdData, setLoadingBirdData] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isBirdFavorite, setIsBirdFavorite] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  
  // Bird cards view - 10 per page
  const [birdCards, setBirdCards] = useState<INatTaxon[]>([]);
  const [loadingBirdCards, setLoadingBirdCards] = useState(false);
  const [birdCardsPage, setBirdCardsPage] = useState(1);
  const [birdSoundCache, setBirdSoundCache] = useState<Record<string, XenoCantoRecording[]>>({});
  const [playingSounds, setPlayingSounds] = useState<Record<string, HTMLAudioElement | null>>({});
  const BIRDS_PER_PAGE = 10;
  
  
  // Xeno-Canto search (Bird Sounds tab) - filters only, no bird name search
  const [xcSearchType, setXcSearchType] = useState('');
  const [xcSearchQuality, setXcSearchQuality] = useState('');
  const [xcSearchSex, setXcSearchSex] = useState('');
  const [xcSearchYear, setXcSearchYear] = useState('');
  const [xcSearchResults, setXcSearchResults] = useState<XenoCantoRecording[]>([]);
  const [xcSearchNumRecordings, setXcSearchNumRecordings] = useState(0);
  const [xcSearchNumSpecies, setXcSearchNumSpecies] = useState(0);
  const [xcCurrentPage, setXcCurrentPage] = useState(1);
  const xcResultsPerPage = 10; // Already 10 per page

  const categoryTheme = getCategoryTheme('birds');

  useEffect(() => {
    loadInitialData();
    requestLocation();
    loadBirdCards();
    
    // Close suggestions when clicking outside
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    loadBirdCards();
  }, [birdCardsPage]);

  // Update suggestions when query changes
  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      const autocompleteResults = getAutocompleteSuggestions(searchQuery.trim(), 8);
      setSuggestions(autocompleteResults);
      setShowSuggestions(autocompleteResults.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery]);


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
          // Silently handle user denial - don't log errors
          if (error.code !== error.PERMISSION_DENIED) {
            console.log('Location error:', error);
          }
          setLocationGranted(false);
        }
      );
    }
  };

  const loadInitialData = async () => {
    setLoading(true);
    try {
      // Load notable sightings
      const notable = await getNotableObservations('US', 7);
      setRecentSightings(notable.slice(0, 10));
    } catch (error) {
      console.error('Error loading bird data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBirdCards = async () => {
    setLoadingBirdCards(true);
    try {
      // Load birds from iNaturalist - only 10 per page
      const results = await searchINatSpecies('aves', birdCardsPage, BIRDS_PER_PAGE);
      setBirdCards(results);
    } catch (error) {
      console.error('Error loading bird cards:', error);
      setBirdCards([]);
    } finally {
      setLoadingBirdCards(false);
    }
  };

  const handlePlaySound = async (bird: INatTaxon) => {
    const birdName = bird.preferred_common_name || bird.name;
    const scientificName = bird.name;

    // Stop any currently playing sounds
    Object.values(playingSounds).forEach(audio => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    });
    setPlayingSounds({});

    // Check cache first
    if (birdSoundCache[scientificName] && birdSoundCache[scientificName].length > 0) {
      const cachedSounds = birdSoundCache[scientificName];
      playFirstRecording(cachedSounds[0], birdName);
      return;
    }

    // Fetch sounds from Xeno-Canto
    try {
      const sounds = await fetchAnimalSounds(scientificName, 1);
      if (sounds && sounds.length > 0) {
        setBirdSoundCache(prev => ({ ...prev, [scientificName]: sounds }));
        playFirstRecording(sounds[0], birdName);
      } else {
        // Try common name as fallback
        const fallbackSounds = await fetchAnimalSounds(birdName, 1);
        if (fallbackSounds && fallbackSounds.length > 0) {
          setBirdSoundCache(prev => ({ ...prev, [scientificName]: fallbackSounds }));
          playFirstRecording(fallbackSounds[0], birdName);
        }
      }
    } catch (error) {
      console.error('Error fetching bird sounds:', error);
    }
  };

  const playFirstRecording = (recording: XenoCantoRecording, birdName: string) => {
    const soundUrl = recording.file.startsWith('//') 
      ? `https:${recording.file}` 
      : recording.file;
    
    const audio = new Audio(soundUrl);
    audio.play().catch(err => {
      console.error('Error playing audio:', err);
    });

    setPlayingSounds({ [birdName]: audio });

    audio.addEventListener('ended', () => {
      setPlayingSounds(prev => {
        const updated = { ...prev };
        delete updated[birdName];
        return updated;
      });
    });
  };

  const handleStopSound = (birdName: string) => {
    const audio = playingSounds[birdName];
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      setPlayingSounds(prev => {
        const updated = { ...prev };
        delete updated[birdName];
        return updated;
      });
    }
  };

  const isSoundPlaying = (birdName: string) => {
    return !!playingSounds[birdName];
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

  const handleBirdSearch = async (query?: string) => {
    const searchTerm = query || searchQuery.trim();
    if (!searchTerm) return;
    
    setLoadingBirdData(true);
    setSelectedBird(null);
    setBirdWikipedia(null);
    setBirdSounds([]);
    setShowSuggestions(false);
    
    try {
      // Search for birds using iNaturalist
      const results = await searchINatSpecies(searchTerm, 1, 10);
      
      // Filter to only birds (iconic_taxon_name should be 'Aves')
      const birdResults = results.filter(
        (species) => 
          species.iconic_taxon_name === 'Aves' || 
          species.name.toLowerCase().includes('aves') ||
          species.preferred_common_name?.toLowerCase().includes('bird')
      );
      
      if (birdResults.length > 0) {
        const bird = birdResults[0]; // Take first result
        setSelectedBird(bird);
        
        // Automatically load Wikipedia summary and sounds (like Bird-App)
        const birdName = bird.preferred_common_name || bird.name;
        const scientificName = bird.name; // This is the scientific name from iNaturalist
        setIsBirdFavorite(isFavorite(birdName));
        
        // Fetch Wikipedia summary first
        const wikipedia = await fetchWikipediaSummary(birdName);
        setBirdWikipedia(wikipedia);
        
        // Then automatically fetch sounds using scientific name (like Bird-App does)
        // The Bird-App uses scientific name for better Xeno-Canto results
        setTimeout(async () => {
          try {
            const sounds = await fetchAnimalSounds(scientificName, 5);
            if (sounds && sounds.length > 0) {
              setBirdSounds(sounds);
            }
          } catch (error) {
            // If scientific name fails, try common name as fallback
            try {
              const sounds = await fetchAnimalSounds(birdName, 5);
              if (sounds && sounds.length > 0) {
                setBirdSounds(sounds);
              }
            } catch (err) {
              console.debug('Could not fetch sounds for bird:', err);
            }
          }
        }, 500); // Small delay like Bird-App
      } else {
        setSelectedBird(null);
        setIsBirdFavorite(false);
      }
    } catch (error) {
      console.error('Error searching birds:', error);
      setSelectedBird(null);
    } finally {
      setLoadingBirdData(false);
    }
  };

  const handleXenoCantoSearch = async () => {
    setLoading(true);
    setXcCurrentPage(1);
    
    try {
      // Build filter-based query (like Bird-App, no bird name field)
      const queryParts: string[] = [];
      
      if (xcSearchType) {
        queryParts.push(`type:${xcSearchType}`);
      }
      
      if (xcSearchQuality) {
        queryParts.push(`q:${xcSearchQuality}`);
      }
      
      if (xcSearchSex) {
        queryParts.push(`sex:${xcSearchSex}`);
      }
      
      if (xcSearchYear) {
        queryParts.push(`year:${xcSearchYear}`);
      }
      
      // Always add grp:birds to ensure we only get birds
      queryParts.push('grp:birds');
      
      const finalQuery = queryParts.join('+');
      
      // Use searchXenoCantoRecordings for filter-based searches
      const recordings = await searchXenoCantoRecordings({
        query: finalQuery,
        limit: 500
      });
      
      // Calculate unique species count
      const uniqueSpecies = new Set(recordings.map(r => `${r.gen} ${r.sp}`));
      
      setXcSearchResults(recordings);
      setXcSearchNumRecordings(recordings.length);
      setXcSearchNumSpecies(uniqueSpecies.size);
    } catch (error) {
      console.error('Error searching Xeno-Canto:', error);
      setXcSearchResults([]);
      setXcSearchNumRecordings(0);
      setXcSearchNumSpecies(0);
    } finally {
      setLoading(false);
    }
  };

  const changeXenoCantoPage = (page: number) => {
    const totalPages = Math.ceil(xcSearchResults.length / xcResultsPerPage);
    if (page >= 1 && page <= totalPages) {
      setXcCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  const getPaginatedResults = () => {
    const startIndex = (xcCurrentPage - 1) * xcResultsPerPage;
    const endIndex = startIndex + xcResultsPerPage;
    return xcSearchResults.slice(startIndex, endIndex);
  };

  const tabs = [
    { id: 'explore' as const, label: 'Explore Birds', icon: '🦜' },
    { id: 'sightings' as const, label: 'Recent Sightings', icon: '📍' },
    { id: 'sounds' as const, label: 'Bird Sounds', icon: '🔊' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          {/* Header */}
          <section
            className="py-12 bg-gradient-to-br"
            style={{
              backgroundImage: `linear-gradient(to bottom right, ${categoryTheme.primaryColor}20, ${categoryTheme.accentColor}20)`
            }}
          >
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto text-center space-y-4">
                <div className="text-6xl">{categoryTheme.emoji}</div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                  {categoryTheme.name}
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-300">
                  {categoryTheme.description}
                </p>
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
            {/* Explore Tab - Bird Search */}
            {activeTab === 'explore' && (
              <div className="space-y-8">
                {/* Bird Name Search */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    Search by Bird Name
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Search for any bird by name to see its image and info
                  </p>
                  
                  <div ref={searchContainerRef} className="flex gap-4 relative">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                        placeholder="Search up birds, e.g. Cackling Goose"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => {
                          if (suggestions.length > 0) setShowSuggestions(true);
                        }}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleBirdSearch();
                            setShowSuggestions(false);
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Escape') {
                            setShowSuggestions(false);
                          }
                        }}
                        className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                      />
                      
                      {/* Autocomplete Suggestions */}
                      {showSuggestions && suggestions.length > 0 && (
                        <div className="absolute z-10 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden">
                          <div className="max-h-60 overflow-y-auto">
                            {suggestions.map((suggestion, index) => (
                              <button
                                key={index}
                                onClick={() => {
                                  setSearchQuery(suggestion);
                                  handleBirdSearch(suggestion);
                                  setShowSuggestions(false);
                                }}
                                className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                              >
                                <span className="text-sm text-gray-700 dark:text-gray-300">{suggestion}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleBirdSearch()}
                      disabled={loadingBirdData}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loadingBirdData ? 'Searching...' : 'Search Bird'}
                    </button>
                  </div>
                </div>

                {/* Bird Search Results - Single Bird Display (like Bird-App) */}
                {loadingBirdData ? (
                  <div className="flex justify-center py-12">
                    <Loader />
                  </div>
                ) : selectedBird ? (
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                    {(() => {
                      const birdName = selectedBird.preferred_common_name || selectedBird.name;
                      const imageUrl = selectedBird.default_photo?.medium_url || selectedBird.default_photo?.large_url;
                      
                      return (
                        <>
                          {/* Bird Image */}
                          <div className="relative w-full h-64 md:h-96 bg-gray-200 dark:bg-gray-700 overflow-hidden flex items-center justify-center">
                            {imageUrl ? (
                              <img
                                src={imageUrl}
                                alt={birdName}
                                className="max-w-full max-h-full object-contain"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = '';
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                            />
                          ) : (
                              <div className="w-full h-full flex items-center justify-center text-8xl">
                              🐦
                            </div>
                          )}
                          
                            {/* Favorite Button */}
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                const favoriteAnimal = {
                                  id: selectedBird.id?.toString() || birdName,
                                  name: birdName,
                                  taxonomy: {
                                    scientific_name: selectedBird.name || ''
                                  },
                                  images: selectedBird.default_photo ? [{
                                    urls: {
                                      small: selectedBird.default_photo.medium_url || '',
                                      regular: selectedBird.default_photo.medium_url || ''
                                    }
                                  }] : []
                                };
                                
                                if (isBirdFavorite) {
                                  removeFromFavorites(birdName);
                                  setIsBirdFavorite(false);
                                } else {
                                  addToFavorites(favoriteAnimal as any);
                                  setIsBirdFavorite(true);
                                }
                              }}
                              className="absolute top-4 left-4 p-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full hover:bg-white dark:hover:bg-gray-800 transition-colors shadow-lg z-10"
                              aria-label={isBirdFavorite ? 'Remove from favorites' : 'Add to favorites'}
                              title={isBirdFavorite ? 'Remove from favorites' : 'Add to favorites'}
                            >
                              {isBirdFavorite ? (
                                <svg
                                  className="w-6 h-6 text-yellow-500 fill-current"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ) : (
                                <svg
                                  className="w-6 h-6 text-gray-400 hover:text-yellow-500 transition-colors"
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
                        </div>
                          
                          {/* Bird Name */}
                          <div className="p-6 text-center border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                              {birdName}
                          </h3>
                            {selectedBird.name && selectedBird.name !== birdName && (
                              <p className="text-lg italic text-gray-600 dark:text-gray-400">
                                {selectedBird.name}
                              </p>
                            )}
                          </div>
                          
                          {/* Wikipedia Summary and Sound Player */}
                          {(birdWikipedia?.extract || birdSounds.length > 0) && (
                            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                              <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                                Overview
                              </h4>
                              
                              {birdWikipedia?.extract && (
                                <>
                                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                                    {birdWikipedia.extract}
                                  </p>
                                  {birdWikipedia.url && (
                                    <a
                                      href={birdWikipedia.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium mb-4"
                                    >
                                      Read more on Wikipedia →
                                    </a>
                                  )}
                                </>
                              )}
                              
                              {/* Sound Player (in overview section) */}
                              {birdSounds.length > 0 && (
                                <div className="mt-4">
                                  <h5 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                                    Bird Sounds
                                  </h5>
                                  <SoundPlayer recordings={birdSounds} animalName={birdName} />
                                </div>
                              )}
                            </div>
                          )}
                          
                          {/* Link to Full Details */}
                          <div className="p-6 bg-gray-50 dark:bg-gray-900/50">
                          <Link
                              to={`/animal/${encodeURIComponent(birdName)}`}
                              className="block w-full text-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                          >
                              View Full Details →
                          </Link>
                        </div>
                        </>
                      );
                    })()}
                      </div>
                ) : !loadingBirdData && searchQuery ? (
                  <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-gray-600 dark:text-gray-400 text-lg">
                      No birds found for "{searchQuery}". Try searching for a different bird name.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Bird Cards Grid - 10 per page */}
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                          Explore Birds
                        </h3>
                      </div>

                      {loadingBirdCards ? (
                        <div className="flex justify-center py-12">
                          <Loader />
                        </div>
                      ) : birdCards.length > 0 ? (
                        <>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {birdCards.map((bird) => {
                              const birdName = bird.preferred_common_name || bird.name;
                              const imageUrl = bird.default_photo?.medium_url;
                              const isPlaying = isSoundPlaying(birdName);
                              
                              return (
                                <div
                                  key={bird.id || bird.name}
                                  className="group bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:scale-105"
                                >
                                  {/* Bird Image */}
                                  <div className="relative h-48 bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 overflow-hidden flex items-center justify-center">
                                    {imageUrl ? (
                                      <img
                                        src={imageUrl}
                                        alt={birdName}
                                        className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
                                        onError={(e) => {
                                          e.currentTarget.style.display = 'none';
                                          const parent = e.currentTarget.parentElement;
                                          if (parent) {
                                            parent.innerHTML = `<div class="w-full h-full flex items-center justify-center text-6xl">🐦</div>`;
                                          }
                                        }}
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-6xl">
                                        🐦
                                      </div>
                                    )}
                                    {/* Favorite Button */}
                                    <button
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        const favoriteAnimal = {
                                          id: bird.id?.toString() || birdName,
                                          name: birdName,
                                          taxonomy: {
                                            scientific_name: bird.name || ''
                                          },
                                          images: bird.default_photo ? [{
                                            urls: {
                                              small: bird.default_photo.medium_url || '',
                                              regular: bird.default_photo.medium_url || ''
                                            }
                                          }] : []
                                        };
                                        
                                        if (isFavorite(birdName)) {
                                          removeFromFavorites(birdName);
                                        } else {
                                          addToFavorites(favoriteAnimal as any);
                                        }
                                      }}
                                      className="absolute top-2 right-2 p-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full hover:bg-white dark:hover:bg-gray-800 transition-colors shadow-lg z-10"
                                      title={isFavorite(birdName) ? 'Remove from favorites' : 'Add to favorites'}
                                    >
                                      {isFavorite(birdName) ? (
                                        <svg className="w-5 h-5 text-yellow-500 fill-current" viewBox="0 0 20 20">
                                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                      ) : (
                                        <svg className="w-5 h-5 text-gray-400 hover:text-yellow-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                        </svg>
                                      )}
                                    </button>
                                  </div>

                                  {/* Bird Info */}
                                  <div className="p-4">
                                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1 truncate">
                                      {birdName}
                                    </h4>
                                    {bird.name && bird.name !== birdName && (
                                      <p className="text-sm italic text-gray-600 dark:text-gray-400 mb-3 truncate">
                                        {bird.name}
                                      </p>
                                    )}
                                    
                                    {/* Play Sound Button */}
                                    <button
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        if (isPlaying) {
                                          handleStopSound(birdName);
                                        } else {
                                          handlePlaySound(bird);
                                        }
                                      }}
                                      className="w-full mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                                    >
                                      {isPlaying ? (
                                        <>
                                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                                          </svg>
                                          Stop Sound
                                        </>
                                      ) : (
                                        <>
                                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M8 5v14l11-7z" />
                                          </svg>
                                          Play Sound
                                        </>
                                      )}
                                    </button>

                                    {/* View Details Link */}
                                    <Link
                                      to={`/animal/${encodeURIComponent(birdName)}`}
                                      className="block w-full mt-2 text-center px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors"
                                    >
                                      View Details →
                                    </Link>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Pagination */}
                          <div className="flex justify-center mt-6">
                            <Pagination
                              currentPage={birdCardsPage}
                              totalPages={10}
                              onPageChange={setBirdCardsPage}
                              itemsPerPage={BIRDS_PER_PAGE}
                            />
                          </div>
                        </>
                      ) : (
                        <EmptyState
                          title="No birds found"
                          message="Try refreshing the page or check your connection"
                        />
                      )}
                    </div>
                  </>
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
                    {recentSightings.map((sighting, index) => {
                      return (
                      <div
                        key={index}
                        className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                      >
                          <div className="flex items-start justify-between mb-3">
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
                            <div className="flex gap-2 ml-4">
                          <Link
                            to={`/animal/${encodeURIComponent(sighting.comName)}`}
                                className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-sm font-medium rounded hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                          >
                            View
                          </Link>
                        </div>
                      </div>
                          
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <EmptyState
                    title="No recent sightings"
                    message="Check back later for new bird observations"
                  />
                )}
              </div>
            )}

            {/* Bird Sounds Tab - Xeno-Canto Search */}
            {activeTab === 'sounds' && (
              <div className="space-y-8">
                {/* Xeno-Canto Search Form */}
                <div className="bg-gradient-to-br from-blue-50 to-teal-50 dark:from-blue-900/20 dark:to-teal-900/20 rounded-xl p-6 border-2 border-blue-200 dark:border-blue-800">
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    🎵 Search Xeno-Canto Recordings
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm md:text-base">
                    Search for bird sound recordings with advanced filters from Xeno-Canto
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block mb-2 font-semibold text-gray-700 dark:text-gray-300 text-sm">
                        Sound Type:
                      </label>
                      <select
                        value={xcSearchType}
                        onChange={(e) => setXcSearchType(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Any</option>
                        <option value="song">Song</option>
                        <option value="call">Call</option>
                        <option value="alarm">Alarm</option>
                        <option value="drumming">Drumming</option>
                        <option value="flight call">Flight Call</option>
                      </select>
                    </div>
                    <div>
                      <label className="block mb-2 font-semibold text-gray-700 dark:text-gray-300 text-sm">
                        Quality:
                      </label>
                      <select
                        value={xcSearchQuality}
                        onChange={(e) => setXcSearchQuality(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Any</option>
                        <option value="A">A (Excellent)</option>
                        <option value="B">B (Good)</option>
                        <option value="C">C (Fair)</option>
                        <option value="D">D (Poor)</option>
                        <option value="E">E (Very Poor)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block mb-2 font-semibold text-gray-700 dark:text-gray-300 text-sm">
                        Sex:
                      </label>
                      <select
                        value={xcSearchSex}
                        onChange={(e) => setXcSearchSex(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Any</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                    </div>
                    <div>
                      <label className="block mb-2 font-semibold text-gray-700 dark:text-gray-300 text-sm">
                        Year:
                      </label>
                      <input
                        type="number"
                        value={xcSearchYear}
                        onChange={(e) => setXcSearchYear(e.target.value)}
                        placeholder="e.g., 2020"
                        min="1900"
                        max="2025"
                        className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  <button
                    onClick={handleXenoCantoSearch}
                    disabled={loading}
                    className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Searching...
                      </>
                    ) : (
                      <>
                        🔍 Search Recordings
                      </>
                    )}
                  </button>
                </div>

                {/* Search Results */}
                {loading && xcSearchResults.length === 0 ? (
                  <div className="flex justify-center py-12">
                    <Loader />
                  </div>
                ) : xcSearchResults.length > 0 ? (
                  <div className="space-y-6">
                    {/* Results Header */}
                    <div className="bg-teal-50 dark:bg-teal-900/20 rounded-lg p-4">
                      <strong className="text-gray-900 dark:text-white">
                        Found {xcSearchNumRecordings} recording{xcSearchNumRecordings !== 1 ? 's' : ''}
                      </strong>
                      {xcSearchNumSpecies > 0 && (
                        <span className="text-gray-600 dark:text-gray-400 ml-2">
                          from {xcSearchNumSpecies} species
                        </span>
                      )}
                      {Math.ceil(xcSearchResults.length / xcResultsPerPage) > 1 && (
                        <span className="text-gray-600 dark:text-gray-400 ml-2">
                          • Page {xcCurrentPage} of {Math.ceil(xcSearchResults.length / xcResultsPerPage)}
                        </span>
                      )}
                    </div>

                    {/* Results List */}
                    <div className="space-y-6">
                      {getPaginatedResults().map((recording, index) => {
                        const soundUrl = recording.file.startsWith('//') 
                          ? `https:${recording.file}` 
                          : recording.file;
                        
                        const xcUrl = recording.url && recording.url.startsWith('//')
                          ? `https:${recording.url}`
                          : recording.url || `https://xeno-canto.org/${recording.id}`;
                        
                        const sonogramUrl = recording.sono && recording.sono.med
                          ? (recording.sono.med.startsWith('//') ? `https:${recording.sono.med}` : recording.sono.med)
                          : null;

                        return (
                          <div key={recording.id || index} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                                  {recording.en || `${recording.gen} ${recording.sp}`}
                                </h3>
                                <div className="text-gray-600 dark:text-gray-400 italic">
                                  {recording.gen} {recording.sp}{recording.ssp ? ` ${recording.ssp}` : ''}
                                </div>
                              </div>
                              <div className="text-right text-sm text-gray-600 dark:text-gray-400">
                                <div><strong>Quality:</strong> {recording.q || 'N/A'}</div>
                                <div><strong>ID:</strong> {recording.id}</div>
                              </div>
                            </div>
                            
                            {/* Sonogram */}
                            {sonogramUrl && (
                              <div className="mb-4">
                                <img 
                                  src={sonogramUrl} 
                                  alt="Sonogram" 
                                  className="w-full max-w-2xl rounded-lg shadow-md"
                                />
                              </div>
                            )}
                            
                            {/* Audio Player */}
                            <audio 
                              controls 
                              controlsList="nodownload" 
                              className="w-full mb-4"
                            >
                              <source src={soundUrl} type="audio/mpeg" />
                              Your browser does not support the audio element.
                            </audio>
                            
                            {/* Information Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-teal-50 dark:bg-teal-900/20 rounded-lg mb-4">
                              <div className="space-y-2 text-sm">
                                <div>
                                  <strong className="text-gray-700 dark:text-gray-300">📍 Location:</strong>{' '}
                                  <span className="text-gray-600 dark:text-gray-400">{recording.loc || 'Unknown'}</span>
                                </div>
                                <div>
                                  <strong className="text-gray-700 dark:text-gray-300">🌍 Country:</strong>{' '}
                                  <span className="text-gray-600 dark:text-gray-400">{recording.cnt || 'Unknown'}</span>
                                </div>
                                {(recording.lat || recording.lon || recording.lng) && (
                                  <div>
                                    <strong className="text-gray-700 dark:text-gray-300">🗺️ Coordinates:</strong>{' '}
                                    <span className="text-gray-600 dark:text-gray-400">
                                      {recording.lat || 'N/A'}, {recording.lon || recording.lng || 'N/A'}
                                    </span>
                                  </div>
                                )}
                                {recording.alt && (
                                  <div>
                                    <strong className="text-gray-700 dark:text-gray-300">⛰️ Altitude:</strong>{' '}
                                    <span className="text-gray-600 dark:text-gray-400">{recording.alt}m</span>
                                  </div>
                                )}
                              </div>
                              <div className="space-y-2 text-sm">
                                <div>
                                  <strong className="text-gray-700 dark:text-gray-300">👤 Recordist:</strong>{' '}
                                  <span className="text-gray-600 dark:text-gray-400">{recording.rec || 'Unknown'}</span>
                                </div>
                                <div>
                                  <strong className="text-gray-700 dark:text-gray-300">🎵 Type:</strong>{' '}
                                  <span className="text-gray-600 dark:text-gray-400">{recording.type || 'Unknown'}</span>
                                </div>
                                {recording.sex && (
                                  <div>
                                    <strong className="text-gray-700 dark:text-gray-300">⚥ Sex:</strong>{' '}
                                    <span className="text-gray-600 dark:text-gray-400">{recording.sex}</span>
                                  </div>
                                )}
                                {recording.stage && (
                                  <div>
                                    <strong className="text-gray-700 dark:text-gray-300">🐣 Stage:</strong>{' '}
                                    <span className="text-gray-600 dark:text-gray-400">{recording.stage}</span>
                                  </div>
                                )}
                                {recording.length && (
                                  <div>
                                    <strong className="text-gray-700 dark:text-gray-300">⏱️ Length:</strong>{' '}
                                    <span className="text-gray-600 dark:text-gray-400">{recording.length}</span>
                                  </div>
                                )}
                                {recording.date && (
                                  <div>
                                    <strong className="text-gray-700 dark:text-gray-300">📅 Date:</strong>{' '}
                                    <span className="text-gray-600 dark:text-gray-400">
                                      {recording.date}{recording.time ? ` at ${recording.time}` : ''}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {/* Remarks */}
                            {recording.rmk && (
                              <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 rounded text-sm text-gray-700 dark:text-gray-300">
                                <strong>📝 Remarks:</strong> {recording.rmk}
                              </div>
                            )}
                            
                            {/* Other species */}
                            {recording.also && recording.also.length > 0 && (
                              <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                                <strong>🐦 Also in recording:</strong> {recording.also.join(', ')}
              </div>
            )}

                            {/* Links */}
                            <div className="flex flex-wrap gap-4">
                              <a
                                href={xcUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold flex items-center gap-1"
                              >
                                🔗 View on Xeno-canto →
                              </a>
                              {recording.lic && (
                                <a
                                  href={recording.lic.startsWith('//') ? `https:${recording.lic}` : recording.lic}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold"
                                >
                                  📜 License →
                                </a>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Pagination */}
                    {xcSearchNumRecordings > xcResultsPerPage && (
                      <div className="mt-6">
                        <Pagination
                          currentPage={xcCurrentPage}
                          totalPages={Math.ceil(xcSearchNumRecordings / xcResultsPerPage)}
                          onPageChange={changeXenoCantoPage}
                          itemsPerPage={xcResultsPerPage}
                          totalItems={xcSearchNumRecordings}
                          showingStart={((xcCurrentPage - 1) * xcResultsPerPage) + 1}
                          showingEnd={Math.min(xcCurrentPage * xcResultsPerPage, xcSearchNumRecordings)}
                        />
                      </div>
                    )}
                  </div>
                ) : !loading ? (
                  <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-gray-600 dark:text-gray-400 text-lg">
                      No recordings yet. Use the search filters above to find bird sounds from Xeno-Canto.
                    </p>
                </div>
                ) : null}
              </div>
            )}


          </div>
        </div>
      </section>
    </div>
  );
}

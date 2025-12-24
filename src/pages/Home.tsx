import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAnimal } from '../context/AnimalContext';
import SearchBar from '../components/SearchBar';
import FactCard from '../components/FactCard';
import {
  getTrendingAnimals,
  getSeasonalAnimals,
  getCurrentSeason,
} from '../utils/animalDiscovery';
import { getRandomFact, AnimalFact } from '../data/animalFacts';
import { addToFavorites, removeFromFavorites, isFavorite } from '../utils/favorites';

export default function Home() {
  const navigate = useNavigate();
  const { animalOfTheDay, refreshAnimalOfTheDay, loading, enrichAnimal } = useAnimal();

  const [trendingAnimals, setTrendingAnimals] = useState<string[]>([]);
  const [trendingAnimalsData, setTrendingAnimalsData] = useState<any[]>([]);
  const [seasonalAnimals, setSeasonalAnimals] = useState<ReturnType<typeof getSeasonalAnimals>>([]);
  const [seasonalAnimalsData, setSeasonalAnimalsData] = useState<any[]>([]);
  const [currentSeason, setCurrentSeason] = useState<string>('');
  const [currentFact, setCurrentFact] = useState<AnimalFact | null>(null);
  const [isRandomAnimalFavorite, setIsRandomAnimalFavorite] = useState(false);

  useEffect(() => {
    if (animalOfTheDay) {
      setIsRandomAnimalFavorite(isFavorite(animalOfTheDay.name));
    }
  }, [animalOfTheDay]);

  useEffect(() => {
    // Load trending and seasonal data
    const trending = getTrendingAnimals(3);
    const seasonal = getSeasonalAnimals(3);
    
    setTrendingAnimals(trending);
    setSeasonalAnimals(seasonal);
    setCurrentSeason(getCurrentSeason());
    
    // Load initial fun fact
    shuffleFact();
    
    // Fetch full animal data for featured sections
    const fetchFeaturedData = async () => {
      // Fetch Trending animals
      if (trending.length > 0 && enrichAnimal) {
        try {
          const promises = trending.map(name => enrichAnimal(name, ''));
          const results = await Promise.allSettled(promises);
          const data = results
            .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled' && r.value !== null)
            .map(r => r.value);
          setTrendingAnimalsData(data);
        } catch (error) {
          console.error('Error fetching trending animals:', error);
        }
      }
      
      // Fetch Seasonal animals
      if (seasonal.length > 0 && enrichAnimal) {
        try {
          const promises = seasonal.map(animal => enrichAnimal(animal.name, animal.scientificName));
          const results = await Promise.allSettled(promises);
          const data = results
            .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled' && r.value !== null)
            .map(r => r.value);
          setSeasonalAnimalsData(data);
        } catch (error) {
          console.error('Error fetching seasonal animals:', error);
        }
      }
    };
    
    fetchFeaturedData();
  }, [enrichAnimal]);

  const shuffleFact = () => {
    setCurrentFact(getRandomFact());
  };

  const handleSearch = (query: string) => {
    // Navigate to explorer with search query using React Router
    navigate(`/explorer?search=${encodeURIComponent(query)}`);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-800 dark:to-gray-900 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Title */}
            <div className="space-y-4 animate-fade-in">
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white">
                Discover the World's
                <span className="text-primary-600 dark:text-primary-400"> Animals</span>
              </h1>
            </div>

            {/* Search Bar */}
            <div className="animate-slide-up">
              <SearchBar onSearch={handleSearch} />
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-4 justify-center pt-4">
              <Link
                to="/explorer"
                className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors shadow-lg hover:shadow-xl"
              >
                Browse All Animals
              </Link>
              <button
                onClick={refreshAnimalOfTheDay}
                disabled={loading === 'loading'}
                className="px-6 py-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-medium rounded-lg transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading === 'loading' ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                    Loading...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    🎲 Random Animal
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Random Animal */}
      {animalOfTheDay && (
        <section className="py-8 md:py-12 bg-white dark:bg-gray-900">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2 md:gap-3">
                  <span className="text-3xl md:text-4xl">⭐</span>
                  Random Animal
                </h2>
                <button
                  onClick={refreshAnimalOfTheDay}
                  className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Refresh
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-8 items-center bg-gradient-to-br from-primary-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-2xl p-8 shadow-xl">
                <div>
                  {animalOfTheDay.images && animalOfTheDay.images.length > 0 && (
                    <div className="h-80 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <img
                        src={animalOfTheDay.images[0]?.urls.regular}
                        alt={animalOfTheDay.name}
                        className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                        loading="lazy"
                        onError={(e) => {
                          // Fallback to small size if regular fails
                          if (animalOfTheDay.images[0]?.urls.small) {
                            (e.target as HTMLImageElement).src = animalOfTheDay.images[0].urls.small;
                          }
                        }}
                      />
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        {animalOfTheDay.name}
                      </h3>
                      <p className="text-lg italic text-gray-600 dark:text-gray-400">
                        {animalOfTheDay.taxonomy?.scientific_name}
                      </p>
                    </div>
                    {/* Favorite Button */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (isRandomAnimalFavorite) {
                          removeFromFavorites(animalOfTheDay.name);
                          setIsRandomAnimalFavorite(false);
                        } else {
                          addToFavorites(animalOfTheDay);
                          setIsRandomAnimalFavorite(true);
                        }
                      }}
                      className="p-2 bg-white dark:bg-gray-800 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-lg z-10"
                      aria-label={isRandomAnimalFavorite ? 'Remove from favorites' : 'Add to favorites'}
                      title={isRandomAnimalFavorite ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      {isRandomAnimalFavorite ? (
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

                  {animalOfTheDay.wikipedia?.extract && (
                    <p className="text-gray-700 dark:text-gray-300 line-clamp-4">
                      {animalOfTheDay.wikipedia.extract}
                    </p>
                  )}

                  <Link
                    to={`/animal/${encodeURIComponent(animalOfTheDay.name)}`}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Learn More
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Trending This Week */}
      {trendingAnimals.length > 0 && (
        <section className="py-6 md:py-8 bg-white dark:bg-gray-900">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <span className="text-2xl md:text-3xl">🔥</span>
                  Trending This Week
                </h2>
                <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
                  Based on recent views
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {trendingAnimalsData.length > 0
                  ? trendingAnimalsData.map((animal, index) => (
                      <Link
                        key={animal.name}
                        to={`/animal/${encodeURIComponent(animal.name)}`}
                        className="group bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl p-4 md:p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                            #{index + 1}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                          {animal.name}
                        </h3>
                        {animal.taxonomy?.scientific_name && (
                          <p className="text-sm italic text-gray-600 dark:text-gray-400 mb-2">
                            {animal.taxonomy.scientific_name}
                          </p>
                        )}
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                          Explore this popular animal
                        </p>
                        <div className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors text-center">
                          Click to Reveal!
                        </div>
                      </Link>
                    ))
                  : trendingAnimals.map((animal, index) => (
                      <Link
                        key={animal}
                        to={`/animal/${encodeURIComponent(animal)}`}
                        className="group bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl p-4 md:p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                            #{index + 1}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                          {animal}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                          Explore this popular animal
                        </p>
                        <div className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors text-center">
                          Click to Reveal!
                        </div>
                      </Link>
                    ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Seasonal Spotlight */}
      {seasonalAnimals.length > 0 && (
        <section className="py-6 md:py-8 bg-gray-50 dark:bg-gray-800">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <span className="text-2xl md:text-3xl">
                    {currentSeason === 'spring' && '🌸'}
                    {currentSeason === 'summer' && '☀️'}
                    {currentSeason === 'fall' && '🍂'}
                    {currentSeason === 'winter' && '❄️'}
                  </span>
                  {currentSeason.charAt(0).toUpperCase() + currentSeason.slice(1)} Spotlight
                </h2>
                <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 capitalize hidden sm:block">
                  Featured {currentSeason} animals
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {seasonalAnimalsData.length > 0
                  ? seasonalAnimalsData.map((animal, index) => {
                      const seasonalInfo = seasonalAnimals[index];
                      return (
                        <Link
                          key={animal.name}
                          to={`/animal/${encodeURIComponent(animal.name)}`}
                          className="group bg-white dark:bg-gray-900 rounded-xl p-4 md:p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                        >
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                            {animal.name}
                          </h3>
                          <p className="text-sm italic text-gray-500 dark:text-gray-400 mb-3">
                            {animal.taxonomy?.scientific_name || seasonalInfo?.scientificName || 'Unknown species'}
                          </p>
                          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                            {seasonalInfo?.reason || 'Discover this seasonal animal'}
                          </p>
                          <div className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors text-center">
                            Click to Reveal!
                          </div>
                        </Link>
                      );
                    })
                    : seasonalAnimals.map((animal) => (
                      <Link
                        key={animal.name}
                        to={`/animal/${encodeURIComponent(animal.name)}`}
                        className="group bg-white dark:bg-gray-900 rounded-xl p-4 md:p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                      >
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                          {animal.name}
                        </h3>
                        <p className="text-sm italic text-gray-500 dark:text-gray-400 mb-3">
                          {animal.scientificName}
                        </p>
                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                          {animal.reason}
                        </p>
                        <div className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors text-center">
                          Click to Reveal!
                        </div>
                      </Link>
                    ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Fun Facts Section */}
      {currentFact && (
        <section className="py-6 md:py-10 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 md:mb-6 gap-4">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2 md:gap-3 mb-1 md:mb-2">
                    <span className="text-3xl md:text-4xl">✨</span>
                    Fun Facts
                  </h2>
                  <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
                    Discover amazing animal facts
                  </p>
                </div>
                <button
                  onClick={shuffleFact}
                  className="w-full sm:w-auto px-4 md:px-6 py-2 md:py-3 bg-purple-600 hover:bg-purple-700 text-white text-sm md:text-base font-medium rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                >
                  <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  New Fact
                </button>
              </div>
              <FactCard fact={currentFact} onShuffle={shuffleFact} showCategory={true} showAnimal={true} />
            </div>
          </div>
        </section>
      )}

    </div>
  );
}

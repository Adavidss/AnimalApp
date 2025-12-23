import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAnimal } from '../context/AnimalContext';
import SearchBar from '../components/SearchBar';
import CategoryCard from '../components/CategoryCard';
import { getMainCategories } from '../utils/categories';
import {
  getTrendingAnimals,
  getSeasonalAnimals,
  getAnimalOfTheHour,
  getCurrentSeason,
} from '../utils/animalDiscovery';

export default function Home() {
  const navigate = useNavigate();
  const { animalOfTheDay, refreshAnimalOfTheDay, loading } = useAnimal();
  const categories = getMainCategories();

  const [trendingAnimals, setTrendingAnimals] = useState<string[]>([]);
  const [seasonalAnimals, setSeasonalAnimals] = useState<ReturnType<typeof getSeasonalAnimals>>([]);
  const [animalOfHour, setAnimalOfHour] = useState<string>('');
  const [currentSeason, setCurrentSeason] = useState<string>('');

  useEffect(() => {
    // Load trending and seasonal data
    setTrendingAnimals(getTrendingAnimals(3));
    setSeasonalAnimals(getSeasonalAnimals(3));
    setAnimalOfHour(getAnimalOfTheHour());
    setCurrentSeason(getCurrentSeason());
  }, []);

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
                <span className="text-primary-600 dark:text-primary-400"> Wildlife</span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Explore detailed information, stunning images, and conservation status for thousands
                of animal species
              </p>
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

      {/* Animal of the Day */}
      {animalOfTheDay && (
        <section className="py-16 bg-white dark:bg-gray-900">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                  <span className="text-4xl">⭐</span>
                  Animal of the Day
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
                    <img
                      src={animalOfTheDay.images[0]?.urls.regular}
                      alt={animalOfTheDay.name}
                      className="w-full h-80 object-cover rounded-lg shadow-lg"
                    />
                  )}
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      {animalOfTheDay.name}
                    </h3>
                    <p className="text-lg italic text-gray-600 dark:text-gray-400">
                      {animalOfTheDay.taxonomy?.scientific_name}
                    </p>
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

      {/* Animal of the Hour */}
      {animalOfHour && (
        <section className="py-12 bg-gray-50 dark:bg-gray-800">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                  <span className="text-3xl">⏰</span>
                  Animal of the Hour
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Changes every hour</p>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {animalOfHour}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Discover this fascinating animal right now!
                    </p>
                  </div>
                  <Link
                    to={`/animal/${encodeURIComponent(animalOfHour)}`}
                    className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Trending This Week */}
      {trendingAnimals.length > 0 && (
        <section className="py-12 bg-white dark:bg-gray-900">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                  <span className="text-3xl">🔥</span>
                  Trending This Week
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Based on recent views
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {trendingAnimals.map((animal, index) => (
                  <Link
                    key={animal}
                    to={`/animal/${encodeURIComponent(animal)}`}
                    className="group bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                        #{index + 1}
                      </span>
                      <span className="text-2xl">📈</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {animal}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Explore this popular animal
                    </p>
                    <div className="mt-4 text-orange-600 dark:text-orange-400 font-medium group-hover:underline">
                      Learn More →
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
        <section className="py-12 bg-gray-50 dark:bg-gray-800">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                  <span className="text-3xl">
                    {currentSeason === 'spring' && '🌸'}
                    {currentSeason === 'summer' && '☀️'}
                    {currentSeason === 'fall' && '🍂'}
                    {currentSeason === 'winter' && '❄️'}
                  </span>
                  {currentSeason.charAt(0).toUpperCase() + currentSeason.slice(1)} Spotlight
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                  Featured {currentSeason} animals
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {seasonalAnimals.map((animal) => (
                  <Link
                    key={animal.name}
                    to={`/animal/${encodeURIComponent(animal.name)}`}
                    className="group bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {animal.name}
                    </h3>
                    <p className="text-sm italic text-gray-500 dark:text-gray-400 mb-3">
                      {animal.scientificName}
                    </p>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      {animal.reason}
                    </p>
                    <div className="mt-4 text-primary-600 dark:text-primary-400 font-medium group-hover:underline">
                      Discover →
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Categories Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Explore by Category
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Discover animals organized by their types and habitats
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Interactive Features
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Tools to enhance your wildlife exploration
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Compare Feature */}
              <Link
                to="/compare"
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-8 hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              >
                <div className="text-center space-y-4">
                  <div className="text-6xl">⚖️</div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Compare Animals
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Compare characteristics, habitats, and behaviors side-by-side
                  </p>
                  <div className="text-blue-600 dark:text-blue-400 font-medium group-hover:underline">
                    Start Comparing →
                  </div>
                </div>
              </Link>

              {/* Favorites Feature */}
              <Link
                to="/favorites"
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 p-8 hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              >
                <div className="text-center space-y-4">
                  <div className="text-6xl">⭐</div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Your Favorites
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Save and organize your favorite animals for quick access
                  </p>
                  <div className="text-yellow-600 dark:text-yellow-400 font-medium group-hover:underline">
                    View Favorites →
                  </div>
                </div>
              </Link>

              {/* Quiz Feature */}
              <Link
                to="/quiz"
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-8 hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              >
                <div className="text-center space-y-4">
                  <div className="text-6xl">🎮</div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Animal Quiz
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Test your knowledge with fun quizzes and challenges
                  </p>
                  <div className="text-purple-600 dark:text-purple-400 font-medium group-hover:underline">
                    Play Quiz →
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-primary-600 dark:bg-primary-800">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Explore?</h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Browse our complete database of animal species, filter by category and habitat, and
            learn about conservation efforts worldwide.
          </p>
          <Link
            to="/explorer"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white hover:bg-gray-100 text-primary-600 font-bold rounded-lg transition-colors shadow-lg hover:shadow-xl"
          >
            Start Exploring
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  );
}

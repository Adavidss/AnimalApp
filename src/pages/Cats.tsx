import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCatBreeds, getCatImagesByBreed, CatBreed } from '../api/additionalApis';
import { getCategoryTheme } from '../utils/categories';
import Loader from '../components/Loader';
import { EmptyState } from '../components/ErrorState';

export default function Cats() {
  const [breeds, setBreeds] = useState<CatBreed[]>([]);
  const [filteredBreeds, setFilteredBreeds] = useState<CatBreed[]>([]);
  const [breedImages, setBreedImages] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  const categoryTheme = getCategoryTheme('cats');

  useEffect(() => {
    loadBreeds();
  }, []);

  useEffect(() => {
    filterBreeds();
  }, [searchQuery, selectedFilter, breeds]);

  const loadBreeds = async () => {
    setLoading(true);
    try {
      const data = await getCatBreeds();
      setBreeds(data);
      setFilteredBreeds(data);

      // Load images for breeds in parallel
      const images: Record<string, string> = {};
      const imagePromises = data.slice(0, 20).map(async (breed) => {
        try {
          const breedImages = await getCatImagesByBreed(breed.id, 1);
          if (breedImages.length > 0) {
            return { id: breed.id, url: breedImages[0].url };
          }
        } catch (error) {
          console.error(`Error loading images for ${breed.name}:`, error);
        }
        return null;
      });

      const imageResults = await Promise.allSettled(imagePromises);
      imageResults.forEach((result) => {
        if (result.status === 'fulfilled' && result.value) {
          images[result.value.id] = result.value.url;
        }
      });

      setBreedImages(images);
    } catch (error) {
      console.error('Error loading cat breeds:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterBreeds = () => {
    let filtered = breeds;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(breed =>
        breed.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        breed.temperament?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        breed.origin?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by characteristics
    if (selectedFilter !== 'all') {
      switch (selectedFilter) {
        case 'child_friendly':
          filtered = filtered.filter(breed => breed.child_friendly >= 4);
          break;
        case 'dog_friendly':
          filtered = filtered.filter(breed => breed.dog_friendly >= 4);
          break;
        case 'low_energy':
          filtered = filtered.filter(breed => breed.energy_level <= 3);
          break;
        case 'high_energy':
          filtered = filtered.filter(breed => breed.energy_level >= 4);
          break;
        case 'affectionate':
          filtered = filtered.filter(breed => breed.affection_level >= 4);
          break;
        case 'indoor':
          filtered = filtered.filter(breed => breed.indoor === 1);
          break;
      }
    }

    setFilteredBreeds(filtered);
  };

  const getRandomBreed = () => {
    if (filteredBreeds.length > 0) {
      const randomIndex = Math.floor(Math.random() * filteredBreeds.length);
      const randomBreed = filteredBreeds[randomIndex];
      const element = document.getElementById(`breed-${randomBreed.id}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.classList.add('ring-4', 'ring-purple-500');
        setTimeout(() => {
          element.classList.remove('ring-4', 'ring-purple-500');
        }, 2000);
      }
    }
  };

  const filters = [
    { id: 'all', label: 'All Breeds' },
    { id: 'child_friendly', label: 'Child Friendly' },
    { id: 'dog_friendly', label: 'Dog Friendly' },
    { id: 'affectionate', label: 'Very Affectionate' },
    { id: 'indoor', label: 'Indoor Cats' },
    { id: 'low_energy', label: 'Low Energy' },
    { id: 'high_energy', label: 'High Energy' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

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
                  {breeds.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Breeds</div>
              </div>
              <div className="px-6 py-3 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <div className="text-2xl font-bold" style={{ color: categoryTheme.primaryColor }}>
                  {filteredBreeds.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Showing</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters & Search */}
      <section className="py-8 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-16 z-30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto space-y-4">
            {/* Search Bar */}
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search by name, temperament, or origin..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 pl-12 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 dark:text-white"
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
                onClick={getRandomBreed}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
              >
                <span className="text-xl">🎲</span>
                Random Breed
              </button>
            </div>

            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {filters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setSelectedFilter(filter.id)}
                  className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                    selectedFilter === filter.id
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Breeds Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {filteredBreeds.length === 0 ? (
              <EmptyState
                title="No breeds found"
                message="Try adjusting your search or filters"
                action={
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedFilter('all');
                    }}
                    className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Clear Filters
                  </button>
                }
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBreeds.map((breed) => (
                  <div
                    key={breed.id}
                    id={`breed-${breed.id}`}
                    className="group bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:scale-105"
                  >
                    {/* Image */}
                    <div className="relative h-64 bg-gray-200 dark:bg-gray-700 overflow-hidden">
                      {breedImages[breed.id] ? (
                        <img
                          src={breedImages[breed.id]}
                          alt={breed.name}
                          className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-300"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center text-6xl">🐈</div>';
                          }}
                        />
                      ) : breed.reference_image_id ? (
                        <img
                          src={`https://cdn2.thecatapi.com/images/${breed.reference_image_id}.jpg`}
                          alt={breed.name}
                          className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-300"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center text-6xl">🐈</div>';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-6xl">
                          🐈
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-3">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                          {breed.name}
                        </h3>
                        {breed.origin && (
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Origin: {breed.origin}
                          </p>
                        )}
                      </div>

                      {breed.temperament && (
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          <span className="font-semibold">Temperament:</span> {breed.temperament}
                        </p>
                      )}

                      {/* Characteristics Ratings */}
                      <div className="space-y-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-600 dark:text-gray-400">Affection</span>
                          <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => (
                              <div
                                key={i}
                                className={`w-2 h-2 rounded-full ${
                                  i < breed.affection_level ? 'bg-purple-500' : 'bg-gray-300 dark:bg-gray-600'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-600 dark:text-gray-400">Energy</span>
                          <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => (
                              <div
                                key={i}
                                className={`w-2 h-2 rounded-full ${
                                  i < breed.energy_level ? 'bg-purple-500' : 'bg-gray-300 dark:bg-gray-600'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-600 dark:text-gray-400">Child Friendly</span>
                          <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => (
                              <div
                                key={i}
                                className={`w-2 h-2 rounded-full ${
                                  i < breed.child_friendly ? 'bg-purple-500' : 'bg-gray-300 dark:bg-gray-600'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-3">
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Weight</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {breed.weight.metric} kg
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Lifespan</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {breed.life_span} years
                          </p>
                        </div>
                      </div>

                      {/* Link to detail page */}
                      <Link
                        to={`/animal/${encodeURIComponent(breed.name)}`}
                        className="block mt-4 text-center px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 font-medium rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
                      >
                        Learn More →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

import { useState, useEffect, useRef } from 'react';
import { useAnimal } from '../context/AnimalContext';
import { EnrichedAnimal } from '../types/animal';
import Loader from '../components/Loader';
import { ComparisonChart, ChartData } from '../components/ComparisonChart';
import {
  getPresetById,
  getPresetCategories,
  getPresetsByCategory,
  trackPresetUsage,
} from '../utils/comparisonPresets';
import { useToast } from '../components/Toast';
import { getAutocompleteSuggestions } from '../utils/searchHelpers';
import { getRecentSearches, addToRecentSearches } from '../utils/cache';
import { trackComparison } from '../utils/achievements';

export default function ComparisonTool() {
  const { enrichAnimal } = useAnimal();
  const { showToast } = useToast();
  const [searchInputs, setSearchInputs] = useState(['', '', '']);
  const [comparisonAnimals, setComparisonAnimals] = useState<(EnrichedAnimal | null)[]>([null, null, null]);
  const [loading, setLoading] = useState([false, false, false]);
  const [showPresets, setShowPresets] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('popular');
  const [showCharts, setShowCharts] = useState(true);
  const [savedComparisons, setSavedComparisons] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState([false, false, false]);
  const [suggestions, setSuggestions] = useState<string[][]>([[], [], []]);
  const [recentSearches] = useState<string[]>(getRecentSearches());
  const suggestionRefs = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)];

  // Load saved comparisons on mount
  useEffect(() => {
    const saved = localStorage.getItem('saved_comparisons');
    if (saved) {
      try {
        setSavedComparisons(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load saved comparisons:', error);
      }
    }

    // Check URL params for shared comparison
    const params = new URLSearchParams(window.location.search);
    const presetId = params.get('preset');
    const sharedAnimals = params.get('animals');

    if (presetId) {
      loadPreset(presetId);
    } else if (sharedAnimals) {
      const animalNames = sharedAnimals.split(',');
      animalNames.slice(0, 3).forEach((name, index) => {
        if (name) {
          const newInputs = [...searchInputs];
          newInputs[index] = decodeURIComponent(name);
          setSearchInputs(newInputs);
          setTimeout(() => handleSearch(index), index * 500);
        }
      });
    }

    // Close suggestions when clicking outside
    function handleClickOutside(event: MouseEvent) {
      suggestionRefs.forEach((ref, index) => {
        if (ref.current && !ref.current.contains(event.target as Node)) {
          const newShowSuggestions = [...showSuggestions];
          newShowSuggestions[index] = false;
          setShowSuggestions(newShowSuggestions);
        }
      });
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update suggestions when search inputs change
  useEffect(() => {
    const newSuggestions = searchInputs.map((query) => {
      if (query.trim().length > 0) {
        return getAutocompleteSuggestions(query.trim(), 6);
      }
      return [];
    });
    setSuggestions(newSuggestions);
  }, [searchInputs]);

  const handleSearch = async (index: number) => {
    const query = searchInputs[index].trim();
    if (!query) return;

    addToRecentSearches(query);
    const newShowSuggestions = [...showSuggestions];
    newShowSuggestions[index] = false;
    setShowSuggestions(newShowSuggestions);

    const newLoading = [...loading];
    newLoading[index] = true;
    setLoading(newLoading);

    try {
      const animal = await enrichAnimal(query, '');
      const newAnimals = [...comparisonAnimals];
      newAnimals[index] = animal;
      setComparisonAnimals(newAnimals);
      
      // Track comparison when at least 2 animals are loaded (only once per unique pair)
      const loadedCount = newAnimals.filter(a => a !== null).length;
      if (loadedCount === 2 && newAnimals[0] !== null && newAnimals[1] !== null) {
        // Only track once when we reach exactly 2 animals
        const comparisonKey = 'last_comparison_tracked';
        const lastTracked = localStorage.getItem(comparisonKey);
        const currentComparison = `${newAnimals[0]?.name || ''}-${newAnimals[1]?.name || ''}`;
        if (lastTracked !== currentComparison) {
          trackComparison();
          localStorage.setItem(comparisonKey, currentComparison);
        }
      }
    } catch (error) {
      console.error('Error searching animal:', error);
    } finally {
      const newLoading = [...loading];
      newLoading[index] = false;
      setLoading(newLoading);
    }
  };

  const handleRemove = (index: number) => {
    const newAnimals = [...comparisonAnimals];
    newAnimals[index] = null;
    setComparisonAnimals(newAnimals);

    const newInputs = [...searchInputs];
    newInputs[index] = '';
    setSearchInputs(newInputs);
  };

  const handleClearAll = () => {
    setComparisonAnimals([null, null, null]);
    setSearchInputs(['', '', '']);
  };

  const loadPreset = async (presetId: string) => {
    const preset = getPresetById(presetId);
    if (!preset) return;

    trackPresetUsage(presetId);
    setShowPresets(false);

    // Load animals from preset
    preset.animals.slice(0, 3).forEach((animalName, index) => {
      const newInputs = [...searchInputs];
      newInputs[index] = animalName;
      setSearchInputs(newInputs);
      setTimeout(() => handleSearch(index), index * 500);
    });

    showToast(`Loaded preset: ${preset.name}`, 'success');
  };

  const saveComparison = () => {
    const animalNames = comparisonAnimals
      .filter(a => a !== null)
      .map(a => a!.name);

    if (animalNames.length < 2) {
      showToast('Add at least 2 animals to save comparison', 'warning');
      return;
    }

    const comparisonName = prompt('Enter a name for this comparison:');
    if (!comparisonName) return;

    const newComparison = {
      id: Date.now().toString(),
      name: comparisonName,
      animals: animalNames,
      date: new Date().toISOString()
    };

    const updated = [...savedComparisons, newComparison];
    setSavedComparisons(updated);
    localStorage.setItem('saved_comparisons', JSON.stringify(updated));
    showToast('Comparison saved successfully!', 'success');
  };

  const loadSavedComparison = (comparison: any) => {
    comparison.animals.forEach((animalName: string, index: number) => {
      if (index < 3) {
        const newInputs = [...searchInputs];
        newInputs[index] = animalName;
        setSearchInputs(newInputs);
        setTimeout(() => handleSearch(index), index * 500);
      }
    });
    showToast(`Loaded: ${comparison.name}`, 'success');
  };

  const deleteSavedComparison = (id: string) => {
    const updated = savedComparisons.filter(c => c.id !== id);
    setSavedComparisons(updated);
    localStorage.setItem('saved_comparisons', JSON.stringify(updated));
    showToast('Comparison deleted', 'info');
  };

  const shareComparison = () => {
    const animalNames = comparisonAnimals
      .filter(a => a !== null)
      .map(a => encodeURIComponent(a!.name));

    if (animalNames.length < 2) {
      showToast('Add at least 2 animals to share comparison', 'warning');
      return;
    }

    const url = `${window.location.origin}${window.location.pathname}?animals=${animalNames.join(',')}`;

    navigator.clipboard.writeText(url).then(() => {
      showToast('Share link copied to clipboard!', 'success');
    }).catch(() => {
      showToast('Failed to copy link', 'error');
    });
  };

  const getCharacteristic = (animal: EnrichedAnimal | null, key: string): string => {
    if (!animal) return '-';

    switch (key) {
      case 'name':
        return animal.name || '-';
      case 'scientific_name':
        return animal.taxonomy?.scientific_name || '-';
      case 'class':
        return animal.taxonomy?.class || '-';
      case 'family':
        return animal.taxonomy?.family || '-';
      case 'habitat':
        return animal.characteristics?.habitat || '-';
      case 'diet':
        return animal.characteristics?.diet || '-';
      case 'lifespan':
        return animal.characteristics?.lifespan || '-';
      case 'location':
        return animal.locations?.[0] || '-';
      case 'conservation':
        return animal.conservationStatus?.category || '-';
      default:
        return '-';
    }
  };

  const characteristics = [
    { key: 'name', label: 'Common Name' },
    { key: 'scientific_name', label: 'Scientific Name' },
    { key: 'class', label: 'Class' },
    { key: 'family', label: 'Family' },
    { key: 'habitat', label: 'Habitat' },
    { key: 'diet', label: 'Diet' },
    { key: 'lifespan', label: 'Lifespan' },
    { key: 'location', label: 'Location' },
    { key: 'conservation', label: 'Conservation Status' },
  ];

  const activeCount = comparisonAnimals.filter(a => a !== null).length;

  // Prepare chart data
  const getSizeChartData = (): ChartData[] => {
    return comparisonAnimals
      .filter(a => a !== null)
      .map(animal => ({
        label: animal!.name,
        value: parseFloat(animal!.characteristics?.weight?.split('-')[0] || '0') || 100,
        unit: 'kg',
        image: animal!.images?.[0]?.urls?.small
      }));
  };

  const getLifespanChartData = (): ChartData[] => {
    return comparisonAnimals
      .filter(a => a !== null)
      .map(animal => {
        const lifespan = animal!.characteristics?.lifespan || '0';
        const years = parseInt(lifespan.match(/\d+/)?.[0] || '0');
        return {
          label: animal!.name,
          value: years,
          unit: 'years',
          image: animal!.images?.[0]?.urls?.small
        };
      });
  };

  const getSpeedChartData = (): ChartData[] => {
    // Estimated speeds for common animals (km/h)
    const speedMap: { [key: string]: number } = {
      'cheetah': 120,
      'lion': 80,
      'tiger': 65,
      'elephant': 40,
      'giraffe': 60,
      'zebra': 65,
      'horse': 70,
      'greyhound': 70,
      'rabbit': 56,
      'deer': 75,
      'kangaroo': 70,
      'ostrich': 70,
      'human': 45,
      'bear': 50,
      'wolf': 60
    };

    return comparisonAnimals
      .filter(a => a !== null)
      .map(animal => {
        const name = animal!.name.toLowerCase();
        const speed = Object.keys(speedMap).find(key => name.includes(key));
        return {
          label: animal!.name,
          value: speed ? speedMap[speed] : 30,
          unit: 'km/h',
          image: animal!.images?.[0]?.urls?.small
        };
      });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <section className="py-16 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto text-center space-y-6">
            <div className="text-6xl">⚖️</div>
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white">
              Compare Animals
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Compare up to 3 animals side-by-side with visual charts
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={() => setShowPresets(!showPresets)}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
              >
                ⭐ Browse Presets
              </button>
              {activeCount > 1 && (
                <>
                  <button
                    onClick={saveComparison}
                    className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                  >
                    💾 Save
                  </button>
                  <button
                    onClick={shareComparison}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                  >
                    🔗 Share
                  </button>
                  <button
                    onClick={() => setShowCharts(!showCharts)}
                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
                  >
                    📊 {showCharts ? 'Hide' : 'Show'} Charts
                  </button>
                  <button
                    onClick={handleClearAll}
                    className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
                  >
                    🗑️ Clear All
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Presets Modal */}
      {showPresets && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Comparison Presets
                </h2>
                <button
                  onClick={() => setShowPresets(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Category Tabs */}
              <div className="flex gap-2 mt-4 overflow-x-auto">
                {getPresetCategories().map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {category.icon} {category.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {getPresetsByCategory(selectedCategory as any).map(preset => (
                  <button
                    key={preset.id}
                    onClick={() => loadPreset(preset.id)}
                    className="text-left p-4 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-3xl">{preset.icon}</span>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                          {preset.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {preset.description}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {preset.animals.map((animal, idx) => (
                            <span
                              key={idx}
                              className="text-xs px-2 py-1 bg-white dark:bg-gray-800 rounded"
                            >
                              {animal}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Saved Comparisons */}
      {savedComparisons.length > 0 && (
        <section className="py-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Saved Comparisons
              </h3>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {savedComparisons.map(comparison => (
                  <div
                    key={comparison.id}
                    className="flex-shrink-0 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <button
                        onClick={() => loadSavedComparison(comparison)}
                        className="font-medium text-gray-900 dark:text-white hover:text-purple-600 dark:hover:text-purple-400"
                      >
                        {comparison.name}
                      </button>
                      <button
                        onClick={() => deleteSavedComparison(comparison.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        ×
                      </button>
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {comparison.animals.join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Search Section */}
      <section className="py-12 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[0, 1, 2].map((index) => (
                <div key={index} className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Animal {index + 1}
                  </label>
                  <div ref={suggestionRefs[index]} className="flex gap-2 relative">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        placeholder="Enter animal name..."
                        value={searchInputs[index]}
                        onChange={(e) => {
                          const newInputs = [...searchInputs];
                          newInputs[index] = e.target.value;
                          setSearchInputs(newInputs);
                        }}
                        onFocus={() => {
                          const newShowSuggestions = [...showSuggestions];
                          newShowSuggestions[index] = true;
                          setShowSuggestions(newShowSuggestions);
                        }}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch(index)}
                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                        disabled={loading[index]}
                      />
                      {/* Search Suggestions */}
                      {showSuggestions[index] && (suggestions[index].length > 0 || recentSearches.length > 0) && (
                        <div className="absolute z-10 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden animate-fade-in">
                          {suggestions[index].length > 0 && (
                            <>
                              <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Suggestions</p>
                              </div>
                              <div className="max-h-48 overflow-y-auto">
                                {suggestions[index].map((suggestion, sugIndex) => (
                                  <button
                                    key={sugIndex}
                                    onClick={() => {
                                      const newInputs = [...searchInputs];
                                      newInputs[index] = suggestion;
                                      setSearchInputs(newInputs);
                                      handleSearch(index);
                                    }}
                                    className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 group text-sm"
                                  >
                                    <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    <span className="text-gray-700 dark:text-gray-300 group-hover:text-blue-600">{suggestion}</span>
                                  </button>
                                ))}
                              </div>
                            </>
                          )}
                          {recentSearches.length > 0 && (
                            <>
                              {suggestions[index].length > 0 && <div className="border-t border-gray-200 dark:border-gray-700" />}
                              <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Recent Searches</p>
                              </div>
                              <div className="max-h-48 overflow-y-auto">
                                {recentSearches.map((search, searchIndex) => (
                                  <button
                                    key={searchIndex}
                                    onClick={() => {
                                      const newInputs = [...searchInputs];
                                      newInputs[index] = search;
                                      setSearchInputs(newInputs);
                                      handleSearch(index);
                                    }}
                                    className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 group text-sm"
                                  >
                                    <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="text-gray-700 dark:text-gray-300 group-hover:text-blue-600">{search}</span>
                                  </button>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleSearch(index)}
                      disabled={!searchInputs[index].trim() || loading[index]}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading[index] ? '...' : 'Add'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {activeCount === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Start Comparing
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Enter animal names above to begin comparison
                </p>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                {/* Images Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-gray-200 dark:bg-gray-700">
                  {comparisonAnimals.map((animal, index) => (
                    <div
                      key={index}
                      className="relative h-64 bg-white dark:bg-gray-800 flex items-center justify-center"
                    >
                      {loading[index] ? (
                        <div className="flex items-center justify-center h-full">
                          <Loader />
                        </div>
                      ) : animal ? (
                        <>
                          {animal.images && animal.images.length > 0 ? (
                            <img
                              src={animal.images[0].urls.small || animal.images[0].urls.regular}
                              alt={animal.name}
                              loading="lazy"
                              className="max-w-full max-h-full object-contain"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full text-6xl bg-gray-100 dark:bg-gray-700">
                              🦁
                            </div>
                          )}
                          <button
                            onClick={() => handleRemove(index)}
                            className="absolute top-4 right-4 p-2 bg-red-600 hover:bg-red-700 text-white rounded-full"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </>
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-600">
                          <div className="text-center">
                            <div className="text-4xl mb-2">➕</div>
                            <p className="text-sm">Add animal {index + 1}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Characteristics Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">
                          Characteristic
                        </th>
                        {comparisonAnimals.map((animal, index) => (
                          <th
                            key={index}
                            className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600"
                          >
                            {animal ? animal.name : `Animal ${index + 1}`}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {characteristics.map((char) => (
                        <tr key={char.key} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                            {char.label}
                          </td>
                          {comparisonAnimals.map((animal, index) => (
                            <td
                              key={index}
                              className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300"
                            >
                              {getCharacteristic(animal, char.key)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Wikipedia Descriptions */}
                {comparisonAnimals.some(a => a?.wikipedia?.extract) && (
                  <div className="p-6 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-600">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                      Descriptions
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {comparisonAnimals.map((animal, index) => (
                        <div key={index}>
                          {animal?.wikipedia?.extract ? (
                            <div>
                              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                                {animal.name}
                              </h4>
                              <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-6">
                                {animal.wikipedia.extract}
                              </p>
                            </div>
                          ) : (
                            <div className="text-sm text-gray-500 dark:text-gray-500">
                              No description available
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Visual Charts */}
            {activeCount >= 2 && showCharts && (
              <div className="mt-8 space-y-8">
                <div className="text-center mb-6">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Visual Comparisons
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Compare animals across different metrics
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-8">
                  {/* Size Comparison */}
                  {getSizeChartData().length >= 2 && (
                    <ComparisonChart
                      title="Size Comparison (Weight)"
                      data={getSizeChartData()}
                      type="horizontal-bar"
                      showValues={true}
                      showImages={true}
                    />
                  )}

                  {/* Speed Comparison */}
                  {getSpeedChartData().length >= 2 && (
                    <ComparisonChart
                      title="Estimated Speed"
                      data={getSpeedChartData()}
                      type="horizontal-bar"
                      showValues={true}
                      showImages={true}
                    />
                  )}

                  {/* Lifespan Timeline */}
                  {getLifespanChartData().length >= 2 && (
                    <ComparisonChart
                      title="Lifespan Comparison"
                      data={getLifespanChartData()}
                      type="timeline"
                      showValues={true}
                      showImages={true}
                    />
                  )}
                </div>

                {/* Size Visual Representation */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                    Relative Size Comparison
                  </h3>
                  <div className="flex items-end justify-center gap-8 min-h-[300px]">
                    {comparisonAnimals
                      .filter(a => a !== null)
                      .map((animal, index) => {
                        const weight = parseFloat(animal!.characteristics?.weight?.split('-')[0] || '100');
                        const maxWeight = Math.max(
                          ...comparisonAnimals
                            .filter(a => a !== null)
                            .map(a => parseFloat(a!.characteristics?.weight?.split('-')[0] || '100'))
                        );
                        const size = (weight / maxWeight) * 200;

                        return (
                          <div key={index} className="flex flex-col items-center gap-3">
                            <div
                              className="relative rounded-lg overflow-hidden shadow-lg"
                              style={{
                                width: `${Math.max(size, 60)}px`,
                                height: `${Math.max(size, 60)}px`
                              }}
                            >
                              {animal!.images && animal!.images[0] ? (
                                <img
                                  src={animal!.images[0].urls.small}
                                  alt={animal!.name}
                                  className="max-w-full max-h-full object-contain"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400" />
                              )}
                            </div>
                            <div className="text-center">
                              <div className="font-medium text-gray-900 dark:text-white">
                                {animal!.name}
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                {animal!.characteristics?.weight || 'N/A'}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>

                  {/* Human scale reference */}
                  <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-center text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Scale reference: Average human (70 kg / 1.7m)
                    </p>
                    <div className="flex justify-center">
                      <div className="text-6xl">🧍</div>
                    </div>
                  </div>
                </div>

                {/* Habitat Comparison */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    Habitat Comparison
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {comparisonAnimals
                      .filter(a => a !== null)
                      .map((animal, index) => (
                        <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                            {animal!.name}
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">Habitat: </span>
                              <span className="text-gray-900 dark:text-white">
                                {animal!.characteristics?.habitat || 'N/A'}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">Location: </span>
                              <span className="text-gray-900 dark:text-white">
                                {animal!.locations?.join(', ') || 'N/A'}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">Diet: </span>
                              <span className="text-gray-900 dark:text-white">
                                {animal!.characteristics?.diet || 'N/A'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

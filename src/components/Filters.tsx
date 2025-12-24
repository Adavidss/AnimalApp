import { AnimalFilters, AnimalCategory, HabitatType } from '../types/animal';
import { ANIMAL_CATEGORIES, HABITAT_TYPES } from '../utils/constants';

interface FiltersProps {
  filters: AnimalFilters;
  onFiltersChange: (filters: AnimalFilters) => void;
}

export default function Filters({ filters, onFiltersChange }: FiltersProps) {
  const handleCategoryChange = (category: AnimalCategory) => {
    onFiltersChange({ ...filters, category });
  };

  const handleHabitatChange = (habitat: HabitatType) => {
    onFiltersChange({ ...filters, habitat });
  };

  const handleEndangeredToggle = () => {
    onFiltersChange({ ...filters, endangeredOnly: !filters.endangeredOnly });
  };

  const handleReset = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = filters.category || filters.habitat || filters.endangeredOnly;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          Filters
        </h3>

        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            Reset All
          </button>
        )}
      </div>

      {/* Category Filter */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
          Animal Category
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <button
            onClick={() => handleCategoryChange('all')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              !filters.category || filters.category === 'all'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            All
          </button>
          {ANIMAL_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id as AnimalCategory)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                filters.category === cat.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              title={cat.description}
            >
              <span>{cat.emoji}</span>
              <span className="truncate">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Habitat Filter */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
          Habitat
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleHabitatChange('all')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              !filters.habitat || filters.habitat === 'all'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            All
          </button>
          {HABITAT_TYPES.map((habitat) => (
            <button
              key={habitat.id}
              onClick={() => handleHabitatChange(habitat.id as HabitatType)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                filters.habitat === habitat.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <span>{habitat.emoji}</span>
              <span>{habitat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Endangered Only Toggle */}
      <div className="space-y-3 pt-3 border-t border-gray-200 dark:border-gray-700">
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Endangered Species Only
          </span>
          <div className="relative">
            <input
              type="checkbox"
              checked={filters.endangeredOnly || false}
              onChange={handleEndangeredToggle}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
          </div>
        </label>
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Active Filters:</p>
          <div className="flex flex-wrap gap-2">
            {filters.category && filters.category !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 rounded text-xs">
                {filters.category}
                <button
                  onClick={() => handleCategoryChange('all')}
                  className="hover:text-primary-900"
                >
                  ×
                </button>
              </span>
            )}
            {filters.habitat && filters.habitat !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 rounded text-xs">
                {filters.habitat}
                <button
                  onClick={() => handleHabitatChange('all')}
                  className="hover:text-primary-900"
                >
                  ×
                </button>
              </span>
            )}
            {filters.endangeredOnly && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 rounded text-xs">
                Endangered
                <button
                  onClick={handleEndangeredToggle}
                  className="hover:text-primary-900"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

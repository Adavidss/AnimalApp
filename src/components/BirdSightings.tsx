import { useState } from 'react';
import { EBirdObservation } from '../types/animal';
import { calculateFrequency } from '../api/ebird';

interface BirdSightingsProps {
  observations: EBirdObservation[];
  speciesName: string;
}

export default function BirdSightings({ observations, speciesName }: BirdSightingsProps) {
  const [sortBy, setSortBy] = useState<'date' | 'count' | 'location'>('date');
  const [_showMap, _setShowMap] = useState(false);

  if (!observations || observations.length === 0) {
    return (
      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-8 text-center">
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
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
          />
        </svg>
        <p className="text-gray-600 dark:text-gray-400">
          No recent bird sightings available
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
          eBird observations require an API key
        </p>
      </div>
    );
  }

  const sortedObservations = [...observations].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.obsDt).getTime() - new Date(a.obsDt).getTime();
      case 'count':
        return (b.howMany || 0) - (a.howMany || 0);
      case 'location':
        return a.locName.localeCompare(b.locName);
      default:
        return 0;
    }
  });

  const { totalCount, locations } = calculateFrequency(observations);
  const topLocations = Array.from(locations.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Sightings</div>
          <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
            {observations.length}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Count</div>
          <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
            {totalCount}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Locations</div>
          <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
            {locations.size}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Latest Sighting</div>
          <div className="text-sm font-semibold text-gray-900 dark:text-white">
            {new Date(sortedObservations[0].obsDt).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Top Locations */}
      {topLocations.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
            Top Observation Locations
          </h4>
          <div className="space-y-3">
            {topLocations.map(([location, count], index) => (
              <div key={location} className="flex items-center gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                  <span className="text-primary-700 dark:text-primary-300 font-bold text-sm">
                    {index + 1}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {location}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">
                    {count} sighting{count !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Observations List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h4 className="font-semibold text-gray-900 dark:text-white">Recent Observations</h4>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 dark:text-gray-400">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-sm text-gray-900 dark:text-white"
            >
              <option value="date">Date</option>
              <option value="count">Count</option>
              <option value="location">Location</option>
            </select>
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {sortedObservations.map((obs, index) => (
            <div
              key={`${obs.subId}-${index}`}
              className="p-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h5 className="font-semibold text-gray-900 dark:text-white">
                      {obs.locName}
                    </h5>
                    {obs.obsReviewed && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                        ✓ Reviewed
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      {new Date(obs.obsDt).toLocaleDateString()}
                    </span>

                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      {obs.lat.toFixed(4)}, {obs.lng.toFixed(4)}
                    </span>

                    {!obs.locationPrivate && (
                      <a
                        href={`https://www.google.com/maps?q=${obs.lat},${obs.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-700 text-xs underline"
                      >
                        View on map
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex-shrink-0 text-right">
                  <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                    {obs.howMany || '?'}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">individual{obs.howMany !== 1 ? 's' : ''}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Attribution */}
      <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg
            className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="text-sm text-blue-900 dark:text-blue-100">
            <p className="font-semibold mb-1">eBird Observations</p>
            <p>
              Citizen science data from the{' '}
              <a
                href="https://ebird.org"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-blue-700 dark:hover:text-blue-300"
              >
                Cornell Lab of Ornithology's eBird program
              </a>
              . Recent sightings of {speciesName} from the last 14 days.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

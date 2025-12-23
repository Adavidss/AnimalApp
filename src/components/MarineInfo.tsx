import React, { useState } from 'react';
import { WoRMSTaxon, WoRMSDistribution } from '../types/animal';
import { getHabitatTypes, isExtinct, getFullScientificName, getWormsUrl, getDistributionLocations } from '../api/worms';

interface MarineInfoProps {
  taxon: WoRMSTaxon;
  distribution?: WoRMSDistribution[];
  vernacularNames?: Array<{ vernacular: string; language: string }>;
}

export default function MarineInfo({ taxon, distribution, vernacularNames }: MarineInfoProps) {
  const [showAllDistributions, setShowAllDistributions] = useState(false);

  if (!taxon) {
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
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
        <p className="text-gray-600 dark:text-gray-400">
          No marine species data available
        </p>
      </div>
    );
  }

  const habitats = getHabitatTypes(taxon);
  const extinct = isExtinct(taxon);
  const fullName = getFullScientificName(taxon);
  const wormsUrl = getWormsUrl(taxon.AphiaID);
  const locations = distribution ? getDistributionLocations(distribution) : [];
  const displayedDistributions = showAllDistributions
    ? distribution
    : distribution?.slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Marine Status Banner */}
      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-2xl font-bold mb-2">Marine Species</h3>
            <p className="text-blue-100 text-lg italic">{fullName}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              {habitats.map((habitat) => (
                <span
                  key={habitat}
                  className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium"
                >
                  {habitat}
                </span>
              ))}
              {extinct && (
                <span className="px-3 py-1 bg-red-600 rounded-full text-sm font-bold">
                  ⚠️ EXTINCT
                </span>
              )}
            </div>
          </div>
          <div className="text-6xl">🐋</div>
        </div>
      </div>

      {/* Taxonomy Details */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
        <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          Taxonomic Classification
        </h4>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            {taxon.kingdom && (
              <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Kingdom:</span>
                <span className="font-semibold text-gray-900 dark:text-white">{taxon.kingdom}</span>
              </div>
            )}
            {taxon.phylum && (
              <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Phylum:</span>
                <span className="font-semibold text-gray-900 dark:text-white">{taxon.phylum}</span>
              </div>
            )}
            {taxon.class && (
              <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Class:</span>
                <span className="font-semibold text-gray-900 dark:text-white">{taxon.class}</span>
              </div>
            )}
            {taxon.order && (
              <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Order:</span>
                <span className="font-semibold text-gray-900 dark:text-white">{taxon.order}</span>
              </div>
            )}
          </div>

          <div className="space-y-3">
            {taxon.family && (
              <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Family:</span>
                <span className="font-semibold text-gray-900 dark:text-white">{taxon.family}</span>
              </div>
            )}
            {taxon.genus && (
              <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Genus:</span>
                <span className="font-semibold text-gray-900 dark:text-white">{taxon.genus}</span>
              </div>
            )}
            {taxon.rank && (
              <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Rank:</span>
                <span className="font-semibold text-gray-900 dark:text-white capitalize">{taxon.rank}</span>
              </div>
            )}
            {taxon.status && (
              <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Status:</span>
                <span className={`font-semibold ${taxon.status === 'accepted' ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                  {taxon.status}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Vernacular Names */}
      {vernacularNames && vernacularNames.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
          <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Common Names
          </h4>
          <div className="flex flex-wrap gap-2">
            {vernacularNames.slice(0, 10).map((name, index) => (
              <div
                key={index}
                className="px-3 py-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg"
              >
                <span className="text-blue-900 dark:text-blue-100 font-medium">
                  {name.vernacular}
                </span>
                {name.language && (
                  <span className="text-xs text-blue-600 dark:text-blue-400 ml-2">
                    ({name.language.toUpperCase()})
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Distribution */}
      {distribution && distribution.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Geographic Distribution
            </h4>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {locations.length} location{locations.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Location Tags */}
          {locations.length > 0 && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Recorded in:</p>
              <div className="flex flex-wrap gap-2">
                {locations.slice(0, 15).map((location, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-cyan-50 dark:bg-cyan-900/30 text-cyan-800 dark:text-cyan-200 text-xs rounded"
                  >
                    {location}
                  </span>
                ))}
                {locations.length > 15 && (
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded">
                    +{locations.length - 15} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Distribution Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-2 px-3 font-semibold text-gray-700 dark:text-gray-300">
                    Location
                  </th>
                  <th className="text-left py-2 px-3 font-semibold text-gray-700 dark:text-gray-300">
                    Status
                  </th>
                  <th className="text-left py-2 px-3 font-semibold text-gray-700 dark:text-gray-300">
                    Source
                  </th>
                </tr>
              </thead>
              <tbody>
                {displayedDistributions?.map((dist, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-100 dark:border-gray-800 last:border-0"
                  >
                    <td className="py-2 px-3 text-gray-900 dark:text-white">
                      {dist.locality}
                    </td>
                    <td className="py-2 px-3">
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                        dist.occurrenceStatus?.toLowerCase() === 'present'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {dist.occurrenceStatus || 'Unknown'}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-gray-600 dark:text-gray-400 text-xs">
                      {dist.gazetteerSource}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {distribution.length > 10 && !showAllDistributions && (
            <button
              onClick={() => setShowAllDistributions(true)}
              className="mt-4 w-full py-2 text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium"
            >
              Show all {distribution.length} distributions →
            </button>
          )}
        </div>
      )}

      {/* Citation */}
      {taxon.citation && (
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 text-sm text-gray-700 dark:text-gray-300">
          <p className="font-semibold mb-1">Citation:</p>
          <p className="italic">{taxon.citation}</p>
        </div>
      )}

      {/* External Link */}
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
            <p className="font-semibold mb-1">World Register of Marine Species (WoRMS)</p>
            <p className="mb-2">
              AphiaID: {taxon.AphiaID} • Last modified: {new Date(taxon.modified).toLocaleDateString()}
            </p>
            <a
              href={wormsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
            >
              View full record on WoRMS.org
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

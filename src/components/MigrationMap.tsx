import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { MovebankLocation, MovebankStudy } from '../types/animal';
import { calculateMigrationDistance, getMigrationBounds } from '../api/movebank';
import { MAP_CONFIG } from '../utils/constants';

interface MigrationMapProps {
  locations: MovebankLocation[];
  study?: MovebankStudy;
  animalName: string;
}

export default function MigrationMap({ locations, study, animalName }: MigrationMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const [showAnimation, setShowAnimation] = useState(false);
  const [animationProgress, setAnimationProgress] = useState(0);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Initialize map
    const map = L.map(mapContainerRef.current).setView(
      MAP_CONFIG.DEFAULT_CENTER,
      MAP_CONFIG.DEFAULT_ZOOM
    );

    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: MAP_CONFIG.MAX_ZOOM,
      minZoom: MAP_CONFIG.MIN_ZOOM,
    }).addTo(map);

    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || !locations.length) return;

    const map = mapRef.current;

    // Clear existing markers and routes
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];
    if (routeLayerRef.current) {
      routeLayerRef.current.remove();
    }

    // Sort locations by timestamp
    const sortedLocations = [...locations].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    // Create route line
    const latlngs: [number, number][] = sortedLocations.map((loc) => [
      loc.location_lat,
      loc.location_long,
    ]);

    const routeLine = L.polyline(latlngs, {
      color: '#10b981',
      weight: 3,
      opacity: 0.7,
    }).addTo(map);

    routeLayerRef.current = routeLine;

    // Add markers for start and end points
    if (sortedLocations.length > 0) {
      // Start marker (green)
      const startIcon = L.divIcon({
        className: 'custom-marker',
        html: `<div class="w-4 h-4 bg-green-500 border-2 border-white rounded-full shadow-lg"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });

      const startMarker = L.marker(
        [sortedLocations[0].location_lat, sortedLocations[0].location_long],
        { icon: startIcon }
      )
        .addTo(map)
        .bindPopup(`
          <div class="text-sm">
            <p class="font-semibold text-green-600">Start</p>
            <p>${new Date(sortedLocations[0].timestamp).toLocaleDateString()}</p>
            ${sortedLocations[0].individual_local_identifier ? `<p>ID: ${sortedLocations[0].individual_local_identifier}</p>` : ''}
          </div>
        `);

      markersRef.current.push(startMarker);

      // End marker (red)
      const endIcon = L.divIcon({
        className: 'custom-marker',
        html: `<div class="w-4 h-4 bg-red-500 border-2 border-white rounded-full shadow-lg"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });

      const lastIndex = sortedLocations.length - 1;
      const endMarker = L.marker(
        [sortedLocations[lastIndex].location_lat, sortedLocations[lastIndex].location_long],
        { icon: endIcon }
      )
        .addTo(map)
        .bindPopup(`
          <div class="text-sm">
            <p class="font-semibold text-red-600">Current/End</p>
            <p>${new Date(sortedLocations[lastIndex].timestamp).toLocaleDateString()}</p>
            ${sortedLocations[lastIndex].individual_local_identifier ? `<p>ID: ${sortedLocations[lastIndex].individual_local_identifier}</p>` : ''}
          </div>
        `);

      markersRef.current.push(endMarker);
    }

    // Fit map to show entire route
    const bounds = getMigrationBounds(sortedLocations);
    if (bounds) {
      map.fitBounds([
        [bounds.minLat, bounds.minLng],
        [bounds.maxLat, bounds.maxLng],
      ], { padding: [50, 50] });
    }
  }, [locations]);

  const handleAnimateRoute = () => {
    setShowAnimation(true);
    setAnimationProgress(0);

    const sortedLocations = [...locations].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex >= sortedLocations.length) {
        clearInterval(interval);
        setShowAnimation(false);
        return;
      }

      setAnimationProgress((currentIndex / sortedLocations.length) * 100);
      currentIndex++;
    }, 100);
  };

  if (!locations || locations.length === 0) {
    return (
      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-12 text-center">
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
            d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
          />
        </svg>
        <p className="text-gray-600 dark:text-gray-400">
          No migration tracking data available for this species
        </p>
      </div>
    );
  }

  const distance = calculateMigrationDistance(locations);
  const sortedLocs = [...locations].sort((a, b) =>
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  const startDate = sortedLocs[0]?.timestamp;
  const endDate = sortedLocs[sortedLocs.length - 1]?.timestamp;

  return (
    <div className="space-y-4">
      {/* Study Info */}
      {study && (
        <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            {study.name || 'Migration Study'}
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-blue-800 dark:text-blue-200">
            {study.principal_investigator_name && (
              <div>
                <span className="font-medium">Investigator:</span>
                <p>{study.principal_investigator_name}</p>
              </div>
            )}
            {study.number_of_individuals && (
              <div>
                <span className="font-medium">Individuals:</span>
                <p>{study.number_of_individuals}</p>
              </div>
            )}
            {study.number_of_deployments && (
              <div>
                <span className="font-medium">Deployments:</span>
                <p>{study.number_of_deployments}</p>
              </div>
            )}
            {study.study_type && (
              <div>
                <span className="font-medium">Type:</span>
                <p>{study.study_type}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Migration Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Distance</div>
          <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
            {distance.toLocaleString()} km
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Tracking Points</div>
          <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
            {locations.length}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Start Date</div>
          <div className="text-sm font-semibold text-gray-900 dark:text-white">
            {startDate ? new Date(startDate).toLocaleDateString() : 'Unknown'}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">End Date</div>
          <div className="text-sm font-semibold text-gray-900 dark:text-white">
            {endDate ? new Date(endDate).toLocaleDateString() : 'Unknown'}
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h4 className="font-semibold text-gray-900 dark:text-white">Migration Route</h4>
          <button
            onClick={handleAnimateRoute}
            disabled={showAnimation}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white text-sm font-medium rounded-lg transition-colors disabled:cursor-not-allowed"
          >
            {showAnimation ? 'Animating...' : 'Animate Route'}
          </button>
        </div>

        <div
          ref={mapContainerRef}
          className="w-full h-96"
          style={{ zIndex: 1 }}
        />

        {showAnimation && (
          <div className="p-4 bg-primary-50 dark:bg-primary-900/30">
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-primary-600 h-full transition-all duration-100"
                  style={{ width: `${animationProgress}%` }}
                />
              </div>
              <span className="text-sm font-medium text-primary-900 dark:text-primary-100">
                {Math.round(animationProgress)}%
              </span>
            </div>
          </div>
        )}

        <div className="p-4 bg-gray-50 dark:bg-gray-900">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-0.5"
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
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <p className="font-semibold mb-1">Migration Tracking Data</p>
              <p>
                GPS tracking data from Movebank showing {animalName} movement patterns.
                Green marker indicates start, red marker shows current/end position.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Attribution */}
      <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
        Data from{' '}
        <a
          href={study ? `https://www.movebank.org/cms/webapp?gwt_fragment=page=studies,path=study${study.id}` : 'https://www.movebank.org'}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary-600 hover:text-primary-700 underline"
        >
          Movebank.org
        </a>
      </div>
    </div>
  );
}

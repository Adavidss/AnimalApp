import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { GBIFOccurrence } from '../types/animal';
import { MAP_CONFIG } from '../utils/constants';

interface MapViewProps {
  occurrences: GBIFOccurrence[];
  animalName: string;
}

// Fix for default marker icon in production builds
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

export default function MapView({ occurrences, animalName }: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

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
    if (!mapRef.current || !occurrences.length) return;

    const map = mapRef.current;

    // Clear existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    // Add markers for occurrences
    const markers: L.Marker[] = [];
    const bounds: L.LatLngBounds[] = [];

    occurrences.forEach((occurrence) => {
      if (occurrence.decimalLatitude && occurrence.decimalLongitude) {
        const marker = L.marker([occurrence.decimalLatitude, occurrence.decimalLongitude])
          .addTo(map)
          .bindPopup(`
            <div class="text-sm">
              <p class="font-semibold">${animalName}</p>
              ${occurrence.locality ? `<p>Location: ${occurrence.locality}</p>` : ''}
              ${occurrence.country ? `<p>Country: ${occurrence.country}</p>` : ''}
              ${occurrence.eventDate ? `<p>Date: ${new Date(occurrence.eventDate).toLocaleDateString()}</p>` : ''}
            </div>
          `);

        markers.push(marker);
        bounds.push(L.latLngBounds(marker.getLatLng(), marker.getLatLng()));
      }
    });

    // Fit map to show all markers
    if (bounds.length > 0) {
      const group = L.featureGroup(markers);
      map.fitBounds(group.getBounds().pad(0.1));
    }
  }, [occurrences, animalName]);

  if (!occurrences || occurrences.length === 0) {
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
          No geographic data available for this species
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div
        ref={mapContainerRef}
        className="w-full h-96 rounded-lg overflow-hidden shadow-lg"
        style={{ zIndex: 1 }}
      />

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
            <p className="font-semibold mb-1">Distribution Map</p>
            <p>
              Showing {occurrences.length} recorded occurrence{occurrences.length !== 1 ? 's' : ''}{' '}
              from the Global Biodiversity Information Facility (GBIF). Click markers for details.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

import { MovebankStudy, MovebankLocation } from '../types/animal';
import { API_URLS, CACHE_DURATION } from '../utils/constants';
import { getCache, setCache } from '../utils/cache';
import { handleApiErrorSilently } from '../utils/errorHandling';

/**
 * Search for Movebank studies by taxon
 * Note: Movebank API doesn't require authentication for public data
 * but has rate limits
 */
export async function searchMovebankStudies(taxon: string): Promise<MovebankStudy[]> {
  const cacheKey = `movebank_studies_${taxon.toLowerCase()}`;
  const cached = getCache<MovebankStudy[]>(cacheKey);

  if (cached) {
    return cached;
  }

  try {
    // Search for studies with public data
    const url = `${API_URLS.MOVEBANK}?entity_type=study&i_can_see_data=true&search_term=${encodeURIComponent(taxon)}`;

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      return handleApiErrorSilently(
        new Error(`Movebank API returned ${response.status}: ${response.statusText}`),
        'Movebank',
        []
      );
    }

    const text = await response.text();

    // Movebank returns CSV by default, we need to parse or request JSON
    // For now, return empty array if data format is unexpected
    if (!text || text.trim().length === 0) {
      return [];
    }

    // Try to parse as JSON
    try {
      const studies = JSON.parse(text);
      const studyArray = Array.isArray(studies) ? studies : [];

      // Cache results
      setCache(cacheKey, studyArray, CACHE_DURATION.MIGRATION);
      return studyArray;
    } catch {
      // If not JSON, it might be CSV - skip for now
      return handleApiErrorSilently(new Error('Non-JSON response'), 'Movebank', []);
    }
  } catch (error) {
    return handleApiErrorSilently(error, 'Movebank', []);
  }
}

/**
 * Get tracking locations for a specific study
 */
export async function getMovebankLocations(
  studyId: number,
  individualId?: string,
  limit: number = 1000
): Promise<MovebankLocation[]> {
  const cacheKey = `movebank_locations_${studyId}_${individualId || 'all'}`;
  const cached = getCache<MovebankLocation[]>(cacheKey);

  if (cached) {
    return cached;
  }

  try {
    let url = `${API_URLS.MOVEBANK}?entity_type=event&study_id=${studyId}&sensor_type_id=653`;

    if (individualId) {
      url += `&individual_local_identifier=${encodeURIComponent(individualId)}`;
    }

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      return handleApiErrorSilently(
        new Error(`Movebank API returned ${response.status}: ${response.statusText}`),
        'Movebank',
        []
      );
    }

    const text = await response.text();

    // Try to parse as JSON
    try {
      const events = JSON.parse(text);
      const locationArray = Array.isArray(events) ? events.slice(0, limit) : [];

      // Cache results
      setCache(cacheKey, locationArray, CACHE_DURATION.MIGRATION);
      return locationArray;
    } catch {
      return handleApiErrorSilently(new Error('Non-JSON response'), 'Movebank', []);
    }
  } catch (error) {
    return handleApiErrorSilently(error, 'Movebank', []);
  }
}

/**
 * Get study details by ID
 */
export async function getMovebankStudy(studyId: number): Promise<MovebankStudy | null> {
  try {
    const url = `${API_URLS.MOVEBANK}?entity_type=study&study_id=${studyId}`;

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      return null;
    }

    const text = await response.text();

    try {
      const data = JSON.parse(text);
      return Array.isArray(data) && data.length > 0 ? data[0] : null;
    } catch {
      return null;
    }
  } catch (error) {
    return handleApiErrorSilently(error, 'Movebank', null);
  }
}

/**
 * Get list of individuals (animals) in a study
 */
export async function getStudyIndividuals(studyId: number): Promise<string[]> {
  try {
    const url = `${API_URLS.MOVEBANK}?entity_type=individual&study_id=${studyId}`;

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      return [];
    }

    const text = await response.text();

    try {
      const individuals = JSON.parse(text);
      if (Array.isArray(individuals)) {
        return individuals.map((ind: any) => ind.individual_local_identifier || ind.local_identifier).filter(Boolean);
      }
      return [];
    } catch {
      return [];
    }
  } catch (error) {
    return handleApiErrorSilently(error, 'Movebank', []);
  }
}

/**
 * Calculate migration distance from locations
 */
export function calculateMigrationDistance(locations: MovebankLocation[]): number {
  if (locations.length < 2) return 0;

  let totalDistance = 0;

  for (let i = 1; i < locations.length; i++) {
    const prev = locations[i - 1];
    const curr = locations[i];

    if (prev.location_lat && prev.location_long && curr.location_lat && curr.location_long) {
      totalDistance += haversineDistance(
        prev.location_lat,
        prev.location_long,
        curr.location_lat,
        curr.location_long
      );
    }
  }

  return Math.round(totalDistance);
}

/**
 * Get migration route bounds for map display
 */
export function getMigrationBounds(locations: MovebankLocation[]): {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
} | null {
  if (locations.length === 0) return null;

  const validLocations = locations.filter(
    (loc) => loc.location_lat && loc.location_long
  );

  if (validLocations.length === 0) return null;

  const lats = validLocations.map((loc) => loc.location_lat);
  const lngs = validLocations.map((loc) => loc.location_long);

  return {
    minLat: Math.min(...lats),
    maxLat: Math.max(...lats),
    minLng: Math.min(...lngs),
    maxLng: Math.max(...lngs),
  };
}

/**
 * Haversine formula for calculating distance between two points on Earth
 */
function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Group locations by time period (for animation)
 */
export function groupLocationsByPeriod(
  locations: MovebankLocation[],
  periodDays: number = 7
): MovebankLocation[][] {
  if (locations.length === 0) return [];

  const sorted = [...locations].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const groups: MovebankLocation[][] = [];
  const periodMs = periodDays * 24 * 60 * 60 * 1000;

  let currentGroup: MovebankLocation[] = [sorted[0]];
  let groupStart = new Date(sorted[0].timestamp).getTime();

  for (let i = 1; i < sorted.length; i++) {
    const currentTime = new Date(sorted[i].timestamp).getTime();

    if (currentTime - groupStart <= periodMs) {
      currentGroup.push(sorted[i]);
    } else {
      groups.push(currentGroup);
      currentGroup = [sorted[i]];
      groupStart = currentTime;
    }
  }

  if (currentGroup.length > 0) {
    groups.push(currentGroup);
  }

  return groups;
}

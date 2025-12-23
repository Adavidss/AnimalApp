import { XenoCantoRecording } from '../types/animal';
import { API_URLS, CACHE_DURATION } from '../utils/constants';
import { getCache, setCache } from '../utils/cache';
import { handleApiErrorSilently } from '../utils/errorHandling';

/**
 * Search for animal sound recordings on xeno-canto
 * https://xeno-canto.org/explore/api
 */
export async function fetchAnimalSounds(
  query: string,
  limit: number = 10
): Promise<XenoCantoRecording[]> {
  const cacheKey = `sounds_${query.toLowerCase()}`;
  const cached = getCache<XenoCantoRecording[]>(cacheKey);

  if (cached) {
    return cached;
  }

  try {
    // Search by common name or scientific name
    const url = `${API_URLS.XENO_CANTO}/recordings?query=${encodeURIComponent(query)}`;
    const response = await fetch(url);

    if (!response.ok) {
      // xeno-canto returns 404 for non-bird animals, which is expected
      return handleApiErrorSilently(
        new Error(`xeno-canto API returned ${response.status}`),
        'xeno-canto',
        []
      );
    }

    const data = await response.json();
    const recordings: XenoCantoRecording[] = data.recordings || [];

    // Limit results and filter for quality
    const filtered = recordings
      .filter((rec) => rec.q && ['A', 'B', 'C'].includes(rec.q)) // Only good quality
      .slice(0, limit);

    // Cache results
    setCache(cacheKey, filtered, CACHE_DURATION.SOUNDS);

    return filtered;
  } catch (error) {
    return handleApiErrorSilently(error, 'xeno-canto', []);
  }
}

/**
 * Search for bird songs specifically
 */
export async function fetchBirdSongs(
  scientificName: string,
  limit: number = 10
): Promise<XenoCantoRecording[]> {
  const cacheKey = `bird_songs_${scientificName.toLowerCase()}`;
  const cached = getCache<XenoCantoRecording[]>(cacheKey);

  if (cached) {
    return cached;
  }

  try {
    // Search by scientific name with type filter for songs
    const url = `${API_URLS.XENO_CANTO}/recordings?query=${encodeURIComponent(scientificName)}+type:song`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`xeno-canto API error: ${response.statusText}`);
    }

    const data = await response.json();
    const recordings: XenoCantoRecording[] = data.recordings || [];

    // Limit results
    const limited = recordings.slice(0, limit);

    // Cache results
    setCache(cacheKey, limited, CACHE_DURATION.SOUNDS);

    return limited;
  } catch (error) {
    console.error('Error fetching bird songs:', error);
    return [];
  }
}

/**
 * Get recording details by ID
 */
export async function getRecordingById(id: string): Promise<XenoCantoRecording | null> {
  try {
    const url = `${API_URLS.XENO_CANTO}/recordings?query=nr:${id}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`xeno-canto API error: ${response.statusText}`);
    }

    const data = await response.json();
    const recordings: XenoCantoRecording[] = data.recordings || [];

    return recordings.length > 0 ? recordings[0] : null;
  } catch (error) {
    console.error('Error fetching recording by ID:', error);
    return null;
  }
}

/**
 * Search for recordings by location
 */
export async function fetchSoundsByLocation(
  country: string,
  genus?: string,
  limit: number = 10
): Promise<XenoCantoRecording[]> {
  const cacheKey = `sounds_location_${country}_${genus || 'all'}`;
  const cached = getCache<XenoCantoRecording[]>(cacheKey);

  if (cached) {
    return cached;
  }

  try {
    let query = `cnt:"${country}"`;
    if (genus) {
      query += `+gen:${genus}`;
    }

    const url = `${API_URLS.XENO_CANTO}/recordings?query=${encodeURIComponent(query)}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`xeno-canto API error: ${response.statusText}`);
    }

    const data = await response.json();
    const recordings: XenoCantoRecording[] = data.recordings || [];

    // Limit and filter
    const filtered = recordings
      .filter((rec) => rec.q && ['A', 'B', 'C'].includes(rec.q))
      .slice(0, limit);

    // Cache results
    setCache(cacheKey, filtered, CACHE_DURATION.SOUNDS);

    return filtered;
  } catch (error) {
    console.error('Error fetching sounds by location:', error);
    return [];
  }
}

/**
 * Get sound types available for a species
 */
export function getSoundTypes(recordings: XenoCantoRecording[]): string[] {
  const types = new Set<string>();
  recordings.forEach((rec) => {
    if (rec.type) {
      // Split by comma for multiple types
      rec.type.split(',').forEach((type) => {
        types.add(type.trim());
      });
    }
  });
  return Array.from(types).sort();
}

/**
 * Filter recordings by sound type (call, song, alarm, etc.)
 */
export function filterByType(
  recordings: XenoCantoRecording[],
  type: string
): XenoCantoRecording[] {
  return recordings.filter((rec) =>
    rec.type?.toLowerCase().includes(type.toLowerCase())
  );
}

/**
 * Get the highest quality recording from a list
 */
export function getBestQualityRecording(
  recordings: XenoCantoRecording[]
): XenoCantoRecording | null {
  if (recordings.length === 0) return null;

  const qualityOrder = { A: 4, B: 3, C: 2, D: 1, E: 0 };

  return recordings.reduce((best, current) => {
    const bestQuality = qualityOrder[best.q as keyof typeof qualityOrder] || 0;
    const currentQuality = qualityOrder[current.q as keyof typeof qualityOrder] || 0;
    return currentQuality > bestQuality ? current : best;
  });
}

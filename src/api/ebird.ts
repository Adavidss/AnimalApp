import { EBirdObservation } from '../types/animal';
import { API_KEYS, API_URLS, CACHE_DURATION } from '../utils/constants';
import { getCache, setCache } from '../utils/cache';

/**
 * Get recent bird observations for a species
 * Requires eBird API key
 */
export async function getRecentObservations(
  speciesCode: string,
  regionCode: string = 'US',
  days: number = 14
): Promise<EBirdObservation[]> {
  if (!API_KEYS.EBIRD) {
    console.warn('eBird API key not configured');
    return [];
  }

  const cacheKey = `ebird_obs_${speciesCode}_${regionCode}_${days}`;
  const cached = getCache<EBirdObservation[]>(cacheKey);

  if (cached) {
    return cached;
  }

  try {
    const url = `${API_URLS.EBIRD}/data/obs/${regionCode}/recent/${speciesCode}?back=${days}`;

    const response = await fetch(url, {
      headers: {
        'X-eBirdApiToken': API_KEYS.EBIRD,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        console.error('Invalid eBird API key');
      }
      return [];
    }

    const observations: EBirdObservation[] = await response.json();

    // Cache results
    setCache(cacheKey, observations, CACHE_DURATION.BIRD_SIGHTINGS);

    return observations;
  } catch (error) {
    console.error('Error fetching eBird observations:', error);
    return [];
  }
}

/**
 * Get recent notable bird sightings in a region
 */
export async function getNotableObservations(
  regionCode: string = 'US',
  days: number = 14
): Promise<EBirdObservation[]> {
  if (!API_KEYS.EBIRD) {
    console.warn('eBird API key not configured');
    return [];
  }

  const cacheKey = `ebird_notable_${regionCode}_${days}`;
  const cached = getCache<EBirdObservation[]>(cacheKey);

  if (cached) {
    return cached;
  }

  try {
    const url = `${API_URLS.EBIRD}/data/obs/${regionCode}/recent/notable?back=${days}`;

    const response = await fetch(url, {
      headers: {
        'X-eBirdApiToken': API_KEYS.EBIRD,
      },
    });

    if (!response.ok) {
      return [];
    }

    const observations: EBirdObservation[] = await response.json();

    // Cache results
    setCache(cacheKey, observations, CACHE_DURATION.BIRD_SIGHTINGS);

    return observations;
  } catch (error) {
    console.error('Error fetching notable observations:', error);
    return [];
  }
}

/**
 * Get observations near a specific location
 */
export async function getNearbyObservations(
  lat: number,
  lng: number,
  radius: number = 25,
  days: number = 14
): Promise<EBirdObservation[]> {
  if (!API_KEYS.EBIRD) {
    console.warn('eBird API key not configured');
    return [];
  }

  const cacheKey = `ebird_nearby_${lat}_${lng}_${radius}_${days}`;
  const cached = getCache<EBirdObservation[]>(cacheKey);

  if (cached) {
    return cached;
  }

  try {
    const url = `${API_URLS.EBIRD}/data/obs/geo/recent?lat=${lat}&lng=${lng}&dist=${radius}&back=${days}`;

    const response = await fetch(url, {
      headers: {
        'X-eBirdApiToken': API_KEYS.EBIRD,
      },
    });

    if (!response.ok) {
      return [];
    }

    const observations: EBirdObservation[] = await response.json();

    // Cache results
    setCache(cacheKey, observations, CACHE_DURATION.BIRD_SIGHTINGS);

    return observations;
  } catch (error) {
    console.error('Error fetching nearby observations:', error);
    return [];
  }
}

/**
 * Search for species by name (returns species code)
 */
export async function searchSpecies(query: string): Promise<Array<{ speciesCode: string; comName: string; sciName: string }>> {
  if (!API_KEYS.EBIRD) {
    console.warn('eBird API key not configured');
    return [];
  }

  try {
    // eBird uses taxonomy API to search species
    const url = `${API_URLS.EBIRD}/ref/taxonomy/ebird?fmt=json&locale=en`;

    const response = await fetch(url, {
      headers: {
        'X-eBirdApiToken': API_KEYS.EBIRD,
      },
    });

    if (!response.ok) {
      return [];
    }

    const taxonomy: Array<any> = await response.json();

    // Filter by query
    const filtered = taxonomy.filter(
      (species) =>
        species.comName?.toLowerCase().includes(query.toLowerCase()) ||
        species.sciName?.toLowerCase().includes(query.toLowerCase())
    );

    return filtered.map((species) => ({
      speciesCode: species.speciesCode,
      comName: species.comName,
      sciName: species.sciName,
    })).slice(0, 20);
  } catch (error) {
    console.error('Error searching eBird species:', error);
    return [];
  }
}

/**
 * Get hotspots (popular birding locations) in a region
 */
export async function getHotspots(
  regionCode: string = 'US',
  lat?: number,
  lng?: number
): Promise<Array<{ locId: string; locName: string; lat: number; lng: number }>> {
  if (!API_KEYS.EBIRD) {
    console.warn('eBird API key not configured');
    return [];
  }

  try {
    let url: string;

    if (lat && lng) {
      // Get hotspots near coordinates
      url = `${API_URLS.EBIRD}/ref/hotspot/geo?lat=${lat}&lng=${lng}&dist=50&fmt=json`;
    } else {
      // Get hotspots in region
      url = `${API_URLS.EBIRD}/ref/hotspot/${regionCode}?fmt=json`;
    }

    const response = await fetch(url, {
      headers: {
        'X-eBirdApiToken': API_KEYS.EBIRD,
      },
    });

    if (!response.ok) {
      return [];
    }

    const hotspots = await response.json();

    return hotspots.map((spot: any) => ({
      locId: spot.locId,
      locName: spot.locName,
      lat: spot.lat,
      lng: spot.lng,
    })).slice(0, 50);
  } catch (error) {
    console.error('Error fetching hotspots:', error);
    return [];
  }
}

/**
 * Calculate observation frequency for a location
 */
export function calculateFrequency(observations: EBirdObservation[]): {
  species: Map<string, number>;
  locations: Map<string, number>;
  totalCount: number;
} {
  const species = new Map<string, number>();
  const locations = new Map<string, number>();
  let totalCount = 0;

  observations.forEach((obs) => {
    // Count by species
    const currentSpeciesCount = species.get(obs.comName) || 0;
    species.set(obs.comName, currentSpeciesCount + (obs.howMany || 1));

    // Count by location
    const currentLocationCount = locations.get(obs.locName) || 0;
    locations.set(obs.locName, currentLocationCount + 1);

    totalCount += obs.howMany || 1;
  });

  return { species, locations, totalCount };
}

/**
 * Get most recent observation for a species
 */
export function getMostRecentObservation(
  observations: EBirdObservation[]
): EBirdObservation | null {
  if (observations.length === 0) return null;

  return observations.reduce((mostRecent, current) => {
    const mostRecentDate = new Date(mostRecent.obsDt);
    const currentDate = new Date(current.obsDt);
    return currentDate > mostRecentDate ? current : mostRecent;
  });
}

/**
 * Filter observations by date range
 */
export function filterByDateRange(
  observations: EBirdObservation[],
  startDate: Date,
  endDate: Date
): EBirdObservation[] {
  return observations.filter((obs) => {
    const obsDate = new Date(obs.obsDt);
    return obsDate >= startDate && obsDate <= endDate;
  });
}

/**
 * Get historical observations for a species in a region
 */
export async function getHistoricalObservations(
  speciesCode: string,
  regionCode: string = 'US',
  year?: number
): Promise<EBirdObservation[]> {
  if (!API_KEYS.EBIRD) {
    console.warn('eBird API key not configured');
    return [];
  }

  const cacheKey = `ebird_historical_${speciesCode}_${regionCode}_${year || 'all'}`;
  const cached = getCache<EBirdObservation[]>(cacheKey);

  if (cached) {
    return cached;
  }

  try {
    let url = `${API_URLS.EBIRD}/data/obs/${regionCode}/historical/${speciesCode}?fmt=json`;
    if (year) {
      url += `&year=${year}`;
    }

    const response = await fetch(url, {
      headers: {
        'X-eBirdApiToken': API_KEYS.EBIRD,
      },
    });

    if (!response.ok) {
      return [];
    }

    const observations: EBirdObservation[] = await response.json();
    setCache(cacheKey, observations, CACHE_DURATION.BIRD_SIGHTINGS);
    return observations;
  } catch (error) {
    console.error('Error fetching historical observations:', error);
    return [];
  }
}

/**
 * Get checklist submissions for a hotspot or location
 */
export async function getChecklists(
  locId: string,
  date?: string
): Promise<Array<{
  subId: string;
  locId: string;
  locName: string;
  obsDt: string;
  numSpecies: number;
  numObservers: number;
}>> {
  if (!API_KEYS.EBIRD) {
    console.warn('eBird API key not configured');
    return [];
  }

  const cacheKey = `ebird_checklists_${locId}_${date || 'all'}`;
  const cached = getCache<Array<any>>(cacheKey);

  if (cached) {
    return cached;
  }

  try {
    let url = `${API_URLS.EBIRD}/product/checklist/${locId}?fmt=json`;
    if (date) {
      url += `&date=${date}`;
    }

    const response = await fetch(url, {
      headers: {
        'X-eBirdApiToken': API_KEYS.EBIRD,
      },
    });

    if (!response.ok) {
      return [];
    }

    const checklists = await response.json();
    setCache(cacheKey, checklists, CACHE_DURATION.BIRD_SIGHTINGS);
    return checklists;
  } catch (error) {
    console.error('Error fetching checklists:', error);
    return [];
  }
}

/**
 * Get list of countries/regions available in eBird
 */
export async function getRegions(
  regionType: 'country' | 'subnational1' | 'subnational2' = 'country'
): Promise<Array<{ code: string; name: string }>> {
  if (!API_KEYS.EBIRD) {
    console.warn('eBird API key not configured');
    return [];
  }

  const cacheKey = `ebird_regions_${regionType}`;
  const cached = getCache<Array<{ code: string; name: string }>>(cacheKey);

  if (cached) {
    return cached;
  }

  try {
    const url = `${API_URLS.EBIRD}/ref/region/list/${regionType}?fmt=json`;

    const response = await fetch(url, {
      headers: {
        'X-eBirdApiToken': API_KEYS.EBIRD,
      },
    });

    if (!response.ok) {
      return [];
    }

    const regions = await response.json();
    setCache(cacheKey, regions, CACHE_DURATION.ANIMAL_DATA);
    return regions;
  } catch (error) {
    console.error('Error fetching regions:', error);
    return [];
  }
}

/**
 * Get taxonomy reference information
 */
export async function getTaxonomyReference(): Promise<Array<{
  speciesCode: string;
  comName: string;
  sciName: string;
  category: string;
  taxonOrder: number;
  bandingCodes?: string[];
  comNameCodes?: string[];
  sciNameCodes?: string[];
  order?: string;
  familyComName?: string;
  familySciName?: string;
  reportAs?: string;
}>> {
  if (!API_KEYS.EBIRD) {
    console.warn('eBird API key not configured');
    return [];
  }

  const cacheKey = 'ebird_taxonomy_full';
  const cached = getCache<Array<any>>(cacheKey);

  if (cached) {
    return cached;
  }

  try {
    const url = `${API_URLS.EBIRD}/ref/taxonomy/ebird?fmt=json&locale=en`;

    const response = await fetch(url, {
      headers: {
        'X-eBirdApiToken': API_KEYS.EBIRD,
      },
    });

    if (!response.ok) {
      return [];
    }

    const taxonomy = await response.json();
    // Cache for longer since taxonomy changes infrequently
    setCache(cacheKey, taxonomy, CACHE_DURATION.ANIMAL_DATA * 24);
    return taxonomy;
  } catch (error) {
    console.error('Error fetching taxonomy:', error);
    return [];
  }
}

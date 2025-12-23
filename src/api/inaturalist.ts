import { API_URLS, CACHE_DURATION } from '../utils/constants';
import { getCache, setCache } from '../utils/cache';

export interface INatObservation {
  id: number;
  taxon: {
    id: number;
    name: string;
    rank: string;
    preferred_common_name?: string;
    iconic_taxon_name: string;
    wikipedia_url?: string;
  };
  photos: Array<{
    url: string;
    attribution: string;
    license_code: string;
  }>;
  location?: [number, number];
  observed_on: string;
  description?: string;
}

export interface INatTaxon {
  id: number;
  name: string;
  rank: string;
  preferred_common_name?: string;
  wikipedia_url?: string;
  default_photo?: {
    medium_url: string;
    attribution: string;
  };
  iconic_taxon_name: string;
  conservation_status?: {
    status: string;
    status_name: string;
  };
  wikipedia_summary?: string;
}

/**
 * Search for species on iNaturalist (ANIMALS ONLY - no plants!)
 * Supports both text search (q parameter) and taxon filtering (taxon_id parameter)
 */
export async function searchINatSpecies(
  query: string,
  page: number = 1,
  perPage: number = 30
): Promise<INatTaxon[]> {
  // v2: Added taxon_id mapping for better results
  const cacheKey = `inat_species_v2_${query.toLowerCase()}_p${page}_pp${perPage}`;
  const cached = getCache<INatTaxon[]>(cacheKey);

  if (cached) {
    return cached;
  }

  try {
    // Map common taxonomy names to taxon IDs for better results
    const taxonIdMap: Record<string, number> = {
      'actinopterygii': 47178,  // Ray-finned fish
      'mammalia': 40151,        // Mammals
      'aves': 3,                // Birds
      'reptilia': 26036,        // Reptiles
      'amphibia': 20978,        // Amphibians
      'animalia': 1,            // All animals
    };

    const lowerQuery = query.toLowerCase();
    let url = `${API_URLS.INATURALIST}/taxa?`;

    // If query matches a known taxon, use taxon_id; otherwise use text search
    if (taxonIdMap[lowerQuery]) {
      url += `taxon_id=${taxonIdMap[lowerQuery]}&rank=species&per_page=${perPage}&page=${page}`;
    } else {
      url += `q=${encodeURIComponent(query)}&iconic_taxa=Animalia&rank=species&per_page=${perPage}&page=${page}`;
    }

    const response = await fetch(url);

    if (!response.ok) {
      console.warn('iNaturalist species search failed');
      return [];
    }

    const data = await response.json();
    const results = data.results || [];

    setCache(cacheKey, results, CACHE_DURATION.ANIMAL_DATA);
    return results;
  } catch (error) {
    console.error('Error searching iNaturalist species:', error);
    return [];
  }
}

/**
 * Get observations for a species (ANIMALS ONLY)
 */
export async function getINatObservations(
  taxonName: string,
  perPage: number = 30
): Promise<INatObservation[]> {
  const cacheKey = `inat_obs_v2_${taxonName.toLowerCase()}`;
  const cached = getCache<INatObservation[]>(cacheKey);

  if (cached) {
    return cached;
  }

  try {
    // Filter to animals only
    const response = await fetch(
      `${API_URLS.INATURALIST}/observations?taxon_name=${encodeURIComponent(taxonName)}&iconic_taxa=Animalia&quality_grade=research&photos=true&per_page=${perPage}`
    );

    if (!response.ok) {
      console.warn('iNaturalist observations fetch failed');
      return [];
    }

    const data = await response.json();
    const results = data.results || [];

    setCache(cacheKey, results, CACHE_DURATION.ANIMAL_DATA);
    return results;
  } catch (error) {
    console.error('Error fetching iNaturalist observations:', error);
    return [];
  }
}

/**
 * Get taxon details by ID
 */
export async function getINatTaxonDetails(taxonId: number): Promise<INatTaxon | null> {
  const cacheKey = `inat_taxon_v2_${taxonId}`;
  const cached = getCache<INatTaxon>(cacheKey);

  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(`${API_URLS.INATURALIST}/taxa/${taxonId}`);

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const taxon = data.results?.[0] || null;

    if (taxon) {
      setCache(cacheKey, taxon, CACHE_DURATION.ANIMAL_DATA);
    }

    return taxon;
  } catch (error) {
    console.error('Error fetching iNaturalist taxon details:', error);
    return null;
  }
}

/**
 * Get photos for a species from iNaturalist
 */
export async function getINatPhotos(taxonName: string, count: number = 10) {
  try {
    const observations = await getINatObservations(taxonName, count);

    return observations
      .filter((obs) => obs.photos && obs.photos.length > 0)
      .map((obs) => ({
        id: `inat-${obs.id}`,
        urls: {
          raw: obs.photos[0].url.replace('square', 'original'),
          full: obs.photos[0].url.replace('square', 'large'),
          regular: obs.photos[0].url.replace('square', 'medium'),
          small: obs.photos[0].url.replace('square', 'small'),
          thumb: obs.photos[0].url,
        },
        alt_description: obs.taxon.preferred_common_name || obs.taxon.name,
        user: {
          name: obs.photos[0].attribution || 'iNaturalist Community',
          username: 'inaturalist',
        },
        links: {
          html: `https://www.inaturalist.org/observations/${obs.id}`,
        },
      }));
  } catch (error) {
    console.error('Error fetching iNaturalist photos:', error);
    return [];
  }
}

/**
 * Get species information by common name
 */
export async function getINatSpeciesByName(commonName: string): Promise<INatTaxon | null> {
  try {
    const species = await searchINatSpecies(commonName);

    if (species.length === 0) {
      return null;
    }

    // Return the first match
    return species[0];
  } catch (error) {
    console.error('Error getting iNaturalist species by name:', error);
    return null;
  }
}

/**
 * Get geographic distribution data
 */
export async function getINatDistribution(taxonName: string): Promise<Array<{ lat: number; lng: number }>> {
  try {
    const observations = await getINatObservations(taxonName, 100);

    return observations
      .filter((obs) => obs.location && obs.location.length === 2)
      .map((obs) => ({
        lat: obs.location![1],
        lng: obs.location![0],
      }));
  } catch (error) {
    console.error('Error fetching iNaturalist distribution:', error);
    return [];
  }
}

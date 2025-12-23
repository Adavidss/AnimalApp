import { IUCNData } from '../types/animal';
import { API_KEYS, API_URLS, CACHE_DURATION } from '../utils/constants';
import { getCache, setCache } from '../utils/cache';
import { handleApiErrorSilently } from '../utils/errorHandling';

/**
 * Fetch IUCN Red List status for a species
 */
export async function fetchIUCNStatus(scientificName: string): Promise<IUCNData | null> {
  const cacheKey = `iucn_${scientificName.toLowerCase()}`;
  const cached = getCache<IUCNData>(cacheKey);

  if (cached) {
    return cached;
  }

  // Don't make API call if key is not configured or is placeholder
  if (!API_KEYS.IUCN || API_KEYS.IUCN === 'your_key_here') {
    return null;
  }

  try {
    // First, search for the species
    const searchResponse = await fetch(
      `${API_URLS.IUCN}/species/${encodeURIComponent(scientificName)}?token=${API_KEYS.IUCN}`
    );

    if (!searchResponse.ok) {
      return handleApiErrorSilently(
        new Error(`IUCN API returned ${searchResponse.status}`),
        'IUCN Red List',
        null
      );
    }

    const searchData = await searchResponse.json();

    if (!searchData.result || searchData.result.length === 0) {
      return null;
    }

    const species = searchData.result[0];

    const iucnData: IUCNData = {
      taxonid: species.taxonid,
      scientific_name: species.scientific_name,
      category: species.category,
      population_trend: species.population_trend,
      main_common_name: species.main_common_name,
    };

    setCache(cacheKey, iucnData, CACHE_DURATION.ANIMAL_DATA);
    return iucnData;
  } catch (error) {
    return handleApiErrorSilently(error, 'IUCN Red List', null);
  }
}

/**
 * Get conservation narrative/description
 */
export async function fetchIUCNNarrative(scientificName: string): Promise<string | null> {
  if (!API_KEYS.IUCN) {
    return null;
  }

  try {
    const species = await fetchIUCNStatus(scientificName);

    if (!species) {
      return null;
    }

    const response = await fetch(
      `${API_URLS.IUCN}/species/narrative/${species.taxonid}?token=${API_KEYS.IUCN}`
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    if (!data.result || data.result.length === 0) {
      return null;
    }

    const narrative = data.result[0];
    return (
      narrative.rationale ||
      narrative.geographicrange ||
      narrative.population ||
      narrative.habitat ||
      null
    );
  } catch (error) {
    return handleApiErrorSilently(error, 'IUCN Red List', null);
  }
}

/**
 * Get threats to the species
 */
export async function fetchIUCNThreats(scientificName: string): Promise<string[]> {
  if (!API_KEYS.IUCN) {
    return [];
  }

  try {
    const species = await fetchIUCNStatus(scientificName);

    if (!species) {
      return [];
    }

    const response = await fetch(
      `${API_URLS.IUCN}/threats/species/id/${species.taxonid}?token=${API_KEYS.IUCN}`
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();

    if (!data.result || data.result.length === 0) {
      return [];
    }

    return data.result.map((threat: any) => threat.title || threat.code);
  } catch (error) {
    return handleApiErrorSilently(error, 'IUCN Red List', []);
  }
}

/**
 * Search IUCN by common name
 */
export async function searchIUCN(query: string): Promise<IUCNData[]> {
  if (!API_KEYS.IUCN) {
    return [];
  }

  try {
    const response = await fetch(
      `${API_URLS.IUCN}/species/${encodeURIComponent(query)}?token=${API_KEYS.IUCN}`
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();

    if (!data.result || data.result.length === 0) {
      return [];
    }

    return data.result.map((species: any) => ({
      taxonid: species.taxonid,
      scientific_name: species.scientific_name,
      category: species.category,
      population_trend: species.population_trend,
      main_common_name: species.main_common_name,
    }));
  } catch (error) {
    return handleApiErrorSilently(error, 'IUCN Red List', []);
  }
}

/**
 * Get conservation measures
 */
export async function fetchConservationMeasures(scientificName: string): Promise<string[]> {
  if (!API_KEYS.IUCN) {
    return [];
  }

  try {
    const species = await fetchIUCNStatus(scientificName);

    if (!species) {
      return [];
    }

    const response = await fetch(
      `${API_URLS.IUCN}/measures/species/id/${species.taxonid}?token=${API_KEYS.IUCN}`
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();

    if (!data.result || data.result.length === 0) {
      return [];
    }

    return data.result.map((measure: any) => measure.title || measure.code);
  } catch (error) {
    return handleApiErrorSilently(error, 'IUCN Red List', []);
  }
}

/**
 * Check if species is endangered (CR, EN, or VU)
 */
export function isEndangered(status: IUCNData | null): boolean {
  if (!status) return false;
  return ['CR', 'EN', 'VU'].includes(status.category);
}

/**
 * Get status color class
 */
export function getStatusColor(category: string): string {
  const colors: Record<string, string> = {
    EX: 'gray',
    EW: 'gray',
    CR: 'red',
    EN: 'red',
    VU: 'orange',
    NT: 'yellow',
    LC: 'green',
    DD: 'gray',
    NE: 'gray',
  };

  return colors[category] || 'gray';
}

/**
 * Get list of countries where a species is found
 */
export async function getIUCNCountries(scientificName: string): Promise<Array<{
  code: string;
  name: string;
  presence: string;
  origin: string;
}>> {
  if (!API_KEYS.IUCN) {
    return [];
  }

  try {
    const species = await fetchIUCNStatus(scientificName);
    if (!species) {
      return [];
    }

    const response = await fetch(
      `${API_URLS.IUCN}/species/countries/name/${encodeURIComponent(scientificName)}?token=${API_KEYS.IUCN}`
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    if (!data.result || data.result.length === 0) {
      return [];
    }

    return data.result.map((country: any) => ({
      code: country.code,
      name: country.country,
      presence: country.presence,
      origin: country.origin,
    }));
  } catch (error) {
    return handleApiErrorSilently(error, 'IUCN Red List', []);
  }
}

/**
 * Get habitats for a species
 */
export async function getIUCNHabitats(scientificName: string): Promise<Array<{
  code: string;
  habitat: string;
  suitability: string;
  season?: string;
  importance?: string;
}>> {
  if (!API_KEYS.IUCN) {
    return [];
  }

  try {
    const species = await fetchIUCNStatus(scientificName);
    if (!species) {
      return [];
    }

    const response = await fetch(
      `${API_URLS.IUCN}/habitats/species/name/${encodeURIComponent(scientificName)}?token=${API_KEYS.IUCN}`
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    if (!data.result || data.result.length === 0) {
      return [];
    }

    return data.result.map((habitat: any) => ({
      code: habitat.code,
      habitat: habitat.habitat,
      suitability: habitat.suitability,
      season: habitat.season,
      importance: habitat.importance,
    }));
  } catch (error) {
    return handleApiErrorSilently(error, 'IUCN Red List', []);
  }
}

/**
 * Get all countries/regions from IUCN
 */
export async function getIUCNRegions(): Promise<Array<{ identifier: string; name: string }>> {
  if (!API_KEYS.IUCN) {
    return [];
  }

  const cacheKey = 'iucn_regions';
  const cached = getCache<Array<{ identifier: string; name: string }>>(cacheKey);

  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(
      `${API_URLS.IUCN}/region/list?token=${API_KEYS.IUCN}`
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    const regions = data.results || [];

    // Cache for 24 hours
    setCache(cacheKey, regions, CACHE_DURATION.ANIMAL_DATA * 24);
    return regions;
  } catch (error) {
    return handleApiErrorSilently(error, 'IUCN Red List', []);
  }
}

/**
 * Get citation information for a species
 */
export async function getIUCNCitations(scientificName: string): Promise<Array<{
  citation: string;
  type: string;
}>> {
  if (!API_KEYS.IUCN) {
    return [];
  }

  try {
    const species = await fetchIUCNStatus(scientificName);
    if (!species) {
      return [];
    }

    const response = await fetch(
      `${API_URLS.IUCN}/species/citation/${species.taxonid}?token=${API_KEYS.IUCN}`
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    if (!data.result || data.result.length === 0) {
      return [];
    }

    return data.result.map((citation: any) => ({
      citation: citation.citation,
      type: citation.citation_type,
    }));
  } catch (error) {
    return handleApiErrorSilently(error, 'IUCN Red List', []);
  }
}

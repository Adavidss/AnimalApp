import { WoRMSTaxon, WoRMSDistribution } from '../types/animal';
import { API_URLS, CACHE_DURATION } from '../utils/constants';
import { getCache, setCache } from '../utils/cache';
import { handleApiErrorSilently } from '../utils/errorHandling';

/**
 * Search for marine species in WoRMS (World Register of Marine Species)
 * No API key required - fully open API
 */
export async function searchMarineSpecies(
  scientificName: string
): Promise<WoRMSTaxon | null> {
  const cacheKey = `worms_${scientificName.toLowerCase()}`;
  const cached = getCache<WoRMSTaxon>(cacheKey);

  if (cached) {
    return cached;
  }

  try {
    // AphiaRecordsByMatchNames endpoint for exact match
    const url = `${API_URLS.WORMS}/AphiaRecordsByMatchNames?scientificnames[]=${encodeURIComponent(scientificName)}&marine_only=false`;

    const response = await fetch(url);

    if (!response.ok) {
      return handleApiErrorSilently(
        new Error(`WoRMS API returned ${response.status}`),
        'WoRMS',
        null
      );
    }

    // Check if response has content
    const text = await response.text();
    if (!text || text.trim().length === 0) {
      return null;
    }

    const data = JSON.parse(text);

    // WoRMS returns array of arrays
    if (Array.isArray(data) && data.length > 0 && Array.isArray(data[0]) && data[0].length > 0) {
      const taxon: WoRMSTaxon = data[0][0];

      // Cache result
      setCache(cacheKey, taxon, CACHE_DURATION.MARINE_DATA);

      return taxon;
    }

    return null;
  } catch (error) {
    return handleApiErrorSilently(error, 'WoRMS', null);
  }
}

/**
 * Search for species by common name
 */
export async function searchByVernacular(commonName: string): Promise<WoRMSTaxon[]> {
  const cacheKey = `worms_vernacular_${commonName.toLowerCase()}`;
  const cached = getCache<WoRMSTaxon[]>(cacheKey);

  if (cached) {
    return cached;
  }

  try {
    const url = `${API_URLS.WORMS}/AphiaRecordsByVernacular/${encodeURIComponent(commonName)}?like=true&offset=1`;

    const response = await fetch(url);

    if (!response.ok) {
      return handleApiErrorSilently(
        new Error(`WoRMS API returned ${response.status}`),
        'WoRMS',
        []
      );
    }

    // Check if response has content
    const text = await response.text();
    if (!text || text.trim().length === 0) {
      return [];
    }

    const taxa: WoRMSTaxon[] = JSON.parse(text);

    // Filter for valid/accepted taxa
    const validTaxa = Array.isArray(taxa)
      ? taxa.filter((taxon) => taxon.status === 'accepted')
      : [];

    // Cache results
    setCache(cacheKey, validTaxa, CACHE_DURATION.MARINE_DATA);

    return validTaxa.slice(0, 10);
  } catch (error) {
    return handleApiErrorSilently(error, 'WoRMS', []);
  }
}

/**
 * Get distribution data for a species
 */
export async function getMarineDistribution(
  aphiaId: number
): Promise<WoRMSDistribution[]> {
  const cacheKey = `worms_distribution_${aphiaId}`;
  const cached = getCache<WoRMSDistribution[]>(cacheKey);

  if (cached) {
    return cached;
  }

  try {
    const url = `${API_URLS.WORMS}/AphiaDistributionsByAphiaID/${aphiaId}`;

    const response = await fetch(url);

    if (!response.ok) {
      return handleApiErrorSilently(
        new Error(`WoRMS API returned ${response.status}`),
        'WoRMS',
        []
      );
    }

    // Check if response has content
    const text = await response.text();
    if (!text || text.trim().length === 0) {
      return [];
    }

    const distributions: WoRMSDistribution[] = JSON.parse(text);

    // Cache results
    setCache(cacheKey, Array.isArray(distributions) ? distributions : [], CACHE_DURATION.MARINE_DATA);

    return Array.isArray(distributions) ? distributions : [];
  } catch (error) {
    return handleApiErrorSilently(error, 'WoRMS', []);
  }
}

/**
 * Get full classification (taxonomy) for a species
 */
export async function getClassification(aphiaId: number): Promise<WoRMSTaxon[]> {
  try {
    const url = `${API_URLS.WORMS}/AphiaClassificationByAphiaID/${aphiaId}`;

    const response = await fetch(url);

    if (!response.ok) {
      return handleApiErrorSilently(
        new Error(`WoRMS API returned ${response.status}`),
        'WoRMS',
        []
      );
    }

    // Check if response has content
    const text = await response.text();
    if (!text || text.trim().length === 0) {
      return [];
    }

    const classification = JSON.parse(text);

    // Extract chain of taxonomic ranks
    function extractChain(node: any): WoRMSTaxon[] {
      const chain: WoRMSTaxon[] = [];

      if (node) {
        chain.push(node);
        if (node.child) {
          chain.push(...extractChain(node.child));
        }
      }

      return chain;
    }

    return extractChain(classification);
  } catch (error) {
    return handleApiErrorSilently(error, 'WoRMS', []);
  }
}

/**
 * Get synonyms for a species
 */
export async function getSynonyms(aphiaId: number): Promise<WoRMSTaxon[]> {
  try {
    const url = `${API_URLS.WORMS}/AphiaSynonymsByAphiaID/${aphiaId}`;

    const response = await fetch(url);

    if (!response.ok) {
      return handleApiErrorSilently(
        new Error(`WoRMS API returned ${response.status}`),
        'WoRMS',
        []
      );
    }

    // Check if response has content
    const text = await response.text();
    if (!text || text.trim().length === 0) {
      return [];
    }

    const synonyms: WoRMSTaxon[] = JSON.parse(text);

    return Array.isArray(synonyms) ? synonyms : [];
  } catch (error) {
    return handleApiErrorSilently(error, 'WoRMS', []);
  }
}

/**
 * Get vernacular names (common names) in different languages
 */
export async function getVernacularNames(
  aphiaId: number
): Promise<Array<{ vernacular: string; language: string }>> {
  try {
    const url = `${API_URLS.WORMS}/AphiaVernacularsByAphiaID/${aphiaId}`;

    const response = await fetch(url);

    if (!response.ok) {
      return handleApiErrorSilently(
        new Error(`WoRMS API returned ${response.status}`),
        'WoRMS',
        []
      );
    }

    // Check if response has content
    const text = await response.text();
    if (!text || text.trim().length === 0) {
      return [];
    }

    const vernaculars = JSON.parse(text);

    return Array.isArray(vernaculars)
      ? vernaculars.map((v: any) => ({
          vernacular: v.vernacular,
          language: v.language_code || v.language,
        }))
      : [];
  } catch (error) {
    return handleApiErrorSilently(error, 'WoRMS', []);
  }
}

/**
 * Get external identifiers for a species
 */
export async function getExternalIdentifiers(
  aphiaId: number
): Promise<Array<{ type: string; identifier: string; url?: string }>> {
  try {
    const url = `${API_URLS.WORMS}/AphiaExternalIDByAphiaID/${aphiaId}`;

    const response = await fetch(url);

    if (!response.ok) {
      return handleApiErrorSilently(
        new Error(`WoRMS API returned ${response.status}`),
        'WoRMS',
        []
      );
    }

    // Check if response has content
    const text = await response.text();
    if (!text || text.trim().length === 0) {
      return [];
    }

    const identifiers = JSON.parse(text);

    return Array.isArray(identifiers)
      ? identifiers.map((id: any) => ({
          type: id.type,
          identifier: id.identifier,
          url: id.url,
        }))
      : [];
  } catch (error) {
    return handleApiErrorSilently(error, 'WoRMS', []);
  }
}

/**
 * Check if species is marine, brackish, freshwater, or terrestrial
 */
export function getHabitatTypes(taxon: WoRMSTaxon): string[] {
  const habitats: string[] = [];

  if (taxon.isMarine === 1) habitats.push('Marine');
  if (taxon.isBrackish === 1) habitats.push('Brackish');
  if (taxon.isFreshwater === 1) habitats.push('Freshwater');
  if (taxon.isTerrestrial === 1) habitats.push('Terrestrial');

  return habitats;
}

/**
 * Check if species is extinct
 */
export function isExtinct(taxon: WoRMSTaxon): boolean {
  return taxon.isExtinct === 1;
}

/**
 * Get taxonomic rank display name
 */
export function getRankName(taxon: WoRMSTaxon): string {
  return taxon.rank || 'Unknown';
}

/**
 * Format full scientific name with authority
 */
export function getFullScientificName(taxon: WoRMSTaxon): string {
  if (taxon.authority) {
    return `${taxon.scientificname} ${taxon.authority}`;
  }
  return taxon.scientificname;
}

/**
 * Get WoRMS page URL
 */
export function getWormsUrl(aphiaId: number): string {
  return `https://www.marinespecies.org/aphia.php?p=taxdetails&id=${aphiaId}`;
}

/**
 * Parse distribution data to get unique locations
 */
export function getDistributionLocations(distributions: WoRMSDistribution[]): string[] {
  const locations = new Set<string>();

  distributions.forEach((dist) => {
    if (dist.locality) {
      locations.add(dist.locality);
    }
  });

  return Array.from(locations).sort();
}

/**
 * Filter distributions by occurrence status
 */
export function filterByOccurrenceStatus(
  distributions: WoRMSDistribution[],
  status: string
): WoRMSDistribution[] {
  return distributions.filter(
    (dist) => dist.occurrenceStatus?.toLowerCase() === status.toLowerCase()
  );
}

import { GBIFOccurrence, GBIFSpecies } from '../types/animal';
import { API_URLS, CACHE_DURATION } from '../utils/constants';
import { getCache, setCache } from '../utils/cache';

/**
 * Search for species in GBIF
 */
export async function searchGBIFSpecies(scientificName: string): Promise<GBIFSpecies | null> {
  const cacheKey = `gbif_species_${scientificName.toLowerCase()}`;
  const cached = getCache<GBIFSpecies>(cacheKey);

  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(
      `${API_URLS.GBIF}/species/match?name=${encodeURIComponent(scientificName)}`
    );

    if (!response.ok) {
      console.warn(`GBIF species not found for: ${scientificName}`);
      return null;
    }

    const data = await response.json();

    if (!data.usageKey) {
      return null;
    }

    const species: GBIFSpecies = {
      key: data.usageKey,
      scientificName: data.scientificName,
      canonicalName: data.canonicalName || data.scientificName,
      vernacularName: data.vernacularName,
      kingdom: data.kingdom,
      phylum: data.phylum,
      class: data.class,
      order: data.order,
      family: data.family,
      genus: data.genus,
      species: data.species,
      rank: data.rank,
    };

    setCache(cacheKey, species, CACHE_DURATION.ANIMAL_DATA);
    return species;
  } catch (error) {
    console.error('Error searching GBIF species:', error);
    return null;
  }
}

/**
 * Fetch occurrences for a species from GBIF
 */
export async function fetchGBIFOccurrences(
  scientificName: string,
  limit: number = 300
): Promise<GBIFOccurrence[]> {
  const cacheKey = `gbif_occurrences_${scientificName.toLowerCase()}`;
  const cached = getCache<GBIFOccurrence[]>(cacheKey);

  if (cached) {
    return cached;
  }

  try {
    // First get the species key
    const species = await searchGBIFSpecies(scientificName);

    if (!species) {
      return [];
    }

    // Then fetch occurrences
    const response = await fetch(
      `${API_URLS.GBIF}/occurrence/search?taxonKey=${species.key}&hasCoordinate=true&limit=${limit}`
    );

    if (!response.ok) {
      console.warn(`GBIF occurrences not found for: ${scientificName}`);
      return [];
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      return [];
    }

    const occurrences: GBIFOccurrence[] = data.results
      .filter((result: any) => result.decimalLatitude && result.decimalLongitude)
      .map((result: any) => ({
        key: result.key,
        scientificName: result.scientificName,
        decimalLatitude: result.decimalLatitude,
        decimalLongitude: result.decimalLongitude,
        country: result.country,
        stateProvince: result.stateProvince,
        locality: result.locality,
        eventDate: result.eventDate,
        basisOfRecord: result.basisOfRecord,
      }));

    setCache(cacheKey, occurrences, CACHE_DURATION.ANIMAL_DATA);
    return occurrences;
  } catch (error) {
    console.error('Error fetching GBIF occurrences:', error);
    return [];
  }
}

/**
 * Get species details from GBIF
 */
export async function getGBIFSpeciesDetails(speciesKey: number): Promise<any> {
  try {
    const response = await fetch(`${API_URLS.GBIF}/species/${speciesKey}`);

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching GBIF species details:', error);
    return null;
  }
}

/**
 * Get vernacular (common) names for a species
 */
export async function getGBIFVernacularNames(speciesKey: number): Promise<string[]> {
  try {
    const response = await fetch(`${API_URLS.GBIF}/species/${speciesKey}/vernacularNames`);

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    const results = data.results || [];

    // Filter for English names
    return results
      .filter((name: any) => name.language === 'eng')
      .map((name: any) => name.vernacularName);
  } catch (error) {
    console.error('Error fetching vernacular names:', error);
    return [];
  }
}

/**
 * Get occurrence count by country
 */
export async function getOccurrencesByCountry(scientificName: string): Promise<Record<string, number>> {
  try {
    const species = await searchGBIFSpecies(scientificName);

    if (!species) {
      return {};
    }

    const response = await fetch(
      `${API_URLS.GBIF}/occurrence/search?taxonKey=${species.key}&facet=country&limit=0`
    );

    if (!response.ok) {
      return {};
    }

    const data = await response.json();
    const facets = data.facets || [];
    const countryFacet = facets.find((f: any) => f.field === 'COUNTRY');

    if (!countryFacet) {
      return {};
    }

    const counts: Record<string, number> = {};
    countryFacet.counts.forEach((count: any) => {
      counts[count.name] = count.count;
    });

    return counts;
  } catch (error) {
    console.error('Error fetching occurrences by country:', error);
    return {};
  }
}

/**
 * Search species by common name
 */
export async function searchGBIFByCommonName(commonName: string): Promise<GBIFSpecies[]> {
  try {
    const response = await fetch(
      `${API_URLS.GBIF}/species/suggest?q=${encodeURIComponent(commonName)}&limit=10`
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();

    return data.map((item: any) => ({
      key: item.key,
      scientificName: item.scientificName,
      canonicalName: item.canonicalName || item.scientificName,
      vernacularName: item.vernacularName,
      kingdom: item.kingdom,
      phylum: item.phylum,
      class: item.class,
      order: item.order,
      family: item.family,
      genus: item.genus,
      species: item.species,
      rank: item.rank,
    }));
  } catch (error) {
    console.error('Error searching GBIF by common name:', error);
    return [];
  }
}

/**
 * Get distribution map data
 */
export async function getDistributionData(scientificName: string): Promise<{ lat: number; lng: number }[]> {
  const occurrences = await fetchGBIFOccurrences(scientificName);

  return occurrences
    .filter((occ) => occ.decimalLatitude && occ.decimalLongitude)
    .map((occ) => ({
      lat: occ.decimalLatitude!,
      lng: occ.decimalLongitude!,
    }));
}

/**
 * Get occurrence statistics for a species
 */
export async function getOccurrenceStatistics(scientificName: string): Promise<{
  totalOccurrences: number;
  countries: Record<string, number>;
  years: Record<string, number>;
  basisOfRecord: Record<string, number>;
} | null> {
  try {
    const species = await searchGBIFSpecies(scientificName);
    if (!species) {
      return null;
    }

    const response = await fetch(
      `${API_URLS.GBIF}/occurrence/search?taxonKey=${species.key}&facet=country&facet=year&facet=basisOfRecord&limit=0`
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    const stats = {
      totalOccurrences: data.count || 0,
      countries: {} as Record<string, number>,
      years: {} as Record<string, number>,
      basisOfRecord: {} as Record<string, number>,
    };

    // Process facets
    const facets = data.facets || [];
    
    const countryFacet = facets.find((f: any) => f.field === 'COUNTRY');
    if (countryFacet) {
      countryFacet.counts.forEach((count: any) => {
        stats.countries[count.name] = count.count;
      });
    }

    const yearFacet = facets.find((f: any) => f.field === 'YEAR');
    if (yearFacet) {
      yearFacet.counts.forEach((count: any) => {
        stats.years[count.name] = count.count;
      });
    }

    const basisFacet = facets.find((f: any) => f.field === 'BASIS_OF_RECORD');
    if (basisFacet) {
      basisFacet.counts.forEach((count: any) => {
        stats.basisOfRecord[count.name] = count.count;
      });
    }

    return stats;
  } catch (error) {
    console.error('Error fetching occurrence statistics:', error);
    return null;
  }
}

/**
 * Search for datasets containing a species
 */
export async function searchGBIFDatasets(scientificName: string): Promise<Array<{
  key: string;
  title: string;
  description?: string;
  homepage?: string;
  publishingOrganizationKey?: string;
  publishingCountry?: string;
}>> {
  try {
    const species = await searchGBIFSpecies(scientificName);
    if (!species) {
      return [];
    }

    const response = await fetch(
      `${API_URLS.GBIF}/occurrence/search?taxonKey=${species.key}&facet=datasetKey&limit=0`
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    const facets = data.facets || [];
    const datasetFacet = facets.find((f: any) => f.field === 'DATASET_KEY');

    if (!datasetFacet || !datasetFacet.counts) {
      return [];
    }

    // Get dataset details for top datasets
    const topDatasets = datasetFacet.counts.slice(0, 10);
    const datasetDetails = await Promise.all(
      topDatasets.map(async (count: any) => {
        try {
          const datasetResponse = await fetch(`${API_URLS.GBIF}/dataset/${count.name}`);
          if (datasetResponse.ok) {
            const dataset = await datasetResponse.json();
            return {
              key: dataset.key,
              title: dataset.title,
              description: dataset.description,
              homepage: dataset.homepage,
              publishingOrganizationKey: dataset.publishingOrganizationKey,
              publishingCountry: dataset.publishingCountry,
            };
          }
        } catch (err) {
          console.debug(`Error fetching dataset ${count.name}:`, err);
        }
        return null;
      })
    );

    return datasetDetails.filter((d): d is NonNullable<typeof d> => d !== null);
  } catch (error) {
    console.error('Error searching datasets:', error);
    return [];
  }
}

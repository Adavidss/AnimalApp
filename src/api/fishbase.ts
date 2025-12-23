import { API_URLS, CACHE_DURATION } from '../utils/constants';
import { getCache, setCache } from '../utils/cache';
import { handleApiErrorSilently } from '../utils/errorHandling';

export interface FishSpecies {
  SpecCode: number;
  Genus: string;
  Species: string;
  SpeciesRefNo: number;
  Author: string;
  FBname: string;
  PicPreferredName: string;
  PicPreferredNameM: string;
  PicPreferredNameF: string;
  PicPreferredNameJ: string;
  FamCode: number;
  Subfamily: string;
  GenCode: number;
  SubGenCode: number;
  BodyShapeI: string;
  Source: string;
  Remark: string;
  TaxIssue: number;
  Fresh: number;
  Brack: number;
  Saltwater: number;
  DemersPelag: string;
  AnaCat: string;
  MigratRef: number;
  DepthRangeShallow: number;
  DepthRangeDeep: number;
  DepthRangeRef: number;
  DepthRangeComShallow: number;
  DepthRangeComDeep: number;
  LongevityWild: number;
  LongevityWildRef: number;
  LongevityCaptive: number;
  LongevityCapRef: number;
  Length: number;
  LTypeMaxM: string;
  LengthFemale: number;
  LTypeMaxF: string;
  MaxLengthRef: number;
  CommonLength: number;
  LTypeComM: string;
  CommonLengthF: number;
  LTypeComF: string;
  CommonLengthRef: number;
  Weight: number;
  WeightFemale: number;
  MaxWeightRef: number;
  Pic: string;
  PictureFemale: string;
}

export interface FishEcology {
  SpecCode: number;
  FeedingType: string;
  DietTroph: number;
  DietSeTroph: number;
  DietRemark: string;
  FoodTroph: number;
  FoodSeTroph: number;
  FoodRemark: string;
  Habitat: string;
  HabitatRef: number;
}

/**
 * Search for fish species by common or scientific name
 */
export async function searchFishSpecies(query: string): Promise<FishSpecies[]> {
  const cacheKey = `fishbase_search_${query.toLowerCase()}`;
  const cached = getCache<FishSpecies[]>(cacheKey);

  if (cached) {
    return cached;
  }

  try {
    // FishBase API uses common names search
    const response = await fetch(
      `${API_URLS.FISHBASE}/comnames?CommonName=${encodeURIComponent(query)}&limit=10`,
      {
        headers: {
          Accept: 'application/json',
        },
      }
    );

    if (!response.ok) {
      return handleApiErrorSilently(
        new Error(`FishBase API returned ${response.status}`),
        'FishBase',
        []
      );
    }

    const data = await response.json();
    setCache(cacheKey, data.data || [], CACHE_DURATION.ANIMAL_DATA);
    return data.data || [];
  } catch (error) {
    // FishBase has SSL certificate issues, silently handle
    return handleApiErrorSilently(error, 'FishBase', []);
  }
}

/**
 * Get species details by SpecCode
 */
export async function getFishSpeciesDetails(specCode: number): Promise<FishSpecies | null> {
  const cacheKey = `fishbase_species_${specCode}`;
  const cached = getCache<FishSpecies>(cacheKey);

  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(`${API_URLS.FISHBASE}/species?SpecCode=${specCode}`, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const species = data.data?.[0] || null;

    if (species) {
      setCache(cacheKey, species, CACHE_DURATION.ANIMAL_DATA);
    }

    return species;
  } catch (error) {
    console.error('Error fetching FishBase species details:', error);
    return null;
  }
}

/**
 * Get ecology information for a fish species
 */
export async function getFishEcology(specCode: number): Promise<FishEcology | null> {
  const cacheKey = `fishbase_ecology_${specCode}`;
  const cached = getCache<FishEcology>(cacheKey);

  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(`${API_URLS.FISHBASE}/ecology?SpecCode=${specCode}`, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const ecology = data.data?.[0] || null;

    if (ecology) {
      setCache(cacheKey, ecology, CACHE_DURATION.ANIMAL_DATA);
    }

    return ecology;
  } catch (error) {
    console.error('Error fetching FishBase ecology:', error);
    return null;
  }
}

/**
 * Get common names for a species
 */
export async function getFishCommonNames(specCode: number): Promise<string[]> {
  try {
    const response = await fetch(`${API_URLS.FISHBASE}/comnames?SpecCode=${specCode}`, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return (data.data || []).map((item: any) => item.CommonName).filter(Boolean);
  } catch (error) {
    console.error('Error fetching FishBase common names:', error);
    return [];
  }
}

/**
 * Get species by genus
 */
export async function getFishByGenus(genus: string): Promise<FishSpecies[]> {
  const cacheKey = `fishbase_genus_${genus.toLowerCase()}`;
  const cached = getCache<FishSpecies[]>(cacheKey);

  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(`${API_URLS.FISHBASE}/species?Genus=${encodeURIComponent(genus)}`, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    const species = data.data || [];

    setCache(cacheKey, species, CACHE_DURATION.ANIMAL_DATA);
    return species;
  } catch (error) {
    console.error('Error fetching FishBase species by genus:', error);
    return [];
  }
}

/**
 * Get fish picture URL
 */
export function getFishPictureUrl(pictureName: string | null): string | null {
  if (!pictureName) {
    return null;
  }

  // FishBase images are hosted on SeaLifeBase
  return `https://www.fishbase.se/images/species/${pictureName}`;
}

/**
 * Search SeaLifeBase for non-fish aquatic species
 */
export async function searchSeaLife(query: string): Promise<any[]> {
  const cacheKey = `sealifebase_search_${query.toLowerCase()}`;
  const cached = getCache<any[]>(cacheKey);

  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(
      `${API_URLS.SEALIFEBASE}/comnames?ComName=${encodeURIComponent(query)}&limit=10`,
      {
        headers: {
          Accept: 'application/json',
        },
      }
    );

    if (!response.ok) {
      console.warn('SeaLifeBase search failed');
      return [];
    }

    const data = await response.json();
    setCache(cacheKey, data.data || [], CACHE_DURATION.ANIMAL_DATA);
    return data.data || [];
  } catch (error) {
    console.error('Error searching SeaLifeBase:', error);
    return [];
  }
}

/**
 * Get fish habitat information
 */
export async function getFishHabitat(specCode: number): Promise<string | null> {
  try {
    const ecology = await getFishEcology(specCode);
    return ecology?.Habitat || null;
  } catch (error) {
    console.error('Error fetching fish habitat:', error);
    return null;
  }
}

/**
 * Check if species is a fish
 */
export function isFishSpecies(animalName: string): boolean {
  const fishKeywords = [
    'fish',
    'salmon',
    'tuna',
    'shark',
    'bass',
    'trout',
    'cod',
    'halibut',
    'mackerel',
    'sardine',
    'anchovy',
    'herring',
    'goldfish',
    'catfish',
    'pike',
    'carp',
    'eel',
    'ray',
    'manta',
    'barracuda',
    'marlin',
    'swordfish',
  ];

  const lowerName = animalName.toLowerCase();
  return fishKeywords.some((keyword) => lowerName.includes(keyword));
}

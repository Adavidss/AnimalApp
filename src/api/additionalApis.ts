import { API_URLS, CACHE_DURATION } from '../utils/constants';
import { getCache, setCache } from '../utils/cache';
import { UnsplashImage } from '../types/animal';

/**
 * Additional Animal APIs Integration
 * Includes: Zoo Animal API, The Cat API, Shibe.online, Axolotl API, etc.
 */

// ============================================================================
// Zoo Animal API
// ============================================================================

export interface ZooAnimal {
  name: string;
  latin_name: string;
  animal_type: string;
  active_time: string;
  length_min: string;
  length_max: string;
  weight_min: string;
  weight_max: string;
  lifespan: string;
  habitat: string;
  diet: string;
  geo_range: string;
  image_link: string;
  id: number;
}

/**
 * Get random animals from Zoo Animal API
 * NOTE: Zoo Animal API is currently disabled due to CORS/404 errors
 * Returns empty array immediately without making any network requests
 */
export async function getRandomZooAnimals(_count: number = 10): Promise<ZooAnimal[]> {
  // Zoo Animal API is currently down/broken (CORS/404 errors)
  // Return empty array immediately - no fetch calls will be made
  return [];
  
  // Original implementation removed due to API issues:
  // The Zoo Animal API (https://zoo-animal-api.herokuapp.com) is returning 404 and CORS errors
}

/**
 * Search zoo animals by name (or get random if no name provided)
 * NOTE: Zoo Animal API is currently disabled due to CORS/404 errors
 * Returns empty array immediately without making any network requests
 */
export async function searchZooAnimals(_name: string): Promise<ZooAnimal[]> {
  // Zoo Animal API is currently down/broken (CORS/404 errors)
  // Return empty array immediately - no fetch calls will be made
  return [];
  
  // Original implementation removed due to API issues:
  // The Zoo Animal API (https://zoo-animal-api.herokuapp.com) is returning 404 and CORS errors
}

// ============================================================================
// The Cat API
// ============================================================================

export interface CatBreed {
  id: string;
  name: string;
  temperament: string;
  origin: string;
  description: string;
  life_span: string;
  indoor: number;
  adaptability: number;
  affection_level: number;
  child_friendly: number;
  dog_friendly: number;
  energy_level: number;
  grooming: number;
  health_issues: number;
  intelligence: number;
  social_needs: number;
  stranger_friendly: number;
  weight: {
    imperial: string;
    metric: string;
  };
  wikipedia_url?: string;
  reference_image_id?: string;
}

export interface CatImage {
  id: string;
  url: string;
  width: number;
  height: number;
  breeds?: CatBreed[];
}

/**
 * Get random cat images from The Cat API
 */
export async function getRandomCatImages(limit: number = 10): Promise<CatImage[]> {
  try {
    const response = await fetch(`${API_URLS.THE_CAT_API}/images/search?limit=${limit}`);

    if (!response.ok) {
      console.warn('The Cat API failed');
      return [];
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching cat images:', error);
    return [];
  }
}

/**
 * Get all cat breeds
 */
export async function getCatBreeds(): Promise<CatBreed[]> {
  const cacheKey = 'cat_breeds';
  const cached = getCache<CatBreed[]>(cacheKey);

  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(`${API_URLS.THE_CAT_API}/breeds`);

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    setCache(cacheKey, data, CACHE_DURATION.ANIMAL_DATA);
    return data;
  } catch (error) {
    console.error('Error fetching cat breeds:', error);
    return [];
  }
}

/**
 * Search cat breeds by name
 */
export async function searchCatBreeds(query: string): Promise<CatBreed[]> {
  try {
    const allBreeds = await getCatBreeds();
    if (!query) return allBreeds;

    const lowercaseQuery = query.toLowerCase();
    return allBreeds.filter(breed =>
      breed.name.toLowerCase().includes(lowercaseQuery) ||
      breed.temperament?.toLowerCase().includes(lowercaseQuery) ||
      breed.origin?.toLowerCase().includes(lowercaseQuery)
    );
  } catch (error) {
    console.error('Error searching cat breeds:', error);
    return [];
  }
}

/**
 * Get cat images by breed
 */
export async function getCatImagesByBreed(breedId: string, limit: number = 10): Promise<CatImage[]> {
  const cacheKey = `cat_images_${breedId}`;
  const cached = getCache<CatImage[]>(cacheKey);

  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(
      `${API_URLS.THE_CAT_API}/images/search?breed_ids=${breedId}&limit=${limit}`
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    setCache(cacheKey, data, CACHE_DURATION.IMAGES);
    return data;
  } catch (error) {
    console.error('Error fetching cat images:', error);
    return [];
  }
}

// ============================================================================
// Shibe.online - Random Shiba Inu, cats, and birds
// ============================================================================

/**
 * Get random Shiba Inu images
 */
export async function getRandomShibeImages(count: number = 10): Promise<string[]> {
  try {
    const response = await fetch(`${API_URLS.SHIBE}/shibes?count=${Math.min(count, 100)}`);

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching shibe images:', error);
    return [];
  }
}

/**
 * Get random bird images from Shibe.online
 */
export async function getRandomBirdImages(count: number = 10): Promise<string[]> {
  try {
    const response = await fetch(`${API_URLS.SHIBE}/birds?count=${Math.min(count, 100)}`);

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching bird images:', error);
    return [];
  }
}

// ============================================================================
// Axolotl API
// ============================================================================

export interface AxolotlImage {
  url: string;
  width: number;
  height: number;
}

/**
 * Get random axolotl image
 */
export async function getRandomAxolotlImage(): Promise<AxolotlImage | null> {
  try {
    const response = await fetch(`${API_URLS.AXOLOTL}/random`);

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching axolotl image:', error);
    return null;
  }
}

// ============================================================================
// FishWatch API (NOAA)
// ============================================================================

export interface FishWatchSpecies {
  'Species Name': string;
  'Scientific Name': string;
  'Species Illustration Photo': {
    src: string;
    alt: string;
    title: string;
  };
  Habitat: string;
  'Habitat Impacts': string;
  Location: string;
  Population: string;
  'Population Status': string;
  'Fishing Rate': string;
  Biology: string;
  Availability: string;
  Taste: string;
  Texture: string;
  Color: string;
  'Health Benefits': string;
}

/**
 * Get all FishWatch species
 */
export async function getFishWatchSpecies(): Promise<FishWatchSpecies[]> {
  const cacheKey = 'fishwatch_species';
  const cached = getCache<FishWatchSpecies[]>(cacheKey);

  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(`${API_URLS.FISHWATCH}/species.json`);

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    setCache(cacheKey, data, CACHE_DURATION.ANIMAL_DATA);
    return data;
  } catch (error) {
    console.error('Error fetching FishWatch species:', error);
    return [];
  }
}

/**
 * Search FishWatch by species name
 */
export async function searchFishWatch(query: string): Promise<FishWatchSpecies[]> {
  try {
    const allSpecies = await getFishWatchSpecies();
    return allSpecies.filter(
      (species) =>
        species['Species Name']?.toLowerCase().includes(query.toLowerCase()) ||
        species['Scientific Name']?.toLowerCase().includes(query.toLowerCase())
    );
  } catch (error) {
    console.error('Error searching FishWatch:', error);
    return [];
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Convert any image URL to UnsplashImage format
 */
export function convertToUnsplashFormat(
  imageUrl: string,
  altText: string,
  source: string,
  id?: string
): UnsplashImage {
  return {
    id: id || `${source}-${Date.now()}`,
    urls: {
      raw: imageUrl,
      full: imageUrl,
      regular: imageUrl,
      small: imageUrl,
      thumb: imageUrl,
    },
    alt_description: altText,
    user: {
      name: source,
      username: source.toLowerCase().replace(/\s+/g, ''),
    },
    links: {
      html: imageUrl,
    },
  };
}

/**
 * Get placeholder image URLs
 */
export function getPlaceholderImages(type: 'bear' | 'dog' | 'kitten', count: number = 6): UnsplashImage[] {
  const images: UnsplashImage[] = [];

  for (let i = 0; i < count; i++) {
    const size = 400 + (i * 50);
    let url = '';

    switch (type) {
      case 'bear':
        url = `${API_URLS.PLACEBEAR}/${size}/${size}`;
        break;
      case 'dog':
        url = `${API_URLS.PLACEDOG}/${size}/${size}`;
        break;
      case 'kitten':
        url = `${API_URLS.PLACEKITTEN}/${size}/${size}`;
        break;
    }

    images.push(convertToUnsplashFormat(url, `${type} placeholder`, `Place${type}`, `${type}-${i}`));
  }

  return images;
}

/**
 * Enhanced animal type detection
 */
export function detectAnimalType(query: string): 'dog' | 'cat' | 'bird' | 'fish' | 'axolotl' | 'bear' | 'shibe' | 'general' {
  const lower = query.toLowerCase();

  if (lower.includes('dog') || lower.includes('puppy') || lower.includes('canine')) return 'dog';
  if (lower.includes('cat') || lower.includes('kitten') || lower.includes('feline')) return 'cat';
  if (lower.includes('bird') || lower.includes('avian')) return 'bird';
  if (lower.includes('fish')) return 'fish';
  if (lower.includes('axolotl')) return 'axolotl';
  if (lower.includes('bear')) return 'bear';
  if (lower.includes('shib') || lower.includes('shiba')) return 'shibe';

  return 'general';
}

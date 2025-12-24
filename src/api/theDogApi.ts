import { API_KEYS, API_URLS, CACHE_DURATION } from '../utils/constants';
import { getCache, setCache } from '../utils/cache';
import { UnsplashImage } from '../types/animal';

/**
 * The Dog API - Comprehensive dog breeds database with images
 * https://www.thedogapi.com/
 */

export interface DogBreed {
  id: number;
  name: string;
  bred_for?: string;
  breed_group?: string;
  life_span?: string;
  temperament?: string;
  origin?: string;
  reference_image_id?: string;
  image?: {
    id: string;
    width: number;
    height: number;
    url: string;
  };
  weight: {
    imperial: string;
    metric: string;
  };
  height: {
    imperial: string;
    metric: string;
  };
}

export interface DogImage {
  id: string;
  url: string;
  width: number;
  height: number;
  breeds?: DogBreed[];
}

/**
 * Get all dog breeds
 */
export async function getAllDogBreeds(): Promise<DogBreed[]> {
  const cacheKey = 'dog_api_all_breeds';
  const cached = getCache<DogBreed[]>(cacheKey);

  if (cached) {
    return cached;
  }

  try {
    const headers: HeadersInit = {};
    if (API_KEYS.THE_DOG_API) {
      headers['x-api-key'] = API_KEYS.THE_DOG_API;
    }

    const response = await fetch(`${API_URLS.THE_DOG_API}/breeds`, {
      headers,
    });

    if (!response.ok) {
      console.warn('The Dog API breeds fetch failed');
      return [];
    }

    const data = await response.json();
    setCache(cacheKey, data, CACHE_DURATION.ANIMAL_DATA);
    return data;
  } catch (error) {
    console.error('Error fetching dog breeds:', error);
    return [];
  }
}

/**
 * Search dog breeds by name
 */
export async function searchDogBreeds(query: string): Promise<DogBreed[]> {
  const cacheKey = `dog_api_search_${query.toLowerCase()}`;
  const cached = getCache<DogBreed[]>(cacheKey);

  if (cached) {
    return cached;
  }

  try {
    const headers: HeadersInit = {};
    if (API_KEYS.THE_DOG_API) {
      headers['x-api-key'] = API_KEYS.THE_DOG_API;
    }

    const response = await fetch(`${API_URLS.THE_DOG_API}/breeds/search?q=${encodeURIComponent(query)}`, {
      headers,
    });

    if (!response.ok) {
      console.warn('The Dog API search failed');
      return [];
    }

    const data = await response.json();
    setCache(cacheKey, data, CACHE_DURATION.ANIMAL_DATA);
    return data;
  } catch (error) {
    console.error('Error searching dog breeds:', error);
    return [];
  }
}

/**
 * Get dog images by breed ID
 */
export async function getDogImagesByBreed(breedId: number, limit: number = 10): Promise<DogImage[]> {
  const cacheKey = `dog_api_images_${breedId}`;
  const cached = getCache<DogImage[]>(cacheKey);

  if (cached) {
    return cached;
  }

  try {
    const headers: HeadersInit = {};
    if (API_KEYS.THE_DOG_API) {
      headers['x-api-key'] = API_KEYS.THE_DOG_API;
    }

    const response = await fetch(
      `${API_URLS.THE_DOG_API}/images/search?breed_ids=${breedId}&limit=${limit}`,
      { headers }
    );

    if (!response.ok) {
      console.warn('The Dog API images fetch failed');
      return [];
    }

    const data = await response.json();
    setCache(cacheKey, data, CACHE_DURATION.IMAGES);
    return data;
  } catch (error) {
    console.error('Error fetching dog images:', error);
    return [];
  }
}

/**
 * Get random dog images
 */
export async function getRandomDogImages(limit: number = 10): Promise<DogImage[]> {
  try {
    const headers: HeadersInit = {};
    if (API_KEYS.THE_DOG_API) {
      headers['x-api-key'] = API_KEYS.THE_DOG_API;
    }

    const response = await fetch(
      `${API_URLS.THE_DOG_API}/images/search?limit=${limit}`,
      { headers }
    );

    if (!response.ok) {
      console.warn('The Dog API random images fetch failed');
      return [];
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching random dog images:', error);
    return [];
  }
}

/**
 * Convert Dog API images to Unsplash format
 */
export function convertDogImagesToUnsplashFormat(images: DogImage[]): UnsplashImage[] {
  return images.map((img) => ({
    id: img.id,
    urls: {
      raw: img.url,
      full: img.url,
      regular: img.url,
      small: img.url,
      thumb: img.url,
    },
    alt_description: img.breeds?.[0]?.name || 'Dog',
    user: {
      name: 'The Dog API',
      username: 'thedogapi',
    },
    links: {
      html: `https://thedogapi.com`,
    },
  }));
}

/**
 * Get dog breed information by name
 */
export async function getDogBreedInfo(breedName: string): Promise<DogBreed | null> {
  try {
    const breeds = await searchDogBreeds(breedName);
    return breeds.length > 0 ? breeds[0] : null;
  } catch (error) {
    console.error('Error getting dog breed info:', error);
    return null;
  }
}

/**
 * Check if query is a dog breed
 */
export async function isDogBreed(query: string): Promise<boolean> {
  const breeds = await searchDogBreeds(query);
  return breeds.length > 0;
}

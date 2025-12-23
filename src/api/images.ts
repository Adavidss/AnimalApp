import { UnsplashImage } from '../types/animal';
import { API_KEYS, API_URLS, FALLBACK_IMAGE, CACHE_DURATION } from '../utils/constants';
import { getCache, setCache } from '../utils/cache';
import { getRandomAnimalImages } from './randomAnimals';
import { getINatPhotos } from './inaturalist';
import { getRandomDogImages, convertDogImagesToUnsplashFormat } from './theDogApi';
import {
  getRandomCatImages,
  getRandomShibeImages,
  getRandomBirdImages,
  convertToUnsplashFormat,
  detectAnimalType,
} from './additionalApis';

/**
 * Simplify animal name for better image search results
 * Examples:
 * - "European Rhinocerous Beetle" -> "Beetle"
 * - "Cross Orbweaver" -> "Spider"
 * - "Sandhill Crane" -> "Crane"
 */
function simplifyAnimalName(name: string): string {
  const words = name.split(' ');

  // Common animal type keywords that should be kept
  const animalTypes = [
    'beetle', 'spider', 'butterfly', 'moth', 'bee', 'ant', 'fly', 'dragonfly',
    'bird', 'eagle', 'hawk', 'owl', 'falcon', 'crane', 'heron', 'duck', 'goose', 'dove', 'pigeon',
    'fish', 'shark', 'tuna', 'salmon', 'bass', 'trout',
    'snake', 'lizard', 'gecko', 'iguana', 'chameleon', 'turtle', 'tortoise', 'frog', 'toad',
    'bear', 'wolf', 'fox', 'deer', 'moose', 'elk', 'bison', 'lion', 'tiger', 'leopard', 'cheetah',
    'elephant', 'giraffe', 'zebra', 'hippo', 'rhino', 'gorilla', 'monkey', 'ape', 'orangutan', 'chimpanzee',
    'whale', 'dolphin', 'seal', 'otter', 'walrus', 'penguin', 'octopus', 'squid',
    'crab', 'lobster', 'shrimp', 'jellyfish', 'starfish', 'scorpion', 'tarantula'
  ];

  // Check if any word is an animal type
  for (const word of words) {
    const lowerWord = word.toLowerCase();
    if (animalTypes.includes(lowerWord)) {
      return word; // Return just the animal type
    }
  }

  // If no animal type found, return the last word (often the animal type)
  return words[words.length - 1];
}

/**
 * Fetch images from Unsplash with fallbacks to iNaturalist and random animal APIs
 */
export async function fetchUnsplashImages(
  query: string,
  count: number = 6
): Promise<UnsplashImage[]> {
  // Use original query for cache key to avoid conflicts
  const cacheKey = `images_${query.toLowerCase()}`;
  const cached = getCache<UnsplashImage[]>(cacheKey);

  if (cached) {
    return cached;
  }

  // Simplify query for better image search results
  // e.g., "European Rhinocerous Beetle" -> "Beetle"
  const simplifiedQuery = simplifyAnimalName(query);

  // Try Unsplash first if key is available
  if (API_KEYS.UNSPLASH && API_KEYS.UNSPLASH !== 'your_key_here') {
    try {
      const response = await fetch(
        `${API_URLS.UNSPLASH}/search/photos?query=${encodeURIComponent(simplifiedQuery)}&per_page=${count}&orientation=landscape`,
        {
          headers: {
            Authorization: `Client-ID ${API_KEYS.UNSPLASH}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();

        if (data.results && data.results.length > 0) {
          const images: UnsplashImage[] = data.results.map((photo: any) => ({
            id: photo.id,
            urls: {
              raw: photo.urls.raw,
              full: photo.urls.full,
              regular: photo.urls.regular,
              small: photo.urls.small,
              thumb: photo.urls.thumb,
            },
            alt_description: photo.alt_description || photo.description || query,
            user: {
              name: photo.user.name,
              username: photo.user.username,
            },
            links: {
              html: photo.links.html,
            },
          }));

          setCache(cacheKey, images, CACHE_DURATION.IMAGES);
          return images;
        }
      }
    } catch (error) {
      // Silently try fallback APIs
      if (import.meta.env.DEV) {
        console.debug('[Images] Unsplash failed, trying fallbacks');
      }
    }
  }

  // Fallback 1: Try The Dog API for dog images (if we have the key)
  const animalType = detectAnimalType(simplifiedQuery);

  if (animalType === 'dog' && API_KEYS.THE_DOG_API) {
    try {
      const dogImages = await getRandomDogImages(count);
      if (dogImages && dogImages.length > 0) {
        const formatted = convertDogImagesToUnsplashFormat(dogImages);
        setCache(cacheKey, formatted, CACHE_DURATION.IMAGES);
        return formatted;
      }
    } catch (error) {
      // Silent fallback
    }
  }

  // Fallback 2: Try The Cat API for cat images (if we have the key)
  if (animalType === 'cat' && API_KEYS.THE_CAT_API) {
    try {
      const catImages = await getRandomCatImages(count);
      if (catImages && catImages.length > 0) {
        const formatted = catImages.map((img) =>
          convertToUnsplashFormat(img.url, 'Cat', 'The Cat API', img.id)
        );
        setCache(cacheKey, formatted, CACHE_DURATION.IMAGES);
        return formatted;
      }
    } catch (error) {
      // Silent fallback
    }
  }

  // Fallback 3: Try Shibe.online for specific animals
  if (animalType === 'shibe' || animalType === 'dog') {
    try {
      const shibeUrls = await getRandomShibeImages(count);
      if (shibeUrls && shibeUrls.length > 0) {
        const formatted = shibeUrls.map((url, i) =>
          convertToUnsplashFormat(url, 'Shiba Inu', 'Shibe.online', `shibe-${i}`)
        );
        setCache(cacheKey, formatted, CACHE_DURATION.IMAGES);
        return formatted;
      }
    } catch (error) {
      // Silent fallback
    }
  }

  // Fallback 4: Try Shibe.online bird images for birds
  if (animalType === 'bird') {
    try {
      const birdUrls = await getRandomBirdImages(count);
      if (birdUrls && birdUrls.length > 0) {
        const formatted = birdUrls.map((url, i) =>
          convertToUnsplashFormat(url, 'Bird', 'Shibe.online', `bird-${i}`)
        );
        setCache(cacheKey, formatted, CACHE_DURATION.IMAGES);
        return formatted;
      }
    } catch (error) {
      // Silent fallback
    }
  }

  // Fallback 5: Try iNaturalist for species photos
  try {
    const inatPhotos = await getINatPhotos(simplifiedQuery, count);
    if (inatPhotos && inatPhotos.length > 0) {
      setCache(cacheKey, inatPhotos, CACHE_DURATION.IMAGES);
      return inatPhotos;
    }
  } catch (error) {
    // Silent fallback
  }

  // Fallback 6: Try random animal APIs for specific animals
  try {
    const randomImages = await getRandomAnimalImages(simplifiedQuery, count);
    if (randomImages && randomImages.length > 0) {
      setCache(cacheKey, randomImages, CACHE_DURATION.IMAGES);
      return randomImages;
    }
  } catch (error) {
    // Silent fallback
  }

  // Final fallback: Return empty array instead of generic fallback images
  // This prevents the same generic images (like elephant) from being cached
  // and shown for all animals
  if (import.meta.env.DEV) {
    console.debug(`[Images] No images found for: ${query}`);
  }
  return [];
}

/**
 * Generate fallback images when all APIs fail (DEPRECATED - returns empty)
 */
function generateFallbackImages(query: string, count: number): UnsplashImage[] {
  // Don't use static fallback images as they get cached and shown for all animals
  // Components should handle empty image arrays with placeholder UI instead
  return [];
}

/**
 * Get single image for animal
 */
export async function getAnimalImage(animalName: string): Promise<string> {
  try {
    const images = await fetchUnsplashImages(animalName, 1);
    return images.length > 0 ? images[0].urls.regular : FALLBACK_IMAGE;
  } catch (error) {
    return FALLBACK_IMAGE;
  }
}

/**
 * Download tracking for Unsplash (required by API guidelines)
 */
export async function trackUnsplashDownload(downloadUrl: string): Promise<void> {
  if (!API_KEYS.UNSPLASH) return;

  try {
    await fetch(downloadUrl, {
      headers: {
        Authorization: `Client-ID ${API_KEYS.UNSPLASH}`,
      },
    });
  } catch (error) {
    console.error('Error tracking download:', error);
  }
}

/**
 * Get random nature/animal photos from Unsplash
 */
export async function getRandomAnimalPhotos(count: number = 10): Promise<UnsplashImage[]> {
  if (!API_KEYS.UNSPLASH) {
    return generateFallbackImages('wildlife', count);
  }

  try {
    const response = await fetch(
      `${API_URLS.UNSPLASH}/photos/random?query=wildlife,animals&count=${count}&orientation=landscape`,
      {
        headers: {
          Authorization: `Client-ID ${API_KEYS.UNSPLASH}`,
        },
      }
    );

    if (!response.ok) {
      return generateFallbackImages('wildlife', count);
    }

    const data = await response.json();

    return data.map((photo: any) => ({
      id: photo.id,
      urls: {
        raw: photo.urls.raw,
        full: photo.urls.full,
        regular: photo.urls.regular,
        small: photo.urls.small,
        thumb: photo.urls.thumb,
      },
      alt_description: photo.alt_description || photo.description || 'Wildlife',
      user: {
        name: photo.user.name,
        username: photo.user.username,
      },
      links: {
        html: photo.links.html,
      },
    }));
  } catch (error) {
    console.error('Error fetching random photos:', error);
    return generateFallbackImages('wildlife', count);
  }
}

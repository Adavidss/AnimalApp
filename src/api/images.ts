import { UnsplashImage } from '../types/animal';
import { API_KEYS, API_URLS, FALLBACK_IMAGE, CACHE_DURATION } from '../utils/constants';
import { getCache, setCache } from '../utils/cache';
import { getRandomAnimalImages } from './randomAnimals';
import { getINatPhotos } from './inaturalist';
import { getRandomDogImages, convertDogImagesToUnsplashFormat } from './theDogApi';
import { fetchWikipediaSummary } from './wikipedia';
import {
  getRandomCatImages,
  getRandomShibeImages,
  getRandomBirdImages,
  convertToUnsplashFormat,
  detectAnimalType,
} from './additionalApis';

/**
 * Build better search queries for image APIs
 * Tries multiple query variations for better results
 */
function buildImageSearchQueries(commonName: string, scientificName?: string): string[] {
  const queries: string[] = [];
  
  // 1. Try full common name first (most specific)
  queries.push(commonName);
  
  // 2. If scientific name provided, try it
  if (scientificName) {
    queries.push(scientificName);
    // Also try just genus + species (in case of subspecies)
    const sciParts = scientificName.trim().split(/\s+/);
    if (sciParts.length >= 2) {
      queries.push(`${sciParts[0]} ${sciParts[1]}`);
    }
  }
  
  // 3. Try without common geographic/locational descriptors that might confuse search
  // But keep specific identifiers like "Bigbelly", "Durban", etc. which are important
  const words = commonName.split(' ');
  if (words.length > 2) {
    // Only remove generic geographic words, keep specific names
    const genericGeoWords = ['common', 'northern', 'southern', 'eastern', 'western', 'north', 'south', 'east', 'west'];
    const meaningfulWords = words.filter(w => !genericGeoWords.includes(w.toLowerCase()));
    
    if (meaningfulWords.length >= 2 && meaningfulWords.join(' ') !== commonName) {
      queries.push(meaningfulWords.join(' '));
    }
  }
  
  // 4. Last resort: try just the last word (often the animal type)
  // But only if it's not too generic AND the name has multiple words
  if (words.length > 1) {
    const lastWord = words[words.length - 1].toLowerCase();
    const genericTypes = ['animal', 'creature', 'species', 'beast', 'mammal', 'bird', 'fish'];
    // Only use last word if it's a specific type, not generic
    if (!genericTypes.includes(lastWord) && lastWord.length > 3) {
      queries.push(words[words.length - 1]);
    }
  }
  
  return queries;
}

/**
 * Fetch images from Unsplash with fallbacks to iNaturalist and random animal APIs
 */
export async function fetchUnsplashImages(
  query: string,
  count: number = 6,
  scientificName?: string
): Promise<UnsplashImage[]> {
  // Use original query for cache key to avoid conflicts
  const cacheKey = `images_${query.toLowerCase()}_${scientificName || ''}`;
  const cached = getCache<UnsplashImage[]>(cacheKey);

  if (cached) {
    return cached;
  }

  // Build multiple query variations for better results
  const searchQueries = buildImageSearchQueries(query, scientificName);

  // PRIORITY 1: Try iNaturalist first - most accurate species photos
  // Add timeout to prevent hanging if iNaturalist is slow
  try {
    const inatTimeout = new Promise<UnsplashImage[]>((resolve) => {
      setTimeout(() => resolve([]), 2000); // 2 second timeout for faster fallback
    });
    
    let inatPromise: Promise<UnsplashImage[]>;
    
    if (scientificName) {
      if (import.meta.env.DEV) {
        console.log(`[Images] Trying iNaturalist with scientific name: ${scientificName}`);
      }
      inatPromise = getINatPhotos(scientificName, count);
    } else {
      if (import.meta.env.DEV) {
        console.log(`[Images] Trying iNaturalist with common name: ${query}`);
      }
      inatPromise = getINatPhotos(query, count);
    }
    
    // Race between iNaturalist and timeout
    const inatPhotos = await Promise.race([inatPromise, inatTimeout]);
    
    if (inatPhotos && inatPhotos.length > 0) {
      if (import.meta.env.DEV) {
        console.log(`[Images] Found ${inatPhotos.length} iNaturalist photos`);
      }
      setCache(cacheKey, inatPhotos, CACHE_DURATION.IMAGES);
      return inatPhotos;
    } else {
      // If timeout or empty, also try common name if we tried scientific first
      if (scientificName) {
        if (import.meta.env.DEV) {
          console.log(`[Images] Trying iNaturalist with common name as fallback: ${query}`);
        }
        const inatPhotosCommon = await Promise.race([getINatPhotos(query, count), inatTimeout]);
        if (inatPhotosCommon && inatPhotosCommon.length > 0) {
          if (import.meta.env.DEV) {
            console.log(`[Images] Found ${inatPhotosCommon.length} iNaturalist photos with common name`);
          }
          setCache(cacheKey, inatPhotosCommon, CACHE_DURATION.IMAGES);
          return inatPhotosCommon;
        }
      }
    }
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('[Images] iNaturalist error:', error);
    }
    // Silent fallback - continue to other sources
  }

  if (import.meta.env.DEV) {
    console.log(`[Images] iNaturalist returned no photos or timed out, trying Unsplash...`);
    console.log(`[Images] Unsplash API key check:`, {
      hasKey: !!API_KEYS.UNSPLASH,
      isPlaceholder: API_KEYS.UNSPLASH === 'your_key_here',
      keyLength: API_KEYS.UNSPLASH?.length || 0
    });
  }

  // PRIORITY 2: Try Unsplash with multiple query variations (with timeout)
  if (API_KEYS.UNSPLASH && API_KEYS.UNSPLASH !== 'your_key_here') {
    if (import.meta.env.DEV) {
      console.log(`[Images] Trying Unsplash with queries:`, searchQueries);
    }
    for (const searchQuery of searchQueries) {
      try {
        if (import.meta.env.DEV) {
          console.log(`[Images] Unsplash search for: "${searchQuery}"`);
        }
        
        // Add timeout to Unsplash requests
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
        
        try {
          const response = await fetch(
            `${API_URLS.UNSPLASH}/search/photos?query=${encodeURIComponent(searchQuery)}&per_page=${count}&orientation=landscape`,
            {
              headers: {
                Authorization: `Client-ID ${API_KEYS.UNSPLASH}`,
              },
              signal: controller.signal,
            }
          );
          
          clearTimeout(timeoutId);

          if (import.meta.env.DEV) {
            console.log(`[Images] Unsplash response status: ${response.status}`);
          }

          if (response.ok) {
            const data = await response.json();

            if (data.results && data.results.length > 0) {
              if (import.meta.env.DEV) {
                console.log(`[Images] Unsplash found ${data.results.length} images for "${searchQuery}"`);
              }
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
            } else {
              if (import.meta.env.DEV) {
                console.log(`[Images] Unsplash returned no results for "${searchQuery}"`);
              }
            }
          } else {
            if (import.meta.env.DEV) {
              const errorText = await response.text().catch(() => '');
              console.warn(`[Images] Unsplash error ${response.status}:`, errorText);
            }
          }
        } catch (fetchError: any) {
          clearTimeout(timeoutId);
          if (fetchError.name === 'AbortError') {
            if (import.meta.env.DEV) {
              console.log(`[Images] Unsplash request timeout for "${searchQuery}"`);
            }
          } else {
            if (import.meta.env.DEV) {
              console.error(`[Images] Unsplash fetch error for "${searchQuery}":`, fetchError);
            }
          }
          // Try next query variation
          continue;
        }
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error(`[Images] Unsplash request setup error:`, error);
        }
        continue;
      }
    }
  } else {
    if (import.meta.env.DEV) {
      console.warn('[Images] Unsplash API key not configured. Skipping Unsplash.');
      console.warn('[Images] To enable Unsplash images, set VITE_UNSPLASH_ACCESS_KEY in .env file');
    }
  }

  // PRIORITY 3: Try Wikipedia thumbnail as last resort (with timeout)
  try {
    if (import.meta.env.DEV) {
      console.log(`[Images] Trying Wikipedia thumbnail for: ${query}`);
    }
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout
    
    try {
      // Use Promise.race for timeout
      const wikipedia = await Promise.race([
        fetchWikipediaSummary(query),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 2000))
      ]);
      
      clearTimeout(timeoutId);
    if (wikipedia?.thumbnail?.source) {
      if (import.meta.env.DEV) {
        console.log(`[Images] Found Wikipedia thumbnail`);
      }
      const wikiImage: UnsplashImage = {
        id: `wiki-${Date.now()}`,
        urls: {
          raw: wikipedia.thumbnail.source,
          full: wikipedia.thumbnail.source.replace(/\/\d+px-/, '/800px-'),
          regular: wikipedia.thumbnail.source.replace(/\/\d+px-/, '/600px-'),
          small: wikipedia.thumbnail.source,
          thumb: wikipedia.thumbnail.source,
        },
        alt_description: wikipedia.title || query,
        user: {
          name: 'Wikipedia',
          username: 'wikipedia',
        },
        links: {
          html: wikipedia.url || `https://en.wikipedia.org/wiki/${encodeURIComponent(query)}`,
        },
      };
      // Cache single image
      setCache(cacheKey, [wikiImage], CACHE_DURATION.IMAGES);
      return [wikiImage];
    }
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error?.name !== 'AbortError' && import.meta.env.DEV) {
        console.debug('[Images] Wikipedia thumbnail fetch failed:', error);
      }
    }
  } catch (error) {
    if (import.meta.env.DEV) {
      console.debug('[Images] Wikipedia thumbnail request setup failed:', error);
    }
  }

  // PRIORITY 3: Try The Dog API ONLY for specific dog breeds (if we have the key)
  const animalType = detectAnimalType(query);
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

  // PRIORITY 4: Try The Cat API ONLY for specific cat breeds (if we have the key)
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

  // REMOVED: Random fallback APIs (Shibe.online, random bird images) as they return incorrect images

  // Final fallback: Return empty array instead of generic fallback images
  // This prevents the same generic images (like elephant) from being cached
  // and shown for all animals
  if (import.meta.env.DEV) {
    console.warn(`[Images] No images found for: ${query}${scientificName ? ` (${scientificName})` : ''}`);
    console.warn(`[Images] All image sources exhausted. Consider checking:`);
    console.warn(`  - Unsplash API key: ${API_KEYS.UNSPLASH ? 'Set' : 'NOT SET'}`);
    console.warn(`  - Query variations tried:`, searchQueries);
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

/**
 * Search Unsplash collections
 */
export async function searchUnsplashCollections(query: string, limit: number = 10): Promise<Array<{
  id: number;
  title: string;
  description?: string;
  cover_photo?: {
    id: string;
    urls: {
      thumb: string;
      small: string;
      regular: string;
    };
  };
  total_photos: number;
}>> {
  if (!API_KEYS.UNSPLASH) {
    return [];
  }

  try {
    const response = await fetch(
      `${API_URLS.UNSPLASH}/search/collections?query=${encodeURIComponent(query)}&per_page=${limit}`,
      {
        headers: {
          Authorization: `Client-ID ${API_KEYS.UNSPLASH}`,
        },
      }
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error searching collections:', error);
    return [];
  }
}

/**
 * Get photos from a specific Unsplash collection
 */
export async function getCollectionPhotos(collectionId: number, limit: number = 20): Promise<UnsplashImage[]> {
  if (!API_KEYS.UNSPLASH) {
    return [];
  }

  try {
    const response = await fetch(
      `${API_URLS.UNSPLASH}/collections/${collectionId}/photos?per_page=${limit}`,
      {
        headers: {
          Authorization: `Client-ID ${API_KEYS.UNSPLASH}`,
        },
      }
    );

    if (!response.ok) {
      return [];
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
      alt_description: photo.alt_description || photo.description || '',
      user: {
        name: photo.user.name,
        username: photo.user.username,
      },
      links: {
        html: photo.links.html,
      },
    }));
  } catch (error) {
    console.error('Error fetching collection photos:', error);
    return [];
  }
}

/**
 * Get user statistics from Unsplash
 */
export async function getUserStats(username: string): Promise<{
  username: string;
  name: string;
  total_photos?: number;
  total_collections?: number;
  profile_image?: {
    small: string;
    medium: string;
    large: string;
  };
} | null> {
  if (!API_KEYS.UNSPLASH) {
    return null;
  }

  try {
    const response = await fetch(
      `${API_URLS.UNSPLASH}/users/${username}`,
      {
        headers: {
          Authorization: `Client-ID ${API_KEYS.UNSPLASH}`,
        },
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return {
      username: data.username,
      name: data.name,
      total_photos: data.total_photos,
      total_collections: data.total_collections,
      profile_image: data.profile_image,
    };
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return null;
  }
}

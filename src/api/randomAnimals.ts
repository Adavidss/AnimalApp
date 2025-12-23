import { API_URLS } from '../utils/constants';
import { UnsplashImage } from '../types/animal';

/**
 * Free random animal image APIs that don't require authentication
 */

/**
 * Get random dog image from Dog API
 */
export async function getRandomDogImage(): Promise<string | null> {
  try {
    const response = await fetch(`${API_URLS.RANDOM_DOG}/woof.json`);

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.url || null;
  } catch (error) {
    console.error('Error fetching random dog image:', error);
    return null;
  }
}

/**
 * Get random cat image from Cataas
 */
export async function getRandomCatImage(): Promise<string | null> {
  try {
    // Cataas returns the image directly, so we construct the URL
    const timestamp = Date.now(); // Prevent caching
    return `${API_URLS.CATAAS}/cat?${timestamp}`;
  } catch (error) {
    console.error('Error fetching random cat image:', error);
    return null;
  }
}

/**
 * Get random fox image from RandomFox
 */
export async function getRandomFoxImage(): Promise<string | null> {
  try {
    const response = await fetch(`${API_URLS.RANDOM_FOX}/floof`);

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.image || null;
  } catch (error) {
    console.error('Error fetching random fox image:', error);
    return null;
  }
}

/**
 * Get random duck image from RandomDuck
 */
export async function getRandomDuckImage(): Promise<string | null> {
  try {
    const response = await fetch(`${API_URLS.RANDOM_DUCK}/random`);

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.url || null;
  } catch (error) {
    console.error('Error fetching random duck image:', error);
    return null;
  }
}

/**
 * Get cat fact from Cat Facts API
 */
export async function getRandomCatFact(): Promise<string | null> {
  try {
    const response = await fetch(`${API_URLS.CAT_FACTS}/fact`);

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.fact || null;
  } catch (error) {
    console.error('Error fetching cat fact:', error);
    return null;
  }
}

/**
 * Get dog facts from Dog API
 */
export async function getRandomDogFact(): Promise<string | null> {
  try {
    const response = await fetch(`${API_URLS.DOG_FACTS}`);

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.facts?.[0] || null;
  } catch (error) {
    console.error('Error fetching dog fact:', error);
    return null;
  }
}

/**
 * Get dog breed information from Dog API
 */
export async function getDogBreeds(): Promise<any[]> {
  try {
    const response = await fetch(`${API_URLS.DOG_API}/breeds/list/all`);

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return Object.keys(data.message || {}).map((breed) => ({
      name: breed,
      subBreeds: data.message[breed] || [],
    }));
  } catch (error) {
    console.error('Error fetching dog breeds:', error);
    return [];
  }
}

/**
 * Get random dog image by breed
 */
export async function getRandomDogImageByBreed(breed: string): Promise<string | null> {
  try {
    const response = await fetch(`${API_URLS.DOG_API}/breed/${breed.toLowerCase()}/images/random`);

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.message || null;
  } catch (error) {
    console.error('Error fetching dog image by breed:', error);
    return null;
  }
}

/**
 * Convert animal-specific image to UnsplashImage format
 */
export function convertToUnsplashFormat(
  imageUrl: string,
  animalType: string,
  id: string
): UnsplashImage {
  return {
    id,
    urls: {
      raw: imageUrl,
      full: imageUrl,
      regular: imageUrl,
      small: imageUrl,
      thumb: imageUrl,
    },
    alt_description: `Random ${animalType}`,
    user: {
      name: `${animalType} API`,
      username: animalType.toLowerCase(),
    },
    links: {
      html: imageUrl,
    },
  };
}

/**
 * Get random animal images based on animal type
 */
export async function getRandomAnimalImages(
  animalType: string,
  count: number = 6
): Promise<UnsplashImage[]> {
  const images: UnsplashImage[] = [];
  const lowerType = animalType.toLowerCase();

  try {
    for (let i = 0; i < count; i++) {
      let imageUrl: string | null = null;

      if (lowerType.includes('dog') || lowerType.includes('canine')) {
        imageUrl = await getRandomDogImage();
      } else if (lowerType.includes('cat') || lowerType.includes('feline')) {
        imageUrl = await getRandomCatImage();
      } else if (lowerType.includes('fox')) {
        imageUrl = await getRandomFoxImage();
      } else if (lowerType.includes('duck')) {
        imageUrl = await getRandomDuckImage();
      }

      if (imageUrl) {
        images.push(convertToUnsplashFormat(imageUrl, animalType, `${lowerType}-${i}`));
      }

      // Small delay to avoid rate limiting
      if (i < count - 1) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }
  } catch (error) {
    console.error('Error fetching random animal images:', error);
  }

  return images;
}

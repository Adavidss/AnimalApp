import { Animal } from '../types/animal';
import { API_KEYS, API_URLS, RATE_LIMIT, CACHE_DURATION } from '../utils/constants';
import { getCache, setCache } from '../utils/cache';
import { getINatSpeciesByName } from './inaturalist';
// FishBase API disabled due to SSL certificate issues
// import { searchFishSpecies, isFishSpecies } from './fishbase';
import { searchZooAnimals } from './additionalApis';
import { searchDogBreeds, isDogBreed } from './theDogApi';

/**
 * Fetch animals by name from API Ninjas with fallback to iNaturalist and FishBase
 */
export async function fetchAnimalByName(name: string): Promise<Animal[]> {
  const cacheKey = `animal_data_${name.toLowerCase()}`;
  const cached = getCache<Animal[]>(cacheKey);

  if (cached) {
    return cached;
  }

  // Try API Ninjas first if key is available
  if (API_KEYS.API_NINJAS && API_KEYS.API_NINJAS !== 'your_key_here') {
    try {
      const response = await fetch(`${API_URLS.API_NINJAS}/animals?name=${encodeURIComponent(name)}`, {
        headers: {
          'X-Api-Key': API_KEYS.API_NINJAS,
        },
      });

      if (response.ok) {
        const data: Animal[] = await response.json();

        if (data && data.length > 0) {
          setCache(cacheKey, data, CACHE_DURATION.ANIMAL_DATA);
          return data;
        }
      } else if (response.status === 429) {
        console.warn('API Ninjas rate limit exceeded, trying fallback APIs');
      } else {
        console.warn('API Ninjas failed, trying fallback APIs');
      }
    } catch (error) {
      console.error('Error fetching from API Ninjas:', error);
    }
  }

  // Fallback 1: Try The Dog API for dog breeds (if we have the key)
  if (API_KEYS.THE_DOG_API) {
    try {
      const isDog = await isDogBreed(name);
      if (isDog) {
        const dogBreeds = await searchDogBreeds(name);
        if (dogBreeds && dogBreeds.length > 0) {
          const breed = dogBreeds[0];
          const animalData: Animal[] = [
            {
              name: breed.name,
              taxonomy: {
                kingdom: 'Animalia',
                phylum: 'Chordata',
                class: 'Mammalia',
                order: 'Carnivora',
                family: 'Canidae',
                genus: 'Canis',
                scientific_name: 'Canis lupus familiaris',
              },
              locations: breed.origin ? [breed.origin] : [],
              characteristics: {
                lifespan: breed.life_span,
                habitat: breed.temperament || '',
              },
            },
          ];
          setCache(cacheKey, animalData, CACHE_DURATION.ANIMAL_DATA);
          return animalData;
        }
      }
    } catch (error) {
      console.error('Error fetching from The Dog API:', error);
    }
  }

  // Fallback 3: Try iNaturalist
  try {
    const inatSpecies = await getINatSpeciesByName(name);
    if (inatSpecies) {
      const animalData: Animal[] = [
        {
          name: inatSpecies.preferred_common_name || inatSpecies.name,
          taxonomy: {
            kingdom: '',
            phylum: '',
            class: '',
            order: '',
            family: '',
            genus: '',
            scientific_name: inatSpecies.name,
          },
          locations: [],
          characteristics: {},
        },
      ];
      setCache(cacheKey, animalData, CACHE_DURATION.ANIMAL_DATA);
      return animalData;
    }
  } catch (error) {
    console.error('Error fetching from iNaturalist:', error);
  }

  // If all APIs fail, return empty array
  if (import.meta.env.DEV) {
    console.debug(`[Animals] No data found for: ${name}`);
  }
  return [];
}

/**
 * Search for multiple animals
 */
export async function searchAnimals(query: string): Promise<Animal[]> {
  if (!query.trim()) {
    return [];
  }

  try {
    return await fetchAnimalByName(query);
  } catch (error) {
    console.error('Error searching animals:', error);
    throw error;
  }
}

/**
 * Get a random animal using a curated list (Zoo API is deprecated)
 */
export async function getRandomAnimal(): Promise<Animal | null> {
  try {
    // Use curated list with names that API Ninjas recognizes
    const curatedAnimals = [
      // Mammals - Using simple names API Ninjas knows
      'Lion', 'Tiger', 'Elephant', 'Giraffe', 'Zebra',
      'Bear', 'Panda', 'Gorilla', 'Chimpanzee', 'Orangutan',
      'Kangaroo', 'Koala', 'Wolf', 'Fox', 'Deer',
      'Moose', 'Bison', 'Rhinoceros', 'Hippopotamus',
      'Leopard', 'Cheetah', 'Jaguar', 'Cougar',
      'Dolphin', 'Whale', 'Seal', 'Otter', 'Walrus',

      // Birds
      'Eagle', 'Hawk', 'Owl', 'Falcon', 'Vulture',
      'Penguin', 'Flamingo', 'Parrot', 'Toucan', 'Peacock',
      'Crow', 'Raven', 'Robin', 'Sparrow', 'Cardinal',
      'Ostrich', 'Emu', 'Pelican', 'Heron', 'Crane',
      'Duck', 'Goose', 'Swan', 'Albatross',

      // Reptiles & Amphibians
      'Crocodile', 'Alligator', 'Snake', 'Python', 'Cobra',
      'Lizard', 'Iguana', 'Chameleon', 'Gecko',
      'Turtle', 'Tortoise', 'Frog', 'Toad', 'Salamander',

      // Fish & Marine Life
      'Shark', 'Tuna', 'Octopus', 'Squid', 'Jellyfish',
      'Starfish', 'Seahorse', 'Clownfish', 'Swordfish',
      'Stingray', 'Lobster', 'Crab',

      // Insects
      'Butterfly', 'Dragonfly', 'Bee', 'Ant', 'Beetle',
      'Spider', 'Scorpion', 'Ladybug'
    ];

    const randomName = curatedAnimals[Math.floor(Math.random() * curatedAnimals.length)];
    const animals = await fetchAnimalByName(randomName);
    return animals.length > 0 ? animals[0] : null;
  } catch (error) {
    console.error('Error fetching random animal:', error);
    return null;
  }
}

/**
 * Filter animals by category
 */
export function filterByCategory(animals: Animal[], category: string): Animal[] {
  if (category === 'all' || !category) {
    return animals;
  }

  return animals.filter((animal) => {
    const animalClass = animal.taxonomy.class?.toLowerCase() || '';
    const animalOrder = animal.taxonomy.order?.toLowerCase() || '';

    switch (category.toLowerCase()) {
      case 'mammal':
        return animalClass === 'mammalia';
      case 'bird':
        return animalClass === 'aves';
      case 'reptile':
        return animalClass === 'reptilia';
      case 'amphibian':
        return animalClass === 'amphibia';
      case 'fish':
        return animalClass.includes('fish') || animalOrder.includes('fish');
      default:
        return true;
    }
  });
}

/**
 * Filter animals by habitat
 */
export function filterByHabitat(animals: Animal[], habitat: string): Animal[] {
  if (habitat === 'all' || !habitat) {
    return animals;
  }

  return animals.filter((animal) => {
    const animalHabitat = animal.characteristics.habitat?.toLowerCase() || '';
    const locations = animal.locations.map((l) => l.toLowerCase()).join(' ');

    switch (habitat.toLowerCase()) {
      case 'land':
        return (
          animalHabitat.includes('forest') ||
          animalHabitat.includes('grassland') ||
          animalHabitat.includes('desert') ||
          animalHabitat.includes('mountain') ||
          animalHabitat.includes('jungle') ||
          animalHabitat.includes('savanna')
        );
      case 'ocean':
        return (
          animalHabitat.includes('ocean') ||
          animalHabitat.includes('sea') ||
          animalHabitat.includes('marine') ||
          animalHabitat.includes('reef')
        );
      case 'freshwater':
        return (
          animalHabitat.includes('river') ||
          animalHabitat.includes('lake') ||
          animalHabitat.includes('stream') ||
          animalHabitat.includes('pond') ||
          animalHabitat.includes('wetland')
        );
      case 'air':
        return animalHabitat.includes('flying') || animalHabitat.includes('aerial');
      default:
        return true;
    }
  });
}

/**
 * Batch fetch multiple animals with rate limiting
 */
export async function batchFetchAnimals(names: string[]): Promise<Animal[]> {
  const results: Animal[] = [];
  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  for (let i = 0; i < names.length; i++) {
    try {
      const animals = await fetchAnimalByName(names[i]);
      if (animals.length > 0) {
        results.push(animals[0]);
      }

      // Rate limiting: delay between requests
      if (i < names.length - 1) {
        await delay(RATE_LIMIT.RETRY_DELAY);
      }
    } catch (error) {
      console.error(`Error fetching ${names[i]}:`, error);
      // Continue with next animal even if one fails
    }
  }

  return results;
}

/**
 * Get animal by scientific name
 */
export async function fetchAnimalByScientificName(scientificName: string): Promise<Animal | null> {
  try {
    // API Ninjas doesn't support search by scientific name directly
    // We'll need to search by common name and filter
    // This is a limitation we'll document
    const response = await fetch(
      `${API_URLS.API_NINJAS}/animals?name=${encodeURIComponent(scientificName)}`,
      {
        headers: {
          'X-Api-Key': API_KEYS.API_NINJAS,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch animal: ${response.statusText}`);
    }

    const data: Animal[] = await response.json();
    return data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error('Error fetching animal by scientific name:', error);
    return null;
  }
}

import { Animal } from '../types/animal';
import { API_KEYS, API_URLS, RATE_LIMIT, CACHE_DURATION } from '../utils/constants';
import { getCache, setCache } from '../utils/cache';
import { getINatSpeciesByName, searchINatSpecies, INatTaxon } from './inaturalist';
import { searchGBIFByCommonName } from './gbif';
import { GBIFSpecies } from '../types/animal';
// FishBase API disabled due to SSL certificate issues
// import { searchFishSpecies, isFishSpecies } from './fishbase';
import { getCatBreeds } from './additionalApis';
// Zoo Animal API disabled due to CORS/404 errors
// import { searchZooAnimals } from './additionalApis';
import { searchDogBreeds, isDogBreed } from './theDogApi';
import { searchByVernacular } from './worms';
import { WoRMSTaxon } from '../types/animal';

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
          // Filter out plants before caching
          const animalsOnly = data.filter((animal) => {
            const kingdom = animal.taxonomy?.kingdom?.toLowerCase() || '';
            const name = animal.name?.toLowerCase() || '';
            const scientificName = animal.taxonomy?.scientific_name?.toLowerCase() || '';
            
            // Exclude plants
            if (kingdom.includes('plantae') || kingdom.includes('plant')) {
              return false;
            }
            
            // Exclude common plant names
            const plantKeywords = [
              'grass', 'tree', 'flower', 'plant', 'shrub', 'bush', 'moss', 'fern', 'vernal',
              'beggarticks', 'tick', 'aster', 'composite', 'sunflower', 'thistle', 'dandelion', 'clover',
              'wheat', 'corn', 'rice', 'barley', 'oat', 'plectranthus', 'woolly'
            ];
            if (plantKeywords.some(keyword => name.includes(keyword) || scientificName.includes(keyword))) {
              return false;
            }
            
            return true;
          });
          
          if (animalsOnly.length > 0) {
            setCache(cacheKey, animalsOnly, CACHE_DURATION.ANIMAL_DATA);
            return animalsOnly;
          }
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

  // Fallback 1: Try The Cat API for cat breeds (if we have the key)
  if (API_KEYS.THE_CAT_API) {
    try {
      const allCatBreeds = await getCatBreeds();
      const matchingCatBreed = allCatBreeds.find(
        (breed) => breed.name.toLowerCase() === name.toLowerCase()
      );
      
      if (matchingCatBreed) {
        const animalData: Animal[] = [
          {
            name: matchingCatBreed.name,
            taxonomy: {
              kingdom: 'Animalia',
              phylum: 'Chordata',
              class: 'Mammalia',
              order: 'Carnivora',
              family: 'Felidae',
              genus: 'Felis',
              scientific_name: 'Felis catus',
            },
            locations: matchingCatBreed.origin ? [matchingCatBreed.origin] : [],
            characteristics: {
              lifespan: matchingCatBreed.life_span,
              habitat: matchingCatBreed.temperament || '',
            },
          },
        ];
        setCache(cacheKey, animalData, CACHE_DURATION.ANIMAL_DATA);
        return animalData;
      }
    } catch (error) {
      console.error('Error fetching from The Cat API:', error);
    }
  }

  // Fallback 2: Try The Dog API for dog breeds (if we have the key)
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

  // Fallback 3: Try iNaturalist (already filtered to animals only via iconic_taxa=Animalia)
  try {
    const inatSpecies = await getINatSpeciesByName(name);
    if (inatSpecies) {
      // Double-check it's an animal (iNaturalist should already filter, but be safe)
      const name = (inatSpecies.preferred_common_name || inatSpecies.name).toLowerCase();
      const scientificName = inatSpecies.name.toLowerCase();
      const plantKeywords = ['grass', 'tree', 'flower', 'plant', 'shrub', 'bush', 'moss', 'fern', 'vernal', 'plectranthus', 'woolly'];
      
      if (!plantKeywords.some(keyword => name.includes(keyword) || scientificName.includes(keyword))) {
        const animalData: Animal[] = [
          {
            name: inatSpecies.preferred_common_name || inatSpecies.name,
            taxonomy: {
              kingdom: 'Animalia', // iNaturalist only returns animals
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
 * Check if an animal result is actually an animal (not a plant)
 */
function isAnimal(animal: Animal): boolean {
  // Check kingdom - should be Animalia, not Plantae
  const kingdom = animal.taxonomy?.kingdom?.toLowerCase() || '';
  if (kingdom.includes('plantae') || kingdom.includes('plant')) {
    return false;
  }

  // Check for common plant indicators in name
  const name = animal.name?.toLowerCase() || '';
  const scientificName = animal.taxonomy?.scientific_name?.toLowerCase() || '';
  const plantKeywords = [
    'grass', 'tree', 'flower', 'plant', 'shrub', 'bush', 'moss', 'fern',
    'algae', 'fungus', 'mushroom', 'lichen', 'herb', 'weed', 'vine', 'cactus',
    'palm', 'oak', 'pine', 'maple', 'birch', 'willow', 'rose', 'lily', 'daisy',
    'vernal', 'wheat', 'corn', 'rice', 'barley', 'oat', 'beggarticks', 'tick',
    'aster', 'composite', 'sunflower', 'thistle', 'dandelion', 'clover',
    'plectranthus', 'woolly'
  ];
  
  if (plantKeywords.some(keyword => name.includes(keyword) || scientificName.includes(keyword))) {
    return false;
  }

  // Check class - should be an animal class, not a plant class
  const animalClass = animal.taxonomy?.class?.toLowerCase() || '';
  const plantClasses = ['magnoliopsida', 'liliopsida', 'pinopsida', 'lycopodiopsida', 'polypodiopsida', 'asteraceae', 'poaceae'];
  if (plantClasses.some(plantClass => animalClass.includes(plantClass))) {
    return false;
  }

  // Check family - exclude plant families
  const family = animal.taxonomy?.family?.toLowerCase() || '';
  const plantFamilies = ['asteraceae', 'poaceae', 'rosaceae', 'fabaceae', 'lamiaceae', 'apiaceae'];
  if (plantFamilies.some(plantFamily => family.includes(plantFamily))) {
    return false;
  }

  // If kingdom is Animalia or empty (might be animal), allow it
  if (kingdom === 'animalia' || kingdom === '' || kingdom.includes('animal')) {
    // But still check if it has animal-like characteristics
    const animalClasses = ['mammalia', 'aves', 'reptilia', 'amphibia', 'actinopterygii', 'chondrichthyes', 'insecta', 'arachnida'];
    if (animalClass && animalClasses.some(ac => animalClass.includes(ac))) {
      return true;
    }
    // If no class specified but kingdom is animalia, allow it
    if (kingdom === 'animalia' && animalClass === '') {
      return true;
    }
  }

  // Default: if we can't determine, check if it has animal-like characteristics
  // Animals typically have classes like Mammalia, Aves, Reptilia, etc.
  const animalClasses = ['mammalia', 'aves', 'reptilia', 'amphibia', 'actinopterygii', 'chondrichthyes', 'insecta', 'arachnida', 'mollusca', 'annelida'];
  if (animalClasses.some(ac => animalClass.includes(ac))) {
    return true;
  }

  // If we can't determine, be conservative and exclude it
  return false;
}

/**
 * Convert iNaturalist taxon to Animal format
 */
function convertINatToAnimal(taxon: INatTaxon): Animal {
  return {
    name: taxon.preferred_common_name || taxon.name,
    taxonomy: {
      scientific_name: taxon.name,
      kingdom: 'Animalia',
      phylum: '',
      class: taxon.iconic_taxon_name || '',
      order: '',
      family: '',
      genus: '',
    },
    locations: [],
    characteristics: {},
  };
}

/**
 * Convert GBIF species to Animal format
 */
function convertGBIFToAnimal(species: GBIFSpecies): Animal {
  return {
    name: species.vernacularName || species.canonicalName || species.scientificName,
    taxonomy: {
      scientific_name: species.scientificName,
      kingdom: species.kingdom || '',
      phylum: species.phylum || '',
      class: species.class || '',
      order: species.order || '',
      family: species.family || '',
      genus: species.genus || '',
    },
    locations: [],
    characteristics: {},
  };
}

/**
 * Convert WoRMS taxon to Animal format
 */
function convertWoRMSToAnimal(taxon: WoRMSTaxon): Animal {
  return {
    name: taxon.scientificname || '',
    taxonomy: {
      scientific_name: taxon.scientificname || '',
      kingdom: taxon.kingdom || '',
      phylum: taxon.phylum || '',
      class: taxon.class || '',
      order: taxon.order || '',
      family: taxon.family || '',
      genus: taxon.genus || '',
    },
    locations: [],
    characteristics: {},
  };
}

/**
 * Search for multiple animals across ALL APIs
 */
export async function searchAnimals(query: string, limit: number = 100): Promise<Animal[]> {
  if (!query.trim()) {
    return [];
  }

  const queryLower = query.toLowerCase();
  const seenNames = new Set<string>();
  const allResults: Animal[] = [];

  // Helper to add unique animals
  const addUniqueAnimal = (animal: Animal) => {
    const nameKey = animal.name?.toLowerCase() || '';
    const sciKey = animal.taxonomy?.scientific_name?.toLowerCase() || '';
    const key = nameKey || sciKey;
    
    if (key && !seenNames.has(key) && isAnimal(animal)) {
      seenNames.add(key);
      allResults.push(animal);
    }
  };

  try {
    // Search across multiple APIs in parallel
    const searchPromises: Promise<any>[] = [];

    // 1. API Ninjas / fetchAnimalByName (includes Dog API, Cat API fallbacks)
    searchPromises.push(
      fetchAnimalByName(query).then(results => {
        results.forEach(addUniqueAnimal);
      }).catch(err => console.debug('API Ninjas search failed:', err))
    );

    // 2. iNaturalist API
    searchPromises.push(
      searchINatSpecies(query, 1, 30).then(results => {
        results.forEach(taxon => {
          const animal = convertINatToAnimal(taxon);
          addUniqueAnimal(animal);
        });
      }).catch(err => console.debug('iNaturalist search failed:', err))
    );

    // 3. GBIF API
    searchPromises.push(
      searchGBIFByCommonName(query).then(results => {
        results.forEach(species => {
          const animal = convertGBIFToAnimal(species);
          addUniqueAnimal(animal);
        });
      }).catch(err => console.debug('GBIF search failed:', err))
    );

    // 4. WoRMS (for marine species)
    searchPromises.push(
      searchByVernacular(query).then(results => {
        results.forEach(taxon => {
          const animal = convertWoRMSToAnimal(taxon);
          // Only add if it's an animal (not plant/algae)
          if (animal.taxonomy?.kingdom?.toLowerCase() === 'animalia') {
            addUniqueAnimal(animal);
          }
        });
      }).catch(err => console.debug('WoRMS search failed:', err))
    );

    // 5. Zoo Animal API - Disabled due to CORS/404 errors
    // searchPromises.push(
    //   searchZooAnimals(query).then(results => {
    //     results.forEach(zooAnimal => {
    //       const animal: Animal = {
    //         id: zooAnimal.id.toString(),
    //         name: zooAnimal.name,
    //         taxonomy: {
    //           scientific_name: zooAnimal.latin_name,
    //         },
    //         locations: [],
    //         characteristics: {
    //           habitat: zooAnimal.habitat,
    //           diet: zooAnimal.diet,
    //         },
    //       };
    //       addUniqueAnimal(animal);
    //     });
    //   }).catch(err => console.debug('Zoo Animal API search failed:', err))
    // );

    // Wait for all searches to complete
    await Promise.allSettled(searchPromises);

    // Prioritize results that actually match the query in their name
    const prioritized = allResults.sort((a, b) => {
      const aName = (a.name || '').toLowerCase();
      const bName = (b.name || '').toLowerCase();
      const aSciName = (a.taxonomy?.scientific_name || '').toLowerCase();
      const bSciName = (b.taxonomy?.scientific_name || '').toLowerCase();
      
      // Exact match in name gets highest priority
      const aExact = aName === queryLower || aSciName === queryLower;
      const bExact = bName === queryLower || bSciName === queryLower;
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      
      // Starts with query gets second priority
      const aStarts = aName.startsWith(queryLower) || aSciName.startsWith(queryLower);
      const bStarts = bName.startsWith(queryLower) || bSciName.startsWith(queryLower);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      
      // Contains query gets third priority
      const aContains = aName.includes(queryLower) || aSciName.includes(queryLower);
      const bContains = bName.includes(queryLower) || bSciName.includes(queryLower);
      if (aContains && !bContains) return -1;
      if (!aContains && bContains) return 1;
      
      return 0;
    });
    
    return prioritized.slice(0, limit);
  } catch (error) {
    console.error('Error searching animals:', error);
    throw error;
  }
}

/**
 * Get a random animal using a curated list (Zoo API is deprecated)
 * Filters out plants to ensure only animals are returned
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

    // Try up to 10 times to get a valid animal (not a plant)
    for (let attempt = 0; attempt < 10; attempt++) {
      const randomName = curatedAnimals[Math.floor(Math.random() * curatedAnimals.length)];
      const animals = await fetchAnimalByName(randomName);
      
      // Filter out plants
      const validAnimals = animals.filter(isAnimal);
      
      if (validAnimals.length > 0) {
        return validAnimals[0];
      }
    }

    // If all attempts failed, return null
    return null;
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

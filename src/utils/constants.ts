import { ConservationStatus } from '../types/animal';

/**
 * API base URLs
 */
export const API_URLS = {
  // Original APIs (some require keys)
  API_NINJAS: 'https://api.api-ninjas.com/v1',
  WIKIPEDIA: 'https://en.wikipedia.org/api/rest_v1',
  UNSPLASH: 'https://api.unsplash.com',
  GBIF: 'https://api.gbif.org/v1',
  IUCN: 'https://apiv3.iucnredlist.org/api/v3',
  XENO_CANTO: 'https://xeno-canto.org/api/3/recordings',
  MOVEBANK: 'https://www.movebank.org/movebank/service/direct-read',
  EBIRD: 'https://api.ebird.org/v2',
  WORMS: 'https://www.marinespecies.org/rest',

  // NEW: Free APIs that don't require authentication
  INATURALIST: 'https://api.inaturalist.org/v1',
  RANDOM_DOG: 'https://random.dog',
  CATAAS: 'https://cataas.com',
  RANDOM_FOX: 'https://randomfox.ca',
  RANDOM_DUCK: 'https://random-d.uk/api',
  CAT_FACTS: 'https://catfact.ninja',
  DOG_FACTS: 'https://dog-api.kinduff.com/api/facts',
  DOG_API: 'https://dog.ceo/api',
  FISHBASE: 'https://fishbase.ropensci.org',
  SEALIFEBASE: 'https://fishbase.ropensci.org/sealifebase',

  // NEWEST: Additional free APIs
  THE_DOG_API: 'https://api.thedogapi.com/v1',
  THE_CAT_API: 'https://api.thecatapi.com/v1',
  ZOO_ANIMAL: 'https://zoo-animal-api.herokuapp.com',
  SHIBE: 'https://shibe.online/api',
  AXOLOTL: 'https://theaxolotlapi.netlify.app/.netlify/functions/axolotl',
  FISHWATCH: 'https://www.fishwatch.gov/api',
  MEOWFACTS: 'https://meowfacts.herokuapp.com',

  // Placeholder image APIs
  PLACEBEAR: 'https://placebear.com',
  PLACEDOG: 'https://place.dog',
  PLACEKITTEN: 'https://placekitten.com',
} as const;

/**
 * API keys from environment variables
 */
export const API_KEYS = {
  API_NINJAS: import.meta.env.VITE_API_NINJAS_KEY || '',
  UNSPLASH: import.meta.env.VITE_UNSPLASH_ACCESS_KEY || '',
  IUCN: import.meta.env.VITE_IUCN_API_KEY || '',
  EBIRD: import.meta.env.VITE_EBIRD_API_KEY || '',
  THE_DOG_API: import.meta.env.VITE_THE_DOG_API_KEY || '',
  THE_CAT_API: import.meta.env.VITE_THE_CAT_API_KEY || '',
  XENO_CANTO: import.meta.env.VITE_XENO_CANTO_API_KEY || 'badb982f9b570af4dfcf90cdf0f81430526dff20',
} as const;

/**
 * Cache duration in milliseconds
 */
export const CACHE_DURATION = {
  ANIMAL_OF_DAY: 24 * 60 * 60 * 1000, // 24 hours
  ANIMAL_DATA: 60 * 60 * 1000, // 1 hour
  SEARCH_RESULTS: 30 * 60 * 1000, // 30 minutes
  IMAGES: 60 * 60 * 1000, // 1 hour
  SOUNDS: 60 * 60 * 1000, // 1 hour - xeno-canto recordings
  MIGRATION: 60 * 60 * 1000, // 1 hour - Movebank data
  BIRD_SIGHTINGS: 30 * 60 * 1000, // 30 minutes - eBird observations
  MARINE_DATA: 60 * 60 * 1000, // 1 hour - WoRMS data
} as const;

/**
 * Cache keys for localStorage
 */
export const CACHE_KEYS = {
  ANIMAL_OF_DAY: 'animal_atlas_animal_of_day',
  RECENT_SEARCHES: 'animal_atlas_recent_searches',
  ANIMAL_DATA: 'animal_atlas_animal_data_',
  THEME: 'animal_atlas_theme',
} as const;

/**
 * Conservation status colors and labels
 */
export const CONSERVATION_STATUS: Record<
  ConservationStatus,
  { label: string; color: string; bgColor: string; description: string }
> = {
  EX: {
    label: 'Extinct',
    color: 'text-gray-900',
    bgColor: 'bg-gray-300',
    description: 'No living individuals remain',
  },
  EW: {
    label: 'Extinct in Wild',
    color: 'text-gray-900',
    bgColor: 'bg-gray-400',
    description: 'Only survives in captivity',
  },
  CR: {
    label: 'Critically Endangered',
    color: 'text-white',
    bgColor: 'bg-red-700',
    description: 'Extremely high risk of extinction',
  },
  EN: {
    label: 'Endangered',
    color: 'text-white',
    bgColor: 'bg-red-600',
    description: 'Very high risk of extinction',
  },
  VU: {
    label: 'Vulnerable',
    color: 'text-white',
    bgColor: 'bg-orange-500',
    description: 'High risk of extinction',
  },
  NT: {
    label: 'Near Threatened',
    color: 'text-white',
    bgColor: 'bg-yellow-600',
    description: 'Close to qualifying as threatened',
  },
  LC: {
    label: 'Least Concern',
    color: 'text-white',
    bgColor: 'bg-green-600',
    description: 'Low risk of extinction',
  },
  DD: {
    label: 'Data Deficient',
    color: 'text-gray-900',
    bgColor: 'bg-gray-300',
    description: 'Insufficient data to assess',
  },
  NE: {
    label: 'Not Evaluated',
    color: 'text-gray-900',
    bgColor: 'bg-gray-200',
    description: 'Not yet assessed',
  },
} as const;

/**
 * Popular animal categories with examples
 */
export const ANIMAL_CATEGORIES = [
  {
    id: 'mammal',
    label: 'Mammals',
    emoji: '🦁',
    examples: ['Lion', 'Elephant', 'Dolphin', 'Bear', 'Tiger', 'Wolf'],
    description: 'Warm-blooded vertebrates with hair or fur',
  },
  {
    id: 'bird',
    label: 'Birds',
    emoji: '🦅',
    examples: ['Eagle', 'Penguin', 'Parrot', 'Owl', 'Hummingbird', 'Peacock'],
    description: 'Warm-blooded vertebrates with feathers and wings',
  },
  {
    id: 'reptile',
    label: 'Reptiles',
    emoji: '🐊',
    examples: ['Crocodile', 'Snake', 'Turtle', 'Lizard', 'Chameleon', 'Iguana'],
    description: 'Cold-blooded vertebrates with scales',
  },
  {
    id: 'amphibian',
    label: 'Amphibians',
    emoji: '🐸',
    examples: ['Frog', 'Toad', 'Salamander', 'Newt', 'Caecilian'],
    description: 'Cold-blooded vertebrates that live in water and on land',
  },
  {
    id: 'fish',
    label: 'Fish',
    emoji: '🐠',
    examples: ['Shark', 'Salmon', 'Clownfish', 'Tuna', 'Goldfish', 'Angelfish'],
    description: 'Cold-blooded vertebrates that live in water',
  },
] as const;

/**
 * Habitat types
 */
export const HABITAT_TYPES = [
  { id: 'land', label: 'Land', emoji: '🌲', keywords: ['forest', 'grassland', 'desert', 'mountain', 'jungle', 'savanna'] },
  { id: 'ocean', label: 'Ocean', emoji: '🌊', keywords: ['ocean', 'sea', 'marine', 'reef', 'coastal'] },
  { id: 'freshwater', label: 'Freshwater', emoji: '💧', keywords: ['river', 'lake', 'stream', 'pond', 'wetland', 'swamp'] },
  { id: 'air', label: 'Air', emoji: '☁️', keywords: ['flying', 'aerial', 'airborne'] },
] as const;

/**
 * Featured animals for homepage
 */
export const FEATURED_ANIMALS = [
  'Lion',
  'Elephant',
  'Dolphin',
  'Eagle',
  'Tiger',
  'Penguin',
  'Polar Bear',
  'Panda',
  'Giraffe',
  'Gorilla',
  'Blue Whale',
  'Cheetah',
] as const;

/**
 * Default fallback image URL
 */
// Don't use a specific animal image as fallback - it will show for all animals
export const FALLBACK_IMAGE = '';

/**
 * Rate limiting configuration
 */
export const RATE_LIMIT = {
  MAX_REQUESTS_PER_MINUTE: 50,
  RETRY_DELAY: 1000, // 1 second
  MAX_RETRIES: 3,
} as const;

/**
 * Pagination configuration
 */
export const PAGINATION = {
  ITEMS_PER_PAGE: 12,
  MAX_PAGES: 10,
} as const;

/**
 * Map configuration
 */
export const MAP_CONFIG = {
  DEFAULT_CENTER: [20, 0] as [number, number],
  DEFAULT_ZOOM: 2,
  MAX_ZOOM: 18,
  MIN_ZOOM: 2,
} as const;

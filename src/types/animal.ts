/**
 * Core Animal type representing data from API Ninjas
 */
export interface Animal {
  name: string;
  taxonomy: {
    kingdom: string;
    phylum: string;
    class: string;
    order: string;
    family: string;
    genus: string;
    scientific_name: string;
  };
  locations: string[];
  characteristics: {
    prey?: string;
    name_of_young?: string;
    group_behavior?: string;
    estimated_population_size?: string;
    biggest_threat?: string;
    most_distinctive_feature?: string;
    gestation_period?: string;
    habitat?: string;
    diet?: string;
    average_litter_size?: string;
    lifestyle?: string;
    common_name?: string;
    number_of_species?: string;
    location?: string;
    slogan?: string;
    group?: string;
    color?: string;
    skin_type?: string;
    top_speed?: string;
    lifespan?: string;
    weight?: string;
    height?: string;
    length?: string;
    age_of_sexual_maturity?: string;
    age_of_weaning?: string;
  };
}

/**
 * Wikipedia article data
 */
export interface WikipediaData {
  title: string;
  extract: string;
  thumbnail?: {
    source: string;
    width: number;
    height: number;
  };
  pageId: number;
  url: string;
}

/**
 * Unsplash image data
 */
export interface UnsplashImage {
  id: string;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
  alt_description: string | null;
  user: {
    name: string;
    username: string;
  };
  links: {
    html: string;
  };
}

/**
 * GBIF occurrence data
 */
export interface GBIFOccurrence {
  key: number;
  scientificName: string;
  decimalLatitude?: number;
  decimalLongitude?: number;
  country?: string;
  stateProvince?: string;
  locality?: string;
  eventDate?: string;
  basisOfRecord?: string;
}

/**
 * GBIF species data
 */
export interface GBIFSpecies {
  key: number;
  scientificName: string;
  canonicalName: string;
  vernacularName?: string;
  kingdom?: string;
  phylum?: string;
  class?: string;
  order?: string;
  family?: string;
  genus?: string;
  species?: string;
  rank?: string;
}

/**
 * IUCN Red List data
 */
export interface IUCNData {
  taxonid: number;
  scientific_name: string;
  category: 'EX' | 'EW' | 'CR' | 'EN' | 'VU' | 'NT' | 'LC' | 'DD' | 'NE';
  population_trend?: 'Decreasing' | 'Increasing' | 'Stable' | 'Unknown';
  main_common_name?: string;
}

/**
 * Conservation status categories
 */
export type ConservationStatus =
  | 'EX'  // Extinct
  | 'EW'  // Extinct in the Wild
  | 'CR'  // Critically Endangered
  | 'EN'  // Endangered
  | 'VU'  // Vulnerable
  | 'NT'  // Near Threatened
  | 'LC'  // Least Concern
  | 'DD'  // Data Deficient
  | 'NE'; // Not Evaluated

/**
 * Filter options for animal explorer
 */
export interface AnimalFilters {
  category?: AnimalCategory;
  habitat?: HabitatType;
  endangeredOnly?: boolean;
  searchQuery?: string;
}

/**
 * Animal categories
 */
export type AnimalCategory =
  | 'mammal'
  | 'bird'
  | 'reptile'
  | 'amphibian'
  | 'fish'
  | 'all';

/**
 * Habitat types
 */
export type HabitatType =
  | 'land'
  | 'ocean'
  | 'freshwater'
  | 'air'
  | 'all';

/**
 * Combined animal data for display
 */
export interface EnrichedAnimal extends Animal {
  id: string;
  wikipedia?: WikipediaData;
  images: UnsplashImage[];
  conservationStatus?: IUCNData;
  gbifData?: GBIFSpecies;
  occurrences?: GBIFOccurrence[];
  // New API data
  sounds?: XenoCantoRecording[];
  migration?: MovebankLocation[];
  migrationStudy?: MovebankStudy;
  birdSightings?: EBirdObservation[];
  marineData?: WoRMSTaxon;
  marineDistribution?: WoRMSDistribution[];
  marineVernacular?: Array<{ vernacular: string; language: string }>;
  // NEW: Additional API data
  inatObservations?: any[];
  inatData?: any;
  fishData?: any;
  fishEcology?: any;
}

/**
 * API response wrapper
 */
export interface APIResponse<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

/**
 * Cache entry
 */
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresIn: number;
}

/**
 * Loading states
 */
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

/**
 * xeno-canto recording data (animal sounds)
 */
export interface XenoCantoRecording {
  id: string;
  gen: string; // Genus
  sp: string; // Species
  en: string; // English name
  rec: string; // Recordist
  cnt: string; // Country
  loc: string; // Location
  lat: string; // Latitude
  lng: string; // Longitude
  type: string; // Sound type (call, song, etc.)
  file: string; // MP3 file URL
  'file-name': string;
  sono: {
    small: string; // Sonogram small image
    med: string; // Sonogram medium image
    large: string; // Sonogram large image
    full: string; // Sonogram full image
  };
  length: string; // Duration
  time: string; // Time of day
  date: string; // Recording date
  q: string; // Quality rating (A-E)
}

/**
 * Movebank study data (animal migration)
 */
export interface MovebankStudy {
  id: number;
  name: string;
  i18n_name?: string;
  main_location_lat?: number;
  main_location_long?: number;
  number_of_individuals?: number;
  number_of_tags?: number;
  principal_investigator_name?: string;
  study_type?: string;
  suspend_license_terms?: boolean;
  i_can_see_data?: boolean;
  there_are_data_which_i_cannot_see?: boolean;
  i_have_download_access?: boolean;
  i_am_owner?: boolean;
  study_permission?: string;
  timestamp_first_deployed_location?: string;
  timestamp_last_deployed_location?: string;
  number_of_deployments?: number;
  taxon_ids?: string;
  sensor_type_ids?: string;
}

/**
 * Movebank location data (tracking points)
 */
export interface MovebankLocation {
  timestamp: string;
  location_lat: number;
  location_long: number;
  individual_local_identifier?: string;
  tag_local_identifier?: string;
  study_id?: number;
  sensor_type_id?: number;
  individual_taxon_canonical_name?: string;
}

/**
 * eBird observation data
 */
export interface EBirdObservation {
  speciesCode: string;
  comName: string; // Common name
  sciName: string; // Scientific name
  locId: string; // Location ID
  locName: string; // Location name
  obsDt: string; // Observation date
  howMany: number; // Count
  lat: number;
  lng: number;
  obsValid: boolean;
  obsReviewed: boolean;
  locationPrivate: boolean;
  subId: string; // Submission ID
}

/**
 * eBird region info
 */
export interface EBirdRegion {
  code: string;
  name: string;
  result: EBirdObservation[];
}

/**
 * WoRMS (World Register of Marine Species) taxon data
 */
export interface WoRMSTaxon {
  AphiaID: number;
  url: string;
  scientificname: string;
  authority: string;
  status: string;
  unacceptreason: string | null;
  taxonRankID: number;
  rank: string;
  valid_AphiaID: number;
  valid_name: string;
  valid_authority: string;
  parentNameUsageID: number;
  kingdom: string;
  phylum: string;
  class: string;
  order: string;
  family: string;
  genus: string;
  citation: string;
  lsid: string;
  isMarine: number;
  isBrackish: number;
  isFreshwater: number;
  isTerrestrial: number;
  isExtinct: number | null;
  match_type: string;
  modified: string;
}

/**
 * WoRMS distribution data
 */
export interface WoRMSDistribution {
  locationID: string;
  locality: string;
  gazetteerSource: string;
  establishmentMeans: string | null;
  occurrenceStatus: string;
  recordType: string;
  typeStatus: string | null;
  qualityStatus: string;
}

/**
 * Extended enriched animal with new API data
 */
export interface ExtendedEnrichedAnimal extends EnrichedAnimal {
  sounds?: XenoCantoRecording[];
  migration?: MovebankLocation[];
  migrationStudy?: MovebankStudy;
  birdSightings?: EBirdObservation[];
  marineData?: WoRMSTaxon;
  marineDistribution?: WoRMSDistribution[];
}

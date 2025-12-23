import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { EnrichedAnimal, AnimalFilters, LoadingState } from '../types/animal';
import { getDailyAnimal, setDailyAnimal } from '../utils/cache';
import { getRandomAnimal } from '../api/animals';
import { fetchWikipediaSummary } from '../api/wikipedia';
import { fetchUnsplashImages } from '../api/images';
import { fetchIUCNStatus } from '../api/iucn';
import { searchGBIFSpecies, fetchGBIFOccurrences } from '../api/gbif';
import { fetchAnimalSounds } from '../api/xenocanto';
import { searchMovebankStudies, getMovebankLocations } from '../api/movebank';
import { getRecentObservations, searchSpecies } from '../api/ebird';
import { searchMarineSpecies, getMarineDistribution, getVernacularNames } from '../api/worms';
import { getINatObservations, getINatSpeciesByName } from '../api/inaturalist';
// FishBase API disabled due to SSL certificate issues
// import { searchFishSpecies, getFishEcology, isFishSpecies } from '../api/fishbase';

interface AnimalContextType {
  // State
  animalOfTheDay: EnrichedAnimal | null;
  currentAnimal: EnrichedAnimal | null;
  searchResults: EnrichedAnimal[];
  filters: AnimalFilters;
  loading: LoadingState;
  error: string | null;
  darkMode: boolean;

  // Actions
  setCurrentAnimal: (animal: EnrichedAnimal | null) => void;
  setSearchResults: (results: EnrichedAnimal[]) => void;
  setFilters: (filters: AnimalFilters) => void;
  setLoading: (loading: LoadingState) => void;
  setError: (error: string | null) => void;
  toggleDarkMode: () => void;
  refreshAnimalOfTheDay: () => Promise<void>;
  enrichAnimal: (animalName: string, scientificName: string) => Promise<EnrichedAnimal | null>;
}

const AnimalContext = createContext<AnimalContextType | undefined>(undefined);

export function AnimalProvider({ children }: { children: ReactNode }) {
  const [animalOfTheDay, setAnimalOfTheDayState] = useState<EnrichedAnimal | null>(null);
  const [currentAnimal, setCurrentAnimal] = useState<EnrichedAnimal | null>(null);
  const [searchResults, setSearchResults] = useState<EnrichedAnimal[]>([]);
  const [filters, setFilters] = useState<AnimalFilters>({});
  const [loading, setLoading] = useState<LoadingState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('animal_atlas_theme');
    return saved ? saved === 'dark' : false;
  });

  // Initialize animal of the day
  useEffect(() => {
    loadAnimalOfTheDay();
  }, []);

  // Apply dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('animal_atlas_theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  const loadAnimalOfTheDay = async () => {
    try {
      // Check if we already have today's animal
      const cachedAnimalName = getDailyAnimal();

      if (cachedAnimalName) {
        // Try to enrich the cached animal
        const enriched = await enrichAnimal(cachedAnimalName, '');
        if (enriched) {
          setAnimalOfTheDayState(enriched);
          return;
        }
      }

      // Get a new random animal
      const randomAnimal = await getRandomAnimal();

      if (randomAnimal) {
        const enriched = await enrichAnimal(
          randomAnimal.name,
          randomAnimal.taxonomy.scientific_name
        );

        if (enriched) {
          setAnimalOfTheDayState(enriched);
          setDailyAnimal(randomAnimal.name);
        }
      }
    } catch (error) {
      console.error('Error loading animal of the day:', error);
    }
  };

  const refreshAnimalOfTheDay = async () => {
    setLoading('loading');
    try {
      const randomAnimal = await getRandomAnimal();

      if (randomAnimal) {
        const enriched = await enrichAnimal(
          randomAnimal.name,
          randomAnimal.taxonomy.scientific_name
        );

        if (enriched) {
          setAnimalOfTheDayState(enriched);
          setDailyAnimal(randomAnimal.name);
          setLoading('success');
        } else {
          setLoading('error');
          setError('Failed to load animal');
        }
      }
    } catch (error) {
      console.error('Error refreshing animal of the day:', error);
      setLoading('error');
      setError('Failed to refresh animal');
    }
  };

  /**
   * Enrich animal data with additional information from multiple APIs
   */
  const enrichAnimal = async (
    animalName: string,
    scientificName: string
  ): Promise<EnrichedAnimal | null> => {
    try {
      // Helper to detect if animal is likely a bird (for sound API)
      const isLikelyBird = (name: string) => {
        const birdKeywords = ['bird', 'eagle', 'hawk', 'owl', 'crow', 'raven', 'parrot', 'finch', 'sparrow', 'robin', 'pigeon', 'dove', 'duck', 'goose', 'swan', 'heron', 'crane', 'pelican', 'gull', 'tern', 'penguin', 'ostrich', 'emu', 'kiwi', 'woodpecker', 'hummingbird', 'kingfisher', 'toucan', 'flamingo', 'stork', 'ibis', 'warbler', 'thrush', 'wren', 'jay', 'magpie', 'cardinal'];
        const lowerName = name.toLowerCase();
        return birdKeywords.some(keyword => lowerName.includes(keyword));
      };

      // Fetch data from ALL APIs in parallel (excluding broken FishBase)
      const [wikipedia, images, conservationStatus, gbifData, sounds, marineData, inatData, fishData] = await Promise.allSettled([
        fetchWikipediaSummary(animalName),
        fetchUnsplashImages(animalName, 3), // Reduced from 6 to 3 for faster loading
        fetchIUCNStatus(scientificName),
        searchGBIFSpecies(scientificName),
        isLikelyBird(animalName) ? fetchAnimalSounds(animalName, 5) : Promise.resolve([]), // Only fetch sounds for birds
        searchMarineSpecies(scientificName),
        getINatSpeciesByName(animalName), // iNaturalist data
        Promise.resolve(null), // FishBase disabled due to SSL certificate issues
      ]);

      // Fetch occurrences if GBIF data is available
      let occurrences: any[] = [];
      if (gbifData.status === 'fulfilled' && gbifData.value) {
        try {
          occurrences = await fetchGBIFOccurrences(scientificName, 100); // Reduced from 300 to 100 for faster loading
        } catch (error) {
          console.error('Error fetching occurrences:', error);
        }
      }

      // Fetch additional data based on what we got
      let marineDistribution: any[] | undefined;
      let marineVernacular: any[] | undefined;
      let migrationData: any[] | undefined;
      let migrationStudy: any | undefined;
      let birdSightings: any[] | undefined;
      let inatObservations: any[] | undefined;
      let fishEcology: any | undefined;

      // If marine species found, get distribution & vernacular names
      if (marineData.status === 'fulfilled' && marineData.value) {
        try {
          const [dist, vern] = await Promise.all([
            getMarineDistribution(marineData.value.AphiaID),
            getVernacularNames(marineData.value.AphiaID),
          ]);
          marineDistribution = dist;
          marineVernacular = vern;
        } catch (error) {
          console.error('Error fetching marine details:', error);
        }
      }

      // Try to get migration data (only for birds and marine mammals that migrate)
      // Note: Excludes butterflies even though they migrate - Movebank doesn't track them
      const migratoryKeywords = ['bird', 'whale', 'dolphin', 'turtle', 'seal', 'salmon', 'eel', 'eagle', 'hawk', 'goose', 'duck', 'swan', 'crane', 'warbler', 'hummingbird'];
      const isMigratoryAnimal = migratoryKeywords.some(keyword => animalName.toLowerCase().includes(keyword));

      if (isMigratoryAnimal) {
        try {
          const studies = await searchMovebankStudies(scientificName || animalName);
          if (studies && studies.length > 0) {
            migrationStudy = studies[0];
            migrationData = await getMovebankLocations(studies[0].id, undefined, 100); // Reduced from 500 to 100 for faster loading
          }
        } catch (error) {
          console.error('Error fetching migration data:', error);
        }
      }

      // Try to get bird sightings (requires scientific name or species code)
      try {
        if (scientificName) {
          // First try to get species code
          const speciesResults = await searchSpecies(animalName);
          if (speciesResults && speciesResults.length > 0) {
            const speciesCode = speciesResults[0].speciesCode;
            birdSightings = await getRecentObservations(speciesCode, 'US', 14);
          }
        }
      } catch (error) {
        console.error('Error fetching bird sightings:', error);
      }

      // Try to get iNaturalist observations
      try {
        inatObservations = await getINatObservations(animalName, 10); // Reduced from 20 to 10 for faster loading
      } catch (error) {
        console.error('Error fetching iNaturalist observations:', error);
      }

      // Try to get FishBase ecology data for fish species
      try {
        if (fishData.status === 'fulfilled' && fishData.value && fishData.value.length > 0) {
          const fish = fishData.value[0];
          fishEcology = await getFishEcology(fish.SpecCode);
        }
      } catch (error) {
        console.error('Error fetching FishBase ecology:', error);
      }

      // Create enriched animal object with ALL data
      const enriched: EnrichedAnimal = {
        name: animalName,
        id: `${animalName}-${Date.now()}`,
        taxonomy: {
          kingdom: '',
          phylum: '',
          class: '',
          order: '',
          family: '',
          genus: '',
          scientific_name: scientificName,
        },
        locations: [],
        characteristics: {},
        // Original APIs
        wikipedia: wikipedia.status === 'fulfilled' ? wikipedia.value || undefined : undefined,
        images: images.status === 'fulfilled' ? images.value : [],
        conservationStatus:
          conservationStatus.status === 'fulfilled'
            ? conservationStatus.value || undefined
            : undefined,
        gbifData: gbifData.status === 'fulfilled' ? gbifData.value || undefined : undefined,
        occurrences: occurrences,
        // NEW APIs
        sounds: sounds.status === 'fulfilled' ? sounds.value : undefined,
        marineData: marineData.status === 'fulfilled' ? marineData.value || undefined : undefined,
        marineDistribution,
        marineVernacular,
        migration: migrationData,
        migrationStudy,
        birdSightings,
        // NEW: Additional API data
        inatObservations,
        inatData: inatData.status === 'fulfilled' ? inatData.value || undefined : undefined,
        fishData: fishData.status === 'fulfilled' && fishData.value ? fishData.value[0] : undefined,
        fishEcology,
      };

      return enriched;
    } catch (error) {
      console.error('Error enriching animal:', error);
      return null;
    }
  };

  const value: AnimalContextType = {
    animalOfTheDay,
    currentAnimal,
    searchResults,
    filters,
    loading,
    error,
    darkMode,
    setCurrentAnimal,
    setSearchResults,
    setFilters,
    setLoading,
    setError,
    toggleDarkMode,
    refreshAnimalOfTheDay,
    enrichAnimal,
  };

  return <AnimalContext.Provider value={value}>{children}</AnimalContext.Provider>;
}

export function useAnimal() {
  const context = useContext(AnimalContext);
  if (context === undefined) {
    throw new Error('useAnimal must be used within an AnimalProvider');
  }
  return context;
}

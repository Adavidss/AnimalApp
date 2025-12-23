import { CacheEntry } from '../types/animal';

// Maximum cache size in bytes (5MB to leave room for other data)
const MAX_CACHE_SIZE = 5 * 1024 * 1024;

/**
 * Get the total size of localStorage in bytes
 */
function getLocalStorageSize(): number {
  let total = 0;
  for (const key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      const value = localStorage.getItem(key);
      if (value) {
        total += key.length + value.length;
      }
    }
  }
  return total * 2; // UTF-16 uses 2 bytes per character
}

/**
 * Get all cache entries with timestamps
 */
function getAllCacheEntries(): Array<{ key: string; timestamp: number; size: number }> {
  const entries: Array<{ key: string; timestamp: number; size: number }> = [];

  // List of non-cache keys to preserve
  const preserveKeys = [
    'animal_atlas_theme',
    'animal_atlas_favorites',
    'animal_views',
    'achievement_data',
    'achievement_viewed_animals',
  ];

  for (const key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      // Skip preserved keys (favorites, settings, achievements)
      if (preserveKeys.includes(key)) {
        continue;
      }

      // Include all cache entries (they have timestamp and expiresIn)
      try {
        const value = localStorage.getItem(key);
        if (value) {
          const entry = JSON.parse(value);
          // If it has timestamp and expiresIn, it's a cache entry
          if (entry && typeof entry.timestamp === 'number' && typeof entry.expiresIn === 'number') {
            entries.push({
              key,
              timestamp: entry.timestamp || 0,
              size: (key.length + value.length) * 2
            });
          }
        }
      } catch {
        // Skip non-JSON entries or invalid entries
      }
    }
  }

  return entries;
}

/**
 * Clear oldest cache entries until we free up enough space
 */
function clearOldestEntries(targetBytes: number): number {
  const entries = getAllCacheEntries();

  // Sort by timestamp (oldest first)
  entries.sort((a, b) => a.timestamp - b.timestamp);

  let freedBytes = 0;
  let cleared = 0;

  for (const entry of entries) {
    if (freedBytes >= targetBytes) break;

    try {
      localStorage.removeItem(entry.key);
      freedBytes += entry.size;
      cleared++;
    } catch {
      // Continue even if removal fails
    }
  }

  console.log(`Cleared ${cleared} cache entries, freed ${(freedBytes / 1024).toFixed(2)}KB`);
  return freedBytes;
}

/**
 * Set data in localStorage with expiration
 */
export function setCache<T>(key: string, data: T, expiresIn: number): void {
  try {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiresIn,
    };
    const value = JSON.stringify(entry);
    const itemSize = (key.length + value.length) * 2;

    // Check if we're approaching the limit
    const currentSize = getLocalStorageSize();
    if (currentSize + itemSize > MAX_CACHE_SIZE) {
      // Clear 2MB of old entries
      clearOldestEntries(2 * 1024 * 1024);
    }

    localStorage.setItem(key, value);
  } catch (error) {
    // Handle quota exceeded error
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.warn('Cache quota exceeded, clearing old entries...');

      // Aggressive cleanup: clear 3MB of oldest entries
      clearOldestEntries(3 * 1024 * 1024);

      // Retry once
      try {
        const entry: CacheEntry<T> = {
          data,
          timestamp: Date.now(),
          expiresIn,
        };
        localStorage.setItem(key, JSON.stringify(entry));
      } catch (retryError) {
        console.error('Cache full after cleanup, could not save:', key);
      }
    } else {
      console.error('Error setting cache:', error);
    }
  }
}

/**
 * Get data from localStorage if not expired
 */
export function getCache<T>(key: string): T | null {
  try {
    const item = localStorage.getItem(key);
    if (!item) return null;

    const entry: CacheEntry<T> = JSON.parse(item);
    const now = Date.now();

    // Check if cache has expired
    if (now - entry.timestamp > entry.expiresIn) {
      localStorage.removeItem(key);
      return null;
    }

    return entry.data;
  } catch (error) {
    console.error('Error getting cache:', error);
    return null;
  }
}

/**
 * Clear specific cache entry
 */
export function clearCache(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
}

/**
 * Clear all cache entries with a specific prefix
 */
export function clearCacheByPrefix(prefix: string): void {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith(prefix)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('Error clearing cache by prefix:', error);
  }
}

/**
 * Clear all app-related cache (preserves favorites, settings, achievements)
 */
export function clearAllCache(): void {
  try {
    const entries = getAllCacheEntries();
    let cleared = 0;

    entries.forEach((entry) => {
      localStorage.removeItem(entry.key);
      cleared++;
    });

    console.log(`Cleared ${cleared} cache entries`);
  } catch (error) {
    console.error('Error clearing all cache:', error);
  }
}

/**
 * Clear all image caches
 */
export function clearImageCache(): void {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith('images_')) {
        localStorage.removeItem(key);
      }
    });
    console.log('Image cache cleared');
  } catch (error) {
    console.error('Error clearing image cache:', error);
  }
}

/**
 * Add to recent searches (max 10)
 */
export function addToRecentSearches(searchTerm: string): void {
  try {
    const key = 'animal_atlas_recent_searches';
    const existing = localStorage.getItem(key);
    let searches: string[] = existing ? JSON.parse(existing) : [];

    // Remove if already exists
    searches = searches.filter((s) => s.toLowerCase() !== searchTerm.toLowerCase());

    // Add to beginning
    searches.unshift(searchTerm);

    // Keep only last 10
    searches = searches.slice(0, 10);

    localStorage.setItem(key, JSON.stringify(searches));
  } catch (error) {
    console.error('Error adding to recent searches:', error);
  }
}

/**
 * Get recent searches
 */
export function getRecentSearches(): string[] {
  try {
    const key = 'animal_atlas_recent_searches';
    const existing = localStorage.getItem(key);
    return existing ? JSON.parse(existing) : [];
  } catch (error) {
    console.error('Error getting recent searches:', error);
    return [];
  }
}

/**
 * Clear recent searches
 */
export function clearRecentSearches(): void {
  try {
    localStorage.removeItem('animal_atlas_recent_searches');
  } catch (error) {
    console.error('Error clearing recent searches:', error);
  }
}

/**
 * Get or set daily animal
 */
export function getDailyAnimal(): string | null {
  const key = 'animal_atlas_animal_of_day';
  const cached = getCache<{ animal: string; date: string }>(key);

  const today = new Date().toDateString();

  if (cached && cached.date === today) {
    return cached.animal;
  }

  return null;
}

export function setDailyAnimal(animal: string): void {
  const key = 'animal_atlas_animal_of_day';
  const today = new Date().toDateString();
  const expiresIn = 24 * 60 * 60 * 1000; // 24 hours

  setCache(key, { animal, date: today }, expiresIn);
}

/**
 * Get cache statistics for debugging
 */
export function getCacheStats(): {
  totalSize: number;
  totalSizeMB: number;
  entryCount: number;
  maxSize: number;
  maxSizeMB: number;
  percentUsed: number;
  oldestEntry?: { key: string; age: string };
  largestEntry?: { key: string; sizeMB: number };
} {
  const entries = getAllCacheEntries();
  const totalSize = getLocalStorageSize();

  let oldest = entries[0];
  let largest = entries[0];

  for (const entry of entries) {
    if (!oldest || entry.timestamp < oldest.timestamp) {
      oldest = entry;
    }
    if (!largest || entry.size > largest.size) {
      largest = entry;
    }
  }

  const now = Date.now();
  const ageMs = oldest ? now - oldest.timestamp : 0;
  const ageHours = Math.floor(ageMs / (1000 * 60 * 60));
  const ageDays = Math.floor(ageHours / 24);

  return {
    totalSize,
    totalSizeMB: totalSize / (1024 * 1024),
    entryCount: entries.length,
    maxSize: MAX_CACHE_SIZE,
    maxSizeMB: MAX_CACHE_SIZE / (1024 * 1024),
    percentUsed: (totalSize / MAX_CACHE_SIZE) * 100,
    oldestEntry: oldest ? {
      key: oldest.key,
      age: ageDays > 0 ? `${ageDays}d ${ageHours % 24}h` : `${ageHours}h`
    } : undefined,
    largestEntry: largest ? {
      key: largest.key,
      sizeMB: largest.size / (1024 * 1024)
    } : undefined
  };
}

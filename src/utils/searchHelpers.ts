// Search history and autocomplete helpers

const RECENT_SEARCHES_KEY = 'animal_atlas_recent_searches';
const MAX_RECENT_SEARCHES = 10;
const POPULAR_ANIMALS_KEY = 'animal_atlas_popular_animals';

// Popular animals list (most commonly searched)
export const POPULAR_ANIMALS = [
  'Lion', 'Tiger', 'Elephant', 'Giraffe', 'Zebra',
  'Panda', 'Koala', 'Kangaroo', 'Penguin', 'Dolphin',
  'Whale', 'Shark', 'Eagle', 'Owl', 'Parrot',
  'Snake', 'Crocodile', 'Turtle', 'Cheetah', 'Leopard',
  'Wolf', 'Fox', 'Bear', 'Monkey', 'Gorilla',
  'Chimpanzee', 'Hippopotamus', 'Rhinoceros', 'Seal', 'Otter'
];

/**
 * Get recent searches from localStorage
 */
export function getRecentSearches(): string[] {
  try {
    const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

/**
 * Add a search term to recent searches
 */
export function addRecentSearch(term: string): void {
  if (!term || term.trim().length === 0) return;

  const recent = getRecentSearches();

  // Remove if already exists (to move to front)
  const filtered = recent.filter(s => s.toLowerCase() !== term.toLowerCase());

  // Add to front
  const updated = [term, ...filtered].slice(0, MAX_RECENT_SEARCHES);

  try {
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  } catch {
    // localStorage might be full or disabled
  }
}

/**
 * Clear all recent searches
 */
export function clearRecentSearches(): void {
  try {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  } catch {
    // Ignore errors
  }
}

/**
 * Track animal views for trending
 */
export function trackAnimalView(animalName: string): void {
  if (!animalName) return;

  try {
    const views: Record<string, number> = JSON.parse(
      localStorage.getItem(POPULAR_ANIMALS_KEY) || '{}'
    );

    views[animalName] = (views[animalName] || 0) + 1;

    localStorage.setItem(POPULAR_ANIMALS_KEY, JSON.stringify(views));
  } catch {
    // Ignore errors
  }
}

/**
 * Get most viewed animals
 */
export function getTrendingAnimals(limit: number = 10): string[] {
  try {
    const views: Record<string, number> = JSON.parse(
      localStorage.getItem(POPULAR_ANIMALS_KEY) || '{}'
    );

    return Object.entries(views)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([name]) => name);
  } catch {
    return [];
  }
}

/**
 * Calculate Levenshtein distance between two strings
 * Used for finding similar words (typo detection)
 */
function levenshteinDistance(str1: string, str2: string): number {
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();

  const matrix: number[][] = [];

  for (let i = 0; i <= s2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= s1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= s2.length; i++) {
    for (let j = 1; j <= s1.length; j++) {
      if (s2.charAt(i - 1) === s1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[s2.length][s1.length];
}

/**
 * Find "Did you mean?" suggestion for a search term
 * Returns the closest matching animal name from popular animals
 */
export function getDidYouMeanSuggestion(term: string): string | null {
  if (!term || term.length < 3) return null;

  let bestMatch: string | null = null;
  let bestDistance = Infinity;

  // Check against popular animals
  for (const animal of POPULAR_ANIMALS) {
    const distance = levenshteinDistance(term, animal);

    // If distance is small enough (1-2 characters different)
    if (distance > 0 && distance <= 2 && distance < bestDistance) {
      bestMatch = animal;
      bestDistance = distance;
    }
  }

  // Also check recent searches
  const recent = getRecentSearches();
  for (const animal of recent) {
    const distance = levenshteinDistance(term, animal);

    if (distance > 0 && distance <= 2 && distance < bestDistance) {
      bestMatch = animal;
      bestDistance = distance;
    }
  }

  return bestMatch;
}

/**
 * Get autocomplete suggestions for a search term
 * Returns matching animals from popular list and recent searches
 */
export function getAutocompleteSuggestions(term: string, limit: number = 5): string[] {
  if (!term || term.length === 0) return [];

  const query = term.toLowerCase();
  const suggestions = new Set<string>();

  // Add recent searches that match
  const recent = getRecentSearches();
  for (const search of recent) {
    if (search.toLowerCase().includes(query)) {
      suggestions.add(search);
      if (suggestions.size >= limit) break;
    }
  }

  // Add popular animals that match
  for (const animal of POPULAR_ANIMALS) {
    if (animal.toLowerCase().includes(query)) {
      suggestions.add(animal);
      if (suggestions.size >= limit) break;
    }
  }

  // Add trending animals that match
  const trending = getTrendingAnimals();
  for (const animal of trending) {
    if (animal.toLowerCase().includes(query)) {
      suggestions.add(animal);
      if (suggestions.size >= limit) break;
    }
  }

  return Array.from(suggestions).slice(0, limit);
}

/**
 * Check if browser supports Web Speech API
 */
export function isVoiceSearchSupported(): boolean {
  return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
}

/**
 * Create a speech recognition instance
 */
export function createSpeechRecognition(): any {
  if (!isVoiceSearchSupported()) return null;

  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const recognition = new SpeechRecognition();

  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'en-US';
  recognition.maxAlternatives = 1;

  return recognition;
}

/**
 * Highlight search term in text
 */
export function highlightSearchTerm(text: string, searchTerm: string): string {
  if (!searchTerm) return text;

  const regex = new RegExp(`(${searchTerm})`, 'gi');
  return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800">$1</mark>');
}

/**
 * Clean and normalize search query
 */
export function normalizeSearchQuery(query: string): string {
  return query.trim().replace(/\s+/g, ' ').toLowerCase();
}

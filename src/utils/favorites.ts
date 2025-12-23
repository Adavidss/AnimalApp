import { EnrichedAnimal } from '../types/animal';

/**
 * Favorites management with localStorage
 */

const FAVORITES_KEY = 'animal_atlas_favorites';

export interface FavoriteAnimal {
  id: string;
  name: string;
  scientificName?: string;
  imageUrl?: string;
  category: string;
  addedAt: number;
}

/**
 * Get all favorites
 */
export function getFavorites(): FavoriteAnimal[] {
  try {
    const stored = localStorage.getItem(FAVORITES_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (error) {
    console.error('Error loading favorites:', error);
    return [];
  }
}

/**
 * Add animal to favorites
 */
export function addToFavorites(animal: EnrichedAnimal): boolean {
  try {
    const favorites = getFavorites();

    // Check if already in favorites
    if (favorites.some((fav) => fav.name === animal.name)) {
      return false;
    }

    const favorite: FavoriteAnimal = {
      id: animal.id,
      name: animal.name,
      scientificName: animal.taxonomy?.scientific_name,
      imageUrl: animal.images?.[0]?.urls.small,
      category: determineCategory(animal),
      addedAt: Date.now(),
    };

    favorites.push(favorite);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    return true;
  } catch (error) {
    console.error('Error adding to favorites:', error);
    return false;
  }
}

/**
 * Remove animal from favorites
 */
export function removeFromFavorites(animalName: string): boolean {
  try {
    const favorites = getFavorites();
    const filtered = favorites.filter((fav) => fav.name !== animalName);

    if (filtered.length === favorites.length) {
      return false; // Not found
    }

    localStorage.setItem(FAVORITES_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error removing from favorites:', error);
    return false;
  }
}

/**
 * Check if animal is in favorites
 */
export function isFavorite(animalName: string): boolean {
  const favorites = getFavorites();
  return favorites.some((fav) => fav.name === animalName);
}

/**
 * Clear all favorites
 */
export function clearFavorites(): boolean {
  try {
    localStorage.removeItem(FAVORITES_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing favorites:', error);
    return false;
  }
}

/**
 * Get favorites count
 */
export function getFavoritesCount(): number {
  return getFavorites().length;
}

/**
 * Get favorites by category
 */
export function getFavoritesByCategory(category: string): FavoriteAnimal[] {
  const favorites = getFavorites();
  if (category === 'all') return favorites;
  return favorites.filter((fav) => fav.category === category);
}

/**
 * Determine category from animal data
 */
function determineCategory(animal: EnrichedAnimal): string {
  const className = animal.taxonomy?.class?.toLowerCase() || '';
  const name = animal.name.toLowerCase();

  // Dogs
  if (name.includes('dog') || className.includes('canis')) return 'dogs';

  // Cats
  if (name.includes('cat') || className.includes('felis')) return 'cats';

  // Birds
  if (className === 'aves' || name.includes('bird')) return 'birds';

  // Fish
  if (
    className.includes('fish') ||
    className === 'actinopterygii' ||
    className === 'chondrichthyes'
  )
    return 'fish';

  // Reptiles
  if (className === 'reptilia' || className === 'amphibia') return 'reptiles';

  // Default to wildlife
  return 'wildlife';
}

/**
 * Export favorites as JSON
 */
export function exportFavorites(): string {
  const favorites = getFavorites();
  return JSON.stringify(favorites, null, 2);
}

/**
 * Import favorites from JSON
 */
export function importFavorites(jsonString: string): boolean {
  try {
    const favorites = JSON.parse(jsonString);
    if (!Array.isArray(favorites)) {
      throw new Error('Invalid format');
    }
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    return true;
  } catch (error) {
    console.error('Error importing favorites:', error);
    return false;
  }
}

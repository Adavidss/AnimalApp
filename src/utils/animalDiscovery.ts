/**
 * Animal Discovery Utilities
 * Handles trending animals, seasonal spotlights, and view tracking
 */

interface AnimalView {
  name: string;
  timestamp: number;
  count: number;
}

interface SeasonalAnimal {
  name: string;
  scientificName: string;
  season: 'spring' | 'summer' | 'fall' | 'winter';
  months: number[]; // 1-12
  reason: string;
}

// Seasonal animals that are highlighted during specific times of year
export const seasonalAnimals: SeasonalAnimal[] = [
  // Spring (March, April, May)
  {
    name: 'Robin',
    scientificName: 'Turdus migratorius',
    season: 'spring',
    months: [3, 4, 5],
    reason: 'Robins are a classic sign of spring, returning from migration to build nests.',
  },
  {
    name: 'Butterfly',
    scientificName: 'Lepidoptera',
    season: 'spring',
    months: [3, 4, 5],
    reason: 'Butterflies emerge from chrysalis in spring, pollinating flowers.',
  },
  {
    name: 'Bee',
    scientificName: 'Anthophila',
    season: 'spring',
    months: [3, 4, 5],
    reason: 'Bees become active in spring, pollinating early blooming flowers.',
  },

  // Summer (June, July, August)
  {
    name: 'Hummingbird',
    scientificName: 'Trochilidae',
    season: 'summer',
    months: [6, 7, 8],
    reason: 'Hummingbirds are most active in summer, feeding on nectar from flowers.',
  },
  {
    name: 'Dolphin',
    scientificName: 'Delphinidae',
    season: 'summer',
    months: [6, 7, 8],
    reason: 'Dolphins are commonly spotted near shores during summer months.',
  },
  {
    name: 'Dragonfly',
    scientificName: 'Anisoptera',
    season: 'summer',
    months: [6, 7, 8],
    reason: 'Dragonflies thrive in warm summer weather near ponds and lakes.',
  },

  // Fall (September, October, November)
  {
    name: 'Goose',
    scientificName: 'Anserinae',
    season: 'fall',
    months: [9, 10, 11],
    reason: 'Geese migrate south in fall, flying in iconic V-formations.',
  },
  {
    name: 'Deer',
    scientificName: 'Cervidae',
    season: 'fall',
    months: [9, 10, 11],
    reason: 'Deer are most visible in fall during mating season (the rut).',
  },
  {
    name: 'Owl',
    scientificName: 'Strigiformes',
    season: 'fall',
    months: [9, 10, 11],
    reason: 'Owls are more active in fall as they prepare for winter.',
  },

  // Winter (December, January, February)
  {
    name: 'Penguin',
    scientificName: 'Spheniscidae',
    season: 'winter',
    months: [12, 1, 2],
    reason: 'Penguins thrive in cold climates and are iconic winter animals.',
  },
  {
    name: 'Seal',
    scientificName: 'Pinnipedia',
    season: 'winter',
    months: [12, 1, 2],
    reason: 'Seals are often spotted on ice and beaches during winter.',
  },
  {
    name: 'Polar Bear',
    scientificName: 'Ursus maritimus',
    season: 'winter',
    months: [12, 1, 2],
    reason: 'Polar bears hunt on sea ice during the Arctic winter.',
  },
];

/**
 * Get the current season based on month
 */
export function getCurrentSeason(): 'spring' | 'summer' | 'fall' | 'winter' {
  const month = new Date().getMonth() + 1; // 1-12

  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'fall';
  return 'winter'; // December, January, February
}

/**
 * Get seasonal animals for the current month
 */
export function getSeasonalAnimals(limit: number = 3): SeasonalAnimal[] {
  const currentMonth = new Date().getMonth() + 1;
  const seasonal = seasonalAnimals.filter((animal) =>
    animal.months.includes(currentMonth)
  );

  // Shuffle and return limited number
  const shuffled = [...seasonal].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, limit);
}

/**
 * Track an animal view
 */
export function trackAnimalView(animalName: string): void {
  try {
    const viewsKey = 'animal_views';
    const views: AnimalView[] = JSON.parse(localStorage.getItem(viewsKey) || '[]');

    const now = Date.now();
    const existingView = views.find((v) => v.name === animalName);

    if (existingView) {
      existingView.count++;
      existingView.timestamp = now;
    } else {
      views.push({
        name: animalName,
        timestamp: now,
        count: 1,
      });
    }

    // Keep only last 100 views
    const sorted = views.sort((a, b) => b.timestamp - a.timestamp);
    localStorage.setItem(viewsKey, JSON.stringify(sorted.slice(0, 100)));
  } catch (error) {
    console.error('Error tracking animal view:', error);
  }
}

/**
 * Get trending animals based on views in the last 7 days
 * Falls back to popular animals if no views exist
 */
export function getTrendingAnimals(limit: number = 5): string[] {
  try {
    const viewsKey = 'animal_views';
    const views: AnimalView[] = JSON.parse(localStorage.getItem(viewsKey) || '[]');

    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

    // Filter views from last 7 days
    const recentViews = views.filter((v) => v.timestamp >= sevenDaysAgo);

    // Count views per animal
    const viewCounts = new Map<string, number>();
    recentViews.forEach((view) => {
      viewCounts.set(view.name, (viewCounts.get(view.name) || 0) + view.count);
    });

    // Sort by view count
    const sorted = Array.from(viewCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .map((entry) => entry[0]);

    // If we have trending animals, return them
    if (sorted.length > 0) {
      return sorted.slice(0, limit);
    }

    // Fallback to popular animals if no views exist
    const popularAnimals = [
      'Lion', 'Tiger', 'Elephant', 'Giraffe', 'Panda',
      'Dolphin', 'Eagle', 'Penguin', 'Wolf', 'Bear'
    ];
    return popularAnimals.slice(0, limit);
  } catch (error) {
    console.error('Error getting trending animals:', error);
    // Fallback to popular animals on error
    const popularAnimals = [
      'Lion', 'Tiger', 'Elephant', 'Giraffe', 'Panda',
      'Dolphin', 'Eagle', 'Penguin', 'Wolf', 'Bear'
    ];
    return popularAnimals.slice(0, limit);
  }
}

/**
 * Get the animal of the hour (changes every hour)
 */
export function getAnimalOfTheHour(): string {
  const curatedAnimals = [
    'Lion', 'Tiger', 'Elephant', 'Giraffe', 'Zebra',
    'Panda', 'Gorilla', 'Chimpanzee', 'Orangutan',
    'Kangaroo', 'Koala', 'Wolf', 'Fox', 'Deer',
    'Eagle', 'Hawk', 'Owl', 'Falcon',
    'Penguin', 'Flamingo', 'Parrot', 'Toucan',
    'Dolphin', 'Whale', 'Seal', 'Otter',
    'Shark', 'Octopus', 'Jellyfish', 'Seahorse',
    'Butterfly', 'Dragonfly', 'Bee',
  ];

  // Use current hour to select animal (changes every hour)
  const hour = new Date().getHours();
  const index = hour % curatedAnimals.length;
  return curatedAnimals[index];
}

/**
 * Get recently viewed animals
 */
export function getRecentlyViewed(limit: number = 5): string[] {
  try {
    const viewsKey = 'animal_views';
    const views: AnimalView[] = JSON.parse(localStorage.getItem(viewsKey) || '[]');

    return views
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit)
      .map((v) => v.name);
  } catch (error) {
    console.error('Error getting recently viewed:', error);
    return [];
  }
}

/**
 * Clear view history
 */
export function clearViewHistory(): void {
  try {
    localStorage.removeItem('animal_views');
  } catch (error) {
    console.error('Error clearing view history:', error);
  }
}

/**
 * Get view statistics
 */
export function getViewStats(): {
  totalViews: number;
  uniqueAnimals: number;
  mostViewed: { name: string; count: number } | null;
} {
  try {
    const viewsKey = 'animal_views';
    const views: AnimalView[] = JSON.parse(localStorage.getItem(viewsKey) || '[]');

    const totalViews = views.reduce((sum, v) => sum + v.count, 0);
    const uniqueAnimals = views.length;

    const mostViewed = views.length > 0
      ? views.reduce((max, v) => (v.count > max.count ? v : max))
      : null;

    return {
      totalViews,
      uniqueAnimals,
      mostViewed: mostViewed ? { name: mostViewed.name, count: mostViewed.count } : null,
    };
  } catch (error) {
    console.error('Error getting view stats:', error);
    return { totalViews: 0, uniqueAnimals: 0, mostViewed: null };
  }
}

/**
 * Get discovery suggestions based on view history
 */
export function getDiscoverySuggestions(limit: number = 3): string[] {
  const allAnimals = [
    'Lion', 'Tiger', 'Elephant', 'Giraffe', 'Zebra',
    'Bear', 'Panda', 'Gorilla', 'Chimpanzee', 'Orangutan',
    'Kangaroo', 'Koala', 'Wolf', 'Fox', 'Deer',
    'Moose', 'Bison', 'Rhinoceros', 'Hippopotamus',
    'Leopard', 'Cheetah', 'Jaguar', 'Cougar',
    'Dolphin', 'Whale', 'Seal', 'Otter', 'Walrus',
    'Eagle', 'Hawk', 'Owl', 'Falcon', 'Vulture',
    'Penguin', 'Flamingo', 'Parrot', 'Toucan', 'Peacock',
    'Crow', 'Raven', 'Robin', 'Sparrow', 'Cardinal',
    'Ostrich', 'Emu', 'Pelican', 'Heron', 'Crane',
    'Duck', 'Goose', 'Swan', 'Albatross',
    'Crocodile', 'Alligator', 'Snake', 'Python', 'Cobra',
    'Lizard', 'Iguana', 'Chameleon', 'Gecko',
    'Turtle', 'Tortoise', 'Frog', 'Toad', 'Salamander',
    'Shark', 'Tuna', 'Octopus', 'Squid', 'Jellyfish',
    'Starfish', 'Seahorse', 'Clownfish', 'Swordfish',
    'Stingray', 'Lobster', 'Crab',
    'Butterfly', 'Dragonfly', 'Bee', 'Ant', 'Beetle',
    'Spider', 'Scorpion', 'Ladybug',
  ];

  const recentlyViewed = getRecentlyViewed(10);

  // Filter out recently viewed animals
  const unviewed = allAnimals.filter((animal) => !recentlyViewed.includes(animal));

  // Shuffle and return limited number
  const shuffled = [...unviewed].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, limit);
}

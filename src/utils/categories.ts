/**
 * Category definitions and themes for the Animal Atlas
 */

export type AnimalCategory = 'dogs' | 'cats' | 'birds' | 'fish' | 'reptiles' | 'wildlife' | 'conservation' | 'all';

export interface CategoryTheme {
  id: AnimalCategory;
  name: string;
  emoji: string;
  icon: string;
  description: string;
  primaryColor: string;
  accentColor: string;
  bgGradient: string;
  textColor: string;
  path: string;
}

/**
 * Category themes with colors and metadata
 */
export const CATEGORY_THEMES: Record<AnimalCategory, CategoryTheme> = {
  dogs: {
    id: 'dogs',
    name: 'Dogs',
    emoji: '🐕',
    icon: '🐕',
    description: 'Man\'s best friend - 200+ breeds',
    primaryColor: '#FF6B35',
    accentColor: '#FFD23F',
    bgGradient: 'from-orange-500 to-yellow-500',
    textColor: 'text-orange-600',
    path: '/dogs',
  },
  cats: {
    id: 'cats',
    name: 'Cats',
    emoji: '🐈',
    icon: '🐈',
    description: 'Independent companions - 100+ breeds',
    primaryColor: '#9B59B6',
    accentColor: '#E8DAEF',
    bgGradient: 'from-purple-500 to-pink-500',
    textColor: 'text-purple-600',
    path: '/cats',
  },
  birds: {
    id: 'birds',
    name: 'Birds',
    emoji: '🐦',
    icon: '🐦',
    description: 'Feathered friends - 10,000+ species',
    primaryColor: '#3498DB',
    accentColor: '#AED6F1',
    bgGradient: 'from-blue-500 to-cyan-500',
    textColor: 'text-blue-600',
    path: '/birds',
  },
  fish: {
    id: 'fish',
    name: 'Aquatic',
    emoji: '🐠',
    icon: '🐠',
    description: 'Underwater wonders - 30,000+ species',
    primaryColor: '#1ABC9C',
    accentColor: '#A3E4D7',
    bgGradient: 'from-teal-500 to-green-500',
    textColor: 'text-teal-600',
    path: '/fish',
  },
  conservation: {
    id: 'conservation',
    name: 'Conservation Status',
    emoji: '🛡️',
    icon: '🛡️',
    description: 'Animals by conservation status',
    primaryColor: '#E74C3C',
    accentColor: '#FADBD8',
    bgGradient: 'from-red-600 to-orange-600',
    textColor: 'text-red-600',
    path: '/conservation',
  },
  reptiles: {
    id: 'reptiles',
    name: 'Reptiles & Amphibians',
    emoji: '🦎',
    icon: '🦎',
    description: 'Cold-blooded creatures - 10,000+ species',
    primaryColor: '#E67E22',
    accentColor: '#F8C471',
    bgGradient: 'from-orange-600 to-red-500',
    textColor: 'text-orange-700',
    path: '/reptiles',
  },
  wildlife: {
    id: 'wildlife',
    name: 'Wildlife',
    emoji: '🦁',
    icon: '🦁',
    description: 'Wild animals from around the world',
    primaryColor: '#27AE60',
    accentColor: '#ABEBC6',
    bgGradient: 'from-green-600 to-emerald-500',
    textColor: 'text-green-600',
    path: '/wildlife',
  },
  all: {
    id: 'all',
    name: 'All Animals',
    emoji: '🌍',
    icon: '🌍',
    description: 'Explore all creatures',
    primaryColor: '#34495E',
    accentColor: '#BDC3C7',
    bgGradient: 'from-gray-700 to-gray-500',
    textColor: 'text-gray-700',
    path: '/explorer',
  },
};

/**
 * Get category from path
 */
export function getCategoryFromPath(path: string): AnimalCategory {
  if (path.includes('/dogs')) return 'dogs';
  if (path.includes('/cats')) return 'cats';
  if (path.includes('/birds')) return 'birds';
  if (path.includes('/fish')) return 'fish';
  if (path.includes('/reptiles')) return 'reptiles';
  if (path.includes('/wildlife')) return 'wildlife';
  if (path.includes('/conservation')) return 'conservation';
  return 'all';
}

/**
 * Get category theme
 */
export function getCategoryTheme(category: AnimalCategory): CategoryTheme {
  return CATEGORY_THEMES[category];
}

/**
 * Get all categories except 'all'
 */
export function getMainCategories(): CategoryTheme[] {
  return [
    CATEGORY_THEMES.dogs,
    CATEGORY_THEMES.cats,
    CATEGORY_THEMES.birds,
    CATEGORY_THEMES.fish,
    CATEGORY_THEMES.reptiles,
    CATEGORY_THEMES.wildlife,
    CATEGORY_THEMES.conservation,
  ];
}

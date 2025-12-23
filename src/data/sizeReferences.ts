/**
 * Size reference objects for comparison visualization
 * All measurements in meters for consistency
 */

export interface SizeReference {
  id: string;
  name: string;
  length: number; // meters
  height: number; // meters
  weight?: number; // kilograms
  icon: string;
  color: string;
}

export const sizeReferences: SizeReference[] = [
  {
    id: 'human',
    name: 'Average Human',
    length: 0.45, // shoulder width
    height: 1.7,
    weight: 70,
    icon: '🧍',
    color: '#3B82F6',
  },
  {
    id: 'child',
    name: 'Child (5 years)',
    length: 0.3,
    height: 1.1,
    weight: 18,
    icon: '🧒',
    color: '#10B981',
  },
  {
    id: 'car',
    name: 'Sedan Car',
    length: 4.5,
    height: 1.5,
    weight: 1500,
    icon: '🚗',
    color: '#EF4444',
  },
  {
    id: 'bus',
    name: 'School Bus',
    length: 10.5,
    height: 3.2,
    weight: 11000,
    icon: '🚌',
    color: '#F59E0B',
  },
  {
    id: 'truck',
    name: 'Semi Truck',
    length: 16.5,
    height: 4,
    weight: 36000,
    icon: '🚚',
    color: '#6366F1',
  },
  {
    id: 'bicycle',
    name: 'Bicycle',
    length: 1.8,
    height: 1.0,
    weight: 12,
    icon: '🚴',
    color: '#14B8A6',
  },
  {
    id: 'motorcycle',
    name: 'Motorcycle',
    length: 2.2,
    height: 1.2,
    weight: 200,
    icon: '🏍️',
    color: '#8B5CF6',
  },
  {
    id: 'house',
    name: 'Single-Story House',
    length: 12,
    height: 4,
    weight: 100000,
    icon: '🏠',
    color: '#EC4899',
  },
  {
    id: 'basketball',
    name: 'Basketball',
    length: 0.24,
    height: 0.24,
    weight: 0.62,
    icon: '🏀',
    color: '#F97316',
  },
  {
    id: 'door',
    name: 'Standard Door',
    length: 0.9,
    height: 2.0,
    weight: 25,
    icon: '🚪',
    color: '#84CC16',
  },
  {
    id: 'cat',
    name: 'Domestic Cat',
    length: 0.46,
    height: 0.25,
    weight: 4.5,
    icon: '🐈',
    color: '#A855F7',
  },
  {
    id: 'dog',
    name: 'Medium Dog (Labrador)',
    length: 0.8,
    height: 0.6,
    weight: 30,
    icon: '🐕',
    color: '#F43F5E',
  },
  {
    id: 'elephant',
    name: 'African Elephant',
    length: 6,
    height: 3.3,
    weight: 6000,
    icon: '🐘',
    color: '#64748B',
  },
  {
    id: 'giraffe',
    name: 'Giraffe',
    length: 4.3,
    height: 5.5,
    weight: 1200,
    icon: '🦒',
    color: '#D97706',
  },
  {
    id: 'whale',
    name: 'Blue Whale',
    length: 25,
    height: 4,
    weight: 150000,
    icon: '🐋',
    color: '#0EA5E9',
  },
  {
    id: 'penguin',
    name: 'Emperor Penguin',
    length: 0.3,
    height: 1.15,
    weight: 35,
    icon: '🐧',
    color: '#1E293B',
  },
];

/**
 * Get a size reference by ID
 */
export function getSizeReference(id: string): SizeReference | undefined {
  return sizeReferences.find((ref) => ref.id === id);
}

/**
 * Get size references suitable for comparison with a given animal
 * Selects references based on the animal's size
 */
export function getRelevantReferences(animalLength: number, animalHeight: number): SizeReference[] {
  const references: SizeReference[] = [];

  // Always include human for scale
  const human = getSizeReference('human');
  if (human) references.push(human);

  // Determine animal size category and add appropriate references
  const maxDimension = Math.max(animalLength, animalHeight);

  if (maxDimension < 0.5) {
    // Very small animals (< 0.5m)
    references.push(
      ...sizeReferences.filter((ref) => ['basketball', 'cat', 'child'].includes(ref.id))
    );
  } else if (maxDimension < 2) {
    // Small animals (0.5m - 2m)
    references.push(
      ...sizeReferences.filter((ref) => ['dog', 'door', 'bicycle', 'child'].includes(ref.id))
    );
  } else if (maxDimension < 5) {
    // Medium animals (2m - 5m)
    references.push(
      ...sizeReferences.filter((ref) => ['car', 'elephant', 'giraffe'].includes(ref.id))
    );
  } else if (maxDimension < 15) {
    // Large animals (5m - 15m)
    references.push(
      ...sizeReferences.filter((ref) => ['bus', 'elephant', 'giraffe', 'house'].includes(ref.id))
    );
  } else {
    // Very large animals (> 15m)
    references.push(
      ...sizeReferences.filter((ref) => ['truck', 'whale', 'house'].includes(ref.id))
    );
  }

  // Remove duplicates and return max 5 references
  return Array.from(new Set(references)).slice(0, 5);
}

/**
 * Convert meters to feet and inches
 */
export function metersToFeetInches(meters: number): string {
  const totalInches = meters * 39.3701;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return `${feet}' ${inches}"`;
}

/**
 * Convert kilograms to pounds
 */
export function kgToPounds(kg: number): string {
  const pounds = kg * 2.20462;
  if (pounds < 10) {
    return `${pounds.toFixed(1)} lbs`;
  }
  return `${Math.round(pounds)} lbs`;
}

/**
 * Format metric length (meters to cm/m/km)
 */
export function formatMetricLength(meters: number): string {
  if (meters < 0.01) {
    return `${(meters * 1000).toFixed(1)} mm`;
  } else if (meters < 1) {
    return `${(meters * 100).toFixed(1)} cm`;
  } else if (meters < 1000) {
    return `${meters.toFixed(1)} m`;
  } else {
    return `${(meters / 1000).toFixed(2)} km`;
  }
}

/**
 * Format metric weight (kg to g/kg/tonnes)
 */
export function formatMetricWeight(kg: number): string {
  if (kg < 0.1) {
    return `${(kg * 1000).toFixed(1)} g`;
  } else if (kg < 1000) {
    return `${kg.toFixed(1)} kg`;
  } else {
    return `${(kg / 1000).toFixed(2)} tonnes`;
  }
}

/**
 * Format imperial weight (kg to oz/lbs/tons)
 */
export function formatImperialWeight(kg: number): string {
  const pounds = kg * 2.20462;
  if (pounds < 1) {
    return `${(pounds * 16).toFixed(1)} oz`;
  } else if (pounds < 2000) {
    return `${pounds.toFixed(1)} lbs`;
  } else {
    return `${(pounds / 2000).toFixed(2)} tons`;
  }
}

/**
 * Compare two sizes and return a descriptive comparison
 */
export function compareSizes(animal1: { length: number; height: number }, animal2: { length: number; height: number }): string {
  const ratio = Math.max(animal1.length, animal1.height) / Math.max(animal2.length, animal2.height);

  if (ratio > 10) {
    return 'over 10 times larger';
  } else if (ratio > 5) {
    return 'about 5-10 times larger';
  } else if (ratio > 2) {
    return 'about 2-5 times larger';
  } else if (ratio > 1.5) {
    return 'noticeably larger';
  } else if (ratio > 1.1) {
    return 'slightly larger';
  } else if (ratio > 0.9) {
    return 'about the same size';
  } else if (ratio > 0.67) {
    return 'slightly smaller';
  } else if (ratio > 0.5) {
    return 'noticeably smaller';
  } else if (ratio > 0.2) {
    return 'about 2-5 times smaller';
  } else if (ratio > 0.1) {
    return 'about 5-10 times smaller';
  } else {
    return 'over 10 times smaller';
  }
}

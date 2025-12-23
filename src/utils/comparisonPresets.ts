// Popular animal comparison presets

export interface ComparisonPreset {
  id: string;
  name: string;
  description: string;
  animals: string[];
  category: 'size' | 'speed' | 'strength' | 'intelligence' | 'lifespan' | 'popular';
  icon: string;
}

export const COMPARISON_PRESETS: ComparisonPreset[] = [
  // Popular comparisons
  {
    id: 'big-cats',
    name: 'Big Cats Showdown',
    description: 'Compare the largest and most powerful feline predators',
    animals: ['Lion', 'Tiger', 'Leopard', 'Jaguar'],
    category: 'popular',
    icon: '🦁'
  },
  {
    id: 'ocean-giants',
    name: 'Ocean Giants',
    description: 'The largest creatures in the sea',
    animals: ['Blue Whale', 'Whale Shark', 'Giant Squid', 'Great White Shark'],
    category: 'size',
    icon: '🐋'
  },
  {
    id: 'african-safari',
    name: 'African Safari',
    description: 'Iconic animals of the African savanna',
    animals: ['Elephant', 'Giraffe', 'Rhinoceros', 'Hippopotamus'],
    category: 'popular',
    icon: '🐘'
  },
  {
    id: 'speed-demons',
    name: 'Speed Demons',
    description: 'Fastest animals on land, air, and sea',
    animals: ['Cheetah', 'Peregrine Falcon', 'Sailfish', 'Pronghorn Antelope'],
    category: 'speed',
    icon: '⚡'
  },

  // Size comparisons
  {
    id: 'largest-land',
    name: 'Land Giants',
    description: 'The biggest animals that walk on Earth',
    animals: ['African Elephant', 'Giraffe', 'Hippopotamus', 'White Rhinoceros'],
    category: 'size',
    icon: '🦏'
  },
  {
    id: 'tiny-creatures',
    name: 'Tiny Creatures',
    description: 'The smallest mammals in the world',
    animals: ['Bumblebee Bat', 'Etruscan Shrew', 'Pygmy Marmoset', 'Mouse Lemur'],
    category: 'size',
    icon: '🐭'
  },
  {
    id: 'birds-of-size',
    name: 'Birds by Size',
    description: 'From the smallest hummingbird to the largest ostrich',
    animals: ['Ostrich', 'Emu', 'Albatross', 'Bee Hummingbird'],
    category: 'size',
    icon: '🦅'
  },

  // Speed comparisons
  {
    id: 'aerial-speed',
    name: 'Aerial Speed Masters',
    description: 'Fastest flying birds',
    animals: ['Peregrine Falcon', 'Golden Eagle', 'Swift', 'Frigatebird'],
    category: 'speed',
    icon: '🦅'
  },
  {
    id: 'marine-speed',
    name: 'Marine Speedsters',
    description: 'Fastest swimmers in the ocean',
    animals: ['Sailfish', 'Marlin', 'Mako Shark', 'Orca'],
    category: 'speed',
    icon: '🐟'
  },
  {
    id: 'land-speed',
    name: 'Land Speed Champions',
    description: 'Fastest runners on land',
    animals: ['Cheetah', 'Pronghorn Antelope', 'Springbok', 'Wildebeest'],
    category: 'speed',
    icon: '🐆'
  },

  // Strength comparisons
  {
    id: 'apex-predators',
    name: 'Apex Predators',
    description: 'The most powerful predators across ecosystems',
    animals: ['Polar Bear', 'Saltwater Crocodile', 'Tiger', 'Orca'],
    category: 'strength',
    icon: '🐻'
  },
  {
    id: 'powerful-jaws',
    name: 'Bite Force Champions',
    description: 'Animals with the strongest bites',
    animals: ['Saltwater Crocodile', 'Great White Shark', 'Hippopotamus', 'Jaguar'],
    category: 'strength',
    icon: '🦈'
  },
  {
    id: 'lifting-power',
    name: 'Lifting Champions',
    description: 'Animals that can lift the most relative to body weight',
    animals: ['Dung Beetle', 'Leafcutter Ant', 'Rhinoceros Beetle', 'Elephant'],
    category: 'strength',
    icon: '🪲'
  },

  // Intelligence comparisons
  {
    id: 'smart-mammals',
    name: 'Smartest Mammals',
    description: 'Most intelligent mammalian species',
    animals: ['Dolphin', 'Chimpanzee', 'Elephant', 'Orangutan'],
    category: 'intelligence',
    icon: '🐬'
  },
  {
    id: 'clever-birds',
    name: 'Clever Birds',
    description: 'Birds known for problem-solving abilities',
    animals: ['Crow', 'Parrot', 'Raven', 'Magpie'],
    category: 'intelligence',
    icon: '🦜'
  },
  {
    id: 'tool-users',
    name: 'Tool Users',
    description: 'Animals that use tools in the wild',
    animals: ['Chimpanzee', 'Sea Otter', 'Crow', 'Elephant'],
    category: 'intelligence',
    icon: '🔧'
  },

  // Lifespan comparisons
  {
    id: 'longest-lived',
    name: 'Longest Lived',
    description: 'Animals with extraordinary lifespans',
    animals: ['Greenland Shark', 'Bowhead Whale', 'Giant Tortoise', 'Tuatara'],
    category: 'lifespan',
    icon: '🐢'
  },
  {
    id: 'short-lived',
    name: 'Brief Lives',
    description: 'Animals with remarkably short lifespans',
    animals: ['Mayfly', 'Worker Bee', 'Mouse', 'Chameleon'],
    category: 'lifespan',
    icon: '🦋'
  },

  // Popular themed comparisons
  {
    id: 'bears-comparison',
    name: 'Bear Species',
    description: 'Different bear species compared',
    animals: ['Polar Bear', 'Grizzly Bear', 'Panda', 'Sun Bear'],
    category: 'popular',
    icon: '🐻'
  },
  {
    id: 'primates',
    name: 'Primate Family',
    description: 'Our closest relatives in the animal kingdom',
    animals: ['Gorilla', 'Chimpanzee', 'Orangutan', 'Bonobo'],
    category: 'popular',
    icon: '🦍'
  },
  {
    id: 'canines',
    name: 'Canine Cousins',
    description: 'Wild members of the dog family',
    animals: ['Gray Wolf', 'Red Fox', 'Coyote', 'African Wild Dog'],
    category: 'popular',
    icon: '🐺'
  },
  {
    id: 'sharks',
    name: 'Shark Species',
    description: 'Different types of sharks',
    animals: ['Great White Shark', 'Whale Shark', 'Hammerhead Shark', 'Tiger Shark'],
    category: 'popular',
    icon: '🦈'
  },
  {
    id: 'penguins',
    name: 'Penguin Varieties',
    description: 'Different penguin species',
    animals: ['Emperor Penguin', 'King Penguin', 'Little Penguin', 'Gentoo Penguin'],
    category: 'popular',
    icon: '🐧'
  },
  {
    id: 'marsupials',
    name: 'Australian Marsupials',
    description: 'Iconic marsupials from Australia',
    animals: ['Kangaroo', 'Koala', 'Wombat', 'Tasmanian Devil'],
    category: 'popular',
    icon: '🦘'
  },
  {
    id: 'endangered-species',
    name: 'Critically Endangered',
    description: 'Species fighting for survival',
    animals: ['Mountain Gorilla', 'Javan Rhinoceros', 'Vaquita', 'Sumatran Tiger'],
    category: 'popular',
    icon: '⚠️'
  },
  {
    id: 'arctic-animals',
    name: 'Arctic Survivors',
    description: 'Animals adapted to extreme cold',
    animals: ['Polar Bear', 'Arctic Fox', 'Snowy Owl', 'Walrus'],
    category: 'popular',
    icon: '❄️'
  },
  {
    id: 'desert-dwellers',
    name: 'Desert Dwellers',
    description: 'Animals adapted to arid environments',
    animals: ['Camel', 'Fennec Fox', 'Meerkat', 'Thorny Devil'],
    category: 'popular',
    icon: '🏜️'
  },
  {
    id: 'rainforest-residents',
    name: 'Rainforest Residents',
    description: 'Biodiversity of tropical rainforests',
    animals: ['Jaguar', 'Poison Dart Frog', 'Toucan', 'Sloth'],
    category: 'popular',
    icon: '🌴'
  },
  {
    id: 'venomous-creatures',
    name: 'Venomous Creatures',
    description: 'Most venomous animals in the world',
    animals: ['Box Jellyfish', 'Inland Taipan', 'Blue-ringed Octopus', 'Cone Snail'],
    category: 'strength',
    icon: '☠️'
  },
  {
    id: 'nocturnal-hunters',
    name: 'Nocturnal Hunters',
    description: 'Predators of the night',
    animals: ['Owl', 'Bat', 'Leopard', 'Tasmanian Devil'],
    category: 'popular',
    icon: '🌙'
  },
  {
    id: 'migration-masters',
    name: 'Migration Masters',
    description: 'Animals with the longest migrations',
    animals: ['Arctic Tern', 'Monarch Butterfly', 'Wildebeest', 'Gray Whale'],
    category: 'popular',
    icon: '🧭'
  }
];

/**
 * Get all comparison presets
 */
export function getAllPresets(): ComparisonPreset[] {
  return COMPARISON_PRESETS;
}

/**
 * Get presets by category
 */
export function getPresetsByCategory(category: ComparisonPreset['category']): ComparisonPreset[] {
  return COMPARISON_PRESETS.filter(preset => preset.category === category);
}

/**
 * Get a specific preset by ID
 */
export function getPresetById(id: string): ComparisonPreset | undefined {
  return COMPARISON_PRESETS.find(preset => preset.id === id);
}

/**
 * Get random presets
 */
export function getRandomPresets(count: number = 3): ComparisonPreset[] {
  const shuffled = [...COMPARISON_PRESETS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * Search presets by name or description
 */
export function searchPresets(query: string): ComparisonPreset[] {
  const lowerQuery = query.toLowerCase();
  return COMPARISON_PRESETS.filter(
    preset =>
      preset.name.toLowerCase().includes(lowerQuery) ||
      preset.description.toLowerCase().includes(lowerQuery) ||
      preset.animals.some(animal => animal.toLowerCase().includes(lowerQuery))
  );
}

/**
 * Get preset categories
 */
export function getPresetCategories(): Array<{ id: ComparisonPreset['category']; name: string; icon: string }> {
  return [
    { id: 'popular', name: 'Popular', icon: '⭐' },
    { id: 'size', name: 'Size', icon: '📏' },
    { id: 'speed', name: 'Speed', icon: '⚡' },
    { id: 'strength', name: 'Strength', icon: '💪' },
    { id: 'intelligence', name: 'Intelligence', icon: '🧠' },
    { id: 'lifespan', name: 'Lifespan', icon: '⏳' }
  ];
}

/**
 * Save custom comparison as preset to localStorage
 */
export function saveCustomComparison(
  name: string,
  description: string,
  animals: string[]
): void {
  const customPresets = getCustomPresets();

  const newPreset: ComparisonPreset = {
    id: `custom-${Date.now()}`,
    name,
    description,
    animals,
    category: 'popular',
    icon: '⭐'
  };

  customPresets.push(newPreset);
  localStorage.setItem('custom_comparisons', JSON.stringify(customPresets));
}

/**
 * Get custom user-created presets from localStorage
 */
export function getCustomPresets(): ComparisonPreset[] {
  try {
    const saved = localStorage.getItem('custom_comparisons');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

/**
 * Delete a custom preset
 */
export function deleteCustomPreset(id: string): void {
  const customPresets = getCustomPresets().filter(preset => preset.id !== id);
  localStorage.setItem('custom_comparisons', JSON.stringify(customPresets));
}

/**
 * Get all presets including custom ones
 */
export function getAllPresetsWithCustom(): ComparisonPreset[] {
  return [...COMPARISON_PRESETS, ...getCustomPresets()];
}

/**
 * Track preset usage for analytics
 */
export function trackPresetUsage(presetId: string): void {
  try {
    const usage = JSON.parse(localStorage.getItem('preset_usage') || '{}');
    usage[presetId] = (usage[presetId] || 0) + 1;
    localStorage.setItem('preset_usage', JSON.stringify(usage));
  } catch (error) {
    console.error('Failed to track preset usage:', error);
  }
}

/**
 * Get most popular presets based on usage
 */
export function getPopularPresets(count: number = 5): ComparisonPreset[] {
  try {
    const usage = JSON.parse(localStorage.getItem('preset_usage') || '{}');
    const sortedPresets = [...COMPARISON_PRESETS].sort((a, b) => {
      return (usage[b.id] || 0) - (usage[a.id] || 0);
    });
    return sortedPresets.slice(0, count);
  } catch {
    return getRandomPresets(count);
  }
}

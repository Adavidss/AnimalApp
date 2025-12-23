// Curated animals with distinctive sounds for the Sound Match game
// These animals are selected based on having clear, recognizable sounds
// available through Xeno-Canto and other sources

export interface SoundAnimal {
  name: string;
  scientificName: string;
  soundType: string; // e.g., "call", "song", "roar", "howl"
  difficulty: 'easy' | 'medium' | 'hard';
  category: 'birds' | 'mammals' | 'amphibians' | 'insects';
  description: string;
  hints?: string[];
}

export const SOUND_GAME_ANIMALS: SoundAnimal[] = [
  // EASY - Birds (Very distinctive sounds)
  {
    name: 'Rooster',
    scientificName: 'Gallus gallus domesticus',
    soundType: 'crow',
    difficulty: 'easy',
    category: 'birds',
    description: 'Classic "cock-a-doodle-doo" morning crow',
    hints: ['Farms', 'Morning call', 'Domestic bird']
  },
  {
    name: 'Owl',
    scientificName: 'Strix',
    soundType: 'hoot',
    difficulty: 'easy',
    category: 'birds',
    description: 'Distinctive "hoo-hoo" hooting sound',
    hints: ['Nocturnal', 'Wise bird', 'Forest dweller']
  },
  {
    name: 'Crow',
    scientificName: 'Corvus',
    soundType: 'caw',
    difficulty: 'easy',
    category: 'birds',
    description: 'Harsh "caw-caw" call',
    hints: ['Black bird', 'Intelligent', 'Common urban bird']
  },
  {
    name: 'Duck',
    scientificName: 'Anas platyrhynchos',
    soundType: 'quack',
    difficulty: 'easy',
    category: 'birds',
    description: 'Classic "quack" sound',
    hints: ['Waterfowl', 'Waddles', 'Ponds and lakes']
  },
  {
    name: 'Woodpecker',
    scientificName: 'Picidae',
    soundType: 'drumming',
    difficulty: 'easy',
    category: 'birds',
    description: 'Rapid tapping/drumming on wood',
    hints: ['Pecks trees', 'Red head', 'Carpenter bird']
  },
  {
    name: 'Parrot',
    scientificName: 'Psittaciformes',
    soundType: 'squawk',
    difficulty: 'easy',
    category: 'birds',
    description: 'Loud squawking and talking',
    hints: ['Colorful', 'Can mimic speech', 'Tropical']
  },
  {
    name: 'Seagull',
    scientificName: 'Larus',
    soundType: 'cry',
    difficulty: 'easy',
    category: 'birds',
    description: 'Loud crying/screaming call',
    hints: ['Coastal bird', 'Beach scavenger', 'White and gray']
  },
  {
    name: 'Peacock',
    scientificName: 'Pavo cristatus',
    soundType: 'call',
    difficulty: 'easy',
    category: 'birds',
    description: 'Loud, high-pitched "meow-like" call',
    hints: ['Colorful tail feathers', 'Display dance', 'India']
  },

  // EASY - Mammals
  {
    name: 'Dog',
    scientificName: 'Canis familiaris',
    soundType: 'bark',
    difficulty: 'easy',
    category: 'mammals',
    description: 'Barking, howling, and growling',
    hints: ['Best friend', 'Pet', 'Tail wagger']
  },
  {
    name: 'Cat',
    scientificName: 'Felis catus',
    soundType: 'meow',
    difficulty: 'easy',
    category: 'mammals',
    description: 'Meowing and purring sounds',
    hints: ['Pet', 'Whiskers', 'Nine lives']
  },
  {
    name: 'Lion',
    scientificName: 'Panthera leo',
    soundType: 'roar',
    difficulty: 'easy',
    category: 'mammals',
    description: 'Deep, powerful roar',
    hints: ['King of jungle', 'Mane', 'African savanna']
  },
  {
    name: 'Wolf',
    scientificName: 'Canis lupus',
    soundType: 'howl',
    difficulty: 'easy',
    category: 'mammals',
    description: 'Long, haunting howl',
    hints: ['Pack animal', 'Full moon', 'Wilderness']
  },
  {
    name: 'Elephant',
    scientificName: 'Loxodonta',
    soundType: 'trumpet',
    difficulty: 'easy',
    category: 'mammals',
    description: 'Loud trumpeting sound through trunk',
    hints: ['Trunk', 'Largest land animal', 'Never forgets']
  },
  {
    name: 'Cow',
    scientificName: 'Bos taurus',
    soundType: 'moo',
    difficulty: 'easy',
    category: 'mammals',
    description: 'Deep "moo" sound',
    hints: ['Farm animal', 'Milk producer', 'Grazes grass']
  },
  {
    name: 'Horse',
    scientificName: 'Equus caballus',
    soundType: 'neigh',
    difficulty: 'easy',
    category: 'mammals',
    description: 'Neighing and whinnying',
    hints: ['Rides', 'Mane and tail', 'Gallops']
  },
  {
    name: 'Pig',
    scientificName: 'Sus scrofa',
    soundType: 'oink',
    difficulty: 'easy',
    category: 'mammals',
    description: 'Oinking and grunting',
    hints: ['Farm animal', 'Curly tail', 'Loves mud']
  },
  {
    name: 'Sheep',
    scientificName: 'Ovis aries',
    soundType: 'baa',
    difficulty: 'easy',
    category: 'mammals',
    description: '"Baa" bleating sound',
    hints: ['Wool', 'Flock', 'Grazing animal']
  },
  {
    name: 'Donkey',
    scientificName: 'Equus asinus',
    soundType: 'bray',
    difficulty: 'easy',
    category: 'mammals',
    description: 'Loud "hee-haw" braying',
    hints: ['Long ears', 'Stubborn', 'Pack animal']
  },

  // MEDIUM - Birds
  {
    name: 'American Robin',
    scientificName: 'Turdus migratorius',
    soundType: 'song',
    difficulty: 'medium',
    category: 'birds',
    description: 'Cheerful, melodious song',
    hints: ['Red breast', 'Spring arrival', 'North America']
  },
  {
    name: 'Cardinal',
    scientificName: 'Cardinalis cardinalis',
    soundType: 'song',
    difficulty: 'medium',
    category: 'birds',
    description: 'Clear whistling song',
    hints: ['Bright red', 'Crest', 'State bird']
  },
  {
    name: 'Mockingbird',
    scientificName: 'Mimus polyglottos',
    soundType: 'song',
    difficulty: 'medium',
    category: 'birds',
    description: 'Mimics other bird songs',
    hints: ['Song mimic', 'Gray bird', 'Night singer']
  },
  {
    name: 'Blue Jay',
    scientificName: 'Cyanocitta cristata',
    soundType: 'call',
    difficulty: 'medium',
    category: 'birds',
    description: 'Harsh "jay-jay" call',
    hints: ['Blue and white', 'Bold', 'Acorn lover']
  },
  {
    name: 'Loon',
    scientificName: 'Gavia immer',
    soundType: 'call',
    difficulty: 'medium',
    category: 'birds',
    description: 'Haunting, yodeling call',
    hints: ['Lake bird', 'Excellent diver', 'Canada symbol']
  },
  {
    name: 'Kookaburra',
    scientificName: 'Dacelo novaeguineae',
    soundType: 'laugh',
    difficulty: 'medium',
    category: 'birds',
    description: 'Laughing call sounds like human laughter',
    hints: ['Laughing bird', 'Australia', 'Kingfisher family']
  },
  {
    name: 'Whip-poor-will',
    scientificName: 'Antrostomus vociferus',
    soundType: 'song',
    difficulty: 'medium',
    category: 'birds',
    description: 'Repeats own name: "whip-poor-will"',
    hints: ['Night bird', 'Camouflaged', 'Named after sound']
  },
  {
    name: 'Cuckoo',
    scientificName: 'Cuculus canorus',
    soundType: 'call',
    difficulty: 'medium',
    category: 'birds',
    description: '"Cuck-oo" two-note call',
    hints: ['Clock bird', 'Brood parasite', 'Spring arrival']
  },

  // MEDIUM - Mammals
  {
    name: 'Hyena',
    scientificName: 'Crocuta crocuta',
    soundType: 'laugh',
    difficulty: 'medium',
    category: 'mammals',
    description: 'Cackling, laughing sound',
    hints: ['Laughing animal', 'Scavenger', 'African plains']
  },
  {
    name: 'Chimpanzee',
    scientificName: 'Pan troglodytes',
    soundType: 'pant-hoot',
    difficulty: 'medium',
    category: 'mammals',
    description: 'Hooting and screaming vocalizations',
    hints: ['Primate', 'Tool user', 'Intelligent']
  },
  {
    name: 'Howler Monkey',
    scientificName: 'Alouatta',
    soundType: 'howl',
    difficulty: 'medium',
    category: 'mammals',
    description: 'Extremely loud howling (loudest land animal)',
    hints: ['Loudest primate', 'Rainforest', 'Central America']
  },
  {
    name: 'Dolphin',
    scientificName: 'Delphinus delphis',
    soundType: 'clicks/whistles',
    difficulty: 'medium',
    category: 'mammals',
    description: 'Clicking and whistling sounds',
    hints: ['Marine mammal', 'Intelligent', 'Echolocation']
  },
  {
    name: 'Seal',
    scientificName: 'Phoca',
    soundType: 'bark',
    difficulty: 'medium',
    category: 'mammals',
    description: 'Barking and grunting sounds',
    hints: ['Marine mammal', 'Flippers', 'Fish eater']
  },
  {
    name: 'Bear',
    scientificName: 'Ursus',
    soundType: 'growl',
    difficulty: 'medium',
    category: 'mammals',
    description: 'Deep growling and roaring',
    hints: ['Hibernates', 'Honey lover', 'Large carnivore']
  },

  // MEDIUM - Amphibians
  {
    name: 'Bullfrog',
    scientificName: 'Lithobates catesbeianus',
    soundType: 'croak',
    difficulty: 'medium',
    category: 'amphibians',
    description: 'Deep "jug-o-rum" croaking',
    hints: ['Large frog', 'Pond dweller', 'Deep voice']
  },
  {
    name: 'Tree Frog',
    scientificName: 'Hyla',
    soundType: 'chirp',
    difficulty: 'medium',
    category: 'amphibians',
    description: 'High-pitched chirping or trilling',
    hints: ['Climbs trees', 'Small', 'Sticky toe pads']
  },

  // MEDIUM - Insects
  {
    name: 'Cricket',
    scientificName: 'Gryllidae',
    soundType: 'chirp',
    difficulty: 'medium',
    category: 'insects',
    description: 'Rhythmic chirping sound',
    hints: ['Night sound', 'Insect', 'Rubs wings']
  },
  {
    name: 'Cicada',
    scientificName: 'Cicadidae',
    soundType: 'buzz',
    difficulty: 'medium',
    category: 'insects',
    description: 'Loud buzzing/droning sound',
    hints: ['Summer sound', '17-year cycle', 'Tree dweller']
  },

  // HARD - Birds
  {
    name: 'Nightingale',
    scientificName: 'Luscinia megarhynchos',
    soundType: 'song',
    difficulty: 'hard',
    category: 'birds',
    description: 'Beautiful, complex nighttime song',
    hints: ['Famous song', 'Night singer', 'European bird']
  },
  {
    name: 'Lyrebird',
    scientificName: 'Menura',
    soundType: 'mimicry',
    difficulty: 'hard',
    category: 'birds',
    description: 'Mimics many sounds including chainsaws',
    hints: ['Master mimic', 'Australia', 'Tail display']
  },
  {
    name: 'Hermit Thrush',
    scientificName: 'Catharus guttatus',
    soundType: 'song',
    difficulty: 'hard',
    category: 'birds',
    description: 'Flute-like ethereal song',
    hints: ['Forest bird', 'Spotted breast', 'Vermont state bird']
  },
  {
    name: 'Wood Thrush',
    scientificName: 'Hylocichla mustelina',
    soundType: 'song',
    difficulty: 'hard',
    category: 'birds',
    description: 'Flute-like "ee-oh-lay"',
    hints: ['Forest songbird', 'Declining', 'Eastern US']
  },
  {
    name: 'Canyon Wren',
    scientificName: 'Catherpes mexicanus',
    soundType: 'song',
    difficulty: 'hard',
    category: 'birds',
    description: 'Descending cascade of notes',
    hints: ['Desert canyons', 'Rock dweller', 'Western US']
  },

  // HARD - Mammals
  {
    name: 'Tasmanian Devil',
    scientificName: 'Sarcophilus harrisii',
    soundType: 'screech',
    difficulty: 'hard',
    category: 'mammals',
    description: 'Eerie screeching and growling',
    hints: ['Tasmania only', 'Endangered', 'Nocturnal scavenger']
  },
  {
    name: 'Red Fox',
    scientificName: 'Vulpes vulpes',
    soundType: 'scream',
    difficulty: 'hard',
    category: 'mammals',
    description: 'Blood-curdling scream',
    hints: ['Cunning', 'Orange fur', 'Urban adapter']
  },
  {
    name: 'Gibbon',
    scientificName: 'Hylobatidae',
    soundType: 'song',
    difficulty: 'hard',
    category: 'mammals',
    description: 'Loud, musical hooting duets',
    hints: ['Lesser ape', 'Brachiator', 'Asia rainforests']
  },
  {
    name: 'Humpback Whale',
    scientificName: 'Megaptera novaeangliae',
    soundType: 'song',
    difficulty: 'hard',
    category: 'mammals',
    description: 'Complex, haunting underwater songs',
    hints: ['Whale songs', 'Breaches', 'Ocean migration']
  },
  {
    name: 'Elk',
    scientificName: 'Cervus canadensis',
    soundType: 'bugle',
    difficulty: 'hard',
    category: 'mammals',
    description: 'High-pitched bugling call',
    hints: ['Large deer', 'Antlers', 'Mountain forests']
  },
  {
    name: 'Lynx',
    scientificName: 'Lynx',
    soundType: 'scream',
    difficulty: 'hard',
    category: 'mammals',
    description: 'Eerie screaming and yowling',
    hints: ['Wild cat', 'Ear tufts', 'Boreal forests']
  }
];

/**
 * Get animals by difficulty
 */
export function getAnimalsByDifficulty(difficulty: 'easy' | 'medium' | 'hard'): SoundAnimal[] {
  return SOUND_GAME_ANIMALS.filter(animal => animal.difficulty === difficulty);
}

/**
 * Get animals by category
 */
export function getAnimalsByCategory(category: SoundAnimal['category']): SoundAnimal[] {
  return SOUND_GAME_ANIMALS.filter(animal => animal.category === category);
}

/**
 * Get random animals for a game round
 */
export function getRandomAnimals(
  count: number,
  difficulty?: 'easy' | 'medium' | 'hard',
  category?: SoundAnimal['category']
): SoundAnimal[] {
  let pool = SOUND_GAME_ANIMALS;

  if (difficulty) {
    pool = pool.filter(animal => animal.difficulty === difficulty);
  }

  if (category) {
    pool = pool.filter(animal => animal.category === category);
  }

  // Shuffle and return requested count
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * Get wrong answer options for a given animal
 */
export function getWrongAnswers(
  correctAnimal: SoundAnimal,
  count: number = 3
): SoundAnimal[] {
  // Try to get wrong answers from the same category and similar difficulty
  const sameCategoryAnimals = SOUND_GAME_ANIMALS.filter(
    animal =>
      animal.name !== correctAnimal.name &&
      animal.category === correctAnimal.category
  );

  const similarDifficultyAnimals = SOUND_GAME_ANIMALS.filter(
    animal =>
      animal.name !== correctAnimal.name &&
      animal.difficulty === correctAnimal.difficulty
  );

  // Prefer same category, fallback to similar difficulty, then any
  let pool = sameCategoryAnimals.length >= count
    ? sameCategoryAnimals
    : similarDifficultyAnimals.length >= count
    ? similarDifficultyAnimals
    : SOUND_GAME_ANIMALS.filter(animal => animal.name !== correctAnimal.name);

  // Shuffle and return
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * Get total count of animals by difficulty
 */
export function getAnimalCount(difficulty?: 'easy' | 'medium' | 'hard'): number {
  if (!difficulty) return SOUND_GAME_ANIMALS.length;
  return SOUND_GAME_ANIMALS.filter(animal => animal.difficulty === difficulty).length;
}

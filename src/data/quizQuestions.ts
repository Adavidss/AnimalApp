export type QuizQuestionType = 'text' | 'image' | 'sound';
export type QuizDifficulty = 'easy' | 'medium' | 'hard';
export type QuizCategory = 'all' | 'mammals' | 'birds' | 'reptiles' | 'fish' | 'marine';

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: QuizDifficulty;
  category: QuizCategory;
  type: QuizQuestionType;
  // For image-based questions
  imageQuery?: string;
  // For sound-based questions
  soundAnimal?: string;
}

export const quizQuestions: QuizQuestion[] = [
  // EASY - MAMMALS
  {
    id: 1,
    question: "What is the largest land mammal?",
    options: ["Elephant", "Rhinoceros", "Hippopotamus", "Giraffe"],
    correctAnswer: 0,
    explanation: "The African elephant is the largest land mammal, weighing up to 6,000 kg (13,000 lbs).",
    difficulty: "easy",
    category: "mammals",
    type: "text"
  },
  {
    id: 2,
    question: "Which mammal is known for its black and white stripes?",
    options: ["Tiger", "Zebra", "Panda", "Skunk"],
    correctAnswer: 1,
    explanation: "Zebras are known for their distinctive black and white stripes, which are unique to each individual.",
    difficulty: "easy",
    category: "mammals",
    type: "text"
  },
  {
    id: 3,
    question: "What is the fastest land animal?",
    options: ["Lion", "Cheetah", "Leopard", "Gazelle"],
    correctAnswer: 1,
    explanation: "The cheetah can reach speeds of up to 120 km/h (75 mph), making it the fastest land animal.",
    difficulty: "easy",
    category: "mammals",
    type: "text"
  },
  {
    id: 4,
    question: "Which animal sleeps hanging upside down?",
    options: ["Sloth", "Monkey", "Bat", "Koala"],
    correctAnswer: 2,
    explanation: "Bats sleep hanging upside down, which helps them take off quickly if needed.",
    difficulty: "easy",
    category: "mammals",
    type: "text"
  },
  {
    id: 5,
    question: "What is a baby kangaroo called?",
    options: ["Cub", "Joey", "Pup", "Kit"],
    correctAnswer: 1,
    explanation: "A baby kangaroo is called a joey and is born extremely small, then develops in the mother's pouch.",
    difficulty: "easy",
    category: "mammals",
    type: "text"
  },

  // EASY - BIRDS
  {
    id: 6,
    question: "Which bird is known for its ability to mimic human speech?",
    options: ["Eagle", "Parrot", "Owl", "Penguin"],
    correctAnswer: 1,
    explanation: "Parrots can mimic human speech and other sounds due to their specialized vocal structure.",
    difficulty: "easy",
    category: "birds",
    type: "text"
  },
  {
    id: 7,
    question: "What is the largest bird that cannot fly?",
    options: ["Penguin", "Emu", "Ostrich", "Cassowary"],
    correctAnswer: 2,
    explanation: "The ostrich is the largest flightless bird and can run up to 70 km/h (43 mph).",
    difficulty: "easy",
    category: "birds",
    type: "text"
  },
  {
    id: 8,
    question: "Which bird is known for flying backwards?",
    options: ["Hummingbird", "Sparrow", "Robin", "Crow"],
    correctAnswer: 0,
    explanation: "Hummingbirds can fly backwards, forwards, and even upside down due to their unique wing structure.",
    difficulty: "easy",
    category: "birds",
    type: "text"
  },
  {
    id: 9,
    question: "What is a group of crows called?",
    options: ["Flock", "Murder", "Pack", "Herd"],
    correctAnswer: 1,
    explanation: "A group of crows is called a 'murder', a term dating back to the 15th century.",
    difficulty: "easy",
    category: "birds",
    type: "text"
  },
  {
    id: 10,
    question: "Which bird lays the largest eggs?",
    options: ["Emu", "Ostrich", "Eagle", "Albatross"],
    correctAnswer: 1,
    explanation: "Ostrich eggs are the largest of any living bird, weighing about 1.4 kg (3 lbs).",
    difficulty: "easy",
    category: "birds",
    type: "text"
  },

  // EASY - REPTILES
  {
    id: 11,
    question: "Which reptile has the strongest bite force?",
    options: ["Alligator", "Crocodile", "Komodo Dragon", "Python"],
    correctAnswer: 1,
    explanation: "The saltwater crocodile has the strongest bite force of any animal, at over 3,700 pounds per square inch.",
    difficulty: "easy",
    category: "reptiles",
    type: "text"
  },
  {
    id: 12,
    question: "What is the largest species of lizard?",
    options: ["Iguana", "Komodo Dragon", "Monitor Lizard", "Chameleon"],
    correctAnswer: 1,
    explanation: "The Komodo dragon can grow up to 3 meters (10 feet) long and weigh up to 90 kg (200 lbs).",
    difficulty: "easy",
    category: "reptiles",
    type: "text"
  },
  {
    id: 13,
    question: "Which reptile can change its color?",
    options: ["Snake", "Turtle", "Chameleon", "Crocodile"],
    correctAnswer: 2,
    explanation: "Chameleons change color to regulate temperature, communicate, and camouflage themselves.",
    difficulty: "easy",
    category: "reptiles",
    type: "text"
  },
  {
    id: 14,
    question: "What is the only venomous lizard in North America?",
    options: ["Gila Monster", "Horned Lizard", "Fence Lizard", "Skink"],
    correctAnswer: 0,
    explanation: "The Gila monster is one of only two venomous lizards in the world.",
    difficulty: "easy",
    category: "reptiles",
    type: "text"
  },
  {
    id: 15,
    question: "How do sea turtles navigate across oceans?",
    options: ["By stars", "By smell", "By Earth's magnetic field", "By water temperature"],
    correctAnswer: 2,
    explanation: "Sea turtles use Earth's magnetic field to navigate long distances and return to their birthplace.",
    difficulty: "easy",
    category: "reptiles",
    type: "text"
  },

  // EASY - FISH
  {
    id: 16,
    question: "What is the largest fish in the ocean?",
    options: ["Great White Shark", "Whale Shark", "Blue Whale", "Manta Ray"],
    correctAnswer: 1,
    explanation: "The whale shark can grow up to 18 meters (60 feet) long and is a filter feeder.",
    difficulty: "easy",
    category: "fish",
    type: "text"
  },
  {
    id: 17,
    question: "Which fish can inflate itself when threatened?",
    options: ["Clownfish", "Pufferfish", "Goldfish", "Tuna"],
    correctAnswer: 1,
    explanation: "Pufferfish inflate by swallowing water to appear larger and more intimidating to predators.",
    difficulty: "easy",
    category: "fish",
    type: "text"
  },
  {
    id: 18,
    question: "What do electric eels use electricity for?",
    options: ["Lighting", "Navigation and stunning prey", "Communication only", "Keeping warm"],
    correctAnswer: 1,
    explanation: "Electric eels produce electric shocks of up to 600 volts to navigate, communicate, and stun prey.",
    difficulty: "easy",
    category: "fish",
    type: "text"
  },
  {
    id: 19,
    question: "Which fish is known for swimming upstream to spawn?",
    options: ["Salmon", "Trout", "Bass", "Catfish"],
    correctAnswer: 0,
    explanation: "Salmon swim upstream to their birthplace to spawn, then typically die after reproducing.",
    difficulty: "easy",
    category: "fish",
    type: "text"
  },
  {
    id: 20,
    question: "What is unique about seahorses?",
    options: ["They can fly", "Males carry and give birth to babies", "They have no bones", "They live for 100 years"],
    correctAnswer: 1,
    explanation: "Male seahorses have a brood pouch where they carry fertilized eggs until birth.",
    difficulty: "easy",
    category: "fish",
    type: "text"
  },

  // MEDIUM - MAMMALS
  {
    id: 21,
    question: "Which mammal has the longest gestation period?",
    options: ["Giraffe", "Elephant", "Whale", "Rhinoceros"],
    correctAnswer: 1,
    explanation: "Elephants have a gestation period of about 22 months, the longest of any land mammal.",
    difficulty: "medium",
    category: "mammals",
    type: "text"
  },
  {
    id: 22,
    question: "What is unique about platypus reproduction?",
    options: ["They lay eggs", "They give birth to live young", "They reproduce asexually", "Males give birth"],
    correctAnswer: 0,
    explanation: "The platypus is one of only five species of monotremes (egg-laying mammals).",
    difficulty: "medium",
    category: "mammals",
    type: "text"
  },
  {
    id: 23,
    question: "How many hearts does an octopus have?",
    options: ["One", "Two", "Three", "Four"],
    correctAnswer: 2,
    explanation: "Octopuses have three hearts: two pump blood to the gills, and one pumps blood to the rest of the body.",
    difficulty: "medium",
    category: "marine",
    type: "text"
  },
  {
    id: 24,
    question: "Which animal has the longest migration?",
    options: ["Monarch Butterfly", "Arctic Tern", "Gray Whale", "Caribou"],
    correctAnswer: 1,
    explanation: "Arctic terns migrate about 71,000 km (44,000 miles) annually from Arctic to Antarctic and back.",
    difficulty: "medium",
    category: "birds",
    type: "text"
  },
  {
    id: 25,
    question: "What percentage of a polar bear's diet is made up of seals?",
    options: ["30%", "50%", "75%", "90%"],
    correctAnswer: 3,
    explanation: "Seals make up about 90% of a polar bear's diet, providing the fat they need to survive.",
    difficulty: "medium",
    category: "mammals",
    type: "text"
  },

  // MEDIUM - BIRDS
  {
    id: 26,
    question: "Which bird has the largest wingspan?",
    options: ["Albatross", "Condor", "Eagle", "Pelican"],
    correctAnswer: 0,
    explanation: "The wandering albatross has the largest wingspan of any bird, reaching up to 3.5 meters (11.5 feet).",
    difficulty: "medium",
    category: "birds",
    type: "text"
  },
  {
    id: 27,
    question: "How do owls hunt silently?",
    options: ["Special feathers", "Slow flying", "Small size", "Night vision"],
    correctAnswer: 0,
    explanation: "Owls have specialized feathers with fringed edges that muffle sound, allowing silent flight.",
    difficulty: "medium",
    category: "birds",
    type: "text"
  },
  {
    id: 28,
    question: "What is unique about penguin vision underwater?",
    options: ["They can't see underwater", "Excellent color vision", "They can see in the dark", "They can see ultraviolet light"],
    correctAnswer: 1,
    explanation: "Penguins have exceptional underwater color vision, helping them hunt fish effectively.",
    difficulty: "medium",
    category: "birds",
    type: "text"
  },
  {
    id: 29,
    question: "How many species of birds of paradise exist?",
    options: ["12", "26", "42", "58"],
    correctAnswer: 2,
    explanation: "There are 42 species of birds of paradise, known for their elaborate courtship displays.",
    difficulty: "medium",
    category: "birds",
    type: "text"
  },
  {
    id: 30,
    question: "Which bird can dive the deepest?",
    options: ["Penguin", "Cormorant", "Emperor Penguin", "Loon"],
    correctAnswer: 2,
    explanation: "Emperor penguins can dive to depths of over 500 meters (1,640 feet).",
    difficulty: "medium",
    category: "birds",
    type: "text"
  },

  // MEDIUM - MARINE
  {
    id: 31,
    question: "What is the most venomous marine animal?",
    options: ["Box Jellyfish", "Stonefish", "Blue-ringed Octopus", "Cone Snail"],
    correctAnswer: 0,
    explanation: "The box jellyfish is considered the most venomous marine animal, with toxins that can kill a human in minutes.",
    difficulty: "medium",
    category: "marine",
    type: "text"
  },
  {
    id: 32,
    question: "How do dolphins sleep?",
    options: ["Fully unconscious", "With one eye open", "Only one brain hemisphere at a time", "They don't sleep"],
    correctAnswer: 2,
    explanation: "Dolphins practice unihemispheric slow-wave sleep, keeping one half of the brain awake to breathe.",
    difficulty: "medium",
    category: "marine",
    type: "text"
  },
  {
    id: 33,
    question: "What percentage of ocean species are still undiscovered?",
    options: ["10-20%", "30-40%", "50-60%", "80-90%"],
    correctAnswer: 3,
    explanation: "Scientists estimate that 80-90% of ocean species remain undiscovered.",
    difficulty: "medium",
    category: "marine",
    type: "text"
  },
  {
    id: 34,
    question: "How fast can a sailfish swim?",
    options: ["40 km/h", "68 km/h", "110 km/h", "130 km/h"],
    correctAnswer: 2,
    explanation: "Sailfish can swim at speeds up to 110 km/h (68 mph), making them the fastest fish.",
    difficulty: "medium",
    category: "fish",
    type: "text"
  },
  {
    id: 35,
    question: "What is bioluminescence primarily used for in deep-sea creatures?",
    options: ["Photosynthesis", "Attracting prey and communication", "Keeping warm", "Navigation only"],
    correctAnswer: 1,
    explanation: "Deep-sea creatures use bioluminescence to attract prey, communicate, and avoid predators.",
    difficulty: "medium",
    category: "marine",
    type: "text"
  },

  // HARD - ALL CATEGORIES
  {
    id: 36,
    question: "What is the only bird that can fly backwards?",
    options: ["Hummingbird", "Kingfisher", "Swift", "Woodpecker"],
    correctAnswer: 0,
    explanation: "Hummingbirds are the only birds capable of sustained backward flight.",
    difficulty: "hard",
    category: "birds",
    type: "text"
  },
  {
    id: 37,
    question: "How many chambers does a crocodile's heart have?",
    options: ["Two", "Three", "Four", "Five"],
    correctAnswer: 2,
    explanation: "Crocodiles have a four-chambered heart like mammals and birds, unique among reptiles.",
    difficulty: "hard",
    category: "reptiles",
    type: "text"
  },
  {
    id: 38,
    question: "What is the lifespan of a Greenland shark?",
    options: ["50 years", "100 years", "300 years", "400+ years"],
    correctAnswer: 3,
    explanation: "Greenland sharks can live for over 400 years, making them the longest-living vertebrates.",
    difficulty: "hard",
    category: "fish",
    type: "text"
  },
  {
    id: 39,
    question: "Which animal has the highest blood pressure?",
    options: ["Elephant", "Giraffe", "Blue Whale", "Rhinoceros"],
    correctAnswer: 1,
    explanation: "Giraffes have blood pressure about twice that of humans to pump blood to their brain.",
    difficulty: "hard",
    category: "mammals",
    type: "text"
  },
  {
    id: 40,
    question: "How many species go extinct every day?",
    options: ["1-5", "10-20", "50-150", "200-300"],
    correctAnswer: 2,
    explanation: "Scientists estimate that 50-150 species go extinct every day, mostly due to habitat loss.",
    difficulty: "hard",
    category: "all",
    type: "text"
  },
  {
    id: 41,
    question: "What is the only mammal capable of true flight?",
    options: ["Flying Squirrel", "Sugar Glider", "Bat", "Flying Lemur"],
    correctAnswer: 2,
    explanation: "Bats are the only mammals capable of true sustained flight (gliding doesn't count).",
    difficulty: "hard",
    category: "mammals",
    type: "text"
  },
  {
    id: 42,
    question: "Which bird has the best memory?",
    options: ["Parrot", "Crow", "Clark's Nutcracker", "Owl"],
    correctAnswer: 2,
    explanation: "Clark's nutcracker can remember the locations of thousands of seed caches for up to 9 months.",
    difficulty: "hard",
    category: "birds",
    type: "text"
  },
  {
    id: 43,
    question: "How long can a sperm whale hold its breath?",
    options: ["15 minutes", "30 minutes", "60 minutes", "90 minutes"],
    correctAnswer: 3,
    explanation: "Sperm whales can hold their breath for up to 90 minutes while diving to hunt squid.",
    difficulty: "hard",
    category: "marine",
    type: "text"
  },
  {
    id: 44,
    question: "What is the bite force of a great white shark in PSI?",
    options: ["1,200", "2,400", "4,000", "6,000"],
    correctAnswer: 2,
    explanation: "Great white sharks have a bite force of about 4,000 PSI, incredibly powerful but not the strongest.",
    difficulty: "hard",
    category: "fish",
    type: "text"
  },
  {
    id: 45,
    question: "Which reptile can survive freezing?",
    options: ["Garter Snake", "Wood Frog", "Box Turtle", "Painted Turtle"],
    correctAnswer: 3,
    explanation: "Painted turtles can survive with up to 65% of their body water frozen during winter.",
    difficulty: "hard",
    category: "reptiles",
    type: "text"
  },
  {
    id: 46,
    question: "How many teeth does a great white shark have?",
    options: ["50", "150", "300", "500"],
    correctAnswer: 2,
    explanation: "Great white sharks have about 300 teeth arranged in multiple rows, constantly being replaced.",
    difficulty: "hard",
    category: "fish",
    type: "text"
  },
  {
    id: 47,
    question: "What percentage of their body weight can ants lift?",
    options: ["10x", "25x", "50x", "100x"],
    correctAnswer: 2,
    explanation: "Ants can lift 50 times their own body weight, making them incredibly strong for their size.",
    difficulty: "hard",
    category: "all",
    type: "text"
  },
  {
    id: 48,
    question: "How many species of sharks exist?",
    options: ["100", "300", "500", "1000"],
    correctAnswer: 2,
    explanation: "There are over 500 known species of sharks, ranging from tiny dwarf lanternsharks to whale sharks.",
    difficulty: "hard",
    category: "fish",
    type: "text"
  },
  {
    id: 49,
    question: "What is the deepest diving mammal?",
    options: ["Elephant Seal", "Sperm Whale", "Beaked Whale", "Orca"],
    correctAnswer: 2,
    explanation: "Cuvier's beaked whale holds the record, diving to nearly 3,000 meters (9,800 feet).",
    difficulty: "hard",
    category: "mammals",
    type: "text"
  },
  {
    id: 50,
    question: "How many bones does a shark have?",
    options: ["50", "100", "200", "Zero"],
    correctAnswer: 3,
    explanation: "Sharks have zero bones - their skeletons are made entirely of cartilage.",
    difficulty: "hard",
    category: "fish",
    type: "text"
  },

  // IMAGE-BASED QUESTIONS (to be loaded dynamically with Unsplash images)
  {
    id: 51,
    question: "What animal is this?",
    options: ["Lion", "Tiger", "Leopard", "Cheetah"],
    correctAnswer: 1,
    explanation: "Tigers have distinctive stripes and are the largest cat species.",
    difficulty: "medium",
    category: "mammals",
    type: "image",
    imageQuery: "tiger"
  },
  {
    id: 52,
    question: "Identify this bird:",
    options: ["Eagle", "Hawk", "Falcon", "Owl"],
    correctAnswer: 0,
    explanation: "Eagles are large birds of prey with powerful beaks and talons.",
    difficulty: "medium",
    category: "birds",
    type: "image",
    imageQuery: "bald eagle"
  },

  // SOUND-BASED QUESTIONS (to be loaded with Xeno-Canto sounds)
  {
    id: 53,
    question: "Which animal makes this sound?",
    options: ["Wolf", "Coyote", "Dog", "Fox"],
    correctAnswer: 0,
    explanation: "Wolves have distinctive howls used for communication and territorial claims.",
    difficulty: "medium",
    category: "mammals",
    type: "sound",
    soundAnimal: "wolf"
  },
  {
    id: 54,
    question: "Identify this bird call:",
    options: ["Robin", "Blue Jay", "Cardinal", "Sparrow"],
    correctAnswer: 1,
    explanation: "Blue jays have a variety of calls including loud, harsh jeers.",
    difficulty: "medium",
    category: "birds",
    type: "sound",
    soundAnimal: "blue jay"
  }
];

// Helper functions for filtering questions
export const getQuestionsByDifficulty = (difficulty: QuizDifficulty): QuizQuestion[] => {
  return quizQuestions.filter(q => q.difficulty === difficulty);
};

export const getQuestionsByCategory = (category: QuizCategory): QuizQuestion[] => {
  if (category === 'all') return quizQuestions;
  return quizQuestions.filter(q => q.category === category || q.category === 'all');
};

export const getQuestionsByType = (type: QuizQuestionType): QuizQuestion[] => {
  return quizQuestions.filter(q => q.type === type);
};

export const getFilteredQuestions = (
  difficulty?: QuizDifficulty,
  category?: QuizCategory,
  type?: QuizQuestionType
): QuizQuestion[] => {
  let filtered = [...quizQuestions];

  if (difficulty) {
    filtered = filtered.filter(q => q.difficulty === difficulty);
  }

  if (category && category !== 'all') {
    filtered = filtered.filter(q => q.category === category || q.category === 'all');
  }

  if (type) {
    filtered = filtered.filter(q => q.type === type);
  }

  return filtered;
};

// Shuffle helper
export const shuffleQuestions = (questions: QuizQuestion[]): QuizQuestion[] => {
  const shuffled = [...questions];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Get random questions
export const getRandomQuestions = (count: number, filters?: {
  difficulty?: QuizDifficulty;
  category?: QuizCategory;
  type?: QuizQuestionType;
}): QuizQuestion[] => {
  const filtered = getFilteredQuestions(filters?.difficulty, filters?.category, filters?.type);
  const shuffled = shuffleQuestions(filtered);
  return shuffled.slice(0, Math.min(count, shuffled.length));
};

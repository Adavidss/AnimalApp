export type FactCategory = 'anatomy' | 'behavior' | 'records' | 'surprising' | 'history' | 'adaptation';

export interface AnimalFact {
  id: number;
  fact: string;
  category: FactCategory;
  animal?: string;
  verified: boolean;
}

export const animalFacts: AnimalFact[] = [
  // ANATOMY FACTS
  {
    id: 1,
    fact: "A snail can sleep for three years straight during unfavorable weather conditions.",
    category: "anatomy",
    animal: "Snail",
    verified: true
  },
  {
    id: 2,
    fact: "Octopuses have three hearts: two pump blood to the gills, and one pumps it to the rest of the body.",
    category: "anatomy",
    animal: "Octopus",
    verified: true
  },
  {
    id: 3,
    fact: "A giraffe's tongue is about 20 inches (50 cm) long and is black to prevent sunburn.",
    category: "anatomy",
    animal: "Giraffe",
    verified: true
  },
  {
    id: 4,
    fact: "Polar bears have black skin underneath their white fur to better absorb heat from the sun.",
    category: "anatomy",
    animal: "Polar Bear",
    verified: true
  },
  {
    id: 5,
    fact: "A flamingo can only eat when its head is upside down due to the special filters in its beak.",
    category: "anatomy",
    animal: "Flamingo",
    verified: true
  },
  {
    id: 6,
    fact: "Sharks have been around for over 400 million years, predating dinosaurs by 200 million years.",
    category: "anatomy",
    animal: "Shark",
    verified: true
  },
  {
    id: 7,
    fact: "A blue whale's heart is so large that a human could swim through its arteries.",
    category: "anatomy",
    animal: "Blue Whale",
    verified: true
  },
  {
    id: 8,
    fact: "Hummingbird hearts beat up to 1,200 times per minute during flight.",
    category: "anatomy",
    animal: "Hummingbird",
    verified: true
  },
  {
    id: 9,
    fact: "A crocodile cannot stick its tongue out because it's attached to the roof of its mouth.",
    category: "anatomy",
    animal: "Crocodile",
    verified: true
  },
  {
    id: 10,
    fact: "Starfish don't have brains, yet they can regenerate lost arms and even grow a whole new body from a single arm.",
    category: "anatomy",
    animal: "Starfish",
    verified: true
  },

  // BEHAVIOR FACTS
  {
    id: 11,
    fact: "Sea otters hold hands while sleeping to prevent drifting apart from their group.",
    category: "behavior",
    animal: "Sea Otter",
    verified: true
  },
  {
    id: 12,
    fact: "Crows can recognize individual human faces and hold grudges against people who have wronged them.",
    category: "behavior",
    animal: "Crow",
    verified: true
  },
  {
    id: 13,
    fact: "Dolphins have names for each other and call out to specific individuals.",
    category: "behavior",
    animal: "Dolphin",
    verified: true
  },
  {
    id: 14,
    fact: "Elephants are the only animals that can't jump, but they can stand on their hind legs.",
    category: "behavior",
    animal: "Elephant",
    verified: true
  },
  {
    id: 15,
    fact: "Penguins propose to their mates by giving them a pebble.",
    category: "behavior",
    animal: "Penguin",
    verified: true
  },
  {
    id: 16,
    fact: "Cats spend 70% of their lives sleeping, which is about 13-16 hours a day.",
    category: "behavior",
    animal: "Cat",
    verified: true
  },
  {
    id: 17,
    fact: "Squirrels plant thousands of new trees each year by forgetting where they buried their acorns.",
    category: "behavior",
    animal: "Squirrel",
    verified: true
  },
  {
    id: 18,
    fact: "Bees do a 'waggle dance' to communicate the location of flowers to other bees in the hive.",
    category: "behavior",
    animal: "Bee",
    verified: true
  },
  {
    id: 19,
    fact: "Male seahorses carry and give birth to their babies, not the females.",
    category: "behavior",
    animal: "Seahorse",
    verified: true
  },
  {
    id: 20,
    fact: "Wolves howl to communicate with their pack over long distances, not at the moon.",
    category: "behavior",
    animal: "Wolf",
    verified: true
  },

  // RECORDS (World's Biggest, Fastest, etc.)
  {
    id: 21,
    fact: "The cheetah is the fastest land animal, reaching speeds up to 70 mph (112 km/h).",
    category: "records",
    animal: "Cheetah",
    verified: true
  },
  {
    id: 22,
    fact: "The Greenland shark can live for over 400 years, making it the longest-living vertebrate.",
    category: "records",
    animal: "Greenland Shark",
    verified: true
  },
  {
    id: 23,
    fact: "The blue whale is the largest animal ever known to have existed, weighing up to 200 tons.",
    category: "records",
    animal: "Blue Whale",
    verified: true
  },
  {
    id: 24,
    fact: "The peregrine falcon is the fastest animal in the world, diving at speeds over 240 mph (386 km/h).",
    category: "records",
    animal: "Peregrine Falcon",
    verified: true
  },
  {
    id: 25,
    fact: "The mantis shrimp has the world's fastest punch, striking in just 0.0023 seconds.",
    category: "records",
    animal: "Mantis Shrimp",
    verified: true
  },
  {
    id: 26,
    fact: "The Etruscan shrew is the smallest mammal by weight, weighing less than a penny.",
    category: "records",
    animal: "Etruscan Shrew",
    verified: true
  },
  {
    id: 27,
    fact: "An ostrich egg is the largest cell in the world, weighing about 3 pounds.",
    category: "records",
    animal: "Ostrich",
    verified: true
  },
  {
    id: 28,
    fact: "The saltwater crocodile has the strongest bite force of any animal, at over 3,700 PSI.",
    category: "records",
    animal: "Saltwater Crocodile",
    verified: true
  },
  {
    id: 29,
    fact: "The Arctic tern migrates the longest distance of any animal, about 44,000 miles annually.",
    category: "records",
    animal: "Arctic Tern",
    verified: true
  },
  {
    id: 30,
    fact: "The box jellyfish has the deadliest venom of any creature, capable of killing a human in minutes.",
    category: "records",
    animal: "Box Jellyfish",
    verified: true
  },

  // SURPRISING FACTS
  {
    id: 31,
    fact: "Butterflies can taste with their feet to determine if a plant is suitable for laying eggs.",
    category: "surprising",
    animal: "Butterfly",
    verified: true
  },
  {
    id: 32,
    fact: "A group of flamingos is called a 'flamboyance.'",
    category: "surprising",
    animal: "Flamingo",
    verified: true
  },
  {
    id: 33,
    fact: "Koalas have fingerprints that are nearly identical to human fingerprints.",
    category: "surprising",
    animal: "Koala",
    verified: true
  },
  {
    id: 34,
    fact: "Hippos produce red 'blood sweat' that acts as sunscreen and antibiotic.",
    category: "surprising",
    animal: "Hippopotamus",
    verified: true
  },
  {
    id: 35,
    fact: "A group of porcupines is called a 'prickle.'",
    category: "surprising",
    animal: "Porcupine",
    verified: true
  },
  {
    id: 36,
    fact: "Sloths can hold their breath longer than dolphins—up to 40 minutes.",
    category: "surprising",
    animal: "Sloth",
    verified: true
  },
  {
    id: 37,
    fact: "Wombat poop is cube-shaped to prevent it from rolling away and mark territory.",
    category: "surprising",
    animal: "Wombat",
    verified: true
  },
  {
    id: 38,
    fact: "Frogs can freeze solid in winter and thaw out in spring, completely unharmed.",
    category: "surprising",
    animal: "Frog",
    verified: true
  },
  {
    id: 39,
    fact: "Axolotls can regenerate entire limbs, organs, and even parts of their brain.",
    category: "surprising",
    animal: "Axolotl",
    verified: true
  },
  {
    id: 40,
    fact: "A tiger's roar can be heard from up to 2 miles away.",
    category: "surprising",
    animal: "Tiger",
    verified: true
  },

  // HISTORY & EVOLUTION
  {
    id: 41,
    fact: "Cleopatra lived closer in time to the first Moon landing than to the building of the Great Pyramids. Interestingly, sharks are older than both.",
    category: "history",
    animal: "Shark",
    verified: true
  },
  {
    id: 42,
    fact: "The last woolly mammoths died out around 4,000 years ago, after the pyramids were built.",
    category: "history",
    animal: "Woolly Mammoth",
    verified: true
  },
  {
    id: 43,
    fact: "Dogs were the first animals to be domesticated by humans, over 15,000 years ago.",
    category: "history",
    animal: "Dog",
    verified: true
  },
  {
    id: 44,
    fact: "The dodo bird went extinct in the 1600s, less than 100 years after humans discovered it.",
    category: "history",
    animal: "Dodo",
    verified: true
  },
  {
    id: 45,
    fact: "Coelacanths were thought to be extinct for 65 million years until one was caught in 1938.",
    category: "history",
    animal: "Coelacanth",
    verified: true
  },

  // ADAPTATIONS
  {
    id: 46,
    fact: "Camels can drink up to 40 gallons of water in one sitting to prepare for desert journeys.",
    category: "adaptation",
    animal: "Camel",
    verified: true
  },
  {
    id: 47,
    fact: "Chameleons change color not just for camouflage, but also to regulate temperature and communicate emotions.",
    category: "adaptation",
    animal: "Chameleon",
    verified: true
  },
  {
    id: 48,
    fact: "Electric eels can produce shocks of up to 600 volts to stun prey and defend themselves.",
    category: "adaptation",
    animal: "Electric Eel",
    verified: true
  },
  {
    id: 49,
    fact: "Tardigrades (water bears) can survive in extreme conditions including the vacuum of space.",
    category: "adaptation",
    animal: "Tardigrade",
    verified: true
  },
  {
    id: 50,
    fact: "Spiders use hydraulic pressure to move their legs, as they don't have muscles in them.",
    category: "adaptation",
    animal: "Spider",
    verified: true
  },

  // MORE ANATOMY FACTS
  {
    id: 51,
    fact: "Giraffes have the same number of neck bones as humans—just seven, but each is much longer.",
    category: "anatomy",
    animal: "Giraffe",
    verified: true
  },
  {
    id: 52,
    fact: "A kangaroo can't walk backwards due to its large tail and muscular legs.",
    category: "anatomy",
    animal: "Kangaroo",
    verified: true
  },
  {
    id: 53,
    fact: "Owls can rotate their heads 270 degrees in either direction.",
    category: "anatomy",
    animal: "Owl",
    verified: true
  },
  {
    id: 54,
    fact: "Woodpeckers' tongues wrap around their skulls to protect their brains from impact.",
    category: "anatomy",
    animal: "Woodpecker",
    verified: true
  },
  {
    id: 55,
    fact: "A cat has 32 muscles in each ear, allowing them to rotate their ears 180 degrees.",
    category: "anatomy",
    animal: "Cat",
    verified: true
  },
  {
    id: 56,
    fact: "Snakes can see through their eyelids because they don't have eyelids—they have a transparent scale instead.",
    category: "anatomy",
    animal: "Snake",
    verified: true
  },
  {
    id: 57,
    fact: "Horses and cows can sleep standing up by locking their legs in place.",
    category: "anatomy",
    animal: "Horse",
    verified: true
  },
  {
    id: 58,
    fact: "A dog's sense of smell is 40 times better than a human's.",
    category: "anatomy",
    animal: "Dog",
    verified: true
  },
  {
    id: 59,
    fact: "Bats are the only mammals that can truly fly.",
    category: "anatomy",
    animal: "Bat",
    verified: true
  },
  {
    id: 60,
    fact: "A shrimp's heart is located in its head.",
    category: "anatomy",
    animal: "Shrimp",
    verified: true
  },

  // MORE BEHAVIOR FACTS
  {
    id: 61,
    fact: "Gorillas can learn sign language and communicate with humans.",
    category: "behavior",
    animal: "Gorilla",
    verified: true
  },
  {
    id: 62,
    fact: "Ravens can learn to mimic human speech better than some parrots.",
    category: "behavior",
    animal: "Raven",
    verified: true
  },
  {
    id: 63,
    fact: "Elephants mourn their dead and have been observed holding 'funerals.'",
    category: "behavior",
    animal: "Elephant",
    verified: true
  },
  {
    id: 64,
    fact: "Rats laugh when tickled and enjoy playing with each other.",
    category: "behavior",
    animal: "Rat",
    verified: true
  },
  {
    id: 65,
    fact: "Pigs are as intelligent as 3-year-old human children and can play video games.",
    category: "behavior",
    animal: "Pig",
    verified: true
  },
  {
    id: 66,
    fact: "Beavers' teeth never stop growing, so they must constantly gnaw on wood to keep them short.",
    category: "behavior",
    animal: "Beaver",
    verified: true
  },
  {
    id: 67,
    fact: "Ants never sleep and can carry objects 50 times their own body weight.",
    category: "behavior",
    animal: "Ant",
    verified: true
  },
  {
    id: 68,
    fact: "Turtles can breathe through their butts using a process called cloacal respiration.",
    category: "behavior",
    animal: "Turtle",
    verified: true
  },
  {
    id: 69,
    fact: "Goats have rectangular pupils that give them a 320-degree field of vision.",
    category: "behavior",
    animal: "Goat",
    verified: true
  },
  {
    id: 70,
    fact: "Lobsters can regenerate their claws, legs, and antennae if they lose them.",
    category: "behavior",
    animal: "Lobster",
    verified: true
  },

  // MORE SURPRISING FACTS
  {
    id: 71,
    fact: "Cows have best friends and get stressed when separated from them.",
    category: "surprising",
    animal: "Cow",
    verified: true
  },
  {
    id: 72,
    fact: "A group of owls is called a 'parliament.'",
    category: "surprising",
    animal: "Owl",
    verified: true
  },
  {
    id: 73,
    fact: "Honeybees can recognize human faces.",
    category: "surprising",
    animal: "Honeybee",
    verified: true
  },
  {
    id: 74,
    fact: "Pigeons can do math at a level similar to monkeys.",
    category: "surprising",
    animal: "Pigeon",
    verified: true
  },
  {
    id: 75,
    fact: "Reindeer eyeballs turn blue in winter to help them see in low light.",
    category: "surprising",
    animal: "Reindeer",
    verified: true
  },
  {
    id: 76,
    fact: "Cats only meow to communicate with humans, not with other cats.",
    category: "surprising",
    animal: "Cat",
    verified: true
  },
  {
    id: 77,
    fact: "Zebra stripes are like fingerprints—no two zebras have the same pattern.",
    category: "surprising",
    animal: "Zebra",
    verified: true
  },
  {
    id: 78,
    fact: "Lobsters were once so abundant that they were fed to prisoners and considered 'poor man's food.'",
    category: "surprising",
    animal: "Lobster",
    verified: true
  },
  {
    id: 79,
    fact: "Dragonflies have been around for over 300 million years, making them one of the oldest insects.",
    category: "surprising",
    animal: "Dragonfly",
    verified: true
  },
  {
    id: 80,
    fact: "The immortal jellyfish can revert to its juvenile form after reaching maturity, potentially living forever.",
    category: "surprising",
    animal: "Immortal Jellyfish",
    verified: true
  },

  // MORE RECORDS
  {
    id: 81,
    fact: "The sperm whale has the largest brain of any animal, weighing up to 20 pounds.",
    category: "records",
    animal: "Sperm Whale",
    verified: true
  },
  {
    id: 82,
    fact: "The tongue of a blue whale can weigh as much as an elephant.",
    category: "records",
    animal: "Blue Whale",
    verified: true
  },
  {
    id: 83,
    fact: "An ant can lift 5,000 times its own body weight.",
    category: "records",
    animal: "Ant",
    verified: true
  },
  {
    id: 84,
    fact: "The Goliath birdeater spider can have a leg span of up to 12 inches.",
    category: "records",
    animal: "Goliath Birdeater",
    verified: true
  },
  {
    id: 85,
    fact: "Hummingbirds can flap their wings up to 80 times per second.",
    category: "records",
    animal: "Hummingbird",
    verified: true
  },
  {
    id: 86,
    fact: "A sailfish can swim faster than 68 mph, making it the fastest fish in the ocean.",
    category: "records",
    animal: "Sailfish",
    verified: true
  },
  {
    id: 87,
    fact: "The Cuvier's beaked whale can dive deeper than any other mammal, reaching depths of nearly 10,000 feet.",
    category: "records",
    animal: "Cuvier's Beaked Whale",
    verified: true
  },
  {
    id: 88,
    fact: "Elephants are pregnant for 22 months, the longest gestation period of any land animal.",
    category: "records",
    animal: "Elephant",
    verified: true
  },
  {
    id: 89,
    fact: "A flea can jump 200 times its body height, equivalent to a human jumping over the Empire State Building.",
    category: "records",
    animal: "Flea",
    verified: true
  },
  {
    id: 90,
    fact: "The wandering albatross has the largest wingspan of any bird, reaching up to 11.5 feet.",
    category: "records",
    animal: "Wandering Albatross",
    verified: true
  },

  // MORE ADAPTATIONS
  {
    id: 91,
    fact: "Penguins can drink seawater because they have a gland that filters out the salt.",
    category: "adaptation",
    animal: "Penguin",
    verified: true
  },
  {
    id: 92,
    fact: "Platypuses are one of the few venomous mammals, with males having poisonous spurs on their hind legs.",
    category: "adaptation",
    animal: "Platypus",
    verified: true
  },
  {
    id: 93,
    fact: "Naked mole rats are immune to cancer and can survive without oxygen for 18 minutes.",
    category: "adaptation",
    animal: "Naked Mole Rat",
    verified: true
  },
  {
    id: 94,
    fact: "Geckos can stick to walls thanks to millions of tiny hairs on their feet.",
    category: "adaptation",
    animal: "Gecko",
    verified: true
  },
  {
    id: 95,
    fact: "Bioluminescent jellyfish create their own light through chemical reactions in their bodies.",
    category: "adaptation",
    animal: "Jellyfish",
    verified: true
  },
  {
    id: 96,
    fact: "Arctic foxes change their coat color from brown in summer to white in winter for camouflage.",
    category: "adaptation",
    animal: "Arctic Fox",
    verified: true
  },
  {
    id: 97,
    fact: "Leafy sea dragons look exactly like floating seaweed to hide from predators.",
    category: "adaptation",
    animal: "Leafy Sea Dragon",
    verified: true
  },
  {
    id: 98,
    fact: "Desert tortoises can store water in their bladder for months during droughts.",
    category: "adaptation",
    animal: "Desert Tortoise",
    verified: true
  },
  {
    id: 99,
    fact: "Mimic octopuses can impersonate over 15 different marine species to avoid predators.",
    category: "adaptation",
    animal: "Mimic Octopus",
    verified: true
  },
  {
    id: 100,
    fact: "Flying fish can glide above water for up to 650 feet using their wing-like fins.",
    category: "adaptation",
    animal: "Flying Fish",
    verified: true
  },

  // BONUS FACTS
  {
    id: 101,
    fact: "A group of hedgehogs is called an 'array.'",
    category: "surprising",
    animal: "Hedgehog",
    verified: true
  },
  {
    id: 102,
    fact: "Otters have a favorite rock that they keep in a pocket of skin under their arm to crack open shells.",
    category: "behavior",
    animal: "Otter",
    verified: true
  },
  {
    id: 103,
    fact: "Baby elephants suck their trunks for comfort, just like human babies suck their thumbs.",
    category: "behavior",
    animal: "Elephant",
    verified: true
  },
  {
    id: 104,
    fact: "Cuttlefish have W-shaped pupils and can see polarized light invisible to humans.",
    category: "anatomy",
    animal: "Cuttlefish",
    verified: true
  },
  {
    id: 105,
    fact: "Pandas spend 12-16 hours a day eating bamboo and poop up to 40 times daily.",
    category: "behavior",
    animal: "Panda",
    verified: true
  }
];

// Helper functions
export function getRandomFact(): AnimalFact {
  return animalFacts[Math.floor(Math.random() * animalFacts.length)];
}

export function getFactsByCategory(category: FactCategory): AnimalFact[] {
  return animalFacts.filter(fact => fact.category === category);
}

export function getFactsByAnimal(animalName: string): AnimalFact[] {
  return animalFacts.filter(fact =>
    fact.animal?.toLowerCase().includes(animalName.toLowerCase())
  );
}

export function getRandomFactByCategory(category: FactCategory): AnimalFact | null {
  const facts = getFactsByCategory(category);
  return facts.length > 0 ? facts[Math.floor(Math.random() * facts.length)] : null;
}

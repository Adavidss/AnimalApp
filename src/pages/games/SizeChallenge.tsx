import { useState, useEffect, useCallback } from 'react';
import { fetchUnsplashImages } from '../../api/images';
import { SizeBar } from '../../components/games/SizeBar';
import {
  saveHighScore,
  getHighScore,
  playSound,
  incrementGamePlayCount
} from '../../utils/gameHelpers';

type Difficulty = 'easy' | 'medium' | 'hard';
type ComparisonType = 'weight' | 'height' | 'length';

interface AnimalSize {
  name: string;
  weight: number; // in kg
  height: number; // in cm
  length: number; // in cm
  image?: string;
}

// Animal size database
const ANIMAL_SIZES: AnimalSize[] = [
  // Small animals
  { name: 'Mouse', weight: 0.02, height: 5, length: 10 },
  { name: 'Hamster', weight: 0.15, height: 7, length: 15 },
  { name: 'Rat', weight: 0.35, height: 10, length: 25 },
  { name: 'Guinea Pig', weight: 1.0, height: 20, length: 30 },
  { name: 'Rabbit', weight: 3.5, height: 30, length: 45 },
  { name: 'Cat', weight: 5.0, height: 25, length: 50 },
  { name: 'Chihuahua', weight: 2.5, height: 20, length: 25 },
  { name: 'Koala', weight: 10, height: 75, length: 80 },
  { name: 'Raccoon', weight: 8, height: 30, length: 60 },
  { name: 'Fox', weight: 6.5, height: 40, length: 70 },

  // Medium animals
  { name: 'Dog', weight: 30, height: 60, length: 90 },
  { name: 'Cheetah', weight: 65, height: 80, length: 150 },
  { name: 'Leopard', weight: 70, height: 70, length: 180 },
  { name: 'Wolf', weight: 45, height: 85, length: 160 },
  { name: 'Deer', weight: 90, height: 120, length: 180 },
  { name: 'Puma', weight: 80, height: 75, length: 180 },
  { name: 'Dolphin', weight: 150, height: 75, length: 250 },
  { name: 'Gorilla', weight: 180, height: 170, length: 180 },
  { name: 'Lion', weight: 190, height: 110, length: 250 },
  { name: 'Tiger', weight: 220, height: 110, length: 310 },

  // Large animals
  { name: 'Polar Bear', weight: 450, height: 160, length: 260 },
  { name: 'Horse', weight: 500, height: 160, length: 240 },
  { name: 'Grizzly Bear', weight: 360, height: 135, length: 210 },
  { name: 'Buffalo', weight: 900, height: 170, length: 340 },
  { name: 'Giraffe', weight: 1200, height: 550, length: 600 },
  { name: 'Hippopotamus', weight: 1500, height: 150, length: 400 },
  { name: 'Rhinoceros', weight: 2300, height: 180, length: 380 },
  { name: 'Elephant', weight: 5500, height: 320, length: 650 },
  { name: 'Whale Shark', weight: 18000, height: 200, length: 1200 },
  { name: 'Blue Whale', weight: 150000, height: 400, length: 3000 },

  // Birds
  { name: 'Hummingbird', weight: 0.003, height: 8, length: 10 },
  { name: 'Sparrow', weight: 0.03, height: 12, length: 15 },
  { name: 'Robin', weight: 0.08, height: 20, length: 25 },
  { name: 'Pigeon', weight: 0.35, height: 32, length: 35 },
  { name: 'Chicken', weight: 2.5, height: 40, length: 50 },
  { name: 'Eagle', weight: 5.5, height: 90, length: 100 },
  { name: 'Penguin', weight: 25, height: 110, length: 115 },
  { name: 'Emu', weight: 45, height: 180, length: 190 },
  { name: 'Ostrich', weight: 120, height: 250, length: 270 },

  // Reptiles
  { name: 'Gecko', weight: 0.05, height: 5, length: 15 },
  { name: 'Chameleon', weight: 0.2, height: 15, length: 30 },
  { name: 'Turtle', weight: 15, height: 30, length: 40 },
  { name: 'Iguana', weight: 5, height: 40, length: 180 },
  { name: 'Komodo Dragon', weight: 70, height: 60, length: 300 },
  { name: 'Python', weight: 90, height: 30, length: 600 },
  { name: 'Anaconda', weight: 250, height: 35, length: 900 },
  { name: 'Crocodile', weight: 1000, height: 80, length: 600 },
  { name: 'Saltwater Crocodile', weight: 1200, height: 100, length: 700 }
];

const ROUNDS_PER_GAME = 10;

interface GameRound {
  animal1: AnimalSize;
  animal2: AnimalSize;
  comparisonType: ComparisonType;
}

export default function SizeChallenge() {
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [gameStarted, setGameStarted] = useState(false);
  const [currentRound, setCurrentRound] = useState(0);
  const [rounds, setRounds] = useState<GameRound[]>([]);
  const [userAnswer, setUserAnswer] = useState<1 | 2 | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [streak, setStreak] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScoreState] = useState<{ score: number; date?: string } | null>(null);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  // Load high score
  useEffect(() => {
    const saved = getHighScore('size_challenge');
    setHighScoreState(saved);
  }, []);

  const getAnimalsByDifficulty = useCallback((diff: Difficulty): AnimalSize[] => {
    switch (diff) {
      case 'easy':
        // Large differences in size
        return ANIMAL_SIZES.filter(a =>
          a.weight < 1 || a.weight > 100
        );
      case 'medium':
        // Medium differences
        return ANIMAL_SIZES;
      case 'hard':
        // Similar sizes - hardest to compare (filter to animals with similar sizes)
        return ANIMAL_SIZES.filter(a => {
          // Include animals that might be similar in at least one dimension
          const similarWeight = ANIMAL_SIZES.some(other => 
            other.name !== a.name && 
            Math.max(a.weight, other.weight) / Math.min(a.weight, other.weight) < 2
          );
          return similarWeight;
        });
    }
  }, []);

  const generateRounds = useCallback((diff: Difficulty): GameRound[] => {
    const animals = getAnimalsByDifficulty(diff);
    const rounds: GameRound[] = [];
    const comparisonTypes: ComparisonType[] = ['weight', 'height', 'length'];
    const usedPairs = new Set<string>(); // Track used animal pairs for variety

    for (let i = 0; i < ROUNDS_PER_GAME; i++) {
      // Select two random animals with variety
      const shuffled = [...animals].sort(() => Math.random() - 0.5);
      let animal1 = shuffled[0];
      let animal2 = shuffled[1];
      let attempts = 0;
      const maxAttempts = 50;

      // For hard mode, select similar-sized animals (much harder)
      if (diff === 'hard') {
        // Try to find pairs with very similar sizes (1.1 to 1.5x difference)
        const similarPairs: Array<{a1: AnimalSize, a2: AnimalSize, ratio: number}> = [];
        for (let j = 0; j < shuffled.length - 1; j++) {
          for (let k = j + 1; k < shuffled.length; k++) {
            const ratio = Math.max(shuffled[j].weight, shuffled[k].weight) /
                         Math.min(shuffled[j].weight, shuffled[k].weight);
            if (ratio < 1.5 && ratio > 1.1) {
              const pairKey = [shuffled[j].name, shuffled[k].name].sort().join('|');
              if (!usedPairs.has(pairKey)) {
                similarPairs.push({a1: shuffled[j], a2: shuffled[k], ratio});
              }
            }
          }
        }
        // Sort by ratio (closer = harder) and pick from top candidates
        if (similarPairs.length > 0) {
          similarPairs.sort((a, b) => a.ratio - b.ratio);
          const selected = similarPairs[Math.floor(Math.random() * Math.min(5, similarPairs.length))];
          animal1 = selected.a1;
          animal2 = selected.a2;
          usedPairs.add([animal1.name, animal2.name].sort().join('|'));
        }
      }
      
      // For medium mode, make it moderately challenging with variety
      if (diff === 'medium') {
        // Try to find pairs with moderate differences (1.5 to 3x difference) - closer than before
        const moderatePairs: Array<{a1: AnimalSize, a2: AnimalSize, ratio: number}> = [];
        for (let j = 0; j < shuffled.length - 1; j++) {
          for (let k = j + 1; k < shuffled.length; k++) {
            const ratio = Math.max(shuffled[j].weight, shuffled[k].weight) /
                         Math.min(shuffled[j].weight, shuffled[k].weight);
            if (ratio < 3 && ratio > 1.5) {
              const pairKey = [shuffled[j].name, shuffled[k].name].sort().join('|');
              if (!usedPairs.has(pairKey)) {
                moderatePairs.push({a1: shuffled[j], a2: shuffled[k], ratio});
              }
            }
          }
        }
        if (moderatePairs.length > 0) {
          moderatePairs.sort((a, b) => a.ratio - b.ratio);
          const selected = moderatePairs[Math.floor(Math.random() * Math.min(8, moderatePairs.length))];
          animal1 = selected.a1;
          animal2 = selected.a2;
          usedPairs.add([animal1.name, animal2.name].sort().join('|'));
        }
      }

      // For easy mode, still avoid using the same pairs repeatedly
      if (diff === 'easy') {
        while (attempts < maxAttempts) {
          const pairKey = [animal1.name, animal2.name].sort().join('|');
          if (!usedPairs.has(pairKey)) {
            usedPairs.add(pairKey);
            break;
          }
          // Try different random pair
          const newShuffled = [...animals].sort(() => Math.random() - 0.5);
          animal1 = newShuffled[0];
          animal2 = newShuffled[1];
          attempts++;
        }
      }

      // Randomly select comparison type
      const comparisonType = comparisonTypes[Math.floor(Math.random() * comparisonTypes.length)];

      rounds.push({
        animal1,
        animal2,
        comparisonType
      });
    }

    return rounds;
  }, [getAnimalsByDifficulty]);

  const startGame = useCallback(async () => {
    setLoading(true);
    setGameStarted(false);
    setGameWon(false);
    setCurrentRound(0);
    setCorrect(0);
    setStreak(0);
    setScore(0);
    setImageErrors(new Set()); // Reset image errors

    try {
      const gameRounds = generateRounds(difficulty);

      // Fetch images for all animals in parallel for faster loading
      const imagePromises = gameRounds.map(async (round) => {
        try {
          // Add timeout to prevent hanging
          const timeoutPromise = new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('timeout')), 3000)
          );

          // Fix mouse search to get actual mouse, not computer mouse or invertebrate
          const searchQuery1 = round.animal1.name === 'Mouse' ? 'house mouse animal' : round.animal1.name;
          const searchQuery2 = round.animal2.name === 'Mouse' ? 'house mouse animal' : round.animal2.name;

          // Fetch images for both animals in parallel
          const [images1Result, images2Result] = await Promise.allSettled([
            Promise.race([fetchUnsplashImages(searchQuery1, 1), timeoutPromise]),
            Promise.race([fetchUnsplashImages(searchQuery2, 1), timeoutPromise])
          ]);
          
          // Try multiple image URL sizes with better fallbacks
          if (images1Result.status === 'fulfilled' && images1Result.value[0]) {
            round.animal1.image = images1Result.value[0]?.urls?.small || 
                                  images1Result.value[0]?.urls?.thumb || 
                                  images1Result.value[0]?.urls?.regular || '';
          }
          
          if (images2Result.status === 'fulfilled' && images2Result.value[0]) {
            round.animal2.image = images2Result.value[0]?.urls?.small || 
                                  images2Result.value[0]?.urls?.thumb || 
                                  images2Result.value[0]?.urls?.regular || '';
          }
          
          // If still no image, try with timeout and different query
          if (!round.animal1.image && round.animal1.name) {
            try {
              const fallbackImages = await Promise.race([
                fetchUnsplashImages(round.animal1.name, 1),
                new Promise<typeof fetchUnsplashImages extends (...args: any[]) => Promise<infer T> ? T : never>((_, reject) => 
                  setTimeout(() => reject(new Error('timeout')), 2000)
                )
              ]);
              if (fallbackImages?.[0]) {
                round.animal1.image = fallbackImages[0]?.urls?.small || 
                                     fallbackImages[0]?.urls?.thumb || 
                                     fallbackImages[0]?.urls?.regular || '';
              }
            } catch (e) {
              // Keep empty image
            }
          }
          
          if (!round.animal2.image && round.animal2.name) {
            try {
              const fallbackImages = await Promise.race([
                fetchUnsplashImages(round.animal2.name, 1),
                new Promise<typeof fetchUnsplashImages extends (...args: any[]) => Promise<infer T> ? T : never>((_, reject) => 
                  setTimeout(() => reject(new Error('timeout')), 2000)
                )
              ]);
              if (fallbackImages?.[0]) {
                round.animal2.image = fallbackImages[0]?.urls?.small || 
                                     fallbackImages[0]?.urls?.thumb || 
                                     fallbackImages[0]?.urls?.regular || '';
              }
            } catch (e) {
              // Keep empty image
            }
          }
        } catch (error) {
          console.error('Failed to fetch images:', error);
          // Keep going even if images fail - game can still work
        }
      });

      // Wait for all images to load in parallel
      await Promise.all(imagePromises);

      setRounds(gameRounds);
      setGameStarted(true);
    } catch (error) {
      console.error('Failed to start game:', error);
      alert('Failed to load game. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [difficulty, generateRounds]);

  const handleAnswer = (answer: 1 | 2) => {
    if (showResult) return;

    const round = rounds[currentRound];
    const compType = round.comparisonType;
    const val1 = round.animal1[compType];
    const val2 = round.animal2[compType];
    const correctAnswer = (val1 > val2) ? 1 : 2;
    const isCorrect = answer === correctAnswer;

    setUserAnswer(answer);
    setShowResult(true);

    if (isCorrect) {
      setCorrect(prev => prev + 1);
      setStreak(prev => prev + 1);
      playSound('match');
    } else {
      setStreak(0);
      playSound('wrong');
    }

    // Auto-advance
    setTimeout(() => {
      if (currentRound < ROUNDS_PER_GAME - 1) {
        setCurrentRound(prev => prev + 1);
        setUserAnswer(null);
        setShowResult(false);
      } else {
        endGame();
      }
    }, 3000);
  };

  const endGame = () => {
    const accuracy = (correct / ROUNDS_PER_GAME) * 100;
    const finalScore = Math.round(
      accuracy * 10 + // Up to 1000 points for accuracy
      (streak * 100) // Streak bonus
    );

    setScore(finalScore);
    setGameWon(true);

    saveHighScore('size_challenge', finalScore, {
      difficulty,
      correct,
      accuracy: accuracy.toFixed(1)
    });

    const currentHigh = getHighScore('size_challenge');
    if (currentHigh && currentHigh.score > (highScore?.score || 0)) {
      setHighScoreState(currentHigh);
    }

    playSound('win');
    incrementGamePlayCount('size_challenge');
  };

  const getDifficultyColor = (diff: Difficulty) => {
    switch (diff) {
      case 'easy':
        return 'bg-green-500 hover:bg-green-600';
      case 'medium':
        return 'bg-yellow-500 hover:bg-yellow-600';
      case 'hard':
        return 'bg-red-500 hover:bg-red-600';
    }
  };

  const getComparisonLabel = (type: ComparisonType) => {
    switch (type) {
      case 'weight':
        return 'heavier';
      case 'height':
        return 'taller';
      case 'length':
        return 'longer';
    }
  };

  const getComparisonUnit = (type: ComparisonType) => {
    switch (type) {
      case 'weight':
        return 'kg';
      case 'height':
      case 'length':
        return 'cm';
    }
  };

  // Start screen
  if (!gameStarted && !loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-8">
            <div className="text-8xl mb-4">📏</div>
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Size Challenge
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Guess which animal is larger, taller, or heavier!
            </p>
          </div>

          {/* High Score */}
          {highScore && highScore.score > 0 && (
            <div className="bg-gradient-to-r from-blue-400 to-purple-500 rounded-xl p-6 shadow-lg mb-8 text-center">
              <div className="text-white">
                <div className="text-sm font-medium mb-1">High Score</div>
                <div className="text-4xl font-bold">{highScore.score}</div>
              </div>
            </div>
          )}

          {/* Difficulty Selection */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              Choose Difficulty
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(['easy', 'medium', 'hard'] as Difficulty[]).map(diff => {
                const isSelected = difficulty === diff;

                return (
                  <button
                    key={diff}
                    onClick={() => setDifficulty(diff)}
                    className={`p-6 rounded-lg transition-all ${
                      isSelected
                        ? getDifficultyColor(diff) + ' text-white scale-105'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:scale-105'
                    }`}
                  >
                    <div className="text-3xl mb-2">
                      {diff === 'easy' ? '😊' : diff === 'medium' ? '🤔' : '🔥'}
                    </div>
                    <div className="font-bold text-xl capitalize mb-2">{diff}</div>
                    <div className={`text-sm ${isSelected ? 'text-white/90' : 'text-gray-600 dark:text-gray-400'}`}>
                      {diff === 'easy' && 'Large size differences'}
                      {diff === 'medium' && 'Moderate differences'}
                      {diff === 'hard' && 'Very similar sizes'}
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              onClick={startGame}
              className="w-full mt-8 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold rounded-lg transition-colors shadow-lg hover:shadow-xl"
            >
              Start Game
            </button>
          </div>

          {/* How to Play */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              How to Play
            </h3>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
              <li className="flex items-start gap-2">
                <span>1️⃣</span>
                <span>Two animals will be shown</span>
              </li>
              <li className="flex items-start gap-2">
                <span>2️⃣</span>
                <span>Read the question: which is heavier, taller, or longer?</span>
              </li>
              <li className="flex items-start gap-2">
                <span>3️⃣</span>
                <span>Click on the animal you think is larger</span>
              </li>
              <li className="flex items-start gap-2">
                <span>4️⃣</span>
                <span>See the actual sizes revealed with visual bars</span>
              </li>
              <li className="flex items-start gap-2">
                <span>🏆</span>
                <span>Complete {ROUNDS_PER_GAME} rounds to finish!</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // Loading screen
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">📏</div>
          <div className="text-xl text-gray-600 dark:text-gray-400">
            Loading animal data...
          </div>
        </div>
      </div>
    );
  }

  // Win screen
  if (gameWon) {
    const accuracy = (correct / ROUNDS_PER_GAME) * 100;

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-center mb-8">
            <div className="text-8xl mb-4">🏆</div>
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Challenge Complete!
            </h1>
            <p className="text-2xl text-gray-600 dark:text-gray-400">
              Great size estimation!
            </p>
          </div>

          {/* Score Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg mb-6">
            <div className="text-center mb-6">
              <div className="text-6xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                {score}
              </div>
              <div className="text-lg text-gray-700 dark:text-gray-300">
                Final Score
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {correct}/{ROUNDS_PER_GAME}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Correct</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {accuracy.toFixed(0)}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Accuracy</div>
              </div>
            </div>

            {highScore && score > highScore.score && (
              <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-center">
                <div className="text-yellow-700 dark:text-yellow-400 font-bold">
                  🎉 New High Score!
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={startGame}
              className="flex-1 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold rounded-lg transition-colors shadow-lg hover:shadow-xl"
            >
              Play Again
            </button>
            <button
              onClick={() => {
                setGameStarted(false);
                setGameWon(false);
              }}
              className="flex-1 px-8 py-4 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white text-lg font-bold rounded-lg transition-colors"
            >
              Change Difficulty
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Game screen
  const round = rounds[currentRound];
  if (!round) return null;

  const comparisonType = round.comparisonType;
  const val1 = round.animal1[comparisonType];
  const val2 = round.animal2[comparisonType];
  const correctAnswer = (val1 > val2) ? 1 : 2;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => {
                if (confirm('Are you sure you want to quit? Your progress will be lost.')) {
                  setGameStarted(false);
                }
              }}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-colors"
            >
              ← Quit
            </button>

            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {currentRound + 1}/{ROUNDS_PER_GAME}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Round</div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {correct}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Correct</div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {streak}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Streak</div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentRound + 1) / ROUNDS_PER_GAME) * 100}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg mb-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-2">
            Which animal is {getComparisonLabel(comparisonType)}?
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-400">
            Click on your answer
          </p>
        </div>

        {/* Answer Buttons */}
        {!showResult && (
          <div className="grid grid-cols-2 gap-6 mb-8">
            <button
              onClick={() => handleAnswer(1)}
              className="p-6 bg-white dark:bg-gray-800 hover:bg-purple-50 dark:hover:bg-purple-900/20 border-2 border-gray-200 dark:border-gray-600 hover:border-purple-500 rounded-xl transition-all"
            >
              {round.animal1.image && !imageErrors.has(`animal1-${currentRound}`) ? (
                <img
                  src={round.animal1.image}
                  alt={round.animal1.name}
                  className="w-full h-48 object-contain rounded-lg mb-4 bg-gray-100 dark:bg-gray-700"
                  onError={() => {
                    setImageErrors(prev => new Set(prev).add(`animal1-${currentRound}`));
                  }}
                />
              ) : (
                <div className="w-full h-48 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-white text-2xl font-bold text-center px-2">
                    {round.animal1.name}
                  </span>
                </div>
              )}
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {round.animal1.name}
              </h3>
            </button>

            <button
              onClick={() => handleAnswer(2)}
              className="p-6 bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 border-2 border-gray-200 dark:border-gray-600 hover:border-blue-500 rounded-xl transition-all"
            >
              {round.animal2.image && !imageErrors.has(`animal2-${currentRound}`) ? (
                <img
                  src={round.animal2.image}
                  alt={round.animal2.name}
                  className="w-full h-48 object-contain rounded-lg mb-4 bg-gray-100 dark:bg-gray-700"
                  onError={() => {
                    setImageErrors(prev => new Set(prev).add(`animal2-${currentRound}`));
                  }}
                />
              ) : (
                <div className="w-full h-48 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-white text-2xl font-bold text-center px-2">
                    {round.animal2.name}
                  </span>
                </div>
              )}
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {round.animal2.name}
              </h3>
            </button>
          </div>
        )}

        {/* Size Comparison */}
        {showResult && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg">
            <SizeBar
              animal1={{
                name: round.animal1.name,
                size: val1,
                image: round.animal1.image
              }}
              animal2={{
                name: round.animal2.name,
                size: val2,
                image: round.animal2.image
              }}
              unit={getComparisonUnit(comparisonType)}
              showResult={showResult}
              correctAnswer={correctAnswer}
              userAnswer={userAnswer}
            />
          </div>
        )}
      </div>
    </div>
  );
}

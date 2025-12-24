import { useState, useEffect, useCallback } from 'react';
import { FlipCard } from '../../components/games/FlipCard';
import { fetchUnsplashImages } from '../../api/images';
import { getRandomAnimal } from '../../api/animals';
import { useAnimal } from '../../context/AnimalContext';
import {
  generateMemoryPairs,
  formatTime,
  calculateScore,
  saveHighScore,
  getHighScore,
  playSound,
  getGridSize,
  incrementGamePlayCount
} from '../../utils/gameHelpers';

type Difficulty = 'easy' | 'medium' | 'hard';

interface Card {
  id: string;
  imageUrl: string;
  animalName: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const ANIMALS_FOR_GAME = [
  'Lion', 'Tiger', 'Elephant', 'Giraffe', 'Zebra', 'Panda',
  'Koala', 'Kangaroo', 'Penguin', 'Dolphin', 'Eagle', 'Owl'
];

export default function MemoryMatch() {
  const { enrichAnimal } = useAnimal();
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [gameStarted, setGameStarted] = useState(false);
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<string[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [timeSeconds, setTimeSeconds] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScoreState] = useState<{ score: number; date?: string } | null>(null);

  // Timer
  useEffect(() => {
    if (!gameStarted || gameWon) return;

    const interval = setInterval(() => {
      setTimeSeconds(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [gameStarted, gameWon]);

  // Load high score
  useEffect(() => {
    const saved = getHighScore('memory_match');
    setHighScoreState(saved);
  }, []);

  // Check if game is won
  useEffect(() => {
    if (cards.length > 0 && matchedPairs.length === cards.length / 2) {
      const gridSize = getGridSize(difficulty);
      const perfectMoves = gridSize.pairs;
      const finalScore = calculateScore(moves, timeSeconds, perfectMoves);

      setScore(finalScore);
      setGameWon(true);

      // Save high score
      saveHighScore('memory_match', finalScore, {
        difficulty,
        moves,
        time: timeSeconds
      });

      // Update high score display if new record
      const currentHigh = getHighScore('memory_match');
      if (currentHigh && currentHigh.score > (highScore?.score || 0)) {
        setHighScoreState(currentHigh);
      }

      playSound('win');
      incrementGamePlayCount('memory_match');
    }
  }, [matchedPairs, cards, difficulty, moves, timeSeconds, highScore]);

  // Handle card flip
  useEffect(() => {
    if (flippedCards.length === 2) {
      const [first, second] = flippedCards;
      const firstCard = cards.find(c => c.id === first);
      const secondCard = cards.find(c => c.id === second);

      if (firstCard && secondCard && firstCard.animalName === secondCard.animalName) {
        // Match found!
        playSound('match');
        setMatchedPairs(prev => [...prev, firstCard.animalName]);
        setCards(prev =>
          prev.map(card =>
            card.id === first || card.id === second
              ? { ...card, isMatched: true }
              : card
          )
        );
        setFlippedCards([]);
      } else {
        // No match
        playSound('wrong');
        setTimeout(() => {
          setCards(prev =>
            prev.map(card =>
              card.id === first || card.id === second
                ? { ...card, isFlipped: false }
                : card
            )
          );
          setFlippedCards([]);
        }, 1000);
      }

      setMoves(prev => prev + 1);
    }
  }, [flippedCards, cards]);

  const startGame = useCallback(async () => {
    setIsLoading(true);
    setGameStarted(false);
    setGameWon(false);
    setMoves(0);
    setTimeSeconds(0);
    setMatchedPairs([]);
    setFlippedCards([]);
    setScore(0);

    try {
      // Get grid configuration based on difficulty
      const gridSize = getGridSize(difficulty);
      const animalCount = gridSize.pairs;

      // Fetch animal images with better fallback logic
      const selectedAnimals = ANIMALS_FOR_GAME.slice(0, animalCount);
      const animalCards: Array<{ animalName: string; imageUrl: string }> = [];

      // Use enrichAnimal for better image loading with multiple sources
      for (const animalName of selectedAnimals) {
        try {
          // First try to get random animal data (includes scientific name)
          const animal = await getRandomAnimal();
          if (!animal) {
            // Fallback to using animal name directly
            const images = await fetchUnsplashImages(animalName, 1);
            const imageUrl = images[0]?.urls?.small || images[0]?.urls?.thumb || images[0]?.urls?.regular || '';
            if (imageUrl) {
              animalCards.push({ animalName, imageUrl });
            }
          } else {
            // Use enrichAnimal which tries multiple sources (iNaturalist, Unsplash, etc.)
            const enriched = await enrichAnimal(animalName, animal.taxonomy?.scientific_name || animalName);
            if (enriched) {
              // Try multiple image sources
              let imageUrl = '';
              
              // Priority 1: enriched images (from iNaturalist/Unsplash)
              if (enriched.images && enriched.images.length > 0) {
                imageUrl = enriched.images[0]?.urls?.small || 
                          enriched.images[0]?.urls?.thumb || 
                          enriched.images[0]?.urls?.regular || '';
              }
              
              // Priority 2: Wikipedia thumbnail
              if (!imageUrl && enriched.wikipedia?.thumbnail?.source) {
                imageUrl = enriched.wikipedia.thumbnail.source;
              }
              
              // Priority 3: Fallback to fetchUnsplashImages directly
              if (!imageUrl) {
                try {
                  const images = await fetchUnsplashImages(animalName, 1, animal.taxonomy?.scientific_name);
                  imageUrl = images[0]?.urls?.small || images[0]?.urls?.thumb || images[0]?.urls?.regular || '';
                } catch (e) {
                  console.debug(`Failed to fetch image for ${animalName}:`, e);
                }
              }
              
              if (imageUrl) {
                animalCards.push({ animalName, imageUrl });
              }
            }
          }
        } catch (error) {
          console.error(`Failed to load image for ${animalName}:`, error);
          // Try direct Unsplash fetch as last resort
          try {
            const images = await fetchUnsplashImages(animalName, 1);
            const imageUrl = images[0]?.urls?.small || images[0]?.urls?.thumb || images[0]?.urls?.regular || '';
            if (imageUrl) {
              animalCards.push({ animalName, imageUrl });
            }
          } catch (e) {
            console.debug(`All image sources failed for ${animalName}`);
          }
        }
      }

      // Ensure we have enough cards (retry if needed)
      if (animalCards.length < animalCount) {
        const missing = animalCount - animalCards.length;
        const additionalAnimals = ANIMALS_FOR_GAME.slice(animalCount, animalCount + missing * 2);
        for (const animalName of additionalAnimals) {
          if (animalCards.length >= animalCount) break;
          
          try {
            const images = await fetchUnsplashImages(animalName, 1);
            const imageUrl = images[0]?.urls?.small || images[0]?.urls?.thumb || images[0]?.urls?.regular || '';
            if (imageUrl && !animalCards.find(c => c.animalName === animalName)) {
              animalCards.push({ animalName, imageUrl });
            }
          } catch (e) {
            // Skip this animal
          }
        }
      }

      if (animalCards.length === 0) {
        throw new Error('No images could be loaded. Please check your internet connection.');
      }

      // Generate pairs and shuffle
      const cardPairs = generateMemoryPairs(animalCards, Math.min(animalCards.length, animalCount));

      // Create card objects with unique IDs
      const gameCards: Card[] = cardPairs.map((card, index) => ({
        id: `${card.animalName}-${index}`,
        imageUrl: card.imageUrl,
        animalName: card.animalName,
        isFlipped: false,
        isMatched: false
      }));

      setCards(gameCards);
      setGameStarted(true);
    } catch (error) {
      console.error('Failed to load game:', error);
      alert('Failed to load game images. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [difficulty]);

  const handleCardClick = (cardId: string) => {
    if (flippedCards.length >= 2) return;
    if (flippedCards.includes(cardId)) return;

    playSound('flip');

    setCards(prev =>
      prev.map(card =>
        card.id === cardId ? { ...card, isFlipped: true } : card
      )
    );

    setFlippedCards(prev => [...prev, cardId]);
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

  const getGridClass = () => {
    const gridSize = getGridSize(difficulty);
    // Make square grid - use same number of rows and cols
    return `grid-cols-${gridSize.cols} gap-3 md:gap-4`;
  };

  // Start screen
  if (!gameStarted && !isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-8">
            <div className="text-8xl mb-4">🎴</div>
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Memory Match
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Flip cards to find matching animal pairs!
            </p>
          </div>

          {/* High Score */}
          {highScore && highScore.score > 0 && (
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl p-6 shadow-lg mb-8 text-center">
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
                const gridSize = getGridSize(diff);
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
                      {gridSize.pairs} pairs ({gridSize.rows}×{gridSize.cols})
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              onClick={startGame}
              className="w-full mt-8 px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white text-lg font-bold rounded-lg transition-colors shadow-lg hover:shadow-xl"
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
                <span>Click on any card to flip it over</span>
              </li>
              <li className="flex items-start gap-2">
                <span>2️⃣</span>
                <span>Click on a second card to try to find a match</span>
              </li>
              <li className="flex items-start gap-2">
                <span>3️⃣</span>
                <span>Match all pairs in the fewest moves and fastest time!</span>
              </li>
              <li className="flex items-start gap-2">
                <span>🏆</span>
                <span>Your score is based on speed and accuracy</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // Loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🎴</div>
          <div className="text-xl text-gray-600 dark:text-gray-400">
            Loading game...
          </div>
        </div>
      </div>
    );
  }

  // Win screen
  if (gameWon) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-center mb-8">
            <div className="text-8xl mb-4">🏆</div>
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
              You Won!
            </h1>
            <p className="text-2xl text-gray-600 dark:text-gray-400">
              Great memory skills!
            </p>
          </div>

          {/* Score Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg mb-6">
            <div className="text-center mb-6">
              <div className="text-6xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                {score}
              </div>
              <div className="text-lg text-gray-700 dark:text-gray-300">
                Final Score
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {moves}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Moves</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {formatTime(timeSeconds)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Time</div>
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
              className="flex-1 px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white text-lg font-bold rounded-lg transition-colors shadow-lg hover:shadow-xl"
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
  const gridSize = getGridSize(difficulty);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Game Header */}
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
                  {moves}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Moves</div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatTime(timeSeconds)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Time</div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {matchedPairs.length}/{gridSize.pairs}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Pairs</div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(matchedPairs.length / gridSize.pairs) * 100}%` }}
            />
          </div>
        </div>

        {/* Cards Grid */}
        <div className={`grid ${getGridClass()} max-w-4xl mx-auto`}>
          {cards.map(card => (
            <FlipCard
              key={card.id}
              id={card.id}
              frontImage={card.imageUrl}
              frontText={card.animalName}
              isFlipped={card.isFlipped}
              isMatched={card.isMatched}
              onClick={() => handleCardClick(card.id)}
              disabled={flippedCards.length >= 2}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

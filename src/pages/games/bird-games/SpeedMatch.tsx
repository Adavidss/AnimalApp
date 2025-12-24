import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchINatSpecies } from '../../../api/inaturalist';
import Loader from '../../../components/Loader';

interface Bird {
  id: string;
  name: string;
  preferred_common_name?: string;
  sciName?: string;
  default_photo?: {
    medium_url?: string;
  };
}

export default function SpeedMatch() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [birds, setBirds] = useState<Bird[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [correct, setCorrect] = useState<string | null>(null);
  const [options, setOptions] = useState<Bird[]>([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameOver, setGameOver] = useState(false);
  const [imageError, setImageError] = useState(false);

  const loadGame = useCallback(async () => {
    setLoading(true);
    try {
      const allBirds = await searchINatSpecies('bird');
      if (allBirds.length < 10) {
        return;
      }

      // Get 10 random birds
      const selectedBirds: Bird[] = [];
      const used = new Set<string>();
      
      while (selectedBirds.length < 10) {
        const randomBird = allBirds[Math.floor(Math.random() * allBirds.length)];
        const birdId = String(randomBird.id || Math.random());
        if (!used.has(birdId)) {
          selectedBirds.push({
            id: birdId,
            name: randomBird.preferred_common_name || randomBird.name || 'Unknown Bird',
            preferred_common_name: randomBird.preferred_common_name || randomBird.name,
            sciName: randomBird.name,
            default_photo: randomBird.default_photo,
          });
          used.add(birdId);
        }
      }

      setBirds(selectedBirds);
      setCurrentIndex(0);
      setScore(0);
      setGameOver(false);
      setTimeLeft(30);
      loadRound(selectedBirds, 0);
    } catch (error) {
      console.error('Error loading game:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadRound = async (birdList: Bird[], index: number) => {
    if (index >= birdList.length) {
      setGameOver(true);
      return;
    }

    const currentBird = birdList[index];
    setCorrect(currentBird.name);

    // Generate 4 options (1 correct, 3 random)
    const allBirds = await searchINatSpecies('bird');
    const wrongBirds: Bird[] = [];
    const used = new Set([currentBird.id]);

    while (wrongBirds.length < 3) {
      const randomBird = allBirds[Math.floor(Math.random() * allBirds.length)];
      const birdId = String(randomBird.id || Math.random());
      const birdName = randomBird.preferred_common_name || randomBird.name || 'Unknown Bird';
      
      if (!used.has(birdId) && birdName !== currentBird.name) {
        wrongBirds.push({
          id: birdId,
          name: birdName,
          preferred_common_name: randomBird.preferred_common_name || randomBird.name,
          sciName: randomBird.name,
          default_photo: randomBird.default_photo,
        });
        used.add(birdId);
      }
    }

    const allOptions = [currentBird, ...wrongBirds].sort(() => Math.random() - 0.5);
    setOptions(allOptions);
    setSelected(null);
    setTimeLeft(30);
  };

  useEffect(() => {
    loadGame();
  }, [loadGame]);

  useEffect(() => {
    if (gameOver || loading || currentIndex >= birds.length) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Time's up - move to next round
          setCurrentIndex(prevIdx => {
            const nextIdx = prevIdx + 1;
            loadRound(birds, nextIdx);
            return nextIdx;
          });
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameOver, loading, currentIndex, birds]);

  const handleSelect = (birdName: string) => {
    if (selected) return;
    setSelected(birdName);

    if (birdName === correct) {
      setScore(prev => prev + 1);
      setTimeout(() => {
        const nextIdx = currentIndex + 1;
        setCurrentIndex(nextIdx);
        loadRound(birds, nextIdx);
      }, 1000);
    } else {
      setTimeout(() => {
        const nextIdx = currentIndex + 1;
        setCurrentIndex(nextIdx);
        loadRound(birds, nextIdx);
      }, 1500);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (gameOver) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Game Over!
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
                Final Score: <strong className="text-teal-600 dark:text-teal-400">{score}</strong> / {birds.length}
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={loadGame}
                  className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors"
                >
                  🔄 Play Again
                </button>
                <button
                  onClick={() => navigate('/games')}
                  className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                >
                  ← Back to Games
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentBird = birds[currentIndex];
  const imageUrl = currentBird?.default_photo?.medium_url || '';
  const showResult = selected !== null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                ⚡ Speed Match
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Match the bird as fast as you can!
              </p>
            </div>
            <button
              onClick={() => navigate('/games')}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
            >
              ← Back to Games
            </button>
          </div>

          {/* Stats */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
            <div className="flex justify-around items-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">Score: {score}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">Time: {timeLeft}s</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{currentIndex + 1} / {birds.length}</div>
              </div>
            </div>
          </div>

          {/* Game Content */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-6">
              Match the Bird!
            </h2>

            {imageUrl && !imageError ? (
              <img
                src={imageUrl}
                alt="Bird"
                className="max-w-md w-full mx-auto rounded-lg shadow-lg mb-8"
                onError={() => {
                  setImageError(true);
                }}
              />
            ) : currentBird ? (
              <div className="mb-8 w-full max-w-md mx-auto">
                <div className="w-full h-64 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg shadow-lg flex items-center justify-center">
                  <span className="text-white text-3xl font-bold text-center px-4">
                    {currentBird.name}
                  </span>
                </div>
              </div>
            ) : null}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {options.map((bird, index) => {
                const isSelected = selected === bird.name;
                const isCorrect = bird.name === correct;

                let bgClass = 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600';
                let textClass = 'text-gray-900 dark:text-white'; // Explicit text color for default state
                
                if (showResult) {
                  if (isCorrect) {
                    bgClass = 'bg-green-500';
                    textClass = 'text-white';
                  } else if (isSelected && !isCorrect) {
                    bgClass = 'bg-red-500';
                    textClass = 'text-white';
                  } else {
                    // Other options when result is shown but not selected
                    textClass = 'text-gray-700 dark:text-gray-300';
                  }
                }

                return (
                  <button
                    key={bird.id || index}
                    onClick={() => handleSelect(bird.name)}
                    disabled={showResult}
                    className={`p-6 rounded-lg font-medium text-lg transition-all ${bgClass} ${textClass} ${
                      showResult ? 'cursor-default' : 'cursor-pointer hover:scale-105'
                    }`}
                  >
                    <span className="font-semibold">{bird.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


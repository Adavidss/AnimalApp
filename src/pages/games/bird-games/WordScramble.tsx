import { useState, useEffect, useCallback, useRef } from 'react';
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

function scrambleWord(word: string): string {
  const letters = word.split('');
  for (let i = letters.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [letters[i], letters[j]] = [letters[j], letters[i]];
  }
  return letters.join('').toUpperCase();
}

export default function WordScramble() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [currentBird, setCurrentBird] = useState<Bird | null>(null);
  const [scrambled, setScrambled] = useState('');
  const [userInput, setUserInput] = useState('');
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [feedback, setFeedback] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const loadRandomBird = useCallback(async () => {
    setLoading(true);
    setUserInput('');
    setFeedback('');
    
    try {
      const birds = await searchINatSpecies('bird');
      if (birds.length === 0) {
        return;
      }

      const randomBird = birds[Math.floor(Math.random() * birds.length)];
      const bird: Bird = {
        id: String(randomBird.id || Math.random()),
        name: randomBird.preferred_common_name || randomBird.name || 'Unknown Bird',
        preferred_common_name: randomBird.preferred_common_name || randomBird.name,
        sciName: randomBird.name,
        default_photo: randomBird.default_photo,
      };

      setCurrentBird(bird);
      setScrambled(scrambleWord(bird.name));
      setRound(prev => prev + 1);
    } catch (error) {
      console.error('Error loading bird:', error);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, []);

  useEffect(() => {
    loadRandomBird();
  }, [loadRandomBird]);

  const checkAnswer = () => {
    if (!currentBird || !userInput.trim()) return;

    const correctName = currentBird.name.toLowerCase();
    const userAnswer = userInput.trim().toLowerCase();

    if (userAnswer === correctName) {
      setScore(prev => prev + 10);
      setFeedback(`✅ Correct! "${currentBird.name}" is the answer! (+10 points)`);
      
      setTimeout(() => {
        loadRandomBird();
      }, 2000);
    } else {
      setFeedback(`❌ Incorrect. Try again!`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      checkAnswer();
    }
  };

  const imageUrl = currentBird?.default_photo?.medium_url || '';

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                🔀 Word Scramble
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Unscramble the bird's name!
              </p>
            </div>
            <button
              onClick={() => navigate('/games')}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
            >
              ← Back to Games
            </button>
          </div>

          {/* Score Display */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8 text-center">
            <div className="flex justify-around">
              <div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{score}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Score</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{round}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Round</div>
              </div>
            </div>
          </div>

          {/* Game Content */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Round {round}
              </h2>
              
              {imageUrl && (
                <img
                  src={imageUrl}
                  alt={currentBird?.name}
                  className="max-w-md w-full mx-auto rounded-lg shadow-lg mb-6"
                />
              )}

              <div className="text-4xl font-bold text-teal-600 dark:text-teal-400 tracking-wider mb-6 p-6 bg-teal-50 dark:bg-teal-900/20 rounded-lg">
                {scrambled}
              </div>

              <input
                ref={inputRef}
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Unscramble the word..."
                className="w-full max-w-md mx-auto px-4 py-3 text-lg border-3 border-teal-500 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-center dark:bg-gray-700 dark:text-white"
                autoComplete="off"
              />

              {feedback && (
                <div className={`mt-4 p-4 rounded-lg ${
                  feedback.startsWith('✅') 
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-500'
                    : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                }`}>
                  {feedback}
                </div>
              )}

              <div className="mt-6 flex gap-4 justify-center">
                <button
                  onClick={checkAnswer}
                  className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors"
                >
                  ✓ Check Answer
                </button>
                <button
                  onClick={loadRandomBird}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  ⏭️ Skip
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


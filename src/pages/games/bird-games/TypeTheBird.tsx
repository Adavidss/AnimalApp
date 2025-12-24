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

export default function TypeTheBird() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [currentBird, setCurrentBird] = useState<Bird | null>(null);
  const [userInput, setUserInput] = useState('');
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadRandomBird = useCallback(async () => {
    setLoading(true);
    setUserInput('');
    setFeedback('');
    setStartTime(null);
    
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

    if (!startTime) {
      setStartTime(Date.now());
    }

    const correctName = currentBird.name.toLowerCase();
    const userAnswer = userInput.trim().toLowerCase();

    if (userAnswer === correctName) {
      const timeTaken = startTime ? ((Date.now() - startTime) / 1000) : 0;
      const points = Math.max(10, Math.floor(100 / (timeTaken || 1)));
      setScore(prev => prev + points);
      setFeedback(`✅ Correct! You typed it in ${timeTaken.toFixed(2)} seconds! (+${points} points)`);
      
      setTimeout(() => {
        loadRandomBird();
      }, 2000);
    } else if (correctName.startsWith(userAnswer)) {
      setFeedback(`Keep typing... "${userInput}" ✓`);
    } else {
      setFeedback(`❌ Incorrect. Keep trying!`);
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
                ⌨️ Type the Bird
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Type the bird's name as fast as you can!
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

              <input
                ref={inputRef}
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type bird name here..."
                className="w-full max-w-md mx-auto px-4 py-3 text-lg border-3 border-teal-500 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-center dark:bg-gray-700 dark:text-white"
                autoComplete="off"
              />

              {feedback && (
                <div className={`mt-4 p-4 rounded-lg ${
                  feedback.startsWith('✅') 
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-500'
                    : feedback.startsWith('Keep typing')
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
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
                  ⏭️ Next Bird
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


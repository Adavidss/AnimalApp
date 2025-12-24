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

export default function AlphabetChallenge() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [currentLetter, setCurrentLetter] = useState('');
  const [availableBirds, setAvailableBirds] = useState<Bird[]>([]);
  const [userInput, setUserInput] = useState('');
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [feedback, setFeedback] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const loadRound = useCallback(async () => {
    setLoading(true);
    setUserInput('');
    setFeedback('');
    
    try {
      // Pick a random letter
      const letter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
      setCurrentLetter(letter);

      // Get all birds
      const allBirds = await searchINatSpecies('bird');
      
      // Filter birds starting with that letter
      const birdsWithLetter = allBirds
        .filter(bird => {
          const name = (bird.preferred_common_name || bird.name || '').toUpperCase();
          return name.startsWith(letter);
        })
        .slice(0, 10)
        .map(bird => ({
          id: String(bird.id || Math.random()),
          name: bird.preferred_common_name || bird.name || 'Unknown Bird',
          preferred_common_name: bird.preferred_common_name || bird.name,
          sciName: bird.name,
          default_photo: bird.default_photo,
        }));

      // If no birds found for this letter, try another
      if (birdsWithLetter.length === 0) {
        const newLetter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
        setCurrentLetter(newLetter);
        const newBirds = allBirds
          .filter(bird => {
            const name = (bird.preferred_common_name || bird.name || '').toUpperCase();
            return name.startsWith(newLetter);
          })
          .slice(0, 10)
          .map(bird => ({
            id: String(bird.id || Math.random()),
            name: bird.preferred_common_name || bird.name || 'Unknown Bird',
            preferred_common_name: bird.preferred_common_name || bird.name,
            sciName: bird.name,
            default_photo: bird.default_photo,
          }));
        setAvailableBirds(newBirds);
      } else {
        setAvailableBirds(birdsWithLetter);
      }

      setRound(prev => prev + 1);
    } catch (error) {
      console.error('Error loading round:', error);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, []);

  useEffect(() => {
    loadRound();
  }, [loadRound]);

  const checkAnswer = () => {
    if (!userInput.trim()) {
      setFeedback('Please enter a bird name.');
      return;
    }

    const userUpper = userInput.trim().toUpperCase();
    const isValid = userUpper.startsWith(currentLetter) && 
                   availableBirds.some(bird => bird.name.toUpperCase() === userUpper);

    if (isValid) {
      setScore(prev => prev + 15);
      setFeedback(`✅ Correct! "${userInput}" is a valid bird! (+15 points)`);
      
      setTimeout(() => {
        loadRound();
      }, 2000);
    } else {
      setFeedback(`❌ Incorrect. Make sure the bird name starts with "${currentLetter}" and is a real bird.`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      checkAnswer();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  const exampleBirds = availableBirds.slice(0, 3).map(b => b.name).join(', ');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                🔤 Alphabet Challenge
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Name a bird that starts with the letter!
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
              
              <div className="text-8xl font-bold text-teal-600 dark:text-teal-400 mb-6">
                {currentLetter}
              </div>

              <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                Name a bird starting with <strong>{currentLetter}</strong>
              </p>

              {exampleBirds && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                  Examples: {exampleBirds}
                </p>
              )}

              <input
                ref={inputRef}
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Type bird name starting with ${currentLetter}...`}
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
                  onClick={loadRound}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  ⏭️ Next Letter
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


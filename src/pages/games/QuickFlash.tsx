import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRandomAnimal } from '../../api/animals';
import { useAnimal } from '../../context/AnimalContext';
import Loader from '../../components/Loader';

const FLASH_DURATION = 2000; // 2 seconds

export default function QuickFlash() {
  const navigate = useNavigate();
  const { enrichAnimal } = useAnimal();
  const [loading, setLoading] = useState(true);
  const [animal, setAnimal] = useState<any>(null);
  const [userInput, setUserInput] = useState('');
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [showImage, setShowImage] = useState(false);
  const [inputVisible, setInputVisible] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadAnimal = useCallback(async () => {
    setLoading(true);
    setUserInput('');
    setFeedback('');
    setShowImage(false);
    setInputVisible(false);

    try {
      const randomAnimal = await getRandomAnimal();
      if (!randomAnimal) return;

      const enriched = await enrichAnimal(randomAnimal.name, randomAnimal.taxonomy?.scientific_name || randomAnimal.name);
      if (!enriched) return;

      setAnimal(enriched);
      setRound(prev => prev + 1);

      // Show image after a brief delay
      setTimeout(() => {
        setShowImage(true);
      }, 300);

      // Hide image and show input after flash duration
      setTimeout(() => {
        setShowImage(false);
        setInputVisible(true);
        setTimeout(() => inputRef.current?.focus(), 100);
      }, FLASH_DURATION + 300);
    } catch (error) {
      console.error('Error loading animal:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAnimal();
  }, [loadAnimal]);

  const checkAnswer = () => {
    if (!animal || !userInput.trim()) return;

    const correctName = animal.name.toLowerCase();
    const userAnswer = userInput.trim().toLowerCase();

    if (userAnswer === correctName) {
      setScore(prev => prev + 20);
      setFeedback(`✅ Correct! It was "${animal.name}"! (+20 points)`);
      
      setTimeout(() => {
        loadAnimal();
      }, 2000);
    } else {
      setFeedback(`❌ Incorrect. The answer was "${animal.name}". Try again!`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      checkAnswer();
    }
  };

  const imageUrl = animal?.images?.[0]?.urls?.regular || animal?.images?.[0]?.urls?.small || '';

  if (loading && !animal) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                ⚡ Quick Flash
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                The animal will flash for 2 seconds. Remember it!
              </p>
            </div>
            <button
              onClick={() => navigate('/games')}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
            >
              ← Back
            </button>
          </div>

          {/* Score */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8 text-center">
            <div className="flex justify-around">
              <div>
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{score}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Score</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{round}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Round</div>
              </div>
            </div>
          </div>

          {/* Game Content */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            <div className="text-center min-h-[400px] flex flex-col items-center justify-center">
              {/* Flash Image */}
              {showImage && imageUrl && (
                <div className="animate-fade-in">
                  <img
                    src={imageUrl}
                    alt="Animal"
                    className="max-w-full h-64 md:h-96 mx-auto rounded-lg shadow-lg object-contain"
                  />
                </div>
              )}

              {/* Loading/Ready State */}
              {!showImage && !inputVisible && (
                <div className="text-gray-400 dark:text-gray-500">
                  <div className="text-6xl mb-4">👁️</div>
                  <p className="text-xl">Get ready...</p>
                </div>
              )}

              {/* Input Section */}
              {inputVisible && (
                <div className="w-full max-w-md">
                  <p className="text-xl font-medium text-gray-900 dark:text-white mb-6">
                    What animal was that?
                  </p>
                  <input
                    ref={inputRef}
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type animal name..."
                    className="w-full px-4 py-3 text-lg border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center dark:bg-gray-700 dark:text-white"
                    autoComplete="off"
                  />

                  {feedback && (
                    <div className={`mt-4 p-4 rounded-lg ${
                      feedback.startsWith('✅') 
                        ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                        : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                    }`}>
                      {feedback}
                    </div>
                  )}

                  <div className="mt-6">
                    <button
                      onClick={checkAnswer}
                      className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors mr-2"
                    >
                      ✓ Check Answer
                    </button>
                    <button
                      onClick={loadAnimal}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                    >
                      ⏭️ Next Flash
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


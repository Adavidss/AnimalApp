import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRandomAnimal } from '../../api/animals';
import { useAnimal } from '../../context/AnimalContext';
import Loader from '../../components/Loader';

export default function NameThatAnimal() {
  const navigate = useNavigate();
  const { enrichAnimal } = useAnimal();
  const [loading, setLoading] = useState(true);
  const [animal, setAnimal] = useState<any>(null);
  const [userInput, setUserInput] = useState('');
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [hints, setHints] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadAnimal = useCallback(async () => {
    setLoading(true);
    setUserInput('');
    setFeedback('');
    setHints([]);

    try {
      const randomAnimal = await getRandomAnimal();
      if (!randomAnimal) return;

      const enriched = await enrichAnimal(randomAnimal.name, randomAnimal.taxonomy?.scientific_name || randomAnimal.name);
      if (!enriched) return;

      setAnimal(enriched);
      
      // Generate hints
      const hintList: string[] = [];
      if (enriched.taxonomy?.class) hintList.push(`Class: ${enriched.taxonomy.class}`);
      if (enriched.characteristics?.habitat) hintList.push(`Habitat: ${enriched.characteristics.habitat}`);
      if (enriched.taxonomy?.order) hintList.push(`Order: ${enriched.taxonomy.order}`);
      if (enriched.taxonomy?.family) hintList.push(`Family: ${enriched.taxonomy.family}`);
      setHints(hintList.slice(0, 3));

      setRound(prev => prev + 1);
    } catch (error) {
      console.error('Error loading animal:', error);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
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
      setFeedback(`✅ Correct! It's a ${animal.name}! (+20 points)`);
      
      setTimeout(() => {
        loadAnimal();
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

  const imageUrl = animal?.images?.[0]?.urls?.regular || animal?.images?.[0]?.urls?.small || '';

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
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                🖼️ Name That Animal
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Identify the animal from its image!
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
            <div className="text-center">
              {imageUrl && (
                <img
                  src={imageUrl}
                  alt="Animal"
                  className="max-w-full h-64 md:h-96 mx-auto rounded-lg shadow-lg mb-6 object-contain"
                />
              )}

              {/* Hints */}
              {hints.length > 0 && (
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">Hints:</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {hints.map((hint, i) => (
                      <span key={i} className="px-3 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded-full text-sm">
                        {hint}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <input
                ref={inputRef}
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="What animal is this?"
                className="w-full max-w-md mx-auto px-4 py-3 text-lg border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-center dark:bg-gray-700 dark:text-white"
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
                  className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors mr-2"
                >
                  ✓ Check Answer
                </button>
                <button
                  onClick={loadAnimal}
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


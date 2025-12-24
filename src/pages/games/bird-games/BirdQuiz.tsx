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

export default function BirdQuiz() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [currentBird, setCurrentBird] = useState<Bird | null>(null);
  const [options, setOptions] = useState<Bird[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [correct, setCorrect] = useState<string | null>(null);

  const loadQuiz = useCallback(async () => {
    setLoading(true);
    setSelected(null);
    setCorrect(null);
    try {
      // Get birds from iNaturalist
      const birds = await searchINatSpecies('bird');
      if (birds.length < 4) {
        return;
      }

      // Pick random correct bird
      const correctBird = birds[Math.floor(Math.random() * birds.length)];
      const correct: Bird = {
        id: correctBird.id ? String(correctBird.id) : String(Math.random()),
        name: correctBird.preferred_common_name || correctBird.name || 'Unknown Bird',
        preferred_common_name: correctBird.preferred_common_name || correctBird.name,
        sciName: correctBird.name,
        default_photo: correctBird.default_photo,
      };

      // Pick 3 wrong options
      const wrongBirds: Bird[] = [];
      const usedIndices = new Set([correctBird.id || '']);
      
      while (wrongBirds.length < 3) {
        const randomBird = birds[Math.floor(Math.random() * birds.length)];
        const birdId = String(randomBird.id || Math.random());
        if (!usedIndices.has(birdId) && randomBird.name !== correct.name) {
          wrongBirds.push({
            id: birdId,
            name: randomBird.preferred_common_name || randomBird.name || 'Unknown Bird',
            preferred_common_name: randomBird.preferred_common_name || randomBird.name,
            sciName: randomBird.name,
            default_photo: randomBird.default_photo,
          });
          usedIndices.add(birdId);
        }
      }

      // Shuffle options
      const allOptions = [correct, ...wrongBirds].sort(() => Math.random() - 0.5);
      setCurrentBird(correct);
      setOptions(allOptions);
    } catch (error) {
      console.error('Error loading quiz:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadQuiz();
  }, [loadQuiz]);

  const handleSelect = (birdName: string) => {
    if (selected) return; // Already answered
    setSelected(birdName);
    setCorrect(currentBird?.name || null);
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
                ❓ Bird Quiz
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Which bird is this?
              </p>
            </div>
            <button
              onClick={() => navigate('/games')}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
            >
              ← Back to Games
            </button>
          </div>

          {/* Game Content */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            {imageUrl && (
              <div className="mb-8">
                <img
                  src={imageUrl}
                  alt="Quiz Bird"
                  className="w-full max-w-2xl mx-auto rounded-lg shadow-lg"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x400?text=Bird+Image';
                  }}
                />
              </div>
            )}

            {/* Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {options.map((bird, index) => {
                const isSelected = selected === bird.name;
                const isCorrect = bird.name === correct;
                const showResult = selected !== null;

                let bgClass = 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600';
                if (showResult) {
                  if (isCorrect) {
                    bgClass = 'bg-green-500 text-white';
                  } else if (isSelected && !isCorrect) {
                    bgClass = 'bg-red-500 text-white';
                  }
                }

                return (
                  <button
                    key={bird.id || index}
                    onClick={() => handleSelect(bird.name)}
                    disabled={showResult}
                    className={`p-6 rounded-lg font-medium text-left transition-all ${bgClass} ${
                      showResult ? 'cursor-default' : 'cursor-pointer hover:scale-105'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-lg">{bird.name}</span>
                      {showResult && isCorrect && <span className="text-2xl">✅</span>}
                      {showResult && isSelected && !isCorrect && <span className="text-2xl">❌</span>}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Controls */}
            <div className="mt-8 flex gap-4 justify-center">
              <button
                onClick={loadQuiz}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                ⏭️ Next Question
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchINatSpecies } from '../../../api/inaturalist';
import { fetchAnimalSounds } from '../../../api/xenocanto';
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

export default function BirdSoundMatch() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [currentBird, setCurrentBird] = useState<Bird | null>(null);
  const [options, setOptions] = useState<Bird[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [correct, setCorrect] = useState<string | null>(null);
  const [soundUrl, setSoundUrl] = useState<string>('');

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

      // Find a bird with sound
      let correctBird: Bird | null = null;
      let soundFound = false;
      let attempts = 0;
      const maxAttempts = 10;

      while (!soundFound && attempts < maxAttempts) {
        const randomBird = birds[Math.floor(Math.random() * birds.length)];
        const sounds = await fetchAnimalSounds(
          randomBird.preferred_common_name || randomBird.name || '',
          1
        );
        
        if (sounds && sounds.length > 0 && sounds[0].file) {
          correctBird = {
            id: String(randomBird.id || Math.random()),
            name: randomBird.preferred_common_name || randomBird.name || 'Unknown Bird',
            preferred_common_name: randomBird.preferred_common_name || randomBird.name,
            sciName: randomBird.name,
            default_photo: randomBird.default_photo,
          };
          setSoundUrl(sounds[0].file);
          soundFound = true;
        }
        attempts++;
      }

      if (!correctBird) {
        // Fallback: show error message
        return;
      }

      setCurrentBird(correctBird);

      // Pick 3 wrong options
      const wrongBirds: Bird[] = [];
      const usedIndices = new Set([correctBird.id || '']);
      
      while (wrongBirds.length < 3) {
        const randomBird = birds[Math.floor(Math.random() * birds.length)];
        const birdId = String(randomBird.id || Math.random());
        if (!usedIndices.has(birdId) && randomBird.name !== correctBird.name) {
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
      const allOptions = [correctBird, ...wrongBirds].sort(() => Math.random() - 0.5);
      setOptions(allOptions);
      setCorrect(correctBird.name);
    } catch (error) {
      console.error('Error loading sound match:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadQuiz();
  }, [loadQuiz]);

  const handleSelect = (birdName: string) => {
    if (selected) return;
    setSelected(birdName);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!currentBird || !soundUrl) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
              <div className="text-6xl mb-4">🔇</div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                No Bird Sounds Available
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                We couldn't find bird sounds at the moment. Please try again later!
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={loadQuiz}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  🔄 Try Again
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                🎵 Bird Sound Match
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Which bird makes this sound?
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
            {/* Audio Player */}
            <div className="mb-8">
              <audio
                controls
                autoPlay
                className="w-full max-w-md mx-auto"
                src={soundUrl}
              >
                Your browser does not support the audio element.
              </audio>
            </div>

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

            {/* Answer Display */}
            {selected && currentBird && (
              <div className="mb-8 p-6 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {currentBird.name}
                  </h3>
                  {currentBird.sciName && (
                    <p className="text-lg italic text-gray-600 dark:text-gray-400">
                      {currentBird.sciName}
                    </p>
                  )}
                  {currentBird.default_photo?.medium_url && (
                    <img
                      src={currentBird.default_photo.medium_url}
                      alt={currentBird.name}
                      className="w-full max-w-md mx-auto mt-4 rounded-lg shadow-lg"
                    />
                  )}
                </div>
              </div>
            )}

            {/* Controls */}
            <div className="mt-8 flex gap-4 justify-center">
              <button
                onClick={loadQuiz}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                ⏭️ Next Sound
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


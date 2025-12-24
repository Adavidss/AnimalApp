import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchINatSpecies } from '../../../api/inaturalist';
import { fetchAnimalSounds } from '../../../api/xenocanto';
import Loader from '../../../components/Loader';

interface Bird {
  id: string;
  name: string;
  preferred_common_name?: string;
  sciName?: string;
  images?: string[];
  default_photo?: {
    medium_url?: string;
  };
}

export default function GuessTheBird() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [currentBird, setCurrentBird] = useState<Bird | null>(null);
  const [gameType, setGameType] = useState<'image' | 'sound'>('image');
  const [revealed, setRevealed] = useState(false);
  const [blurred, setBlurred] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [soundUrl, setSoundUrl] = useState<string>('');

  const loadRandomBird = useCallback(async () => {
    setLoading(true);
    setRevealed(false);
    setBlurred(true);
    setImageError(false);
    try {
      // Randomly choose game type
      const type = Math.random() > 0.5 ? 'image' : 'sound';
      setGameType(type);

      // Get random bird from iNaturalist
      const birds = await searchINatSpecies('bird');
      if (birds.length === 0) {
        // Fallback if no birds
        return;
      }

      const randomBird = birds[Math.floor(Math.random() * birds.length)];
      const bird: Bird = {
        id: String(randomBird.id || Math.random()),
        name: randomBird.preferred_common_name || randomBird.name || 'Unknown Bird',
        preferred_common_name: randomBird.preferred_common_name || randomBird.name,
        sciName: randomBird.name,
        images: randomBird.default_photo ? [randomBird.default_photo.medium_url || ''] : [],
        default_photo: randomBird.default_photo,
      };

      // If sound type, try to get sound
      if (type === 'sound') {
        let soundFound = false;
        let attempts = 0;
        const maxAttempts = 5;

        while (!soundFound && attempts < maxAttempts) {
          const sounds = await fetchAnimalSounds(
            bird.preferred_common_name || bird.name,
            1
          );
          if (sounds && sounds.length > 0 && sounds[0].file) {
            setSoundUrl(sounds[0].file);
            soundFound = true;
          } else {
            // Try another bird
            const newBirds = await searchINatSpecies('bird');
            if (newBirds.length > 0) {
              const newBird = newBirds[Math.floor(Math.random() * newBirds.length)];
              bird.name = newBird.preferred_common_name || newBird.name || 'Unknown Bird';
              bird.preferred_common_name = newBird.preferred_common_name || newBird.name;
              bird.sciName = newBird.name;
              bird.images = newBird.default_photo ? [newBird.default_photo.medium_url || ''] : [];
              bird.default_photo = newBird.default_photo;
            }
            attempts++;
          }
        }

        if (!soundFound) {
          // Fallback to image type
          setGameType('image');
        }
      }

      setCurrentBird(bird);
    } catch (error) {
      console.error('Error loading bird:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRandomBird();
  }, [loadRandomBird]);

  const handleReveal = () => {
    setRevealed(true);
    setBlurred(false);
  };

  const imageUrl = currentBird?.default_photo?.medium_url || currentBird?.images?.[0] || '';

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
                🖼️ Guess the Bird
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {gameType === 'image' ? 'Can you identify this bird?' : 'Listen carefully. Can you identify this bird?'}
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
            {gameType === 'image' ? (
              <>
                {imageUrl && (
                  <div className="mb-6">
                    <img
                      src={imageUrl}
                      alt="Mystery Bird"
                      className={`w-full max-w-2xl mx-auto rounded-lg ${
                        blurred ? 'filter blur-lg' : ''
                      } transition-all duration-500`}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x400?text=Bird+Image';
                      }}
                    />
                  </div>
                )}

                {/* Blur Toggle */}
                {!revealed && (
                  <div className="flex items-center justify-center gap-4 mb-6">
                    <span className="text-gray-600 dark:text-gray-400">Blurred</span>
                    <button
                      onClick={() => setBlurred(!blurred)}
                      className={`relative w-14 h-7 rounded-full transition-colors ${
                        blurred ? 'bg-gray-300 dark:bg-gray-600' : 'bg-blue-600'
                      }`}
                    >
                      <span
                        className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                          blurred ? '' : 'transform translate-x-7'
                        }`}
                      />
                    </button>
                    <span className="text-gray-600 dark:text-gray-400">Clear</span>
                  </div>
                )}
              </>
            ) : (
              <>
                {soundUrl && (
                  <div className="mb-6">
                    <audio
                      controls
                      autoPlay
                      className="w-full max-w-md mx-auto"
                      src={soundUrl}
                    >
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                )}
              </>
            )}

            {/* Answer Section */}
            {revealed && currentBird && (
              <div className="mt-8 p-6 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg animate-fade-in">
                <div className="text-center">
                  <div className="text-6xl mb-4">✅</div>
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {currentBird.name}
                  </h3>
                  {currentBird.sciName && (
                    <p className="text-lg italic text-gray-600 dark:text-gray-400 mb-4">
                      {currentBird.sciName}
                    </p>
                  )}
                  {gameType === 'sound' && imageUrl && (
                    <img
                      src={imageUrl}
                      alt={currentBird.name}
                      className="w-full max-w-md mx-auto rounded-lg shadow-lg"
                    />
                  )}
                </div>
              </div>
            )}

            {/* Controls */}
            <div className="mt-8 flex gap-4 justify-center">
              {!revealed && (
                <button
                  onClick={handleReveal}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  👁️ Reveal Answer
                </button>
              )}
              <button
                onClick={loadRandomBird}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
              >
                ⏭️ Next Bird
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


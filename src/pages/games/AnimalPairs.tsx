import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRandomAnimal } from '../../api/animals';
import { useAnimal } from '../../context/AnimalContext';
import Loader from '../../components/Loader';

export default function AnimalPairs() {
  const navigate = useNavigate();
  const { enrichAnimal } = useAnimal();
  const [loading, setLoading] = useState(true);
  const [animals, setAnimals] = useState<any[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);

  const loadGame = useCallback(async () => {
    setLoading(true);
    setSelected([]);
    setMatched(new Set());
    setScore(0);
    setMoves(0);

    try {
      // Get 6 unique animals
      const animalList: any[] = [];
      const used = new Set<string>();

      let attempts = 0;
      const maxAttempts = 20; // Try up to 20 animals to get 6 with images
      
      while (animalList.length < 6 && attempts < maxAttempts) {
        attempts++;
        const animal = await getRandomAnimal();
        if (animal && !used.has(animal.name)) {
          try {
            const enriched = await enrichAnimal(animal.name, animal.taxonomy?.scientific_name || animal.name);
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
                // Add to images array for consistency
                if (!enriched.images) enriched.images = [];
                enriched.images.push({
                  id: 'wikipedia',
                  urls: { small: imageUrl, thumb: imageUrl, regular: imageUrl, full: imageUrl, raw: imageUrl },
                  alt_description: animal.name,
                  user: { name: 'Wikipedia', username: 'wikipedia' },
                  links: { html: '' }
                });
              }
              
              // Only add if we have at least one image
              if (imageUrl || (enriched.images && enriched.images.length > 0)) {
                animalList.push(enriched);
                used.add(animal.name);
              }
            }
          } catch (error) {
            console.debug(`Failed to enrich ${animal.name}:`, error);
          }
        }
      }

      // Create pairs (duplicate each animal)
      const pairs = [...animalList, ...animalList].sort(() => Math.random() - 0.5);
      setAnimals(pairs);
    } catch (error) {
      console.error('Error loading game:', error);
    } finally {
      setLoading(false);
    }
  }, [enrichAnimal]);

  useEffect(() => {
    loadGame();
  }, [loadGame]);

  useEffect(() => {
    if (selected.length === 2) {
      const [first, second] = selected;
      setMoves(prev => prev + 1);

      if (animals[first].name === animals[second].name && first !== second) {
        // Match found
        setMatched(prev => new Set([...prev, animals[first].name]));
        setScore(prev => prev + 10);
        setSelected([]);
      } else {
        // No match - flip back after delay
        setTimeout(() => {
          setSelected([]);
        }, 1000);
      }
    }
  }, [selected, animals]);

  const handleClick = (index: number) => {
    if (selected.includes(index) || matched.has(animals[index]?.name) || selected.length >= 2) {
      return;
    }
    setSelected(prev => [...prev, index]);
  };

  const isGameWon = matched.size === animals.length / 2;

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
                🔗 Animal Pairs
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Find matching animal pairs!
              </p>
            </div>
            <button
              onClick={() => navigate('/games')}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
            >
              ← Back
            </button>
          </div>

          {/* Stats */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
            <div className="flex justify-around">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{score}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{moves}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Moves</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{matched.size}/{animals.length / 2}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Matched</div>
              </div>
            </div>
          </div>

          {/* Win Message */}
          {isGameWon && (
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-8 mb-8 text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-3xl font-bold text-green-700 dark:text-green-400 mb-4">You Won!</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                Score: {score} | Moves: {moves}
              </p>
              <button
                onClick={loadGame}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
              >
                Play Again
              </button>
            </div>
          )}

          {/* Cards Grid - Always 4 columns for proper grid layout */}
          <div className="grid grid-cols-4 gap-4">
            {animals.map((animal, index) => {
              const isSelected = selected.includes(index);
              const isMatched = matched.has(animal.name);
              // Try multiple image sources with fallbacks
              const imageUrl = animal.images?.[0]?.urls?.small || 
                             animal.images?.[0]?.urls?.thumb || 
                             animal.images?.[0]?.urls?.regular ||
                             animal.wikipedia?.thumbnail?.source || '';

              return (
                <button
                  key={index}
                  onClick={() => handleClick(index)}
                  disabled={isMatched || selected.length >= 2}
                  className={`aspect-square rounded-lg overflow-hidden transition-all ${
                    isMatched
                      ? 'opacity-50 cursor-not-allowed ring-4 ring-green-500'
                      : isSelected
                      ? 'ring-4 ring-blue-500 scale-105'
                      : 'hover:scale-105 cursor-pointer'
                  }`}
                >
                  {isSelected || isMatched ? (
                    imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={animal.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <span className="text-gray-600 dark:text-gray-400">{animal.name}</span>
                      </div>
                    )
                  ) : (
                    <div className="w-full h-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                      <span className="text-4xl">❓</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}


import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Loader from '../../components/Loader';

interface AnimalSize {
  name: string;
  weight: number;
  height: number;
  length: number;
}

// Animal size database (same as SizeChallenge)
const ANIMAL_SIZES: AnimalSize[] = [
  { name: 'Mouse', weight: 0.02, height: 5, length: 10 },
  { name: 'Cat', weight: 5.0, height: 25, length: 50 },
  { name: 'Dog', weight: 30, height: 60, length: 90 },
  { name: 'Lion', weight: 190, height: 110, length: 250 },
  { name: 'Tiger', weight: 220, height: 110, length: 310 },
  { name: 'Elephant', weight: 5500, height: 320, length: 650 },
  { name: 'Giraffe', weight: 1200, height: 550, length: 600 },
  { name: 'Blue Whale', weight: 150000, height: 400, length: 3000 },
  { name: 'Hummingbird', weight: 0.003, height: 8, length: 10 },
  { name: 'Eagle', weight: 5.5, height: 90, length: 100 },
  { name: 'Ostrich', weight: 120, height: 250, length: 270 },
];

interface AnimalSize {
  name: string;
  weight: number;
  height: number;
  length: number;
}

type SortType = 'weight' | 'height' | 'length';

export default function AnimalSort() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [animals, setAnimals] = useState<AnimalSize[]>([]);
  const [sortType, setSortType] = useState<SortType>('weight');
  const [userOrder, setUserOrder] = useState<string[]>([]);
  const [checking, setChecking] = useState(false);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);

  const startRound = useCallback(() => {
    setLoading(true);
    setChecking(false);
    
    // Get 4 random animals
    const shuffled = [...ANIMAL_SIZES].sort(() => Math.random() - 0.5).slice(0, 4);
    setAnimals(shuffled);
    setUserOrder(shuffled.map(a => a.name));
    setSortType(['weight', 'height', 'length'][Math.floor(Math.random() * 3)] as SortType);
    setRound(prev => prev + 1);
    setLoading(false);
  }, []);

  useEffect(() => {
    startRound();
  }, [startRound]);

  const moveAnimal = (fromIndex: number, toIndex: number) => {
    if (checking) return;
    const newOrder = [...userOrder];
    const [removed] = newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, removed);
    setUserOrder(newOrder);
  };

  const checkOrder = () => {
    setChecking(true);
    const correctOrder = [...animals].sort((a, b) => {
      const valA = sortType === 'weight' ? a.weight : sortType === 'height' ? a.height : a.length;
      const valB = sortType === 'weight' ? b.weight : sortType === 'height' ? b.height : b.length;
      return valB - valA;
    });
    const correctNames = correctOrder.map(a => a.name);
    
    let correctCount = 0;
    userOrder.forEach((name, index) => {
      if (name === correctNames[index]) correctCount++;
    });

    const points = Math.floor((correctCount / animals.length) * 100);
    setScore(prev => prev + points);

    setTimeout(() => {
      startRound();
    }, 3000);
  };

  const getSortLabel = () => {
    switch (sortType) {
      case 'weight': return 'heaviest to lightest';
      case 'height': return 'tallest to shortest';
      case 'length': return 'longest to shortest';
      default: return '';
    }
  };

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
                📊 Animal Sort
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Sort animals by size!
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
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              Sort these animals from {getSortLabel()}
            </h2>

            {/* Draggable List */}
            <div className="space-y-3 mb-6">
              {userOrder.map((animalName, index) => {
                const animal = animals.find(a => a.name === animalName);
                if (!animal) return null;

                return (
                  <div
                    key={animalName}
                    className={`p-4 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-between ${
                      checking ? '' : 'cursor-move hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                    draggable={!checking}
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', index.toString());
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
                      moveAnimal(fromIndex, index);
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-2xl font-bold text-gray-400">{index + 1}</span>
                      <span className="text-lg font-medium text-gray-900 dark:text-white">{animalName}</span>
                    </div>
                    {checking && (() => {
                      const correctOrder = [...animals].sort((a, b) => {
                        const valA = sortType === 'weight' ? a.weight : sortType === 'height' ? a.height : a.length;
                        const valB = sortType === 'weight' ? b.weight : sortType === 'height' ? b.height : b.length;
                        return valB - valA;
                      });
                      const isCorrect = userOrder[index] === correctOrder[index].name;
                      return <span className="text-2xl">{isCorrect ? '✅' : '❌'}</span>;
                    })()}
                  </div>
                );
              })}
            </div>

            {!checking && (
              <button
                onClick={checkOrder}
                className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                Check Order
              </button>
            )}

            {checking && (
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
                <p className="text-blue-700 dark:text-blue-300">
                  Drag items up or down to reorder, then check your answer!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


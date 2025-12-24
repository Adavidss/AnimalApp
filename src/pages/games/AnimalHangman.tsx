import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRandomAnimal } from '../../api/animals';
import Loader from '../../components/Loader';

const MAX_WRONG = 6;
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export default function AnimalHangman() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [animal, setAnimal] = useState<string>('');
  const [guessed, setGuessed] = useState<Set<string>>(new Set());
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);

  const loadAnimal = useCallback(async () => {
    setLoading(true);
    setGuessed(new Set());
    setWrongGuesses(0);
    setGameOver(false);
    setWon(false);

    try {
      const randomAnimal = await getRandomAnimal();
      if (randomAnimal) {
        // Use uppercase for display
        setAnimal(randomAnimal.name.toUpperCase());
        setRound(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error loading animal:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAnimal();
  }, [loadAnimal]);

  useEffect(() => {
    if (!animal) return;

    const letters = animal.split('').filter(c => c.match(/[A-Z]/));
    const guessedLetters = letters.filter(l => guessed.has(l));
    
    if (letters.length > 0 && guessedLetters.length === letters.length) {
      setWon(true);
      setGameOver(true);
      setScore(prev => prev + 100 - (wrongGuesses * 10));
    } else if (wrongGuesses >= MAX_WRONG) {
      setGameOver(true);
    }
  }, [animal, guessed, wrongGuesses]);

  const handleGuess = (letter: string) => {
    if (gameOver || guessed.has(letter)) return;

    const newGuessed = new Set(guessed);
    newGuessed.add(letter);
    setGuessed(newGuessed);

    if (!animal.includes(letter)) {
      setWrongGuesses(prev => prev + 1);
    }
  };

  const displayWord = () => {
    return animal
      .split('')
      .map(char => {
        if (char === ' ') return ' ';
        if (guessed.has(char)) return char;
        return '_';
      })
      .join(' ');
  };

  const getHangmanDrawing = () => {
    const stages = [
      // 0 wrong guesses - empty gallows
      <svg width="200" height="250" className="mx-auto">
        <line x1="20" y1="230" x2="180" y2="230" stroke="currentColor" strokeWidth="3" />
        <line x1="50" y1="230" x2="50" y2="20" stroke="currentColor" strokeWidth="3" />
        <line x1="50" y1="20" x2="130" y2="20" stroke="currentColor" strokeWidth="3" />
        <line x1="130" y1="20" x2="130" y2="50" stroke="currentColor" strokeWidth="3" />
      </svg>,
      // 1 wrong - head
      <svg width="200" height="250" className="mx-auto">
        <line x1="20" y1="230" x2="180" y2="230" stroke="currentColor" strokeWidth="3" />
        <line x1="50" y1="230" x2="50" y2="20" stroke="currentColor" strokeWidth="3" />
        <line x1="50" y1="20" x2="130" y2="20" stroke="currentColor" strokeWidth="3" />
        <line x1="130" y1="20" x2="130" y2="50" stroke="currentColor" strokeWidth="3" />
        <circle cx="130" cy="70" r="20" stroke="currentColor" strokeWidth="3" fill="none" />
      </svg>,
      // 2 wrong - head + body
      <svg width="200" height="250" className="mx-auto">
        <line x1="20" y1="230" x2="180" y2="230" stroke="currentColor" strokeWidth="3" />
        <line x1="50" y1="230" x2="50" y2="20" stroke="currentColor" strokeWidth="3" />
        <line x1="50" y1="20" x2="130" y2="20" stroke="currentColor" strokeWidth="3" />
        <line x1="130" y1="20" x2="130" y2="50" stroke="currentColor" strokeWidth="3" />
        <circle cx="130" cy="70" r="20" stroke="currentColor" strokeWidth="3" fill="none" />
        <line x1="130" y1="90" x2="130" y2="170" stroke="currentColor" strokeWidth="3" />
      </svg>,
      // 3 wrong - head + body + left arm
      <svg width="200" height="250" className="mx-auto">
        <line x1="20" y1="230" x2="180" y2="230" stroke="currentColor" strokeWidth="3" />
        <line x1="50" y1="230" x2="50" y2="20" stroke="currentColor" strokeWidth="3" />
        <line x1="50" y1="20" x2="130" y2="20" stroke="currentColor" strokeWidth="3" />
        <line x1="130" y1="20" x2="130" y2="50" stroke="currentColor" strokeWidth="3" />
        <circle cx="130" cy="70" r="20" stroke="currentColor" strokeWidth="3" fill="none" />
        <line x1="130" y1="90" x2="130" y2="170" stroke="currentColor" strokeWidth="3" />
        <line x1="130" y1="120" x2="90" y2="140" stroke="currentColor" strokeWidth="3" />
      </svg>,
      // 4 wrong - head + body + both arms
      <svg width="200" height="250" className="mx-auto">
        <line x1="20" y1="230" x2="180" y2="230" stroke="currentColor" strokeWidth="3" />
        <line x1="50" y1="230" x2="50" y2="20" stroke="currentColor" strokeWidth="3" />
        <line x1="50" y1="20" x2="130" y2="20" stroke="currentColor" strokeWidth="3" />
        <line x1="130" y1="20" x2="130" y2="50" stroke="currentColor" strokeWidth="3" />
        <circle cx="130" cy="70" r="20" stroke="currentColor" strokeWidth="3" fill="none" />
        <line x1="130" y1="90" x2="130" y2="170" stroke="currentColor" strokeWidth="3" />
        <line x1="130" y1="120" x2="90" y2="140" stroke="currentColor" strokeWidth="3" />
        <line x1="130" y1="120" x2="170" y2="140" stroke="currentColor" strokeWidth="3" />
      </svg>,
      // 5 wrong - head + body + both arms + left leg
      <svg width="200" height="250" className="mx-auto">
        <line x1="20" y1="230" x2="180" y2="230" stroke="currentColor" strokeWidth="3" />
        <line x1="50" y1="230" x2="50" y2="20" stroke="currentColor" strokeWidth="3" />
        <line x1="50" y1="20" x2="130" y2="20" stroke="currentColor" strokeWidth="3" />
        <line x1="130" y1="20" x2="130" y2="50" stroke="currentColor" strokeWidth="3" />
        <circle cx="130" cy="70" r="20" stroke="currentColor" strokeWidth="3" fill="none" />
        <line x1="130" y1="90" x2="130" y2="170" stroke="currentColor" strokeWidth="3" />
        <line x1="130" y1="120" x2="90" y2="140" stroke="currentColor" strokeWidth="3" />
        <line x1="130" y1="120" x2="170" y2="140" stroke="currentColor" strokeWidth="3" />
        <line x1="130" y1="170" x2="100" y2="220" stroke="currentColor" strokeWidth="3" />
      </svg>,
      // 6 wrong - complete hangman
      <svg width="200" height="250" className="mx-auto">
        <line x1="20" y1="230" x2="180" y2="230" stroke="currentColor" strokeWidth="3" />
        <line x1="50" y1="230" x2="50" y2="20" stroke="currentColor" strokeWidth="3" />
        <line x1="50" y1="20" x2="130" y2="20" stroke="currentColor" strokeWidth="3" />
        <line x1="130" y1="20" x2="130" y2="50" stroke="currentColor" strokeWidth="3" />
        <circle cx="130" cy="70" r="20" stroke="currentColor" strokeWidth="3" fill="none" />
        <line x1="130" y1="90" x2="130" y2="170" stroke="currentColor" strokeWidth="3" />
        <line x1="130" y1="120" x2="90" y2="140" stroke="currentColor" strokeWidth="3" />
        <line x1="130" y1="120" x2="170" y2="140" stroke="currentColor" strokeWidth="3" />
        <line x1="130" y1="170" x2="100" y2="220" stroke="currentColor" strokeWidth="3" />
        <line x1="130" y1="170" x2="160" y2="220" stroke="currentColor" strokeWidth="3" />
      </svg>
    ];
    return stages[Math.min(wrongGuesses, stages.length - 1)];
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
                🎯 Animal Hangman
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Guess the animal name!
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
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
            <div className="flex justify-around items-center">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{score}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Score</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{round}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Round</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600 dark:text-red-400">{wrongGuesses}/{MAX_WRONG}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Wrong</div>
              </div>
            </div>
          </div>

          {/* Game Content */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            {/* Hangman Drawing */}
            <div className="text-center mb-8">
              <div className="text-gray-800 dark:text-gray-200 min-h-[250px] flex items-center justify-center">
                {getHangmanDrawing()}
              </div>
            </div>

            {/* Word Display */}
            <div className="text-center mb-8">
              <div className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white tracking-wider mb-4 font-mono">
                {displayWord()}
              </div>
            </div>

            {/* Game Over Message */}
            {gameOver && (
              <div className={`mb-6 p-6 rounded-lg text-center ${
                won 
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                  : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
              }`}>
                <div className="text-2xl mb-2">{won ? '🎉 You Won!' : '❌ Game Over!'}</div>
                <div className="text-lg mb-4">
                  The answer was: <strong>{animal}</strong>
                </div>
                <button
                  onClick={loadAnimal}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  Next Animal
                </button>
              </div>
            )}

            {/* Alphabet */}
            {!gameOver && (
              <div className="grid grid-cols-6 md:grid-cols-9 gap-2">
                {ALPHABET.map(letter => {
                  const isGuessed = guessed.has(letter);
                  const isWrong = isGuessed && !animal.includes(letter);
                  const isCorrect = isGuessed && animal.includes(letter);

                  let bgClass = 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600';
                  let textClass = 'text-gray-900 dark:text-white'; // Explicit text color for default state
                  
                  if (isCorrect) {
                    bgClass = 'bg-green-500';
                    textClass = 'text-white';
                  } else if (isWrong) {
                    bgClass = 'bg-red-500';
                    textClass = 'text-white';
                  }

                  return (
                    <button
                      key={letter}
                      onClick={() => handleGuess(letter)}
                      disabled={isGuessed}
                      className={`p-3 rounded-lg font-bold transition-all ${bgClass} ${textClass} ${
                        isGuessed ? 'cursor-not-allowed opacity-75' : 'cursor-pointer hover:scale-110'
                      }`}
                    >
                      {letter}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


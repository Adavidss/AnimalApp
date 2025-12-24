import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { GameCard, GameCardProps } from '../../components/games/GameCard';

const GAMES: GameCardProps[] = [
  {
    id: 'memory_match',
    title: 'Memory Match',
    description: 'Flip cards to find matching animal pairs. Test your memory skills!',
    icon: '🎴',
    difficulty: 'medium',
    estimatedTime: '5-10 min',
    path: '/games/memory-match',
    gradient: 'from-purple-500 to-pink-500',
    features: [
      'Multiple difficulty levels',
      'Beautiful animal images',
      'Score tracking & high scores',
      'Sound effects'
    ]
  },
  {
    id: 'sound_match',
    title: 'Sound Match',
    description: 'Listen to animal sounds and identify the correct animal!',
    icon: '🔊',
    difficulty: 'medium',
    estimatedTime: '5-10 min',
    path: '/games/sound-match',
    gradient: 'from-blue-500 to-teal-500',
    features: [
      'Real animal sounds',
      'Easy to hard difficulty',
      'Hints for each animal',
      'Learn animal calls'
    ]
  },
  {
    id: 'size_challenge',
    title: 'Size Challenge',
    description: 'Guess which animal is larger, taller, or heavier!',
    icon: '📏',
    difficulty: 'easy',
    estimatedTime: '5-8 min',
    path: '/games/size-challenge',
    gradient: 'from-green-500 to-blue-500',
    features: [
      'Visual size comparisons',
      'Weight, height & length',
      'Progressive difficulty',
      'Educational & fun'
    ]
  },
  {
    id: 'quiz',
    title: 'Animal Quiz',
    description: 'Test your knowledge about animals with multiple-choice questions!',
    icon: '❓',
    difficulty: 'medium',
    estimatedTime: '10-15 min',
    path: '/quiz',
    gradient: 'from-orange-500 to-red-500',
    features: [
      'Multiple question types',
      'Daily challenges',
      'Track your progress',
      'Learn animal facts'
    ]
  },
  {
    id: 'animal_trivia',
    title: 'Animal Trivia',
    description: 'Test your knowledge with fun animal trivia questions!',
    icon: '🧠',
    difficulty: 'medium',
    estimatedTime: '5-10 min',
    path: '/games/animal-trivia',
    gradient: 'from-yellow-500 to-orange-500',
    features: [
      'Multiple choice questions',
      'Various topics',
      'Score tracking',
      'Educational facts'
    ]
  },
  {
    id: 'name_that_animal',
    title: 'Name That Animal',
    description: 'Identify animals from their images with hints!',
    icon: '🖼️',
    difficulty: 'easy',
    estimatedTime: '5-8 min',
    path: '/games/name-that-animal',
    gradient: 'from-pink-500 to-rose-500',
    features: [
      'Image identification',
      'Helpful hints',
      'Score system',
      'Multiple rounds'
    ]
  },
  {
    id: 'hangman',
    title: 'Animal Hangman',
    description: 'Classic hangman game with animal names!',
    icon: '🎯',
    difficulty: 'medium',
    estimatedTime: '5-10 min',
    path: '/games/animal-hangman',
    gradient: 'from-green-500 to-emerald-500',
    features: [
      'Classic gameplay',
      'Animal names',
      'Visual feedback',
      'Score tracking'
    ]
  },
  {
    id: 'true_false',
    title: 'True or False',
    description: 'Quick true/false questions about animals!',
    icon: '✅',
    difficulty: 'easy',
    estimatedTime: '5-8 min',
    path: '/games/true-false',
    gradient: 'from-cyan-500 to-blue-500',
    features: [
      'Fast-paced gameplay',
      'Quick decisions',
      'Explanations',
      'Score tracking'
    ]
  },
  {
    id: 'quick_flash',
    title: 'Quick Flash',
    description: 'Remember the animal from a quick flash!',
    icon: '⚡',
    difficulty: 'hard',
    estimatedTime: '5-10 min',
    path: '/games/quick-flash',
    gradient: 'from-purple-500 to-indigo-500',
    features: [
      'Memory challenge',
      '2-second flash',
      'Quick recall',
      'Score system'
    ]
  }
];

export default function GamesHub() {
  const [totalGamesPlayed, setTotalGamesPlayed] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [selectedDifficulty, setSelectedDifficulty] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');

  useEffect(() => {
    // Calculate total stats from localStorage
    let gamesPlayed = 0;
    let score = 0;

    GAMES.forEach(game => {
      try {
        // Skip quiz and compare for stats calculation as they may use different storage keys
        if (game.id === 'quiz' || game.id === 'compare') return;

        const playCount = localStorage.getItem(`${game.id}_play_count`);
        if (playCount) {
          gamesPlayed += parseInt(playCount);
        }

        const highScore = localStorage.getItem(`${game.id}_high_score`);
        if (highScore) {
          const scoreData = JSON.parse(highScore);
          score += scoreData.score || 0;
        }
      } catch (error) {
        console.error('Error loading game stats:', error);
      }
    });

    // Add quiz stats if available
    try {
      const quizStats = localStorage.getItem('animal_atlas_quiz_stats');
      if (quizStats) {
        const stats = JSON.parse(quizStats);
        gamesPlayed += stats.totalQuizzes || 0;
        score += stats.totalCorrect || 0;
      }
    } catch (error) {
      // Ignore quiz stats errors
    }

    setTotalGamesPlayed(gamesPlayed);
    setTotalScore(score);
  }, []);

  const filteredGames = selectedDifficulty === 'all'
    ? GAMES
    : GAMES.filter(game => game.difficulty === selectedDifficulty);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative py-8 md:py-12 bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="text-5xl md:text-6xl mb-4">🎮</div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Animal Games Hub
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-6">
              Learn about animals through fun and interactive games!
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 md:gap-4 max-w-2xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 md:p-4">
                <div className="text-2xl md:text-3xl font-bold text-white mb-1">
                  {GAMES.length + 7}
                </div>
                <div className="text-xs md:text-sm text-white/80">Games</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 md:p-4">
                <div className="text-2xl md:text-3xl font-bold text-white mb-1">
                  {totalGamesPlayed}
                </div>
                <div className="text-xs md:text-sm text-white/80">Played</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 md:p-4">
                <div className="text-2xl md:text-3xl font-bold text-white mb-1">
                  {totalScore.toLocaleString()}
                </div>
                <div className="text-xs md:text-sm text-white/80">Score</div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Bird Games Section */}
      <section className="py-6 md:py-10 bg-gradient-to-br from-blue-50 to-teal-50 dark:from-blue-900/20 dark:to-teal-900/20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 md:mb-6 gap-3">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                  <span className="text-2xl md:text-3xl">🐦</span>
                  Bird Games
                </h2>
                <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
                  Special bird-themed games
                </p>
              </div>
              <Link
                to="/birds"
                className="px-4 md:px-6 py-2 md:py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm md:text-base font-medium rounded-lg transition-colors shadow-lg hover:shadow-xl"
              >
                🐦 Explore Birds
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
              <Link
                to="/games/bird-games/guess"
                className="bg-white dark:bg-gray-800 rounded-lg md:rounded-xl p-4 md:p-6 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 text-center"
              >
                <div className="text-3xl md:text-4xl mb-2">🖼️</div>
                <h3 className="text-sm md:text-base font-bold text-gray-900 dark:text-white mb-1">Guess the Bird</h3>
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Identify birds from images or sounds</p>
              </Link>

              <Link
                to="/games/bird-games/quiz"
                className="bg-white dark:bg-gray-800 rounded-lg md:rounded-xl p-4 md:p-6 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 text-center"
              >
                <div className="text-3xl md:text-4xl mb-2">❓</div>
                <h3 className="text-sm md:text-base font-bold text-gray-900 dark:text-white mb-1">Bird Quiz</h3>
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Test your bird knowledge</p>
              </Link>

              <Link
                to="/games/bird-games/bird-sound-match"
                className="bg-white dark:bg-gray-800 rounded-lg md:rounded-xl p-4 md:p-6 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 text-center"
              >
                <div className="text-3xl md:text-4xl mb-2">🎵</div>
                <h3 className="text-sm md:text-base font-bold text-gray-900 dark:text-white mb-1">Bird Sound Match</h3>
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Match sounds to bird species</p>
              </Link>

              <Link
                to="/games/bird-games/type-the-bird"
                className="bg-white dark:bg-gray-800 rounded-lg md:rounded-xl p-4 md:p-6 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 text-center"
              >
                <div className="text-3xl md:text-4xl mb-2">⌨️</div>
                <h3 className="text-sm md:text-base font-bold text-gray-900 dark:text-white mb-1">Type the Bird</h3>
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Type bird names quickly</p>
              </Link>

              <Link
                to="/games/bird-games/speed-match"
                className="bg-white dark:bg-gray-800 rounded-lg md:rounded-xl p-4 md:p-6 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 text-center"
              >
                <div className="text-3xl md:text-4xl mb-2">⚡</div>
                <h3 className="text-sm md:text-base font-bold text-gray-900 dark:text-white mb-1">Speed Match</h3>
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Quick matching challenge</p>
              </Link>

              <Link
                to="/games/bird-games/word-scramble"
                className="bg-white dark:bg-gray-800 rounded-lg md:rounded-xl p-4 md:p-6 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 text-center"
              >
                <div className="text-3xl md:text-4xl mb-2">🔀</div>
                <h3 className="text-sm md:text-base font-bold text-gray-900 dark:text-white mb-1">Word Scramble</h3>
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Unscramble bird names</p>
              </Link>

              <Link
                to="/games/bird-games/alphabet-challenge"
                className="bg-white dark:bg-gray-800 rounded-lg md:rounded-xl p-4 md:p-6 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 text-center"
              >
                <div className="text-3xl md:text-4xl mb-2">🔤</div>
                <h3 className="text-sm md:text-base font-bold text-gray-900 dark:text-white mb-1">Alphabet Challenge</h3>
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Name birds by letter</p>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* All Games */}
      <section className="py-6 md:py-10 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 md:mb-6 gap-3">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  All Games
                </h2>
                <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
                  Choose a game and start playing!
                </p>
              </div>

              {/* Difficulty Filter */}
              <div className="flex gap-2">
                {(['all', 'easy', 'medium', 'hard'] as const).map(diff => (
                  <button
                    key={diff}
                    onClick={() => setSelectedDifficulty(diff)}
                    className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-all capitalize ${
                      selectedDifficulty === diff
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            {/* Games Grid */}
            {filteredGames.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {filteredGames.map(game => (
                  <GameCard key={game.id} {...game} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 md:py-12">
                <div className="text-4xl md:text-5xl mb-3">🎮</div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  No games found
                </h3>
                <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
                  Try selecting a different difficulty level
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

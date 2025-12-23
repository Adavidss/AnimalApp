import { useState, useEffect } from 'react';
import { GameCard, FeaturedGameCard, CompactGameCard, GameCardProps } from '../../components/games/GameCard';

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

    setTotalGamesPlayed(gamesPlayed);
    setTotalScore(score);
  }, []);

  const filteredGames = selectedDifficulty === 'all'
    ? GAMES
    : GAMES.filter(game => game.difficulty === selectedDifficulty);

  const featuredGame = GAMES[0]; // Memory Match as featured

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 text-9xl animate-bounce">🎮</div>
          <div className="absolute top-32 right-20 text-7xl animate-pulse">🏆</div>
          <div className="absolute bottom-20 left-1/4 text-8xl animate-bounce delay-100">🎯</div>
          <div className="absolute bottom-32 right-1/3 text-6xl animate-pulse delay-200">⭐</div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="text-8xl mb-6 animate-bounce">🎮</div>
            <h1 className="text-6xl font-bold text-white mb-6">
              Animal Games Hub
            </h1>
            <p className="text-2xl text-white/90 mb-8">
              Learn about animals through fun and interactive games!
            </p>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="text-4xl font-bold text-white mb-2">
                  {GAMES.length}
                </div>
                <div className="text-white/80">Available Games</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="text-4xl font-bold text-white mb-2">
                  {totalGamesPlayed}
                </div>
                <div className="text-white/80">Games Played</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="text-4xl font-bold text-white mb-2">
                  {totalScore.toLocaleString()}
                </div>
                <div className="text-white/80">Total Score</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Game */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Featured Game
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Most popular game this week
                </p>
              </div>
              <div className="text-4xl">⭐</div>
            </div>

            <FeaturedGameCard {...featuredGame} />
          </div>
        </div>
      </section>

      {/* All Games */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  All Games
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Choose a game and start playing!
                </p>
              </div>

              {/* Difficulty Filter */}
              <div className="flex gap-2">
                {(['all', 'easy', 'medium', 'hard'] as const).map(diff => (
                  <button
                    key={diff}
                    onClick={() => setSelectedDifficulty(diff)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all capitalize ${
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredGames.map(game => (
                  <GameCard key={game.id} {...game} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🎮</div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  No games found
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Try selecting a different difficulty level
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Quick Access */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
              Quick Access
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {GAMES.map(game => (
                <CompactGameCard
                  key={game.id}
                  id={game.id}
                  title={game.title}
                  icon={game.icon}
                  path={game.path}
                  gradient={game.gradient}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                Why Play Animal Games?
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start gap-4">
                  <div className="text-4xl">🧠</div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                      Learn While Playing
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Each game teaches you about animal characteristics, sounds, and sizes in a fun way.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="text-4xl">🏆</div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                      Track Your Progress
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      High scores and stats help you see your improvement over time.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="text-4xl">🎯</div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                      Multiple Difficulty Levels
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      From easy to hard, there's a challenge for everyone.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="text-4xl">📱</div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                      Play Anywhere
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      All games work great on desktop, tablet, and mobile devices.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tips Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
              Gaming Tips
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                <div className="text-3xl mb-3">💡</div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                  Start Easy
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Begin with easy difficulty to learn the game mechanics before moving to harder levels.
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                <div className="text-3xl mb-3">🎧</div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                  Use Headphones
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  For Sound Match, headphones will help you hear animal sounds more clearly.
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                <div className="text-3xl mb-3">⚡</div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                  Speed Bonus
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Faster correct answers earn more points. But don't rush - accuracy matters too!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-purple-600 to-pink-600">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="text-6xl mb-6">🎮</div>
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Play?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Choose a game above and start your animal adventure!
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {GAMES.map(game => (
                <a
                  key={game.id}
                  href={game.path}
                  className="px-8 py-4 bg-white text-purple-600 font-bold rounded-lg hover:bg-gray-100 transition-all hover:scale-105 shadow-lg"
                >
                  {game.icon} {game.title}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

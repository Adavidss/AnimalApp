import { Link } from 'react-router-dom';
import { getHighScore, getGamePlayCount } from '../../utils/gameHelpers';

export interface GameCardProps {
  id: string;
  title: string;
  description: string;
  icon: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: string; // e.g., "5-10 min"
  path: string;
  gradient: string; // e.g., "from-purple-500 to-pink-500"
  features?: string[];
  comingSoon?: boolean;
}

export function GameCard({
  id,
  title,
  description,
  icon,
  difficulty,
  estimatedTime,
  path,
  gradient,
  features,
  comingSoon = false
}: GameCardProps) {
  const highScore = getHighScore(id);
  const playCount = getGamePlayCount(id);

  const getDifficultyColor = () => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'hard':
        return 'bg-red-500';
    }
  };

  const CardContent = () => (
    <>
      {/* Gradient Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-10 dark:opacity-20 rounded-xl transition-opacity group-hover:opacity-20 dark:group-hover:opacity-30`} />

      {/* Content */}
      <div className="relative p-6 flex flex-col h-full">
        {/* Icon and Title */}
        <div className="mb-4">
          <div className="text-6xl mb-3">{icon}</div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
            {description}
          </p>
        </div>

        {/* Features */}
        {features && features.length > 0 && (
          <div className="mb-4 flex-1">
            <ul className="space-y-1">
              {features.slice(0, 3).map((feature, index) => (
                <li
                  key={index}
                  className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2"
                >
                  <span className="text-purple-600 dark:text-purple-400 mt-0.5">•</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Stats */}
        <div className="mb-4 flex items-center gap-3">
          {/* Difficulty Badge */}
          <div className={`px-3 py-1 ${getDifficultyColor()} text-white text-xs font-bold rounded-full capitalize`}>
            {difficulty}
          </div>

          {/* Time Estimate */}
          <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
            <span>⏱️</span>
            <span>{estimatedTime}</span>
          </div>

          {/* Play Count */}
          {playCount > 0 && (
            <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
              <span>🎮</span>
              <span>{playCount}</span>
            </div>
          )}
        </div>

        {/* High Score */}
        {highScore && highScore.score > 0 && !comingSoon && (
          <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-yellow-700 dark:text-yellow-400">
                🏆 High Score
              </span>
              <span className="text-lg font-bold text-yellow-700 dark:text-yellow-400">
                {highScore.score}
              </span>
            </div>
          </div>
        )}

        {/* Coming Soon Badge */}
        {comingSoon && (
          <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg text-center">
            <span className="text-sm font-bold text-gray-600 dark:text-gray-400">
              Coming Soon!
            </span>
          </div>
        )}

        {/* Play Button */}
        <div className={`mt-auto pt-4 border-t border-gray-200 dark:border-gray-700 ${comingSoon ? 'opacity-50' : ''}`}>
          <div className={`w-full px-6 py-3 bg-gradient-to-r ${gradient} text-white font-bold rounded-lg transition-all text-center ${
            comingSoon
              ? 'cursor-not-allowed'
              : 'group-hover:shadow-lg group-hover:scale-105'
          }`}>
            {comingSoon ? 'Coming Soon' : 'Play Now →'}
          </div>
        </div>
      </div>
    </>
  );

  if (comingSoon) {
    return (
      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-lg transition-all cursor-not-allowed group">
        <CardContent />
      </div>
    );
  }

  return (
    <Link
      to={path}
      className="relative bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition-all hover:scale-105 group block"
    >
      <CardContent />
    </Link>
  );
}

/**
 * Compact game card for smaller displays or lists
 */
export function CompactGameCard({
  id,
  title,
  icon,
  path,
  gradient,
  comingSoon = false
}: Pick<GameCardProps, 'id' | 'title' | 'icon' | 'path' | 'gradient' | 'comingSoon'>) {
  const highScore = getHighScore(id);

  const CardContent = () => (
    <div className="flex items-center gap-4 p-4">
      <div className={`text-4xl flex-shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center`}>
        {icon}
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-gray-900 dark:text-white truncate">
          {title}
        </h4>
        {highScore && highScore.score > 0 && !comingSoon && (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            High: {highScore.score}
          </div>
        )}
        {comingSoon && (
          <div className="text-sm text-gray-500 dark:text-gray-500">
            Coming Soon
          </div>
        )}
      </div>

      {!comingSoon && (
        <div className="flex-shrink-0">
          <div className="text-gray-400 dark:text-gray-500 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
            →
          </div>
        </div>
      )}
    </div>
  );

  if (comingSoon) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-all cursor-not-allowed opacity-75">
        <CardContent />
      </div>
    );
  }

  return (
    <Link
      to={path}
      className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-all group block"
    >
      <CardContent />
    </Link>
  );
}

/**
 * Featured game card with larger display
 */
export function FeaturedGameCard({
  id,
  title,
  description,
  icon,
  path,
  gradient,
  screenshot,
  comingSoon = false
}: GameCardProps & { screenshot?: string }) {
  const highScore = getHighScore(id);

  const CardContent = () => (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Left: Image/Screenshot */}
      <div className="relative h-64 md:h-full rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
        {screenshot ? (
          <img
            src={screenshot}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
            <div className="text-9xl opacity-50">{icon}</div>
          </div>
        )}
        {comingSoon && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white text-2xl font-bold">Coming Soon!</span>
          </div>
        )}
      </div>

      {/* Right: Details */}
      <div className="flex flex-col justify-between p-6">
        <div>
          <div className="text-5xl mb-4">{icon}</div>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
            {title}
          </h3>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
            {description}
          </p>

          {highScore && highScore.score > 0 && !comingSoon && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg mb-6">
              <span className="text-yellow-700 dark:text-yellow-400">🏆</span>
              <span className="font-medium text-yellow-700 dark:text-yellow-400">
                High Score: {highScore.score}
              </span>
            </div>
          )}
        </div>

        <div className={comingSoon ? 'opacity-50 cursor-not-allowed' : ''}>
          <div className={`px-8 py-4 bg-gradient-to-r ${gradient} text-white text-lg font-bold rounded-lg transition-all text-center ${
            comingSoon
              ? ''
              : 'hover:shadow-xl hover:scale-105'
          }`}>
            {comingSoon ? 'Coming Soon' : 'Play Now →'}
          </div>
        </div>
      </div>
    </div>
  );

  if (comingSoon) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
        <CardContent />
      </div>
    );
  }

  return (
    <Link
      to={path}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl hover:shadow-3xl transition-all block overflow-hidden group"
    >
      <CardContent />
    </Link>
  );
}

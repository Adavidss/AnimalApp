import React, { useState } from 'react';
import {
  getAchievements,
  getAchievementsByCategory,
  getOverallProgress,
  getAchievementProgress,
  getAchievementStats,
  type AchievementCategory,
} from '../utils/achievements';

export default function CollectionProgress() {
  const [selectedCategory, setSelectedCategory] = useState<AchievementCategory | 'all'>('all');

  const achievements = selectedCategory === 'all'
    ? getAchievements()
    : getAchievementsByCategory(selectedCategory);

  const overallProgress = getOverallProgress();
  const stats = getAchievementStats();

  const categories: Array<{ id: AchievementCategory | 'all'; label: string; icon: string }> = [
    { id: 'all', label: 'All', icon: '🌟' },
    { id: 'explorer', label: 'Explorer', icon: '🗺️' },
    { id: 'collector', label: 'Collector', icon: '📚' },
    { id: 'specialist', label: 'Specialist', icon: '🎓' },
    { id: 'enthusiast', label: 'Enthusiast', icon: '💪' },
    { id: 'master', label: 'Master', icon: '👑' },
  ];

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            Collection Progress
          </h3>
          <div className="text-right">
            <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">
              {stats.unlocked}/{stats.total}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Achievements</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
            <div
              className="bg-gradient-to-r from-primary-500 to-primary-600 h-full transition-all duration-500 rounded-full flex items-center justify-end pr-2"
              style={{ width: `${overallProgress}%` }}
            >
              {overallProgress > 10 && (
                <span className="text-xs font-bold text-white">{overallProgress}%</span>
              )}
            </div>
          </div>
          {overallProgress <= 10 && (
            <span className="absolute right-2 top-0 text-xs font-bold text-gray-600 dark:text-gray-400">
              {overallProgress}%
            </span>
          )}
        </div>

        {/* Category Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-6">
          {categories
            .filter((cat) => cat.id !== 'all')
            .map((cat) => {
              const categoryAchievements = getAchievementsByCategory(cat.id as AchievementCategory);
              const unlocked = categoryAchievements.filter((a) => a.unlocked).length;
              const total = categoryAchievements.length;

              return (
                <div
                  key={cat.id}
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center"
                >
                  <div className="text-2xl mb-1">{cat.icon}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                    {cat.label}
                  </div>
                  <div className="text-sm font-bold text-gray-900 dark:text-white">
                    {unlocked}/{total}
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Category Filter */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedCategory === cat.id
                  ? 'bg-primary-600 text-white shadow-md scale-105'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <span className="mr-1">{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {achievements.map((achievement) => {
          const progress = getAchievementProgress(achievement.id);

          return (
            <div
              key={achievement.id}
              className={`bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 transition-all ${
                achievement.unlocked
                  ? 'ring-2 ring-primary-500 shadow-lg'
                  : 'opacity-75'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div
                  className={`text-5xl ${
                    achievement.unlocked
                      ? 'filter-none'
                      : 'filter grayscale opacity-50'
                  }`}
                >
                  {achievement.icon}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                        {achievement.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {achievement.description}
                      </p>
                    </div>
                    {achievement.unlocked && (
                      <div className="ml-2">
                        <svg
                          className="w-6 h-6 text-green-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Progress Bar */}
                  {!achievement.unlocked && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {achievement.progress} / {achievement.requirement}
                        </span>
                        <span className="text-xs font-medium text-primary-600 dark:text-primary-400">
                          {Math.round(progress)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-primary-500 h-full transition-all duration-300 rounded-full"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Unlocked Badge */}
                  {achievement.unlocked && (
                    <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      Unlocked
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {achievements.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-12 text-center">
          <div className="text-6xl mb-4">🎯</div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            No achievements in this category
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Select a different category to view achievements
          </p>
        </div>
      )}
    </div>
  );
}

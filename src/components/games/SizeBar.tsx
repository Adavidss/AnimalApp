import { useState, useEffect } from 'react';

export interface SizeBarProps {
  animal1: {
    name: string;
    size: number; // in kg or cm
    image?: string;
  };
  animal2: {
    name: string;
    size: number;
    image?: string;
  };
  unit: string; // 'kg', 'cm', 'm', etc.
  showResult?: boolean;
  correctAnswer?: 1 | 2; // Which animal is actually larger
  userAnswer?: 1 | 2 | null;
  onReveal?: () => void;
}

export function SizeBar({
  animal1,
  animal2,
  unit,
  showResult = false,
  correctAnswer,
  userAnswer,
  onReveal
}: SizeBarProps) {
  const [animateReveal, setAnimateReveal] = useState(false);

  useEffect(() => {
    if (showResult) {
      setAnimateReveal(true);
    }
  }, [showResult]);

  const maxSize = Math.max(animal1.size, animal2.size);
  const animal1Percentage = (animal1.size / maxSize) * 100;
  const animal2Percentage = (animal2.size / maxSize) * 100;

  const getAnswerStyle = (animalNum: 1 | 2) => {
    if (!showResult || !userAnswer || !correctAnswer) return '';

    const isCorrect = correctAnswer === animalNum;
    const wasChosen = userAnswer === animalNum;

    if (isCorrect) {
      return 'ring-4 ring-green-500';
    } else if (wasChosen && !isCorrect) {
      return 'ring-4 ring-red-500';
    }
    return '';
  };

  return (
    <div className="space-y-8">
      {/* Animal 1 */}
      <div className={`transition-all duration-500 ${getAnswerStyle(1)}`}>
        <div className="flex items-center gap-4 mb-2">
          {animal1.image && (
            <img
              src={animal1.image}
              alt={animal1.name}
              className="w-16 h-16 rounded-full object-cover"
            />
          )}
          <div className="flex-1">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">
              {animal1.name}
            </h3>
            {showResult && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {animal1.size.toLocaleString()} {unit}
              </p>
            )}
          </div>
          {showResult && correctAnswer === 1 && (
            <div className="text-green-600 dark:text-green-400 text-2xl font-bold">
              ✓
            </div>
          )}
        </div>

        {/* Size bar */}
        <div className="relative w-full bg-gray-200 dark:bg-gray-700 rounded-full h-12 overflow-hidden">
          <div
            className={`bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full transition-all duration-1000 ease-out flex items-center justify-end pr-4 ${
              animateReveal ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              width: showResult ? `${animal1Percentage}%` : '0%'
            }}
          >
            {showResult && animal1Percentage > 20 && (
              <span className="text-white font-bold">
                {animal1.size.toLocaleString()} {unit}
              </span>
            )}
          </div>
          {!showResult && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-gray-500 dark:text-gray-400 font-medium">
                ???
              </span>
            </div>
          )}
        </div>
      </div>

      {/* VS Divider */}
      <div className="flex items-center justify-center">
        <div className="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full font-bold text-xl">
          VS
        </div>
      </div>

      {/* Animal 2 */}
      <div className={`transition-all duration-500 ${getAnswerStyle(2)}`}>
        <div className="flex items-center gap-4 mb-2">
          {animal2.image && (
            <img
              src={animal2.image}
              alt={animal2.name}
              className="w-16 h-16 rounded-full object-cover"
            />
          )}
          <div className="flex-1">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">
              {animal2.name}
            </h3>
            {showResult && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {animal2.size.toLocaleString()} {unit}
              </p>
            )}
          </div>
          {showResult && correctAnswer === 2 && (
            <div className="text-green-600 dark:text-green-400 text-2xl font-bold">
              ✓
            </div>
          )}
        </div>

        {/* Size bar */}
        <div className="relative w-full bg-gray-200 dark:bg-gray-700 rounded-full h-12 overflow-hidden">
          <div
            className={`bg-gradient-to-r from-blue-500 to-teal-500 h-full rounded-full transition-all duration-1000 ease-out flex items-center justify-end pr-4 ${
              animateReveal ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              width: showResult ? `${animal2Percentage}%` : '0%'
            }}
          >
            {showResult && animal2Percentage > 20 && (
              <span className="text-white font-bold">
                {animal2.size.toLocaleString()} {unit}
              </span>
            )}
          </div>
          {!showResult && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-gray-500 dark:text-gray-400 font-medium">
                ???
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Result Message */}
      {showResult && userAnswer && correctAnswer && (
        <div className={`text-center p-4 rounded-lg ${
          userAnswer === correctAnswer
            ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
            : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
        }`}>
          <div className="font-bold text-xl mb-2">
            {userAnswer === correctAnswer ? '✓ Correct!' : '✗ Incorrect'}
          </div>
          <div className="text-sm">
            {correctAnswer === 1 ? animal1.name : animal2.name} is {' '}
            {Math.abs(animal1.size - animal2.size).toLocaleString()} {unit} {' '}
            {correctAnswer === 1 ? 'heavier' : 'lighter'}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Simplified size comparison component for quick comparisons
 */
export function SimpleSizeComparison({
  items,
  unit = 'kg',
  title
}: {
  items: Array<{
    name: string;
    value: number;
    color?: string;
  }>;
  unit?: string;
  title?: string;
}) {
  const maxValue = Math.max(...items.map(i => i.value));

  const getColor = (index: number, customColor?: string) => {
    if (customColor) return customColor;
    const colors = [
      'bg-purple-500',
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-red-500'
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="space-y-4">
      {title && (
        <h3 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-6">
          {title}
        </h3>
      )}

      {items.map((item, index) => {
        const percentage = (item.value / maxValue) * 100;
        const color = getColor(index, item.color);

        return (
          <div key={index}>
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium text-gray-900 dark:text-white">
                {item.name}
              </span>
              <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                {item.value.toLocaleString()} {unit}
              </span>
            </div>

            <div className="relative w-full bg-gray-200 dark:bg-gray-700 rounded-full h-8 overflow-hidden">
              <div
                className={`${color} h-full rounded-full transition-all duration-1000 ease-out`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Visual size comparison with shapes/silhouettes
 */
export function VisualSizeComparison({
  items,
  showValues = true
}: {
  items: Array<{
    name: string;
    size: number;
    image?: string;
  }>;
  showValues?: boolean;
}) {
  const maxSize = Math.max(...items.map(i => i.size));

  return (
    <div className="flex items-end justify-center gap-8 p-8 min-h-[300px]">
      {items.map((item, index) => {
        const sizePercentage = (item.size / maxSize) * 100;
        const displaySize = Math.max(sizePercentage, 20); // Minimum 20% for visibility

        return (
          <div key={index} className="flex flex-col items-center gap-3">
            {/* Visual representation */}
            <div
              className="relative rounded-lg overflow-hidden shadow-lg transition-all hover:scale-105"
              style={{
                width: `${displaySize}px`,
                height: `${displaySize}px`
              }}
            >
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400" />
              )}
            </div>

            {/* Label */}
            <div className="text-center">
              <div className="font-medium text-gray-900 dark:text-white text-sm">
                {item.name}
              </div>
              {showValues && (
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {item.size.toLocaleString()}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

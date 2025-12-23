import { useEffect, useState } from 'react';

export interface FlipCardProps {
  id: string;
  frontImage?: string;
  frontText?: string;
  backImage?: string;
  isFlipped: boolean;
  isMatched: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export function FlipCard({
  id,
  frontImage,
  frontText,
  backImage = '/card-back.png', // Default back pattern
  isFlipped,
  isMatched,
  onClick,
  disabled = false
}: FlipCardProps) {
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    if (isFlipped) {
      setShouldAnimate(true);
    }
  }, [isFlipped]);

  const handleClick = () => {
    if (!disabled && !isFlipped && !isMatched) {
      onClick();
    }
  };

  return (
    <div
      className={`flip-card ${isMatched ? 'matched' : ''} ${disabled ? 'disabled' : ''}`}
      onClick={handleClick}
      role="button"
      tabIndex={disabled || isMatched ? -1 : 0}
      onKeyPress={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      aria-label={`Card ${id}${isMatched ? ' matched' : ''}${isFlipped ? ' flipped' : ''}`}
    >
      <div className={`flip-card-inner ${isFlipped || isMatched ? 'flipped' : ''}`}>
        {/* Front of card (face up - shows image) */}
        <div className="flip-card-front">
          {frontImage ? (
            <img
              src={frontImage}
              alt={frontText || 'Animal card'}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gradient-to-br from-purple-400 to-pink-400 text-white text-2xl font-bold">
              {frontText || '?'}
            </div>
          )}
          {isMatched && (
            <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
              <span className="text-6xl">✓</span>
            </div>
          )}
        </div>

        {/* Back of card (face down) */}
        <div className="flip-card-back">
          <div className="w-full h-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center">
            <div className="text-white text-6xl opacity-30">
              🐾
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .flip-card {
          perspective: 1000px;
          cursor: pointer;
          width: 100%;
          aspect-ratio: 3/4;
          transition: transform 0.2s;
        }

        .flip-card:hover:not(.disabled):not(.matched) {
          transform: scale(1.05);
        }

        .flip-card.disabled {
          cursor: not-allowed;
          opacity: 0.6;
        }

        .flip-card.matched {
          cursor: default;
          opacity: 0.7;
        }

        .flip-card-inner {
          position: relative;
          width: 100%;
          height: 100%;
          text-align: center;
          transition: transform 0.6s;
          transform-style: preserve-3d;
        }

        .flip-card-inner.flipped {
          transform: rotateY(180deg);
        }

        .flip-card-front,
        .flip-card-back {
          position: absolute;
          width: 100%;
          height: 100%;
          -webkit-backface-visibility: hidden;
          backface-visibility: hidden;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .flip-card-front {
          transform: rotateY(180deg);
        }

        .flip-card-back {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        @media (prefers-reduced-motion: reduce) {
          .flip-card-inner {
            transition: none;
          }
        }
      `}</style>
    </div>
  );
}

/**
 * Simple card component for non-flip card games
 */
export interface SimpleCardProps {
  image?: string;
  title?: string;
  subtitle?: string;
  onClick?: () => void;
  selected?: boolean;
  disabled?: boolean;
  className?: string;
}

export function SimpleCard({
  image,
  title,
  subtitle,
  onClick,
  selected = false,
  disabled = false,
  className = ''
}: SimpleCardProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative overflow-hidden rounded-xl transition-all duration-200
        ${selected ? 'ring-4 ring-purple-500 scale-105' : 'hover:scale-105'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
    >
      {image && (
        <img
          src={image}
          alt={title || 'Card'}
          className="w-full h-48 object-cover"
        />
      )}

      {(title || subtitle) && (
        <div className="p-4 bg-white dark:bg-gray-800">
          {title && (
            <h3 className="font-bold text-gray-900 dark:text-white">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {subtitle}
            </p>
          )}
        </div>
      )}

      {selected && (
        <div className="absolute top-2 right-2 bg-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center">
          ✓
        </div>
      )}
    </button>
  );
}

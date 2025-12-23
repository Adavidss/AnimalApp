import React, { useState, useRef, useEffect } from 'react';
import { XenoCantoRecording } from '../types/animal';

interface SoundPlayerProps {
  recordings: XenoCantoRecording[];
  animalName: string;
}

export default function SoundPlayer({ recordings, animalName }: SoundPlayerProps) {
  const [currentTrack, setCurrentTrack] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.load();
      setIsPlaying(false);
      setCurrentTime(0);
    }
  }, [currentTrack]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    if (currentTrack < recordings.length - 1) {
      setCurrentTrack(currentTrack + 1);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const formatTime = (seconds: number): string => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getQualityColor = (quality: string): string => {
    switch (quality) {
      case 'A': return 'text-green-600 dark:text-green-400';
      case 'B': return 'text-blue-600 dark:text-blue-400';
      case 'C': return 'text-yellow-600 dark:text-yellow-400';
      case 'D': return 'text-orange-600 dark:text-orange-400';
      case 'E': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  if (!recordings || recordings.length === 0) {
    return (
      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-8 text-center">
        <svg
          className="w-16 h-16 mx-auto mb-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
          />
        </svg>
        <p className="text-gray-600 dark:text-gray-400">
          No sound recordings available for this species
        </p>
      </div>
    );
  }

  const recording = recordings[currentTrack];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      {/* Sonogram */}
      {recording.sono && recording.sono.med && (
        <div className="relative bg-black">
          <img
            src={recording.sono.med}
            alt={`Sonogram of ${animalName} ${recording.type}`}
            className="w-full h-48 object-contain"
          />
          <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
            Sonogram
          </div>
        </div>
      )}

      {/* Player Controls */}
      <div className="p-6 space-y-4">
        {/* Track Info */}
        <div>
          <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
            {recording.en || animalName} - {recording.type || 'Recording'}
          </h4>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <span>Recorded by {recording.rec}</span>
            <span>•</span>
            <span>{recording.cnt}</span>
            {recording.q && (
              <>
                <span>•</span>
                <span className={`font-semibold ${getQualityColor(recording.q)}`}>
                  Quality: {recording.q}
                </span>
              </>
            )}
          </div>
          {recording.loc && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              📍 {recording.loc}
            </p>
          )}
        </div>

        {/* Audio Element */}
        <audio
          ref={audioRef}
          src={`https:${recording.file}`}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
          preload="metadata"
        />

        {/* Progress Bar */}
        <div className="space-y-2">
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary-600"
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setCurrentTrack(Math.max(0, currentTrack - 1))}
            disabled={currentTrack === 0}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Previous track"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
            </svg>
          </button>

          <button
            onClick={togglePlay}
            className="p-4 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg transition-colors"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          <button
            onClick={() => setCurrentTrack(Math.min(recordings.length - 1, currentTrack + 1))}
            disabled={currentTrack === recordings.length - 1}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Next track"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M16 18h2V6h-2v12zM6 18l8.5-6L6 6v12z" />
            </svg>
          </button>
        </div>

        {/* Track List */}
        {recordings.length > 1 && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h5 className="font-semibold text-gray-900 dark:text-white mb-3">
              All Recordings ({recordings.length})
            </h5>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {recordings.map((rec, index) => (
                <button
                  key={rec.id}
                  onClick={() => setCurrentTrack(index)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    index === currentTrack
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-900 dark:text-primary-100'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{rec.type || 'Recording'}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {rec.rec} • {rec.date || 'Unknown date'}
                      </p>
                    </div>
                    {rec.q && (
                      <span className={`text-sm font-semibold ml-2 ${getQualityColor(rec.q)}`}>
                        {rec.q}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Attribution */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Recordings from{' '}
            <a
              href={`https://xeno-canto.org/${recording.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 hover:text-primary-700 underline"
            >
              xeno-canto.org
            </a>
            {' '}(CC BY-NC-SA 4.0)
          </p>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchAnimalSounds } from '../../api/xenocanto';
import { fetchUnsplashImages } from '../../api/images';
import {
  getRandomAnimals,
  getWrongAnswers,
  SoundAnimal,
  getAnimalCount
} from '../../data/soundGameAnimals';
import {
  saveHighScore,
  getHighScore,
  playSound,
  incrementGamePlayCount
} from '../../utils/gameHelpers';

type Difficulty = 'easy' | 'medium' | 'hard';

interface GameRound {
  correctAnimal: SoundAnimal;
  options: SoundAnimal[];
  soundUrl?: string;
  images: { [key: string]: string };
}

interface GameStats {
  correct: number;
  incorrect: number;
  streak: number;
  fastestTime: number;
  totalTime: number;
}

const ROUNDS_PER_GAME = 10;

export default function SoundMatch() {
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [gameStarted, setGameStarted] = useState(false);
  const [currentRound, setCurrentRound] = useState(0);
  const [rounds, setRounds] = useState<GameRound[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<GameStats>({
    correct: 0,
    incorrect: 0,
    streak: 0,
    fastestTime: 0,
    totalTime: 0
  });
  const [roundStartTime, setRoundStartTime] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScoreState] = useState<{ score: number; date?: string } | null>(null);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  // Load high score
  useEffect(() => {
    const saved = getHighScore('sound_match');
    setHighScoreState(saved);
  }, []);

  const startGame = useCallback(async () => {
    setLoading(true);
    setGameStarted(false);
    setGameWon(false);
    setCurrentRound(0);
    setImageErrors(new Set()); // Reset image errors
    setStats({
      correct: 0,
      incorrect: 0,
      streak: 0,
      fastestTime: 0,
      totalTime: 0
    });
    setScore(0);

    try {
      // Get random animals for this game
      const gameAnimals = getRandomAnimals(ROUNDS_PER_GAME, difficulty);

      // Fetch all images and sounds in parallel for faster loading
      const roundsPromises = gameAnimals.map(async (animal) => {
        // Get 3 wrong answers
        const wrongAnswers = getWrongAnswers(animal, 3);
        const allOptions = [animal, ...wrongAnswers].sort(() => Math.random() - 0.5);

        // Fetch images for all options in parallel
        const imagePromises = allOptions.map(async (option) => {
          try {
            // Add timeout to prevent hanging
            const imagePromise = fetchUnsplashImages(option.name, 1);
            const timeoutPromise = new Promise<typeof fetchUnsplashImages extends (...args: any[]) => Promise<infer T> ? T : never>((_, reject) => 
              setTimeout(() => reject(new Error('timeout')), 3000)
            );
            
            const imageResults = await Promise.race([imagePromise, timeoutPromise]);
            return {
              name: option.name,
              url: imageResults[0]?.urls?.small || imageResults[0]?.urls?.thumb || imageResults[0]?.urls?.regular || ''
            };
          } catch (error) {
            return { name: option.name, url: '' };
          }
        });

        const imageResults = await Promise.all(imagePromises);
        const images: { [key: string]: string } = {};
        imageResults.forEach(result => {
          images[result.name] = result.url;
        });

        // Fetch sound for correct animal (with timeout)
        let soundUrl = '';
        try {
          const soundPromise = fetchAnimalSounds(animal.scientificName, 5);
          const timeoutPromise = new Promise<typeof fetchAnimalSounds extends (...args: any[]) => Promise<infer T> ? T : never>((_, reject) => 
            setTimeout(() => reject(new Error('timeout')), 4000)
          );
          
          const sounds = await Promise.race([soundPromise, timeoutPromise]);
          if (sounds && Array.isArray(sounds) && sounds.length > 0) {
            // Filter for quality and normalize URL
            const goodRecordings = sounds.filter((s: any) => s && s.q && ['A', 'B', 'C'].includes(s.q));
            const recordingsToUse = goodRecordings.length > 0 ? goodRecordings : sounds;
            const bestSound = recordingsToUse[0];
            
            if (bestSound && bestSound.file) {
              // Normalize sound URL
              let normalizedUrl = bestSound.file;
              if (normalizedUrl.startsWith('//')) {
                normalizedUrl = `https:${normalizedUrl}`;
              } else if (!normalizedUrl.startsWith('http') && bestSound.id) {
                normalizedUrl = `https://xeno-canto.org/${bestSound.id}/download`;
              }
              soundUrl = normalizedUrl;
            }
          }
        } catch (error) {
          // Continue without sound
        }

        return {
          correctAnimal: animal,
          options: allOptions,
          soundUrl,
          images
        };
      });

      const preparedRounds = await Promise.all(roundsPromises);

      setRounds(preparedRounds);
      setGameStarted(true);
      setRoundStartTime(Date.now());
    } catch (error) {
      console.error('Failed to start game:', error);
      alert('Failed to load game. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [difficulty]);

  const playRoundSound = useCallback(() => {
    const round = rounds[currentRound];
    if (!round?.soundUrl) {
      setAudioError(true);
      return;
    }

    setAudioError(false);

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    const audio = new Audio(round.soundUrl);
    audioRef.current = audio;

    audio.addEventListener('playing', () => setAudioPlaying(true));
    audio.addEventListener('ended', () => setAudioPlaying(false));
    audio.addEventListener('error', () => {
      setAudioError(true);
      setAudioPlaying(false);
    });

    audio.play().catch(error => {
      console.error('Failed to play audio:', error);
      setAudioError(true);
      setAudioPlaying(false);
    });
  }, [rounds, currentRound]);

  const stopSound = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setAudioPlaying(false);
    }
  }, []);

  const handleAnswer = (animalName: string) => {
    if (answered) return;

    const round = rounds[currentRound];
    const isCorrect = animalName === round.correctAnimal.name;
    const roundTime = Date.now() - roundStartTime;

    setSelectedAnswer(animalName);
    setAnswered(true);
    stopSound();

    // Update stats
    setStats(prev => {
      const newStreak = isCorrect ? prev.streak + 1 : 0;
      const newFastest = prev.fastestTime === 0 || (isCorrect && roundTime < prev.fastestTime)
        ? roundTime
        : prev.fastestTime;

      return {
        correct: prev.correct + (isCorrect ? 1 : 0),
        incorrect: prev.incorrect + (isCorrect ? 0 : 1),
        streak: newStreak,
        fastestTime: newFastest,
        totalTime: prev.totalTime + roundTime
      };
    });

    // Play sound effect
    playSound(isCorrect ? 'match' : 'wrong');

    // Auto-advance after 2 seconds
    setTimeout(() => {
      if (currentRound < ROUNDS_PER_GAME - 1) {
        setCurrentRound(prev => prev + 1);
        setSelectedAnswer(null);
        setAnswered(false);
        setAudioError(false);
        setRoundStartTime(Date.now());
      } else {
        // Game complete
        endGame(isCorrect);
      }
    }, 2000);
  };

  const endGame = (lastAnswerCorrect: boolean) => {
    const finalStats = {
      ...stats,
      correct: stats.correct + (lastAnswerCorrect ? 1 : 0),
      incorrect: stats.incorrect + (lastAnswerCorrect ? 0 : 1)
    };

    const accuracy = (finalStats.correct / ROUNDS_PER_GAME) * 100;
    const avgTime = finalStats.totalTime / ROUNDS_PER_GAME;
    const finalScore = Math.round(
      accuracy * 10 + // Up to 1000 points for accuracy
      (finalStats.streak * 50) + // Bonus for streaks
      Math.max(0, 5000 - avgTime) / 10 // Speed bonus
    );

    setScore(finalScore);
    setGameWon(true);

    // Save high score
    saveHighScore('sound_match', finalScore, {
      difficulty,
      correct: finalStats.correct,
      accuracy: accuracy.toFixed(1),
      avgTime: Math.round(avgTime)
    });

    // Update high score display
    const currentHigh = getHighScore('sound_match');
    if (currentHigh && currentHigh.score > (highScore?.score || 0)) {
      setHighScoreState(currentHigh);
    }

    playSound('win');
    incrementGamePlayCount('sound_match');
  };

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const getDifficultyColor = (diff: Difficulty) => {
    switch (diff) {
      case 'easy':
        return 'bg-green-500 hover:bg-green-600';
      case 'medium':
        return 'bg-yellow-500 hover:bg-yellow-600';
      case 'hard':
        return 'bg-red-500 hover:bg-red-600';
    }
  };

  // Start screen
  if (!gameStarted && !loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-8">
            <div className="text-8xl mb-4">🔊</div>
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Sound Match
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Listen to animal sounds and identify the correct animal!
            </p>
          </div>

          {/* High Score */}
          {highScore && highScore.score > 0 && (
            <div className="bg-gradient-to-r from-purple-400 to-pink-500 rounded-xl p-6 shadow-lg mb-8 text-center">
              <div className="text-white">
                <div className="text-sm font-medium mb-1">High Score</div>
                <div className="text-4xl font-bold">{highScore.score}</div>
              </div>
            </div>
          )}

          {/* Difficulty Selection */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              Choose Difficulty
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(['easy', 'medium', 'hard'] as Difficulty[]).map(diff => {
                const count = getAnimalCount(diff);
                const isSelected = difficulty === diff;

                return (
                  <button
                    key={diff}
                    onClick={() => setDifficulty(diff)}
                    className={`p-6 rounded-lg transition-all ${
                      isSelected
                        ? getDifficultyColor(diff) + ' text-white scale-105'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:scale-105'
                    }`}
                  >
                    <div className="text-3xl mb-2">
                      {diff === 'easy' ? '😊' : diff === 'medium' ? '🤔' : '🔥'}
                    </div>
                    <div className="font-bold text-xl capitalize mb-2">{diff}</div>
                    <div className={`text-sm ${isSelected ? 'text-white/90' : 'text-gray-600 dark:text-gray-400'}`}>
                      {count} animal sounds
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              onClick={startGame}
              className="w-full mt-8 px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white text-lg font-bold rounded-lg transition-colors shadow-lg hover:shadow-xl"
            >
              Start Game
            </button>
          </div>

          {/* How to Play */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              How to Play
            </h3>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
              <li className="flex items-start gap-2">
                <span>🎵</span>
                <span>Listen to the animal sound by clicking the play button</span>
              </li>
              <li className="flex items-start gap-2">
                <span>🖼️</span>
                <span>Look at the 4 animal options with images</span>
              </li>
              <li className="flex items-start gap-2">
                <span>👆</span>
                <span>Click on the animal you think made the sound</span>
              </li>
              <li className="flex items-start gap-2">
                <span>⏱️</span>
                <span>Answer quickly for bonus points!</span>
              </li>
              <li className="flex items-start gap-2">
                <span>🏆</span>
                <span>Complete {ROUNDS_PER_GAME} rounds to finish the game</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // Loading screen
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🔊</div>
          <div className="text-xl text-gray-600 dark:text-gray-400">
            Loading sounds and images...
          </div>
        </div>
      </div>
    );
  }

  // Win screen
  if (gameWon) {
    const accuracy = (stats.correct / ROUNDS_PER_GAME) * 100;
    const avgTime = stats.totalTime / ROUNDS_PER_GAME;

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-center mb-8">
            <div className="text-8xl mb-4">🏆</div>
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Game Complete!
            </h1>
            <p className="text-2xl text-gray-600 dark:text-gray-400">
              Great listening skills!
            </p>
          </div>

          {/* Score Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg mb-6">
            <div className="text-center mb-6">
              <div className="text-6xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                {score}
              </div>
              <div className="text-lg text-gray-700 dark:text-gray-300">
                Final Score
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {stats.correct}/{ROUNDS_PER_GAME}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Correct</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {accuracy.toFixed(0)}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Accuracy</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {stats.streak}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Best Streak</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {(avgTime / 1000).toFixed(1)}s
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Avg Time</div>
              </div>
            </div>

            {highScore && score > highScore.score && (
              <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-center">
                <div className="text-yellow-700 dark:text-yellow-400 font-bold">
                  🎉 New High Score!
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={startGame}
              className="flex-1 px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white text-lg font-bold rounded-lg transition-colors shadow-lg hover:shadow-xl"
            >
              Play Again
            </button>
            <button
              onClick={() => {
                setGameStarted(false);
                setGameWon(false);
              }}
              className="flex-1 px-8 py-4 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white text-lg font-bold rounded-lg transition-colors"
            >
              Change Difficulty
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Game screen
  const round = rounds[currentRound];
  if (!round) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => {
                if (confirm('Are you sure you want to quit? Your progress will be lost.')) {
                  stopSound();
                  setGameStarted(false);
                }
              }}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-colors"
            >
              ← Quit
            </button>

            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {currentRound + 1}/{ROUNDS_PER_GAME}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Round</div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {stats.correct}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Correct</div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {stats.streak}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Streak</div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentRound + 1) / ROUNDS_PER_GAME) * 100}%` }}
            />
          </div>
        </div>

        {/* Sound Player */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            What animal makes this sound?
          </h2>

          <div className="flex flex-col items-center gap-4">
            <button
              onClick={audioPlaying ? stopSound : playRoundSound}
              disabled={!round.soundUrl || audioError}
              className={`w-32 h-32 rounded-full flex items-center justify-center text-6xl transition-all shadow-lg ${
                audioPlaying
                  ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                  : 'bg-purple-600 hover:bg-purple-700'
              } ${(!round.soundUrl || audioError) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {audioPlaying ? '⏸️' : '▶️'}
            </button>

            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400">
                {!round.soundUrl || audioError
                  ? 'Sound not available'
                  : audioPlaying
                  ? 'Playing sound...'
                  : 'Click to play sound'}
              </p>
            </div>

            {/* Waveform Animation */}
            {audioPlaying && (
              <div className="flex items-center gap-1">
                {[...Array(10)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-purple-600 rounded-full animate-pulse"
                    style={{
                      height: `${Math.random() * 40 + 20}px`,
                      animationDelay: `${i * 0.1}s`
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Answer Options */}
        <div className="grid grid-cols-2 gap-4">
          {round.options.map((animal) => {
            const isSelected = selectedAnswer === animal.name;
            const isCorrect = animal.name === round.correctAnimal.name;
            const showResult = answered;

            let buttonClass = 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border-2 border-gray-200 dark:border-gray-600';

            if (showResult) {
              if (isCorrect) {
                buttonClass = 'bg-green-100 dark:bg-green-900/30 border-2 border-green-500';
              } else if (isSelected && !isCorrect) {
                buttonClass = 'bg-red-100 dark:bg-red-900/30 border-2 border-red-500';
              }
            }

            return (
              <button
                key={animal.name}
                onClick={() => handleAnswer(animal.name)}
                disabled={answered}
                className={`p-4 rounded-xl transition-all ${buttonClass} ${
                  answered ? 'cursor-default' : 'cursor-pointer'
                }`}
              >
                {round.images[animal.name] && !imageErrors.has(animal.name) ? (
                  <img
                    src={round.images[animal.name]}
                    alt={animal.name}
                    className="w-full h-40 object-cover rounded-lg mb-3"
                    onError={() => {
                      setImageErrors(prev => new Set(prev).add(animal.name));
                    }}
                  />
                ) : (
                  <div className="w-full h-40 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg mb-3 flex items-center justify-center">
                    <span className="text-white text-xl font-bold text-center px-2">
                      {animal.name}
                    </span>
                  </div>
                )}
                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">
                  {animal.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                  {animal.scientificName}
                </p>

                {showResult && isCorrect && (
                  <div className="mt-3 text-green-600 dark:text-green-400 font-bold">
                    ✓ Correct!
                  </div>
                )}
                {showResult && isSelected && !isCorrect && (
                  <div className="mt-3 text-red-600 dark:text-red-400 font-bold">
                    ✗ Wrong
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import {
  quizQuestions,
  getRandomQuestions,
  QuizQuestion,
  QuizDifficulty,
  QuizCategory
} from '../data/quizQuestions';
import { fetchUnsplashImages } from '../api/images';
import { fetchAnimalSounds } from '../api/xenocanto';

interface QuizStats {
  totalQuizzes: number;
  totalCorrect: number;
  totalQuestions: number;
  bestStreak: number;
  currentStreak: number;
  lastPlayed: string;
}

export default function Quiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState<number[]>([]);
  const [quizStarted, setQuizStarted] = useState(false);

  // New state for filters and modes
  const [selectedDifficulty, setSelectedDifficulty] = useState<QuizDifficulty | undefined>(undefined);
  const [selectedCategory, setSelectedCategory] = useState<QuizCategory>('all');
  const [isDailyChallenge, setIsDailyChallenge] = useState(false);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [stats, setStats] = useState<QuizStats>({
    totalQuizzes: 0,
    totalCorrect: 0,
    totalQuestions: 0,
    bestStreak: 0,
    currentStreak: 0,
    lastPlayed: ''
  });

  // Image and sound loading states
  const [questionImage, setQuestionImage] = useState<string | null>(null);
  const [questionSound, setQuestionSound] = useState<string | null>(null);
  const [loadingMedia, setLoadingMedia] = useState(false);

  // Load stats from localStorage on mount
  useEffect(() => {
    const savedStats = localStorage.getItem('animal_atlas_quiz_stats');
    if (savedStats) {
      setStats(JSON.parse(savedStats));
    }
  }, []);

  // Load media for current question
  useEffect(() => {
    if (quizStarted && questions.length > 0 && currentQuestion < questions.length) {
      const question = questions[currentQuestion];

      if (question.type === 'image' && question.imageQuery) {
        setLoadingMedia(true);
        fetchUnsplashImages(question.imageQuery, 1).then(images => {
          if (images && images.length > 0) {
            setQuestionImage(images[0].urls.small);
          }
          setLoadingMedia(false);
        });
      } else if (question.type === 'sound' && question.soundAnimal) {
        setLoadingMedia(true);
        fetchAnimalSounds(question.soundAnimal, 1).then(sounds => {
          if (sounds && sounds.length > 0) {
            setQuestionSound(sounds[0].file);
          }
          setLoadingMedia(false);
        });
      } else {
        setQuestionImage(null);
        setQuestionSound(null);
      }
    }
  }, [quizStarted, questions, currentQuestion]);

  const getDailyQuestions = (): QuizQuestion[] => {
    // Use today's date as seed for consistent daily questions
    const today = new Date().toDateString();
    const seed = today.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

    // Shuffle with seed
    const shuffled = [...quizQuestions];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = ((seed + i) * 2654435761) % (i + 1);
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled.slice(0, 10);
  };

  const handleStart = (daily = false) => {
    setIsDailyChallenge(daily);
    setQuizStarted(true);
    setCurrentQuestion(0);
    setScore(0);
    setAnsweredQuestions([]);
    setShowResult(false);
    setSelectedAnswer(null);
    setCurrentStreak(0);

    // Generate questions based on mode and filters
    if (daily) {
      setQuestions(getDailyQuestions());
    } else {
      const filtered = getRandomQuestions(10, {
        difficulty: selectedDifficulty,
        category: selectedCategory
      });
      setQuestions(filtered);
    }
  };

  const handleAnswer = (answerIndex: number) => {
    if (selectedAnswer !== null) return; // Already answered

    setSelectedAnswer(answerIndex);

    const isCorrect = answerIndex === questions[currentQuestion].correctAnswer;

    if (isCorrect) {
      setScore(score + 1);
      setCurrentStreak(currentStreak + 1);
    } else {
      setCurrentStreak(0);
    }

    setAnsweredQuestions([...answeredQuestions, questions[currentQuestion].id]);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
    } else {
      setShowResult(true);
      saveQuizStats();
    }
  };

  const saveQuizStats = () => {
    const newStats: QuizStats = {
      totalQuizzes: stats.totalQuizzes + 1,
      totalCorrect: stats.totalCorrect + score,
      totalQuestions: stats.totalQuestions + questions.length,
      bestStreak: Math.max(stats.bestStreak, currentStreak),
      currentStreak: currentStreak,
      lastPlayed: new Date().toISOString()
    };

    setStats(newStats);
    localStorage.setItem('animal_atlas_quiz_stats', JSON.stringify(newStats));
    
    // Track for achievements
    import('../utils/achievements').then(({ trackQuizCompletion }) => {
      trackQuizCompletion();
    }).catch(() => {
      // Ignore if achievements module not available
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'hard':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getScoreMessage = () => {
    const percentage = (score / questions.length) * 100;
    if (percentage >= 90) return { emoji: '🏆', message: 'Outstanding! You\'re an animal expert!' };
    if (percentage >= 70) return { emoji: '🌟', message: 'Great job! You know your animals!' };
    if (percentage >= 50) return { emoji: '👍', message: 'Good effort! Keep learning!' };
    return { emoji: '📚', message: 'Keep exploring to learn more!' };
  };

  // Start screen with new options
  if (!quizStarted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-8">
            <div className="text-8xl mb-4">🎮</div>
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Animal Quiz
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Test your knowledge about the animal kingdom!
            </p>
          </div>

          {/* Stats Overview */}
          {stats.totalQuizzes > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg mb-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Your Stats
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                    {stats.totalQuizzes}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Quizzes Taken</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {stats.totalQuestions > 0
                      ? Math.round((stats.totalCorrect / stats.totalQuestions) * 100)
                      : 0}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Accuracy</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                    {stats.bestStreak}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Best Streak</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {stats.totalCorrect}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Correct</div>
                </div>
              </div>
            </div>
          )}

          {/* Daily Challenge */}
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 shadow-lg mb-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">🌟 Daily Challenge</h2>
                <p className="text-purple-100">
                  Same 10 questions for everyone today!
                </p>
              </div>
              <button
                onClick={() => handleStart(true)}
                className="px-6 py-3 bg-white text-purple-600 font-bold rounded-lg hover:bg-gray-100 transition-colors"
              >
                Start Challenge
              </button>
            </div>
          </div>

          {/* Quiz Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Custom Quiz
            </h2>

            {/* Category Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {(['all', 'mammals', 'birds', 'reptiles', 'fish', 'marine'] as QuizCategory[]).map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`p-3 rounded-lg font-medium transition-all ${
                      selectedCategory === cat
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {cat === 'all' ? '🌍 All Animals' :
                     cat === 'mammals' ? '🦁 Mammals' :
                     cat === 'birds' ? '🦅 Birds' :
                     cat === 'reptiles' ? '🦎 Reptiles' :
                     cat === 'fish' ? '🐠 Fish' :
                     '🐋 Marine Life'}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Difficulty
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button
                  onClick={() => setSelectedDifficulty(undefined)}
                  className={`p-3 rounded-lg font-medium transition-all ${
                    selectedDifficulty === undefined
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  All Levels
                </button>
                {(['easy', 'medium', 'hard'] as QuizDifficulty[]).map(diff => (
                  <button
                    key={diff}
                    onClick={() => setSelectedDifficulty(diff)}
                    className={`p-3 rounded-lg font-medium transition-all ${
                      selectedDifficulty === diff
                        ? diff === 'easy' ? 'bg-green-600 text-white' :
                          diff === 'medium' ? 'bg-yellow-600 text-white' :
                          'bg-red-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {diff === 'easy' ? '😊 Easy' :
                     diff === 'medium' ? '🤔 Medium' :
                     '🔥 Hard'}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => handleStart(false)}
              className="w-full px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white text-lg font-bold rounded-lg transition-colors shadow-lg hover:shadow-xl"
            >
              Start Custom Quiz
            </button>
          </div>

          {/* Quiz Info */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Quiz Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <span>✅</span> 50+ unique questions
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <span>📷</span> Image-based questions
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <span>🔊</span> Sound-based questions
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <span>🏆</span> Track your streak
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <span>📊</span> Lifetime statistics
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <span>🎯</span> Daily challenges
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Results screen
  if (showResult) {
    const scoreMsg = getScoreMessage();
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-center mb-8">
            <div className="text-8xl mb-4">{scoreMsg.emoji}</div>
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Quiz Complete!
            </h1>
            <p className="text-2xl text-gray-600 dark:text-gray-400">
              {scoreMsg.message}
            </p>
          </div>

          {/* Score Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg mb-6">
            <div className="text-center mb-6">
              <div className="text-6xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                {score}/{questions.length}
              </div>
              <div className="text-xl text-gray-700 dark:text-gray-300">
                {Math.round((score / questions.length) * 100)}% Correct
              </div>
            </div>

            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-6">
              <div
                className="bg-purple-600 h-4 rounded-full transition-all duration-500"
                style={{ width: `${(score / questions.length) * 100}%` }}
              />
            </div>

            {/* Streak Info */}
            {currentStreak > 0 && (
              <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                  🔥 {currentStreak}
                </div>
                <div className="text-sm text-orange-700 dark:text-orange-300">
                  Best Streak This Quiz
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => handleStart(isDailyChallenge)}
              className="flex-1 px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white text-lg font-bold rounded-lg transition-colors shadow-lg hover:shadow-xl"
            >
              Try Again
            </button>
            <button
              onClick={() => setQuizStarted(false)}
              className="flex-1 px-8 py-4 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white text-lg font-bold rounded-lg transition-colors"
            >
              Back to Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];

  // Quiz question screen
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-3xl mx-auto px-4">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Question {currentQuestion + 1} of {questions.length}
            </span>
            <div className="flex items-center gap-4">
              {currentStreak > 0 && (
                <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
                  🔥 {currentStreak} streak
                </span>
              )}
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Score: {score}
              </span>
            </div>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(question.difficulty)}`}>
              {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
            </span>
            {question.type === 'image' && <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm font-medium">📷 Image</span>}
            {question.type === 'sound' && <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-medium">🔊 Sound</span>}
          </div>

          {/* Image Question */}
          {question.type === 'image' && (
            <div className="mb-6">
              {loadingMedia ? (
                <div className="w-full h-64 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse flex items-center justify-center">
                  <span className="text-gray-500 dark:text-gray-400">Loading image...</span>
                </div>
              ) : questionImage ? (
                <img
                  src={questionImage}
                  alt="Quiz question"
                  className="w-full h-64 object-cover rounded-lg"
                />
              ) : null}
            </div>
          )}

          {/* Sound Question */}
          {question.type === 'sound' && questionSound && (
            <div className="mb-6">
              <audio controls className="w-full">
                <source src={questionSound} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            </div>
          )}

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
            {question.question}
          </h2>

          <div className="space-y-4">
            {question.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrect = index === question.correctAnswer;
              const showCorrect = selectedAnswer !== null && isCorrect;
              const showWrong = selectedAnswer !== null && isSelected && !isCorrect;

              return (
                <button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  disabled={selectedAnswer !== null}
                  className={`w-full p-4 rounded-lg text-left font-medium transition-all ${
                    showCorrect
                      ? 'bg-green-100 border-2 border-green-500 text-green-900 dark:bg-green-900/30 dark:text-green-400'
                      : showWrong
                      ? 'bg-red-100 border-2 border-red-500 text-red-900 dark:bg-red-900/30 dark:text-red-400'
                      : selectedAnswer !== null
                      ? 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed'
                      : 'bg-gray-100 hover:bg-purple-100 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white border-2 border-transparent hover:border-purple-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{option}</span>
                    {showCorrect && <span className="text-2xl">✓</span>}
                    {showWrong && <span className="text-2xl">✗</span>}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Explanation */}
          {selectedAnswer !== null && (
            <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-500">
              <div className="flex items-start gap-3">
                <div className="text-2xl">💡</div>
                <div>
                  <h3 className="font-bold text-blue-900 dark:text-blue-400 mb-2">
                    {selectedAnswer === question.correctAnswer ? 'Correct!' : 'Not quite!'}
                  </h3>
                  <p className="text-blue-800 dark:text-blue-300">
                    {question.explanation}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Next Button */}
        {selectedAnswer !== null && (
          <button
            onClick={handleNext}
            className="w-full px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white text-lg font-bold rounded-lg transition-colors shadow-lg hover:shadow-xl"
          >
            {currentQuestion < questions.length - 1 ? 'Next Question' : 'See Results'}
          </button>
        )}
      </div>
    </div>
  );
}

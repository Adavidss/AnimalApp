import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRandomAnimal } from '../../api/animals';
import { useAnimal } from '../../context/AnimalContext';
import Loader from '../../components/Loader';

interface Question {
  question: string;
  options: string[];
  correct: number;
  explanation?: string;
}

export default function AnimalTrivia() {
  const navigate = useNavigate();
  const { enrichAnimal } = useAnimal();
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const generateQuestion = useCallback(async () => {
    setLoading(true);
    setSelected(null);
    setShowResult(false);

    try {
      const animal = await getRandomAnimal();
      if (!animal) return;

      const enriched = await enrichAnimal(animal.name, animal.taxonomy?.scientific_name || animal.name);
      if (!enriched) return;

      // Generate question types
      const questionTypes = [
        {
          question: `What is the habitat of ${animal.name}?`,
          correct: enriched.characteristics?.habitat || 'Unknown',
          options: [
            enriched.characteristics?.habitat || 'Unknown',
            'Desert',
            'Ocean',
            'Forest',
          ].filter((v, i, a) => a.indexOf(v) === i).slice(0, 4),
        },
        {
          question: `What type of animal is ${animal.name}?`,
          correct: enriched.taxonomy?.class || 'Unknown',
          options: [
            enriched.taxonomy?.class || 'Unknown',
            'Mammal',
            'Bird',
            'Reptile',
          ].filter((v, i, a) => a.indexOf(v) === i).slice(0, 4),
        },
        {
          question: `What is the conservation status of ${animal.name}?`,
          correct: enriched.conservationStatus?.category || 'Unknown',
          options: [
            enriched.conservationStatus?.category || 'Unknown',
            'Least Concern',
            'Endangered',
            'Vulnerable',
          ].filter((v, i, a) => a.indexOf(v) === i).slice(0, 4),
        },
      ];

      const questionType = questionTypes[Math.floor(Math.random() * questionTypes.length)];
      const shuffled = [...questionType.options].sort(() => Math.random() - 0.5);
      const correctIndex = shuffled.indexOf(questionType.correct);

      setCurrentQuestion({
        question: questionType.question,
        options: shuffled,
        correct: correctIndex,
      });

      setRound(prev => prev + 1);
    } catch (error) {
      console.error('Error generating question:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    generateQuestion();
  }, [generateQuestion]);

  const handleSelect = (index: number) => {
    if (selected !== null) return;
    setSelected(index);
    setShowResult(true);

    if (index === currentQuestion?.correct) {
      setScore(prev => prev + 10);
    }

    setTimeout(() => {
      generateQuestion();
    }, 2000);
  };

  if (loading && !currentQuestion) {
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
                🧠 Animal Trivia
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Test your animal knowledge!
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
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8 text-center">
            <div className="flex justify-around">
              <div>
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{score}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Score</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{round}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Round</div>
              </div>
            </div>
          </div>

          {/* Question */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
              {currentQuestion?.question}
            </h2>

            <div className="space-y-4">
              {currentQuestion?.options.map((option, index) => {
                const isSelected = selected === index;
                const isCorrect = index === currentQuestion.correct;
                const showAnswer = showResult;

                let bgClass = 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600';
                if (showAnswer) {
                  if (isCorrect) {
                    bgClass = 'bg-green-500 text-white';
                  } else if (isSelected && !isCorrect) {
                    bgClass = 'bg-red-500 text-white';
                  }
                }

                return (
                  <button
                    key={index}
                    onClick={() => handleSelect(index)}
                    disabled={showAnswer}
                    className={`w-full p-4 rounded-lg text-left font-medium transition-all ${bgClass} ${
                      showAnswer ? 'cursor-default' : 'cursor-pointer'
                    }`}
                  >
                    {option}
                    {showAnswer && isCorrect && ' ✓'}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


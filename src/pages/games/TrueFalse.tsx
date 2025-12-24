import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRandomAnimal } from '../../api/animals';
import { useAnimal } from '../../context/AnimalContext';
import Loader from '../../components/Loader';

interface Question {
  statement: string;
  answer: boolean;
  explanation?: string;
}

export default function TrueFalse() {
  const navigate = useNavigate();
  const { enrichAnimal } = useAnimal();
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selected, setSelected] = useState<boolean | null>(null);
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

      // Generate random true/false statements
      const statements: Question[] = [
        {
          statement: `${animal.name} is a ${enriched.taxonomy?.class || 'mammal'}.`,
          answer: true,
          explanation: `Yes, ${animal.name} is classified as a ${enriched.taxonomy?.class || 'mammal'}.`,
        },
        {
          statement: `${animal.name} lives in the ${enriched.characteristics?.habitat || 'forest'}.`,
          answer: Math.random() > 0.3, // 70% true, 30% false
          explanation: enriched.characteristics?.habitat 
            ? `Yes, ${animal.name} typically lives in ${enriched.characteristics.habitat}.`
            : `Actually, this may not be accurate.`,
        },
        {
          statement: `${animal.name} is an endangered species.`,
          answer: enriched.conservationStatus?.category === 'EN' || enriched.conservationStatus?.category === 'CR',
          explanation: enriched.conservationStatus?.category 
            ? `${animal.name} has a conservation status of ${enriched.conservationStatus.category}.`
            : `This statement may not be accurate.`,
        },
        {
          statement: `${animal.name} can fly.`,
          answer: enriched.taxonomy?.class === 'Aves',
          explanation: enriched.taxonomy?.class === 'Aves'
            ? `Yes, birds can fly!`
            : `No, ${animal.name} cannot fly.`,
        },
      ];

      const question = statements[Math.floor(Math.random() * statements.length)];
      setCurrentQuestion(question);
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

  const handleSelect = (answer: boolean) => {
    if (selected !== null) return;
    setSelected(answer);
    setShowResult(true);

    if (answer === currentQuestion?.answer) {
      setScore(prev => prev + 10);
    }

    setTimeout(() => {
      generateQuestion();
    }, 2500);
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
                ✅ True or False
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Test your knowledge with true/false questions!
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
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-12 text-center min-h-[120px] flex items-center justify-center">
              {currentQuestion?.statement}
            </h2>

            {/* Answer Buttons */}
            <div className="grid grid-cols-2 gap-6">
              <button
                onClick={() => handleSelect(true)}
                disabled={showResult}
                className={`p-8 rounded-xl font-bold text-2xl transition-all ${
                  showResult && selected === true
                    ? currentQuestion?.answer === true
                      ? 'bg-green-500 text-white'
                      : 'bg-red-500 text-white'
                    : showResult && currentQuestion?.answer === true
                    ? 'bg-green-500 text-white opacity-75'
                    : 'bg-blue-500 hover:bg-blue-600 text-white hover:scale-105'
                } ${showResult ? 'cursor-default' : 'cursor-pointer'}`}
              >
                ✅ True
              </button>
              <button
                onClick={() => handleSelect(false)}
                disabled={showResult}
                className={`p-8 rounded-xl font-bold text-2xl transition-all ${
                  showResult && selected === false
                    ? currentQuestion?.answer === false
                      ? 'bg-green-500 text-white'
                      : 'bg-red-500 text-white'
                    : showResult && currentQuestion?.answer === false
                    ? 'bg-green-500 text-white opacity-75'
                    : 'bg-red-500 hover:bg-red-600 text-white hover:scale-105'
                } ${showResult ? 'cursor-default' : 'cursor-pointer'}`}
              >
                ❌ False
              </button>
            </div>

            {/* Explanation */}
            {showResult && currentQuestion?.explanation && (
              <div className={`mt-6 p-4 rounded-lg ${
                selected === currentQuestion.answer
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                  : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
              }`}>
                <p className="font-medium">{currentQuestion.explanation}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


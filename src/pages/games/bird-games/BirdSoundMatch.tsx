import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchINatSpecies } from '../../../api/inaturalist';
import { fetchAnimalSounds } from '../../../api/xenocanto';
import Loader from '../../../components/Loader';

interface Bird {
  id: string;
  name: string;
  preferred_common_name?: string;
  sciName?: string;
  default_photo?: {
    medium_url?: string;
  };
}

export default function BirdSoundMatch() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [currentBird, setCurrentBird] = useState<Bird | null>(null);
  const [options, setOptions] = useState<Bird[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [correct, setCorrect] = useState<string | null>(null);
  const [soundUrl, setSoundUrl] = useState<string>('');
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [errorDetails, setErrorDetails] = useState<string>('');

  const addDebugInfo = (message: string) => {
    console.log(`[BirdSoundMatch] ${message}`);
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const loadQuiz = useCallback(async () => {
    setLoading(true);
    setSelected(null);
    setCorrect(null);
    setSoundUrl('');
    setDebugInfo([]);
    setErrorDetails('');
    
    try {
      addDebugInfo('Starting to load quiz...');
      
      // Get birds from iNaturalist
      addDebugInfo('Fetching birds from iNaturalist...');
      const birds = await searchINatSpecies('bird');
      addDebugInfo(`Received ${birds.length} birds from iNaturalist`);
      
      if (birds.length < 4) {
        setErrorDetails(`Not enough birds found: ${birds.length} (need at least 4)`);
        addDebugInfo(`ERROR: Not enough birds - only ${birds.length} found`);
        setLoading(false);
        return;
      }

      // Find a bird with sound - try up to 10 birds
      let correctBird: Bird | null = null;
      let soundFileUrl = '';
      let attempts = 0;
      const maxAttempts = 10;
      let lastError: string = '';
      let birdsAttempted: string[] = [];

      addDebugInfo(`Starting search for bird with sound (max ${maxAttempts} attempts)...`);

      while (attempts < maxAttempts && (!correctBird || !soundFileUrl)) {
        attempts++;
        const randomBird = birds[Math.floor(Math.random() * birds.length)];
        const scientificName = randomBird.name;
        const commonName = randomBird.preferred_common_name || scientificName;
        
        birdsAttempted.push(`${commonName} (${scientificName})`);
        addDebugInfo(`Attempt ${attempts}/${maxAttempts}: Trying ${commonName} (${scientificName})`);
        
        try {
          // Fetch more sounds to increase chances of finding a good one
          addDebugInfo(`Fetching sounds for ${scientificName}...`);
          const sounds = await fetchAnimalSounds(scientificName, 5);
          
          addDebugInfo(`Received ${sounds?.length || 0} recordings for ${scientificName}`);
          
          if (sounds && sounds.length > 0) {
            // Filter for quality recordings (A, B, C) like Bird-App does
            const goodRecordings = sounds.filter((s: any) => 
              s.q && ['A', 'B', 'C'].includes(s.q)
            );
            
            addDebugInfo(`Found ${goodRecordings.length} good quality recordings (A/B/C)`);
            
            const recordingsToUse = goodRecordings.length > 0 ? goodRecordings : sounds;
            
            if (recordingsToUse.length === 0) {
              addDebugInfo(`WARNING: No usable recordings found for ${scientificName}`);
              lastError = `No usable recordings for ${scientificName}`;
              continue;
            }
            
            // Pick a random recording from the available ones (up to 3)
            const randomIndex = Math.floor(Math.random() * Math.min(3, recordingsToUse.length));
            const recording = recordingsToUse[randomIndex];
            
            addDebugInfo(`Selected recording #${randomIndex + 1}: ID=${recording?.id}, File=${recording?.file?.substring(0, 50)}...`);
            
            if (recording && recording.file) {
              // Normalize sound URL exactly like Bird-App does
              let normalizedUrl = recording.file;
              
              addDebugInfo(`Original file URL: ${normalizedUrl.substring(0, 100)}`);
              
              if (normalizedUrl.startsWith('//')) {
                normalizedUrl = `https:${normalizedUrl}`;
                addDebugInfo('Fixed // prefix');
              } else if (normalizedUrl.startsWith('http://') || normalizedUrl.startsWith('https://')) {
                addDebugInfo('URL already has protocol');
              } else if (recording.id) {
                normalizedUrl = `https://xeno-canto.org/${recording.id}/download`;
                addDebugInfo(`Constructed URL from ID: ${normalizedUrl}`);
              } else {
                const match = normalizedUrl.match(/\/(\d+)\//);
                if (match) {
                  normalizedUrl = `https://xeno-canto.org/${match[1]}/download`;
                  addDebugInfo(`Extracted ID from path: ${normalizedUrl}`);
                } else {
                  addDebugInfo(`WARNING: Could not normalize URL: ${normalizedUrl}`);
                  lastError = `Could not normalize URL for ${scientificName}`;
                  continue;
                }
              }
              
              // Verify the URL is valid
              if (normalizedUrl && normalizedUrl.startsWith('http')) {
                addDebugInfo(`✅ SUCCESS: Found valid sound URL: ${normalizedUrl.substring(0, 80)}...`);
                correctBird = {
                  id: String(randomBird.id || Math.random()),
                  name: randomBird.preferred_common_name || randomBird.name || 'Unknown Bird',
                  preferred_common_name: randomBird.preferred_common_name || randomBird.name,
                  sciName: scientificName,
                  default_photo: randomBird.default_photo,
                };
                soundFileUrl = normalizedUrl;
                break; // Found a valid sound, exit loop
              } else {
                addDebugInfo(`ERROR: Invalid URL format: ${normalizedUrl}`);
                lastError = `Invalid URL format for ${scientificName}`;
              }
            } else {
              addDebugInfo(`ERROR: Recording has no file property: ${JSON.stringify(recording).substring(0, 100)}`);
              lastError = `Recording has no file for ${scientificName}`;
            }
          } else {
            addDebugInfo(`No sounds returned for ${scientificName}`);
            lastError = `No sounds found for ${scientificName}`;
          }
        } catch (error: any) {
          const errorMsg = error?.message || String(error);
          addDebugInfo(`EXCEPTION fetching sound for ${scientificName}: ${errorMsg}`);
          lastError = `Exception: ${errorMsg}`;
          console.error(`[BirdSoundMatch] Error fetching sound for ${scientificName}:`, error);
        }
      }
      
      addDebugInfo(`Completed ${attempts} attempts. Success: ${!!(correctBird && soundFileUrl)}`);

      if (!correctBird || !soundFileUrl) {
        // No sound found after multiple attempts
        const errorMsg = `Failed to find bird with sound after ${attempts} attempts. Last error: ${lastError}`;
        addDebugInfo(`❌ FAILED: ${errorMsg}`);
        setErrorDetails(
          `Attempted ${attempts} birds:\n${birdsAttempted.slice(0, 10).join('\n')}\n\nLast error: ${lastError || 'Unknown error'}`
        );
        setLoading(false);
        return;
      }

      addDebugInfo(`Setting up game with bird: ${correctBird.name}`);
      setCurrentBird(correctBird);
      setSoundUrl(soundFileUrl);

      // Pick 3 wrong options
      addDebugInfo('Selecting wrong answer options...');
      const wrongBirds: Bird[] = [];
      const usedIndices = new Set([correctBird.id || '']);
      
      while (wrongBirds.length < 3) {
        const randomBird = birds[Math.floor(Math.random() * birds.length)];
        const birdId = String(randomBird.id || Math.random());
        if (!usedIndices.has(birdId) && randomBird.name !== correctBird.name) {
          wrongBirds.push({
            id: birdId,
            name: randomBird.preferred_common_name || randomBird.name || 'Unknown Bird',
            preferred_common_name: randomBird.preferred_common_name || randomBird.name,
            sciName: randomBird.name,
            default_photo: randomBird.default_photo,
          });
          usedIndices.add(birdId);
        }
      }

      addDebugInfo(`Selected ${wrongBirds.length} wrong options`);
      
      // Shuffle options
      const allOptions = [correctBird, ...wrongBirds].sort(() => Math.random() - 0.5);
      setOptions(allOptions);
      setCorrect(correctBird.name);
      addDebugInfo('✅ Game ready!');
    } catch (error: any) {
      const errorMsg = error?.message || String(error);
      const errorStack = error?.stack || '';
      addDebugInfo(`❌ FATAL ERROR: ${errorMsg}`);
      console.error('[BirdSoundMatch] Fatal error loading sound match:', error);
      setErrorDetails(`Fatal error: ${errorMsg}\n\nStack: ${errorStack.substring(0, 200)}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadQuiz();
  }, [loadQuiz]);

  const handleSelect = (birdName: string) => {
    if (selected) return;
    setSelected(birdName);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!currentBird || !soundUrl) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">🔇</div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  No Bird Sounds Available
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  We couldn't find bird sounds at the moment. Please try again later!
                </p>
              </div>

              {/* Debug Information */}
              {(errorDetails || debugInfo.length > 0) && (
                <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <details className="cursor-pointer">
                    <summary className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                      🔍 Diagnostic Information (Click to expand)
                    </summary>
                    <div className="mt-3 space-y-2">
                      {errorDetails && (
                        <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded border border-red-200 dark:border-red-800">
                          <p className="text-sm font-semibold text-red-800 dark:text-red-200 mb-1">Error Details:</p>
                          <pre className="text-xs text-red-700 dark:text-red-300 whitespace-pre-wrap font-mono">
                            {errorDetails}
                          </pre>
                        </div>
                      )}
                      {debugInfo.length > 0 && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded border border-blue-200 dark:border-blue-800">
                          <p className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-1">Debug Log:</p>
                          <div className="max-h-60 overflow-y-auto">
                            {debugInfo.map((info, idx) => (
                              <div key={idx} className="text-xs text-blue-700 dark:text-blue-300 font-mono mb-1">
                                {info}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </details>
                </div>
              )}

              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => {
                    setLoading(true);
                    setErrorDetails('');
                    setDebugInfo([]);
                    loadQuiz();
                  }}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  🔄 Try Again
                </button>
                <button
                  onClick={() => navigate('/games')}
                  className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                >
                  ← Back to Games
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                🎵 Bird Sound Match
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Which bird makes this sound?
              </p>
            </div>
            <button
              onClick={() => navigate('/games')}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
            >
              ← Back to Games
            </button>
          </div>

          {/* Game Content */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            {/* Audio Player */}
            <div className="mb-8">
              <audio
                controls
                autoPlay
                className="w-full max-w-md mx-auto"
                src={soundUrl}
                onError={(e) => {
                  console.error('Audio loading error:', e);
                  // Try to reload with a different approach if the audio fails
                }}
              >
                Your browser does not support the audio element.
              </audio>
              {soundUrl && (
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
                  🔊 Listen to the sound and guess the bird
                </p>
              )}
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {options.map((bird, index) => {
                const isSelected = selected === bird.name;
                const isCorrect = bird.name === correct;
                const showResult = selected !== null;

                let bgClass = 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600';
                if (showResult) {
                  if (isCorrect) {
                    bgClass = 'bg-green-500 text-white';
                  } else if (isSelected && !isCorrect) {
                    bgClass = 'bg-red-500 text-white';
                  }
                }

                return (
                  <button
                    key={bird.id || index}
                    onClick={() => handleSelect(bird.name)}
                    disabled={showResult}
                    className={`p-6 rounded-lg font-medium text-left transition-all ${bgClass} ${
                      showResult ? 'cursor-default' : 'cursor-pointer hover:scale-105'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-lg">{bird.name}</span>
                      {showResult && isCorrect && <span className="text-2xl">✅</span>}
                      {showResult && isSelected && !isCorrect && <span className="text-2xl">❌</span>}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Answer Display */}
            {selected && currentBird && (
              <div className="mb-8 p-6 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {currentBird.name}
                  </h3>
                  {currentBird.sciName && (
                    <p className="text-lg italic text-gray-600 dark:text-gray-400">
                      {currentBird.sciName}
                    </p>
                  )}
                  {currentBird.default_photo?.medium_url && (
                    <img
                      src={currentBird.default_photo.medium_url}
                      alt={currentBird.name}
                      className="w-full max-w-md mx-auto mt-4 rounded-lg shadow-lg"
                    />
                  )}
                </div>
              </div>
            )}

            {/* Controls */}
            <div className="mt-8 flex gap-4 justify-center">
              <button
                onClick={loadQuiz}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                ⏭️ Next Sound
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


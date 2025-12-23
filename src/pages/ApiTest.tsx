import { useState } from 'react';
import { searchZooAnimals } from '../api/additionalApis';
import { searchFishSpecies } from '../api/fishbase';
import { searchINatSpecies } from '../api/inaturalist';

export default function ApiTest() {
  const [zooResults, setZooResults] = useState<any>(null);
  const [fishResults, setFishResults] = useState<any>(null);
  const [inatResults, setInatResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testZooApi = async () => {
    setLoading(true);
    console.log('Testing Zoo API...');
    try {
      const results = await searchZooAnimals('');
      console.log('Zoo API Results:', results);
      setZooResults(results);
    } catch (error) {
      console.error('Zoo API Error:', error);
      setZooResults({ error: String(error) });
    } finally {
      setLoading(false);
    }
  };

  const testFishApi = async () => {
    setLoading(true);
    console.log('Testing Fish API...');
    try {
      const results = await searchFishSpecies('tuna');
      console.log('Fish API Results:', results);
      setFishResults(results);
    } catch (error) {
      console.error('Fish API Error:', error);
      setFishResults({ error: String(error) });
    } finally {
      setLoading(false);
    }
  };

  const testINatApi = async () => {
    setLoading(true);
    console.log('Testing iNaturalist API...');
    try {
      const results = await searchINatSpecies('reptilia');
      console.log('iNat API Results:', results);
      setInatResults(results);
    } catch (error) {
      console.error('iNat API Error:', error);
      setInatResults({ error: String(error) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">API Testing</h1>

        <div className="grid grid-cols-3 gap-4">
          <button
            onClick={testZooApi}
            disabled={loading}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50"
          >
            Test Zoo API
          </button>
          <button
            onClick={testFishApi}
            disabled={loading}
            className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg disabled:opacity-50"
          >
            Test Fish API
          </button>
          <button
            onClick={testINatApi}
            disabled={loading}
            className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg disabled:opacity-50"
          >
            Test iNat API
          </button>
        </div>

        {loading && <div className="text-center text-gray-600 dark:text-gray-400">Loading...</div>}

        <div className="space-y-6">
          {zooResults && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg">
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Zoo API Results</h2>
              <pre className="text-sm bg-gray-100 dark:bg-gray-700 p-4 rounded overflow-auto max-h-96">
                {JSON.stringify(zooResults, null, 2)}
              </pre>
            </div>
          )}

          {fishResults && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg">
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Fish API Results</h2>
              <pre className="text-sm bg-gray-100 dark:bg-gray-700 p-4 rounded overflow-auto max-h-96">
                {JSON.stringify(fishResults, null, 2)}
              </pre>
            </div>
          )}

          {inatResults && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg">
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">iNaturalist API Results</h2>
              <pre className="text-sm bg-gray-100 dark:bg-gray-700 p-4 rounded overflow-auto max-h-96">
                {JSON.stringify(inatResults, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

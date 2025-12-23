import React, { useState } from 'react';
import {
  sizeReferences,
  SizeReference,
  getRelevantReferences,
  metersToFeetInches,
  formatMetricLength,
  formatMetricWeight,
  formatImperialWeight,
  compareSizes,
} from '../data/sizeReferences';

interface SizeVisualizationProps {
  animalName: string;
  length?: number; // meters
  height?: number; // meters
  weight?: number; // kilograms
}

export default function SizeVisualization({ animalName, length, height, weight }: SizeVisualizationProps) {
  const [selectedReference, setSelectedReference] = useState<SizeReference>(
    sizeReferences.find((ref) => ref.id === 'human')!
  );
  const [useMetric, setUseMetric] = useState(true);

  // Default values if not provided
  const animalLength = length || 1;
  const animalHeight = height || 1;
  const animalWeight = weight;

  // Get relevant reference objects
  const relevantRefs = getRelevantReferences(animalLength, animalHeight);

  // Calculate scale for visualization
  const maxDimension = Math.max(animalLength, animalHeight, selectedReference.length, selectedReference.height);
  const scale = Math.min(200 / maxDimension, 50); // Max 200px, min scale 50

  const animalDisplayWidth = animalLength * scale;
  const animalDisplayHeight = animalHeight * scale;
  const refDisplayWidth = selectedReference.length * scale;
  const refDisplayHeight = selectedReference.height * scale;

  // Size comparison text
  const comparisonText = compareSizes(
    { length: animalLength, height: animalHeight },
    { length: selectedReference.length, height: selectedReference.height }
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Size Comparison</h3>

        {/* Metric/Imperial Toggle */}
        <button
          onClick={() => setUseMetric(!useMetric)}
          className="px-3 py-1 text-sm rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          {useMetric ? 'Metric' : 'Imperial'}
        </button>
      </div>

      {/* Reference Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Compare with:
        </label>
        <div className="flex flex-wrap gap-2">
          {relevantRefs.map((ref) => (
            <button
              key={ref.id}
              onClick={() => setSelectedReference(ref)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedReference.id === ref.id
                  ? 'bg-blue-500 text-white shadow-md scale-105'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <span className="mr-1">{ref.icon}</span>
              {ref.name}
            </button>
          ))}
          <select
            value={selectedReference.id}
            onChange={(e) => {
              const ref = sizeReferences.find((r) => r.id === e.target.value);
              if (ref) setSelectedReference(ref);
            }}
            className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm"
          >
            <option value={selectedReference.id}>More options...</option>
            {sizeReferences
              .filter((ref) => !relevantRefs.find((r) => r.id === ref.id))
              .map((ref) => (
                <option key={ref.id} value={ref.id}>
                  {ref.icon} {ref.name}
                </option>
              ))}
          </select>
        </div>
      </div>

      {/* Size Comparison Visual */}
      <div className="mb-6 bg-gray-50 dark:bg-gray-900 rounded-lg p-8 min-h-[300px] flex items-end justify-center gap-8">
        {/* Animal */}
        <div className="flex flex-col items-center">
          <div
            style={{
              width: `${animalDisplayWidth}px`,
              height: `${animalDisplayHeight}px`,
              backgroundColor: '#10B981',
              borderRadius: '8px',
              position: 'relative',
            }}
            className="shadow-lg"
          >
            <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-sm">
              {animalName.split(' ')[0]}
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {useMetric ? formatMetricLength(animalLength) : metersToFeetInches(animalLength)} ×{' '}
            {useMetric ? formatMetricLength(animalHeight) : metersToFeetInches(animalHeight)}
          </p>
        </div>

        {/* Reference Object */}
        <div className="flex flex-col items-center">
          <div
            style={{
              width: `${refDisplayWidth}px`,
              height: `${refDisplayHeight}px`,
              backgroundColor: selectedReference.color,
              borderRadius: '8px',
              position: 'relative',
            }}
            className="shadow-lg"
          >
            <div className="absolute inset-0 flex items-center justify-center text-white text-2xl">
              {selectedReference.icon}
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{selectedReference.name}</p>
        </div>
      </div>

      {/* Comparison Text */}
      <div className="text-center mb-6">
        <p className="text-lg text-gray-700 dark:text-gray-300">
          <span className="font-semibold">{animalName}</span> is{' '}
          <span className="font-semibold text-blue-600 dark:text-blue-400">{comparisonText}</span> than{' '}
          {selectedReference.name.toLowerCase()}.
        </p>
      </div>

      {/* Detailed Measurements */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Length */}
        {length && (
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Length</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {useMetric ? formatMetricLength(animalLength) : metersToFeetInches(animalLength)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              {!useMetric ? formatMetricLength(animalLength) : metersToFeetInches(animalLength)}
            </p>
          </div>
        )}

        {/* Height */}
        {height && (
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Height</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {useMetric ? formatMetricLength(animalHeight) : metersToFeetInches(animalHeight)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              {!useMetric ? formatMetricLength(animalHeight) : metersToFeetInches(animalHeight)}
            </p>
          </div>
        )}

        {/* Weight */}
        {animalWeight && (
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Weight</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {useMetric ? formatMetricWeight(animalWeight) : formatImperialWeight(animalWeight)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              {!useMetric ? formatMetricWeight(animalWeight) : formatImperialWeight(animalWeight)}
            </p>
          </div>
        )}
      </div>

      {/* Reference Details */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <span className="font-medium">Reference:</span> {selectedReference.name} is approximately{' '}
          {useMetric ? formatMetricLength(selectedReference.length) : metersToFeetInches(selectedReference.length)} long and{' '}
          {useMetric ? formatMetricLength(selectedReference.height) : metersToFeetInches(selectedReference.height)} tall
          {selectedReference.weight && (
            <>
              , weighing{' '}
              {useMetric ? formatMetricWeight(selectedReference.weight) : formatImperialWeight(selectedReference.weight)}
            </>
          )}
          .
        </p>
      </div>
    </div>
  );
}

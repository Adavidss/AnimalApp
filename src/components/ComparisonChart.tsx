import { useMemo } from 'react';

export interface ChartData {
  label: string;
  value: number;
  color?: string;
  unit?: string;
  image?: string;
}

export interface ComparisonChartProps {
  title: string;
  data: ChartData[];
  type?: 'bar' | 'horizontal-bar' | 'timeline' | 'size-visual';
  maxValue?: number;
  unit?: string;
  showValues?: boolean;
  showImages?: boolean;
  height?: string;
}

/**
 * Horizontal bar chart for comparing values
 */
export function ComparisonChart({
  title,
  data,
  type = 'horizontal-bar',
  maxValue,
  unit = '',
  showValues = true,
  showImages = false,
  height = 'auto'
}: ComparisonChartProps) {
  const computedMaxValue = maxValue || Math.max(...data.map(d => d.value));

  const getColorForIndex = (index: number): string => {
    const colors = [
      'bg-purple-500',
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-red-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500'
    ];
    return colors[index % colors.length];
  };

  if (type === 'horizontal-bar') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          {title}
        </h3>

        <div className="space-y-4">
          {data.map((item, index) => {
            const percentage = (item.value / computedMaxValue) * 100;
            const barColor = item.color || getColorForIndex(index);

            return (
              <div key={index} className="space-y-2">
                {/* Label and value */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {showImages && item.image && (
                      <img
                        src={item.image}
                        alt={item.label}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    )}
                    <span className="font-medium text-gray-900 dark:text-white">
                      {item.label}
                    </span>
                  </div>
                  {showValues && (
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                      {item.value.toLocaleString()} {item.unit || unit}
                    </span>
                  )}
                </div>

                {/* Bar */}
                <div className="relative w-full bg-gray-200 dark:bg-gray-700 rounded-full h-6 overflow-hidden">
                  <div
                    className={`${barColor} h-full rounded-full transition-all duration-1000 ease-out flex items-center justify-end pr-2`}
                    style={{ width: `${percentage}%` }}
                  >
                    {percentage > 15 && (
                      <span className="text-xs font-bold text-white">
                        {percentage.toFixed(0)}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (type === 'bar') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          {title}
        </h3>

        <div className="flex items-end justify-around gap-4" style={{ height: height || '300px' }}>
          {data.map((item, index) => {
            const percentage = (item.value / computedMaxValue) * 100;
            const barColor = item.color || getColorForIndex(index);

            return (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                {/* Value label */}
                {showValues && (
                  <div className="text-sm font-bold text-gray-700 dark:text-gray-300 text-center">
                    {item.value.toLocaleString()} {item.unit || unit}
                  </div>
                )}

                {/* Bar */}
                <div className="relative w-full bg-gray-200 dark:bg-gray-700 rounded-t-lg flex-1 flex items-end">
                  <div
                    className={`${barColor} w-full rounded-t-lg transition-all duration-1000 ease-out`}
                    style={{ height: `${percentage}%` }}
                  />
                </div>

                {/* Label */}
                <div className="text-center">
                  {showImages && item.image && (
                    <img
                      src={item.image}
                      alt={item.label}
                      className="w-12 h-12 rounded-full object-cover mx-auto mb-1"
                    />
                  )}
                  <span className="text-sm font-medium text-gray-900 dark:text-white block">
                    {item.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (type === 'timeline') {
    const sortedData = [...data].sort((a, b) => b.value - a.value);

    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          {title}
        </h3>

        <div className="space-y-6">
          {sortedData.map((item, index) => {
            const barColor = item.color || getColorForIndex(index);

            return (
              <div key={index} className="relative">
                {/* Timeline dot and label */}
                <div className="flex items-center gap-4 mb-2">
                  <div className={`w-4 h-4 rounded-full ${barColor}`} />
                  <div className="flex-1 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {showImages && item.image && (
                        <img
                          src={item.image}
                          alt={item.label}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      )}
                      <span className="font-medium text-gray-900 dark:text-white">
                        {item.label}
                      </span>
                    </div>
                    <span className="text-lg font-bold text-gray-700 dark:text-gray-300">
                      {item.value.toLocaleString()} {item.unit || unit}
                    </span>
                  </div>
                </div>

                {/* Connecting line */}
                {index < sortedData.length - 1 && (
                  <div className="ml-2 w-px h-8 bg-gray-300 dark:bg-gray-600" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (type === 'size-visual') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          {title}
        </h3>

        <div className="flex items-end justify-center gap-8 min-h-[300px] p-8">
          {data.map((item, index) => {
            const size = Math.sqrt(item.value / computedMaxValue) * 100;
            const barColor = item.color || getColorForIndex(index);

            return (
              <div key={index} className="flex flex-col items-center gap-3">
                {/* Visual representation */}
                {showImages && item.image ? (
                  <div className="relative">
                    <img
                      src={item.image}
                      alt={item.label}
                      className="rounded-lg object-cover shadow-lg"
                      style={{
                        width: `${Math.max(size, 60)}px`,
                        height: `${Math.max(size, 60)}px`
                      }}
                    />
                  </div>
                ) : (
                  <div
                    className={`${barColor} rounded-lg shadow-lg`}
                    style={{
                      width: `${Math.max(size, 60)}px`,
                      height: `${Math.max(size, 60)}px`
                    }}
                  />
                )}

                {/* Label and value */}
                <div className="text-center">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {item.label}
                  </div>
                  {showValues && (
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {item.value.toLocaleString()} {item.unit || unit}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return null;
}

/**
 * Speed comparison chart with visual indicators
 */
export function SpeedComparisonChart({ data }: { data: ChartData[] }) {
  return (
    <ComparisonChart
      title="Speed Comparison"
      data={data}
      type="horizontal-bar"
      unit="km/h"
      showValues={true}
      showImages={true}
    />
  );
}

/**
 * Size comparison chart
 */
export function SizeComparisonChart({ data }: { data: ChartData[] }) {
  return (
    <ComparisonChart
      title="Size Comparison"
      data={data}
      type="size-visual"
      unit="kg"
      showValues={true}
      showImages={true}
    />
  );
}

/**
 * Lifespan comparison timeline
 */
export function LifespanComparisonChart({ data }: { data: ChartData[] }) {
  return (
    <ComparisonChart
      title="Lifespan Comparison"
      data={data}
      type="timeline"
      unit="years"
      showValues={true}
      showImages={true}
    />
  );
}

/**
 * Simple bar chart for generic comparisons
 */
export function BarChart({
  title,
  data,
  unit
}: {
  title: string;
  data: ChartData[];
  unit?: string;
}) {
  return (
    <ComparisonChart
      title={title}
      data={data}
      type="bar"
      unit={unit}
      showValues={true}
      height="250px"
    />
  );
}

/**
 * Pie chart for showing proportions
 */
export function PieChart({
  title,
  data,
  size = 200
}: {
  title: string;
  data: ChartData[];
  size?: number;
}) {
  const total = useMemo(() => data.reduce((sum, item) => sum + item.value, 0), [data]);

  const getColorForIndex = (index: number): string => {
    const colors = [
      '#a855f7', // purple-500
      '#3b82f6', // blue-500
      '#10b981', // green-500
      '#eab308', // yellow-500
      '#ef4444', // red-500
      '#ec4899', // pink-500
      '#6366f1', // indigo-500
      '#14b8a6' // teal-500
    ];
    return colors[index % colors.length];
  };

  let currentAngle = 0;

  const slices = data.map((item, index) => {
    const percentage = (item.value / total) * 100;
    const angle = (item.value / total) * 360;
    const startAngle = currentAngle;
    currentAngle += angle;

    // Calculate path for SVG pie slice
    const startX = size / 2 + (size / 2) * Math.cos((startAngle - 90) * (Math.PI / 180));
    const startY = size / 2 + (size / 2) * Math.sin((startAngle - 90) * (Math.PI / 180));
    const endX = size / 2 + (size / 2) * Math.cos((startAngle + angle - 90) * (Math.PI / 180));
    const endY = size / 2 + (size / 2) * Math.sin((startAngle + angle - 90) * (Math.PI / 180));
    const largeArc = angle > 180 ? 1 : 0;

    return {
      ...item,
      percentage,
      color: item.color || getColorForIndex(index),
      path: `M ${size / 2} ${size / 2} L ${startX} ${startY} A ${size / 2} ${size / 2} 0 ${largeArc} 1 ${endX} ${endY} Z`
    };
  });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 text-center">
        {title}
      </h3>

      <div className="flex flex-col md:flex-row items-center gap-8 justify-center">
        {/* Pie chart */}
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {slices.map((slice, index) => (
            <path
              key={index}
              d={slice.path}
              fill={slice.color}
              className="hover:opacity-80 transition-opacity cursor-pointer"
            />
          ))}
        </svg>

        {/* Legend */}
        <div className="space-y-3">
          {slices.map((slice, index) => (
            <div key={index} className="flex items-center gap-3">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: slice.color }}
              />
              <div className="flex-1">
                <div className="font-medium text-gray-900 dark:text-white">
                  {slice.label}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {slice.value.toLocaleString()} ({slice.percentage.toFixed(1)}%)
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Radar chart for multi-dimensional comparisons
 */
export function RadarChart({
  title,
  categories,
  datasets
}: {
  title: string;
  categories: string[];
  datasets: Array<{
    label: string;
    data: number[];
    color?: string;
  }>;
}) {
  const size = 300;
  const center = size / 2;
  const radius = size / 2 - 40;
  const maxValue = 100;

  const getColorForIndex = (index: number): string => {
    const colors = ['#a855f7', '#3b82f6', '#10b981', '#eab308'];
    return colors[index % colors.length];
  };

  const angleStep = (2 * Math.PI) / categories.length;

  const getPoint = (value: number, index: number) => {
    const angle = index * angleStep - Math.PI / 2;
    const r = (value / maxValue) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle)
    };
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 text-center">
        {title}
      </h3>

      <div className="flex flex-col items-center gap-6">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Grid circles */}
          {[20, 40, 60, 80, 100].map(percent => (
            <circle
              key={percent}
              cx={center}
              cy={center}
              r={(percent / 100) * radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              className="text-gray-300 dark:text-gray-600"
            />
          ))}

          {/* Axis lines and labels */}
          {categories.map((category, index) => {
            const point = getPoint(100, index);
            return (
              <g key={index}>
                <line
                  x1={center}
                  y1={center}
                  x2={point.x}
                  y2={point.y}
                  stroke="currentColor"
                  strokeWidth="1"
                  className="text-gray-300 dark:text-gray-600"
                />
                <text
                  x={point.x + (point.x - center) * 0.2}
                  y={point.y + (point.y - center) * 0.2}
                  textAnchor="middle"
                  className="text-xs font-medium fill-gray-700 dark:fill-gray-300"
                >
                  {category}
                </text>
              </g>
            );
          })}

          {/* Data polygons */}
          {datasets.map((dataset, datasetIndex) => {
            const points = dataset.data
              .map((value, index) => {
                const point = getPoint(value, index);
                return `${point.x},${point.y}`;
              })
              .join(' ');

            const color = dataset.color || getColorForIndex(datasetIndex);

            return (
              <g key={datasetIndex}>
                <polygon
                  points={points}
                  fill={color}
                  fillOpacity="0.2"
                  stroke={color}
                  strokeWidth="2"
                />
                {dataset.data.map((value, index) => {
                  const point = getPoint(value, index);
                  return (
                    <circle
                      key={index}
                      cx={point.x}
                      cy={point.y}
                      r="4"
                      fill={color}
                    />
                  );
                })}
              </g>
            );
          })}
        </svg>

        {/* Legend */}
        <div className="flex gap-6">
          {datasets.map((dataset, index) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: dataset.color || getColorForIndex(index) }}
              />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {dataset.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

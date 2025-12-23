import { Link } from 'react-router-dom';
import { CategoryTheme } from '../utils/categories';

interface CategoryCardProps {
  category: CategoryTheme;
}

export default function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link
      to={category.path}
      className="group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
    >
      {/* Gradient Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${category.bgGradient} opacity-10 group-hover:opacity-20 transition-opacity`} />

      {/* Content */}
      <div className="relative p-6 flex flex-col items-center text-center space-y-3">
        {/* Icon */}
        <div className="text-6xl group-hover:scale-110 transition-transform">
          {category.emoji}
        </div>

        {/* Title */}
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
          {category.name}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {category.description}
        </p>

        {/* Explore Button */}
        <div className={`mt-4 px-4 py-2 rounded-lg font-medium ${category.textColor} bg-opacity-10 group-hover:bg-opacity-20 transition-all`}
             style={{ backgroundColor: `${category.primaryColor}20` }}>
          Explore {category.name}
        </div>
      </div>

      {/* Hover Arrow */}
      <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <svg className="w-6 h-6" style={{ color: category.primaryColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </div>
    </Link>
  );
}

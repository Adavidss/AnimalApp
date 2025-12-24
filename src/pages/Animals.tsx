import { Link } from 'react-router-dom';

export default function Animals() {
  const categories = [
    {
      id: 'dogs',
      title: 'Dogs',
      description: 'Explore different dog breeds, their characteristics, and care information',
      link: '/dogs',
      gradient: 'from-amber-500 to-orange-600',
      icon: '🐕'
    },
    {
      id: 'cats',
      title: 'Cats',
      description: 'Discover cat breeds, behavior, and fascinating feline facts',
      link: '/cats',
      gradient: 'from-gray-500 to-gray-700',
      icon: '🐈'
    },
    {
      id: 'birds',
      title: 'Birds',
      description: 'Learn about birds, their calls, habitats, and migration patterns',
      link: '/birds',
      gradient: 'from-blue-500 to-cyan-600',
      icon: '🐦'
    },
    {
      id: 'wildlife',
      title: 'Wildlife',
      description: 'Explore wild animals, their ecosystems, and conservation status',
      link: '/wildlife',
      gradient: 'from-green-600 to-teal-700',
      icon: '🦁'
    },
    {
      id: 'fish',
      title: 'Aquatic',
      description: 'Discover marine and freshwater fish species and their habitats',
      link: '/fish',
      gradient: 'from-blue-600 to-indigo-700',
      icon: '🐠'
    },
    {
      id: 'conservation',
      title: 'Conservation Status',
      description: 'Explore animals by their conservation status and endangered species',
      link: '/conservation',
      gradient: 'from-red-600 to-orange-600',
      icon: '🛡️'
    },
    {
      id: 'explorer',
      title: 'All Animals',
      description: 'Search and explore all animal species in our comprehensive database',
      link: '/explorer',
      gradient: 'from-purple-500 to-pink-600',
      icon: '🔍'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 md:py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Animals
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Explore our collection of animal categories and discover fascinating creatures from around the world
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={category.link}
              className="group relative bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            >
              {/* Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-10 group-hover:opacity-20 transition-opacity`}></div>
              
              {/* Content */}
              <div className="relative p-6 md:p-8">
                <div className="text-5xl md:text-6xl mb-4">{category.icon}</div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  {category.title}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base mb-4">
                  {category.description}
                </p>
                
                {/* Arrow Icon */}
                <div className="flex items-center text-primary-600 dark:text-primary-400 font-medium">
                  <span className="text-sm md:text-base">Explore</span>
                  <svg 
                    className="w-4 h-4 md:w-5 md:h-5 ml-2 transform group-hover:translate-x-1 transition-transform" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="mt-12 md:mt-16 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <span className="text-2xl">📚</span>
            <span className="text-gray-700 dark:text-gray-300 font-medium">
              Thousands of animal species to explore
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}


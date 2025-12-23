import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { useAnimal } from '../context/AnimalContext';
import Home from '../pages/Home';
import Explorer from '../pages/Explorer';
import AnimalDetail from '../pages/AnimalDetail';
import Dogs from '../pages/Dogs';
import Cats from '../pages/Cats';
import Birds from '../pages/Birds';
import Fish from '../pages/Fish';
import Reptiles from '../pages/Reptiles';
import Wildlife from '../pages/Wildlife';
import Favorites from '../pages/Favorites';
import ComparisonTool from '../pages/ComparisonTool';
import Quiz from '../pages/Quiz';
import ApiTest from '../pages/ApiTest';
import { NotFound } from '../components/ErrorState';
import GamesHub from '../pages/games/GamesHub';
import MemoryMatch from '../pages/games/MemoryMatch';
import SoundMatch from '../pages/games/SoundMatch';
import SizeChallenge from '../pages/games/SizeChallenge';

function Layout({ children }: { children: React.ReactNode }) {
  const { darkMode, toggleDarkMode } = useAnimal();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="text-3xl">🦁</div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Animal Atlas</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Wildlife Encyclopedia</p>
              </div>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Link
                to="/"
                className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors"
              >
                Home
              </Link>

              {/* Categories Dropdown */}
              <div className="relative group">
                <button className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors flex items-center gap-1">
                  Categories
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <Link to="/dogs" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <span className="text-xl">🐕</span>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Dogs</span>
                  </Link>
                  <Link to="/cats" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <span className="text-xl">🐈</span>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Cats</span>
                  </Link>
                  <Link to="/birds" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <span className="text-xl">🐦</span>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Birds</span>
                  </Link>
                  <Link to="/fish" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <span className="text-xl">🐠</span>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Fish</span>
                  </Link>
                  <Link to="/reptiles" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <span className="text-xl">🦎</span>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Reptiles</span>
                  </Link>
                  <Link to="/wildlife" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors rounded-b-lg">
                    <span className="text-xl">🦁</span>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Wildlife</span>
                  </Link>
                </div>
              </div>

              <Link
                to="/compare"
                className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors"
              >
                Compare
              </Link>
              <Link
                to="/favorites"
                className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors flex items-center gap-1"
              >
                <span>⭐</span>
                Favorites
              </Link>
              <Link
                to="/quiz"
                className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors"
              >
                Quiz
              </Link>
              <Link
                to="/games"
                className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors flex items-center gap-1"
              >
                <span>🎮</span>
                Games
              </Link>
            </nav>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden pb-4">
            <nav className="flex gap-3 overflow-x-auto">
              <Link to="/" className="text-sm font-medium text-gray-600 dark:text-gray-300 whitespace-nowrap">
                Home
              </Link>
              <Link to="/dogs" className="text-sm font-medium text-gray-600 dark:text-gray-300 whitespace-nowrap">
                🐕 Dogs
              </Link>
              <Link to="/cats" className="text-sm font-medium text-gray-600 dark:text-gray-300 whitespace-nowrap">
                🐈 Cats
              </Link>
              <Link to="/birds" className="text-sm font-medium text-gray-600 dark:text-gray-300 whitespace-nowrap">
                🐦 Birds
              </Link>
              <Link to="/favorites" className="text-sm font-medium text-gray-600 dark:text-gray-300 whitespace-nowrap">
                ⭐ Favorites
              </Link>
              <Link to="/quiz" className="text-sm font-medium text-gray-600 dark:text-gray-300 whitespace-nowrap">
                📝 Quiz
              </Link>
              <Link to="/games" className="text-sm font-medium text-gray-600 dark:text-gray-300 whitespace-nowrap">
                🎮 Games
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black text-white py-12 mt-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="text-2xl">🦁</span>
                Animal Atlas
              </h3>
              <p className="text-gray-400">
                Discover and learn about wildlife from around the world with detailed information,
                images, and conservation status.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link to="/" className="hover:text-white transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/explorer" className="hover:text-white transition-colors">
                    Explorer
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Data Sources</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>API Ninjas - Animal Data</li>
                <li>Wikipedia - Descriptions</li>
                <li>Unsplash - Images</li>
                <li>GBIF - Distribution Data</li>
                <li>IUCN - Conservation Status</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
            <p>
              &copy; {new Date().getFullYear()} Animal Atlas. Built with React, TypeScript, and
              Tailwind CSS.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function AppRouter() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/explorer" element={<Explorer />} />
          <Route path="/dogs" element={<Dogs />} />
          <Route path="/cats" element={<Cats />} />
          <Route path="/birds" element={<Birds />} />
          <Route path="/fish" element={<Fish />} />
          <Route path="/reptiles" element={<Reptiles />} />
          <Route path="/wildlife" element={<Wildlife />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/compare" element={<ComparisonTool />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/games" element={<GamesHub />} />
          <Route path="/games/memory-match" element={<MemoryMatch />} />
          <Route path="/games/sound-match" element={<SoundMatch />} />
          <Route path="/games/size-challenge" element={<SizeChallenge />} />
          <Route path="/api-test" element={<ApiTest />} />
          <Route path="/animal/:name" element={<AnimalDetail />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

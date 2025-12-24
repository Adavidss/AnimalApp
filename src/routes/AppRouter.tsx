import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { useAnimal } from '../context/AnimalContext';
import Home from '../pages/Home';
import Explorer from '../pages/Explorer';
import AnimalDetail from '../pages/AnimalDetail';
import Animals from '../pages/Animals';
import Dogs from '../pages/Dogs';
import Cats from '../pages/Cats';
import Birds from '../pages/Birds';
import Fish from '../pages/Fish';
import Reptiles from '../pages/Reptiles';
import Wildlife from '../pages/Wildlife';
import Favorites from '../pages/Favorites';
import Achievements from '../pages/Achievements';
import ComparisonTool from '../pages/ComparisonTool';
import Quiz from '../pages/Quiz';
import ApiTest from '../pages/ApiTest';
import { NotFound } from '../components/ErrorState';
import GamesHub from '../pages/games/GamesHub';
import MemoryMatch from '../pages/games/MemoryMatch';
import SoundMatch from '../pages/games/SoundMatch';
import SizeChallenge from '../pages/games/SizeChallenge';
import GuessTheBird from '../pages/games/bird-games/GuessTheBird';
import BirdQuiz from '../pages/games/bird-games/BirdQuiz';
import BirdSoundMatch from '../pages/games/bird-games/BirdSoundMatch';

function Layout({ children }: { children: React.ReactNode }) {
  const { darkMode, toggleDarkMode } = useAnimal();
  const [showAnimalsDropdown, setShowAnimalsDropdown] = useState(false);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Navigation with Logo */}
            <nav className="flex items-center gap-4 md:gap-6 flex-1">
              {/* Logo/Brand */}
              <Link 
                to="/" 
                className="flex items-center gap-2 hover:opacity-80 transition-opacity group"
              >
                <div className="text-2xl md:text-3xl">🦁</div>
                <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 dark:from-primary-400 dark:to-primary-600 bg-clip-text text-transparent group-hover:from-primary-700 group-hover:to-primary-900 dark:group-hover:from-primary-300 dark:group-hover:to-primary-500 transition-all">
                  Animal Atlas
                </h1>
              </Link>

              <div className="hidden md:flex items-center gap-6 ml-4">
                <Link
                  to="/"
                  className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors"
                >
                  Home
                </Link>

                <Link
                  to="/animals"
                  className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors"
                >
                  Animals
                </Link>

                {/* Animals Dropdown */}
                <div 
                  className="relative group z-50"
                  onMouseEnter={() => setShowAnimalsDropdown(true)}
                  onMouseLeave={() => setShowAnimalsDropdown(false)}
                >
                  <button 
                    type="button"
                    className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors flex items-center gap-1"
                    onClick={() => setShowAnimalsDropdown(!showAnimalsDropdown)}
                  >
                    Categories
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  <div className={`absolute top-full left-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 transition-all duration-200 z-50 ${showAnimalsDropdown ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
                    <Link to="/explorer" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors rounded-t-lg">
                      <span className="text-xl">🔍</span>
                      <span className="font-medium text-gray-700 dark:text-gray-300">All Animals</span>
                    </Link>
                    <div className="border-t border-gray-200 dark:border-gray-700"></div>
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
                    <Link to="/wildlife" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <span className="text-xl">🦁</span>
                      <span className="font-medium text-gray-700 dark:text-gray-300">Wildlife</span>
                    </Link>
                    <Link to="/fish" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors rounded-b-lg">
                      <span className="text-xl">🐠</span>
                      <span className="font-medium text-gray-700 dark:text-gray-300">Fish</span>
                    </Link>
                  </div>
                </div>

                <Link
                  to="/favorites"
                  className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors flex items-center gap-1"
                >
                  <span>⭐</span>
                  Favorites
                </Link>
                <Link
                  to="/achievements"
                  className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors flex items-center gap-1"
                >
                  <span>🏆</span>
                  Achievements
                </Link>
                <Link
                  to="/games"
                  className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors flex items-center gap-1"
                >
                  <span>🎮</span>
                  Games
                </Link>
              </div>
            </nav>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors ml-4"
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
              <Link to="/animals" className="text-sm font-medium text-gray-600 dark:text-gray-300 whitespace-nowrap">
                Animals
              </Link>
              <Link to="/favorites" className="text-sm font-medium text-gray-600 dark:text-gray-300 whitespace-nowrap">
                ⭐ Favorites
              </Link>
              <Link to="/achievements" className="text-sm font-medium text-gray-600 dark:text-gray-300 whitespace-nowrap">
                🏆 Achievements
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
      <footer className="bg-gray-900 dark:bg-black text-white py-6 md:py-8 mt-8 md:mt-12">
        <div className="container mx-auto px-4">
          {/* Empty footer - content removed per user request */}
        </div>
      </footer>
    </div>
  );
}

export default function AppRouter() {
  return (
    <BrowserRouter basename="/AnimalApp"
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/animals" element={<Animals />} />
          <Route path="/explorer" element={<Explorer />} />
          <Route path="/dogs" element={<Dogs />} />
          <Route path="/cats" element={<Cats />} />
          <Route path="/birds" element={<Birds />} />
          <Route path="/fish" element={<Fish />} />
          <Route path="/reptiles" element={<Reptiles />} />
          <Route path="/wildlife" element={<Wildlife />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/achievements" element={<Achievements />} />
          <Route path="/compare" element={<ComparisonTool />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/games" element={<GamesHub />} />
          <Route path="/games/memory-match" element={<MemoryMatch />} />
          <Route path="/games/sound-match" element={<SoundMatch />} />
          <Route path="/games/size-challenge" element={<SizeChallenge />} />
          <Route path="/games/bird-games/guess" element={<GuessTheBird />} />
          <Route path="/games/bird-games/quiz" element={<BirdQuiz />} />
          <Route path="/games/bird-games/bird-sound-match" element={<BirdSoundMatch />} />
          <Route path="/api-test" element={<ApiTest />} />
          <Route path="/animal/:name" element={<AnimalDetail />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

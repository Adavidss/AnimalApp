import { useEffect } from 'react';
import { AnimalProvider } from './context/AnimalContext';
import AppRouter from './routes/AppRouter';
import { clearImageCache, clearAllCache, getCacheStats } from './utils/cache';
import { ToastProvider } from './components/Toast';

function App() {
  useEffect(() => {
    // Expose cache clearing functions to window for debugging
    if (import.meta.env.DEV) {
      (window as any).clearImageCache = clearImageCache;
      (window as any).clearAllCache = clearAllCache;
      (window as any).getCacheStats = getCacheStats;
      console.log('🧹 Cache utilities available:');
      console.log('  - clearImageCache() - Clear all cached images');
      console.log('  - clearAllCache() - Clear all app cache');
      console.log('  - getCacheStats() - View cache statistics');
    }
  }, []);

  return (
    <AnimalProvider>
      <ToastProvider>
        <AppRouter />
      </ToastProvider>
    </AnimalProvider>
  );
}

export default App;

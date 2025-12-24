// Game utility functions

/**
 * Shuffle an array using Fisher-Yates algorithm
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Generate pairs for memory game
 */
export function generateMemoryPairs<T>(items: T[], pairCount: number): T[] {
  const shuffled = shuffleArray(items);
  const selected = shuffled.slice(0, pairCount);
  const pairs = [...selected, ...selected];
  return shuffleArray(pairs);
}

/**
 * Format time in MM:SS format
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Calculate score based on time and moves
 */
export function calculateScore(moves: number, timeSeconds: number, perfectMoves: number): number {
  const moveScore = Math.max(0, 1000 - (moves - perfectMoves) * 50);
  const timeScore = Math.max(0, 1000 - timeSeconds * 2);
  return Math.round((moveScore + timeScore) / 2);
}

/**
 * Get difficulty multiplier
 */
export function getDifficultyMultiplier(difficulty: 'easy' | 'medium' | 'hard'): number {
  switch (difficulty) {
    case 'easy':
      return 1;
    case 'medium':
      return 1.5;
    case 'hard':
      return 2;
    default:
      return 1;
  }
}

/**
 * Save high score to localStorage
 */
export function saveHighScore(gameName: string, score: number, metadata?: Record<string, any>): void {
  try {
    const key = `animal_atlas_highscore_${gameName}`;
    const existing = localStorage.getItem(key);
    const current = existing ? JSON.parse(existing) : { score: 0 };

    if (score > current.score) {
      localStorage.setItem(key, JSON.stringify({
        score,
        date: new Date().toISOString(),
        ...metadata
      }));
    }
  } catch {
    // Ignore localStorage errors
  }
}

/**
 * Get high score from localStorage
 */
export function getHighScore(gameName: string): { score: number; date?: string } | null {
  try {
    const key = `animal_atlas_highscore_${gameName}`;
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

/**
 * Save game stats
 */
export function saveGameStats(gameName: string, stats: {
  gamesPlayed: number;
  totalScore: number;
  averageScore: number;
  bestTime?: number;
}): void {
  try {
    const key = `animal_atlas_stats_${gameName}`;
    localStorage.setItem(key, JSON.stringify({
      ...stats,
      lastPlayed: new Date().toISOString()
    }));
  } catch {
    // Ignore errors
  }
}

/**
 * Get game stats
 */
export function getGameStats(gameName: string): {
  gamesPlayed: number;
  totalScore: number;
  averageScore: number;
  bestTime?: number;
  lastPlayed?: string;
} | null {
  try {
    const key = `animal_atlas_stats_${gameName}`;
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

/**
 * Play sound effect
 */
export function playSound(type: 'flip' | 'match' | 'win' | 'wrong'): void {
  // For now, use Web Audio API to generate simple beeps
  // In production, you'd load actual sound files
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    switch (type) {
      case 'flip':
        oscillator.frequency.value = 400;
        gainNode.gain.value = 0.1;
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.1);
        break;
      case 'match':
        oscillator.frequency.value = 600;
        gainNode.gain.value = 0.2;
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.2);
        break;
      case 'win':
        oscillator.frequency.value = 800;
        gainNode.gain.value = 0.3;
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.5);
        break;
      case 'wrong':
        oscillator.frequency.value = 200;
        gainNode.gain.value = 0.15;
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.3);
        break;
    }
  } catch {
    // Audio might not be supported
  }
}

/**
 * Get random items from array
 */
export function getRandomItems<T>(array: T[], count: number): T[] {
  const shuffled = shuffleArray(array);
  return shuffled.slice(0, Math.min(count, array.length));
}

/**
 * Check if two arrays are equal (for game matching logic)
 */
export function arraysEqual<T>(arr1: T[], arr2: T[]): boolean {
  if (arr1.length !== arr2.length) return false;
  return arr1.every((value, index) => value === arr2[index]);
}

/**
 * Get difficulty grid size for memory game
 */
export function getGridSize(difficulty: 'easy' | 'medium' | 'hard'): { rows: number; cols: number; pairs: number } {
  switch (difficulty) {
    case 'easy':
      return { rows: 2, cols: 2, pairs: 2 };  // 4 cards (2 pairs) - square 2x2
    case 'medium':
      return { rows: 4, cols: 4, pairs: 8 };  // 16 cards (8 pairs) - square 4x4
    case 'hard':
      return { rows: 6, cols: 6, pairs: 18 }; // 36 cards (18 pairs) - square 6x6
    default:
      return { rows: 4, cols: 4, pairs: 8 };
  }
}

/**
 * Generate confetti effect (returns animation class)
 */
export function triggerConfetti(): void {
  // This would integrate with a confetti library or custom CSS animation
  // For now, we'll just add a class to body that can be styled
  document.body.classList.add('confetti-active');
  setTimeout(() => {
    document.body.classList.remove('confetti-active');
  }, 3000);
}

/**
 * Get rank based on score
 */
export function getRank(score: number, maxScore: number): {
  rank: string;
  emoji: string;
  message: string;
} {
  const percentage = (score / maxScore) * 100;

  if (percentage >= 95) {
    return { rank: 'Master', emoji: '🏆', message: 'Perfect! You\'re a master!' };
  } else if (percentage >= 85) {
    return { rank: 'Expert', emoji: '🌟', message: 'Excellent work!' };
  } else if (percentage >= 70) {
    return { rank: 'Advanced', emoji: '⭐', message: 'Great job!' };
  } else if (percentage >= 50) {
    return { rank: 'Intermediate', emoji: '👍', message: 'Good effort!' };
  } else {
    return { rank: 'Beginner', emoji: '📚', message: 'Keep practicing!' };
  }
}

/**
 * Increment game play counter
 */
export function incrementGamePlayCount(gameName: string): number {
  try {
    // Use the key format that games are using
    const key = `${gameName}_play_count`;
    const count = parseInt(localStorage.getItem(key) || '0', 10) + 1;
    localStorage.setItem(key, count.toString());
    
    // Track for achievements after incrementing
    setTimeout(async () => {
      try {
        const { trackGamePlay } = await import('./achievements');
        trackGamePlay();
      } catch (e) {
        // Ignore if achievements module not available
      }
    }, 0);
    
    return count;
  } catch {
    return 1;
  }
}

/**
 * Get game play count
 */
export function getGamePlayCount(gameName: string): number {
  try {
    const key = `animal_atlas_playcount_${gameName}`;
    return parseInt(localStorage.getItem(key) || '0', 10);
  } catch {
    return 0;
  }
}

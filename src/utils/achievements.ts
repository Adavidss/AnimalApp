/**
 * Achievements System
 * Tracks user progress and unlocks badges for milestones
 */

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  requirement: number; // Number needed to unlock
  category: 'explorer' | 'collector' | 'specialist' | 'enthusiast' | 'master';
  unlocked: boolean;
  progress: number; // Current progress
}

export type AchievementCategory = Achievement['category'];

// All available achievements
export const allAchievements: Omit<Achievement, 'unlocked' | 'progress'>[] = [
  // Explorer Achievements (viewing animals)
  {
    id: 'first_discovery',
    title: 'First Discovery',
    description: 'View your first animal',
    icon: '🔍',
    requirement: 1,
    category: 'explorer',
  },
  {
    id: 'curious_explorer',
    title: 'Curious Explorer',
    description: 'View 10 different animals',
    icon: '🗺️',
    requirement: 10,
    category: 'explorer',
  },
  {
    id: 'wildlife_enthusiast',
    title: 'Wildlife Enthusiast',
    description: 'View 25 different animals',
    icon: '🌍',
    requirement: 25,
    category: 'explorer',
  },
  {
    id: 'animal_expert',
    title: 'Animal Expert',
    description: 'View 50 different animals',
    icon: '🎓',
    requirement: 50,
    category: 'explorer',
  },
  {
    id: 'animal_master',
    title: 'Animal Master',
    description: 'View 100 different animals',
    icon: '👑',
    requirement: 100,
    category: 'explorer',
  },

  // Collector Achievements (favorites)
  {
    id: 'first_favorite',
    title: 'First Favorite',
    description: 'Add your first animal to favorites',
    icon: '⭐',
    requirement: 1,
    category: 'collector',
  },
  {
    id: 'collection_starter',
    title: 'Collection Starter',
    description: 'Save 5 favorite animals',
    icon: '📚',
    requirement: 5,
    category: 'collector',
  },
  {
    id: 'dedicated_collector',
    title: 'Dedicated Collector',
    description: 'Save 15 favorite animals',
    icon: '💎',
    requirement: 15,
    category: 'collector',
  },
  {
    id: 'master_collector',
    title: 'Master Collector',
    description: 'Save 30 favorite animals',
    icon: '🏆',
    requirement: 30,
    category: 'collector',
  },

  // Specialist Achievements (category completion)
  {
    id: 'mammal_specialist',
    title: 'Mammal Specialist',
    description: 'View 10 different mammals',
    icon: '🦁',
    requirement: 10,
    category: 'specialist',
  },
  {
    id: 'bird_specialist',
    title: 'Bird Specialist',
    description: 'View 10 different birds',
    icon: '🦅',
    requirement: 10,
    category: 'specialist',
  },
  {
    id: 'reptile_specialist',
    title: 'Reptile Specialist',
    description: 'View 10 different reptiles',
    icon: '🦎',
    requirement: 10,
    category: 'specialist',
  },
  {
    id: 'marine_specialist',
    title: 'Marine Specialist',
    description: 'View 10 different marine animals',
    icon: '🐠',
    requirement: 10,
    category: 'specialist',
  },
  {
    id: 'insect_specialist',
    title: 'Insect Specialist',
    description: 'View 10 different insects',
    icon: '🦋',
    requirement: 10,
    category: 'specialist',
  },

  // Enthusiast Achievements (engagement)
  {
    id: 'comparison_enthusiast',
    title: 'Comparison Enthusiast',
    description: 'Compare 5 pairs of animals',
    icon: '⚖️',
    requirement: 5,
    category: 'enthusiast',
  },
  {
    id: 'quiz_master',
    title: 'Quiz Master',
    description: 'Complete 10 quizzes',
    icon: '🎯',
    requirement: 10,
    category: 'enthusiast',
  },
  {
    id: 'game_player',
    title: 'Game Player',
    description: 'Play 5 games',
    icon: '🎮',
    requirement: 5,
    category: 'enthusiast',
  },

  // Master Achievements (overall mastery)
  {
    id: 'conservation_advocate',
    title: 'Conservation Advocate',
    description: 'View 10 endangered species',
    icon: '🛡️',
    requirement: 10,
    category: 'master',
  },
  {
    id: 'global_explorer',
    title: 'Global Explorer',
    description: 'View animals from all continents',
    icon: '🌏',
    requirement: 7, // 7 continents
    category: 'master',
  },
  {
    id: 'ultimate_collector',
    title: 'Ultimate Collector',
    description: 'Unlock all other achievements',
    icon: '🌟',
    requirement: 19, // Total achievements - 1
    category: 'master',
  },
];

// Cache for synced data to prevent infinite loops
let lastSyncTime = 0;
const SYNC_COOLDOWN = 2000; // Only sync every 2 seconds at most

/**
 * Get all achievements with current progress
 */
export function getAchievements(): Achievement[] {
  try {
    const data = getAchievementData();
    
    // Sync progress from actual data sources (with cooldown to prevent infinite loops)
    const now = Date.now();
    if (now - lastSyncTime > SYNC_COOLDOWN) {
      syncAchievementProgress();
      lastSyncTime = now;
    }

    return allAchievements.map((achievement) => {
      const saved = data[achievement.id];
      return {
        ...achievement,
        progress: saved?.progress || 0,
        unlocked: saved?.unlocked || false,
      };
    });
  } catch (error) {
    console.error('Error getting achievements:', error);
    return allAchievements.map((a) => ({ ...a, progress: 0, unlocked: false }));
  }
}

/**
 * Helper to check if achievement data changed
 */
function achievementChanged(current: { progress: number; unlocked: boolean } | undefined, newValue: { progress: number; unlocked: boolean }): boolean {
  if (!current) return true;
  return current.progress !== newValue.progress || current.unlocked !== newValue.unlocked;
}

/**
 * Sync achievement progress from actual data sources
 */
function syncAchievementProgress(): void {
  const data = getAchievementData();
  let updated = false;

  // Sync viewed animals count
  try {
    const viewed: string[] = JSON.parse(localStorage.getItem('achievement_viewed_animals') || '[]');
    const totalViewed = viewed.length;
    
    if (totalViewed > 0) {
      const updates = {
        'first_discovery': { progress: Math.min(totalViewed, 1), unlocked: totalViewed >= 1 },
        'curious_explorer': { progress: totalViewed, unlocked: totalViewed >= 10 },
        'wildlife_enthusiast': { progress: totalViewed, unlocked: totalViewed >= 25 },
        'animal_expert': { progress: totalViewed, unlocked: totalViewed >= 50 },
        'animal_master': { progress: totalViewed, unlocked: totalViewed >= 100 }
      };
      
      Object.entries(updates).forEach(([id, newValue]) => {
        if (achievementChanged(data[id], newValue)) {
          data[id] = newValue;
          updated = true;
        }
      });
    }
  } catch (e) {
    // Ignore
  }

  // Sync favorites count
  try {
    const favorites = JSON.parse(localStorage.getItem('animal_atlas_favorites') || '[]');
    const favoritesCount = favorites.length;
    
    if (favoritesCount > 0) {
      const updates = {
        'first_favorite': { progress: favoritesCount, unlocked: favoritesCount >= 1 },
        'collection_starter': { progress: favoritesCount, unlocked: favoritesCount >= 5 },
        'dedicated_collector': { progress: favoritesCount, unlocked: favoritesCount >= 15 },
        'master_collector': { progress: favoritesCount, unlocked: favoritesCount >= 30 }
      };
      
      Object.entries(updates).forEach(([id, newValue]) => {
        if (achievementChanged(data[id], newValue)) {
          data[id] = newValue;
          updated = true;
        }
      });
    }
  } catch (e) {
    // Ignore
  }

  // Sync category achievements
  const categoryMappings = [
    { key: 'achievement_category_mammalia', achievement: 'mammal_specialist' },
    { key: 'achievement_category_aves', achievement: 'bird_specialist' },
    { key: 'achievement_category_reptilia', achievement: 'reptile_specialist' },
    { key: 'achievement_category_actinopterygii', achievement: 'marine_specialist' },
    { key: 'achievement_category_insecta', achievement: 'insect_specialist' }
  ];
  
  categoryMappings.forEach(({ key, achievement }) => {
    const count = parseInt(localStorage.getItem(key) || '0');
    if (count > 0) {
      const newValue = { progress: count, unlocked: count >= 10 };
      if (achievementChanged(data[achievement], newValue)) {
        data[achievement] = newValue;
        updated = true;
      }
    }
  });

  // Sync quiz stats
  try {
    const quizStats = JSON.parse(localStorage.getItem('animal_atlas_quiz_stats') || '{}');
    const totalQuizzes = quizStats.totalQuizzes || 0;
    if (totalQuizzes > 0) {
      const newValue = { progress: totalQuizzes, unlocked: totalQuizzes >= 10 };
      if (achievementChanged(data['quiz_master'], newValue)) {
        data['quiz_master'] = newValue;
        updated = true;
      }
    }
  } catch (e) {
    // Ignore
  }

  // Sync game play count
  try {
    let totalGamesPlayed = 0;
    const gameKeys = [
      'memory_match_play_count',
      'sound_match_play_count', 
      'guess_the_animal_play_count',
      'size_challenge_play_count',
      'animal_atlas_playcount_memory_match',
      'animal_atlas_playcount_sound_match',
      'animal_atlas_playcount_guess_the_animal',
      'animal_atlas_playcount_size_challenge'
    ];
    gameKeys.forEach(key => {
      const count = localStorage.getItem(key);
      if (count) totalGamesPlayed += parseInt(count) || 0;
    });
    const quizStats = JSON.parse(localStorage.getItem('animal_atlas_quiz_stats') || '{}');
    totalGamesPlayed += quizStats.totalQuizzes || 0;
    
    if (totalGamesPlayed > 0) {
      const newValue = { progress: totalGamesPlayed, unlocked: totalGamesPlayed >= 5 };
      if (achievementChanged(data['game_player'], newValue)) {
        data['game_player'] = newValue;
        updated = true;
      }
    }
  } catch (e) {
    // Ignore
  }

  // Sync comparisons
  try {
    const comparisonCount = parseInt(localStorage.getItem('achievement_comparisons') || '0');
    if (comparisonCount > 0) {
      const newValue = { progress: comparisonCount, unlocked: comparisonCount >= 5 };
      if (achievementChanged(data['comparison_enthusiast'], newValue)) {
        data['comparison_enthusiast'] = newValue;
        updated = true;
      }
    }
  } catch (e) {
    // Ignore
  }

  // Sync endangered species
  try {
    const endangered: string[] = JSON.parse(localStorage.getItem('achievement_endangered_species') || '[]');
    const endangeredCount = endangered.length;
    if (endangeredCount > 0) {
      const newValue = { progress: endangeredCount, unlocked: endangeredCount >= 10 };
      if (achievementChanged(data['conservation_advocate'], newValue)) {
        data['conservation_advocate'] = newValue;
        updated = true;
      }
    }
  } catch (e) {
    // Ignore
  }

  // Update ultimate collector based on unlocked count
  const unlockedCount = Object.values(data).filter(d => d.unlocked).length;
  const newUltimate = { progress: unlockedCount, unlocked: unlockedCount >= 19 };
  if (achievementChanged(data['ultimate_collector'], newUltimate)) {
    data['ultimate_collector'] = newUltimate;
    updated = true;
  }

  if (updated) {
    saveAchievementData(data);
  }
}

/**
 * Get unlocked achievements
 */
export function getUnlockedAchievements(): Achievement[] {
  return getAchievements().filter((a) => a.unlocked);
}

/**
 * Get achievements by category
 */
export function getAchievementsByCategory(category: AchievementCategory): Achievement[] {
  return getAchievements().filter((a) => a.category === category);
}

/**
 * Get achievement progress percentage
 */
export function getAchievementProgress(achievementId: string): number {
  const achievement = getAchievements().find((a) => a.id === achievementId);
  if (!achievement) return 0;

  return Math.min(100, (achievement.progress / achievement.requirement) * 100);
}

/**
 * Get overall achievement completion percentage
 */
export function getOverallProgress(): number {
  const achievements = getAchievements();
  const unlocked = achievements.filter((a) => a.unlocked).length;
  return Math.round((unlocked / achievements.length) * 100);
}

/**
 * Update achievement progress
 */
export function updateAchievementProgress(
  achievementId: string,
  increment: number = 1
): Achievement | null {
  try {
    const data = getAchievementData();
    const achievement = allAchievements.find((a) => a.id === achievementId);

    if (!achievement) return null;

    const current = data[achievementId] || { progress: 0, unlocked: false };
    const newProgress = Math.min(achievement.requirement, current.progress + increment);
    const wasUnlocked = current.unlocked;
    const nowUnlocked = newProgress >= achievement.requirement;

    data[achievementId] = {
      progress: newProgress,
      unlocked: nowUnlocked,
    };

    saveAchievementData(data);

    // Return updated achievement if newly unlocked
    if (!wasUnlocked && nowUnlocked) {
      return {
        ...achievement,
        progress: newProgress,
        unlocked: true,
      };
    }

    return null;
  } catch (error) {
    console.error('Error updating achievement:', error);
    return null;
  }
}

/**
 * Track animal view for achievements
 */
export function trackAnimalViewForAchievements(animalName: string, animalClass?: string): Achievement[] {
  const newlyUnlocked: Achievement[] = [];

  // Update viewed animals count
  const viewedKey = 'achievement_viewed_animals';
  const viewed: string[] = JSON.parse(localStorage.getItem(viewedKey) || '[]');
  const wasNew = !viewed.includes(animalName);

  if (wasNew) {
    viewed.push(animalName);
    localStorage.setItem(viewedKey, JSON.stringify(viewed));

    // Update explorer achievements based on total viewed count
    const totalViewed = viewed.length;
    
    // Update progress for each achievement (set to actual count, not increment)
    const data = getAchievementData();
    
    // Update all explorer achievements
    const wasFirstUnlocked = data['first_discovery']?.unlocked || false;
    const wasCuriousUnlocked = data['curious_explorer']?.unlocked || false;
    const wasWildlifeUnlocked = data['wildlife_enthusiast']?.unlocked || false;
    const wasExpertUnlocked = data['animal_expert']?.unlocked || false;
    const wasMasterUnlocked = data['animal_master']?.unlocked || false;
    
    data['first_discovery'] = { progress: totalViewed, unlocked: totalViewed >= 1 };
    data['curious_explorer'] = { progress: totalViewed, unlocked: totalViewed >= 10 };
    data['wildlife_enthusiast'] = { progress: totalViewed, unlocked: totalViewed >= 25 };
    data['animal_expert'] = { progress: totalViewed, unlocked: totalViewed >= 50 };
    data['animal_master'] = { progress: totalViewed, unlocked: totalViewed >= 100 };
    
    // Check for newly unlocked achievements
    if (!wasFirstUnlocked && totalViewed >= 1) {
      newlyUnlocked.push({
        ...allAchievements.find(a => a.id === 'first_discovery')!,
        progress: totalViewed,
        unlocked: true
      });
    }
    if (!wasCuriousUnlocked && totalViewed >= 10) {
      newlyUnlocked.push({
        ...allAchievements.find(a => a.id === 'curious_explorer')!,
        progress: totalViewed,
        unlocked: true
      });
    }
    if (!wasWildlifeUnlocked && totalViewed >= 25) {
      newlyUnlocked.push({
        ...allAchievements.find(a => a.id === 'wildlife_enthusiast')!,
        progress: totalViewed,
        unlocked: true
      });
    }
    if (!wasExpertUnlocked && totalViewed >= 50) {
      newlyUnlocked.push({
        ...allAchievements.find(a => a.id === 'animal_expert')!,
        progress: totalViewed,
        unlocked: true
      });
    }
    if (!wasMasterUnlocked && totalViewed >= 100) {
      newlyUnlocked.push({
        ...allAchievements.find(a => a.id === 'animal_master')!,
        progress: totalViewed,
        unlocked: true
      });
    }
    
    saveAchievementData(data);
    
    // Track category-specific achievements (specialist)
    if (animalClass) {
      trackCategoryView(animalClass.toLowerCase());
    }
  }

  return newlyUnlocked;
}

/**
 * Track endangered species view for conservation achievement
 */
export function trackEndangeredSpecies(animalName: string): void {
  const endangeredKey = 'achievement_endangered_species';
  const viewed: string[] = JSON.parse(localStorage.getItem(endangeredKey) || '[]');
  
  if (!viewed.includes(animalName)) {
    viewed.push(animalName);
    localStorage.setItem(endangeredKey, JSON.stringify(viewed));
    
    const count = viewed.length;
    const data = getAchievementData();
    const wasUnlocked = data['conservation_advocate']?.unlocked || false;
    data['conservation_advocate'] = { progress: count, unlocked: count >= 10 };
    
    if (!wasUnlocked && count >= 10) {
      saveAchievementData(data);
    } else {
      saveAchievementData(data);
    }
  }
}

/**
 * Track category-specific viewing for specialist achievements
 */
function trackCategoryView(animalClass: string): void {
  // Normalize animal class names
  const normalizedClass = animalClass.toLowerCase();
  let categoryKey: string | null = null;
  let achievementId: string | null = null;
  
  // Map animal class to achievement and category key
  if (normalizedClass === 'mammalia' || normalizedClass.includes('mammal')) {
    achievementId = 'mammal_specialist';
    categoryKey = 'achievement_category_mammalia';
  } else if (normalizedClass === 'aves' || normalizedClass.includes('bird')) {
    achievementId = 'bird_specialist';
    categoryKey = 'achievement_category_aves';
  } else if (normalizedClass === 'reptilia' || normalizedClass.includes('reptile') || normalizedClass === 'amphibia') {
    achievementId = 'reptile_specialist';
    categoryKey = 'achievement_category_reptilia';
  } else if (normalizedClass.includes('fish') || normalizedClass === 'actinopterygii' || normalizedClass === 'chondrichthyes') {
    achievementId = 'marine_specialist';
    categoryKey = 'achievement_category_actinopterygii';
  } else if (normalizedClass === 'insecta' || normalizedClass.includes('insect')) {
    achievementId = 'insect_specialist';
    categoryKey = 'achievement_category_insecta';
  }
  
  if (!achievementId || !categoryKey) return;
  
  const categoryCount = parseInt(localStorage.getItem(categoryKey) || '0') + 1;
  localStorage.setItem(categoryKey, categoryCount.toString());
  
  const data = getAchievementData();
  const wasUnlocked = data[achievementId]?.unlocked || false;
  data[achievementId] = { progress: categoryCount, unlocked: categoryCount >= 10 };
  
  saveAchievementData(data);
}

/**
 * Track favorite animal for achievements
 */
export function trackFavoriteForAchievements(count: number): Achievement[] {
  const newlyUnlocked: Achievement[] = [];
  const data = getAchievementData();

  // First favorite
  if (count >= 1) {
    const wasUnlocked = data['first_favorite']?.unlocked || false;
    data['first_favorite'] = { progress: count, unlocked: count >= 1 };
    if (!wasUnlocked && count >= 1) {
      newlyUnlocked.push({
        ...allAchievements.find(a => a.id === 'first_favorite')!,
        progress: count,
        unlocked: true
      });
    }
  }

  // Collection milestones
  if (count >= 5) {
    const wasUnlocked = data['collection_starter']?.unlocked || false;
    data['collection_starter'] = { progress: count, unlocked: true };
    if (!wasUnlocked) {
      newlyUnlocked.push({
        ...allAchievements.find(a => a.id === 'collection_starter')!,
        progress: count,
        unlocked: true
      });
    }
  } else {
    data['collection_starter'] = { progress: count, unlocked: false };
  }
  
  if (count >= 15) {
    const wasUnlocked = data['dedicated_collector']?.unlocked || false;
    data['dedicated_collector'] = { progress: count, unlocked: true };
    if (!wasUnlocked) {
      newlyUnlocked.push({
        ...allAchievements.find(a => a.id === 'dedicated_collector')!,
        progress: count,
        unlocked: true
      });
    }
  } else {
    data['dedicated_collector'] = { progress: count, unlocked: false };
  }
  
  if (count >= 30) {
    const wasUnlocked = data['master_collector']?.unlocked || false;
    data['master_collector'] = { progress: count, unlocked: true };
    if (!wasUnlocked) {
      newlyUnlocked.push({
        ...allAchievements.find(a => a.id === 'master_collector')!,
        progress: count,
        unlocked: true
      });
    }
  } else {
    data['master_collector'] = { progress: count, unlocked: false };
  }

  saveAchievementData(data);
  return newlyUnlocked;
}

/**
 * Track quiz completion for achievements
 */
export function trackQuizCompletion(): Achievement[] {
  const newlyUnlocked: Achievement[] = [];
  
  try {
    const quizStats = localStorage.getItem('animal_atlas_quiz_stats');
    if (!quizStats) return newlyUnlocked;
    
    const stats = JSON.parse(quizStats);
    const totalQuizzes = stats.totalQuizzes || 0;
    
    if (totalQuizzes >= 10) {
      const data = getAchievementData();
      const wasUnlocked = data['quiz_master']?.unlocked || false;
      data['quiz_master'] = { progress: totalQuizzes, unlocked: true };
      if (!wasUnlocked) {
        newlyUnlocked.push({
          ...allAchievements.find(a => a.id === 'quiz_master')!,
          progress: totalQuizzes,
          unlocked: true
        });
      }
      saveAchievementData(data);
    }
  } catch (error) {
    console.error('Error tracking quiz completion:', error);
  }
  
  return newlyUnlocked;
}

/**
 * Track game play for achievements
 */
export function trackGamePlay(): Achievement[] {
  const newlyUnlocked: Achievement[] = [];
  
  try {
    // Count total games played across all games
    let totalGamesPlayed = 0;
    
    // Check game stats from localStorage
    const gameKeys = [
      'memory_match_play_count',
      'sound_match_play_count',
      'guess_the_animal_play_count',
      'animal_atlas_quiz_stats'
    ];
    
    gameKeys.forEach(key => {
      try {
        if (key === 'animal_atlas_quiz_stats') {
          const stats = localStorage.getItem(key);
          if (stats) {
            const parsed = JSON.parse(stats);
            totalGamesPlayed += parsed.totalQuizzes || 0;
          }
        } else {
          const count = localStorage.getItem(key);
          if (count) {
            totalGamesPlayed += parseInt(count) || 0;
          }
        }
      } catch (e) {
        // Ignore errors
      }
    });
    
    if (totalGamesPlayed >= 5) {
      const data = getAchievementData();
      const wasUnlocked = data['game_player']?.unlocked || false;
      data['game_player'] = { progress: totalGamesPlayed, unlocked: true };
      if (!wasUnlocked) {
        newlyUnlocked.push({
          ...allAchievements.find(a => a.id === 'game_player')!,
          progress: totalGamesPlayed,
          unlocked: true
        });
      }
      saveAchievementData(data);
    }
  } catch (error) {
    console.error('Error tracking game play:', error);
  }
  
  return newlyUnlocked;
}

/**
 * Track comparison for achievements
 */
export function trackComparison(): Achievement[] {
  const newlyUnlocked: Achievement[] = [];
  
  try {
    const comparisonKey = 'achievement_comparisons';
    const comparisonCount = parseInt(localStorage.getItem(comparisonKey) || '0') + 1;
    localStorage.setItem(comparisonKey, comparisonCount.toString());
    
    if (comparisonCount >= 5) {
      const data = getAchievementData();
      const wasUnlocked = data['comparison_enthusiast']?.unlocked || false;
      data['comparison_enthusiast'] = { progress: comparisonCount, unlocked: true };
      if (!wasUnlocked) {
        newlyUnlocked.push({
          ...allAchievements.find(a => a.id === 'comparison_enthusiast')!,
          progress: comparisonCount,
          unlocked: true
        });
      }
      saveAchievementData(data);
    } else {
      const data = getAchievementData();
      data['comparison_enthusiast'] = { progress: comparisonCount, unlocked: false };
      saveAchievementData(data);
    }
  } catch (error) {
    console.error('Error tracking comparison:', error);
  }
  
  return newlyUnlocked;
}

/**
 * Reset all achievements (for testing)
 */
export function resetAchievements(): void {
  try {
    localStorage.removeItem('achievement_data');
    localStorage.removeItem('achievement_viewed_animals');
  } catch (error) {
    console.error('Error resetting achievements:', error);
  }
}

// Helper functions for localStorage

interface AchievementData {
  [achievementId: string]: {
    progress: number;
    unlocked: boolean;
  };
}

function getAchievementData(): AchievementData {
  try {
    const data = localStorage.getItem('achievement_data');
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Error reading achievement data:', error);
    return {};
  }
}

let lastSavedData: string | null = null;

function saveAchievementData(data: AchievementData): void {
  try {
    const dataString = JSON.stringify(data);
    
    // Only dispatch event if data actually changed
    if (dataString !== lastSavedData) {
      localStorage.setItem('achievement_data', dataString);
      lastSavedData = dataString;
      // Dispatch event to notify components of achievement updates
      // Use setTimeout to prevent immediate re-triggering
      setTimeout(() => {
        window.dispatchEvent(new Event('achievement-updated'));
      }, 100);
    }
  } catch (error) {
    console.error('Error saving achievement data:', error);
  }
}

/**
 * Get achievement statistics
 */
export function getAchievementStats() {
  const achievements = getAchievements();
  const unlocked = achievements.filter((a) => a.unlocked);

  return {
    total: achievements.length,
    unlocked: unlocked.length,
    locked: achievements.length - unlocked.length,
    percentage: getOverallProgress(),
    byCategory: {
      explorer: getAchievementsByCategory('explorer').filter((a) => a.unlocked).length,
      collector: getAchievementsByCategory('collector').filter((a) => a.unlocked).length,
      specialist: getAchievementsByCategory('specialist').filter((a) => a.unlocked).length,
      enthusiast: getAchievementsByCategory('enthusiast').filter((a) => a.unlocked).length,
      master: getAchievementsByCategory('master').filter((a) => a.unlocked).length,
    },
  };
}

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

/**
 * Get all achievements with current progress
 */
export function getAchievements(): Achievement[] {
  try {
    const data = getAchievementData();

    return allAchievements.map((achievement) => ({
      ...achievement,
      progress: data[achievement.id]?.progress || 0,
      unlocked: data[achievement.id]?.unlocked || false,
    }));
  } catch (error) {
    console.error('Error getting achievements:', error);
    return allAchievements.map((a) => ({ ...a, progress: 0, unlocked: false }));
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
export function trackAnimalViewForAchievements(animalName: string): Achievement[] {
  const newlyUnlocked: Achievement[] = [];

  // Update viewed animals count
  const viewedKey = 'achievement_viewed_animals';
  const viewed: string[] = JSON.parse(localStorage.getItem(viewedKey) || '[]');

  if (!viewed.includes(animalName)) {
    viewed.push(animalName);
    localStorage.setItem(viewedKey, JSON.stringify(viewed));

    // Update explorer achievements
    const totalViewed = viewed.length;
    const unlocked1 = updateAchievementProgress('first_discovery', 0);
    if (unlocked1) newlyUnlocked.push(unlocked1);

    if (totalViewed >= 10) {
      const unlocked2 = updateAchievementProgress('curious_explorer', 0);
      if (unlocked2) newlyUnlocked.push(unlocked2);
    }
    if (totalViewed >= 25) {
      const unlocked3 = updateAchievementProgress('wildlife_enthusiast', 0);
      if (unlocked3) newlyUnlocked.push(unlocked3);
    }
    if (totalViewed >= 50) {
      const unlocked4 = updateAchievementProgress('animal_expert', 0);
      if (unlocked4) newlyUnlocked.push(unlocked4);
    }
    if (totalViewed >= 100) {
      const unlocked5 = updateAchievementProgress('animal_master', 0);
      if (unlocked5) newlyUnlocked.push(unlocked5);
    }
  }

  return newlyUnlocked;
}

/**
 * Track favorite animal for achievements
 */
export function trackFavoriteForAchievements(count: number): Achievement[] {
  const newlyUnlocked: Achievement[] = [];

  // First favorite
  if (count === 1) {
    const unlocked = updateAchievementProgress('first_favorite', 0);
    if (unlocked) newlyUnlocked.push(unlocked);
  }

  // Collection milestones
  if (count >= 5) {
    const unlocked = updateAchievementProgress('collection_starter', 0);
    if (unlocked) newlyUnlocked.push(unlocked);
  }
  if (count >= 15) {
    const unlocked = updateAchievementProgress('dedicated_collector', 0);
    if (unlocked) newlyUnlocked.push(unlocked);
  }
  if (count >= 30) {
    const unlocked = updateAchievementProgress('master_collector', 0);
    if (unlocked) newlyUnlocked.push(unlocked);
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

function saveAchievementData(data: AchievementData): void {
  try {
    localStorage.setItem('achievement_data', JSON.stringify(data));
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

import { GameSettings, LeaderboardEntry, ShopItem } from '../types/game';
import { DEFAULT_SETTINGS } from './constants';

const STORAGE_KEYS = {
  SETTINGS: 'mouth_catch_settings',
  LEADERBOARD: 'mouth_catch_leaderboard',
  SHOP_ITEMS: 'mouth_catch_shop',
  UNLOCKED_LEVELS: 'mouth_catch_levels',
  TOTAL_COINS: 'mouth_catch_total_coins'
};

export const storage = {
  getSettings: (): GameSettings => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings: (settings: GameSettings): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  },

  getLeaderboard: (): LeaderboardEntry[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.LEADERBOARD);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  addLeaderboardEntry: (entry: Omit<LeaderboardEntry, 'id'>): void => {
    try {
      const leaderboard = storage.getLeaderboard();
      const newEntry: LeaderboardEntry = {
        ...entry,
        id: Date.now().toString()
      };
      
      leaderboard.push(newEntry);
      leaderboard.sort((a, b) => b.score - a.score);
      
      // Keep only top 10 scores
      const topScores = leaderboard.slice(0, 10);
      localStorage.setItem(STORAGE_KEYS.LEADERBOARD, JSON.stringify(topScores));
    } catch (error) {
      console.error('Failed to save leaderboard entry:', error);
    }
  },

  getShopItems: (): ShopItem[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SHOP_ITEMS);
      return stored ? JSON.parse(stored) : getDefaultShopItems();
    } catch {
      return getDefaultShopItems();
    }
  },

  updateShopItem: (itemId: string, purchased: boolean): void => {
    try {
      const items = storage.getShopItems();
      const item = items.find(i => i.id === itemId);
      if (item) {
        item.purchased = purchased;
        localStorage.setItem(STORAGE_KEYS.SHOP_ITEMS, JSON.stringify(items));
      }
    } catch (error) {
      console.error('Failed to update shop item:', error);
    }
  },

  getUnlockedLevels: (): number => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.UNLOCKED_LEVELS);
      return stored ? parseInt(stored, 10) : 1;
    } catch {
      return 1;
    }
  },

  unlockLevel: (level: number): void => {
    try {
      const current = storage.getUnlockedLevels();
      if (level > current) {
        localStorage.setItem(STORAGE_KEYS.UNLOCKED_LEVELS, level.toString());
      }
    } catch (error) {
      console.error('Failed to unlock level:', error);
    }
  },

  getTotalCoins: (): number => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.TOTAL_COINS);
      return stored ? parseInt(stored, 10) : 0;
    } catch {
      return 0;
    }
  },

  addCoins: (amount: number): void => {
    try {
      const current = storage.getTotalCoins();
      localStorage.setItem(STORAGE_KEYS.TOTAL_COINS, (current + amount).toString());
    } catch (error) {
      console.error('Failed to add coins:', error);
    }
  },

  spendCoins: (amount: number): boolean => {
    try {
      const current = storage.getTotalCoins();
      if (current >= amount) {
        localStorage.setItem(STORAGE_KEYS.TOTAL_COINS, (current - amount).toString());
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to spend coins:', error);
      return false;
    }
  }
};

function getDefaultShopItems(): ShopItem[] {
  return [
    { id: 'bg_space', name: 'Space Theme', price: 50, type: 'background', purchased: false },
    { id: 'bg_ocean', name: 'Ocean Theme', price: 75, type: 'background', purchased: false },
    { id: 'mouth_rainbow', name: 'Rainbow Mouth', price: 100, type: 'mouth', purchased: false },
    { id: 'cookie_sparkle', name: 'Sparkle Cookies', price: 125, type: 'cookie', purchased: false }
  ];
}
import { Cookie, LevelConfig, GameState } from '../types/game';
import { LEVEL_CONFIGS, COOKIE_TYPES } from './constants';

export function generateCookie(canvasWidth: number, level: number): Cookie {
  const config = LEVEL_CONFIGS[Math.min(level - 1, LEVEL_CONFIGS.length - 1)];
  const speed = config.minSpeed + Math.random() * (config.maxSpeed - config.minSpeed);
  
  // Determine cookie type based on probability
  const rand = Math.random();
  let type: Cookie['type'] = 'normal';
  
  if (rand < COOKIE_TYPES.rotten.probability) {
    type = 'rotten';
  } else if (rand < COOKIE_TYPES.rotten.probability + COOKIE_TYPES.golden.probability) {
    type = 'golden';
  }

  return {
    id: `cookie_${Date.now()}_${Math.random()}`,
    x: Math.random() * (canvasWidth - 60) + 30, // Keep cookies away from edges
    y: -30, // Start above the screen
    speed: speed * 60, // Convert to pixels per second
    radius: 15 + Math.random() * 5, // Random size between 15-20px
    type
  };
}

export function updateCookies(cookies: Cookie[], deltaTime: number): Cookie[] {
  return cookies
    .map(cookie => ({
      ...cookie,
      y: cookie.y + (cookie.speed * deltaTime / 16.67) // Normalize for 60fps
    }))
    .filter(cookie => cookie.y < 650); // Remove cookies that have fallen off screen (with margin)
}

export function calculateScore(cookieType: Cookie['type']): number {
  return COOKIE_TYPES[cookieType].points;
}

export function checkLevelUp(catches: number, currentLevel: number): number {
  const config = LEVEL_CONFIGS[Math.min(currentLevel - 1, LEVEL_CONFIGS.length - 1)];
  if (catches >= config.catchesRequired && currentLevel < LEVEL_CONFIGS.length) {
    return currentLevel + 1;
  }
  return currentLevel;
}

export function getLevelConfig(level: number): LevelConfig {
  return LEVEL_CONFIGS[Math.min(level - 1, LEVEL_CONFIGS.length - 1)];
}

export function calculateGameScore(gameState: GameState): number {
  const timeBonus = Math.max(0, 300 - Math.floor((Date.now() - gameState.gameStartTime) / 1000));
  const levelBonus = gameState.level * 10;
  const catchBonus = gameState.catches * 2;
  
  return gameState.score + timeBonus + levelBonus + catchBonus;
}

// Helper function to spawn cookies at regular intervals
export function shouldSpawnCookie(lastSpawnTime: number, level: number): boolean {
  const config = getLevelConfig(level);
  const timeSinceLastSpawn = Date.now() - lastSpawnTime;
  return timeSinceLastSpawn >= config.spawnRate;
}

// Get spawn rate for current level
export function getSpawnRate(level: number): number {
  const config = getLevelConfig(level);
  return config.spawnRate;
}
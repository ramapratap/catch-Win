import { Cookie, LevelConfig, GameState } from '../types/game';
import { LEVEL_CONFIGS, COOKIE_TYPES } from './constants';

export function generateCookie(canvasWidth: number, level: number): Cookie {
  const config = LEVEL_CONFIGS[level - 1];
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
    x: Math.random() * (canvasWidth - 60) + 30,
    y: -30,
    speed,
    radius: 15 + Math.random() * 5,
    type
  };
}

export function updateCookies(cookies: Cookie[], deltaTime: number): Cookie[] {
  return cookies
    .map(cookie => ({
      ...cookie,
      y: cookie.y + cookie.speed * deltaTime
    }))
    .filter(cookie => cookie.y < 600); // Remove cookies that have fallen off screen
}

export function calculateScore(cookieType: Cookie['type']): number {
  return COOKIE_TYPES[cookieType].points;
}

export function checkLevelUp(catches: number, currentLevel: number): number {
  const config = LEVEL_CONFIGS[currentLevel - 1];
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
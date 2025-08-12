import { useState, useCallback, useRef, useEffect } from 'react';
import { GameState, Cookie } from '../types/game';
import { generateCookie, updateCookies, calculateScore, checkLevelUp } from '../utils/gameLogic';
import { checkCollision } from '../utils/collisionDetection';
import { storage } from '../utils/storage';
import { COOKIE_TYPES, LEVEL_CONFIGS } from '../utils/constants';

// const initialGameState: GameState = {
//   isPlaying: false,
//   isPaused: false,
//   level: 1,
//   score: 0,
//   coins: 0,
//   catches: 0,
//   cookies: [],
//   mouthPosition: { x: 400, y: 300 },
//   mouthOpen: 0,
//   gameStartTime: 0
// };

export const useGameState = (canvasWidth: number, canvasHeight: number) => {
  const [gameState, setGameState] = useState<GameState>({
    isPlaying: false,
    isPaused: false,
    level: 1,
    score: 0,
    coins: 0,
    catches: 0,
    cookies: [],
    mouthPosition: { x: canvasWidth / 2, y: canvasHeight / 2 },
    mouthOpen: false,
    gameStartTime: 0
  });

  const lastSpawnRef = useRef<number>(0);
  const animationFrameRef = useRef<number>();

  const generateCookie = useCallback((): Cookie => {
    const config = LEVEL_CONFIGS[Math.min(gameState.level - 1, LEVEL_CONFIGS.length - 1)];
    const speed = config.minSpeed + Math.random() * (config.maxSpeed - config.minSpeed);
    
    // Determine cookie type
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
      speed: speed * 60,
      radius: 20,
      type
    };
  }, [canvasWidth, gameState.level]);

  const startGame = useCallback((level: number = 1) => {
    setGameState({
      isPlaying: true,
      isPaused: false,
      level,
      score: 0,
      coins: 0,
      catches: 0,
      cookies: [],
      mouthPosition: { x: canvasWidth / 2, y: canvasHeight / 2 },
      mouthOpen: false,
      gameStartTime: Date.now()
    });
    
    lastSpawnRef.current = Date.now();
  }, [canvasWidth, canvasHeight]);

  const pauseGame = useCallback(() => {
    setGameState(prev => ({ ...prev, isPaused: !prev.isPaused }));
  }, []);

  const endGame = useCallback(() => {
    // Save coins to total
    storage.addCoins(gameState.coins);

    setGameState({
      isPlaying: false,
      isPaused: false,
      level: 1,
      score: 0,
      coins: 0,
      catches: 0,
      cookies: [],
      mouthPosition: { x: canvasWidth / 2, y: canvasHeight / 2 },
      mouthOpen: false,
      gameStartTime: 0
    });

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, [gameState.coins, canvasWidth, canvasHeight]);

  const updateMouthPosition = useCallback((position: { x: number; y: number }, openness: number) => {
    const settings = storage.getSettings();
    const isOpen = openness >= settings.mouthOpenThreshold;
    
    setGameState(prev => ({
      ...prev,
      mouthPosition: position,
      mouthOpen: isOpen
    }));
  }, []);

  const gameLoop = useCallback(() => {
    if (!gameState.isPlaying || gameState.isPaused) return;

    const now = Date.now();
    
    setGameState(prev => {
      let newState = { ...prev };
      
      // Update cookies (move them down)
      newState.cookies = prev.cookies
        .map(cookie => ({
          ...cookie,
          y: cookie.y + cookie.speed / 60 // 60fps
        }))
        .filter(cookie => cookie.y < canvasHeight + 50);
      
      // Spawn new cookies
      const config = LEVEL_CONFIGS[Math.min(prev.level - 1, LEVEL_CONFIGS.length - 1)];
      if (now - lastSpawnRef.current > config.spawnRate) {
        newState.cookies.push(generateCookie());
        lastSpawnRef.current = now;
      }

      // Check collisions when mouth is open
      if (prev.mouthOpen) {
        const mouthRadius = 30;
        
        newState.cookies = newState.cookies.filter(cookie => {
          const distance = Math.sqrt(
            Math.pow(prev.mouthPosition.x - cookie.x, 2) + 
            Math.pow(prev.mouthPosition.y - cookie.y, 2)
          );
          
          if (distance <= (mouthRadius + cookie.radius)) {
            const points = COOKIE_TYPES[cookie.type].points;
            newState.score += points;
            newState.coins += points;
            newState.catches += 1;
            
            // Check for level up
            if (newState.catches >= config.catchesRequired && prev.level < LEVEL_CONFIGS.length) {
              newState.level = prev.level + 1;
            }
            
            return false; // Remove caught cookie
          }
          
          return true; // Keep uncaught cookie
        });
      }

      return newState;
    });

    animationFrameRef.current = requestAnimationFrame(gameLoop);
  }, [gameState.isPlaying, gameState.isPaused, canvasHeight, generateCookie]);

  useEffect(() => {
    if (gameState.isPlaying && !gameState.isPaused) {
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameLoop, gameState.isPlaying, gameState.isPaused]);

  return {
    gameState,
    startGame,
    pauseGame,
    endGame,
    updateMouthPosition
  };
};
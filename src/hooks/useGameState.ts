import { useState, useCallback, useRef, useEffect } from 'react';
import { GameState, Cookie } from '../types/game';
import { generateCookie, updateCookies, calculateScore, checkLevelUp } from '../utils/gameLogic';
import { checkCollision } from '../utils/collisionDetection';
import { storage } from '../utils/storage';

const initialGameState: GameState = {
  isPlaying: false,
  isPaused: false,
  level: 1,
  score: 0,
  coins: 0,
  catches: 0,
  cookies: [],
  mouthPosition: { x: 400, y: 300 },
  mouthOpen: 0,
  gameStartTime: 0
};

export function useGameState(canvasWidth: number, canvasHeight: number) {
  const [gameState, setGameState] = useState<GameState>({
    ...initialGameState,
    mouthPosition: { x: canvasWidth / 2, y: canvasHeight / 2 }
  });

  const lastUpdateRef = useRef<number>(0);
  const lastSpawnRef = useRef<number>(0);
  const animationFrameRef = useRef<number>();

  const startGame = useCallback((level: number = 1) => {
    setGameState(prev => ({
      ...initialGameState,
      isPlaying: true,
      level,
      mouthPosition: { x: canvasWidth / 2, y: canvasHeight / 2 },
      gameStartTime: Date.now()
    }));
    
    lastUpdateRef.current = Date.now();
    lastSpawnRef.current = Date.now();
  }, [canvasWidth, canvasHeight]);

  const pauseGame = useCallback(() => {
    setGameState(prev => ({ ...prev, isPaused: !prev.isPaused }));
  }, []);

  const endGame = useCallback(() => {
    const finalScore = gameState.score;
    const finalCoins = gameState.coins;
    
    // Save to leaderboard
    storage.addLeaderboardEntry({
      date: new Date().toISOString(),
      score: finalScore,
      coins: finalCoins,
      level: gameState.level,
      catches: gameState.catches
    });

    // Add coins to total
    storage.addCoins(finalCoins);

    setGameState(prev => ({ 
      ...initialGameState,
      mouthPosition: { x: canvasWidth / 2, y: canvasHeight / 2 }
    }));

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, [gameState.score, gameState.coins, gameState.level, gameState.catches, canvasWidth, canvasHeight]);

  const updateMouthPosition = useCallback((position: { x: number; y: number }, openness: number) => {
    setGameState(prev => ({
      ...prev,
      mouthPosition: position,
      mouthOpen: openness
    }));
  }, []);

  const gameLoop = useCallback(() => {
    if (!gameState.isPlaying || gameState.isPaused) return;

    const now = Date.now();
    const deltaTime = (now - lastUpdateRef.current) / 16.67; // Normalize to 60fps
    lastUpdateRef.current = now;

    setGameState(prev => {
      let newState = { ...prev };
      
      // Update cookies
      newState.cookies = updateCookies(prev.cookies, deltaTime);
      
      // Spawn new cookies
      const timeSinceLastSpawn = now - lastSpawnRef.current;
      const currentLevel = Math.min(prev.level, 3);
      const spawnRate = currentLevel === 1 ? 1200 : currentLevel === 2 ? 800 : 500;
      
      if (timeSinceLastSpawn > spawnRate) {
        newState.cookies.push(generateCookie(canvasWidth, prev.level));
        lastSpawnRef.current = now;
      }

      // Check collisions
      const settings = storage.getSettings();
      if (prev.mouthOpen >= settings.mouthOpenThreshold) {
        const mouthRadius = 25;
        
        newState.cookies = newState.cookies.filter(cookie => {
          const collision = checkCollision(
            prev.mouthPosition.x,
            prev.mouthPosition.y,
            mouthRadius,
            cookie
          );
          
          if (collision) {
            const points = calculateScore(cookie.type);
            newState.score += points;
            newState.coins += points;
            newState.catches += 1;
            
            // Check for level up
            const newLevel = checkLevelUp(newState.catches, prev.level);
            if (newLevel > prev.level) {
              newState.level = newLevel;
              storage.unlockLevel(newLevel);
            }
            
            return false; // Remove caught cookie
          }
          
          return true; // Keep uncaught cookie
        });
      }

      return newState;
    });

    animationFrameRef.current = requestAnimationFrame(gameLoop);
  }, [gameState.isPlaying, gameState.isPaused, canvasWidth]);

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
}
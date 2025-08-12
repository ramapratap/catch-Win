import { useState, useCallback, useRef, useEffect } from 'react';
import { GameState, Cookie } from '../types/game';
import { storage } from '../utils/storage';
import { COOKIE_TYPES, LEVEL_CONFIGS } from '../utils/constants';

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
  const gameStateRef = useRef(gameState); // Keep a ref to the current game state

  // Update the ref whenever gameState changes
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  const startGame = useCallback((level: number = 1) => {
    console.log('Starting game at level:', level);
    const newState = {
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
    };
    
    setGameState(newState);
    gameStateRef.current = newState;
    lastSpawnRef.current = Date.now();
  }, [canvasWidth, canvasHeight]);

  const pauseGame = useCallback(() => {
    setGameState(prev => {
      const newState = { ...prev, isPaused: !prev.isPaused };
      gameStateRef.current = newState;
      return newState;
    });
  }, []);

  const endGame = useCallback(() => {
    console.log('Ending game, adding coins:', gameStateRef.current.coins);
    storage.addCoins(gameStateRef.current.coins);

    const newState = {
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
    };

    setGameState(newState);
    gameStateRef.current = newState;

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, [canvasWidth, canvasHeight]);

  const updateMouthPosition = useCallback((position: { x: number; y: number }, openness: number) => {
    const settings = storage.getSettings();
    const isOpen = openness >= settings.mouthOpenThreshold;
    
    setGameState(prev => {
      const newState = {
        ...prev,
        mouthPosition: position,
        mouthOpen: isOpen
      };
      gameStateRef.current = newState;
      return newState;
    });
  }, []);

  // Game loop - runs independently of gameState changes
  useEffect(() => {
    const gameLoop = () => {
      const currentState = gameStateRef.current;
      
      if (!currentState.isPlaying || currentState.isPaused) {
        animationFrameRef.current = requestAnimationFrame(gameLoop);
        return;
      }

      const now = Date.now();
      const config = LEVEL_CONFIGS[Math.min(currentState.level - 1, LEVEL_CONFIGS.length - 1)];
      
      // Create new state
      let newCookies = [...currentState.cookies];
      let newScore = currentState.score;
      let newCoins = currentState.coins;
      let newCatches = currentState.catches;
      let newLevel = currentState.level;
      
      // 1. Update existing cookies (move them down)
      newCookies = newCookies
        .map(cookie => ({
          ...cookie,
          y: cookie.y + (cookie.speed / 60)
        }))
        .filter(cookie => cookie.y < canvasHeight + 100);
      
      // 2. Spawn new cookies
      if (now - lastSpawnRef.current > config.spawnRate) {
        const speed = config.minSpeed + Math.random() * (config.maxSpeed - config.minSpeed);
        const rand = Math.random();
        let type: Cookie['type'] = 'normal';
        
        if (rand < COOKIE_TYPES.rotten.probability) {
          type = 'rotten';
        } else if (rand < COOKIE_TYPES.rotten.probability + COOKIE_TYPES.golden.probability) {
          type = 'golden';
        }

        const newCookie: Cookie = {
          id: `cookie_${Date.now()}_${Math.random()}`,
          x: Math.random() * (canvasWidth - 60) + 30,
          y: -30,
          speed: speed * 60,
          radius: 20,
          type
        };
        
        newCookies.push(newCookie);
        lastSpawnRef.current = now;
        
        console.log('Cookie spawned:', newCookie.id, 'at position', newCookie.x, newCookie.y, 'Total cookies:', newCookies.length);
      }

      // 3. Check collisions when mouth is open
      if (currentState.mouthOpen) {
        const mouthRadius = 30;
        
        const uncaughtCookies: Cookie[] = [];
        
        newCookies.forEach(cookie => {
          const distance = Math.sqrt(
            Math.pow(currentState.mouthPosition.x - cookie.x, 2) + 
            Math.pow(currentState.mouthPosition.y - cookie.y, 2)
          );
          
          if (distance <= (mouthRadius + cookie.radius)) {
            const points = COOKIE_TYPES[cookie.type].points;
            newScore += points;
            newCoins += points;
            newCatches += 1;
            
            console.log('Cookie caught!', cookie.type, 'Points:', points, 'Total coins:', newCoins);
          } else {
            uncaughtCookies.push(cookie);
          }
        });
        
        newCookies = uncaughtCookies;
        
        // Check for level up
        if (newCatches >= config.catchesRequired && currentState.level < LEVEL_CONFIGS.length) {
          newLevel = currentState.level + 1;
          console.log('Level up!', newLevel);
        }
      }

      // Update state if anything changed
      const hasChanges = (
        newCookies.length !== currentState.cookies.length ||
        newScore !== currentState.score ||
        newCoins !== currentState.coins ||
        newCatches !== currentState.catches ||
        newLevel !== currentState.level
      );

      if (hasChanges) {
        const newState = {
          ...currentState,
          cookies: newCookies,
          score: newScore,
          coins: newCoins,
          catches: newCatches,
          level: newLevel
        };
        
        setGameState(newState);
        gameStateRef.current = newState;
        
        console.log('State updated - Cookies:', newCookies.length, 'Score:', newScore, 'Coins:', newCoins);
      }

      // Continue the loop
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    // Start the game loop
    animationFrameRef.current = requestAnimationFrame(gameLoop);

    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []); // Empty dependency array - this runs once and manages its own state

  return {
    gameState,
    startGame,
    pauseGame,
    endGame,
    updateMouthPosition
  };
};
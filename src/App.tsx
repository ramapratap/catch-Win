import React, { useState, useEffect } from 'react';
import { HomeScreen } from './components/UI/HomeScreen';
import { Settings } from './components/UI/Settings';
import { Leaderboard } from './components/UI/Leaderboard';
import { Shop } from './components/UI/Shop';
import { GameCanvas } from './components/Game/GameCanvas';
import { GameHUD } from './components/Game/GameHUD';
import { FaceTracker } from './components/Game/FaceTracker';
import { useGameState } from './hooks/useGameState';
import { storage } from './utils/storage';
import { loadGameAssets, ASSETS } from './utils/assets';

type Screen = 'home' | 'game' | 'settings' | 'leaderboard' | 'shop';

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [showSettings, setShowSettings] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [gameAssets, setGameAssets] = useState<{ [key: string]: HTMLImageElement | null }>({});
  
  const canvasWidth = 800;
  const canvasHeight = 600;
  
  const { gameState, startGame, pauseGame, endGame, updateMouthPosition } = useGameState(canvasWidth, canvasHeight);
  
  // Load game assets on startup
  useEffect(() => {
    const initAssets = async () => {
      console.log('🎮 Loading game assets...');
      const assets = await loadGameAssets();
      setGameAssets(assets);
      setAssetsLoaded(true);
      console.log('✅ Game assets loaded');
    };
    
    initAssets();
  }, []);

  // Get current settings
  const settings = storage.getSettings();

  const handleStartGame = (level: number) => {
    startGame(level);
    setCurrentScreen('game');
  };

  const handleEndGame = () => {
    endGame();
    setCurrentScreen('home');
  };

  const handlePause = () => {
    pauseGame();
  };

  // Touch controls fallback for when camera is disabled
  const handleCanvasInteraction = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!settings.cameraEnabled && gameState.isPlaying && !gameState.isPaused) {
      const rect = event.currentTarget.getBoundingClientRect();
      const scaleX = canvasWidth / rect.width;
      const scaleY = canvasHeight / rect.height;
      
      const x = (event.clientX - rect.left) * scaleX;
      const y = (event.clientY - rect.top) * scaleY;
      
      // Simulate mouth open when clicking
      updateMouthPosition({ x, y }, settings.mouthOpenThreshold + 0.01);
      
      // Reset after a short delay
      setTimeout(() => {
        updateMouthPosition({ x, y }, 0.01);
      }, 200);
    }
  };

  // Mouse move for dragging mouth position in touch mode
  const handleCanvasMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!settings.cameraEnabled && gameState.isPlaying && !gameState.isPaused) {
      const rect = event.currentTarget.getBoundingClientRect();
      const scaleX = canvasWidth / rect.width;
      const scaleY = canvasHeight / rect.height;
      
      const x = (event.clientX - rect.left) * scaleX;
      const y = (event.clientY - rect.top) * scaleY;
      
      updateMouthPosition({ x, y }, gameState.mouthOpen);
    }
  };

  // Loading screen while assets load
  if (!assetsLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-white mb-2">Loading Mouth-Catch Arcade</h2>
          <p className="text-purple-200">Preparing your cookie-catching experience...</p>
        </div>
      </div>
    );
  }

  if (currentScreen === 'game') {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center">
        <div className="relative">
          <GameHUD 
            gameState={gameState}
            onPause={handlePause}
            onHome={handleEndGame}
          />
          
          <div className="mt-16">
            <FaceTracker
              onMouthUpdate={updateMouthPosition}
              canvasWidth={canvasWidth}
              canvasHeight={canvasHeight}
            >
              <div 
                className="relative bg-black rounded-lg overflow-hidden shadow-2xl"
                style={{ width: canvasWidth, height: canvasHeight }}
                onClick={handleCanvasInteraction}
                onMouseMove={handleCanvasMouseMove}
              >
                {/* Interactive area for touch controls */}
                {!settings.cameraEnabled && (
                  <div 
                    className="absolute inset-0 cursor-crosshair z-10"
                    style={{ 
                      background: 'rgba(0,0,0,0.1)',
                      pointerEvents: 'all'
                    }}
                  />
                )}
                
                {/* Game canvas */}
                <GameCanvas
                  gameState={gameState}
                  width={canvasWidth}
                  height={canvasHeight}
                  cookieImage={gameAssets[ASSETS.COOKIES]}
                />
                
                {/* Touch mode instructions */}
                {!settings.cameraEnabled && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-lg text-sm pointer-events-none">
                    🎮 Click anywhere to move mouth • Click to catch cookies
                  </div>
                )}
              </div>
            </FaceTracker>
          </div>

          {gameState.isPaused && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm z-50">
              <div className="bg-white rounded-xl p-8 text-center shadow-2xl">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Game Paused</h2>
                <p className="text-gray-600 mb-6">Take a break and come back when ready!</p>
                <div className="space-x-4">
                  <button
                    onClick={handlePause}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                  >
                    Resume Game
                  </button>
                  <button
                    onClick={handleEndGame}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                  >
                    End Game
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <Settings
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          currentMouthOpenness={gameState.mouthOpen}
        />
      </div>
    );
  }

  return (
    <>
      <HomeScreen
        onStartGame={handleStartGame}
        onOpenSettings={() => setShowSettings(true)}
        onOpenLeaderboard={() => setShowLeaderboard(true)}
        onOpenShop={() => setShowShop(true)}
      />

      <Settings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        currentMouthOpenness={0}
      />

      <Leaderboard
        isOpen={showLeaderboard}
        onClose={() => setShowLeaderboard(false)}
      />

      <Shop
        isOpen={showShop}
        onClose={() => setShowShop(false)}
      />
    </>
  );
}

export default App;
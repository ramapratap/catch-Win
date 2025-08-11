import React, { useState } from 'react';
import { HomeScreen } from './components/UI/HomeScreen';
import { Settings } from './components/UI/Settings';
import { Leaderboard } from './components/UI/Leaderboard';
import { Shop } from './components/UI/Shop';
import { GameCanvas } from './components/Game/GameCanvas';
import { GameHUD } from './components/Game/GameHUD';
import { FaceTracker } from './components/Game/FaceTracker';
import { useGameState } from './hooks/useGameState';
import { useFaceTracking } from './hooks/useFaceTracking';
import { storage } from './utils/storage';

type Screen = 'home' | 'game' | 'settings' | 'leaderboard' | 'shop';

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [showSettings, setShowSettings] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showShop, setShowShop] = useState(false);
  
  const canvasWidth = 800;
  const canvasHeight = 600;
  
  const { gameState, startGame, pauseGame, endGame, updateMouthPosition } = useGameState(canvasWidth, canvasHeight);
  
  // Get current mouth openness for settings display
  const settings = storage.getSettings();
  const { mouthOpenness } = useFaceTracking(settings.cameraEnabled && currentScreen === 'game', canvasWidth, canvasHeight);

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

  // Touch controls fallback
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!settings.cameraEnabled && gameState.isPlaying) {
      const rect = event.currentTarget.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      
      // Simulate mouth open when clicking
      updateMouthPosition({ x, y }, 0.05); // Above threshold
      
      // Reset after a short delay
      setTimeout(() => {
        updateMouthPosition({ x, y }, 0.01);
      }, 200);
    }
  };

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
              <GameCanvas
                gameState={gameState}
                width={canvasWidth}
                height={canvasHeight}
              />
              
              {/* Touch control overlay */}
              {!settings.cameraEnabled && (
                <div 
                  className="absolute inset-0 cursor-pointer"
                  onClick={handleCanvasClick}
                  style={{ width: canvasWidth, height: canvasHeight }}
                >
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-lg text-sm">
                    👆 Click to catch cookies
                  </div>
                </div>
              )}
            </FaceTracker>
          </div>

          {gameState.isPaused && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
              <div className="bg-white rounded-xl p-8 text-center shadow-2xl">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Game Paused</h2>
                <div className="space-x-4">
                  <button
                    onClick={handlePause}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold"
                  >
                    Resume
                  </button>
                  <button
                    onClick={handleEndGame}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-semibold"
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
          currentMouthOpenness={mouthOpenness}
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
        currentMouthOpenness={mouthOpenness}
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
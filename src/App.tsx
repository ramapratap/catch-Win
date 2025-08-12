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
import { Button } from './components/Common/Button';
import { Coins, Home, Pause, Play, Target, Trophy } from 'lucide-react';
import { COOKIE_TYPES, LEVEL_CONFIGS } from './utils/constants';
import { Cookie } from './types/game';
import { useFaceTracking } from './hooks/useFaceTracking';

type Screen = 'home' | 'game' | 'settings' | 'leaderboard' | 'shop';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'home' | 'game'>('home');
  const [selectedLevel, setSelectedLevel] = useState(1);
  
  const canvasWidth = window.innerWidth;
  const canvasHeight = window.innerHeight;
  
  const { gameState, startGame, pauseGame, endGame, updateMouthPosition } = useGameState(canvasWidth, canvasHeight);
  const { videoRef, isInitialized, error, mouthPosition, mouthOpenness, faceDetected } = useFaceTracking(
    currentScreen === 'game', 
    canvasWidth, 
    canvasHeight
  );
  
  const settings = storage.getSettings();
  const totalCoins = storage.getTotalCoins();

  useEffect(() => {
    updateMouthPosition(mouthPosition, mouthOpenness);
  }, [mouthPosition, mouthOpenness, updateMouthPosition]);

  const handleStartGame = () => {
    startGame(selectedLevel);
    setCurrentScreen('game');
  };

  const handleEndGame = () => {
    endGame();
    setCurrentScreen('home');
  };

  const drawCookie = (ctx: CanvasRenderingContext2D, cookie: Cookie) => {
    const { x, y, radius, type } = cookie;
    const cookieData = COOKIE_TYPES[type];
    
    // Cookie shadow
    ctx.save();
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(x + 3, y + 3, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Cookie body
    ctx.fillStyle = cookieData.color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    // Cookie texture
    ctx.fillStyle = type === 'golden' ? '#FCD34D' : type === 'rotten' ? '#4B5563' : '#92400E';
    const dots = type === 'rotten' ? 3 : 6;
    
    for (let i = 0; i < dots; i++) {
      const angle = (i / dots) * Math.PI * 2;
      const dotX = x + Math.cos(angle) * (radius * 0.5);
      const dotY = y + Math.sin(angle) * (radius * 0.5);
      ctx.beginPath();
      ctx.arc(dotX, dotY, radius * 0.15, 0, Math.PI * 2);
      ctx.fill();
    }

    // Special effects
    if (type === 'golden') {
      ctx.save();
      ctx.globalAlpha = 0.8;
      ctx.fillStyle = '#FEF3C7';
      const time = Date.now() / 500;
      for (let i = 0; i < 4; i++) {
        const angle = time + (i * Math.PI * 0.5);
        const sparkleX = x + Math.cos(angle) * (radius + 8);
        const sparkleY = y + Math.sin(angle) * (radius + 8);
        ctx.beginPath();
        ctx.arc(sparkleX, sparkleY, 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  };

  const drawMouthIndicator = (ctx: CanvasRenderingContext2D) => {
    const { mouthPosition, mouthOpen } = gameState;
    
    ctx.save();
    ctx.globalAlpha = 0.7;
    ctx.strokeStyle = mouthOpen ? '#10B981' : '#EF4444';
    ctx.lineWidth = 3;
    
    if (!mouthOpen) {
      ctx.setLineDash([5, 5]);
    }
    
    const radius = 30;
    ctx.beginPath();
    ctx.arc(mouthPosition.x, mouthPosition.y, radius, 0, Math.PI * 2);
    ctx.stroke();
    
    // Inner fill
    ctx.globalAlpha = 0.2;
    ctx.fillStyle = mouthOpen ? '#10B981' : '#EF4444';
    ctx.fill();
    
    ctx.restore();
  };

  // Home Screen
  if (currentScreen === 'home') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex flex-col items-center justify-center p-4">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-white mb-4">🍪 Mouth-Catch Arcade</h1>
          <p className="text-xl text-purple-200 mb-6">
            Catch falling cookies with your mouth using your webcam!
          </p>
          
          <div className="flex items-center justify-center space-x-2 text-yellow-400 mb-8">
            <Coins className="w-6 h-6" />
            <span className="text-2xl font-bold">{totalCoins} coins</span>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 mb-8 max-w-md w-full">
          <h3 className="text-2xl font-bold text-white mb-6 text-center">Choose Level</h3>
          <div className="space-y-3">
            {LEVEL_CONFIGS.map((level, index) => (
              <button
                key={index}
                onClick={() => setSelectedLevel(index + 1)}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                  selectedLevel === index + 1
                    ? 'border-purple-400 bg-purple-500/20'
                    : 'border-gray-600 bg-gray-800/50 hover:border-purple-300'
                }`}
              >
                <div className="text-white font-semibold text-lg">{level.name}</div>
                <div className="text-gray-300 text-sm">
                  Catches needed: {level.catchesRequired}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <Button onClick={handleStartGame} size="lg" icon={Play}>
            Start Game
          </Button>
          
          <div className="text-center text-purple-200 text-sm">
            <p>📹 Make sure to allow camera access</p>
            <p>👄 Open your mouth to catch cookies!</p>
          </div>
        </div>
      </div>
    );
  }

  // Game Screen
  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* Full Screen Camera Feed */}
      {videoRef && (
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1]"
          style={{ zIndex: 1 }}
        />
      )}

      {/* Game Canvas Overlay */}
      <canvas
        ref={(canvas) => {
          if (!canvas) return;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) return;
          
          canvas.width = canvasWidth;
          canvas.height = canvasHeight;
          
          // Clear canvas
          ctx.clearRect(0, 0, canvasWidth, canvasHeight);
          
          // Draw cookies
          gameState.cookies.forEach(cookie => drawCookie(ctx, cookie));
          
          // Draw mouth indicator
          if (gameState.isPlaying) {
            drawMouthIndicator(ctx);
          }
        }}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 2 }}
      />

      {/* Game HUD */}
      <div className="absolute top-0 left-0 right-0 bg-black/50 backdrop-blur-sm text-white p-4" style={{ zIndex: 3 }}>
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <div>
                <div className="text-sm text-gray-300">Score</div>
                <div className="font-bold text-lg">{gameState.score.toLocaleString()}</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Coins className="w-5 h-5 text-yellow-400" />
              <div>
                <div className="text-sm text-gray-300">Coins</div>
                <div className="font-bold text-lg">{gameState.coins}</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-green-400" />
              <div>
                <div className="text-sm text-gray-300">Level {gameState.level}</div>
                <div className="font-bold text-lg">{gameState.catches} catches</div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              onClick={pauseGame}
              variant="secondary"
              size="sm"
              icon={gameState.isPaused ? Play : Pause}
              className="bg-white/20 hover:bg-white/30 border-white/30"
            >
              {gameState.isPaused ? 'Resume' : 'Pause'}
            </Button>
            
            <Button
              onClick={handleEndGame}
              variant="secondary"
              size="sm"
              icon={Home}
              className="bg-white/20 hover:bg-white/30 border-white/30"
            >
              Home
            </Button>
          </div>
        </div>
      </div>

      {/* Face Detection Status */}
      {!faceDetected && gameState.isPlaying && !gameState.isPaused && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-10">
          <div className="bg-yellow-500 text-white px-6 py-3 rounded-lg shadow-lg animate-pulse">
            <p className="text-lg font-semibold">👀 Position your face in view</p>
            <p className="text-sm">Make sure you're well-lit and centered</p>
          </div>
        </div>
      )}
      
      {faceDetected && gameState.isPlaying && !gameState.isPaused && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-10">
          <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg">
            <p className="text-lg font-semibold">✅ Face detected - Open mouth to catch cookies!</p>
            <p className="text-sm">Mouth openness: {(mouthOpenness * 100).toFixed(1)}%</p>
          </div>
        </div>
      )}

      {/* Camera Error */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20">
          <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg max-w-md text-center">
            <strong className="font-bold">Camera Error: </strong>
            <span className="block mt-2">{error}</span>
            <Button onClick={handleEndGame} icon={Home} className="mt-4">
              Back to Home
            </Button>
          </div>
        </div>
      )}

      {/* Pause Overlay */}
      {gameState.isPaused && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm z-20">
          <div className="bg-white rounded-xl p-8 text-center shadow-2xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Game Paused</h2>
            <p className="text-gray-600 mb-6">Take a break and come back when ready!</p>
            <div className="space-x-4">
              <Button onClick={pauseGame} icon={Home} variant="primary">
                Resume Game
              </Button>
              <Button onClick={handleEndGame} icon={Home} variant="secondary">
                End Game
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center text-white z-10">
        <div className="bg-black/50 px-4 py-2 rounded-lg">
          <p className="text-sm">
            🍪 Normal: +5 coins • ⭐ Golden: +25 coins • ☠️ Rotten: -10 coins
          </p>
        </div>
      </div>
    </div>
  );
}
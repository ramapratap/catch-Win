import React, { useState } from 'react';
import { Play, Settings, Trophy, ShoppingBag, Camera, Gamepad } from 'lucide-react';
import { Button } from '../Common/Button';
import { Header } from '../Common/Header';
import { storage } from '../../utils/storage';

interface HomeScreenProps {
  onStartGame: (level: number) => void;
  onOpenSettings: () => void;
  onOpenLeaderboard: () => void;
  onOpenShop: () => void;
}

export function HomeScreen({ onStartGame, onOpenSettings, onOpenLeaderboard, onOpenShop }: HomeScreenProps) {
  const [selectedLevel, setSelectedLevel] = useState(1);
  const unlockedLevels = storage.getUnlockedLevels();
  const settings = storage.getSettings();
  
  const levels = [
    { id: 1, name: 'Easy', description: 'Perfect for beginners', color: 'bg-green-500' },
    { id: 2, name: 'Medium', description: 'A bit more challenging', color: 'bg-yellow-500' },
    { id: 3, name: 'Hard', description: 'For the pros!', color: 'bg-red-500' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            Catch Cookies with Your Mouth!
          </h2>
          <p className="text-xl text-purple-200 mb-6">
            Use your webcam and open your mouth to catch falling cookies
          </p>
          
          {!settings.cameraEnabled && (
            <div className="bg-yellow-500/20 border border-yellow-500 rounded-lg p-4 mb-6 max-w-md mx-auto">
              <div className="flex items-center space-x-2 text-yellow-200">
                <Camera className="w-5 h-5" />
                <span className="text-sm">Camera disabled - Touch controls will be used</span>
              </div>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Level Selection */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
            <h3 className="text-2xl font-bold text-white mb-4">Choose Level</h3>
            <div className="space-y-3">
              {levels.map((level) => (
                <button
                  key={level.id}
                  onClick={() => setSelectedLevel(level.id)}
                  disabled={level.id > unlockedLevels}
                  className={`w-full p-4 rounded-lg border-2 transition-all ${
                    selectedLevel === level.id
                      ? 'border-purple-400 bg-purple-500/20'
                      : 'border-gray-600 bg-gray-800/50'
                  } ${
                    level.id > unlockedLevels
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:border-purple-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full ${level.color}`} />
                    <div className="text-left">
                      <div className="text-white font-semibold">
                        {level.name}
                        {level.id > unlockedLevels && ' 🔒'}
                      </div>
                      <div className="text-gray-300 text-sm">{level.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Game Controls */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
            <h3 className="text-2xl font-bold text-white mb-4">How to Play</h3>
            <div className="space-y-4 text-purple-200">
              <div className="flex items-start space-x-3">
                <Camera className="w-5 h-5 mt-1 text-purple-400" />
                <p>Allow camera access for face tracking</p>
              </div>
              <div className="flex items-start space-x-3">
                <Gamepad className="w-5 h-5 mt-1 text-purple-400" />
                <p>Open your mouth to catch falling cookies</p>
              </div>
              <div className="flex items-start space-x-3">
                <Trophy className="w-5 h-5 mt-1 text-purple-400" />
                <p>Collect coins to unlock cosmetic upgrades</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-4">
          <Button
            onClick={() => onStartGame(selectedLevel)}
            variant="primary"
            size="lg"
            icon={Play}
            className="min-w-32"
          >
            Start Game
          </Button>
          
          <Button
            onClick={onOpenSettings}
            variant="secondary"
            size="lg"
            icon={Settings}
          >
            Settings
          </Button>
          
          <Button
            onClick={onOpenLeaderboard}
            variant="secondary"
            size="lg"
            icon={Trophy}
          >
            Leaderboard
          </Button>
          
          <Button
            onClick={onOpenShop}
            variant="secondary"
            size="lg"
            icon={ShoppingBag}
          >
            Shop
          </Button>
        </div>
      </main>
    </div>
  );
}
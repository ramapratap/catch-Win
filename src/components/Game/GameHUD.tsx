import React from 'react';
import { Pause, Play, Home, Coins, Target, Trophy } from 'lucide-react';
import { Button } from '../Common/Button';
import { GameState } from '../../types/game';
import { LEVEL_CONFIGS } from '../../utils/constants';

interface GameHUDProps {
  gameState: GameState;
  onPause: () => void;
  onHome: () => void;
}

export function GameHUD({ gameState, onPause, onHome }: GameHUDProps) {
  const currentLevelConfig = LEVEL_CONFIGS[Math.min(gameState.level - 1, LEVEL_CONFIGS.length - 1)];
  const progress = (gameState.catches / currentLevelConfig.catchesRequired) * 100;

  return (
    <div className="absolute top-0 left-0 right-0 bg-black/20 backdrop-blur-sm text-white p-4">
      <div className="flex items-center justify-between max-w-6xl mx-auto">
        {/* Left Side - Game Stats */}
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
              <div className="text-sm text-gray-300">Catches</div>
              <div className="font-bold text-lg">{gameState.catches}</div>
            </div>
          </div>
        </div>

        {/* Center - Level Progress */}
        <div className="flex-1 max-w-xs mx-8">
          <div className="text-center mb-2">
            <span className="text-sm text-gray-300">Level {gameState.level}</span>
            <span className="text-xs text-gray-400 ml-2">({currentLevelConfig.name})</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <div className="text-xs text-gray-400 text-center mt-1">
            {gameState.catches} / {currentLevelConfig.catchesRequired}
          </div>
        </div>

        {/* Right Side - Controls */}
        <div className="flex items-center space-x-2">
          <Button
            onClick={onPause}
            variant="secondary"
            size="sm"
            icon={gameState.isPaused ? Play : Pause}
            className="bg-white/20 hover:bg-white/30 border-white/30"
          >
            {gameState.isPaused ? 'Resume' : 'Pause'}
          </Button>
          
          <Button
            onClick={onHome}
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
  );
}
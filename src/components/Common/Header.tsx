import React from 'react';
import { Gamepad2, Coins } from 'lucide-react';
import { storage } from '../../utils/storage';

interface HeaderProps {
  showCoins?: boolean;
}

export function Header({ showCoins = true }: HeaderProps) {
  const totalCoins = storage.getTotalCoins();
  
  return (
    <header className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 shadow-lg">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Gamepad2 className="w-8 h-8" />
          <h1 className="text-2xl font-bold">Mouth-Catch Arcade</h1>
        </div>
        
        {showCoins && (
          <div className="flex items-center space-x-2 bg-black/20 px-3 py-1 rounded-full">
            <Coins className="w-5 h-5 text-yellow-400" />
            <span className="font-semibold">{totalCoins}</span>
          </div>
        )}
      </div>
    </header>
  );
}
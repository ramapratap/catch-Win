import React from 'react';
import { Trophy, Calendar, Coins, Target, Award } from 'lucide-react';
import { Modal } from './Modal';
import { storage } from '../../utils/storage';
import { LeaderboardEntry } from '../../types/game';

interface LeaderboardProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Leaderboard({ isOpen, onClose }: LeaderboardProps) {
  const entries = storage.getLeaderboard();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return '🥇';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return `#${index + 1}`;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Leaderboard" size="lg">
      <div className="space-y-6">
        <div className="text-center">
          <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-2" />
          <h3 className="text-xl font-bold text-gray-900">Top Scores</h3>
          <p className="text-gray-600">Your best performances</p>
        </div>

        {entries.length === 0 ? (
          <div className="text-center py-12">
            <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-600 mb-2">No scores yet</h4>
            <p className="text-gray-500">Play a game to see your scores here!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {entries.map((entry, index) => (
              <div
                key={entry.id}
                className={`p-4 rounded-lg border-2 transition-all ${
                  index === 0
                    ? 'border-yellow-400 bg-yellow-50'
                    : index === 1
                    ? 'border-gray-400 bg-gray-50'
                    : index === 2
                    ? 'border-amber-600 bg-amber-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl font-bold">
                      {getRankIcon(index)}
                    </span>
                    <div>
                      <div className="text-lg font-semibold text-gray-900">
                        {entry.score.toLocaleString()} points
                      </div>
                      <div className="flex items-center space-x-1 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(entry.date)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center space-x-1 text-yellow-600 mb-1">
                      <Coins className="w-4 h-4" />
                      <span className="font-semibold">{entry.coins}</span>
                    </div>
                    <div className="text-sm text-gray-600">Level {entry.level}</div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-3 border-t border-gray-200">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-purple-600">
                      {entry.catches}
                    </div>
                    <div className="text-xs text-gray-500">Catches</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-lg font-semibold text-blue-600">
                      {entry.level}
                    </div>
                    <div className="text-xs text-gray-500">Level</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-lg font-semibold text-green-600">
                      {entry.coins}
                    </div>
                    <div className="text-xs text-gray-500">Coins</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
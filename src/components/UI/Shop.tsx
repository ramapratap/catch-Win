import React, { useState } from 'react';
import { ShoppingBag, Coins, Check, Lock } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from '../Common/Button';
import { storage } from '../../utils/storage';
import { ShopItem } from '../../types/game';

interface ShopProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Shop({ isOpen, onClose }: ShopProps) {
  const [items, setItems] = useState<ShopItem[]>(storage.getShopItems());
  const [totalCoins, setTotalCoins] = useState(storage.getTotalCoins());

  const handlePurchase = (item: ShopItem) => {
    if (totalCoins >= item.price && !item.purchased) {
      if (storage.spendCoins(item.price)) {
        storage.updateShopItem(item.id, true);
        setItems(storage.getShopItems());
        setTotalCoins(storage.getTotalCoins());
      }
    }
  };

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'background': return '🎨';
      case 'mouth': return '👄';
      case 'cookie': return '🍪';
      default: return '✨';
    }
  };

  const getItemDescription = (item: ShopItem) => {
    switch (item.id) {
      case 'bg_space': return 'Transform your game into a cosmic adventure';
      case 'bg_ocean': return 'Dive into an underwater cookie-catching experience';
      case 'mouth_rainbow': return 'Add colorful effects to your mouth tracking';
      case 'cookie_sparkle': return 'Make cookies sparkle with magical effects';
      default: return 'Enhance your game experience';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Shop" size="lg">
      <div className="space-y-6">
        <div className="text-center">
          <ShoppingBag className="w-12 h-12 text-purple-500 mx-auto mb-2" />
          <h3 className="text-xl font-bold text-gray-900">Cosmetic Upgrades</h3>
          <div className="flex items-center justify-center space-x-2 mt-2">
            <Coins className="w-5 h-5 text-yellow-500" />
            <span className="text-lg font-semibold text-gray-700">{totalCoins} coins</span>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-600 mb-2">No items available</h4>
            <p className="text-gray-500">Check back later for new items!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {items.map((item) => (
              <div
                key={item.id}
                className={`p-6 rounded-lg border-2 transition-all ${
                  item.purchased
                    ? 'border-green-400 bg-green-50'
                    : 'border-gray-200 bg-white hover:border-purple-300'
                }`}
              >
                <div className="text-center mb-4">
                  <div className="text-4xl mb-2">{getItemIcon(item.type)}</div>
                  <h4 className="text-lg font-semibold text-gray-900">{item.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {getItemDescription(item)}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Coins className="w-4 h-4 text-yellow-500" />
                    <span className="font-semibold text-gray-700">{item.price}</span>
                  </div>

                  {item.purchased ? (
                    <div className="flex items-center space-x-2 text-green-600">
                      <Check className="w-4 h-4" />
                      <span className="text-sm font-semibold">Owned</span>
                    </div>
                  ) : totalCoins >= item.price ? (
                    <Button
                      onClick={() => handlePurchase(item)}
                      variant="primary"
                      size="sm"
                    >
                      Purchase
                    </Button>
                  ) : (
                    <div className="flex items-center space-x-2 text-gray-400">
                      <Lock className="w-4 h-4" />
                      <span className="text-sm">Not enough coins</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="text-2xl">💡</div>
            <div>
              <h5 className="font-semibold text-blue-900 mb-1">How to earn coins</h5>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Catch normal cookies: 5 coins each</li>
                <li>• Catch golden cookies: 25 coins each</li>
                <li>• Complete games to keep your coins</li>
                <li>• Avoid rotten cookies (they subtract coins!)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
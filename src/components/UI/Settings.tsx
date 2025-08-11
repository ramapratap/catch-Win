import React, { useState, useEffect } from 'react';
import { Camera, Volume2, VolumeX, Eye, Sliders } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from '../Common/Button';
import { GameSettings } from '../../types/game';
import { storage } from '../../utils/storage';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
  currentMouthOpenness?: number;
}

export function Settings({ isOpen, onClose, currentMouthOpenness = 0 }: SettingsProps) {
  const [settings, setSettings] = useState<GameSettings>(storage.getSettings());
  
  useEffect(() => {
    if (isOpen) {
      setSettings(storage.getSettings());
    }
  }, [isOpen]);

  const handleSave = () => {
    storage.saveSettings(settings);
    onClose();
  };

  const handleReset = () => {
    const defaultSettings = storage.getSettings();
    setSettings(defaultSettings);
    storage.saveSettings(defaultSettings);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Settings" size="md">
      <div className="space-y-6">
        {/* Camera Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center space-x-2">
            <Camera className="w-5 h-5" />
            <span>Camera & Face Tracking</span>
          </h3>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Enable Camera</span>
            <button
              onClick={() => setSettings(prev => ({ ...prev, cameraEnabled: !prev.cameraEnabled }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.cameraEnabled ? 'bg-purple-600' : 'bg-gray-300'
              }`}
            >
              <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                settings.cameraEnabled ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          {settings.cameraEnabled && (
            <div className="space-y-4 pl-4 border-l-2 border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mouth Open Threshold
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min="0.01"
                    max="0.1"
                    step="0.005"
                    value={settings.mouthOpenThreshold}
                    onChange={(e) => setSettings(prev => ({ 
                      ...prev, 
                      mouthOpenThreshold: parseFloat(e.target.value) 
                    }))}
                    className="flex-1"
                  />
                  <span className="text-sm text-gray-600 min-w-12">
                    {settings.mouthOpenThreshold.toFixed(3)}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Lower values = easier to trigger, Higher values = need wider mouth opening
                </p>
              </div>

              {/* Live Mouth Openness Meter */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Current Mouth Openness</span>
                  <span className="text-sm text-gray-600">
                    {currentMouthOpenness.toFixed(3)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all ${
                      currentMouthOpenness >= settings.mouthOpenThreshold 
                        ? 'bg-green-500' 
                        : 'bg-purple-500'
                    }`}
                    style={{ width: `${Math.min(currentMouthOpenness / 0.1 * 100, 100)}%` }}
                  />
                </div>
                <div className="text-xs text-center mt-1">
                  {currentMouthOpenness >= settings.mouthOpenThreshold 
                    ? '✅ Mouth detected as open' 
                    : '❌ Mouth not open enough'
                  }
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Audio Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center space-x-2">
            {settings.audioEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            <span>Audio</span>
          </h3>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Enable Sound Effects</span>
            <button
              onClick={() => setSettings(prev => ({ ...prev, audioEnabled: !prev.audioEnabled }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.audioEnabled ? 'bg-purple-600' : 'bg-gray-300'
              }`}
            >
              <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                settings.audioEnabled ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>

        {/* Performance Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center space-x-2">
            <Sliders className="w-5 h-5" />
            <span>Performance</span>
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Canvas Resolution
            </label>
            <select
              value={settings.canvasResolution}
              onChange={(e) => setSettings(prev => ({ 
                ...prev, 
                canvasResolution: parseFloat(e.target.value) 
              }))}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value={0.5}>Low (50%)</option>
              <option value={0.75}>Medium (75%)</option>
              <option value={1}>High (100%)</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Lower resolution improves performance on slower devices
            </p>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Debug Mode</span>
            <button
              onClick={() => setSettings(prev => ({ ...prev, debugMode: !prev.debugMode }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.debugMode ? 'bg-purple-600' : 'bg-gray-300'
              }`}
            >
              <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                settings.debugMode ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4 border-t border-gray-200">
          <Button onClick={handleSave} variant="primary" className="flex-1">
            Save Settings
          </Button>
          <Button onClick={handleReset} variant="secondary">
            Reset to Default
          </Button>
        </div>
      </div>
    </Modal>
  );
}
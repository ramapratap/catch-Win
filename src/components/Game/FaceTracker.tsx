import React, { useEffect } from 'react';
import { useFaceTracking } from '../../hooks/useFaceTracking';
import { storage } from '../../utils/storage';

interface FaceTrackerProps {
  onMouthUpdate: (position: { x: number; y: number }, openness: number) => void;
  canvasWidth: number;
  canvasHeight: number;
  children?: React.ReactNode;
}

export function FaceTracker({ onMouthUpdate, canvasWidth, canvasHeight, children }: FaceTrackerProps) {
  const settings = storage.getSettings();
  
  const {
    isInitialized,
    error,
    mouthPosition,
    mouthOpenness,
    faceDetected,
    videoRef
  } = useFaceTracking(settings.cameraEnabled, canvasWidth, canvasHeight);

  useEffect(() => {
    onMouthUpdate(mouthPosition, mouthOpenness);
  }, [mouthPosition, mouthOpenness, onMouthUpdate]);

  if (!settings.cameraEnabled) {
    return (
      <div className="relative">
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
          <div className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg">
            <p className="text-sm font-semibold">🎮 Touch Controls Active</p>
            <p className="text-xs">Click on canvas to catch cookies</p>
          </div>
        </div>
        {children}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong className="font-bold">Camera Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
        <div className="bg-blue-50 border border-blue-400 text-blue-700 px-4 py-3 rounded">
          <p className="font-semibold">Fallback Mode Active</p>
          <p className="text-sm">The game will use touch controls instead. Click on the canvas to catch cookies.</p>
        </div>
        {children}
      </div>
    );
  }

  if (!isInitialized) {
    return (
      <div className="text-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Initializing face tracking...</p>
        <p className="text-sm text-gray-500 mt-2">Make sure to allow camera access</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Video preview - small corner display */}
      {videoRef && (
        <div className="absolute top-4 right-4 z-20">
          <div className="relative bg-black rounded-lg overflow-hidden shadow-lg">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-32 h-24 object-cover transform scale-x-[-1]"
              style={{ 
                display: 'block',
                backgroundColor: '#000'
              }}
            />
            <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 text-center">
              Camera Feed
            </div>
          </div>
        </div>
      )}

      {/* Face detection status */}
      {!faceDetected && settings.cameraEnabled && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
          <div className="bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg animate-pulse">
            <p className="text-sm font-semibold">👀 Position your face in view</p>
            <p className="text-xs">Make sure you're well-lit and centered</p>
          </div>
        </div>
      )}
      
      {faceDetected && settings.cameraEnabled && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
          <div className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg">
            <p className="text-sm font-semibold">✅ Face detected - Open mouth to catch cookies!</p>
            <p className="text-xs">Mouth openness: {(mouthOpenness * 100).toFixed(1)}%</p>
          </div>
        </div>
      )}
      
      {children}
    </div>
  );
}
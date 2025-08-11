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
    faceDetected
  } = useFaceTracking(settings.cameraEnabled, canvasWidth, canvasHeight);

  useEffect(() => {
    onMouthUpdate(mouthPosition, mouthOpenness);
  }, [mouthPosition, mouthOpenness, onMouthUpdate]);

  if (!settings.cameraEnabled) {
    return <>{children}</>;
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong className="font-bold">Camera Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
        <p className="text-gray-600">
          The game will use touch controls instead. You can still play by dragging the mouth indicator.
        </p>
        {children}
      </div>
    );
  }

  if (!isInitialized) {
    return (
      <div className="text-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Initializing face tracking...</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {!faceDetected && settings.cameraEnabled && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
          <div className="bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg">
            <p className="text-sm font-semibold">👀 Position your face in view</p>
          </div>
        </div>
      )}
      {children}
    </div>
  );
}
import { useEffect, useRef, useState, useCallback } from 'react';
import { FaceMesh } from '@mediapipe/face_mesh';
import { Camera } from '@mediapipe/camera_utils';
import { FaceLandmarks } from '../types/game';
import { FACE_MESH_CONFIG, MOUTH_LANDMARKS, FOREHEAD_TO_CHIN } from '../utils/constants';
import { calculateMouthOpenness, mapVideoToCanvas, calculateFaceHeight } from '../utils/collisionDetection';

export function useFaceTracking(enabled: boolean, canvasWidth: number, canvasHeight: number) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const faceMeshRef = useRef<FaceMesh | null>(null);
  const cameraRef = useRef<Camera | null>(null);
  
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mouthPosition, setMouthPosition] = useState({ x: canvasWidth / 2, y: canvasHeight / 2 });
  const [mouthOpenness, setMouthOpenness] = useState(0);
  const [faceDetected, setFaceDetected] = useState(false);

  const onResults = useCallback((results: any) => {
    if (results.multiFaceLandmarks && results.multiFaceLandmarks[0]) {
      const landmarks: FaceLandmarks[] = results.multiFaceLandmarks[0];
      setFaceDetected(true);

      // Get mouth landmark points
      const upperLipPoints = MOUTH_LANDMARKS.upper.map(idx => landmarks[idx]);
      const lowerLipPoints = MOUTH_LANDMARKS.lower.map(idx => landmarks[idx]);
      
      // Calculate face height for normalization
      const foreheadPoint = landmarks[FOREHEAD_TO_CHIN[0]];
      const chinPoint = landmarks[FOREHEAD_TO_CHIN[1]];
      const faceHeight = calculateFaceHeight(foreheadPoint, chinPoint);
      
      // Calculate mouth openness
      const openness = calculateMouthOpenness(upperLipPoints, lowerLipPoints, faceHeight);
      setMouthOpenness(openness);

      // Calculate mouth center position
      const allMouthPoints = [...upperLipPoints, ...lowerLipPoints];
      const mouthCenterX = allMouthPoints.reduce((sum, point) => sum + point.x, 0) / allMouthPoints.length;
      const mouthCenterY = allMouthPoints.reduce((sum, point) => sum + point.y, 0) / allMouthPoints.length;

      // Map to canvas coordinates (assuming video is 640x480)
      const canvasPosition = mapVideoToCanvas(
        mouthCenterX * 640,
        mouthCenterY * 480,
        640,
        480,
        canvasWidth,
        canvasHeight
      );
      
      setMouthPosition(canvasPosition);
    } else {
      setFaceDetected(false);
    }
  }, [canvasWidth, canvasHeight]);

  useEffect(() => {
    if (!enabled) {
      cleanup();
      return;
    }

    const initializeFaceTracking = async () => {
      try {
        setError(null);

        // Create video element
        const video = document.createElement('video');
        video.style.display = 'none';
        document.body.appendChild(video);
        videoRef.current = video;

        // Initialize FaceMesh
        const faceMesh = new FaceMesh({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
        });

        faceMesh.setOptions(FACE_MESH_CONFIG);
        faceMesh.onResults(onResults);
        faceMeshRef.current = faceMesh;

        // Initialize Camera
        const camera = new Camera(video, {
          onFrame: async () => {
            if (video.readyState >= 2) {
              await faceMesh.send({ image: video });
            }
          },
          width: 640,
          height: 480
        });

        await camera.start();
        cameraRef.current = camera;
        setIsInitialized(true);

      } catch (error) {
        console.error('Failed to initialize face tracking:', error);
        setError('Failed to access camera or initialize face tracking. Please ensure camera permissions are granted.');
      }
    };

    initializeFaceTracking();

    return cleanup;
  }, [enabled, onResults]);

  const cleanup = useCallback(() => {
    if (cameraRef.current) {
      cameraRef.current.stop();
      cameraRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
      if (videoRef.current.parentNode) {
        videoRef.current.parentNode.removeChild(videoRef.current);
      }
      videoRef.current = null;
    }

    faceMeshRef.current = null;
    setIsInitialized(false);
    setFaceDetected(false);
  }, []);

  return {
    isInitialized,
    error,
    mouthPosition,
    mouthOpenness,
    faceDetected,
    cleanup
  };
}
import { useEffect, useRef, useState, useCallback } from 'react';

export function useFaceTracking(enabled: boolean, canvasWidth: number, canvasHeight: number) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const faceMeshRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processingRef = useRef<boolean>(false);
  
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mouthPosition, setMouthPosition] = useState({ x: canvasWidth / 2, y: canvasHeight / 2 });
  const [mouthOpenness, setMouthOpenness] = useState(0);
  const [faceDetected, setFaceDetected] = useState(false);

  // Mouth landmark indices for MediaPipe FaceMesh
  const MOUTH_LANDMARKS = {
    upper: [13, 14, 15, 16, 17, 18, 200],
    lower: [178, 179, 180, 181, 182, 183, 184]
  };

  const calculateMouthOpenness = useCallback((landmarks: any[]) => {
    if (!landmarks || landmarks.length === 0) return 0;

    try {
      // Get mouth landmark points
      const upperLipPoints = MOUTH_LANDMARKS.upper.map(idx => landmarks[idx]).filter(p => p);
      const lowerLipPoints = MOUTH_LANDMARKS.lower.map(idx => landmarks[idx]).filter(p => p);
      
      if (upperLipPoints.length === 0 || lowerLipPoints.length === 0) return 0;

      // Calculate average Y positions
      const upperAvg = upperLipPoints.reduce((sum, point) => sum + point.y, 0) / upperLipPoints.length;
      const lowerAvg = lowerLipPoints.reduce((sum, point) => sum + point.y, 0) / lowerLipPoints.length;
      
      // Calculate face height for normalization
      const foreheadPoint = landmarks[10]; // Forehead
      const chinPoint = landmarks[152]; // Chin
      
      if (!foreheadPoint || !chinPoint) return 0;
      
      const faceHeight = Math.abs(chinPoint.y - foreheadPoint.y);
      if (faceHeight === 0) return 0;
      
      // Return normalized mouth openness
      return Math.max(0, (lowerAvg - upperAvg) / faceHeight);
    } catch (error) {
      console.error('Error calculating mouth openness:', error);
      return 0;
    }
  }, []);

  const onResults = useCallback((results: any) => {
    if (results.multiFaceLandmarks && results.multiFaceLandmarks[0]) {
      const landmarks = results.multiFaceLandmarks[0];
      setFaceDetected(true);

      // Calculate mouth openness
      const openness = calculateMouthOpenness(landmarks);
      setMouthOpenness(openness);

      // Calculate mouth center position
      const upperLipPoints = MOUTH_LANDMARKS.upper.map(idx => landmarks[idx]).filter(p => p);
      const lowerLipPoints = MOUTH_LANDMARKS.lower.map(idx => landmarks[idx]).filter(p => p);
      const allMouthPoints = [...upperLipPoints, ...lowerLipPoints];
      
      if (allMouthPoints.length > 0) {
        const mouthCenterX = allMouthPoints.reduce((sum, point) => sum + point.x, 0) / allMouthPoints.length;
        const mouthCenterY = allMouthPoints.reduce((sum, point) => sum + point.y, 0) / allMouthPoints.length;

        // Map to canvas coordinates (flip X for mirror effect)
        const canvasX = canvasWidth - (mouthCenterX * canvasWidth);
        const canvasY = mouthCenterY * canvasHeight;
        
        setMouthPosition({ x: canvasX, y: canvasY });
      }
    } else {
      setFaceDetected(false);
    }
  }, [canvasWidth, canvasHeight, calculateMouthOpenness]);

  const cleanup = useCallback(() => {
    processingRef.current = false;
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
      if (videoRef.current.parentNode) {
        videoRef.current.parentNode.removeChild(videoRef.current);
      }
    }

    if (faceMeshRef.current) {
      try {
        faceMeshRef.current.close();
      } catch (e) {
        // Ignore cleanup errors
      }
      faceMeshRef.current = null;
    }

    setIsInitialized(false);
    setFaceDetected(false);
    setError(null);
  }, []);

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
        video.width = 640;
        video.height = 480;
        video.autoplay = true;
        video.muted = true;
        video.playsInline = true;
        videoRef.current = video;

        // Get camera stream
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: 'user'
          }
        });
        
        streamRef.current = stream;
        video.srcObject = stream;
        
        // Wait for video to be ready
        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error('Video timeout')), 10000);
          
          video.onloadedmetadata = () => {
            clearTimeout(timeout);
            video.play().then(resolve).catch(reject);
          };
        });

        // Initialize FaceMesh
        const { FaceMesh } = await import('@mediapipe/face_mesh');
        
        const faceMesh = new FaceMesh({
          locateFile: (file: string) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
          }
        });

        await faceMesh.setOptions({
          maxNumFaces: 1,
          refineLandmarks: true,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5
        });

        faceMesh.onResults(onResults);
        faceMeshRef.current = faceMesh;

        // Start processing frames
        processingRef.current = true;
        const processFrame = async () => {
          if (!processingRef.current || !video || !faceMeshRef.current) return;
          
          if (video.readyState >= 2) {
            try {
              await faceMeshRef.current.send({ image: video });
            } catch (error) {
              console.error('Error processing frame:', error);
            }
          }
          
          if (processingRef.current) {
            requestAnimationFrame(processFrame);
          }
        };

        setIsInitialized(true);
        processFrame();

      } catch (error) {
        console.error('Failed to initialize face tracking:', error);
        setError('Failed to access camera or initialize face tracking. Please ensure camera permissions are granted and you are using HTTPS.');
        cleanup();
      }
    };

    initializeFaceTracking();

    return cleanup;
  }, [enabled, onResults, cleanup]);

  return {
    isInitialized,
    error,
    mouthPosition,
    mouthOpenness,
    faceDetected,
    cleanup,
    videoRef: videoRef.current
  };
}
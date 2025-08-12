import { useEffect, useRef, useState, useCallback } from 'react';

export const useFaceTracking = (enabled: boolean, canvasWidth: number, canvasHeight: number) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const faceMeshRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processingRef = useRef<boolean>(false);
  
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mouthPosition, setMouthPosition] = useState({ x: canvasWidth / 2, y: canvasHeight / 2 });
  const [mouthOpenness, setMouthOpenness] = useState(0);
  const [faceDetected, setFaceDetected] = useState(false);

  const cleanup = useCallback(() => {
    processingRef.current = false;
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
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

  const onResults = useCallback((results: any) => {
    if (results.multiFaceLandmarks && results.multiFaceLandmarks[0]) {
      const landmarks = results.multiFaceLandmarks[0];
      setFaceDetected(true);

      // Calculate mouth openness using key landmarks
      const upperLip = landmarks[13]; // Upper lip center
      const lowerLip = landmarks[14]; // Lower lip center
      const faceTop = landmarks[10]; // Forehead
      const faceBottom = landmarks[152]; // Chin
      
      if (upperLip && lowerLip && faceTop && faceBottom) {
        const mouthHeight = Math.abs(lowerLip.y - upperLip.y);
        const faceHeight = Math.abs(faceBottom.y - faceTop.y);
        const openness = faceHeight > 0 ? mouthHeight / faceHeight : 0;
        setMouthOpenness(openness);

        // Calculate mouth center position
        const mouthCenterX = (upperLip.x + lowerLip.x) / 2;
        const mouthCenterY = (upperLip.y + lowerLip.y) / 2;

        // Map to canvas coordinates (flip X for mirror effect)
        const canvasX = canvasWidth - (mouthCenterX * canvasWidth);
        const canvasY = mouthCenterY * canvasHeight;
        
        setMouthPosition({ x: canvasX, y: canvasY });
      }
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

        // Get camera stream
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user'
          }
        });
        
        streamRef.current = stream;
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await new Promise<void>((resolve) => {
            videoRef.current!.onloadedmetadata = () => {
              videoRef.current!.play().then(resolve);
            };
          });
        }

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
          if (!processingRef.current || !videoRef.current || !faceMeshRef.current) return;
          
          if (videoRef.current.readyState >= 2) {
            try {
              await faceMeshRef.current.send({ image: videoRef.current });
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
        setError('Failed to access camera. Please ensure camera permissions are granted.');
        cleanup();
      }
    };

    initializeFaceTracking();
    return cleanup;
  }, [enabled, onResults, cleanup]);

  return {
    videoRef,
    canvasRef,
    isInitialized,
    error,
    mouthPosition,
    mouthOpenness,
    faceDetected,
    cleanup
  };
};
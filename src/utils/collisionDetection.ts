import { Cookie } from '../types/game';

export function checkCollision(
  mouthX: number,
  mouthY: number,
  mouthRadius: number,
  cookie: Cookie
): boolean {
  const distance = Math.sqrt(
    Math.pow(mouthX - cookie.x, 2) + Math.pow(mouthY - cookie.y, 2)
  );
  
  return distance <= (mouthRadius + cookie.radius);
}

export function calculateMouthOpenness(
  upperLipPoints: { x: number; y: number }[],
  lowerLipPoints: { x: number; y: number }[],
  faceHeight: number
): number {
  if (!upperLipPoints.length || !lowerLipPoints.length || faceHeight === 0) {
    return 0;
  }

  // Calculate average Y positions
  const upperAvg = upperLipPoints.reduce((sum, point) => sum + point.y, 0) / upperLipPoints.length;
  const lowerAvg = lowerLipPoints.reduce((sum, point) => sum + point.y, 0) / lowerLipPoints.length;
  
  // Return normalized mouth openness
  return Math.max(0, (lowerAvg - upperAvg) / faceHeight);
}

export function mapVideoToCanvas(
  videoX: number,
  videoY: number,
  videoWidth: number,
  videoHeight: number,
  canvasWidth: number,
  canvasHeight: number
): { x: number; y: number } {
  // Flip X coordinate for mirror effect
  const x = canvasWidth - (videoX / videoWidth) * canvasWidth;
  const y = (videoY / videoHeight) * canvasHeight;
  
  return { x, y };
}

export function calculateFaceHeight(
  foreheadPoint: { x: number; y: number },
  chinPoint: { x: number; y: number }
): number {
  return Math.sqrt(
    Math.pow(foreheadPoint.x - chinPoint.x, 2) + 
    Math.pow(foreheadPoint.y - chinPoint.y, 2)
  );
}
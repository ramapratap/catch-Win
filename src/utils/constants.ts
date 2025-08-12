// export const LEVEL_CONFIGS = [
//   {
//     spawnRate: 1200,
//     minSpeed: 1,
//     maxSpeed: 2,
//     catchesRequired: 10,
//     name: 'Easy'
//   },
//   {
//     spawnRate: 800,
//     minSpeed: 2,
//     maxSpeed: 3,
//     catchesRequired: 25,
//     name: 'Medium'
//   },
//   {
//     spawnRate: 500,
//     minSpeed: 3,
//     maxSpeed: 5,
//     catchesRequired: 50,
//     name: 'Hard'
//   }
// ];

// export const COOKIE_TYPES = {
//   normal: { points: 5, color: '#D97706', probability: 0.7 },
//   golden: { points: 25, color: '#F59E0B', probability: 0.2 },
//   rotten: { points: -10, color: '#6B7280', probability: 0.1 }
// };

export const DEFAULT_SETTINGS = {
  mouthOpenThreshold: 0.03,
  audioEnabled: true,
  cameraEnabled: true,
  debugMode: false,
  canvasResolution: 1
};

// Simplified MediaPipe configuration
export const FACE_MESH_CONFIG = {
  maxNumFaces: 1,
  refineLandmarks: true,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
};

// MediaPipe face mesh landmark indices for mouth detection
export const MOUTH_LANDMARKS = {
  upper: [13, 14, 15, 16, 17, 18, 200],
  lower: [178, 179, 180, 181, 182, 183, 184]
};

export const FOREHEAD_TO_CHIN = [10, 152]; // Landmark indices for face height

export const COOKIE_TYPES = {
  normal: { points: 5, color: '#D97706', probability: 0.7 },
  golden: { points: 25, color: '#F59E0B', probability: 0.2 },
  rotten: { points: -10, color: '#6B7280', probability: 0.1 }
};

export const LEVEL_CONFIGS = [
  { spawnRate: 2000, minSpeed: 1, maxSpeed: 2, catchesRequired: 10, name: 'Easy' },
  { spawnRate: 1500, minSpeed: 2, maxSpeed: 3, catchesRequired: 25, name: 'Medium' },
  { spawnRate: 1000, minSpeed: 3, maxSpeed: 5, catchesRequired: 50, name: 'Hard' }
];
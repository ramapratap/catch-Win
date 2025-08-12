// export interface Cookie {
//   id: string;
//   x: number;
//   y: number;
//   speed: number;
//   radius: number;
//   type: 'normal' | 'golden' | 'rotten';
// }

// export interface GameState {
//   isPlaying: boolean;
//   isPaused: boolean;
//   level: number;
//   score: number;
//   coins: number;
//   catches: number;
//   cookies: Cookie[];
//   mouthPosition: { x: number; y: number };
//   mouthOpen: number;
//   gameStartTime: number;
// }

export interface LevelConfig {
  spawnRate: number;
  minSpeed: number;
  maxSpeed: number;
  catchesRequired: number;
  name: string;
}

// export interface GameSettings {
//   mouthOpenThreshold: number;
//   audioEnabled: boolean;
//   cameraEnabled: boolean;
//   debugMode: boolean;
//   canvasResolution: number;
// }

export interface LeaderboardEntry {
  id: string;
  date: string;
  score: number;
  coins: number;
  level: number;
  catches: number;
}

export interface ShopItem {
  id: string;
  name: string;
  price: number;
  type: 'background' | 'mouth' | 'cookie';
  purchased: boolean;
}

export interface FaceLandmarks {
  x: number;
  y: number;
  z?: number;
}

export interface Cookie {
  id: string;
  x: number;
  y: number;
  speed: number;
  radius: number;
  type: 'normal' | 'golden' | 'rotten';
}

export interface GameState {
  isPlaying: boolean;
  isPaused: boolean;
  level: number;
  score: number;
  coins: number;
  catches: number;
  cookies: Cookie[];
  mouthPosition: { x: number; y: number };
  mouthOpen: boolean;
  gameStartTime: number;
}

export interface GameSettings {
  canvasResolution: any;
  mouthOpenThreshold: number;
  audioEnabled: boolean;
  cameraEnabled: boolean;
  debugMode: boolean;
}

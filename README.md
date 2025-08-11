# 🍪 Mouth-Catch Arcade

A browser-based arcade game that uses real-time face tracking to catch falling cookies by opening your mouth! Built with React, MediaPipe, and advanced web technologies.

## 🎮 How to Play

1. **Allow camera access** when prompted (required for face tracking)
2. **Position your face** in view of the camera
3. **Open your mouth** when cookies fall near your mouth position
4. **Catch cookies** to earn coins and progress through levels
5. **Spend coins** in the shop for cosmetic upgrades

### Cookie Types
- **🍪 Normal Cookie**: 5 coins each
- **🌟 Golden Cookie**: 25 coins bonus  
- **🤢 Rotten Cookie**: -10 coins penalty

### Difficulty Levels
- **Easy**: Slow spawn rate (1200ms), gentle speeds
- **Medium**: Medium spawn rate (800ms), moderate challenge
- **Hard**: Fast spawn rate (500ms), high-speed cookies

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- Modern web browser with webcam support
- HTTPS connection (required for camera access)

### Installation

1. **Clone and install dependencies**:
```bash
git clone <repository-url>
cd mouth-catch-arcade
npm install
```

2. **Start development server**:
```bash
npm run dev
```

3. **Open your browser** to `http://localhost:5173`

### Production Build

```bash
npm run build
npm run preview
```

## 🔧 Technical Implementation

### Face Tracking & Mouth Detection

The game uses MediaPipe FaceMesh for real-time facial landmark detection:

```javascript
// Mouth openness calculation
mouthOpen = (avg(lower_lip_points_y) - avg(upper_lip_points_y)) / faceHeight

// Default threshold
MOUTH_OPEN_THRESHOLD = 0.03 (configurable in settings)
```

**Key Features**:
- Real-time face mesh detection at 30+ FPS
- Normalized mouth measurements using face height
- Configurable sensitivity threshold
- Mirror-effect coordinate mapping

### Collision Detection System

```javascript
// Cookie collision check
function checkCollision(mouthX, mouthY, mouthRadius, cookie) {
  const distance = Math.sqrt(
    Math.pow(mouthX - cookie.x, 2) + Math.pow(mouthY - cookie.y, 2)
  );
  return distance <= (mouthRadius + cookie.radius);
}
```

### Game Architecture

- **React Hooks**: Custom hooks for game state and face tracking
- **Canvas Rendering**: HTML5 Canvas for 60fps game rendering  
- **Local Storage**: Complete offline data persistence
- **Modular Design**: Clean separation of concerns across components

## ⚙️ Settings & Calibration

### Mouth Sensitivity Calibration

1. Open **Settings** from the main menu
2. Use the **live mouth openness meter** to test detection
3. Adjust the **Mouth Open Threshold** slider:
   - Lower values = easier to trigger
   - Higher values = need wider mouth opening
4. Test with the real-time feedback indicator

### Performance Options

- **Canvas Resolution**: Adjust rendering quality (50%, 75%, 100%)
- **Debug Mode**: Show technical information overlay
- **Audio**: Enable/disable sound effects

### Accessibility Features

- **Touch Controls**: Automatic fallback when camera is disabled
- **Drag to Move**: Touch-friendly mouth positioning
- **Click to Catch**: Tap screen to simulate mouth opening
- **Visual Feedback**: Clear indicators for all interactions

## 🏗️ Project Structure

```
src/
├── components/
│   ├── Game/           # Core game components
│   │   ├── GameCanvas.tsx
│   │   ├── GameHUD.tsx
│   │   └── FaceTracker.tsx
│   ├── UI/             # User interface
│   │   ├── HomeScreen.tsx
│   │   ├── Settings.tsx
│   │   ├── Leaderboard.tsx
│   │   └── Shop.tsx
│   └── Common/         # Shared components
│       ├── Button.tsx
│       └── Header.tsx
├── hooks/              # Custom React hooks
│   ├── useGameState.ts
│   ├── useFaceTracking.ts
│   └── useLocalStorage.ts
├── utils/              # Game logic & utilities
│   ├── gameLogic.ts
│   ├── collisionDetection.ts
│   ├── storage.ts
│   └── constants.ts
└── types/              # TypeScript definitions
    └── game.ts
```

## 🧪 Testing

### Unit Tests
```bash
npm test
```

### Manual Testing Checklist
- [ ] Camera permission handling
- [ ] Face tracking accuracy
- [ ] Collision detection precision
- [ ] Level progression
- [ ] Local storage persistence
- [ ] Touch controls fallback
- [ ] Settings calibration
- [ ] Performance on mobile devices

## 🚀 Deployment

### Static Hosting (Recommended)

The game can be deployed to any static hosting service:

1. **Netlify**:
```bash
npm run build
# Upload dist/ folder to Netlify
```

2. **Vercel**:
```bash
npm run build
vercel --prod
```

3. **GitHub Pages**:
```bash
npm run build
# Deploy dist/ folder to gh-pages branch
```

### HTTPS Requirement

**Important**: The game requires HTTPS to access the camera. All modern hosting services provide HTTPS automatically.

### Browser Compatibility

- ✅ Chrome 88+
- ✅ Firefox 85+
- ✅ Safari 14+
- ✅ Edge 88+

## 🔒 Privacy & Security

- **No data transmission**: All face tracking happens locally
- **No facial data storage**: Landmarks are processed in real-time only
- **Local storage only**: Game data never leaves your device
- **Camera permissions**: Always request user consent

## 🐛 Troubleshooting

### Camera Issues
```
Problem: "Failed to access camera"
Solution: 
1. Grant camera permissions in browser
2. Ensure HTTPS connection
3. Check if other apps are using camera
4. Try different browser
```

### Performance Issues
```
Problem: Low FPS or laggy tracking
Solution:
1. Lower canvas resolution in settings
2. Close other browser tabs
3. Disable debug mode
4. Use modern browser version
```

### Face Tracking Issues
```
Problem: Mouth not detected properly
Solution:
1. Ensure good lighting
2. Position face centered in camera view
3. Calibrate mouth threshold in settings
4. Avoid shadows on face
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit pull request

### Development Guidelines

- Follow TypeScript best practices
- Maintain 60fps performance target
- Test on multiple browsers/devices
- Update documentation for new features
- Ensure accessibility compliance

## 📄 License

MIT License - see LICENSE file for details.

## 🙏 Acknowledgments

- **MediaPipe**: Google's machine learning framework for face detection
- **React**: Facebook's UI library
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Beautiful icon library

---

**Built with ❤️ for the browser gaming community**
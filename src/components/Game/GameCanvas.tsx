import React, { useRef, useEffect } from 'react';
import { GameState } from '../../types/game';
import { COOKIE_TYPES } from '../../utils/constants';
import { storage } from '../../utils/storage';

interface GameCanvasProps {
  gameState: GameState;
  width: number;
  height: number;
}

export function GameCanvas({ gameState, width, height }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const settings = storage.getSettings();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw background
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#1e1b4b');
    gradient.addColorStop(1, '#312e81');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Draw cookies
    gameState.cookies.forEach(cookie => {
      drawCookie(ctx, cookie);
    });

    // Draw mouth indicator
    drawMouthIndicator(ctx, gameState);

    // Draw debug info if enabled
    if (settings.debugMode) {
      drawDebugInfo(ctx, gameState);
    }

  }, [gameState, width, height, settings.debugMode]);

  const drawCookie = (ctx: CanvasRenderingContext2D, cookie: any) => {
    const { x, y, radius, type } = cookie;
    const color = COOKIE_TYPES[type as keyof typeof COOKIE_TYPES].color;

    // Cookie shadow
    ctx.save();
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(x + 2, y + 2, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Cookie body
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    // Cookie texture
    ctx.fillStyle = type === 'golden' ? '#FCD34D' : type === 'rotten' ? '#4B5563' : '#92400E';
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const dotX = x + Math.cos(angle) * (radius * 0.6);
      const dotY = y + Math.sin(angle) * (radius * 0.6);
      ctx.beginPath();
      ctx.arc(dotX, dotY, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Special effects
    if (type === 'golden') {
      drawSparkleEffect(ctx, x, y, radius);
    }
  };

  const drawSparkleEffect = (ctx: CanvasRenderingContext2D, x: number, y: number, radius: number) => {
    ctx.save();
    ctx.globalAlpha = 0.8;
    ctx.fillStyle = '#FEF3C7';
    
    for (let i = 0; i < 4; i++) {
      const angle = (Date.now() / 500 + i) % (Math.PI * 2);
      const sparkleX = x + Math.cos(angle) * (radius + 10);
      const sparkleY = y + Math.sin(angle) * (radius + 10);
      
      ctx.beginPath();
      ctx.arc(sparkleX, sparkleY, 1, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.restore();
  };

  const drawMouthIndicator = (ctx: CanvasRenderingContext2D, gameState: GameState) => {
    const { mouthPosition, mouthOpen } = gameState;
    const isOpen = mouthOpen >= settings.mouthOpenThreshold;
    
    // Mouth indicator circle
    ctx.save();
    ctx.globalAlpha = 0.7;
    ctx.strokeStyle = isOpen ? '#10B981' : '#EF4444';
    ctx.lineWidth = 3;
    ctx.setLineDash(isOpen ? [] : [5, 5]);
    
    const radius = 25 + (isOpen ? Math.sin(Date.now() / 200) * 3 : 0);
    ctx.beginPath();
    ctx.arc(mouthPosition.x, mouthPosition.y, radius, 0, Math.PI * 2);
    ctx.stroke();
    
    // Inner fill
    ctx.globalAlpha = 0.2;
    ctx.fillStyle = isOpen ? '#10B981' : '#EF4444';
    ctx.fill();
    
    ctx.restore();

    // Mouth openness text
    if (settings.debugMode) {
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(
        `${(mouthOpen * 100).toFixed(1)}%`,
        mouthPosition.x,
        mouthPosition.y - 35
      );
    }
  };

  const drawDebugInfo = (ctx: CanvasRenderingContext2D, gameState: GameState) => {
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '12px monospace';
    ctx.textAlign = 'left';
    
    const debugInfo = [
      `FPS: ${Math.round(1000/16.67)}`,
      `Cookies: ${gameState.cookies.length}`,
      `Mouth Open: ${(gameState.mouthOpen * 100).toFixed(1)}%`,
      `Threshold: ${(settings.mouthOpenThreshold * 100).toFixed(1)}%`,
      `Position: (${Math.round(gameState.mouthPosition.x)}, ${Math.round(gameState.mouthPosition.y)})`
    ];
    
    debugInfo.forEach((info, index) => {
      ctx.fillText(info, 10, 20 + index * 15);
    });
  };

  return (
    <canvas
      ref={canvasRef}
      width={width * settings.canvasResolution}
      height={height * settings.canvasResolution}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        display: 'block',
        imageRendering: settings.canvasResolution < 1 ? 'pixelated' : 'auto'
      }}
      className="border border-gray-300 rounded-lg"
    />
  );
}
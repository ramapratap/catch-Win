import React, { useRef, useEffect, useState } from 'react';
import { GameState } from '../../types/game';
import { COOKIE_TYPES } from '../../utils/constants';
import { storage } from '../../utils/storage';

interface GameCanvasProps {
  gameState: GameState;
  width: number;
  height: number;
  cookieImage?: HTMLImageElement | null;
}

export function GameCanvas({ gameState, width, height, cookieImage }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const settings = storage.getSettings();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size with resolution scaling
    const resolution = settings.canvasResolution;
    canvas.width = width * resolution;
    canvas.height = height * resolution;
    ctx.scale(resolution, resolution);

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#1e1b4b');
    gradient.addColorStop(0.3, '#312e81');
    gradient.addColorStop(0.7, '#1e40af');
    gradient.addColorStop(1, '#1e3a8a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Draw decorative stars
    drawStars(ctx, width, height);

    // Draw cookies
    gameState.cookies.forEach(cookie => {
      drawCookie(ctx, cookie, cookieImage ?? null);
    });

    // Draw mouth indicator
    drawMouthIndicator(ctx, gameState, settings);

    // Draw debug info if enabled
    if (settings.debugMode) {
      drawDebugInfo(ctx, gameState, settings);
    }

  }, [gameState, width, height, settings, cookieImage]);

  const drawStars = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.4;
    
    // Static stars for consistent background
    for (let i = 0; i < 30; i++) {
      const x = (i * 31) % width;
      const y = (i * 47) % height;
      const size = ((i * 7) % 3) + 0.5;
      
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.globalAlpha = 1;
  };

  const drawCookie = (ctx: CanvasRenderingContext2D, cookie: any, cookieImg: HTMLImageElement | null) => {
    const { x, y, radius, type } = cookie;
    
    ctx.save();

    // Cookie shadow
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(x + 3, y + 3, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Draw cookie image if available, otherwise fallback to colored circles
    if (cookieImg) {
      ctx.save();
      
      // Apply color tint based on cookie type
      if (type === 'golden') {
        ctx.filter = 'brightness(1.5) hue-rotate(45deg) saturate(2)';
      } else if (type === 'rotten') {
        ctx.filter = 'brightness(0.3) saturate(0) contrast(1.2)';
      }
      
      // Draw the cookie image
      const size = radius * 2;
      ctx.drawImage(
        cookieImg,
        x - radius,
        y - radius,
        size,
        size
      );
      
      ctx.restore();
      
      // Add special effects
      if (type === 'golden') {
        drawSparkleEffect(ctx, x, y, radius);
      } else if (type === 'rotten') {
        drawRottenEffect(ctx, x, y, radius);
      }
    } else {
      // Fallback: draw colored circles
      const cookieData = COOKIE_TYPES[type as keyof typeof COOKIE_TYPES];
      const color = cookieData?.color || '#D97706';

      // Cookie body
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();

      // Cookie texture/pattern
      ctx.fillStyle = type === 'golden' ? '#FCD34D' : type === 'rotten' ? '#4B5563' : '#92400E';
      const dots = type === 'rotten' ? 3 : 6;
      
      for (let i = 0; i < dots; i++) {
        const angle = (i / dots) * Math.PI * 2;
        const dotX = x + Math.cos(angle) * (radius * 0.5);
        const dotY = y + Math.sin(angle) * (radius * 0.5);
        ctx.beginPath();
        ctx.arc(dotX, dotY, radius * 0.15, 0, Math.PI * 2);
        ctx.fill();
      }

      // Special effects
      if (type === 'golden') {
        drawSparkleEffect(ctx, x, y, radius);
      } else if (type === 'rotten') {
        drawRottenEffect(ctx, x, y, radius);
      }
    }
  };

  const drawSparkleEffect = (ctx: CanvasRenderingContext2D, x: number, y: number, radius: number) => {
    ctx.save();
    ctx.globalAlpha = 0.8;
    ctx.fillStyle = '#FEF3C7';
    
    const time = Date.now() / 500;
    for (let i = 0; i < 4; i++) {
      const angle = time + (i * Math.PI * 0.5);
      const sparkleX = x + Math.cos(angle) * (radius + 8);
      const sparkleY = y + Math.sin(angle) * (radius + 8);
      
      ctx.beginPath();
      ctx.arc(sparkleX, sparkleY, 2, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw sparkle cross
      ctx.fillRect(sparkleX - 1, sparkleY - 4, 2, 8);
      ctx.fillRect(sparkleX - 4, sparkleY - 1, 8, 2);
    }
    
    ctx.restore();
  };

  const drawRottenEffect = (ctx: CanvasRenderingContext2D, x: number, y: number, radius: number) => {
    ctx.save();
    ctx.fillStyle = '#EF4444';
    ctx.font = `${radius * 0.8}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.strokeText('☠', x, y);
    ctx.fillText('☠', x, y);
    ctx.restore();
  };

  const drawMouthIndicator = (ctx: CanvasRenderingContext2D, gameState: GameState, settings: any) => {
    const { mouthPosition, mouthOpen } = gameState;
    const isOpen = mouthOpen >= settings.mouthOpenThreshold;
    
    // Mouth indicator circle
    ctx.save();
    ctx.globalAlpha = 0.7;
    ctx.strokeStyle = isOpen ? '#10B981' : '#EF4444';
    ctx.lineWidth = 3;
    
    if (!isOpen) {
      ctx.setLineDash([5, 5]);
    }
    
    const baseRadius = 25;
    const pulseRadius = isOpen ? Math.sin(Date.now() / 200) * 3 : 0;
    const radius = baseRadius + pulseRadius;
    
    ctx.beginPath();
    ctx.arc(mouthPosition.x, mouthPosition.y, radius, 0, Math.PI * 2);
    ctx.stroke();
    
    // Inner fill
    ctx.globalAlpha = 0.2;
    ctx.fillStyle = isOpen ? '#10B981' : '#EF4444';
    ctx.fill();
    
    // Mouth icon
    ctx.globalAlpha = 1;
    ctx.fillStyle = isOpen ? '#10B981' : '#EF4444';
    ctx.font = '20px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(isOpen ? '😋' : '😐', mouthPosition.x, mouthPosition.y);
    
    ctx.restore();

    // Instructions for touch mode
    if (!settings.cameraEnabled) {
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.strokeText('👆 Click to catch', mouthPosition.x, mouthPosition.y - 40);
      ctx.fillText('👆 Click to catch', mouthPosition.x, mouthPosition.y - 40);
    }
  };

  const drawDebugInfo = (ctx: CanvasRenderingContext2D, gameState: GameState, settings: any) => {
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '12px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    
    const debugInfo = [
      `FPS: ~60`,
      `Cookies: ${gameState.cookies.length}`,
      `Mouth Open: ${((Number(gameState.mouthOpen) || 0) * 100).toFixed(1)}%`,  
      `Threshold: ${(settings.mouthOpenThreshold * 100).toFixed(1)}%`,
      `Position: (${Math.round(gameState.mouthPosition.x)}, ${Math.round(gameState.mouthPosition.y)})`,
      `Camera: ${settings.cameraEnabled ? 'ON' : 'OFF'}`,
      `Cookie Image: ${cookieImage ? 'Loaded' : 'Fallback'}`
    ];
    
    // Background for debug text
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(5, 5, 280, debugInfo.length * 15 + 10);
    
    ctx.fillStyle = '#00FF00';
    debugInfo.forEach((info, index) => {
      ctx.fillText(info, 10, 15 + index * 15);
    });
  };

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        position: 'absolute',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        imageRendering: settings.canvasResolution < 1 ? 'pixelated' : 'auto'
      }}
      className="rounded-lg"
    />
  );
}
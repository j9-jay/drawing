'use client';

import React, { useRef, useEffect } from 'react';
import { theme } from '@/styles/theme';

interface GameCanvasProps {
  width?: number;
  height?: number;
  aspectRatio?: string;
  onCanvasReady?: (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => void;
  backgroundColor?: string;
  style?: React.CSSProperties;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  width = 800,
  height = 600,
  aspectRatio = '4 / 3',
  onCanvasReady,
  backgroundColor = theme.colors.background.primary,
  style,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);

    onCanvasReady?.(canvas, ctx);
  }, [width, height, backgroundColor, onCanvasReady]);

  return (
    <div
      style={{
        width: '100%',
        maxWidth: `${width}px`,
        aspectRatio,
        position: 'relative',
        backgroundColor: theme.colors.background.secondary,
        borderRadius: theme.borderRadius.lg,
        border: `1px solid ${theme.colors.border.primary}`,
        overflow: 'hidden',
        ...style,
      }}
    >
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
        }}
      />
    </div>
  );
};

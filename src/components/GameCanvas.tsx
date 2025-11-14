import { useEffect, useRef } from 'react';
import { GameState } from '../types/gameTypes';
import { WIDTH, HEIGHT } from '../constants/gameConstants';
import {
  drawConnections,
  drawNeurons,
  drawPowerups,
  drawParticleTrail,
  drawPlayer,
  drawErrors,
  drawPopups
} from '../utils/renderUtils';

interface GameCanvasProps {
  gameState: React.MutableRefObject<GameState>;
}

export function GameCanvas({ gameState }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let aid: number;
    let t = 0;

    const draw = () => {
      t += 0.01;
      ctx.fillStyle = '#fafafa';
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      drawConnections(ctx, gameState.current.connections, gameState.current.activatedNeurons);
      drawNeurons(ctx, gameState.current.neurons, gameState.current.activatedNeurons, t);
      drawPowerups(ctx, gameState.current.powerups, t);
      
      gameState.current.particleTrail = gameState.current.particleTrail.filter(pt => pt.life > 0);
      drawParticleTrail(ctx, gameState.current.particleTrail);

      const pl = gameState.current.player;
      if (Math.random() > 0.7) {
        gameState.current.particleTrail.push({ x: pl.x, y: pl.y, life: 1 });
      }

      drawPlayer(ctx, pl, t);
      drawErrors(ctx, gameState.current.errors, !!gameState.current.boostEffects.inv);
      
      gameState.current.popups = gameState.current.popups.filter(pp => pp.life > 0);
      drawPopups(ctx, gameState.current.popups);

      aid = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      if (aid) cancelAnimationFrame(aid);
    };
  }, [gameState]);

  return (
    <canvas
      ref={canvasRef}
      width={WIDTH}
      height={HEIGHT}
      className="border-2 border-gray-300 rounded-lg shadow-lg"
    />
  );
}

import { useState, useEffect, useRef } from 'react';
import { GameState } from '../types/gameTypes';
import { WIDTH, HEIGHT, neuralNetHistory } from '../constants/gameConstants';
import { initializeNeuralNetwork, initializeErrors, schedulePowerups, updatePlayerMovement, checkNeuronActivation, checkPowerupCollection, updateErrorMovement } from '../utils/gameLogic';
import { drawConnections, drawNeurons, drawPowerups, drawParticleTrail, drawPlayer, drawErrors, drawPopups } from '../utils/renderUtils';
import GameHeader from './GameHeader';
import GameStats from './GameStats';
import GameOverlay from './GameOverlay';

const NeuralPacman = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  
  const gameState = useRef<GameState>({
    player: { x: 250, y: 250, vx: 0, vy: 0, speed: 2 },
    errors: [],
    neurons: [],
    connections: [],
    activatedNeurons: new Set(),
    powerups: [],
    keys: {},
    particleTrail: [],
    popups: [],
    boostEffects: {}
  });

  useEffect(() => {
    const arch = neuralNetHistory[Math.min(level - 1, neuralNetHistory.length - 1)];
    const { neurons, connections } = initializeNeuralNetwork(arch);
    
    gameState.current.neurons = neurons;
    gameState.current.connections = connections;
    gameState.current.activatedNeurons.clear();
    gameState.current.player = { x: neurons[0]?.x || 250, y: neurons[0]?.y || 250, vx: 0, vy: 0, speed: 2 };
    gameState.current.errors = initializeErrors(arch.errors);
    gameState.current.powerups = [];
    
    schedulePowerups(gameState, setScore);
  }, [level]);

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
      
      // Update and draw particle trail
      gameState.current.particleTrail = gameState.current.particleTrail.filter(pt => {
        pt.life -= 0.02;
        pt.y -= 0.5;
        pt.x += (Math.random() - 0.5) * 0.5;
        return pt.life > 0;
      });
      drawParticleTrail(ctx, gameState.current.particleTrail);

      const pl = gameState.current.player;
      if (Math.random() > 0.7) {
        gameState.current.particleTrail.push({ x: pl.x, y: pl.y, life: 1 });
      }

      drawPlayer(ctx, gameState.current.player, t);
      drawErrors(ctx, gameState.current.errors, !!gameState.current.boostEffects.inv);
      
      // Update and draw popups
      gameState.current.popups = gameState.current.popups.filter(pp => {
        pp.life -= 0.012;
        pp.y += pp.vy;
        return pp.life > 0;
      });
      drawPopups(ctx, gameState.current.popups);

      aid = requestAnimationFrame(draw);
    };

    draw();
    return () => { if (aid) cancelAnimationFrame(aid); };
  }, []);

  useEffect(() => {
    const kd = (e: KeyboardEvent) => { if (!gameOver && !gameWon) gameState.current.keys[e.key] = true; };
    const ku = (e: KeyboardEvent) => { gameState.current.keys[e.key] = false; };
    window.addEventListener('keydown', kd);
    window.addEventListener('keyup', ku);
    return () => { window.removeEventListener('keydown', kd); window.removeEventListener('keyup', ku); };
  }, [gameOver, gameWon]);

  useEffect(() => {
    if (gameOver || gameWon) return;
    const loop = setInterval(() => {
      updatePlayerMovement(gameState, WIDTH, HEIGHT);
      checkNeuronActivation(gameState, setScore, setGameWon);
      checkPowerupCollection(gameState, setScore);
      updateErrorMovement(gameState, setLives, setGameOver);
    }, 16);
    return () => clearInterval(loop);
  }, [gameOver, gameWon]);

  const arch = neuralNetHistory[Math.min(level - 1, neuralNetHistory.length - 1)];

  const handleNextLevel = () => {
    setLevel(l => l + 1);
    setGameWon(false);
    gameState.current.boostEffects = {};
  };

  const handleRestart = () => {
    setLevel(1);
    setScore(0);
    setLives(3);
    setGameOver(false);
    gameState.current.boostEffects = {};
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <GameHeader arch={arch} />
      <GameStats level={level} score={score} lives={lives} activatedCount={gameState.current.activatedNeurons.size} totalNeurons={gameState.current.neurons.length} />
      
      <div className="relative">
        <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} className="border-2 border-gray-300 rounded-lg shadow-lg" />
        <GameOverlay 
          gameOver={gameOver} 
          gameWon={gameWon} 
          arch={arch} 
          score={score} 
          onNextLevel={handleNextLevel} 
          onRestart={handleRestart} 
        />
      </div>

      <p className="mt-4 text-center text-gray-600 text-sm">WASD/Arrows to move • Collect powerups • Activate all neurons</p>
    </div>
  );
};

export default NeuralPacman;

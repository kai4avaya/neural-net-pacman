import React, { useState, useEffect, useRef } from 'react';
import { Brain, Flame, Zap, AlertCircle } from 'lucide-react';

const NeuralPacman = () => {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  
  const gameState = useRef({
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

  const WIDTH = 700;
  const HEIGHT = 600;

  const neuralNetHistory = [
    { year: 1958, name: 'Perceptron', desc: 'Single layer', layers: [{ count: 8, x: 200 }, { count: 1, x: 500 }], density: 1.0, errors: 1 },
    { year: 1986, name: 'MLP', desc: 'Backpropagation', layers: [{ count: 6, x: 150 }, { count: 8, x: 350 }, { count: 4, x: 550 }], density: 0.8, errors: 2 },
    { year: 1989, name: 'CNN', desc: 'Convolution', layers: [{ count: 9, x: 100 }, { count: 6, x: 240 }, { count: 4, x: 380 }, { count: 6, x: 520 }, { count: 3, x: 640 }], density: 0.5, errors: 2 },
    { year: 1997, name: 'LSTM', desc: 'Recurrent', layers: [{ count: 5, x: 200 }, { count: 6, x: 350 }, { count: 5, x: 500 }], density: 0.9, recurrent: true, errors: 3 },
    { year: 2012, name: 'AlexNet', desc: 'Deep CNN', layers: [{ count: 11, x: 100 }, { count: 9, x: 200 }, { count: 7, x: 300 }, { count: 5, x: 400 }, { count: 7, x: 500 }, { count: 4, x: 600 }], density: 0.6, errors: 3 },
    { year: 2014, name: 'GAN', desc: 'Adversarial', layers: [{ count: 4, x: 150 }, { count: 6, x: 300 }, { count: 8, x: 450 }, { count: 5, x: 600 }], density: 0.7, errors: 4 },
    { year: 2015, name: 'ResNet', desc: 'Skip connections', layers: [{ count: 8, x: 100 }, { count: 8, x: 200 }, { count: 8, x: 300 }, { count: 8, x: 400 }, { count: 8, x: 500 }, { count: 6, x: 600 }], density: 0.6, skip: true, errors: 4 },
    { year: 2017, name: 'Transformer', desc: 'Attention', layers: [{ count: 8, x: 150 }, { count: 10, x: 300 }, { count: 10, x: 450 }, { count: 6, x: 600 }], density: 0.9, attention: true, errors: 5 },
    { year: 2020, name: 'GPT-3', desc: '175B params', layers: [{ count: 12, x: 100 }, { count: 14, x: 200 }, { count: 16, x: 300 }, { count: 14, x: 400 }, { count: 12, x: 500 }, { count: 8, x: 600 }], density: 0.85, attention: true, errors: 6 }
  ];

  const powerups = [
    { label: 'KV', effect: 'speed', msg: 'KV-Cache!', dur: 5000 },
    { label: 'Q8', effect: 'points', msg: '+50!', val: 50 },
    { label: 'FA', effect: 'invincible', msg: 'Invincible!', dur: 4000 },
    { label: 'LoRA', effect: 'double', msg: '2x Points!', dur: 6000 },
    { label: 'B32', effect: 'slow', msg: 'Slow!', dur: 5000 }
  ];

  useEffect(() => {
    const arch = neuralNetHistory[Math.min(level - 1, neuralNetHistory.length - 1)];
    const neurons = [];
    const connections = [];

    arch.layers.forEach((layer, layerIdx) => {
      const spacing = HEIGHT / (layer.count + 1);
      for (let i = 0; i < layer.count; i++) {
        neurons.push({ x: layer.x, y: spacing * (i + 1), layer: layerIdx, idx: i, r: 15, phase: Math.random() * Math.PI * 2 });
      }
    });

    arch.layers.forEach((layer, layerIdx) => {
      if (layerIdx < arch.layers.length - 1) {
        const curr = neurons.filter(n => n.layer === layerIdx);
        const next = neurons.filter(n => n.layer === layerIdx + 1);
        curr.forEach(n1 => {
          next.forEach(n2 => {
            if (Math.random() < arch.density) {
              connections.push({ from: n1, to: n2, w: Math.random() * 0.5 + 0.2 });
            }
          });
        });
      }
    });

    if (arch.skip) {
      arch.layers.forEach((layer, layerIdx) => {
        if (layerIdx < arch.layers.length - 2) {
          const curr = neurons.filter(n => n.layer === layerIdx);
          const skip = neurons.filter(n => n.layer === layerIdx + 2);
          curr.forEach((n1, idx) => {
            if (idx < skip.length && Math.random() < 0.5) {
              connections.push({ from: n1, to: skip[idx], w: 0.4, skip: true });
            }
          });
        }
      });
    }

    if (arch.recurrent) {
      arch.layers.forEach((layer, layerIdx) => {
        const lneurons = neurons.filter(n => n.layer === layerIdx);
        lneurons.forEach((n1, idx) => {
          if (idx < lneurons.length - 1 && Math.random() < 0.6) {
            connections.push({ from: n1, to: lneurons[idx + 1], w: 0.3, rec: true });
          }
        });
      });
    }

    if (arch.attention) {
      arch.layers.forEach((layer, layerIdx) => {
        const lneurons = neurons.filter(n => n.layer === layerIdx);
        lneurons.forEach(n1 => {
          lneurons.forEach(n2 => {
            if (n1 !== n2 && Math.random() < 0.3) {
              connections.push({ from: n1, to: n2, w: 0.15, att: true });
            }
          });
        });
      });
    }

    gameState.current.neurons = neurons;
    gameState.current.connections = connections;
    gameState.current.activatedNeurons.clear();
    gameState.current.player = { x: neurons[0]?.x || 250, y: neurons[0]?.y || 250, vx: 0, vy: 0, speed: 2 };

    const pos = [{ x: 550, y: 150 }, { x: 150, y: 450 }, { x: 550, y: 450 }, { x: 350, y: 100 }, { x: 350, y: 500 }, { x: 200, y: 300 }];
    gameState.current.errors = pos.slice(0, arch.errors).map((p, i) => ({ ...p, vx: 0, vy: 0, spd: 1.0 + i * 0.1, shade: i }));
    gameState.current.powerups = [];
    
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        const avail = gameState.current.neurons.filter(n => {
          const k = `${Math.round(n.x)},${Math.round(n.y)}`;
          return !gameState.current.activatedNeurons.has(k);
        });
        if (avail.length > 0) {
          const rn = avail[Math.floor(Math.random() * avail.length)];
          const pu = { ...powerups[Math.floor(Math.random() * powerups.length)], x: rn.x, y: rn.y, r: 10, rot: 0 };
          gameState.current.powerups.push(pu);
        }
      }, 2000 + i * 4000);
    }
  }, [level]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let aid;
    let t = 0;

    const draw = () => {
      t += 0.01;
      ctx.fillStyle = '#fafafa';
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      gameState.current.connections.forEach(c => {
        const fk = `${Math.round(c.from.x)},${Math.round(c.from.y)}`;
        const tk = `${Math.round(c.to.x)},${Math.round(c.to.y)}`;
        const act = gameState.current.activatedNeurons.has(fk) && gameState.current.activatedNeurons.has(tk);
        ctx.beginPath();
        ctx.moveTo(c.from.x, c.from.y);
        ctx.lineTo(c.to.x, c.to.y);
        if (c.skip) {
          ctx.setLineDash([5, 5]);
          ctx.strokeStyle = act ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.08)';
          ctx.lineWidth = 1.5;
        } else if (c.rec) {
          ctx.setLineDash([3, 3]);
          ctx.strokeStyle = act ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.1)';
          ctx.lineWidth = 1;
        } else if (c.att) {
          ctx.setLineDash([2, 2]);
          ctx.strokeStyle = act ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.05)';
          ctx.lineWidth = 1;
        } else {
          ctx.setLineDash([]);
          ctx.strokeStyle = act ? `rgba(0,0,0,${c.w * 0.8})` : `rgba(0,0,0,${c.w * 0.1})`;
          ctx.lineWidth = act ? 2 : 1;
        }
        ctx.stroke();
        ctx.setLineDash([]);
      });

      gameState.current.neurons.forEach(n => {
        const k = `${Math.round(n.x)},${Math.round(n.y)}`;
        const act = gameState.current.activatedNeurons.has(k);
        const p = Math.sin(t * 2 + n.phase) * 0.15 + 1;
        if (act) {
          ctx.fillStyle = '#000';
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.r * 0.6 * p, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#000';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.r * 0.8, 0, Math.PI * 2);
          ctx.stroke();
        } else {
          ctx.strokeStyle = '#d1d5db';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.r * 0.5, 0, Math.PI * 2);
          ctx.stroke();
          ctx.fillStyle = '#fff';
          ctx.fill();
        }
      });

      gameState.current.powerups.forEach(pu => {
        pu.rot += 0.02;
        const b = Math.sin(t * 3) * 2;
        ctx.save();
        ctx.translate(pu.x, pu.y + b);
        ctx.rotate(pu.rot);
        ctx.strokeStyle = '#6b7280';
        ctx.lineWidth = 2;
        ctx.strokeRect(-pu.r, -pu.r, pu.r * 2, pu.r * 2);
        ctx.fillStyle = '#fff';
        ctx.fillRect(-pu.r, -pu.r, pu.r * 2, pu.r * 2);
        ctx.restore();
        ctx.fillStyle = '#374151';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(pu.label, pu.x, pu.y + b);
      });

      gameState.current.particleTrail = gameState.current.particleTrail.filter(pt => {
        pt.life -= 0.02;
        pt.y -= 0.5;
        pt.x += (Math.random() - 0.5) * 0.5;
        if (pt.life > 0) {
          ctx.fillStyle = `rgba(249,115,22,${pt.life * 0.8})`;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 2 * pt.life, 0, Math.PI * 2);
          ctx.fill();
          return true;
        }
        return false;
      });

      const pl = gameState.current.player;
      if (Math.random() > 0.7) {
        gameState.current.particleTrail.push({ x: pl.x, y: pl.y, life: 1 });
      }

      const fl = Math.sin(t * 10) * 0.2 + 1;
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.moveTo(pl.x, pl.y - 8 * fl);
      ctx.quadraticCurveTo(pl.x + 6, pl.y - 2, pl.x + 4, pl.y + 5);
      ctx.quadraticCurveTo(pl.x, pl.y + 2, pl.x - 4, pl.y + 5);
      ctx.quadraticCurveTo(pl.x - 6, pl.y - 2, pl.x, pl.y - 8 * fl);
      ctx.fill();

      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.moveTo(pl.x, pl.y - 5 * fl);
      ctx.quadraticCurveTo(pl.x + 3, pl.y, pl.x + 2, pl.y + 2);
      ctx.quadraticCurveTo(pl.x, pl.y + 1, pl.x - 2, pl.y + 2);
      ctx.quadraticCurveTo(pl.x - 3, pl.y, pl.x, pl.y - 5 * fl);
      ctx.fill();

      const shades = ['#1f2937', '#374151', '#4b5563', '#6b7280', '#9ca3af', '#cbd5e1'];
      gameState.current.errors.forEach(e => {
        const flee = gameState.current.boostEffects.inv;
        ctx.fillStyle = flee ? '#d1d5db' : shades[e.shade % shades.length];
        ctx.beginPath();
        ctx.arc(e.x, e.y - 2, 10, Math.PI, 0);
        ctx.lineTo(e.x + 10, e.y + 8);
        ctx.lineTo(e.x + 7, e.y + 4);
        ctx.lineTo(e.x + 3, e.y + 8);
        ctx.lineTo(e.x - 3, e.y + 4);
        ctx.lineTo(e.x - 7, e.y + 8);
        ctx.lineTo(e.x - 10, e.y + 4);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(e.x - 4, e.y - 2, 2.5, 0, Math.PI * 2);
        ctx.arc(e.x + 4, e.y - 2, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = flee ? '#9ca3af' : '#000';
        ctx.beginPath();
        ctx.arc(e.x - 4, e.y - 2, 1.2, 0, Math.PI * 2);
        ctx.arc(e.x + 4, e.y - 2, 1.2, 0, Math.PI * 2);
        ctx.fill();
      });

      gameState.current.popups = gameState.current.popups.filter(pp => {
        pp.life -= 0.012;
        pp.y += pp.vy;
        if (pp.life > 0) {
          ctx.save();
          ctx.globalAlpha = pp.life;
          ctx.fillStyle = '#000';
          ctx.font = 'bold 14px monospace';
          ctx.textAlign = 'center';
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 4;
          ctx.strokeText(pp.msg, pp.x, pp.y);
          ctx.fillText(pp.msg, pp.x, pp.y);
          ctx.restore();
          return true;
        }
        return false;
      });

      aid = requestAnimationFrame(draw);
    };

    draw();
    return () => { if (aid) cancelAnimationFrame(aid); };
  }, []);

  useEffect(() => {
    const kd = (e) => { if (!gameOver && !gameWon) gameState.current.keys[e.key] = true; };
    const ku = (e) => { gameState.current.keys[e.key] = false; };
    window.addEventListener('keydown', kd);
    window.addEventListener('keyup', ku);
    return () => { window.removeEventListener('keydown', kd); window.removeEventListener('keyup', ku); };
  }, [gameOver, gameWon]);

  useEffect(() => {
    if (gameOver || gameWon) return;
    const loop = setInterval(() => {
      const s = gameState.current;
      const spd = s.boostEffects.spd ? 3.6 : 2;
      s.player.vx = 0;
      s.player.vy = 0;
      if (s.keys.ArrowLeft || s.keys.a) s.player.vx = -spd;
      if (s.keys.ArrowRight || s.keys.d) s.player.vx = spd;
      if (s.keys.ArrowUp || s.keys.w) s.player.vy = -spd;
      if (s.keys.ArrowDown || s.keys.s) s.player.vy = spd;
      s.player.x = Math.max(30, Math.min(WIDTH - 30, s.player.x + s.player.vx));
      s.player.y = Math.max(30, Math.min(HEIGHT - 30, s.player.y + s.player.vy));

      s.neurons.forEach(n => {
        const k = `${Math.round(n.x)},${Math.round(n.y)}`;
        const d = Math.sqrt((s.player.x - n.x) ** 2 + (s.player.y - n.y) ** 2);
        if (d < n.r && !s.activatedNeurons.has(k)) {
          s.activatedNeurons.add(k);
          setScore(sc => sc + (s.boostEffects.dbl ? 20 : 10));
          if (s.activatedNeurons.size === s.neurons.length) setGameWon(true);
        }
      });

      s.powerups = s.powerups.filter(pu => {
        const d = Math.sqrt((s.player.x - pu.x) ** 2 + (s.player.y - pu.y) ** 2);
        if (d < pu.r + 10) {
          s.popups.push({ msg: pu.msg, x: pu.x, y: pu.y, life: 1, vy: -1.5 });
          if (pu.effect === 'speed') { s.boostEffects.spd = true; setTimeout(() => s.boostEffects.spd = false, pu.dur); }
          else if (pu.effect === 'points') setScore(sc => sc + pu.val);
          else if (pu.effect === 'invincible') { s.boostEffects.inv = true; setTimeout(() => s.boostEffects.inv = false, pu.dur); }
          else if (pu.effect === 'double') { s.boostEffects.dbl = true; setTimeout(() => s.boostEffects.dbl = false, pu.dur); }
          else if (pu.effect === 'slow') { s.boostEffects.slw = true; setTimeout(() => s.boostEffects.slw = false, pu.dur); }
          return false;
        }
        return true;
      });

      const espd = s.boostEffects.slw ? 0.5 : 1;
      s.errors.forEach(e => {
        const dx = s.player.x - e.x;
        const dy = s.player.y - e.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d > 0) {
          const dir = s.boostEffects.inv ? -1 : 1;
          e.vx = (dx / d) * e.spd * espd * dir;
          e.vy = (dy / d) * e.spd * espd * dir;
        }
        e.x += e.vx;
        e.y += e.vy;

        if (!s.boostEffects.inv && Math.sqrt((s.player.x - e.x) ** 2 + (s.player.y - e.y) ** 2) < 15) {
          setLives(l => {
            if (l <= 1) { setGameOver(true); return 0; }
            s.player.x = s.neurons[0]?.x || 250;
            s.player.y = s.neurons[0]?.y || 250;
            return l - 1;
          });
        }
      });
    }, 16);
    return () => clearInterval(loop);
  }, [gameOver, gameWon]);

  const arch = neuralNetHistory[Math.min(level - 1, neuralNetHistory.length - 1)];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="mb-4 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
          <Flame className="w-8 h-8 text-orange-500" />
          Neural Net History
          <Brain className="w-8 h-8 text-gray-700" />
        </h1>
        <p className="text-gray-600 text-lg font-semibold">{arch.year} - {arch.name}</p>
        <p className="text-gray-500 text-sm">{arch.desc}</p>
      </div>
      
      <div className="bg-white border-2 border-gray-200 p-4 rounded-lg shadow-sm mb-4">
        <div className="flex gap-8 justify-center text-gray-800">
          <span className="font-mono">Level {level}</span>
          <div className="flex items-center gap-2"><Zap className="w-5 h-5" /><span className="font-mono">{score}</span></div>
          <div className="flex items-center gap-2"><Flame className="w-5 h-5 text-orange-500" /><span className="font-mono">{lives}</span></div>
          <div className="flex items-center gap-2"><Brain className="w-5 h-5" /><span className="font-mono">{gameState.current.activatedNeurons.size}/{gameState.current.neurons.length}</span></div>
        </div>
      </div>

      <div className="relative">
        <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} className="border-2 border-gray-300 rounded-lg shadow-lg" />
        {(gameOver || gameWon) && (
          <div className="absolute inset-0 bg-white bg-opacity-95 flex items-center justify-center rounded-lg">
            <div className="text-center">
              {gameWon ? (
                <>
                  <h2 className="text-5xl font-bold text-gray-900 mb-4">{arch.name} Complete!</h2>
                  <p className="text-gray-700 text-xl mb-2">Network activated</p>
                  <p className="text-gray-900 text-2xl font-mono mb-6">Score: {score}</p>
                  <button onClick={() => { setLevel(l => l + 1); setGameWon(false); gameState.current.boostEffects = {}; }} className="bg-gray-900 hover:bg-gray-700 text-white font-bold py-3 px-8 rounded-lg">Next Era</button>
                </>
              ) : (
                <>
                  <AlertCircle className="w-20 h-20 text-gray-700 mx-auto mb-4" />
                  <h2 className="text-5xl font-bold text-gray-900 mb-4">Training Failed</h2>
                  <p className="text-gray-900 text-2xl font-mono mb-6">Score: {score}</p>
                  <button onClick={() => { setLevel(1); setScore(0); setLives(3); setGameOver(false); }} className="bg-gray-900 hover:bg-gray-700 text-white font-bold py-3 px-8 rounded-lg">Restart</button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <p className="mt-4 text-center text-gray-600 text-sm">WASD/Arrows to move • Collect powerups • Activate all neurons</p>
    </div>
  );
};

export default NeuralPacman;

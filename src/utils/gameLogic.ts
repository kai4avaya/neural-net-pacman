import React from 'react';
import { GameState, Neuron, Connection, NeuralNetArchitecture, Powerup } from '../types/gameTypes';
import { HEIGHT, ERROR_POSITIONS, powerups } from '../constants/gameConstants';

export function initializeNeuralNetwork(arch: NeuralNetArchitecture): { neurons: Neuron[]; connections: Connection[] } {
  const neurons: Neuron[] = [];
  const connections: Connection[] = [];

  arch.layers.forEach((layer, layerIdx) => {
    const spacing = HEIGHT / (layer.count + 1);
    for (let i = 0; i < layer.count; i++) {
      neurons.push({
        x: layer.x,
        y: spacing * (i + 1),
        layer: layerIdx,
        idx: i,
        r: 15,
        phase: Math.random() * Math.PI * 2
      });
    }
  });

  arch.layers.forEach((_layer, layerIdx) => {
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
    arch.layers.forEach((_layer, layerIdx) => {
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
    arch.layers.forEach((_layer, layerIdx) => {
      const lneurons = neurons.filter(n => n.layer === layerIdx);
      lneurons.forEach((n1, idx) => {
        if (idx < lneurons.length - 1 && Math.random() < 0.6) {
          connections.push({ from: n1, to: lneurons[idx + 1], w: 0.3, rec: true });
        }
      });
    });
  }

  if (arch.attention) {
    arch.layers.forEach((_layer, layerIdx) => {
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

  return { neurons, connections };
}

export function initializeErrors(errorCount: number) {
  return ERROR_POSITIONS.slice(0, errorCount).map((p, i) => ({
    ...p,
    vx: 0,
    vy: 0,
    spd: 1.0 + i * 0.1,
    shade: i
  }));
}

export function schedulePowerups(
  gameState: React.MutableRefObject<GameState>,
  _setScore: React.Dispatch<React.SetStateAction<number>>
) {
  for (let i = 0; i < 3; i++) {
    setTimeout(() => {
      const avail = gameState.current.neurons.filter(n => {
        const k = `${Math.round(n.x)},${Math.round(n.y)}`;
        return !gameState.current.activatedNeurons.has(k);
      });
      if (avail.length > 0) {
        const rn = avail[Math.floor(Math.random() * avail.length)];
        const basePowerup = powerups[Math.floor(Math.random() * powerups.length)];
        const pu: Powerup = {
          label: basePowerup.label,
          effect: basePowerup.effect as Powerup['effect'],
          msg: basePowerup.msg,
          dur: basePowerup.dur,
          val: basePowerup.val,
          x: rn.x,
          y: rn.y,
          r: 10,
          rot: 0
        };
        gameState.current.powerups.push(pu);
      }
    }, 2000 + i * 4000);
  }
}

export function updatePlayerMovement(gameState: React.MutableRefObject<GameState>, WIDTH: number, HEIGHT: number) {
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
}

export function checkNeuronActivation(
  gameState: React.MutableRefObject<GameState>,
  setScore: React.Dispatch<React.SetStateAction<number>>,
  setGameWon: React.Dispatch<React.SetStateAction<boolean>>
) {
  const s = gameState.current;
  s.neurons.forEach(n => {
    const k = `${Math.round(n.x)},${Math.round(n.y)}`;
    const d = Math.sqrt((s.player.x - n.x) ** 2 + (s.player.y - n.y) ** 2);
    if (d < n.r && !s.activatedNeurons.has(k)) {
      s.activatedNeurons.add(k);
      setScore(sc => sc + (s.boostEffects.dbl ? 20 : 10));
      if (s.activatedNeurons.size === s.neurons.length) setGameWon(true);
    }
  });
}

export function checkPowerupCollection(
  gameState: React.MutableRefObject<GameState>,
  setScore: React.Dispatch<React.SetStateAction<number>>
) {
  const s = gameState.current;
  s.powerups = s.powerups.filter(pu => {
    const d = Math.sqrt((s.player.x - pu.x) ** 2 + (s.player.y - pu.y) ** 2);
    if (d < pu.r + 10) {
      s.popups.push({ msg: pu.msg, x: pu.x, y: pu.y, life: 1, vy: -1.5 });
      if (pu.effect === 'speed') {
        s.boostEffects.spd = true;
        setTimeout(() => s.boostEffects.spd = false, pu.dur!);
      } else if (pu.effect === 'points') {
        setScore(sc => sc + pu.val!);
      } else if (pu.effect === 'invincible') {
        s.boostEffects.inv = true;
        setTimeout(() => s.boostEffects.inv = false, pu.dur!);
      } else if (pu.effect === 'double') {
        s.boostEffects.dbl = true;
        setTimeout(() => s.boostEffects.dbl = false, pu.dur!);
      } else if (pu.effect === 'slow') {
        s.boostEffects.slw = true;
        setTimeout(() => s.boostEffects.slw = false, pu.dur!);
      }
      return false;
    }
    return true;
  });
}

export function updateErrorMovement(
  gameState: React.MutableRefObject<GameState>,
  setLives: React.Dispatch<React.SetStateAction<number>>,
  setGameOver: React.Dispatch<React.SetStateAction<boolean>>
) {
  const s = gameState.current;
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
        if (l <= 1) {
          setGameOver(true);
          return 0;
        }
        s.player.x = s.neurons[0]?.x || 250;
        s.player.y = s.neurons[0]?.y || 250;
        return l - 1;
      });
    }
  });
}

import React from 'react';
import { GameState, Neuron, Connection, NeuralNetArchitecture, Powerup } from '../types/gameTypes';
import { HEIGHT, ERROR_POSITIONS } from '../constants/gameConstants';

export function initializeNeuralNetwork(arch: NeuralNetArchitecture): { neurons: Neuron[]; connections: Connection[] } {
  const style = arch.visualStyle || 'mlp';
  
  switch (style) {
    case 'cnn':
    case 'alexnet':
      return initializeCNN(arch);
    case 'transformer':
    case 'gpt3':
      return initializeTransformer(arch);
    case 'lstm':
      return initializeLSTM(arch);
    case 'resnet':
      return initializeResNet(arch);
    case 'gan':
      return initializeGAN(arch);
    default:
      return initializeStandard(arch);
  }
}

function initializeCNN(arch: NeuralNetArchitecture): { neurons: Neuron[]; connections: Connection[] } {
  const neurons: Neuron[] = [];
  const connections: Connection[] = [];
  
  // CNN: Arrange neurons in grid patterns (feature maps)
  arch.layers.forEach((layer, layerIdx) => {
    const gridSize = Math.ceil(Math.sqrt(layer.count));
    const cellSize = Math.min(80, HEIGHT / (gridSize + 2));
    const startY = (HEIGHT - (gridSize * cellSize)) / 2;
    
    for (let i = 0; i < layer.count; i++) {
      const gridX = i % gridSize;
      const gridY = Math.floor(i / gridSize);
      neurons.push({
        x: layer.x,
        y: startY + gridY * cellSize + cellSize / 2,
        layer: layerIdx,
        idx: i,
        r: cellSize * 0.3,
        phase: Math.random() * Math.PI * 2,
        gridX,
        gridY
      });
    }
    
    // Connect to next layer with overlapping receptive fields (convolution pattern)
    if (layerIdx < arch.layers.length - 1) {
      const curr = neurons.filter(n => n.layer === layerIdx);
      const next = neurons.filter(n => n.layer === layerIdx + 1);
      const kernelSize = 3; // 3x3 convolution kernel
      
      curr.forEach(n1 => {
        next.forEach(n2 => {
          // Simulate convolution: connect nearby neurons (receptive field)
          const dist = Math.sqrt((n1.gridX! - n2.gridX!)**2 + (n1.gridY! - n2.gridY!)**2);
          if (dist < kernelSize && Math.random() < arch.density) {
            connections.push({ from: n1, to: n2, w: Math.max(0.3, 0.8 - dist * 0.2) });
          }
        });
      });
    }
  });
  
  return { neurons, connections };
}

function initializeTransformer(arch: NeuralNetArchitecture): { neurons: Neuron[]; connections: Connection[] } {
  const neurons: Neuron[] = [];
  const connections: Connection[] = [];
  
  // Transformer: Encoder-Decoder structure with attention heads
  const numHeads = 4; // Multi-head attention
  const encoderLayers = Math.floor(arch.layers.length / 2);
  
  arch.layers.forEach((layer, layerIdx) => {
    const isEncoder = layerIdx < encoderLayers;
    const isDecoder = !isEncoder;
    const headHeight = HEIGHT / (numHeads + 1);
    
    // Arrange in attention heads
    for (let head = 0; head < numHeads; head++) {
      const headStartY = headHeight * (head + 1);
      const neuronsPerHead = Math.ceil(layer.count / numHeads);
      const spacing = headHeight / (neuronsPerHead + 1);
      
      for (let i = 0; i < neuronsPerHead && (head * neuronsPerHead + i) < layer.count; i++) {
        const idx = head * neuronsPerHead + i;
        neurons.push({
          x: layer.x,
          y: headStartY - headHeight / 2 + spacing * (i + 1),
          layer: layerIdx,
          idx,
          r: 12,
          phase: Math.random() * Math.PI * 2,
          headIdx: head,
          isEncoder,
          isDecoder
        });
      }
    }
  });
  
  // Self-attention within layers
  arch.layers.forEach((_layer, layerIdx) => {
    const lneurons = neurons.filter(n => n.layer === layerIdx);
    lneurons.forEach(n1 => {
      lneurons.forEach(n2 => {
        if (n1 !== n2 && n1.headIdx === n2.headIdx && Math.random() < 0.4) {
          connections.push({ from: n1, to: n2, w: 0.2, att: true });
        }
      });
    });
  });
  
  // Cross-attention: encoder to decoder
  const encoderNeurons = neurons.filter(n => n.isEncoder);
  const decoderNeurons = neurons.filter(n => n.isDecoder);
  encoderNeurons.forEach(en => {
    decoderNeurons.forEach(dn => {
      if (en.headIdx === dn.headIdx && Math.random() < 0.3) {
        connections.push({ from: en, to: dn, w: 0.25, att: true });
      }
    });
  });
  
  // Feed-forward connections between layers
  arch.layers.forEach((_layer, layerIdx) => {
    if (layerIdx < arch.layers.length - 1) {
      const curr = neurons.filter(n => n.layer === layerIdx);
      const next = neurons.filter(n => n.layer === layerIdx + 1);
      curr.forEach(n1 => {
        next.forEach(n2 => {
          if (n1.headIdx === n2.headIdx && Math.random() < arch.density) {
            connections.push({ from: n1, to: n2, w: Math.random() * 0.5 + 0.3 });
          }
        });
      });
    }
  });
  
  return { neurons, connections };
}

function initializeLSTM(arch: NeuralNetArchitecture): { neurons: Neuron[]; connections: Connection[] } {
  const neurons: Neuron[] = [];
  const connections: Connection[] = [];
  
  // LSTM: Recurrent structure with gates
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
  
  // Recurrent connections (memory flow)
  arch.layers.forEach((_layer, layerIdx) => {
    const lneurons = neurons.filter(n => n.layer === layerIdx);
    lneurons.forEach((n1, idx) => {
      // Connect to next neuron in sequence (temporal flow)
      if (idx < lneurons.length - 1) {
        connections.push({ from: n1, to: lneurons[idx + 1], w: 0.4, rec: true });
      }
      // Self-loop for memory
      if (Math.random() < 0.5) {
        connections.push({ from: n1, to: n1, w: 0.3, rec: true });
      }
    });
  });
  
  // Forward connections
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
  
  return { neurons, connections };
}

function initializeResNet(arch: NeuralNetArchitecture): { neurons: Neuron[]; connections: Connection[] } {
  const neurons: Neuron[] = [];
  const connections: Connection[] = [];
  
  // ResNet: Blocks with skip connections
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
  
  // Standard forward connections
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
  
  // Skip connections (residual blocks)
  arch.layers.forEach((_layer, layerIdx) => {
    if (layerIdx < arch.layers.length - 2) {
      const curr = neurons.filter(n => n.layer === layerIdx);
      const skip = neurons.filter(n => n.layer === layerIdx + 2);
      curr.forEach((n1, idx) => {
        if (idx < skip.length && Math.random() < 0.7) {
          connections.push({ from: n1, to: skip[idx], w: 0.5, skip: true });
        }
      });
    }
  });
  
  return { neurons, connections };
}

function initializeGAN(arch: NeuralNetArchitecture): { neurons: Neuron[]; connections: Connection[] } {
  const neurons: Neuron[] = [];
  const connections: Connection[] = [];
  
  // GAN: Generator and Discriminator sides
  const midPoint = Math.floor(arch.layers.length / 2);
  
  arch.layers.forEach((layer, layerIdx) => {
    const isGenerator = layerIdx < midPoint;
    const spacing = HEIGHT / (layer.count + 1);
    const offset = isGenerator ? -20 : 20; // Visual separation
    
    for (let i = 0; i < layer.count; i++) {
      neurons.push({
        x: layer.x + offset,
        y: spacing * (i + 1),
        layer: layerIdx,
        idx: i,
        r: 15,
        phase: Math.random() * Math.PI * 2
      });
    }
  });
  
  // Generator connections (expanding)
  for (let i = 0; i < midPoint - 1; i++) {
    const curr = neurons.filter(n => n.layer === i);
    const next = neurons.filter(n => n.layer === i + 1);
    curr.forEach(n1 => {
      next.forEach(n2 => {
        if (Math.random() < arch.density * 1.2) {
          connections.push({ from: n1, to: n2, w: Math.random() * 0.5 + 0.3 });
        }
      });
    });
  }
  
  // Discriminator connections (contracting)
  for (let i = midPoint; i < arch.layers.length - 1; i++) {
    const curr = neurons.filter(n => n.layer === i);
    const next = neurons.filter(n => n.layer === i + 1);
    curr.forEach(n1 => {
      next.forEach(n2 => {
        if (Math.random() < arch.density) {
          connections.push({ from: n1, to: n2, w: Math.random() * 0.5 + 0.2 });
        }
      });
    });
  }
  
  return { neurons, connections };
}

function initializeStandard(arch: NeuralNetArchitecture): { neurons: Neuron[]; connections: Connection[] } {
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
  _setScore: React.Dispatch<React.SetStateAction<number>>,
  arch: NeuralNetArchitecture
) {
  const availablePowerups = arch.powerups || [];
  if (availablePowerups.length === 0) return;
  
  for (let i = 0; i < 3; i++) {
    setTimeout(() => {
      const avail = gameState.current.neurons.filter(n => {
        const k = getNeuronKey(n);
        return !gameState.current.activatedNeurons.has(k);
      });
      if (avail.length > 0) {
        const rn = avail[Math.floor(Math.random() * avail.length)];
        const basePowerup = availablePowerups[Math.floor(Math.random() * availablePowerups.length)];
        const pu: Powerup = {
          label: basePowerup.label,
          effect: basePowerup.effect,
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

// Helper function to generate consistent neuron keys
function getNeuronKey(n: Neuron): string {
  return `${Math.round(n.x)},${Math.round(n.y)}`;
}

export function checkNeuronActivation(
  gameState: React.MutableRefObject<GameState>,
  setScore: React.Dispatch<React.SetStateAction<number>>,
  setGameWon: React.Dispatch<React.SetStateAction<boolean>>
) {
  const s = gameState.current;
  
  if (s.neurons.length === 0) return;
  
  s.neurons.forEach(n => {
    const k = getNeuronKey(n);
    const d = Math.sqrt((s.player.x - n.x) ** 2 + (s.player.y - n.y) ** 2);
    // Use a slightly larger collision radius for easier activation
    const collisionRadius = n.r + 5;
    if (d < collisionRadius && !s.activatedNeurons.has(k)) {
      s.activatedNeurons.add(k);
      setScore(sc => sc + (s.boostEffects.dbl ? 20 : 10));
    }
  });
  
  // Check for win condition after all neurons are checked
  // Ensure we have all unique neurons activated
  const totalNeurons = s.neurons.length;
  const activatedCount = s.activatedNeurons.size;
  
  if (totalNeurons > 0 && activatedCount >= totalNeurons) {
    setGameWon(true);
  }
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

import { GameState, Connection, Neuron, Error, NeuralNetArchitecture } from '../types/gameTypes';
import { ERROR_SHADES, WIDTH, HEIGHT } from '../constants/gameConstants';

export function drawArchitectureBackground(ctx: CanvasRenderingContext2D, arch: NeuralNetArchitecture, t: number) {
  const style = arch.visualStyle || 'mlp';
  
  switch (style) {
    case 'cnn':
    case 'alexnet':
      // Draw grid pattern showing feature map structure
      arch.layers.forEach((layer, layerIdx) => {
        const gridSize = Math.ceil(Math.sqrt(layer.count));
        const cellSize = Math.min(80, HEIGHT / (gridSize + 2));
        const startY = (HEIGHT - (gridSize * cellSize)) / 2;
        
        // Draw grid for this layer
        ctx.strokeStyle = `rgba(59, 130, 246, ${0.15 + Math.sin(t + layerIdx) * 0.05})`;
        ctx.lineWidth = 1;
        for (let i = 0; i <= gridSize; i++) {
          // Vertical lines
          ctx.beginPath();
          ctx.moveTo(layer.x - cellSize/2, startY + i * cellSize);
          ctx.lineTo(layer.x + cellSize/2, startY + i * cellSize);
          ctx.stroke();
          // Horizontal lines
          ctx.beginPath();
          ctx.moveTo(layer.x - cellSize/2 + i * cellSize, startY);
          ctx.lineTo(layer.x - cellSize/2 + i * cellSize, startY + gridSize * cellSize);
          ctx.stroke();
        }
        
        // Draw overlapping receptive fields (convolution kernels)
        if (layerIdx < arch.layers.length - 1) {
          const nextLayer = arch.layers[layerIdx + 1];
          const nextGridSize = Math.ceil(Math.sqrt(nextLayer.count));
          const nextCellSize = Math.min(80, HEIGHT / (nextGridSize + 2));
          const nextStartY = (HEIGHT - (nextGridSize * nextCellSize)) / 2;
          
          ctx.strokeStyle = `rgba(147, 51, 234, ${0.2 + Math.sin(t * 2 + layerIdx) * 0.1})`;
          ctx.lineWidth = 2;
          ctx.setLineDash([3, 3]);
          // Draw 3x3 kernel connections
          for (let i = 0; i < Math.min(3, nextGridSize); i++) {
            for (let j = 0; j < Math.min(3, nextGridSize); j++) {
              const x1 = layer.x;
              const y1 = startY + cellSize / 2;
              const x2 = nextLayer.x;
              const y2 = nextStartY + j * nextCellSize + nextCellSize / 2;
              ctx.beginPath();
              ctx.moveTo(x1, y1);
              ctx.lineTo(x2, y2);
              ctx.stroke();
            }
          }
          ctx.setLineDash([]);
        }
      });
      break;
      
    case 'transformer':
    case 'gpt3':
      // Draw encoder-decoder structure with attention heads
      const encoderLayers = Math.floor(arch.layers.length / 2);
      const numHeads = 4;
      const headHeight = HEIGHT / (numHeads + 1);
      
      // Draw encoder section background
      if (encoderLayers > 0) {
        const encoderStartX = arch.layers[0].x;
        const encoderEndX = arch.layers[encoderLayers - 1].x;
        ctx.fillStyle = 'rgba(147, 51, 234, 0.05)';
        ctx.fillRect(encoderStartX - 50, 0, encoderEndX - encoderStartX + 100, HEIGHT);
        
        // Label encoder
        ctx.fillStyle = 'rgba(147, 51, 234, 0.3)';
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('ENCODER', (encoderStartX + encoderEndX) / 2, 20);
      }
      
      // Draw decoder section background
      if (arch.layers.length > encoderLayers) {
        const decoderStartX = arch.layers[encoderLayers].x;
        const decoderEndX = arch.layers[arch.layers.length - 1].x;
        ctx.fillStyle = 'rgba(34, 197, 94, 0.05)';
        ctx.fillRect(decoderStartX - 50, 0, decoderEndX - decoderStartX + 100, HEIGHT);
        
        // Label decoder
        ctx.fillStyle = 'rgba(34, 197, 94, 0.3)';
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('DECODER', (decoderStartX + decoderEndX) / 2, 20);
      }
      
      // Draw attention head separators
      ctx.strokeStyle = 'rgba(147, 51, 234, 0.2)';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      for (let h = 0; h <= numHeads; h++) {
        const y = headHeight * h;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(WIDTH, y);
        ctx.stroke();
      }
      ctx.setLineDash([]);
      
      // Draw attention patterns between encoder and decoder
      ctx.strokeStyle = 'rgba(147, 51, 234, 0.15)';
      ctx.lineWidth = 1;
      if (encoderLayers > 0 && arch.layers.length > encoderLayers) {
        const encX = arch.layers[encoderLayers - 1].x;
        const decX = arch.layers[encoderLayers].x;
        for (let h = 0; h < numHeads; h++) {
          const y = headHeight * (h + 1);
          ctx.beginPath();
          ctx.moveTo(encX, y);
          ctx.quadraticCurveTo((encX + decX) / 2, y + Math.sin(t + h) * 30, decX, y);
          ctx.stroke();
        }
      }
      break;
      
    case 'lstm':
      // Draw recurrent flow patterns
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.1)';
      ctx.lineWidth = 2;
      for (let i = 0; i < 5; i++) {
        const y = HEIGHT / 5 * (i + 1);
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.quadraticCurveTo(WIDTH / 2, y + Math.sin(t + i) * 30, WIDTH, y);
        ctx.stroke();
      }
      break;
      
    case 'resnet':
      // Draw skip connection indicators
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.1)';
      ctx.lineWidth = 2;
      ctx.setLineDash([10, 5]);
      for (let i = 0; i < arch.layers.length - 2; i++) {
        const x1 = arch.layers[i].x;
        const x2 = arch.layers[i + 2].x;
        ctx.beginPath();
        ctx.moveTo(x1, HEIGHT / 2);
        ctx.lineTo(x2, HEIGHT / 2);
        ctx.stroke();
      }
      ctx.setLineDash([]);
      break;
      
    case 'gan':
      // Draw adversarial pattern (alternating)
      ctx.fillStyle = 'rgba(168, 85, 247, 0.05)';
      for (let i = 0; i < WIDTH; i += 40) {
        if (Math.floor(i / 40) % 2 === 0) {
          ctx.fillRect(i, 0, 40, HEIGHT);
        }
      }
      break;
      
    default:
      // Simple background for perceptron/MLP
      break;
  }
}

export function drawConnections(ctx: CanvasRenderingContext2D, connections: Connection[], activatedNeurons: Set<string>, arch?: NeuralNetArchitecture) {
  const style = arch?.visualStyle || 'mlp';
  
  connections.forEach(c => {
    const fk = getNeuronKey(c.from);
    const tk = getNeuronKey(c.to);
    const act = activatedNeurons.has(fk) && activatedNeurons.has(tk);
    
    ctx.beginPath();
    ctx.moveTo(c.from.x, c.from.y);
    ctx.lineTo(c.to.x, c.to.y);
    
    if (c.skip) {
      // ResNet skip connections - thicker, dashed
      ctx.setLineDash([8, 4]);
      ctx.strokeStyle = act ? 'rgba(239, 68, 68, 0.8)' : 'rgba(239, 68, 68, 0.2)';
      ctx.lineWidth = act ? 3 : 2;
    } else if (c.rec) {
      // LSTM recurrent - curved, green
      ctx.strokeStyle = act ? 'rgba(34, 197, 94, 0.7)' : 'rgba(34, 197, 94, 0.2)';
      ctx.setLineDash([4, 2]);
      ctx.lineWidth = act ? 2 : 1.5;
      // Redraw as curved for recurrent
      ctx.beginPath();
      const midX = (c.from.x + c.to.x) / 2;
      const midY = (c.from.y + c.to.y) / 2 + 20;
      ctx.moveTo(c.from.x, c.from.y);
      ctx.quadraticCurveTo(midX, midY, c.to.x, c.to.y);
    } else if (c.att) {
      // Transformer attention - purple, wavy
      ctx.strokeStyle = act ? 'rgba(147, 51, 234, 0.6)' : 'rgba(147, 51, 234, 0.15)';
      ctx.setLineDash([2, 2]);
      ctx.lineWidth = act ? 2 : 1;
    } else {
      // Standard connections
      ctx.setLineDash([]);
      if (style === 'cnn' || style === 'alexnet') {
        // CNN: Show receptive field connections more prominently
        ctx.strokeStyle = act ? `rgba(59, 130, 246, ${Math.min(0.8, c.w * 1.2)})` : `rgba(59, 130, 246, ${c.w * 0.2})`;
        ctx.lineWidth = act ? Math.max(2, c.w * 3) : c.w * 2;
      } else {
        ctx.strokeStyle = act ? `rgba(0,0,0,${c.w * 0.8})` : `rgba(0,0,0,${c.w * 0.1})`;
        ctx.lineWidth = act ? 2 : 1;
      }
    }
    
    ctx.stroke();
    ctx.setLineDash([]);
  });
}

// Helper function to generate consistent neuron keys (must match gameLogic.ts)
function getNeuronKey(n: Neuron): string {
  return `${Math.round(n.x)},${Math.round(n.y)}`;
}

export function drawNeurons(ctx: CanvasRenderingContext2D, neurons: Neuron[], activatedNeurons: Set<string>, t: number, arch?: NeuralNetArchitecture) {
  const style = arch?.visualStyle || 'mlp';
  
  neurons.forEach(n => {
    const k = getNeuronKey(n);
    const act = activatedNeurons.has(k);
    const p = Math.sin(t * 2 + n.phase) * 0.15 + 1;
    
    ctx.save();
    
    switch (style) {
      case 'cnn':
      case 'alexnet':
        // Square neurons arranged in grid (feature maps) - STACKED SQUARES
        const squareSize = n.r * 1.2 * p;
        const squareOffset = 4;
        
        // Draw stacked squares effect (like feature map layers) - draw from back to front
        for (let i = 2; i >= 0; i--) {
          const offsetX = (i - 1) * squareOffset;
          const offsetY = (i - 1) * squareOffset;
          const alpha = i === 1 ? 1.0 : (i === 0 ? 0.5 : 0.3);
          
          if (act) {
            ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2.5;
          } else {
            ctx.fillStyle = `rgba(59, 130, 246, ${alpha * 0.4})`;
            ctx.strokeStyle = '#2563eb';
            ctx.lineWidth = 2;
          }
          
          ctx.fillRect(n.x - squareSize/2 + offsetX, n.y - squareSize/2 + offsetY, squareSize, squareSize);
          ctx.strokeRect(n.x - squareSize/2 + offsetX, n.y - squareSize/2 + offsetY, squareSize, squareSize);
        }
        
        // Draw grid position indicator
        if (n.gridX !== undefined && n.gridY !== undefined) {
          ctx.fillStyle = act ? '#fff' : '#1e40af';
          ctx.font = 'bold 9px monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`${n.gridX},${n.gridY}`, n.x, n.y);
        }
        break;
        
      case 'transformer':
      case 'gpt3':
        // Hexagon for attention, color-coded by encoder/decoder
        if (n.isEncoder) {
          ctx.fillStyle = act ? '#9333ea' : '#e9d5ff';
          ctx.strokeStyle = act ? '#9333ea' : '#c084fc';
        } else if (n.isDecoder) {
          ctx.fillStyle = act ? '#22c55e' : '#dcfce7';
          ctx.strokeStyle = act ? '#22c55e' : '#86efac';
        }
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 3) * i;
          const x = Math.cos(angle) * n.r * 0.5 * p;
          const y = Math.sin(angle) * n.r * 0.5 * p;
          if (i === 0) ctx.moveTo(n.x + x, n.y + y);
          else ctx.lineTo(n.x + x, n.y + y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        // Show attention head number
        if (n.headIdx !== undefined) {
          ctx.fillStyle = act ? '#fff' : '#666';
          ctx.font = 'bold 8px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(`H${n.headIdx}`, n.x, n.y + 2);
        }
        break;
        
      case 'lstm':
        // Diamond shape for LSTM gates
        ctx.beginPath();
        ctx.moveTo(n.x, n.y - n.r * 0.5 * p);
        ctx.lineTo(n.x + n.r * 0.5 * p, n.y);
        ctx.lineTo(n.x, n.y + n.r * 0.5 * p);
        ctx.lineTo(n.x - n.r * 0.5 * p, n.y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;
        
      case 'resnet':
        // Octagon for ResNet
        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
          const angle = (Math.PI / 4) * i;
          const x = Math.cos(angle) * n.r * 0.5 * p;
          const y = Math.sin(angle) * n.r * 0.5 * p;
          if (i === 0) ctx.moveTo(n.x + x, n.y + y);
          else ctx.lineTo(n.x + x, n.y + y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;
        
      default:
        // Circle for perceptron/MLP
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r * 0.5 * p, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
    }
    
    ctx.restore();
    
    // Draw activation ring (skip for CNN/AlexNet as they use squares)
    if (act && style !== 'cnn' && style !== 'alexnet') {
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r * 0.8, 0, Math.PI * 2);
      ctx.stroke();
    }
  });
}

export function drawPowerups(ctx: CanvasRenderingContext2D, powerups: GameState['powerups'], t: number) {
  powerups.forEach(pu => {
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
}

export function drawParticleTrail(ctx: CanvasRenderingContext2D, particleTrail: GameState['particleTrail']) {
  particleTrail.forEach(pt => {
    if (pt.life > 0) {
      ctx.fillStyle = `rgba(249,115,22,${pt.life * 0.8})`;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 2 * pt.life, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

export function drawPlayer(ctx: CanvasRenderingContext2D, player: GameState['player'], t: number) {
  const fl = Math.sin(t * 10) * 0.2 + 1;
  ctx.fillStyle = '#f97316';
  ctx.beginPath();
  ctx.moveTo(player.x, player.y - 8 * fl);
  ctx.quadraticCurveTo(player.x + 6, player.y - 2, player.x + 4, player.y + 5);
  ctx.quadraticCurveTo(player.x, player.y + 2, player.x - 4, player.y + 5);
  ctx.quadraticCurveTo(player.x - 6, player.y - 2, player.x, player.y - 8 * fl);
  ctx.fill();

  ctx.fillStyle = '#fbbf24';
  ctx.beginPath();
  ctx.moveTo(player.x, player.y - 5 * fl);
  ctx.quadraticCurveTo(player.x + 3, player.y, player.x + 2, player.y + 2);
  ctx.quadraticCurveTo(player.x, player.y + 1, player.x - 2, player.y + 2);
  ctx.quadraticCurveTo(player.x - 3, player.y, player.x, player.y - 5 * fl);
  ctx.fill();
}

export function drawErrors(ctx: CanvasRenderingContext2D, errors: Error[], invincible: boolean) {
  errors.forEach(e => {
    const flee = invincible;
    ctx.fillStyle = flee ? '#d1d5db' : ERROR_SHADES[e.shade % ERROR_SHADES.length];
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
}

export function drawPopups(ctx: CanvasRenderingContext2D, popups: GameState['popups']) {
  popups.forEach(pp => {
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
    }
  });
}

import { GameState, Connection, Neuron, Error } from '../types/gameTypes';
import { ERROR_SHADES } from '../constants/gameConstants';

export function drawConnections(ctx: CanvasRenderingContext2D, connections: Connection[], activatedNeurons: Set<string>) {
  connections.forEach(c => {
    const fk = `${Math.round(c.from.x)},${Math.round(c.from.y)}`;
    const tk = `${Math.round(c.to.x)},${Math.round(c.to.y)}`;
    const act = activatedNeurons.has(fk) && activatedNeurons.has(tk);
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
}

export function drawNeurons(ctx: CanvasRenderingContext2D, neurons: Neuron[], activatedNeurons: Set<string>, t: number) {
  neurons.forEach(n => {
    const k = `${Math.round(n.x)},${Math.round(n.y)}`;
    const act = activatedNeurons.has(k);
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

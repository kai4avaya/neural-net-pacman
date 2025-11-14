export interface Neuron {
  x: number;
  y: number;
  layer: number;
  idx: number;
  r: number;
  phase: number;
}

export interface Connection {
  from: Neuron;
  to: Neuron;
  w: number;
  skip?: boolean;
  rec?: boolean;
  att?: boolean;
}

export interface Player {
  x: number;
  y: number;
  vx: number;
  vy: number;
  speed: number;
}

export interface Error {
  x: number;
  y: number;
  vx: number;
  vy: number;
  spd: number;
  shade: number;
}

export interface Powerup {
  label: string;
  effect: 'speed' | 'points' | 'invincible' | 'double' | 'slow';
  msg: string;
  dur?: number;
  val?: number;
  x: number;
  y: number;
  r: number;
  rot: number;
}

export interface Particle {
  x: number;
  y: number;
  life: number;
}

export interface Popup {
  msg: string;
  x: number;
  y: number;
  life: number;
  vy: number;
}

export interface BoostEffects {
  spd?: boolean;
  inv?: boolean;
  dbl?: boolean;
  slw?: boolean;
}

export interface GameState {
  player: Player;
  errors: Error[];
  neurons: Neuron[];
  connections: Connection[];
  activatedNeurons: Set<string>;
  powerups: Powerup[];
  keys: Record<string, boolean>;
  particleTrail: Particle[];
  popups: Popup[];
  boostEffects: BoostEffects;
}

export interface NeuralNetArchitecture {
  year: number;
  name: string;
  desc: string;
  layers: Array<{ count: number; x: number }>;
  density: number;
  errors: number;
  recurrent?: boolean;
  skip?: boolean;
  attention?: boolean;
  visualStyle?: 'perceptron' | 'mlp' | 'cnn' | 'lstm' | 'alexnet' | 'gan' | 'resnet' | 'transformer' | 'gpt3';
  powerups?: Array<{ label: string; effect: 'speed' | 'points' | 'invincible' | 'double' | 'slow'; msg: string; dur?: number; val?: number }>;
}

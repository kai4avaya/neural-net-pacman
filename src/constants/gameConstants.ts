export const WIDTH = 700;
export const HEIGHT = 600;

export const neuralNetHistory = [
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

export const powerups = [
  { label: 'KV', effect: 'speed', msg: 'KV-Cache!', dur: 5000 },
  { label: 'Q8', effect: 'points', msg: '+50!', val: 50 },
  { label: 'FA', effect: 'invincible', msg: 'Invincible!', dur: 4000 },
  { label: 'LoRA', effect: 'double', msg: '2x Points!', dur: 6000 },
  { label: 'B32', effect: 'slow', msg: 'Slow!', dur: 5000 }
];

export const ERROR_POSITIONS = [
  { x: 550, y: 150 },
  { x: 150, y: 450 },
  { x: 550, y: 450 },
  { x: 350, y: 100 },
  { x: 350, y: 500 },
  { x: 200, y: 300 }
];

export const ERROR_SHADES = ['#1f2937', '#374151', '#4b5563', '#6b7280', '#9ca3af', '#cbd5e1'];

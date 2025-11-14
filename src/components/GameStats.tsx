import React from 'react';
import { Zap, Flame, Brain } from 'lucide-react';

interface GameStatsProps {
  level: number;
  score: number;
  lives: number;
  activatedCount: number;
  totalNeurons: number;
}

const GameStats: React.FC<GameStatsProps> = ({ level, score, lives, activatedCount, totalNeurons }) => {
  return (
    <div className="bg-white border-2 border-gray-200 p-4 rounded-lg shadow-sm mb-4">
      <div className="flex gap-8 justify-center text-gray-800">
        <span className="font-mono">Level {level}</span>
        <div className="flex items-center gap-2"><Zap className="w-5 h-5" /><span className="font-mono">{score}</span></div>
        <div className="flex items-center gap-2"><Flame className="w-5 h-5 text-orange-500" /><span className="font-mono">{lives}</span></div>
        <div className="flex items-center gap-2"><Brain className="w-5 h-5" /><span className="font-mono">{activatedCount}/{totalNeurons}</span></div>
      </div>
    </div>
  );
};

export default GameStats;

import React from 'react';
import { Flame, Brain } from 'lucide-react';
import { NeuralNetArchitecture } from '../types/gameTypes';

interface GameHeaderProps {
  arch: NeuralNetArchitecture;
}

const GameHeader: React.FC<GameHeaderProps> = ({ arch }) => {
  return (
    <div className="mb-4 text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
        <Flame className="w-8 h-8 text-orange-500" />
        Neural Net History
        <Brain className="w-8 h-8 text-gray-700" />
      </h1>
      <p className="text-gray-600 text-lg font-semibold">{arch.year} - {arch.name}</p>
      <p className="text-gray-500 text-sm">{arch.desc}</p>
    </div>
  );
};

export default GameHeader;

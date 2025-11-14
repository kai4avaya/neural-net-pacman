import React from 'react';
import { AlertCircle } from 'lucide-react';
import { NeuralNetArchitecture } from '../types/gameTypes';

interface GameOverlayProps {
  gameOver: boolean;
  gameWon: boolean;
  arch: NeuralNetArchitecture;
  score: number;
  onNextLevel: () => void;
  onRestart: () => void;
}

const GameOverlay: React.FC<GameOverlayProps> = ({ gameOver, gameWon, arch, score, onNextLevel, onRestart }) => {
  if (!gameOver && !gameWon) return null;

  return (
    <div className="absolute inset-0 bg-white bg-opacity-95 flex items-center justify-center rounded-lg">
      <div className="text-center">
        {gameWon ? (
          <>
            <h2 className="text-5xl font-bold text-gray-900 mb-4">{arch.name} Complete!</h2>
            <p className="text-gray-700 text-xl mb-2">Network activated</p>
            <p className="text-gray-900 text-2xl font-mono mb-6">Score: {score}</p>
            <button 
              onClick={onNextLevel} 
              className="bg-gray-900 hover:bg-gray-700 text-white font-bold py-3 px-8 rounded-lg"
            >
              Next Era
            </button>
          </>
        ) : (
          <>
            <AlertCircle className="w-20 h-20 text-gray-700 mx-auto mb-4" />
            <h2 className="text-5xl font-bold text-gray-900 mb-4">Training Failed</h2>
            <p className="text-gray-900 text-2xl font-mono mb-6">Score: {score}</p>
            <button 
              onClick={onRestart} 
              className="bg-gray-900 hover:bg-gray-700 text-white font-bold py-3 px-8 rounded-lg"
            >
              Restart
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default GameOverlay;

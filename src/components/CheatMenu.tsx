import React from 'react';
import { neuralNetHistory } from '../constants/gameConstants';

interface CheatMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLevel: (level: number) => void;
  currentLevel: number;
}

const CheatMenu: React.FC<CheatMenuProps> = ({ isOpen, onClose, onSelectLevel, currentLevel }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Dev Cheat Menu</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>
        <p className="text-sm text-gray-600 mb-4">Press Ctrl+L to toggle • Click a level to jump to it</p>
        <div className="grid grid-cols-1 gap-2">
          {neuralNetHistory.map((arch, index) => {
            const levelNum = index + 1;
            const isCurrent = levelNum === currentLevel;
            return (
              <button
                key={index}
                onClick={() => {
                  onSelectLevel(levelNum);
                  onClose();
                }}
                className={`text-left p-3 rounded border-2 transition-all ${
                  isCurrent
                    ? 'border-blue-500 bg-blue-50 font-bold'
                    : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-gray-600 font-mono mr-3">{arch.year}</span>
                    <span className="font-semibold">{arch.name}</span>
                    {isCurrent && <span className="ml-2 text-blue-600">(Current)</span>}
                  </div>
                  <span className="text-sm text-gray-500">Level {levelNum}</span>
                </div>
                {arch.explanation && (
                  <p className="text-xs text-gray-600 mt-1 ml-16">{arch.explanation}</p>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CheatMenu;

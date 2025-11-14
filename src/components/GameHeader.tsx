import React from 'react';
import { NeuralNetArchitecture } from '../types/gameTypes';

interface GameHeaderProps {
  arch: NeuralNetArchitecture;
}

const GameHeader: React.FC<GameHeaderProps> = ({ arch }) => {
  return (
    <div className="mb-4">
      <h1 className="text-4xl font-bold text-gray-900 mb-4 text-center">
        Neural Net History
      </h1>
      <table className="border-collapse border border-gray-800 font-mono text-sm mx-auto max-w-3xl">
        <tbody>
          <tr>
            <td className="border border-gray-800 px-4 py-2 text-right font-bold bg-gray-100" style={{ width: '80px' }}>
              {arch.year}
            </td>
            <td className="border border-gray-800 px-4 py-2 font-bold bg-gray-50" colSpan={2}>
              {arch.name}
            </td>
          </tr>
          {arch.explanation && (
            <tr>
              <td className="border border-gray-800"></td>
              <td className="border border-gray-800 px-4 py-2 text-gray-700 bg-white" colSpan={2}>
                {arch.explanation}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default GameHeader;

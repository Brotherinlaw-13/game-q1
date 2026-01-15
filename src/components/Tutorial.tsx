import { useEffect, useCallback } from 'react';
import { useGameStore } from '../hooks/useGameStore';

export const Tutorial = () => {
  const setShowTutorial = useGameStore((state) => state.setShowTutorial);

  const handleDismiss = useCallback(() => {
    setShowTutorial(false);
  }, [setShowTutorial]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handleDismiss();
      }
    },
    [handleDismiss]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const ControlKey = ({ label, wide = false }: { label: string; wide?: boolean }) => (
    <div
      className={`
        font-pixel text-sm md:text-base
        px-3 py-2
        bg-gray-800 border-2 border-gray-600
        text-white text-center
        shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)]
        ${wide ? 'min-w-[80px]' : 'min-w-[40px]'}
      `}
    >
      {label}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
      <div className="bg-game-dark border-4 border-gray-700 p-8 md:p-12 max-w-4xl w-full">
        {/* Title */}
        <h1 className="font-pixel text-3xl md:text-4xl text-white text-shadow-pixel text-center mb-8">
          CONTROLS
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {/* Player 1 Controls */}
          <div className="space-y-6">
            <h2 className="font-pixel text-2xl text-game-red text-shadow-pixel text-center">
              PLAYER 1
            </h2>

            {/* Movement */}
            <div className="space-y-2">
              <h3 className="font-pixel text-sm text-gray-400 text-center">MOVEMENT</h3>
              <div className="flex flex-col items-center gap-1">
                <ControlKey label="W" />
                <div className="flex gap-1">
                  <ControlKey label="A" />
                  <ControlKey label="S" />
                  <ControlKey label="D" />
                </div>
              </div>
            </div>

            {/* Attacks */}
            <div className="space-y-2">
              <h3 className="font-pixel text-sm text-gray-400 text-center">ATTACKS</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col items-center gap-1">
                  <ControlKey label="T" />
                  <span className="font-pixel text-xs text-game-red">HIGH PUNCH</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <ControlKey label="Y" />
                  <span className="font-pixel text-xs text-game-red">LOW PUNCH</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <ControlKey label="G" />
                  <span className="font-pixel text-xs text-game-red">HIGH KICK</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <ControlKey label="H" />
                  <span className="font-pixel text-xs text-game-red">LOW KICK</span>
                </div>
              </div>
            </div>
          </div>

          {/* Player 2 Controls */}
          <div className="space-y-6">
            <h2 className="font-pixel text-2xl text-game-blue text-shadow-pixel text-center">
              PLAYER 2
            </h2>

            {/* Movement */}
            <div className="space-y-2">
              <h3 className="font-pixel text-sm text-gray-400 text-center">MOVEMENT</h3>
              <div className="flex flex-col items-center gap-1">
                <ControlKey label="UP" wide />
                <div className="flex gap-1">
                  <ControlKey label="LEFT" wide />
                  <ControlKey label="DOWN" wide />
                  <ControlKey label="RIGHT" wide />
                </div>
              </div>
            </div>

            {/* Attacks */}
            <div className="space-y-2">
              <h3 className="font-pixel text-sm text-gray-400 text-center">ATTACKS</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col items-center gap-1">
                  <ControlKey label="U" />
                  <span className="font-pixel text-xs text-game-blue">HIGH PUNCH</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <ControlKey label="I" />
                  <span className="font-pixel text-xs text-game-blue">LOW PUNCH</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <ControlKey label="J" />
                  <span className="font-pixel text-xs text-game-blue">HIGH KICK</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <ControlKey label="K" />
                  <span className="font-pixel text-xs text-game-blue">LOW KICK</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-1 bg-gradient-to-r from-game-red via-gray-600 to-game-blue my-8" />

        {/* Start button */}
        <button
          onClick={handleDismiss}
          className="
            w-full font-pixel text-2xl md:text-3xl text-white
            py-4 border-4 border-yellow-500 bg-yellow-500/20
            hover:bg-yellow-500 hover:text-black
            transition-all duration-150
            animate-pulse
          "
        >
          PRESS SPACE TO FIGHT!
        </button>
      </div>
    </div>
  );
};

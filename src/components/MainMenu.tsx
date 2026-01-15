import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../hooks/useGameStore';

export const MainMenu = () => {
  const navigate = useNavigate();
  const setGameMode = useGameStore((state) => state.setGameMode);

  const handleLocalPlay = () => {
    setGameMode('local');
    navigate('/character-select');
  };

  const handleOnlinePlay = () => {
    navigate('/lobby');
  };

  return (
    <div className="min-h-screen bg-game-dark flex flex-col items-center justify-center">
      {/* Scanline overlay effect */}
      <div className="fixed inset-0 pointer-events-none bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.1)_2px,rgba(0,0,0,0.1)_4px)]" />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center gap-16">
        {/* Title */}
        <div className="text-center">
          <h1 className="font-pixel text-6xl md:text-8xl text-game-red text-shadow-pixel tracking-wider">
            HIRESPACE
          </h1>
          <h2 className="font-pixel text-4xl md:text-6xl text-game-blue text-shadow-pixel tracking-widest mt-4">
            FIGHTERS
          </h2>
        </div>

        {/* Decorative pixel border */}
        <div className="w-64 h-1 bg-gradient-to-r from-transparent via-game-red to-transparent" />

        {/* Menu buttons */}
        <div className="flex flex-col gap-6">
          <button
            onClick={handleLocalPlay}
            className="font-pixel text-2xl md:text-3xl text-white px-12 py-4
                       border-4 border-game-red bg-game-dark
                       hover:bg-game-red hover:text-game-dark
                       transition-all duration-150 ease-in-out
                       shadow-[4px_4px_0px_0px_rgba(230,57,70,0.5)]
                       hover:shadow-[2px_2px_0px_0px_rgba(230,57,70,0.8)]
                       active:shadow-none active:translate-x-1 active:translate-y-1"
          >
            LOCAL PLAY
          </button>

          <button
            onClick={handleOnlinePlay}
            className="font-pixel text-2xl md:text-3xl text-white px-12 py-4
                       border-4 border-game-blue bg-game-dark
                       hover:bg-game-blue hover:text-game-dark
                       transition-all duration-150 ease-in-out
                       shadow-[4px_4px_0px_0px_rgba(69,123,157,0.5)]
                       hover:shadow-[2px_2px_0px_0px_rgba(69,123,157,0.8)]
                       active:shadow-none active:translate-x-1 active:translate-y-1"
          >
            ONLINE PLAY
          </button>
        </div>

        {/* Footer text */}
        <p className="font-pixel text-sm text-gray-500 mt-8">
          PRESS START TO BEGIN
        </p>
      </div>

      {/* Corner decorations */}
      <div className="fixed top-4 left-4 w-8 h-8 border-l-4 border-t-4 border-game-red opacity-50" />
      <div className="fixed top-4 right-4 w-8 h-8 border-r-4 border-t-4 border-game-blue opacity-50" />
      <div className="fixed bottom-4 left-4 w-8 h-8 border-l-4 border-b-4 border-game-blue opacity-50" />
      <div className="fixed bottom-4 right-4 w-8 h-8 border-r-4 border-b-4 border-game-red opacity-50" />
    </div>
  );
};

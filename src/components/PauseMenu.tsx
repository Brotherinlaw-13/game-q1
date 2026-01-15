import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../hooks/useGameStore';

export default function PauseMenu() {
  const navigate = useNavigate();
  const setPaused = useGameStore((state) => state.setPaused);

  const handleResume = () => {
    setPaused(false);
  };

  const handleQuit = () => {
    setPaused(false);
    navigate('/');
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center">
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Menu container */}
      <div className="relative z-10 flex flex-col items-center gap-8 p-12 bg-gray-900/90 border-4 border-yellow-500 rounded-lg shadow-2xl">
        {/* Title */}
        <h2
          className="text-4xl font-bold text-yellow-400 tracking-widest"
          style={{
            fontFamily: '"Press Start 2P", "Courier New", monospace',
            textShadow: '0 0 20px rgba(250, 204, 21, 0.5)',
          }}
        >
          PAUSED
        </h2>

        {/* Decorative line */}
        <div className="w-full h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent" />

        {/* Menu buttons */}
        <div className="flex flex-col gap-4 w-full">
          <button
            onClick={handleResume}
            className="
              px-8 py-4
              bg-green-600 hover:bg-green-500
              border-2 border-green-400
              text-white text-xl font-bold uppercase tracking-wider
              rounded
              transition-all duration-150
              hover:scale-105 hover:shadow-lg hover:shadow-green-500/50
              active:scale-95
            "
          >
            Resume
          </button>

          <button
            onClick={handleQuit}
            className="
              px-8 py-4
              bg-red-600 hover:bg-red-500
              border-2 border-red-400
              text-white text-xl font-bold uppercase tracking-wider
              rounded
              transition-all duration-150
              hover:scale-105 hover:shadow-lg hover:shadow-red-500/50
              active:scale-95
            "
          >
            Quit
          </button>
        </div>

        {/* Instructions */}
        <p className="text-gray-500 text-sm">Press ESC to resume</p>
      </div>
    </div>
  );
}

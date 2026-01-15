interface VictoryScreenProps {
  winner: 1 | 2;
  onRematch: () => void;
  onQuit: () => void;
}

export default function VictoryScreen({
  winner,
  onRematch,
  onQuit,
}: VictoryScreenProps) {
  const isPlayer1 = winner === 1;
  const winnerColor = isPlayer1 ? 'text-red-500' : 'text-blue-500';
  const glowColor = isPlayer1
    ? 'shadow-red-500/50'
    : 'shadow-blue-500/50';
  const borderColor = isPlayer1 ? 'border-red-500' : 'border-blue-500';

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-black/90">
        {/* Celebration particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className={`
                absolute w-2 h-2 rounded-full
                ${isPlayer1 ? 'bg-red-500' : 'bg-blue-500'}
                animate-ping
              `}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random()}s`,
              }}
            />
          ))}
        </div>

        {/* Radial gradient spotlight */}
        <div
          className="absolute inset-0"
          style={{
            background: isPlayer1
              ? 'radial-gradient(circle at center, rgba(239, 68, 68, 0.2) 0%, transparent 70%)'
              : 'radial-gradient(circle at center, rgba(59, 130, 246, 0.2) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* Victory content */}
      <div
        className={`
          relative z-10 flex flex-col items-center gap-8 p-16
          bg-gray-900/80 border-4 ${borderColor}
          rounded-lg shadow-2xl ${glowColor}
        `}
      >
        {/* Victory text */}
        <div className="flex flex-col items-center gap-2">
          <span
            className={`text-6xl font-bold ${winnerColor} tracking-wider animate-pulse`}
            style={{
              fontFamily: '"Press Start 2P", "Courier New", monospace',
              textShadow: isPlayer1
                ? '0 0 30px rgba(239, 68, 68, 0.8), 0 0 60px rgba(239, 68, 68, 0.4)'
                : '0 0 30px rgba(59, 130, 246, 0.8), 0 0 60px rgba(59, 130, 246, 0.4)',
            }}
          >
            PLAYER {winner}
          </span>
          <span
            className="text-4xl font-bold text-yellow-400 tracking-widest"
            style={{
              fontFamily: '"Press Start 2P", "Courier New", monospace',
              textShadow: '0 0 20px rgba(250, 204, 21, 0.6)',
            }}
          >
            WINS!
          </span>
        </div>

        {/* Trophy icon */}
        <div className="text-8xl animate-bounce">
          <span
            role="img"
            aria-label="trophy"
            style={{
              filter: 'drop-shadow(0 0 20px rgba(250, 204, 21, 0.8))',
            }}
          >
            *
          </span>
        </div>

        {/* Decorative line */}
        <div
          className={`
            w-full h-1
            ${isPlayer1 ? 'bg-gradient-to-r from-transparent via-red-500 to-transparent' : 'bg-gradient-to-r from-transparent via-blue-500 to-transparent'}
          `}
        />

        {/* Action buttons */}
        <div className="flex gap-6">
          <button
            onClick={onRematch}
            className="
              px-10 py-5
              bg-green-600 hover:bg-green-500
              border-2 border-green-400
              text-white text-2xl font-bold uppercase tracking-wider
              rounded
              transition-all duration-150
              hover:scale-110 hover:shadow-lg hover:shadow-green-500/50
              active:scale-95
            "
          >
            Rematch
          </button>

          <button
            onClick={onQuit}
            className="
              px-10 py-5
              bg-gray-600 hover:bg-gray-500
              border-2 border-gray-400
              text-white text-2xl font-bold uppercase tracking-wider
              rounded
              transition-all duration-150
              hover:scale-110 hover:shadow-lg hover:shadow-gray-500/50
              active:scale-95
            "
          >
            Quit
          </button>
        </div>
      </div>
    </div>
  );
}

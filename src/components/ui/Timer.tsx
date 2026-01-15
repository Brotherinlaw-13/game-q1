import { useMemo } from 'react';

interface TimerProps {
  time: number;
}

export default function Timer({ time }: TimerProps) {
  const isLow = time < 10;
  const displayTime = useMemo(() => {
    return Math.max(0, Math.ceil(time)).toString().padStart(2, '0');
  }, [time]);

  return (
    <div className="flex flex-col items-center">
      {/* Timer container */}
      <div
        className={`
          relative px-6 py-3
          bg-gray-900 border-4
          ${isLow ? 'border-red-500 animate-pulse' : 'border-yellow-500'}
          rounded-lg shadow-2xl
        `}
      >
        {/* Decorative corners */}
        <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-yellow-400" />
        <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-yellow-400" />
        <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-yellow-400" />
        <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-yellow-400" />

        {/* Timer display */}
        <span
          className={`
            text-5xl font-bold tracking-widest
            ${isLow ? 'text-red-500 animate-pulse' : 'text-yellow-400'}
            drop-shadow-lg
          `}
          style={{
            fontFamily: '"Press Start 2P", "Courier New", monospace',
            textShadow: isLow
              ? '0 0 20px rgba(239, 68, 68, 0.8), 0 0 40px rgba(239, 68, 68, 0.4)'
              : '0 0 10px rgba(250, 204, 21, 0.5)',
          }}
        >
          {displayTime}
        </span>
      </div>

      {/* "TIME" label */}
      <span
        className={`
          mt-1 text-xs font-bold uppercase tracking-[0.3em]
          ${isLow ? 'text-red-400' : 'text-gray-500'}
        `}
      >
        TIME
      </span>
    </div>
  );
}

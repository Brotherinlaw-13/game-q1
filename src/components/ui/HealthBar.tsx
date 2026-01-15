import { useMemo } from 'react';

interface HealthBarProps {
  player: 1 | 2;
  health: number;
  maxHealth: number;
  name: string;
  roundsWon: number;
}

export default function HealthBar({
  player,
  health,
  maxHealth,
  name,
  roundsWon,
}: HealthBarProps) {
  const healthPercentage = useMemo(() => {
    return Math.max(0, Math.min(100, (health / maxHealth) * 100));
  }, [health, maxHealth]);

  const isPlayer1 = player === 1;
  const barColor = isPlayer1 ? 'bg-red-500' : 'bg-blue-500';
  const barGlow = isPlayer1 ? 'shadow-red-500/50' : 'shadow-blue-500/50';

  // Determine health color based on remaining health
  const healthColor = useMemo(() => {
    if (healthPercentage > 50) return barColor;
    if (healthPercentage > 25) return 'bg-yellow-500';
    return 'bg-orange-600';
  }, [healthPercentage, barColor]);

  return (
    <div
      className={`flex flex-col ${isPlayer1 ? 'items-start' : 'items-end'} w-[400px]`}
    >
      {/* Player name and rounds */}
      <div
        className={`flex items-center gap-3 mb-1 ${isPlayer1 ? 'flex-row' : 'flex-row-reverse'}`}
      >
        <span
          className={`text-lg font-bold uppercase tracking-wider ${isPlayer1 ? 'text-red-400' : 'text-blue-400'}`}
        >
          {name}
        </span>
        {/* Round win indicators */}
        <div className="flex gap-1">
          {[0, 1].map((i) => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${
                i < roundsWon
                  ? `${isPlayer1 ? 'bg-red-500 border-red-400' : 'bg-blue-500 border-blue-400'} shadow-lg ${barGlow}`
                  : 'bg-transparent border-gray-600'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Health bar container */}
      <div className="relative w-full h-8 bg-gray-900 border-2 border-gray-700 rounded overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-20">
          <div
            className="w-full h-full"
            style={{
              backgroundImage:
                'repeating-linear-gradient(90deg, transparent, transparent 10px, rgba(0,0,0,0.3) 10px, rgba(0,0,0,0.3) 11px)',
            }}
          />
        </div>

        {/* Health bar fill */}
        <div
          className={`absolute top-0 bottom-0 ${healthColor} transition-all duration-200 ease-out shadow-lg ${barGlow}`}
          style={{
            width: `${healthPercentage}%`,
            // P1: depletes from right to left (starts at left)
            // P2: depletes from left to right (starts at right)
            left: isPlayer1 ? '0' : 'auto',
            right: isPlayer1 ? 'auto' : '0',
          }}
        >
          {/* Inner glow effect */}
          <div
            className={`absolute inset-0 bg-gradient-to-b from-white/30 to-transparent`}
          />
        </div>

        {/* Health text */}
        <div
          className={`absolute inset-0 flex items-center ${isPlayer1 ? 'justify-start pl-2' : 'justify-end pr-2'}`}
        >
          <span className="text-white text-sm font-bold drop-shadow-lg">
            {Math.ceil(health)}
          </span>
        </div>

        {/* Damage flash overlay (visible when health is low) */}
        {healthPercentage < 25 && (
          <div className="absolute inset-0 animate-pulse bg-red-900/30" />
        )}
      </div>
    </div>
  );
}

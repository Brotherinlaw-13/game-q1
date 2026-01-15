import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../hooks/useGameStore';
import { EventBus, GameEvents } from '../game/EventBus';
import { GAME_CONFIG, CHARACTER_INFO } from '../constants/gameConstants';
import GameCanvas from './GameCanvas';
import HealthBar from './ui/HealthBar';
import Timer from './ui/Timer';
import PauseMenu from './PauseMenu';
import VictoryScreen from './VictoryScreen';

export default function GameScreen() {
  const navigate = useNavigate();

  // Store state
  const isPaused = useGameStore((state) => state.isPaused);
  const setPaused = useGameStore((state) => state.setPaused);
  const showTutorial = useGameStore((state) => state.showTutorial);
  const setShowTutorial = useGameStore((state) => state.setShowTutorial);
  const gameState = useGameStore((state) => state.gameState);
  const player1Character = useGameStore((state) => state.player1Character);
  const player2Character = useGameStore((state) => state.player2Character);
  const resetGame = useGameStore((state) => state.resetGame);
  const updateHealth = useGameStore((state) => state.updateHealth);

  // Local UI state
  const [timer, setTimer] = useState(GAME_CONFIG.ROUND_TIME);
  const [matchWinner, setMatchWinner] = useState<1 | 2 | null>(null);

  // Get player names from character info
  const player1Name = player1Character
    ? CHARACTER_INFO[player1Character]?.name || 'P1'
    : 'P1';
  const player2Name = player2Character
    ? CHARACTER_INFO[player2Character]?.name || 'P2'
    : 'P2';

  // Handle ESC key for pause toggle
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !matchWinner) {
        setPaused(!isPaused);
        // Emit event to Phaser game
        EventBus.emit(isPaused ? GameEvents.GAME_RESUME : GameEvents.GAME_PAUSE);
      }
    },
    [isPaused, setPaused, matchWinner]
  );

  // Set up keyboard listener
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // Listen to EventBus for game updates
  useEffect(() => {
    const handleHealthUpdate = (player: 1 | 2, health: number) => {
      updateHealth(player, health);
    };

    const handleTimerUpdate = (time: number) => {
      setTimer(time);
    };

    const handleMatchEnd = (winner: 1 | 2) => {
      setMatchWinner(winner);
    };

    EventBus.on(GameEvents.HEALTH_UPDATE, handleHealthUpdate as (...args: unknown[]) => void);
    EventBus.on(GameEvents.TIMER_UPDATE, handleTimerUpdate as (...args: unknown[]) => void);
    EventBus.on(GameEvents.MATCH_END, handleMatchEnd as (...args: unknown[]) => void);

    return () => {
      EventBus.off(GameEvents.HEALTH_UPDATE, handleHealthUpdate as (...args: unknown[]) => void);
      EventBus.off(GameEvents.TIMER_UPDATE, handleTimerUpdate as (...args: unknown[]) => void);
      EventBus.off(GameEvents.MATCH_END, handleMatchEnd as (...args: unknown[]) => void);
    };
  }, [updateHealth]);

  // Handle rematch
  const handleRematch = () => {
    setMatchWinner(null);
    setTimer(GAME_CONFIG.ROUND_TIME);
    resetGame();
    EventBus.emit(GameEvents.ROUND_START);
  };

  // Handle quit
  const handleQuit = () => {
    navigate('/');
  };

  // Dismiss tutorial
  const handleDismissTutorial = () => {
    setShowTutorial(false);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* Game Canvas - Phaser renders here */}
      <GameCanvas />

      {/* HUD Overlay */}
      <div className="absolute top-0 left-0 right-0 z-10 pointer-events-none">
        <div className="flex items-start justify-between p-4">
          {/* Player 1 Health Bar */}
          <HealthBar
            player={1}
            health={gameState?.player1.health ?? GAME_CONFIG.MAX_HEALTH}
            maxHealth={GAME_CONFIG.MAX_HEALTH}
            name={player1Name}
            roundsWon={gameState?.player1.roundsWon ?? 0}
          />

          {/* Timer */}
          <Timer time={timer} />

          {/* Player 2 Health Bar */}
          <HealthBar
            player={2}
            health={gameState?.player2.health ?? GAME_CONFIG.MAX_HEALTH}
            maxHealth={GAME_CONFIG.MAX_HEALTH}
            name={player2Name}
            roundsWon={gameState?.player2.roundsWon ?? 0}
          />
        </div>
      </div>

      {/* Tutorial Overlay */}
      {showTutorial && (
        <div className="absolute inset-0 z-40 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70" />
          <div className="relative z-10 max-w-2xl p-8 bg-gray-900/95 border-2 border-yellow-500 rounded-lg shadow-2xl">
            <h2 className="text-2xl font-bold text-yellow-400 mb-6 text-center tracking-wider">
              CONTROLS
            </h2>

            <div className="grid grid-cols-2 gap-8 mb-6">
              {/* Player 1 Controls */}
              <div className="space-y-2">
                <h3 className="text-red-400 font-bold text-lg mb-3">PLAYER 1</h3>
                <div className="space-y-1 text-gray-300 text-sm">
                  <p><span className="text-white font-mono bg-gray-700 px-2 py-0.5 rounded">W A S D</span> - Move</p>
                  <p><span className="text-white font-mono bg-gray-700 px-2 py-0.5 rounded">T</span> - High Punch</p>
                  <p><span className="text-white font-mono bg-gray-700 px-2 py-0.5 rounded">Y</span> - Low Punch</p>
                  <p><span className="text-white font-mono bg-gray-700 px-2 py-0.5 rounded">G</span> - High Kick</p>
                  <p><span className="text-white font-mono bg-gray-700 px-2 py-0.5 rounded">H</span> - Low Kick</p>
                </div>
              </div>

              {/* Player 2 Controls */}
              <div className="space-y-2">
                <h3 className="text-blue-400 font-bold text-lg mb-3">PLAYER 2</h3>
                <div className="space-y-1 text-gray-300 text-sm">
                  <p><span className="text-white font-mono bg-gray-700 px-2 py-0.5 rounded">Arrows</span> - Move</p>
                  <p><span className="text-white font-mono bg-gray-700 px-2 py-0.5 rounded">U</span> - High Punch</p>
                  <p><span className="text-white font-mono bg-gray-700 px-2 py-0.5 rounded">I</span> - Low Punch</p>
                  <p><span className="text-white font-mono bg-gray-700 px-2 py-0.5 rounded">J</span> - High Kick</p>
                  <p><span className="text-white font-mono bg-gray-700 px-2 py-0.5 rounded">K</span> - Low Kick</p>
                </div>
              </div>
            </div>

            <div className="text-center text-gray-400 text-sm mb-6">
              <p>Hold <span className="text-white font-mono bg-gray-700 px-2 py-0.5 rounded">Back</span> while getting hit to block</p>
              <p className="mt-2">Press <span className="text-white font-mono bg-gray-700 px-2 py-0.5 rounded">ESC</span> to pause</p>
            </div>

            <button
              onClick={handleDismissTutorial}
              className="
                w-full px-6 py-3
                bg-yellow-600 hover:bg-yellow-500
                border-2 border-yellow-400
                text-white text-lg font-bold uppercase tracking-wider
                rounded
                transition-all duration-150
                hover:scale-105 hover:shadow-lg hover:shadow-yellow-500/50
                active:scale-95
              "
            >
              FIGHT!
            </button>
          </div>
        </div>
      )}

      {/* Pause Menu */}
      {isPaused && !matchWinner && <PauseMenu />}

      {/* Victory Screen */}
      {matchWinner && (
        <VictoryScreen
          winner={matchWinner}
          onRematch={handleRematch}
          onQuit={handleQuit}
        />
      )}
    </div>
  );
}

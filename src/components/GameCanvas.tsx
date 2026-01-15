import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { phaserConfig } from '../game/config';

export default function GameCanvas() {
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only create game if container exists and game hasn't been created
    if (containerRef.current && !gameRef.current) {
      // Create the Phaser game instance with the config
      gameRef.current = new Phaser.Game({
        ...phaserConfig,
        parent: 'game-container',
      });
    }

    // Cleanup on unmount
    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  return (
    <div
      id="game-container"
      ref={containerRef}
      className="w-full h-full flex items-center justify-center bg-black"
    />
  );
}

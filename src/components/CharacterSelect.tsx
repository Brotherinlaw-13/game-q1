import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../hooks/useGameStore';
import { CHARACTER_INFO } from '../constants/gameConstants';
import type { CharacterId } from '../types/game.types';

const CHARACTERS: CharacterId[] = ['will', 'ed'];

export const CharacterSelect = () => {
  const navigate = useNavigate();
  const gameMode = useGameStore((state) => state.gameMode);
  const setPlayer1Character = useGameStore((state) => state.setPlayer1Character);
  const setPlayer2Character = useGameStore((state) => state.setPlayer2Character);

  const [p1Selection, setP1Selection] = useState<number>(0);
  const [p2Selection, setP2Selection] = useState<number>(1);
  const [p1Confirmed, setP1Confirmed] = useState(false);
  const [p2Confirmed, setP2Confirmed] = useState(false);

  const isLocalMode = gameMode === 'local';

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // P1 Controls: A/D to navigate, W to confirm
      if (!p1Confirmed) {
        if (e.code === 'KeyA') {
          setP1Selection((prev) => (prev - 1 + CHARACTERS.length) % CHARACTERS.length);
        } else if (e.code === 'KeyD') {
          setP1Selection((prev) => (prev + 1) % CHARACTERS.length);
        } else if (e.code === 'KeyW') {
          setP1Confirmed(true);
        }
      }

      // P2 Controls (local mode only): Arrow Left/Right to navigate, Arrow Up to confirm
      if (isLocalMode && !p2Confirmed) {
        if (e.code === 'ArrowLeft') {
          setP2Selection((prev) => (prev - 1 + CHARACTERS.length) % CHARACTERS.length);
        } else if (e.code === 'ArrowRight') {
          setP2Selection((prev) => (prev + 1) % CHARACTERS.length);
        } else if (e.code === 'ArrowUp') {
          setP2Confirmed(true);
        }
      }

      // Back to menu with Escape
      if (e.code === 'Escape') {
        navigate('/');
      }
    },
    [p1Confirmed, p2Confirmed, isLocalMode, navigate]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // When both players have confirmed, proceed to game
  useEffect(() => {
    if (p1Confirmed && (p2Confirmed || !isLocalMode)) {
      const p1Char = CHARACTERS[p1Selection];
      const p2Char = isLocalMode ? CHARACTERS[p2Selection] : CHARACTERS[p2Selection];

      setPlayer1Character(p1Char);
      setPlayer2Character(p2Char);

      // Small delay for visual feedback
      const timer = setTimeout(() => {
        navigate('/game');
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [p1Confirmed, p2Confirmed, isLocalMode, p1Selection, p2Selection, setPlayer1Character, setPlayer2Character, navigate]);

  const renderCharacterCard = (
    characterId: CharacterId,
    index: number,
    isP1Selected: boolean,
    isP2Selected: boolean
  ) => {
    const character = CHARACTER_INFO[characterId];
    const isP1Hovering = p1Selection === index && !p1Confirmed;
    const isP2Hovering = p2Selection === index && !p2Confirmed && isLocalMode;
    const isP1Locked = p1Selection === index && p1Confirmed;
    const isP2Locked = p2Selection === index && p2Confirmed && isLocalMode;

    return (
      <div
        key={characterId}
        className={`
          relative flex flex-col items-center p-6
          border-4 transition-all duration-150
          ${isP1Hovering || isP2Hovering ? 'scale-105' : 'scale-100'}
          ${isP1Locked || isP2Locked ? 'scale-110' : ''}
        `}
        style={{
          borderColor: isP1Selected || isP2Selected ? character.color : '#333',
          backgroundColor: isP1Locked || isP2Locked ? `${character.color}20` : 'transparent',
        }}
      >
        {/* Player labels */}
        <div className="absolute -top-8 left-0 right-0 flex justify-between px-2">
          {isP1Selected && (
            <span
              className={`font-pixel text-lg ${p1Confirmed ? 'animate-pulse' : ''}`}
              style={{ color: '#e63946' }}
            >
              P1
            </span>
          )}
          {isP2Selected && isLocalMode && (
            <span
              className={`font-pixel text-lg ml-auto ${p2Confirmed ? 'animate-pulse' : ''}`}
              style={{ color: '#457b9d' }}
            >
              P2
            </span>
          )}
        </div>

        {/* Character portrait placeholder */}
        <div
          className="w-32 h-40 md:w-48 md:h-56 mb-4 flex items-center justify-center border-2"
          style={{ borderColor: character.color, backgroundColor: `${character.color}30` }}
        >
          <span
            className="font-pixel text-6xl md:text-8xl"
            style={{ color: character.color }}
          >
            {character.name[0]}
          </span>
        </div>

        {/* Character name */}
        <h3
          className="font-pixel text-2xl md:text-3xl text-shadow-pixel"
          style={{ color: character.color }}
        >
          {character.name.toUpperCase()}
        </h3>

        {/* Character description */}
        <p className="font-pixel text-xs md:text-sm text-gray-400 mt-2 text-center max-w-[200px]">
          {character.description}
        </p>

        {/* Locked indicator */}
        {(isP1Locked || isP2Locked) && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <span className="font-pixel text-xl text-white animate-bounce">LOCKED!</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-game-dark flex flex-col items-center justify-center p-8">
      {/* Title */}
      <h1 className="font-pixel text-4xl md:text-5xl text-white text-shadow-pixel mb-12">
        SELECT YOUR FIGHTER
      </h1>

      {/* Character grid */}
      <div className="flex gap-8 md:gap-16 mb-12">
        {CHARACTERS.map((characterId, index) =>
          renderCharacterCard(
            characterId,
            index,
            p1Selection === index,
            p2Selection === index
          )
        )}
      </div>

      {/* Controls hint */}
      <div className="flex flex-col md:flex-row gap-8 text-center">
        <div className="font-pixel text-sm">
          <span className="text-game-red">P1:</span>
          <span className="text-gray-400"> A/D = SELECT | W = CONFIRM</span>
          {p1Confirmed && <span className="text-green-500 ml-2">READY!</span>}
        </div>
        {isLocalMode && (
          <div className="font-pixel text-sm">
            <span className="text-game-blue">P2:</span>
            <span className="text-gray-400"> LEFT/RIGHT = SELECT | UP = CONFIRM</span>
            {p2Confirmed && <span className="text-green-500 ml-2">READY!</span>}
          </div>
        )}
      </div>

      {/* Back hint */}
      <p className="font-pixel text-xs text-gray-600 mt-8">PRESS ESC TO GO BACK</p>
    </div>
  );
};

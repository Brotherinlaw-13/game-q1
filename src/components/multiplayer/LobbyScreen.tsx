import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../../hooks/useGameStore';

const generateRoomCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export const LobbyScreen = () => {
  const navigate = useNavigate();
  const setGameMode = useGameStore((state) => state.setGameMode);
  const setRoomCode = useGameStore((state) => state.setRoomCode);

  const [createdRoomCode, setCreatedRoomCode] = useState<string | null>(null);
  const [joinCode, setJoinCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateRoom = useCallback(() => {
    setIsCreating(true);
    setError(null);

    // Generate room code
    const code = generateRoomCode();
    setCreatedRoomCode(code);
    setRoomCode(code);
    setGameMode('online-host');

    // P2P connection will be established here later
    // For now, just display the code
  }, [setGameMode, setRoomCode]);

  const handleJoinRoom = useCallback(() => {
    if (joinCode.length !== 6) {
      setError('Room code must be 6 characters');
      return;
    }

    setIsJoining(true);
    setError(null);
    setRoomCode(joinCode.toUpperCase());
    setGameMode('online-guest');

    // P2P connection will be established here later
    // For now, just log the attempt
    console.log('Attempting to join room:', joinCode.toUpperCase());
  }, [joinCode, setGameMode, setRoomCode]);

  const handleBack = useCallback(() => {
    setGameMode(null);
    setRoomCode(null);
    navigate('/');
  }, [navigate, setGameMode, setRoomCode]);

  const handleCopyCode = useCallback(() => {
    if (createdRoomCode) {
      navigator.clipboard.writeText(createdRoomCode);
    }
  }, [createdRoomCode]);

  return (
    <div className="min-h-screen bg-game-dark flex flex-col items-center justify-center p-8">
      {/* Title */}
      <h1 className="font-pixel text-4xl md:text-5xl text-white text-shadow-pixel mb-12">
        ONLINE LOBBY
      </h1>

      <div className="w-full max-w-md space-y-8">
        {/* Create Room Section */}
        {!createdRoomCode ? (
          <div className="space-y-4">
            <button
              onClick={handleCreateRoom}
              disabled={isCreating}
              className="
                w-full font-pixel text-xl md:text-2xl text-white
                px-8 py-4 border-4 border-game-red bg-game-dark
                hover:bg-game-red hover:text-game-dark
                transition-all duration-150
                shadow-[4px_4px_0px_0px_rgba(230,57,70,0.5)]
                hover:shadow-[2px_2px_0px_0px_rgba(230,57,70,0.8)]
                active:shadow-none active:translate-x-1 active:translate-y-1
                disabled:opacity-50 disabled:cursor-not-allowed
              "
            >
              CREATE ROOM
            </button>
          </div>
        ) : (
          <div className="space-y-4 p-6 border-4 border-game-red bg-game-red/10">
            <p className="font-pixel text-lg text-gray-400 text-center">YOUR ROOM CODE:</p>
            <div className="flex items-center justify-center gap-4">
              <span className="font-pixel text-4xl md:text-5xl text-game-red tracking-widest">
                {createdRoomCode}
              </span>
              <button
                onClick={handleCopyCode}
                className="font-pixel text-sm text-gray-400 hover:text-white border-2 border-gray-600 px-2 py-1"
              >
                COPY
              </button>
            </div>
            <p className="font-pixel text-sm text-gray-500 text-center">
              SHARE THIS CODE WITH YOUR OPPONENT
            </p>
            <p className="font-pixel text-xs text-yellow-500 text-center animate-pulse">
              WAITING FOR OPPONENT...
            </p>
          </div>
        )}

        {/* Divider */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-0.5 bg-gray-700" />
          <span className="font-pixel text-gray-500">OR</span>
          <div className="flex-1 h-0.5 bg-gray-700" />
        </div>

        {/* Join Room Section */}
        <div className="space-y-4">
          <p className="font-pixel text-lg text-gray-400 text-center">JOIN A ROOM</p>
          <input
            type="text"
            value={joinCode}
            onChange={(e) => {
              setJoinCode(e.target.value.toUpperCase().slice(0, 6));
              setError(null);
            }}
            placeholder="ENTER CODE"
            maxLength={6}
            className="
              w-full font-pixel text-2xl text-center text-white
              px-4 py-4 bg-gray-900 border-4 border-gray-700
              focus:border-game-blue focus:outline-none
              placeholder:text-gray-600 tracking-widest
              uppercase
            "
          />
          <button
            onClick={handleJoinRoom}
            disabled={isJoining || joinCode.length !== 6}
            className="
              w-full font-pixel text-xl md:text-2xl text-white
              px-8 py-4 border-4 border-game-blue bg-game-dark
              hover:bg-game-blue hover:text-game-dark
              transition-all duration-150
              shadow-[4px_4px_0px_0px_rgba(69,123,157,0.5)]
              hover:shadow-[2px_2px_0px_0px_rgba(69,123,157,0.8)]
              active:shadow-none active:translate-x-1 active:translate-y-1
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            JOIN ROOM
          </button>
        </div>

        {/* Error message */}
        {error && (
          <p className="font-pixel text-sm text-red-500 text-center">{error}</p>
        )}

        {/* Back button */}
        <button
          onClick={handleBack}
          className="
            w-full font-pixel text-lg text-gray-500
            px-8 py-3 border-2 border-gray-700 bg-transparent
            hover:border-gray-500 hover:text-white
            transition-all duration-150
          "
        >
          BACK
        </button>
      </div>

      {/* Connection status indicator */}
      <div className="fixed bottom-4 right-4 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
        <span className="font-pixel text-xs text-gray-500">P2P READY</span>
      </div>
    </div>
  );
};

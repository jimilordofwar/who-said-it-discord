import { Player } from '../types/game';
import { PlayerCard } from './PlayerCard';
import { PlayerCardSkeleton } from './PlayerCardSkeleton';
import { MIN_PLAYERS } from '../config';

interface LobbyProps {
  players: Player[];
  isHost: boolean;
  onStartGame: () => void;
  currentUserId?: string;
  isLoading?: boolean;
}

export function Lobby({ players, isHost, onStartGame, currentUserId, isLoading = false }: LobbyProps) {
  const playerCount = players.length;
  const hasEnoughPlayers = playerCount >= MIN_PLAYERS;

  return (
    <div className="flex flex-col items-center justify-center min-h-full p-6">
      <h1 className="text-2xl font-bold text-white mb-2">Game Lobby</h1>

      {isLoading ? (
        <p className="text-discord-muted mb-6">Loading players...</p>
      ) : (
        <p className="text-discord-lighter mb-6">
          {hasEnoughPlayers ? (
            <span className="text-green-400">{playerCount}/{MIN_PLAYERS} players</span>
          ) : (
            <span className="text-yellow-400">{playerCount}/{MIN_PLAYERS} players needed</span>
          )}
        </p>
      )}

      {!isLoading && !hasEnoughPlayers && (
        <p className="text-discord-muted text-sm mb-6">
          Waiting for more players to join...
        </p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8 w-full max-w-2xl">
        {isLoading ? (
          // Show skeleton placeholders while loading
          <>
            <PlayerCardSkeleton />
            <PlayerCardSkeleton />
            <PlayerCardSkeleton />
            <PlayerCardSkeleton />
          </>
        ) : (
          players.map((player) => (
            <div
              key={player.id}
              className={
                currentUserId === player.id
                  ? 'ring-2 ring-discord-primary rounded-lg'
                  : ''
              }
            >
              <PlayerCard player={player} />
            </div>
          ))
        )}
      </div>

      {!isLoading && isHost && (
        <button
          onClick={onStartGame}
          disabled={!hasEnoughPlayers}
          className={`
            px-6 py-3 rounded-lg font-semibold transition-colors
            ${hasEnoughPlayers
              ? 'bg-discord-primary hover:bg-discord-primary-hover text-white cursor-pointer'
              : 'bg-discord-darker text-discord-muted cursor-not-allowed'
            }
          `}
        >
          Start Game
        </button>
      )}

      {!isLoading && !isHost && hasEnoughPlayers && (
        <p className="text-discord-muted text-sm">
          Waiting for the host to start the game...
        </p>
      )}
    </div>
  );
}

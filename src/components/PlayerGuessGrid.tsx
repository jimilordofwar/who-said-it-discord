import { Player } from '../types/game';

interface PlayerGuessGridProps {
  players: Player[];
  selectedPlayerId: string | null;
  previousGuessId?: string | null;
  onSelect: (playerId: string) => void;
  disabled?: boolean;
  correctAnswerId?: string;
}

export function PlayerGuessGrid({
  players,
  selectedPlayerId,
  previousGuessId,
  onSelect,
  disabled = false,
  correctAnswerId,
}: PlayerGuessGridProps) {
  const isRevealMode = correctAnswerId !== undefined;

  const getCardStyles = (playerId: string): string => {
    const baseStyles =
      'flex flex-col items-center p-4 rounded-lg border-2 transition-all duration-200';

    // In reveal mode, show correct/incorrect states
    if (isRevealMode) {
      if (playerId === correctAnswerId) {
        // Correct answer - green highlight
        return `${baseStyles} bg-green-900/30 border-green-500 shadow-lg shadow-green-500/30`;
      }
      if (playerId === selectedPlayerId && playerId !== correctAnswerId) {
        // Wrong guess - red highlight
        return `${baseStyles} bg-red-900/30 border-red-500 shadow-lg shadow-red-500/30`;
      }
      // Other players in reveal mode
      return `${baseStyles} bg-discord-dark border-discord-darker opacity-50`;
    }

    // Interactive mode
    if (disabled) {
      return `${baseStyles} bg-discord-dark border-discord-darker opacity-50 cursor-not-allowed`;
    }

    if (playerId === selectedPlayerId) {
      // Currently selected
      return `${baseStyles} bg-discord-dark border-green-500 shadow-lg shadow-green-500/30 cursor-pointer`;
    }

    if (playerId === previousGuessId && selectedPlayerId !== playerId) {
      // Previous guess indicator (Phase 2)
      return `${baseStyles} bg-discord-dark border-discord-primary/70 cursor-pointer hover:border-green-400 hover:shadow-md hover:shadow-green-400/20`;
    }

    // Default interactive state
    return `${baseStyles} bg-discord-dark border-discord-darker cursor-pointer hover:border-discord-primary hover:shadow-md hover:shadow-discord-primary/20`;
  };

  const handleSelect = (playerId: string) => {
    if (disabled || isRevealMode) return;
    onSelect(playerId);
  };

  const handleKeyDown = (e: React.KeyboardEvent, playerId: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSelect(playerId);
    }
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {players.map((player) => {
          const hasAvatar = player.avatar && player.avatar.length > 0;
          const isSelected = selectedPlayerId === player.id;
          const isPreviousGuess = previousGuessId === player.id;
          const isCorrect = correctAnswerId === player.id;
          const isWrongGuess =
            isRevealMode && isSelected && player.id !== correctAnswerId;

          return (
            <div
              key={player.id}
              role="button"
              tabIndex={disabled || isRevealMode ? -1 : 0}
              aria-pressed={isSelected}
              aria-disabled={disabled || isRevealMode}
              aria-label={`Select ${player.username}${isSelected ? ' (selected)' : ''}${isPreviousGuess ? ' (previous guess)' : ''}`}
              className={getCardStyles(player.id)}
              onClick={() => handleSelect(player.id)}
              onKeyDown={(e) => handleKeyDown(e, player.id)}
            >
              {/* Avatar */}
              <div className="relative">
                {hasAvatar ? (
                  <img
                    src={player.avatar}
                    alt={`${player.username}'s avatar`}
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-discord-primary flex items-center justify-center">
                    <span className="text-xl sm:text-2xl font-bold text-white">
                      {player.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}

                {/* Previous guess badge (Phase 2) */}
                {isPreviousGuess && !isRevealMode && !isSelected && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-discord-primary rounded-full flex items-center justify-center">
                    <span className="text-xs text-white font-bold">1</span>
                  </div>
                )}

                {/* Reveal mode indicators */}
                {isRevealMode && isCorrect && (
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                )}

                {isWrongGuess && (
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </div>
                )}
              </div>

              {/* Username */}
              <span className="mt-2 text-sm font-medium text-discord-lighter text-center truncate max-w-full">
                {player.username}
              </span>

              {/* Selection indicator text */}
              {isSelected && !isRevealMode && (
                <span className="mt-1 text-xs text-green-400 font-medium">
                  Selected
                </span>
              )}

              {isPreviousGuess && !isSelected && !isRevealMode && (
                <span className="mt-1 text-xs text-discord-primary font-medium">
                  Previous
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

import { useMemo } from 'react';
import { Player } from '../types/game';

interface EndGameProps {
  players: Player[];
  currentPlayerId: string;
  totalRounds: number;
  onPlayAgain: () => void;
}

export function EndGame({
  players,
  currentPlayerId,
  totalRounds,
  onPlayAgain,
}: EndGameProps) {
  // Sort players by score (highest first)
  const rankedPlayers = [...players].sort((a, b) => b.score - a.score);

  // Pre-compute ranks for all players to avoid repeated calculations
  const playerRanks = useMemo(() => {
    const ranks = new Map<string, number>();
    rankedPlayers.forEach((player) => {
      const playersAhead = rankedPlayers.filter((p) => p.score > player.score).length;
      ranks.set(player.id, playersAhead + 1);
    });
    return ranks;
  }, [rankedPlayers]);

  // Find the highest score
  const highestScore = rankedPlayers[0]?.score ?? 0;

  // Find all players with the highest score (for tie detection)
  const winners = rankedPlayers.filter((p) => p.score === highestScore);
  const isTie = winners.length > 1;

  // Get rank display text for position
  const getRankDisplay = (playerId: string): string => {
    const rank = playerRanks.get(playerId) ?? 0;
    if (rank === 1) return '1st';
    if (rank === 2) return '2nd';
    if (rank === 3) return '3rd';
    return `${rank}th`;
  };

  const getRankMedal = (playerId: string): string | null => {
    const rank = playerRanks.get(playerId) ?? 0;
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return null;
  };

  const getRankStyles = (playerId: string): string => {
    const rank = playerRanks.get(playerId) ?? 0;
    if (rank === 1) return 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border-yellow-500/50';
    if (rank === 2) return 'bg-gradient-to-r from-gray-400/20 to-slate-400/20 border-gray-400/50';
    if (rank === 3) return 'bg-gradient-to-r from-amber-700/20 to-orange-700/20 border-amber-700/50';
    return 'bg-discord-darker border-discord-dark';
  };

  // Calculate max possible score
  const maxPossibleScore = totalRounds * 2;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Winner announcement banner */}
      <div className="relative overflow-hidden rounded-xl p-8 text-center bg-gradient-to-br from-yellow-500/20 via-amber-500/15 to-orange-500/20 border-2 border-yellow-500/50">
        {/* Decorative stars */}
        <div className="absolute top-2 left-4 text-2xl opacity-40 animate-bounce">*</div>
        <div className="absolute top-6 right-8 text-xl opacity-30 animate-bounce delay-100">*</div>
        <div className="absolute bottom-4 left-12 text-lg opacity-35 animate-bounce delay-200">*</div>
        <div className="absolute bottom-2 right-4 text-2xl opacity-25 animate-bounce delay-75">*</div>
        <div className="absolute top-3 left-1/4 text-sm opacity-20 animate-bounce delay-150">*</div>
        <div className="absolute bottom-6 right-1/4 text-lg opacity-30 animate-bounce delay-300">*</div>

        {/* Crown icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-yellow-500/30 mb-4">
          <span className="text-5xl">👑</span>
        </div>

        {isTie ? (
          <>
            <h1 className="text-3xl font-bold text-yellow-400 mb-4">
              It's a Tie!
            </h1>
            <div className="flex justify-center gap-4 flex-wrap">
              {winners.map((winner) => (
                <div key={winner.id} className="flex flex-col items-center">
                  {winner.avatar ? (
                    <img
                      src={winner.avatar}
                      alt={`${winner.username}'s avatar`}
                      className="w-20 h-20 rounded-full object-cover border-4 border-yellow-500/70 shadow-[0_0_20px_rgba(234,179,8,0.4)]"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-discord-primary flex items-center justify-center border-4 border-yellow-500/70 shadow-[0_0_20px_rgba(234,179,8,0.4)]">
                      <span className="text-3xl font-bold text-white">
                        {winner.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <span className="mt-2 text-lg font-semibold text-white">
                    {winner.username}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-2xl font-bold text-yellow-300">
              {highestScore} points each!
            </p>
            <p className="mt-2 text-sm text-yellow-200/70">
              Tiebreaker coming in a future update...
            </p>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-bold text-yellow-400 mb-4">
              Winner!
            </h1>
            {winners[0] && (
              <>
                {winners[0].avatar ? (
                  <img
                    src={winners[0].avatar}
                    alt={`${winners[0].username}'s avatar`}
                    className="w-24 h-24 rounded-full object-cover mx-auto border-4 border-yellow-500/70 shadow-[0_0_25px_rgba(234,179,8,0.5)]"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-discord-primary flex items-center justify-center mx-auto border-4 border-yellow-500/70 shadow-[0_0_25px_rgba(234,179,8,0.5)]">
                    <span className="text-4xl font-bold text-white">
                      {winners[0].username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <h2 className="mt-4 text-2xl font-bold text-white">
                  {winners[0].username}
                </h2>
                <p className="mt-2 text-3xl font-bold text-yellow-300">
                  {winners[0].score} points
                </p>
              </>
            )}
          </>
        )}
      </div>

      {/* Full leaderboard */}
      <div className="bg-discord-darker rounded-xl p-5 border border-discord-dark">
        <h3 className="text-lg font-bold text-white mb-4 text-center">
          Final Standings
        </h3>

        <div className="space-y-2">
          {rankedPlayers.map((player) => {
            const isCurrentPlayer = player.id === currentPlayerId;
            const medal = getRankMedal(player.id);
            const rankStyles = getRankStyles(player.id);

            return (
              <div
                key={player.id}
                className={`
                  flex items-center gap-4 p-3 rounded-lg border transition-all
                  ${rankStyles}
                  ${isCurrentPlayer ? 'ring-2 ring-discord-primary ring-offset-2 ring-offset-discord-darker' : ''}
                `}
              >
                {/* Rank */}
                <div className="flex items-center justify-center w-12 shrink-0">
                  {medal ? (
                    <span className="text-2xl">{medal}</span>
                  ) : (
                    <span className="text-lg font-bold text-discord-light">
                      {getRankDisplay(player.id)}
                    </span>
                  )}
                </div>

                {/* Avatar */}
                {player.avatar ? (
                  <img
                    src={player.avatar}
                    alt={`${player.username}'s avatar`}
                    className="w-10 h-10 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-discord-primary flex items-center justify-center shrink-0">
                    <span className="text-lg font-bold text-white">
                      {player.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}

                {/* Username */}
                <span className={`
                  flex-1 font-medium truncate
                  ${isCurrentPlayer ? 'text-discord-primary' : 'text-white'}
                `}>
                  {player.username}
                  {isCurrentPlayer && (
                    <span className="ml-2 text-sm text-discord-light">(you)</span>
                  )}
                </span>

                {/* Score */}
                <span className="font-bold text-lg text-discord-lighter shrink-0">
                  {player.score}
                  <span className="text-sm text-discord-light/70 font-normal ml-1">pts</span>
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stats summary */}
      <div className="bg-discord-darker rounded-xl p-5 border border-discord-dark">
        <h3 className="text-lg font-bold text-white mb-4 text-center">
          Game Stats
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-discord-dark rounded-lg">
            <p className="text-sm text-discord-light/70">Rounds Played</p>
            <p className="text-2xl font-bold text-white">{totalRounds}</p>
          </div>

          <div className="text-center p-3 bg-discord-dark rounded-lg">
            <p className="text-sm text-discord-light/70">Max Possible Score</p>
            <p className="text-2xl font-bold text-white">{maxPossibleScore}</p>
          </div>

          <div className="text-center p-3 bg-discord-dark rounded-lg">
            <p className="text-sm text-discord-light/70">Winner's Accuracy</p>
            <p className="text-2xl font-bold text-white">
              {maxPossibleScore > 0
                ? Math.round((highestScore / maxPossibleScore) * 100)
                : 0}%
            </p>
          </div>

          <div className="text-center p-3 bg-discord-dark rounded-lg">
            <p className="text-sm text-discord-light/70">Total Players</p>
            <p className="text-2xl font-bold text-white">{players.length}</p>
          </div>
        </div>
      </div>

      {/* Play Again button */}
      <button
        onClick={onPlayAgain}
        className="
          w-full py-4 px-6 rounded-xl font-bold text-lg
          bg-gradient-to-r from-discord-primary to-indigo-500
          hover:from-discord-primary/90 hover:to-indigo-500/90
          text-white shadow-[0_0_20px_rgba(88,101,242,0.4)]
          transition-all duration-200
          transform hover:scale-[1.02] active:scale-[0.98]
        "
      >
        <svg
          className="inline-block w-5 h-5 mr-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        Play Again
      </button>
    </div>
  );
}

export default EndGame;

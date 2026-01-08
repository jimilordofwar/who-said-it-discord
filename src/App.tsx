import { useState, useCallback, useMemo } from 'react';
import { useDiscordUsers } from './hooks/useDiscordUsers';
import { Lobby } from './components/Lobby';
import { GameRound } from './components/GameRound';
import { RoundSummary } from './components/RoundSummary';
import { EndGame } from './components/EndGame';
import { isDev, DEFAULT_ROUNDS, SCORE_FIRST_TRY, SCORE_CHANGED_GUESS, SCORE_WRONG } from './config';
import { getMockPlayers, getRandomMessages } from './mocks/gameData';
import type { Player, GameMessage } from './types/game';

type AppGamePhase = 'lobby' | 'playing' | 'round-summary' | 'end-game';

interface RoundResult {
  initialGuess: string | null;
  finalGuess: string | null;
  correctAuthorId: string;
  pointsEarned: number;
}

function App() {
  const {
    currentUser,
    voiceChannelUsers,
    isLoading,
    error,
    isHost,
  } = useDiscordUsers();

  // Game state
  const [gamePhase, setGamePhase] = useState<AppGamePhase>('lobby');
  const [currentRound, setCurrentRound] = useState(1);
  const [roundMessages, setRoundMessages] = useState<GameMessage[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentRoundResult, setCurrentRoundResult] = useState<RoundResult | null>(null);

  // Get effective players list (merge real users with mock players in dev mode if needed)
  const effectivePlayers = useMemo(() => {
    if (isDev && voiceChannelUsers.length < 3) {
      // In dev mode with insufficient real players, merge real users with mock players
      const mockPlayers = getMockPlayers();
      const realUserIds = new Set(voiceChannelUsers.map(u => u.id));
      // Filter out mock players that might conflict, then add enough to reach 5 players
      const filteredMocks = mockPlayers.filter(m => !realUserIds.has(m.id));
      const neededMocks = Math.max(0, 5 - voiceChannelUsers.length);
      return [...voiceChannelUsers, ...filteredMocks.slice(0, neededMocks)];
    }
    return voiceChannelUsers;
  }, [voiceChannelUsers]);

  // Get the current message for the round
  const currentMessage = useMemo(() => {
    if (roundMessages.length === 0 || currentRound < 1) return null;
    return roundMessages[currentRound - 1] || null;
  }, [roundMessages, currentRound]);

  // Get the correct author player for round summary
  const correctAuthor = useMemo(() => {
    if (!currentRoundResult) return null;
    return players.find(p => p.id === currentRoundResult.correctAuthorId) || null;
  }, [players, currentRoundResult]);

  // Get current player's total score
  const currentPlayerScore = useMemo(() => {
    const player = players.find(p => p.id === currentUser?.id);
    return player?.score ?? 0;
  }, [players, currentUser?.id]);

  // Handle starting the game
  const handleStartGame = useCallback(() => {
    console.log('Starting game...');

    // Initialize players with scores reset to 0
    const gamePlayers = effectivePlayers.map(p => ({
      ...p,
      score: 0,
      currentGuess: null,
    }));
    setPlayers(gamePlayers);

    // Get random messages for the game (use mock messages)
    const playerIds = gamePlayers.map(p => p.id);
    const messages = getRandomMessages(DEFAULT_ROUNDS, playerIds);

    if (messages.length === 0) {
      console.error('No messages available for the game');
      return;
    }

    setRoundMessages(messages);
    setCurrentRound(1);
    setCurrentRoundResult(null);
    setGamePhase('playing');
  }, [effectivePlayers]);

  // Calculate points based on guesses
  const calculatePoints = useCallback((
    initialGuess: string | null,
    finalGuess: string | null,
    correctAuthorId: string
  ): number => {
    // Correct on first try: 2 points
    if (initialGuess === correctAuthorId) {
      return SCORE_FIRST_TRY;
    }
    // Correct after changing (final guess is correct but initial wasn't): 1 point
    if (finalGuess === correctAuthorId && initialGuess !== correctAuthorId) {
      return SCORE_CHANGED_GUESS;
    }
    // Wrong or no guess: 0 points
    return SCORE_WRONG;
  }, []);

  // Handle round completion
  const handleRoundComplete = useCallback((result: { finalGuess: string | null; initialGuess: string | null; correctAuthorId: string }) => {
    const pointsEarned = calculatePoints(result.initialGuess, result.finalGuess, result.correctAuthorId);

    // Update the current user's score
    if (currentUser) {
      setPlayers(prevPlayers =>
        prevPlayers.map(p =>
          p.id === currentUser.id
            ? { ...p, score: p.score + pointsEarned }
            : p
        )
      );
    }

    // Store the round result for the summary
    setCurrentRoundResult({
      ...result,
      pointsEarned,
    });

    // Transition to round summary
    setGamePhase('round-summary');
  }, [calculatePoints, currentUser]);

  // Handle continuing after round summary
  const handleContinue = useCallback(() => {
    if (currentRound >= DEFAULT_ROUNDS || currentRound >= roundMessages.length) {
      // Last round - go to end game
      setGamePhase('end-game');
    } else {
      // More rounds - go to next round
      setCurrentRound(prev => prev + 1);
      setCurrentRoundResult(null);
      setGamePhase('playing');
    }
  }, [currentRound, roundMessages.length]);

  // Handle playing again
  const handlePlayAgain = useCallback(() => {
    // Reset all game state and return to lobby
    setGamePhase('lobby');
    setCurrentRound(1);
    setRoundMessages([]);
    setPlayers([]);
    setCurrentRoundResult(null);
  }, []);

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-discord-darker flex items-center justify-center p-4">
        <div className="bg-discord-dark rounded-lg p-6 max-w-md">
          <h2 className="text-red-500 text-xl font-bold mb-2">Error</h2>
          <p className="text-discord-light">{error.message}</p>
        </div>
      </div>
    );
  }

  // Get current player ID (use first mock player in dev mode if no real user)
  const currentPlayerId = currentUser?.id ?? (isDev ? effectivePlayers[0]?.id : undefined);

  return (
    <div className="min-h-screen bg-discord-darker text-discord-lighter p-4">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-discord-primary mb-2">
            Guess Who Said It
          </h1>
          <p className="text-discord-light">
            A game of channel history and memory
          </p>
          {isDev && (
            <span className="text-xs text-discord-muted">(Dev mode)</span>
          )}
        </header>

        <main className="bg-discord-dark rounded-lg p-6">
          {/* Lobby Phase */}
          {gamePhase === 'lobby' && (
            <Lobby
              players={effectivePlayers}
              isHost={isHost || isDev}
              currentUserId={currentPlayerId}
              onStartGame={handleStartGame}
              isLoading={isLoading}
            />
          )}

          {/* Playing Phase (Game Round) */}
          {gamePhase === 'playing' && currentMessage && currentPlayerId && (
            <GameRound
              message={currentMessage}
              players={players}
              currentPlayerId={currentPlayerId}
              roundNumber={currentRound}
              totalRounds={Math.min(DEFAULT_ROUNDS, roundMessages.length)}
              onRoundComplete={handleRoundComplete}
            />
          )}

          {/* Round Summary Phase */}
          {gamePhase === 'round-summary' && currentRoundResult && correctAuthor && currentMessage && (
            <RoundSummary
              message={currentMessage}
              correctAuthor={correctAuthor}
              playerGuess={{
                initialGuess: currentRoundResult.initialGuess,
                finalGuess: currentRoundResult.finalGuess,
              }}
              pointsEarned={currentRoundResult.pointsEarned}
              totalScore={currentPlayerScore}
              roundNumber={currentRound}
              totalRounds={Math.min(DEFAULT_ROUNDS, roundMessages.length)}
              onContinue={handleContinue}
              isLastRound={currentRound >= DEFAULT_ROUNDS || currentRound >= roundMessages.length}
            />
          )}

          {/* End Game Phase */}
          {gamePhase === 'end-game' && currentPlayerId && (
            <EndGame
              players={players}
              currentPlayerId={currentPlayerId}
              totalRounds={Math.min(DEFAULT_ROUNDS, roundMessages.length)}
              onPlayAgain={handlePlayAgain}
            />
          )}

          {/* Fallback for missing data during game phases */}
          {gamePhase !== 'lobby' && !currentMessage && gamePhase === 'playing' && (
            <div className="text-center py-8">
              <p className="text-discord-light">Loading round...</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;

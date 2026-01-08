import { useState, useEffect, useCallback, useMemo } from 'react';
import { Player, GameMessage } from '../types/game';
import { Timer } from './Timer';
import { MessageCard } from './MessageCard';
import { PlayerGuessGrid } from './PlayerGuessGrid';
import { INITIAL_PHASE_SECONDS } from '../config';

type RoundPhase = 'initial-guess' | 'multiple-choice';

interface RoundResult {
  finalGuess: string | null;
  initialGuess: string | null;
  correctAuthorId: string;
}

interface GameRoundProps {
  message: GameMessage;
  players: Player[];
  currentPlayerId: string;
  roundNumber: number;
  totalRounds: number;
  onRoundComplete: (result: RoundResult) => void;
}

export function GameRound({
  message,
  players,
  currentPlayerId,
  roundNumber,
  totalRounds,
  onRoundComplete,
}: GameRoundProps) {
  // Internal state
  const [phase, setPhase] = useState<RoundPhase>('initial-guess');
  const [timer, setTimer] = useState(INITIAL_PHASE_SECONDS);
  const [initialGuess, setInitialGuess] = useState<string | null>(null);
  const [currentGuess, setCurrentGuess] = useState<string | null>(null);
  const [multipleChoiceOptions, setMultipleChoiceOptions] = useState<Player[]>([]);
  const [isLockedIn, setIsLockedIn] = useState(false);

  // Filter out the current player (can't guess yourself)
  const availablePlayers = useMemo(() => {
    return players.filter((p) => p.id !== currentPlayerId);
  }, [players, currentPlayerId]);

  // Fisher-Yates shuffle for uniformly random array shuffling
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Generate multiple choice options: correct author + 2 random wrong answers
  const generateMultipleChoiceOptions = useCallback((): Player[] => {
    const correctAuthor = players.find((p) => p.id === message.authorId);
    if (!correctAuthor) return [];

    // Get wrong options (excluding correct author and current player if they're the author)
    const wrongOptions = players.filter(
      (p) => p.id !== message.authorId && p.id !== currentPlayerId
    );

    // Shuffle and take 2 wrong options using Fisher-Yates
    const shuffledWrong = shuffleArray(wrongOptions);
    const selectedWrong = shuffledWrong.slice(0, 2);

    // Combine and shuffle all options using Fisher-Yates
    const allOptions = [correctAuthor, ...selectedWrong];
    return shuffleArray(allOptions);
  }, [players, message.authorId, currentPlayerId]);

  // Handle phase transition from initial-guess to multiple-choice
  const transitionToMultipleChoice = useCallback(() => {
    setInitialGuess(currentGuess);
    setMultipleChoiceOptions(generateMultipleChoiceOptions());
    setPhase('multiple-choice');
    setTimer(INITIAL_PHASE_SECONDS);
    setIsLockedIn(false);
  }, [currentGuess, generateMultipleChoiceOptions]);

  // Handle round completion
  const completeRound = useCallback(() => {
    onRoundComplete({
      finalGuess: currentGuess,
      initialGuess,
      correctAuthorId: message.authorId,
    });
  }, [currentGuess, initialGuess, message.authorId, onRoundComplete]);

  // Timer countdown effect
  useEffect(() => {
    if (isLockedIn && phase === 'initial-guess') {
      // If locked in during phase 1, transition immediately
      transitionToMultipleChoice();
      return;
    }

    if (isLockedIn && phase === 'multiple-choice') {
      // If locked in during phase 2, complete immediately
      completeRound();
      return;
    }

    if (timer <= 0) {
      if (phase === 'initial-guess') {
        transitionToMultipleChoice();
      } else {
        completeRound();
      }
      return;
    }

    const interval = setInterval(() => {
      setTimer((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [timer, phase, isLockedIn, transitionToMultipleChoice, completeRound]);

  // Handle player selection
  const handlePlayerSelect = (playerId: string) => {
    if (isLockedIn) return;
    setCurrentGuess(playerId);
  };

  // Handle lock in button
  const handleLockIn = () => {
    if (!currentGuess) return;
    setIsLockedIn(true);
  };

  // Determine which players to show based on phase
  const displayPlayers = phase === 'initial-guess' ? availablePlayers : multipleChoiceOptions;

  // Phase display text
  const phaseText = phase === 'initial-guess' ? 'Initial Guess' : 'Final Answer';
  const phaseDescription =
    phase === 'initial-guess'
      ? 'Select who you think wrote this message'
      : 'Confirm or change your guess with the date revealed';

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Header: Round indicator and phase */}
      <div className="w-full text-center space-y-2">
        <div className="flex items-center justify-center gap-3">
          <span className="text-discord-light text-sm uppercase tracking-wider">
            Round {roundNumber} of {totalRounds}
          </span>
          <span className="text-discord-light/50">|</span>
          <span
            className={`text-sm font-semibold uppercase tracking-wider ${
              phase === 'initial-guess' ? 'text-discord-primary' : 'text-yellow-400'
            }`}
          >
            {phaseText}
          </span>
        </div>
        <p className="text-discord-light/70 text-sm">{phaseDescription}</p>
      </div>

      {/* Timer */}
      <Timer seconds={timer} totalSeconds={INITIAL_PHASE_SECONDS} />

      {/* Message Card */}
      <MessageCard
        content={message.content}
        timestamp={message.timestamp}
        showDate={phase === 'multiple-choice'}
        revealed={false}
      />

      {/* Player Selection Grid */}
      <div className="w-full">
        <h3 className="text-discord-lighter text-sm font-medium mb-3 text-center">
          {phase === 'initial-guess'
            ? 'Choose from all players:'
            : 'Choose from these options:'}
        </h3>
        <PlayerGuessGrid
          players={displayPlayers}
          selectedPlayerId={currentGuess}
          previousGuessId={phase === 'multiple-choice' ? initialGuess : undefined}
          onSelect={handlePlayerSelect}
          disabled={isLockedIn}
        />
      </div>

      {/* Lock In Button */}
      <div className="flex flex-col items-center gap-2">
        <button
          onClick={handleLockIn}
          disabled={!currentGuess || isLockedIn}
          className={`
            px-8 py-3 rounded-lg font-semibold text-lg
            transition-all duration-200
            ${
              currentGuess && !isLockedIn
                ? 'bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-600/30 hover:shadow-green-500/40'
                : 'bg-discord-darker text-discord-light/50 cursor-not-allowed'
            }
          `}
        >
          {isLockedIn ? 'Locked In!' : 'Lock In Answer'}
        </button>
        {!currentGuess && !isLockedIn && (
          <span className="text-discord-light/50 text-xs">Select a player to lock in</span>
        )}
        {isLockedIn && (
          <span className="text-green-400 text-xs animate-pulse">
            Waiting for next phase...
          </span>
        )}
      </div>

      {/* Phase 2 hint about previous guess */}
      {phase === 'multiple-choice' && initialGuess && (
        <div className="text-center text-sm">
          <span className="text-discord-light/70">Your initial guess is marked with </span>
          <span className="text-discord-primary font-medium">a badge</span>
          <span className="text-discord-light/70">. You can confirm or change it.</span>
        </div>
      )}
    </div>
  );
}

export default GameRound;

import { Player, GameMessage } from '../types/game';
import { MessageCard } from './MessageCard';
import { SCORE_FIRST_TRY, SCORE_CHANGED_GUESS } from '../config';

interface PlayerGuess {
  initialGuess: string | null;
  finalGuess: string | null;
}

interface RoundSummaryProps {
  message: GameMessage;
  correctAuthor: Player;
  playerGuess: PlayerGuess;
  pointsEarned: number;
  totalScore: number;
  roundNumber: number;
  totalRounds: number;
  onContinue: () => void;
  isLastRound: boolean;
}

export function RoundSummary({
  message,
  correctAuthor,
  playerGuess,
  pointsEarned,
  totalScore,
  roundNumber,
  totalRounds,
  onContinue,
  isLastRound,
}: RoundSummaryProps) {
  const isCorrect = pointsEarned > 0;
  const wasFirstTry = pointsEarned === SCORE_FIRST_TRY;
  const changedAndCorrect = pointsEarned === SCORE_CHANGED_GUESS;

  const getResultMessage = () => {
    if (wasFirstTry) {
      return 'Perfect! You got it on the first try!';
    }
    if (changedAndCorrect) {
      return 'Nice! You figured it out!';
    }
    if (playerGuess.finalGuess === null && playerGuess.initialGuess === null) {
      return "Time's up! No guess submitted.";
    }
    return 'Not quite this time!';
  };

  const getPointsBreakdown = () => {
    if (wasFirstTry) {
      return '+2 points (correct on first guess)';
    }
    if (changedAndCorrect) {
      return '+1 point (correct after hint)';
    }
    return '+0 points';
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Result banner */}
      <div
        className={`
          relative overflow-hidden rounded-xl p-6 text-center
          transition-all duration-500
          ${isCorrect
            ? 'bg-gradient-to-br from-green-500/20 to-emerald-600/20 border-2 border-green-500/50'
            : 'bg-gradient-to-br from-red-500/10 to-orange-600/10 border-2 border-red-500/30'
          }
        `}
      >
        {/* Decorative background elements for correct answers */}
        {isCorrect && (
          <>
            <div className="absolute top-2 left-4 text-2xl opacity-30 animate-bounce">*</div>
            <div className="absolute top-4 right-6 text-xl opacity-20 animate-bounce delay-100">*</div>
            <div className="absolute bottom-3 left-8 text-lg opacity-25 animate-bounce delay-200">*</div>
            <div className="absolute bottom-2 right-4 text-2xl opacity-20 animate-bounce delay-75">*</div>
          </>
        )}

        {/* Result icon */}
        <div
          className={`
            inline-flex items-center justify-center w-16 h-16 rounded-full mb-4
            ${isCorrect
              ? 'bg-green-500/30 text-green-400'
              : 'bg-red-500/20 text-red-400'
            }
          `}
        >
          {isCorrect ? (
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </div>

        {/* Result message */}
        <h2
          className={`
            text-2xl font-bold mb-2
            ${isCorrect ? 'text-green-400' : 'text-red-400'}
          `}
        >
          {getResultMessage()}
        </h2>

        {/* Points earned */}
        <p
          className={`
            text-lg font-semibold
            ${isCorrect ? 'text-green-300/80' : 'text-red-300/60'}
          `}
        >
          {getPointsBreakdown()}
        </p>
      </div>

      {/* Message reveal */}
      <div className="space-y-2">
        <p className="text-sm text-discord-light/70 text-center">
          The message was written by:
        </p>
        <MessageCard
          content={message.content}
          timestamp={message.timestamp}
          showDate={true}
          authorName={correctAuthor.username}
          authorAvatar={correctAuthor.avatar}
          revealed={true}
        />
      </div>

      {/* Score display */}
      <div className="bg-discord-darker rounded-xl p-5 border border-discord-dark">
        <div className="flex items-center justify-between">
          <div className="text-left">
            <p className="text-sm text-discord-light/70">Your Score</p>
            <p className="text-3xl font-bold text-white">
              {totalScore}
              <span className="text-lg text-discord-light/50 font-normal ml-1">pts</span>
            </p>
          </div>

          <div className="text-right">
            <p className="text-sm text-discord-light/70">Round Progress</p>
            <p className="text-lg font-medium text-discord-lighter">
              {roundNumber} of {totalRounds} complete
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="h-2 bg-discord-dark rounded-full overflow-hidden">
            <div
              className="h-full bg-discord-primary rounded-full transition-all duration-500"
              style={{ width: `${(roundNumber / totalRounds) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Continue button */}
      <button
        onClick={onContinue}
        className={`
          w-full py-4 px-6 rounded-xl font-bold text-lg
          transition-all duration-200
          transform hover:scale-[1.02] active:scale-[0.98]
          ${isLastRound
            ? 'bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-black shadow-[0_0_20px_rgba(234,179,8,0.3)]'
            : 'bg-discord-primary hover:bg-discord-primary/90 text-white shadow-[0_0_15px_rgba(88,101,242,0.3)]'
          }
        `}
      >
        {isLastRound ? 'See Results' : 'Next Round'}
        <svg
          className="inline-block w-5 h-5 ml-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      </button>
    </div>
  );
}

export default RoundSummary;

import { useEffect } from 'react';

interface TimerProps {
  seconds: number;
  totalSeconds: number;
  onTimeUp?: () => void;
}

export function Timer({ seconds, totalSeconds, onTimeUp }: TimerProps) {
  const progress = totalSeconds > 0 ? (seconds / totalSeconds) * 100 : 0;

  // Determine color based on time remaining
  const getColorClasses = () => {
    if (seconds > 10) {
      return {
        text: 'text-green-400',
        bg: 'bg-green-500',
        glow: '',
      };
    } else if (seconds >= 5) {
      return {
        text: 'text-yellow-400',
        bg: 'bg-yellow-500',
        glow: '',
      };
    } else {
      return {
        text: 'text-red-400',
        bg: 'bg-red-500',
        glow: 'animate-pulse shadow-lg shadow-red-500/50',
      };
    }
  };

  const colors = getColorClasses();

  // Call onTimeUp when timer reaches 0
  useEffect(() => {
    if (seconds === 0 && onTimeUp) {
      onTimeUp();
    }
  }, [seconds, onTimeUp]);

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Timer display */}
      <div className="flex items-center justify-center mb-2">
        <span
          className={`text-4xl font-bold tabular-nums ${colors.text} ${seconds < 5 ? 'animate-pulse' : ''}`}
        >
          {seconds}
        </span>
        <span className="text-lg text-discord-light ml-1">s</span>
      </div>

      {/* Progress bar container */}
      <div className="h-2 bg-discord-darker rounded-full overflow-hidden">
        {/* Progress bar fill */}
        <div
          className={`h-full ${colors.bg} ${colors.glow} transition-all duration-300 ease-linear rounded-full`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

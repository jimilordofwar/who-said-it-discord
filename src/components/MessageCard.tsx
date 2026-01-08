import { useMemo } from 'react';

interface MessageCardProps {
  content: string;
  timestamp?: Date | string;
  showDate: boolean;
  authorName?: string;
  authorAvatar?: string;
  revealed: boolean;
}

export function MessageCard({
  content,
  timestamp,
  showDate,
  authorName,
  authorAvatar,
  revealed,
}: MessageCardProps) {
  const formattedDate = useMemo(() => {
    if (!timestamp) return null;
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }, [timestamp]);

  const formattedTime = useMemo(() => {
    if (!timestamp) return null;
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  }, [timestamp]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Mystery card container */}
      <div
        className={`
          relative overflow-hidden rounded-lg
          bg-discord-darker border-2
          transition-all duration-500 ease-out
          ${revealed
            ? 'border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.3)]'
            : 'border-discord-primary shadow-[0_0_30px_rgba(88,101,242,0.4)]'
          }
        `}
      >
        {/* Animated background glow for mystery state */}
        {!revealed && (
          <div className="absolute inset-0 bg-gradient-to-r from-discord-primary/10 via-purple-500/10 to-discord-primary/10 animate-pulse" />
        )}

        {/* Main content */}
        <div className="relative p-5">
          {/* Author section */}
          <div className="flex items-center gap-3 mb-4">
            {/* Avatar */}
            <div
              className={`
                relative w-12 h-12 rounded-full overflow-hidden
                transition-all duration-700 ease-out
                ${revealed ? 'scale-100' : 'scale-105'}
              `}
            >
              {revealed && authorAvatar ? (
                <img
                  src={authorAvatar}
                  alt={authorName || 'Author'}
                  className="w-full h-full object-cover animate-fade-in"
                />
              ) : (
                <div className="w-full h-full bg-discord-dark flex items-center justify-center">
                  {/* Mystery silhouette */}
                  <svg
                    className="w-8 h-8 text-discord-light/50"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                  </svg>
                  {/* Animated question marks */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-discord-primary font-bold text-lg animate-bounce">?</span>
                  </div>
                </div>
              )}

              {/* Reveal animation ring */}
              {revealed && (
                <div className="absolute inset-0 rounded-full border-2 border-green-500 animate-ping opacity-75" />
              )}
            </div>

            {/* Username and timestamp */}
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                {/* Username */}
                <span
                  className={`
                    font-semibold text-lg transition-all duration-500
                    ${revealed
                      ? 'text-white'
                      : 'text-discord-primary'
                    }
                  `}
                >
                  {revealed && authorName ? (
                    <span className="animate-fade-in">{authorName}</span>
                  ) : (
                    <span className="inline-flex items-center gap-1">
                      <span className="tracking-wider">???</span>
                      <span className="text-xs text-discord-light/50 font-normal ml-1">
                        (Who said this?)
                      </span>
                    </span>
                  )}
                </span>

                {/* Timestamp */}
                {(showDate || revealed) && formattedDate && (
                  <span
                    className={`
                      text-xs text-discord-light/70
                      transition-all duration-300
                      ${showDate && !revealed ? 'animate-fade-in' : ''}
                    `}
                  >
                    {formattedDate} at {formattedTime}
                  </span>
                )}
              </div>

              {/* Phase indicator */}
              {!revealed && (
                <div className="text-xs text-discord-light/50 mt-0.5">
                  {showDate ? 'Hint: Check the date!' : 'Make your guess...'}
                </div>
              )}
            </div>
          </div>

          {/* Message content */}
          <div
            className={`
              relative p-4 rounded-lg
              transition-all duration-500
              ${revealed
                ? 'bg-green-500/10 border border-green-500/30'
                : 'bg-discord-dark/80 border border-discord-primary/30'
              }
            `}
          >
            {/* Decorative quote marks */}
            <span className="absolute -top-2 -left-1 text-4xl text-discord-primary/30 font-serif">
              "
            </span>
            <span className="absolute -bottom-4 -right-1 text-4xl text-discord-primary/30 font-serif">
              "
            </span>

            <p
              className={`
                text-lg leading-relaxed relative z-10
                transition-colors duration-500
                ${revealed ? 'text-white' : 'text-discord-lighter'}
              `}
            >
              {content}
            </p>
          </div>

          {/* Reveal celebration effect */}
          {revealed && (
            <div className="absolute top-2 right-2">
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-medium animate-fade-in">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Revealed!
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom hint text */}
      {!revealed && (
        <p className="text-center text-discord-light/50 text-sm mt-3 animate-pulse-slow">
          {showDate
            ? 'The date has been revealed! Update your guess if needed.'
            : 'Who do you think wrote this message?'
          }
        </p>
      )}
    </div>
  );
}

export default MessageCard;

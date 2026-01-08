import { Player } from '../types/game';

interface PlayerCardProps {
  player: Pick<Player, 'id' | 'username' | 'avatar'>;
}

export function PlayerCard({ player }: PlayerCardProps) {
  const hasAvatar = player.avatar && player.avatar.length > 0;

  return (
    <div className="flex flex-col items-center p-4 bg-discord-dark rounded-lg border border-discord-darker">
      {hasAvatar ? (
        <img
          src={player.avatar}
          alt={`${player.username}'s avatar`}
          className="w-16 h-16 rounded-full object-cover"
        />
      ) : (
        <div className="w-16 h-16 rounded-full bg-discord-primary flex items-center justify-center">
          <span className="text-2xl font-bold text-white">
            {player.username.charAt(0).toUpperCase()}
          </span>
        </div>
      )}
      <span className="mt-2 text-sm font-medium text-discord-lighter text-center truncate max-w-full">
        {player.username}
      </span>
    </div>
  );
}

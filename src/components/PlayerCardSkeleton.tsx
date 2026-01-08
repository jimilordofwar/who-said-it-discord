/**
 * Skeleton loading placeholder for PlayerCard
 * Shows animated pulse effect while loading
 */
export function PlayerCardSkeleton() {
  return (
    <div className="bg-discord-darker rounded-lg p-4 animate-pulse">
      {/* Avatar skeleton */}
      <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-discord-dark" />

      {/* Username skeleton */}
      <div className="h-4 bg-discord-dark rounded w-3/4 mx-auto mb-2" />

      {/* Score skeleton (smaller) */}
      <div className="h-3 bg-discord-dark rounded w-1/2 mx-auto" />
    </div>
  );
}

export default PlayerCardSkeleton;

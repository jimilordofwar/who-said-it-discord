/**
 * Development mode configuration
 *
 * Controls dev-specific settings that make testing easier.
 * Set VITE_DEV_MODE=true in .env to enable dev mode.
 */

export const isDev = import.meta.env.VITE_DEV_MODE === 'true'

/**
 * Minimum number of players required to start a game.
 * In dev mode: 1 player (for solo testing)
 * In production: 3 players (as per game rules)
 */
export const MIN_PLAYERS = isDev ? 1 : 3

/**
 * Default number of rounds in a game.
 */
export const DEFAULT_ROUNDS = 10

/**
 * Time per round in seconds.
 */
export const ROUND_DURATION_SECONDS = 30

/**
 * Time for initial guess phase (first half of round).
 */
export const INITIAL_PHASE_SECONDS = 15

/**
 * Message length constraints for filtering.
 */
export const MESSAGE_MIN_WORDS = 5
export const MESSAGE_MAX_WORDS = 20

/**
 * Scoring values.
 */
export const SCORE_FIRST_TRY = 2
export const SCORE_CHANGED_GUESS = 1
export const SCORE_WRONG = 0

/**
 * Dev mode utilities
 */
export const devConfig = {
  /** Skip Discord SDK initialization in dev mode */
  skipSDKInit: isDev && import.meta.env.VITE_SKIP_SDK === 'true',
  /** Enable verbose logging */
  verboseLogging: isDev,
}

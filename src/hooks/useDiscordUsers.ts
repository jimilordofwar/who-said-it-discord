import { useState, useEffect, useCallback, useRef } from 'react';
import type { Player } from '../types/game';
import {
  initializeDiscordSDK,
  getCurrentUser,
  getCurrentUserAsPlayer,
  getVoiceChannelUsers,
  subscribeToVoiceStateUpdates,
  isAuthenticated,
  determineIsHost,
  type AuthenticatedUser,
} from '../utils/discord';

export interface UseDiscordUsersResult {
  /** The currently authenticated user */
  currentUser: AuthenticatedUser | null;
  /** The current user formatted as a Player */
  currentUserAsPlayer: Player | null;
  /** All users in the voice channel (including current user) */
  voiceChannelUsers: Player[];
  /** Whether the SDK is still initializing */
  isLoading: boolean;
  /** Any error that occurred during initialization */
  error: Error | null;
  /** Whether the current user is the host (opened the activity) */
  isHost: boolean;
  /** Manually refresh the voice channel users list */
  refreshUsers: () => Promise<void>;
}

// Global flag to prevent multiple initializations (React StrictMode calls effects twice)
let isInitializing = false;
let initPromise: Promise<void> | null = null;

/**
 * React hook for managing Discord users in the embedded app
 *
 * Handles:
 * - SDK initialization and authentication
 * - Getting the current authenticated user
 * - Getting and subscribing to voice channel users
 * - Tracking host status (the user who opened the activity)
 */
export function useDiscordUsers(): UseDiscordUsersResult {
  const [currentUser, setCurrentUser] = useState<AuthenticatedUser | null>(null);
  const [voiceChannelUsers, setVoiceChannelUsers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isHost, setIsHost] = useState(false);

  // Track subscription cleanup
  const unsubscribeRef = useRef<(() => void) | null>(null);

  /**
   * Initialize the Discord SDK and authenticate
   */
  const initialize = useCallback(async () => {
    // Prevent multiple simultaneous initializations (React StrictMode protection)
    if (isInitializing) {
      console.log('Already initializing, waiting for existing initialization...');
      if (initPromise) {
        await initPromise;
        // After waiting, get the current state
        const user = getCurrentUser();
        if (user) {
          setCurrentUser(user);
          setIsLoading(false);
        }
      }
      return;
    }

    isInitializing = true;

    initPromise = (async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Initialize SDK (handles ready + OAuth)
        await initializeDiscordSDK();

        // Get the authenticated user
        const user = getCurrentUser();
        if (!user) {
          throw new Error('Failed to get authenticated user');
        }
        setCurrentUser(user);

        // Determine if this user is the host (first participant in the activity)
        const hostStatus = await determineIsHost(user.id);
        setIsHost(hostStatus);

        // Get initial voice channel users
        const users = await getVoiceChannelUsers();
        setVoiceChannelUsers(users);

        // Subscribe to voice state updates
        unsubscribeRef.current = subscribeToVoiceStateUpdates((players) => {
          setVoiceChannelUsers(players);
        });

        setIsLoading(false);
      } catch (err) {
        const errorMessage = err instanceof Error
          ? err.message
          : (typeof err === 'object' && err !== null ? JSON.stringify(err) : String(err));
        console.error('Failed to initialize Discord:', errorMessage);
        setError(err instanceof Error ? err : new Error(errorMessage));
        setIsLoading(false);
      } finally {
        isInitializing = false;
      }
    })();

    await initPromise;
  }, []);

  /**
   * Manually refresh the voice channel users list
   */
  const refreshUsers = useCallback(async () => {
    if (!isAuthenticated()) {
      return;
    }

    try {
      const users = await getVoiceChannelUsers();
      setVoiceChannelUsers(users);
    } catch (err) {
      const errorMessage = err instanceof Error
        ? err.message
        : (typeof err === 'object' && err !== null ? JSON.stringify(err) : String(err));
      console.error('Failed to refresh voice channel users:', errorMessage);
    }
  }, []);

  // Initialize on mount
  useEffect(() => {
    initialize();

    // Cleanup subscription on unmount
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [initialize]);

  // Get current user as Player format
  const currentUserAsPlayer = currentUser ? getCurrentUserAsPlayer() : null;

  return {
    currentUser,
    currentUserAsPlayer,
    voiceChannelUsers,
    isLoading,
    error,
    isHost,
    refreshUsers,
  };
}

export default useDiscordUsers;

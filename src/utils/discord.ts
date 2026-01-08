import { DiscordSDK, DiscordSDKMock, Events } from '@discord/embedded-app-sdk';
import type { Player } from '../types/game';

let discordSdk: DiscordSDK | DiscordSDKMock | null = null;
let authenticatedUser: AuthenticatedUser | null = null;

// Get the client ID from environment variables (Vite uses import.meta.env)
const DISCORD_CLIENT_ID = import.meta.env.VITE_DISCORD_CLIENT_ID as string;

/**
 * Discord user data returned from authentication
 */
export interface AuthenticatedUser {
  id: string;
  username: string;
  discriminator: string;
  avatar: string | null;
  global_name: string | null;
}

/**
 * Participant data from getInstanceConnectedParticipants
 * Note: We use a flexible type to match SDK response which may have undefined values
 */
export interface InstanceParticipant {
  id: string;
  username: string;
  discriminator: string;
  avatar?: string | null;
  bot: boolean;
  flags: number;
  global_name?: string | null;
  nickname?: string;
}

/**
 * Generate Discord avatar URL with proper fallback for users without custom avatars
 */
export function getAvatarUrl(userId: string, avatarHash?: string | null, discriminator?: string): string {
  if (avatarHash) {
    // Check if it's an animated avatar (starts with a_)
    const extension = avatarHash.startsWith('a_') ? 'gif' : 'png';
    return `https://cdn.discordapp.com/avatars/${userId}/${avatarHash}.${extension}`;
  }

  // Default avatar based on discriminator or user ID
  // For new username system (discriminator is "0"), use (user_id >> 22) % 6
  // For legacy system, use discriminator % 5
  try {
    const defaultIndex = discriminator === '0' || !discriminator
      ? Number((BigInt(userId) >> BigInt(22)) % BigInt(6))
      : parseInt(discriminator) % 5;
    return `https://cdn.discordapp.com/embed/avatars/${defaultIndex}.png`;
  } catch {
    // Fallback for invalid user IDs (like "unknown")
    return `https://cdn.discordapp.com/embed/avatars/0.png`;
  }
}

/**
 * Convert a Discord user/participant to our Player type
 */
export function userToPlayer(
  user: { id: string; username: string; avatar?: string | null; discriminator?: string; global_name?: string | null },
  score: number = 0
): Player {
  return {
    id: user.id,
    username: user.global_name || user.username,
    avatar: getAvatarUrl(user.id, user.avatar, user.discriminator),
    score,
    currentGuess: null,
  };
}

/**
 * Helper to format errors for logging
 * Handles both Error objects and Discord SDK error objects
 */
function formatError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'object' && error !== null) {
    // Discord SDK errors are often plain objects
    return JSON.stringify(error, null, 2);
  }
  return String(error);
}

/**
 * Initialize the Discord SDK and authenticate the user
 *
 * For Discord Embedded Apps (Activities), the authentication flow is:
 * 1. Call sdk.ready() to initialize the SDK
 * 2. Call sdk.commands.authorize() to get an OAuth code
 * 3. Exchange the code for an access token via a backend server
 * 4. Call sdk.commands.authenticate() with the access token
 *
 * For client-side only apps without a backend, we can:
 * - Skip full OAuth and get user data from the activity participants
 * - Use getInstanceConnectedParticipants() which doesn't require OAuth scopes
 */
export async function initializeDiscordSDK(): Promise<DiscordSDK | DiscordSDKMock> {
  if (discordSdk && authenticatedUser) {
    return discordSdk;
  }

  if (!DISCORD_CLIENT_ID) {
    throw new Error('VITE_DISCORD_CLIENT_ID is not set in environment variables');
  }

  // Initialize the SDK
  discordSdk = new DiscordSDK(DISCORD_CLIENT_ID);

  try {
    // Wait for Discord to be ready
    await discordSdk.ready();
    console.log('Discord SDK is ready');

    // Log available SDK properties for debugging
    console.log('SDK instanceId:', discordSdk.instanceId);
    console.log('SDK channelId:', discordSdk.channelId);
    console.log('SDK guildId:', discordSdk.guildId);

    // Use configured token endpoint or default to /api/token (proxied to server)
    const tokenEndpoint = (import.meta.env.VITE_TOKEN_ENDPOINT as string | undefined) || '/api/token';

    // Full OAuth flow with backend token exchange
    console.log('Starting OAuth flow...');
    console.log('Token endpoint:', tokenEndpoint);
    try {
      console.log('Step 1: Calling authorize...');
      const { code } = await discordSdk.commands.authorize({
        client_id: DISCORD_CLIENT_ID,
        response_type: 'code',
        state: '',
        prompt: 'none',
        scope: [
          'identify',
          'guilds',
        ],
      });
      console.log('Step 1 complete: Got authorization code:', code ? 'YES' : 'NO');

      // Exchange the code for an access token via the backend
      console.log('Step 2: Exchanging code for token...');
      console.log('Fetching:', tokenEndpoint);

      let tokenResponse;
      try {
        tokenResponse = await fetch(tokenEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code }),
        });
        console.log('Fetch completed, status:', tokenResponse.status);
      } catch (fetchError) {
        console.error('Fetch failed:', formatError(fetchError));
        throw fetchError;
      }

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        console.error('Token exchange failed:', tokenResponse.status, errorText);
        throw new Error(`Token exchange failed: ${tokenResponse.status} - ${errorText}`);
      }

      const tokenData = await tokenResponse.json();
      console.log('Step 2 complete: Got access token');

      // Authenticate with the access token
      console.log('Step 3: Authenticating with Discord...');
      const authResponse = await discordSdk.commands.authenticate({
        access_token: tokenData.access_token,
      });

      if (!authResponse) {
        throw new Error('Authentication failed - no response');
      }

      authenticatedUser = authResponse.user as AuthenticatedUser;
      console.log('Step 3 complete: Authenticated as:', authenticatedUser.username);
      return discordSdk;
    } catch (oauthError) {
      console.error('OAuth flow failed at some step:', formatError(oauthError));
      console.log('Falling back to participant-based identification');
    }

    // Fallback: Client-side only mode using activity participants
    // getInstanceConnectedParticipants() does NOT require OAuth scopes
    console.log('Using participant-based user identification (no OAuth required)');

    // Try to get participants - this should work after sdk.ready()
    const userFromParticipants = await getCurrentUserFromParticipants();

    if (userFromParticipants) {
      authenticatedUser = userFromParticipants;
      console.log('Identified as participant:', authenticatedUser.username);
    } else {
      // Fallback: create a placeholder user
      // This allows the app to run but with limited functionality
      console.warn('Could not identify current user - using placeholder');
      console.warn('Host detection and some features may be limited');
      authenticatedUser = {
        id: 'unknown',
        username: 'Player',
        discriminator: '0',
        avatar: null,
        global_name: 'Player',
      };
    }

    return discordSdk;
  } catch (error) {
    console.error('Failed to initialize Discord SDK:', formatError(error));
    throw error;
  }
}

/**
 * Get current user info from the activity participants list
 *
 * Strategy:
 * 1. If only one non-bot participant, that's us
 * 2. Otherwise, use the first non-bot participant as the "current user"
 *    (host detection will still work based on participant order)
 */
async function getCurrentUserFromParticipants(): Promise<AuthenticatedUser | null> {
  if (!discordSdk) {
    console.log('getCurrentUserFromParticipants: SDK not initialized');
    return null;
  }

  try {
    console.log('Fetching activity participants...');
    const result = await discordSdk.commands.getInstanceConnectedParticipants();
    console.log('getInstanceConnectedParticipants result:', JSON.stringify(result, null, 2));

    const { participants } = result;

    if (!participants || participants.length === 0) {
      console.log('No participants found in activity instance');
      return null;
    }

    console.log(`Found ${participants.length} total participants`);

    // Filter out bots
    const nonBotParticipants = participants.filter((p) => !p.bot);
    console.log(`Found ${nonBotParticipants.length} non-bot participants`);

    if (nonBotParticipants.length === 0) {
      console.log('No non-bot participants found');
      return null;
    }

    if (nonBotParticipants.length === 1) {
      // Only one participant - must be us
      const p = nonBotParticipants[0];
      console.log('Single participant found, assuming this is current user:', p.username);
      return {
        id: p.id,
        username: p.username,
        discriminator: p.discriminator,
        avatar: p.avatar ?? null,
        global_name: p.global_name ?? null,
      };
    }

    // Multiple participants - use the first one as "current user"
    // This is a fallback; the first participant is typically the host
    // For proper current user detection, OAuth would be needed
    const p = nonBotParticipants[0];
    console.log(`Multiple participants found (${nonBotParticipants.length}). Using first participant as current user:`, p.username);
    console.log('Note: Without OAuth, we cannot definitively identify which participant is "us"');
    return {
      id: p.id,
      username: p.username,
      discriminator: p.discriminator,
      avatar: p.avatar ?? null,
      global_name: p.global_name ?? null,
    };
  } catch (error) {
    console.error('Failed to get activity participants:', formatError(error));
    return null;
  }
}

/**
 * Get the current Discord SDK instance
 */
export function getDiscordSDK(): DiscordSDK | DiscordSDKMock | null {
  return discordSdk;
}

/**
 * Check if SDK is initialized and authenticated
 */
export function isAuthenticated(): boolean {
  return discordSdk !== null && authenticatedUser !== null;
}

/**
 * Get information about the current authenticated user
 */
export function getCurrentUser(): AuthenticatedUser | null {
  return authenticatedUser;
}

/**
 * Get the current user as a Player type
 */
export function getCurrentUserAsPlayer(): Player | null {
  if (!authenticatedUser) {
    return null;
  }
  return userToPlayer(authenticatedUser);
}

/**
 * Get the current guild (server) ID from the SDK instance
 */
export function getCurrentGuildId(): string | null {
  const sdk = getDiscordSDK();
  if (!sdk) {
    return null;
  }
  return sdk.guildId;
}

/**
 * Get the current channel ID from the SDK instance
 */
export function getCurrentChannelId(): string | null {
  const sdk = getDiscordSDK();
  if (!sdk) {
    return null;
  }
  return sdk.channelId;
}

/**
 * Get users connected to the current activity instance
 * Returns participants converted to Player format (excludes bots)
 */
export async function getVoiceChannelUsers(): Promise<Player[]> {
  const sdk = getDiscordSDK();
  if (!sdk) {
    throw new Error('Discord SDK not initialized');
  }

  try {
    // getInstanceConnectedParticipants returns all users connected to this activity instance
    const { participants } = await sdk.commands.getInstanceConnectedParticipants();

    if (!participants || participants.length === 0) {
      console.log('No participants in activity instance');
      return [];
    }

    // Filter out bots and convert to Player format
    const players: Player[] = participants
      .filter((p) => !p.bot)
      .map((p) => userToPlayer({
        id: p.id,
        username: p.username,
        avatar: p.avatar ?? null,
        discriminator: p.discriminator,
        global_name: p.global_name ?? null,
      }));

    return players;
  } catch (error) {
    console.error('Failed to get activity participants:', formatError(error));
    throw error;
  }
}

/**
 * Subscribe to activity instance participant changes
 * Returns cleanup function
 */
export function subscribeToVoiceStateUpdates(
  callback: (players: Player[]) => void
): () => void {
  const sdk = getDiscordSDK();
  if (!sdk) {
    console.error('Discord SDK not initialized');
    return () => {};
  }

  // Get initial state
  getVoiceChannelUsers()
    .then(callback)
    .catch((err) => console.error('Error getting initial participants:', formatError(err)));

  // Track subscription for cleanup
  let isSubscribed = true;

  // Subscribe to ACTIVITY_INSTANCE_PARTICIPANTS_UPDATE event
  const subscribePromise = sdk.subscribe(
    Events.ACTIVITY_INSTANCE_PARTICIPANTS_UPDATE,
    (data) => {
      if (!isSubscribed) return;

      try {
        // Convert participants directly from event data
        const players: Player[] = data.participants
          .filter((p) => !p.bot)
          .map((p) => userToPlayer({
            id: p.id,
            username: p.username,
            avatar: p.avatar ?? null,
            discriminator: p.discriminator,
            global_name: p.global_name ?? null,
          }));
        callback(players);
      } catch (error) {
        console.error('Error in participant update handler:', formatError(error));
      }
    }
  );

  // Also poll as a fallback for reliability
  const interval = setInterval(async () => {
    if (!isSubscribed) return;
    try {
      const players = await getVoiceChannelUsers();
      callback(players);
    } catch (error) {
      console.error('Error polling participants:', formatError(error));
    }
  }, 5000);

  // Return cleanup function
  return () => {
    isSubscribed = false;
    clearInterval(interval);
    // Note: subscribe returns a Promise<EventEmitter>, not a direct unsubscribe function
    // The SDK handles cleanup internally when the activity ends
    subscribePromise.catch(() => {
      // Ignore any subscription errors on cleanup
    });
  };
}

/**
 * Determine if the given user is the host (first participant in the activity)
 * The first participant returned from getInstanceConnectedParticipants is typically
 * the instance creator/host
 */
export async function determineIsHost(userId: string): Promise<boolean> {
  const sdk = getDiscordSDK();
  if (!sdk) {
    return false;
  }

  try {
    const { participants } = await sdk.commands.getInstanceConnectedParticipants();
    if (!participants || participants.length === 0) {
      return false;
    }

    // Filter out bots and check if current user is first in the list
    const nonBotParticipants = participants.filter((p) => !p.bot);
    if (nonBotParticipants.length === 0) {
      return false;
    }

    // The first non-bot participant is considered the host
    return nonBotParticipants[0].id === userId;
  } catch (error) {
    console.error('Failed to determine host status:', formatError(error));
    return false;
  }
}

/**
 * Set the activity status for the app
 */
export async function setActivity(details: string, state?: string): Promise<void> {
  const sdk = getDiscordSDK();
  if (!sdk) {
    return;
  }

  try {
    await sdk.commands.setActivity({
      activity: {
        type: 0, // Playing
        details,
        state,
      },
    });
  } catch (error) {
    console.error('Failed to set activity:', formatError(error));
  }
}

/**
 * Fetch message history from the current channel
 * Note: This requires a backend proxy with bot permissions
 * The Discord Embedded App SDK cannot directly fetch message history
 */
export async function fetchChannelMessages(
  limit: number = 100,
  before?: string
): Promise<unknown[]> {
  const sdk = getDiscordSDK();
  if (!sdk) {
    throw new Error('Discord SDK not initialized');
  }

  const channelId = getCurrentChannelId();
  if (!channelId) {
    throw new Error('No channel ID available');
  }

  // Note: Direct message fetching is not available in the Embedded App SDK
  // This would need to be implemented via a backend service with bot permissions
  console.log(`Would fetch ${limit} messages from channel ${channelId} before ${before}`);

  // For now, return empty array - actual implementation requires backend
  return [];
}

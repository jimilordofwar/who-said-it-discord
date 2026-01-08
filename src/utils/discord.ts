import { DiscordSDK } from '@discord/embedded-app-sdk';

let discordSdk: DiscordSDK | null = null;

/**
 * Initialize the Discord SDK and authenticate the user
 */
export async function initializeDiscordSDK(): Promise<DiscordSDK> {
  if (discordSdk) {
    return discordSdk;
  }

  // Get the client ID from the URL query parameters
  // In production, this would be configured in the Discord app settings
  const queryParams = new URLSearchParams(window.location.search);
  const clientId = queryParams.get('client_id') || process.env.VITE_DISCORD_CLIENT_ID || '';

  if (!clientId) {
    throw new Error('Discord Client ID not provided. Please ensure the app is launched from Discord.');
  }

  // Initialize the SDK
  discordSdk = new DiscordSDK(clientId);

  try {
    // Setup and authenticate
    await discordSdk.ready();
    console.log('Discord SDK is ready');

    // Authorize with Discord
    const { code } = await discordSdk.commands.authorize({
      client_id: clientId,
      response_type: 'code',
      state: '',
      prompt: 'none',
      scope: [
        'identify',
        'guilds',
        'guilds.channels.read',
      ],
    });

    // Exchange the code for an access token
    // Note: In a production app, this would be done on a backend server
    // For now, we'll use the code directly as we're client-side only
    console.log('Authorization successful', { code });

    return discordSdk;
  } catch (error) {
    console.error('Failed to initialize Discord SDK:', error);
    throw error;
  }
}

/**
 * Get the current Discord SDK instance
 */
export function getDiscordSDK(): DiscordSDK | null {
  return discordSdk;
}

/**
 * Get information about the current user
 */
export async function getCurrentUser() {
  const sdk = getDiscordSDK();
  if (!sdk) {
    throw new Error('Discord SDK not initialized');
  }

  try {
    const user = await sdk.commands.getUser();
    return {
      id: user.id,
      username: user.username,
      discriminator: user.discriminator,
      avatar: user.avatar,
      avatarUrl: `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`,
    };
  } catch (error) {
    console.error('Failed to get current user:', error);
    throw error;
  }
}

/**
 * Get information about the current guild (server)
 */
export async function getCurrentGuild() {
  const sdk = getDiscordSDK();
  if (!sdk) {
    throw new Error('Discord SDK not initialized');
  }

  try {
    const guild = await sdk.commands.getSelectedGuild();
    return guild;
  } catch (error) {
    console.error('Failed to get current guild:', error);
    throw error;
  }
}

/**
 * Get information about the current channel
 */
export async function getCurrentChannel() {
  const sdk = getDiscordSDK();
  if (!sdk) {
    throw new Error('Discord SDK not initialized');
  }

  try {
    const channel = await sdk.commands.getSelectedTextChannel();
    return channel;
  } catch (error) {
    console.error('Failed to get current channel:', error);
    throw error;
  }
}

/**
 * Get users in the current voice channel
 */
export async function getVoiceChannelUsers() {
  const sdk = getDiscordSDK();
  if (!sdk) {
    throw new Error('Discord SDK not initialized');
  }

  try {
    const voiceChannel = await sdk.commands.getSelectedVoiceChannel();
    if (!voiceChannel) {
      return [];
    }

    // Get members of the voice channel
    const members = await sdk.commands.getChannelMembers({
      channel_id: voiceChannel.id,
    });

    return members;
  } catch (error) {
    console.error('Failed to get voice channel users:', error);
    throw error;
  }
}

/**
 * Subscribe to voice channel updates
 */
export function subscribeToVoiceChannelUpdates(
  callback: (users: any[]) => void
): () => void {
  const sdk = getDiscordSDK();
  if (!sdk) {
    console.error('Discord SDK not initialized');
    return () => {};
  }

  // Poll for voice channel updates every 2 seconds
  // Note: In a production app with backend, we'd use proper websocket events
  const interval = setInterval(async () => {
    try {
      const users = await getVoiceChannelUsers();
      callback(users);
    } catch (error) {
      console.error('Error polling voice channel users:', error);
    }
  }, 2000);

  // Return cleanup function
  return () => clearInterval(interval);
}

/**
 * Fetch message history from the current channel
 */
export async function fetchChannelMessages(
  limit: number = 100,
  before?: string
): Promise<any[]> {
  const sdk = getDiscordSDK();
  if (!sdk) {
    throw new Error('Discord SDK not initialized');
  }

  try {
    const channel = await getCurrentChannel();
    if (!channel) {
      throw new Error('No text channel selected');
    }

    // Note: This is a placeholder - actual message fetching would require
    // a backend service with bot permissions to access message history
    console.log(`Would fetch ${limit} messages from channel ${channel.id} before ${before}`);

    // For now, return mock data for development
    return [];
  } catch (error) {
    console.error('Failed to fetch channel messages:', error);
    throw error;
  }
}

/**
 * Set the activity status for the app
 */
export async function setActivity(details: string, state?: string) {
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
    console.error('Failed to set activity:', error);
  }
}
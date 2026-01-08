import type { Player, GameMessage } from '../types/game';

/**
 * Mock players representing a typical Discord friend group
 * Using Discord's default avatar URLs (0-5 variants)
 */
const mockPlayers: Player[] = [
  {
    id: '123456789012345678',
    username: 'xX_DarkNinja_Xx',
    avatar: 'https://cdn.discordapp.com/embed/avatars/0.png',
    score: 0,
    currentGuess: null,
  },
  {
    id: '234567890123456789',
    username: 'CoffeeAddict42',
    avatar: 'https://cdn.discordapp.com/embed/avatars/1.png',
    score: 0,
    currentGuess: null,
  },
  {
    id: '345678901234567890',
    username: 'PotatoLord',
    avatar: 'https://cdn.discordapp.com/embed/avatars/2.png',
    score: 0,
    currentGuess: null,
  },
  {
    id: '456789012345678901',
    username: 'sleepy_cat_vibes',
    avatar: 'https://cdn.discordapp.com/embed/avatars/3.png',
    score: 0,
    currentGuess: null,
  },
  {
    id: '567890123456789012',
    username: 'TacoTuesday',
    avatar: 'https://cdn.discordapp.com/embed/avatars/4.png',
    score: 0,
    currentGuess: null,
  },
];

/**
 * Mock messages that feel like real Discord chat from a friend group
 * Each message is 5-20 words as per game rules
 */
const mockMessages: GameMessage[] = [
  {
    id: 'msg_001',
    content: 'honestly i think pineapple on pizza is criminally underrated and i will die on this hill',
    authorId: '123456789012345678', // xX_DarkNinja_Xx
    timestamp: new Date('2024-11-15T14:23:00'),
  },
  {
    id: 'msg_002',
    content: 'just spent 3 hours debugging only to find a missing semicolon lmao',
    authorId: '234567890123456789', // CoffeeAddict42
    timestamp: new Date('2024-11-12T09:45:00'),
  },
  {
    id: 'msg_003',
    content: 'why do we park in driveways but drive on parkways this keeps me up at night',
    authorId: '345678901234567890', // PotatoLord
    timestamp: new Date('2024-10-28T23:15:00'),
  },
  {
    id: 'msg_004',
    content: 'my cat just knocked over my coffee and stared at me like i was the problem',
    authorId: '456789012345678901', // sleepy_cat_vibes
    timestamp: new Date('2024-11-08T16:30:00'),
  },
  {
    id: 'msg_005',
    content: 'anyone else get anxiety when someone says we need to talk or is that just me',
    authorId: '567890123456789012', // TacoTuesday
    timestamp: new Date('2024-11-01T11:00:00'),
  },
  {
    id: 'msg_006',
    content: 'bro i just saw a guy walking his cat on a leash this city is wild',
    authorId: '123456789012345678', // xX_DarkNinja_Xx
    timestamp: new Date('2024-09-20T18:45:00'),
  },
  {
    id: 'msg_007',
    content: 'reminder that water is just boneless ice and you cannot change my mind about this',
    authorId: '345678901234567890', // PotatoLord
    timestamp: new Date('2024-10-05T20:30:00'),
  },
  {
    id: 'msg_008',
    content: 'i have a meeting in 5 minutes that could have been an email send help',
    authorId: '234567890123456789', // CoffeeAddict42
    timestamp: new Date('2024-11-18T08:55:00'),
  },
  {
    id: 'msg_009',
    content: 'just realized i have been pronouncing quinoa wrong my entire life feeling betrayed',
    authorId: '567890123456789012', // TacoTuesday
    timestamp: new Date('2024-08-14T12:20:00'),
  },
  {
    id: 'msg_010',
    content: 'the urge to adopt every dog i see on the street is getting out of control',
    authorId: '456789012345678901', // sleepy_cat_vibes
    timestamp: new Date('2024-10-22T15:10:00'),
  },
  {
    id: 'msg_011',
    content: 'just got absolutely destroyed in valorant by what i assume was a 12 year old',
    authorId: '123456789012345678', // xX_DarkNinja_Xx
    timestamp: new Date('2024-11-10T21:00:00'),
  },
  {
    id: 'msg_012',
    content: 'if bread is bad for ducks why do they keep eating it checkmate scientists',
    authorId: '345678901234567890', // PotatoLord
    timestamp: new Date('2024-09-08T13:40:00'),
  },
  {
    id: 'msg_013',
    content: 'fourth coffee of the day and i can hear colors now is this normal',
    authorId: '234567890123456789', // CoffeeAddict42
    timestamp: new Date('2024-11-05T14:00:00'),
  },
  {
    id: 'msg_014',
    content: 'napped so hard i woke up in a different dimension where is everyone',
    authorId: '456789012345678901', // sleepy_cat_vibes
    timestamp: new Date('2024-10-30T17:45:00'),
  },
  {
    id: 'msg_015',
    content: 'tried to make homemade tacos and set off the smoke alarm twice new record',
    authorId: '567890123456789012', // TacoTuesday
    timestamp: new Date('2024-11-20T19:30:00'),
  },
];

/**
 * Returns the array of mock players with scores reset to 0
 */
export function getMockPlayers(): Player[] {
  return mockPlayers.map((player) => ({
    ...player,
    score: 0,
    currentGuess: null,
  }));
}

/**
 * Fisher-Yates shuffle algorithm for randomizing arrays
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Returns a random selection of messages from the specified players
 * @param count - Number of messages to return
 * @param playerIds - Array of player IDs to filter messages by
 * @returns Shuffled array of messages from the specified players
 */
export function getRandomMessages(count: number, playerIds: string[]): GameMessage[] {
  // Filter messages to only include those from specified players
  const filteredMessages = mockMessages.filter((msg) =>
    playerIds.includes(msg.authorId)
  );

  // Shuffle the filtered messages
  const shuffled = shuffleArray(filteredMessages);

  // Return the requested count (or all available if count exceeds available)
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

/**
 * Get a specific mock player by ID
 */
export function getMockPlayerById(playerId: string): Player | undefined {
  return mockPlayers.find((player) => player.id === playerId);
}

/**
 * Get all mock messages (useful for testing)
 */
export function getAllMockMessages(): GameMessage[] {
  return [...mockMessages];
}

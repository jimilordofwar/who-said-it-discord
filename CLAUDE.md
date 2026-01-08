# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Workflow Preferences

**IMPORTANT**: When working on any code-related tasks in this repository:

1. **Always use the dev agent** for implementing features or writing code. Do not write code directly without using the dev agent.

2. **Create a checklist before starting work** using the TodoWrite tool. Break down the task into clear, actionable steps so both Claude and the user can track progress.

3. **After completing any coding task**, always ask the user: "Would you like me to review the code we've just written?"

4. **When the user requests a code review**, use the code-review agent to perform the review.

## Project Overview

"Guess Who Said It" - A Discord embedded app game where players in a voice call guess who originally sent randomly selected messages from the channel's history.

## Architecture

**Client-side only application** - No backend server for V1. All logic runs in the Discord embedded webview.

### Tech Stack
- **Framework**: React + Vite + TypeScript
- **Styling**: Tailwind CSS (chosen for minimalist design flexibility)
- **State Management**: Zustand (handles game state, timers, scores, players)
- **Discord Integration**: @discord/embedded-app-sdk

### Core Data Structures

```typescript
interface Player {
  id: string;
  username: string;
  avatar: string;
  score: number;
  currentGuess: string | null; // Player ID of their guess
}

interface GameMessage {
  id: string;
  content: string;
  authorId: string;
  timestamp: Date;
}

interface GameState {
  players: Player[];
  currentRound: number;
  roundMessages: GameMessage[];
  currentMessage: GameMessage | null;
  phase: 'initial-guess' | 'multiple-choice' | 'round-summary' | 'end-game';
  timer: number;
}
```

## Game Flow

### Round Structure (30 seconds per round)
1. **Phase 1 (0-15s)**: Players see message with author hidden, make initial guess from all players
2. **Phase 2 (15-30s)**: Date revealed, 3 multiple choice options shown (correct + 2 random), players confirm/change guess

### Scoring
- Correct on first try: 2 points
- Correct after changing: 1 point
- Wrong/timeout: 0 points
- Players see only their own score during game; all scores revealed at end

### Message Filtering Rules
- Only from users currently in voice channel
- 5-20 words length
- Convert to plain text (strip markdown)
- Exclude image-only messages
- Include text from text+GIF messages
- Redact mentions of active players' names with `[REDACTED]`

## Key Technical Considerations

### Message Fetching Strategy
1. Identify active players in voice channel
2. For each player, fetch message batches from randomized points in channel history (use `before` parameter with random historical dates)
3. Collect into raw pool and filter per rules above
4. Randomly select 10 messages for game rounds
5. If insufficient messages, prompt user to play shorter game or cancel

### Authentication
Discord Embedded App SDK handles auth flow. Bot requires `View Channel` and `Read Message History` permissions.

### Real-time State Sync
Use Discord Embedded App SDK's event listeners and functions for broadcasting player actions (no custom WebSocket needed).

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type check TypeScript files
npm run type-check
```

### Project Structure

```
discord-comment-game/
├── src/
│   ├── components/     # React components
│   ├── stores/         # Zustand state stores
│   ├── utils/          # Utility functions (Discord SDK, etc.)
│   ├── types/          # TypeScript type definitions
│   ├── App.tsx         # Main app component
│   ├── main.tsx        # Entry point
│   └── index.css       # Global styles with Tailwind
├── public/             # Static assets
├── index.html          # HTML template
├── vite.config.ts      # Vite configuration
├── tailwind.config.js  # Tailwind CSS configuration
├── tsconfig.json       # TypeScript configuration
└── package.json        # Project dependencies
```

## Important Game Rules

- Minimum 3 players to start
- 10 rounds standard (with tiebreaker sudden death if needed)
- Players joining mid-game become spectators
- Players leaving mid-game are dropped, but their messages remain in pool

## Development Progress

### Completed
- [x] **Project Setup** - Vite + React + TypeScript initialized
- [x] **Dependencies** - Installed Zustand, Tailwind CSS, @discord/embedded-app-sdk
- [x] **Tailwind Configuration** - Set up with Discord-themed color palette
- [x] **Project Structure** - Created folders: components, stores, utils, types
- [x] **Zustand Store** - Game state store with Player, GameMessage, GameState interfaces and actions
- [x] **Discord SDK Utils** - SDK initialization, user/guild/channel helpers (`src/utils/discord.ts`)
- [x] **Type Definitions** - TypeScript interfaces in `src/types/game.ts`
- [x] **Basic App Shell** - Main App component with SDK initialization and loading states
- [x] **Dev Mode Config** - `src/config.ts` with `VITE_DEV_MODE` support (1 player minimum in dev)
- [x] **Vite Config** - Cloudflare tunnel hosts allowed for local Discord testing
- [x] **OAuth Token Exchange** - Vite middleware for Discord OAuth token exchange (`vite.config.ts`)
- [x] **Lobby Screen UI** - PlayerCard, PlayerCardSkeleton, and Lobby components
- [x] **Discord SDK Integration** - Full OAuth flow, participant fetching, host detection
- [x] **useDiscordUsers Hook** - React hook for managing Discord users and authentication

### In Progress
- [ ] Game round flow implementation

### Not Started
- [ ] Message fetching from Discord channel (requires bot with message history permissions)
- [ ] Message filtering logic (word count, content type, etc.)
- [ ] Name redaction system
- [ ] Phase 1: Initial guess UI
- [ ] Phase 2: Multiple choice UI
- [ ] Timer component
- [ ] Scoring system implementation
- [ ] Round summary screen
- [ ] End game / winner screen
- [ ] Tiebreaker sudden death mode
- [ ] Player join/leave handling
- [ ] Real-time state sync between players

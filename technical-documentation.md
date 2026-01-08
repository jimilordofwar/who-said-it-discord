# Technical Documentation: "Guess Who Said It"

## 1. Overview

This document outlines the technical architecture, data structures, and implementation strategy for the "Guess Who Said It" Discord embedded application. It is a companion to the `prd.md`, which defines the project's functional requirements.

## 2. Architecture

The application will be a client-side only, single-page React application running entirely within the Discord client's embedded webview.

### 2.1. Frontend
*   **Framework:** **React** with **Vite** for a fast development environment.
*   **UI Library:** **Tailwind CSS**. This utility-first CSS framework was chosen to provide maximum design flexibility, allowing us to build a custom, minimalist game UI without being constrained by pre-built component libraries like Material UI.
*   **State Management:** **Zustand**. For managing the global game state (e.g., current round, scores, players, timers), Zustand provides a simple, modern, and powerful solution. It's less complex than Redux but more robust for frequent state updates than React's built-in Context API, making it ideal for a game environment.
*   **Discord SDK Integration:** All interactions with the Discord client (fetching user data, permissions, etc.) will be handled through the official `@discord/embedded-app-sdk`.

### 2.2. Backend
For Version 1, **no dedicated backend server is required**. All logic, including game state management and API calls to Discord, will be handled client-side.

### 2.3. External APIs
*   **Discord Embedded App SDK:** The primary interface for client integration.
*   **Discord API:** Used for fetching channel message history.

## 3. Data Model

The following structures will be used to represent game data, managed by Zustand.

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
  // ... other state properties
}
```

## 4. Key Technical Challenges & Strategy

### 4.1. API Authentication & Security
The application will rely on the Discord Embedded App SDK's authentication flow. When the app is added to a server, it will be associated with a bot identity that has been granted `View Channel` and `Read Message History` permissions. The SDK will provide a temporary, authenticated context to make necessary Discord API calls securely, eliminating the need to store a persistent bot token on the client.

### 4.2. Message Fetching Strategy
To create a diverse pool of messages while respecting API limits, the following strategy will be employed:
1.  On game start, identify the list of active players.
2.  For each player, make a call to the Discord API to fetch a batch of messages from the channel. To ensure variety, the fetch will target a randomized point in the channel's history (e.g., by using the `before` parameter with a random historical date).
3.  Collect all fetched messages into a large, raw pool.
4.  Filter this pool according to the rules in `prd.md` (word count, content type, etc.).
5.  Randomly select 10 messages from the valid pool to be used for the game's rounds.

### 4.3. Real-time Updates
All real-time state synchronization (e.g., broadcasting player guesses, updating scores, advancing rounds) will be managed using the functions and event listeners provided by the Discord Embedded App SDK. This avoids the complexity of a custom WebSocket implementation for V1.

## 5. Development Environment
*   **Runtime:** Node.js (LTS version)
*   **Package Manager:** npm
*   **Setup:** The project will be initialized as a standard Vite + React (TypeScript) project.

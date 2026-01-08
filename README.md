# Guess Who Said It - Discord Embedded App

A fun Discord embedded app game where players in a voice channel guess who originally sent randomly selected messages from the channel's history.

## Project Setup

This project uses:
- **React** with **TypeScript** for type-safe development
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Zustand** for state management
- **Discord Embedded App SDK** for Discord integration

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example` and add your Discord application's Client ID:
   ```
   VITE_DISCORD_CLIENT_ID=your_discord_client_id_here
   ```

## Development

Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Building for Production

Build the application:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Project Structure

- `/src/components` - React components for the game UI
- `/src/stores` - Zustand stores for game state management
- `/src/utils` - Utility functions (Discord SDK integration, etc.)
- `/src/types` - TypeScript type definitions

## Game Features

- **Minimum 3 players required** to start a game
- **10 rounds** of guessing with tiebreaker sudden death if needed
- **Two-phase guessing system**:
  - Phase 1 (15s): See message with author hidden, make initial guess
  - Phase 2 (15s): Date revealed, multiple choice options shown
- **Scoring system**:
  - 2 points for correct first guess
  - 1 point for correct after changing
  - 0 points for wrong/timeout

## Discord App Requirements

Your Discord application needs the following:
- **Bot permissions**: View Channel, Read Message History
- **OAuth2 scopes**: identify, guilds, guilds.channels.read

## Note on Node Version

This project was set up to be compatible with various Node versions. For best results, use Node 18 or later.
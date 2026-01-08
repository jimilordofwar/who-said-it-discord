# Project Requirements Document: Discord Comment Game

## 1. Introduction / Overview

*   **Project Name:** "Guess Who Said It"
*   **High-Level Summary:** A Discord embedded app game where players in a voice call guess who originally sent a randomly selected message from the channel's history. The game involves multiple rounds, a scoring system, and a process of elimination to identify the author.

## 2. Goal

The primary objective is to create an engaging and fun social, competitive game for close friends to play, testing how well they know each other's messaging habits.

## 3. Target Audience

The game is intended for small, private servers with close-knit friend groups.

## 4. Core Features (Functional Requirements)

### 4.1. Game Setup & Initialization
*   **Start Mechanism:** The game is initiated via a slash command: `/guess-who start`.
*   **Permissions:** Anyone in the channel can start a game.
*   **Player Minimum:** Requires a minimum of 3 players in the voice channel to start.
*   **Lobby:** After starting, a lobby screen will appear, showing the players who are participating and giving the initiator a "Start Game" button.

### 4.2. Message Fetching & Selection
*   **Message Source:** Messages will be pulled only from the channel where the game is initiated.
*   **Time Frame:** The entire message history ("all time") of the channel will be considered.
*   **Filtering & Content:**
    *   **Author Status:** Only messages from users currently present in the voice channel are eligible. Messages from users who have left the server are ignored.
    *   **Length:** Messages must be between 5 and 20 words.
    *   **Formatting:** All message content will be converted to plain text, removing any special markdown or formatting.
    *   **Attachments:** Messages that are only an image or GIF are excluded. Messages that contain text and a GIF are included (text only). Messages that contain an image (with or without text) are excluded.
*   **Contingency:** If not enough messages are found to meet the 10-round requirement, the game will notify the users and present a choice: play a shorter game with the number of rounds available, or end the game.

### 4.3. Game Round Flow
*   **Round Structure:** Each round is 30 seconds long, split into two phases.
*   **Phase 1: Initial Guess (0-15 seconds)**
    *   A message is displayed with the author's name, avatar, and the date hidden.
    *   Players have 15 seconds to submit their initial guess from a list of all active players.
*   **Phase 2: Multiple Choice Guess (15-30 seconds)**
    *   At the 15-second mark, the game automatically reveals the date of the message.
    *   It also presents 3 user options: the correct author and two incorrect users chosen randomly from the other players in the game.
    *   The player's choice from Phase 1 will be visually highlighted, allowing them to clearly see if they are sticking with their gut or changing their mind.
    *   Players have 15 seconds to lock in their final answer.
*   **Time Limit:** If a player does not lock in an answer before the 30-second timer expires, they receive 0 points for the round.
*   **Round Summary:** After each round, the correct author's profile image and username are revealed before the next round begins.
*   **Round Progression:** A standard game consists of up to 10 rounds.

### 4.4. Scoring System
*   **Correct guess on the first try (Phase 1):** 2 points.
*   **Correct guess after changing mind (Phase 2):** 1 point.
*   **Incorrect guess / Timeout:** 0 points.
*   **Score Visibility:** General scores are hidden until the end of the game. However, each player will be able to see their own score throughout the game.

### 4.5. End of Game
*   **Conclusion:** The game concludes after all rounds are complete.
*   **Tie-Breaker:** If two or more players are tied for first place, they enter a "head-to-head" sudden death mode. They will play additional rounds until one person scores higher in a round, declaring them the winner.
*   **Winner Declaration:** A final screen will show the winner with a crown emoji, followed by a list of all players and their final scores.

### 4.6. Player State Management
*   **Joining Mid-Game:** If a user joins the voice channel after a game has started, they will enter as a spectator and must wait for the next game to play.
*   **Leaving Mid-Game:** If an active player leaves the voice channel, they are dropped from the game and the leaderboard. However, their historical messages remain in the pool and can still be used in subsequent rounds.

### 4.7. Content Handling
*   **Name Redaction:** The game will attempt to find mentions of active players' names within a message's text and replace them with `[REDACTED]` to avoid giving away clues.

## 5. Technical Requirements (Non-Functional Requirements)

*   **Platform:** Discord Embedded App SDK
*   **Technology Stack:**
    *   **Frontend:** React
    *   **Backend:** None required for V1.
*   **Data Storage:** Scores and game state will be stored in-memory for the duration of a single game session only.
*   **Permissions:** The app will require permission to read message history in the server.

## 6. Design & UX

*   **Theme/Aesthetic:** Minimalist.
*   **UI Elements:**
    *   Main game screen to display the message.
    *   Area for blanked-out user info (represented by a generic silhouette).
    *   Player list for guessing.
    *   Leaderboard view.
    *   Start and End game screens.

## 7. Out of Scope (for V1)

*   Persistent user profiles or stats across servers.
*   Different game modes or custom rule sets.
*   Paid features or monetization.

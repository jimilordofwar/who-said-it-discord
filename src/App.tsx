import { useGameStore } from './stores/gameStore'
import { useDiscordUsers } from './hooks/useDiscordUsers'
import { Lobby } from './components/Lobby'
import { isDev } from './config'

function App() {
  const { phase, startGame } = useGameStore()
  const {
    currentUser,
    voiceChannelUsers,
    isLoading,
    error,
    isHost,
  } = useDiscordUsers()

  const handleStartGame = () => {
    console.log('Starting game...')
    startGame()
  }

  if (error) {
    return (
      <div className="min-h-screen bg-discord-darker flex items-center justify-center p-4">
        <div className="bg-discord-dark rounded-lg p-6 max-w-md">
          <h2 className="text-red-500 text-xl font-bold mb-2">Error</h2>
          <p className="text-discord-light">{error.message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-discord-darker text-discord-lighter p-4">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-discord-primary mb-2">
            Guess Who Said It
          </h1>
          <p className="text-discord-light">
            A game of channel history and memory
          </p>
          {isDev && (
            <span className="text-xs text-discord-muted">(Dev mode)</span>
          )}
        </header>

        <main className="bg-discord-dark rounded-lg p-6">
          {phase === 'lobby' && (
            <Lobby
              players={voiceChannelUsers}
              isHost={isHost}
              currentUserId={currentUser?.id}
              onStartGame={handleStartGame}
              isLoading={isLoading}
            />
          )}
          {phase !== 'lobby' && (
            <div className="text-center">
              <p className="text-discord-light">
                Game phase: <span className="text-discord-primary font-medium">{phase}</span>
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default App
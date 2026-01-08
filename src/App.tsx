import { useEffect, useState } from 'react'
import { useGameStore } from './stores/gameStore'
import { initializeDiscordSDK } from './utils/discord'

function App() {
  const [isSDKReady, setIsSDKReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { players, phase } = useGameStore()

  useEffect(() => {
    initializeDiscordSDK()
      .then(() => {
        setIsSDKReady(true)
        console.log('Discord SDK initialized successfully')
      })
      .catch((err) => {
        console.error('Failed to initialize Discord SDK:', err)
        setError('Failed to connect to Discord. Please make sure you\'re running this app within Discord.')
      })
  }, [])

  if (error) {
    return (
      <div className="min-h-screen bg-discord-darker flex items-center justify-center p-4">
        <div className="bg-discord-dark rounded-lg p-6 max-w-md">
          <h2 className="text-red-500 text-xl font-bold mb-2">Error</h2>
          <p className="text-discord-light">{error}</p>
        </div>
      </div>
    )
  }

  if (!isSDKReady) {
    return (
      <div className="min-h-screen bg-discord-darker flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse-slow text-discord-primary text-4xl mb-4">🎮</div>
          <p className="text-discord-light">Connecting to Discord...</p>
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
        </header>

        <main className="bg-discord-dark rounded-lg p-6">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4">Welcome!</h2>
            <p className="text-discord-light mb-4">
              Current phase: <span className="text-discord-primary font-medium">{phase}</span>
            </p>
            <p className="text-discord-light">
              Players connected: <span className="text-discord-primary font-medium">{players.length}</span>
            </p>
            {players.length < 3 && (
              <p className="text-yellow-400 mt-4">
                Waiting for at least 3 players to join...
              </p>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default App
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DISCORD_CLIENT_ID: string
  readonly VITE_DEV_MODE: string
  readonly VITE_SKIP_SDK?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

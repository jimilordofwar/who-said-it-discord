import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import type { ViteDevServer } from 'vite'

// Token exchange middleware for Discord OAuth
function discordTokenExchange(clientId: string, clientSecret: string) {
  return {
    name: 'discord-token-exchange',
    configureServer(server: ViteDevServer) {
      console.log('[Token Exchange] Middleware registered');
      console.log('[Token Exchange] CLIENT_ID:', clientId ? 'SET' : 'MISSING');
      console.log('[Token Exchange] CLIENT_SECRET:', clientSecret ? 'SET' : 'MISSING');

      server.middlewares.use('/api/token', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        let body = '';
        req.on('data', (chunk) => { body += chunk; });
        req.on('end', async () => {
          try {
            const { code } = JSON.parse(body);

            if (!code) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Code is required' }));
              return;
            }

            console.log('[Token Exchange] Received code, exchanging for token...');

            // For Discord Activities, the redirect_uri should be the discordsays.com URL
            const redirectUri = `https://${clientId}.discordsays.com`;

            const response = await fetch('https://discord.com/api/oauth2/token', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
              },
              body: new URLSearchParams({
                client_id: clientId,
                client_secret: clientSecret,
                grant_type: 'authorization_code',
                code,
                redirect_uri: redirectUri,
              }),
            });

            if (!response.ok) {
              const errorText = await response.text();
              console.error('[Token Exchange] Discord API error:', response.status, errorText);
              res.statusCode = response.status;
              res.end(JSON.stringify({ error: 'Token exchange failed', details: errorText }));
              return;
            }

            const data = await response.json();
            console.log('[Token Exchange] Success!');

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ access_token: data.access_token }));
          } catch (err) {
            console.error('[Token Exchange] Error:', err);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: 'Internal server error' }));
          }
        });
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on mode
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      discordTokenExchange(env.VITE_DISCORD_CLIENT_ID, env.DISCORD_CLIENT_SECRET),
    ],
    server: {
      port: 3000,
      host: true,
      allowedHosts: ['.trycloudflare.com'],
    },
  };
})
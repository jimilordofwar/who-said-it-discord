import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.SERVER_PORT || 3001;

app.use(express.json());

// Log startup config
console.log('Server config:');
console.log('  CLIENT_ID:', process.env.VITE_DISCORD_CLIENT_ID ? 'SET' : 'MISSING');
console.log('  CLIENT_SECRET:', process.env.DISCORD_CLIENT_SECRET ? 'SET' : 'MISSING');

// Token exchange endpoint
app.post('/api/token', async (req, res) => {
  console.log('Token exchange request received');
  const { code } = req.body;

  if (!code) {
    console.log('Error: No code provided');
    return res.status(400).json({ error: 'Code is required' });
  }

  console.log('Exchanging code for token...');

  try {
    const response = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.VITE_DISCORD_CLIENT_ID!,
        client_secret: process.env.DISCORD_CLIENT_SECRET!,
        grant_type: 'authorization_code',
        code,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Token exchange failed:', response.status, error);
      return res.status(response.status).json({ error: 'Token exchange failed', details: error });
    }

    const data = await response.json();
    console.log('Token exchange successful');
    res.json({ access_token: data.access_token });
  } catch (error) {
    console.error('Token exchange error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

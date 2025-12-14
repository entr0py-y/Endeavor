import type { NextApiRequest, NextApiResponse } from 'next';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username, password, displayName } = req.body;

    console.log('Register request:', { username, password: '***', displayName });

    // For demo purposes - replace with actual database logic
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required', received: { username: !!username, password: !!password } });
    }

    // Mock user creation
    const user = {
      _id: `user_${Date.now()}`,
      username,
      displayName: displayName || username,
      email: `${username}@example.com`,
      points: 0,
      level: 1,
      badges: [],
      questsCompleted: 0,
      createdAt: new Date().toISOString()
    };

    return res.status(201).json({
      user,
      token: `token_${Date.now()}`,
      message: 'Account created successfully'
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Registration failed' });
  }
}

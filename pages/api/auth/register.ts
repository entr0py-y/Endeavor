import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username, email, password } = req.body;

    // For demo purposes - replace with actual database logic
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields required' });
    }

    // Mock user creation
    const user = {
      _id: `user_${Date.now()}`,
      username,
      email,
      points: 0,
      level: 1,
      badges: [],
      questsCompleted: 0,
      createdAt: new Date().toISOString()
    };

    return res.status(201).json({
      user,
      token: `token_${Date.now()}`
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Registration failed' });
  }
}

import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Generate a guest user
    const guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const guestUser = {
      _id: guestId,
      username: `Guest${Math.floor(Math.random() * 10000)}`,
      isGuest: true,
      points: 0,
      level: 1,
      badges: [],
      questsCompleted: 0,
      createdAt: new Date().toISOString()
    };

    return res.status(200).json({
      user: guestUser,
      token: guestId // Simple token for guest session
    });
  } catch (error) {
    console.error('Guest session error:', error);
    return res.status(500).json({ error: 'Failed to create guest session' });
  }
}

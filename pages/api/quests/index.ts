import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    // Return mock quests
    const quests = [
      {
        _id: '1',
        title: 'Beach Cleanup Challenge',
        description: 'Clean up trash from the local beach',
        type: 'cleanup',
        difficulty: 'easy',
        points: 50,
        location: 'Santa Monica Beach',
        status: 'available'
      },
      {
        _id: '2',
        title: 'Park Restoration',
        description: 'Help restore the community park',
        type: 'restoration',
        difficulty: 'medium',
        points: 100,
        location: 'Central Park',
        status: 'available'
      }
    ];
    return res.status(200).json(quests);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

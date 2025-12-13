import type { NextApiRequest, NextApiResponse } from 'next';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

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

  if (req.method === 'POST') {
    try {
      const { title, description, location, beforePhoto, address } = req.body;

      if (!title || !description) {
        return res.status(400).json({ error: 'Title and description are required' });
      }

      // Create a new quest
      const newQuest = {
        _id: `quest_${Date.now()}`,
        title,
        description,
        location: location || { lat: 37.7749, lng: -122.4194 },
        beforePhoto: beforePhoto || 'https://via.placeholder.com/400x300?text=Quest+Photo',
        address: address || 'Unknown Location',
        type: 'cleanup',
        difficulty: 'easy',
        points: 50,
        status: 'available',
        createdAt: new Date().toISOString()
      };

      return res.status(201).json({
        message: 'Quest posted successfully!',
        quest: newQuest
      });
    } catch (error) {
      console.error('Error creating quest:', error);
      return res.status(500).json({ error: 'Failed to create quest' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

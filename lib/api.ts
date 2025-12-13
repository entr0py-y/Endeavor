const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export const api = {
  // Auth
  login: async (username: string, password: string) => {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    return res.json();
  },

  register: async (username: string, password: string, displayName?: string) => {
    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, displayName })
    });
    return res.json();
  },

  guestLogin: async () => {
    const res = await fetch(`${API_URL}/api/auth/guest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    return res.json();
  },

  // Users
  getProfile: async (username: string, token: string) => {
    const res = await fetch(`${API_URL}/api/users/profile/${username}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },

  updateProfile: async (data: any, token: string) => {
    const res = await fetch(`${API_URL}/api/users/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  getLeaderboard: async (token: string) => {
    const res = await fetch(`${API_URL}/api/users/leaderboard`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },

  searchUsers: async (query: string, token: string) => {
    const res = await fetch(`${API_URL}/api/users/search?q=${encodeURIComponent(query)}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },

  // Quests
  getQuests: async (token: string, params?: any) => {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    const res = await fetch(`${API_URL}/api/quests${queryString}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },

  createQuest: async (data: any, token: string) => {
    const res = await fetch(`${API_URL}/api/quests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    
    const text = await res.text();
    let json;
    try {
      json = JSON.parse(text);
    } catch (e) {
      console.error('Response is not JSON:', text);
      throw new Error('Server returned invalid response');
    }
    
    if (!res.ok) {
      throw new Error(json.error || 'Failed to create quest');
    }
    return json;
  },

  completeQuest: async (questId: string, afterPhoto: string, token: string) => {
    const res = await fetch(`${API_URL}/api/quests/${questId}/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ afterPhoto })
    });
    return res.json();
  },

  deleteQuest: async (questId: string, token: string) => {
    const res = await fetch(`${API_URL}/api/quests/${questId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },

  // Friends
  getFriends: async (token: string) => {
    const res = await fetch(`${API_URL}/api/friends`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },

  getFriendRequests: async (token: string) => {
    const res = await fetch(`${API_URL}/api/friends/requests`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },

  sendFriendRequest: async (username: string, token: string) => {
    const res = await fetch(`${API_URL}/api/friends/request/${username}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },

  acceptFriendRequest: async (userId: string, token: string) => {
    const res = await fetch(`${API_URL}/api/friends/accept/${userId}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },

  declineFriendRequest: async (userId: string, token: string) => {
    const res = await fetch(`${API_URL}/api/friends/decline/${userId}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },

  removeFriend: async (userId: string, token: string) => {
    const res = await fetch(`${API_URL}/api/friends/${userId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },

  // Chat
  getMessages: async (userId: string, token: string) => {
    const res = await fetch(`${API_URL}/api/chat/${userId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },

  sendMessage: async (recipientId: string, content: string, token: string) => {
    const res = await fetch(`${API_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ recipientId, content })
    });
    return res.json();
  },

  getUnreadCount: async (token: string) => {
    const res = await fetch(`${API_URL}/api/chat/unread/count`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },

  getConversations: async (token: string) => {
    const res = await fetch(`${API_URL}/api/chat/conversations/list`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  }
};

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/store';
import { api } from '@/lib/api';
import CursorGlow from '@/components/CursorGlow';
import RotatingCube from '@/components/RotatingCube';
import FollowCube from '@/components/FollowCube';
import RedBars from '@/components/RedBars';
import Card from '@/components/Card';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';

export default function FriendsPage() {
  const router = useRouter();
  const { token, isAuthenticated } = useAuthStore();
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChat, setSelectedChat] = useState<any>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
      return;
    }
    loadData();
  }, [isAuthenticated]);

  const loadData = async () => {
    try {
      const [friendsRes, requestsRes] = await Promise.all([
        api.getFriends(token!),
        api.getFriendRequests(token!)
      ]);
      if (friendsRes.friends) setFriends(friendsRes.friends);
      if (requestsRes.requests) setRequests(requestsRes.requests);
    } catch (err) {
      console.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (searchQuery.length < 2) return;
    try {
      const result = await api.searchUsers(searchQuery, token!);
      if (result.users) setSearchResults(result.users);
    } catch (err) {
      console.error('Search failed');
    }
  };

  const handleSendRequest = async (username: string) => {
    try {
      const result = await api.sendFriendRequest(username, token!);
      alert(result.message || 'Friend request sent');
      setSearchResults([]);
      setSearchQuery('');
    } catch (err) {
      alert('Failed to send request');
    }
  };

  const handleAccept = async (userId: string) => {
    try {
      const result = await api.acceptFriendRequest(userId, token!);
      alert(result.message || 'Friend request accepted');
      loadData();
    } catch (err) {
      alert('Failed to accept request');
    }
  };

  const handleDecline = async (userId: string) => {
    try {
      await api.declineFriendRequest(userId, token!);
      loadData();
    } catch (err) {
      alert('Failed to decline request');
    }
  };

  return (
    <div className="min-h-screen w-full bg-nothing-black">
      <RotatingCube />
      <FollowCube />
      <RedBars />
      <CursorGlow />
      
      <header className="border-b border-white/15 sticky top-0 bg-nothing-black z-40">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <h1 
              className="text-2xl font-bold tracking-wider cursor-none hover:text-nothing-red transition-colors"
              onClick={() => router.push('/dashboard')}
            >
              SWEEPX
            </h1>
            <button
              onClick={() => router.push('/dashboard')}
              className="nothing-button text-xs px-4 py-2"
            >
              BACK
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-12"
        >
          {/* Search */}
          <Card>
            <h2 className="text-xl font-bold dot-matrix tracking-wider mb-6">FIND FRIENDS</h2>
            <div className="flex gap-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="nothing-input flex-1"
                placeholder="Search by username..."
              />
              <button onClick={handleSearch} className="nothing-button-primary px-8">
                SEARCH
              </button>
            </div>
            {searchResults.length > 0 && (
              <div className="mt-6 space-y-2">
                {searchResults.map((user: any) => (
                  <div key={user._id} className="flex items-center justify-between p-4 border border-white/10">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                        {user.avatar || '👤'}
                      </div>
                      <div>
                        <p className="font-bold">{user.displayName || user.username}</p>
                        <p className="text-sm text-white/40">@{user.username}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleSendRequest(user.username)}
                      className="nothing-button text-xs px-4 py-2"
                    >
                      ADD
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Friend Requests */}
          {requests.length > 0 && (
            <Card>
              <h2 className="text-xl font-bold dot-matrix tracking-wider mb-6">FRIEND REQUESTS</h2>
              <div className="space-y-4">
                {requests.map((req: any) => (
                  <div key={req._id} className="flex items-center justify-between p-4 border border-white/10">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                        {req.from.avatar || '👤'}
                      </div>
                      <div>
                        <p className="font-bold">{req.from.displayName || req.from.username}</p>
                        <p className="text-sm text-white/40">@{req.from.username}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAccept(req.from._id)}
                        className="nothing-button-primary text-xs px-4 py-2"
                      >
                        ACCEPT
                      </button>
                      <button
                        onClick={() => handleDecline(req.from._id)}
                        className="nothing-button text-xs px-4 py-2"
                      >
                        DECLINE
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Friends List */}
          <Card>
            <h2 className="text-xl font-bold dot-matrix tracking-wider mb-6">YOUR FRIENDS</h2>
            {loading ? (
              <p className="text-center py-12 text-white/60 animate-pulse dot-matrix">
                Loading...
              </p>
            ) : friends.length === 0 ? (
              <p className="text-center py-12 text-white/60 dot-matrix">
                No friends yet. Start searching!
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {friends.map((friend: any) => (
                  <div
                    key={friend._id}
                    className="flex items-center justify-between p-6 border border-white/10 hover:border-nothing-red/50 transition-colors cursor-none"
                    onClick={() => setSelectedChat(friend)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-xl">
                        {friend.avatar || '👤'}
                      </div>
                      <div>
                        <p className="font-bold dot-matrix">{friend.displayName || friend.username}</p>
                        <p className="text-sm text-white/40">Level {friend.level}</p>
                      </div>
                    </div>
                    <button className="nothing-button text-xs px-4 py-2">
                      CHAT
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </motion.div>
      </main>

      <Footer />

      {/* Simple Chat Modal */}
      {selectedChat && (
        <ChatModal friend={selectedChat} onClose={() => setSelectedChat(null)} />
      )}
    </div>
  );
}

function ChatModal({ friend, onClose }: any) {
  const { token } = useAuthStore();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      const result = await api.getMessages(friend._id, token!);
      if (result.messages) setMessages(result.messages);
    } catch (err) {
      console.error('Failed to load messages');
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    try {
      await api.sendMessage(friend._id, newMessage, token!);
      setNewMessage('');
      loadMessages();
    } catch (err) {
      alert('Failed to send message');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center px-6" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="nothing-card p-8 max-w-2xl w-full max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold dot-matrix tracking-wider">
            CHAT WITH {friend.displayName || friend.username}
          </h2>
          <button onClick={onClose} className="text-white/60 hover:text-white">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto mb-6 space-y-4 min-h-[300px]">
          {messages.length === 0 ? (
            <p className="text-center text-white/40 py-12 dot-matrix">No messages yet</p>
          ) : (
            messages.map((msg: any) => (
              <div
                key={msg._id}
                className={`p-4 border border-white/10 ${
                  msg.sender._id === friend._id ? 'ml-0 mr-12' : 'ml-12 mr-0 border-nothing-red/30'
                }`}
              >
                <p className="text-sm">{msg.content}</p>
                <p className="text-xs text-white/40 mt-2">
                  {new Date(msg.createdAt).toLocaleTimeString()}
                </p>
              </div>
            ))
          )}
        </div>

        <div className="flex gap-4">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            className="nothing-input flex-1"
            placeholder="Type a message..."
          />
          <button onClick={handleSend} className="nothing-button-primary px-8">
            SEND
          </button>
        </div>
      </motion.div>
    </div>
  );
}

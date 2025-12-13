import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/store';
import { api } from '@/lib/api';
import CursorGlow from '@/components/CursorGlow';
import CosmicClouds from '@/components/CosmicClouds';
import Card from '@/components/Card';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';

export default function LeaderboardPage() {
  const router = useRouter();
  const { token, isAuthenticated } = useAuthStore();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
      return;
    }
    loadLeaderboard();
  }, [isAuthenticated]);

  const loadLeaderboard = async () => {
    try {
      const result = await api.getLeaderboard(token!);
      if (result.users) {
        setUsers(result.users);
      }
    } catch (err) {
      console.error('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-nothing-black">
      <CosmicClouds />
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

      <main className="max-w-4xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-3xl font-bold dot-matrix tracking-wider mb-12 text-center">
            LEADERBOARD
          </h2>

          {loading ? (
            <Card>
              <p className="text-center py-12 text-white/60 animate-pulse dot-matrix">
                Loading rankings...
              </p>
            </Card>
          ) : users.length === 0 ? (
            <Card>
              <p className="text-center py-12 text-white/60 dot-matrix">
                No rankings yet
              </p>
            </Card>
          ) : (
            <Card>
              <div className="space-y-4">
                {users.map((user: any, index: number) => (
                  <div
                    key={user._id}
                    className="flex items-center justify-between p-4 border border-white/10 hover:border-nothing-red/50 transition-colors"
                  >
                    <div className="flex items-center gap-6">
                      <div className={`text-2xl font-bold dot-matrix w-12 text-center ${
                        index === 0 ? 'text-yellow-500' :
                        index === 1 ? 'text-gray-400' :
                        index === 2 ? 'text-orange-600' :
                        'text-white/60'
                      }`}>
                        #{index + 1}
                      </div>
                      <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                        {user.avatar || '👤'}
                      </div>
                      <div>
                        <p className="font-bold dot-matrix">{user.displayName || user.username}</p>
                        <p className="text-sm text-white/40">@{user.username}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-nothing-red">{user.xp}</p>
                      <p className="text-xs text-white/40 dot-matrix">XP</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/store';
import { api } from '@/lib/api';
import CursorGlow from '@/components/CursorGlow';
import CosmicClouds from '@/components/CosmicClouds';
import RotatingCube from '@/components/RotatingCube';
import FollowCube from '@/components/FollowCube';
import RedBars from '@/components/RedBars';
import Card from '@/components/Card';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';

export default function ProfilePage() {
  const router = useRouter();
  const { user, token, isAuthenticated, updateUser } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const result = await api.updateProfile({ displayName, bio }, token!);
      if (result.user) {
        updateUser(result.user);
        setEditing(false);
        alert('Profile updated!');
      }
    } catch (err) {
      alert('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

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

      <main className="max-w-4xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <Card>
            <div className="text-center mb-12">
              <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-white/10 flex items-center justify-center text-5xl">
                {user.avatar || '👤'}
              </div>
              <h2 className="text-3xl font-bold dot-matrix tracking-wider mb-2">
                {user.displayName || user.username}
              </h2>
              <p className="text-white/60 text-sm">@{user.username}</p>
            </div>

            {editing ? (
              <div className="space-y-6">
                <div>
                  <label className="block text-xs dot-matrix tracking-wider text-white/60 mb-2">
                    DISPLAY NAME
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="nothing-input w-full"
                    placeholder="Your display name"
                  />
                </div>
                <div>
                  <label className="block text-xs dot-matrix tracking-wider text-white/60 mb-2">
                    BIO
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="nothing-input w-full min-h-[100px] resize-none"
                    placeholder="Tell us about yourself..."
                    maxLength={200}
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={() => setEditing(false)}
                    className="nothing-button flex-1 py-3"
                  >
                    CANCEL
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="nothing-button-primary flex-1 py-3 disabled:opacity-50"
                  >
                    {loading ? 'SAVING...' : 'SAVE'}
                  </button>
                </div>
              </div>
            ) : (
              <>
                {user.bio && (
                  <p className="text-white/80 text-center mb-8">{user.bio}</p>
                )}
                <button
                  onClick={() => setEditing(true)}
                  className="nothing-button w-full py-3"
                >
                  EDIT PROFILE
                </button>
              </>
            )}
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <div className="text-center">
                <h3 className="text-4xl font-bold text-nothing-red mb-2 dot-matrix">{user.xp}</h3>
                <p className="text-white/60 text-sm">TOTAL XP</p>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <h3 className="text-4xl font-bold text-nothing-red mb-2 dot-matrix">{user.level}</h3>
                <p className="text-white/60 text-sm">LEVEL</p>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <h3 className="text-4xl font-bold text-nothing-red mb-2 dot-matrix">{user.questsCompleted || 0}</h3>
                <p className="text-white/60 text-sm">COMPLETED</p>
              </div>
            </Card>
          </div>

          {user.badges && user.badges.length > 0 && (
            <Card>
              <h3 className="text-xl font-bold tracking-wider mb-6">BADGES</h3>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                {user.badges.map((badge: any, i: number) => (
                  <div key={i} className="text-center">
                    <div className="text-4xl mb-2">🏆</div>
                    <p className="text-xs text-white/60">{badge.name}</p>
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

import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store';
import { api } from '../../lib/api';
import RotatingCube from '../../components/RotatingCube';
import FollowCube from '../../components/FollowCube';
import CursorGlow from '../../components/CursorGlow';
import RedBars from '../../components/RedBars';

export default function QuestDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { token } = useAuthStore();
  const [quest, setQuest] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id && token) {
      fetchQuest();
    }
  }, [id, token]);

  const fetchQuest = async () => {
    try {
      const response = await fetch(`http://localhost:5001/api/quests/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setQuest(data);
    } catch (error) {
      console.error('Failed to fetch quest:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!quest) return;
    
    try {
      const response = await fetch(`http://localhost:5001/api/quests/${id}/accept`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert(data.message);
        router.push('/dashboard');
      } else {
        alert(data.message || 'Failed to accept quest');
      }
    } catch (error) {
      console.error('Failed to accept quest:', error);
      alert('Failed to accept quest');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-nothing-black flex items-center justify-center">
        <p className="text-white">Loading quest...</p>
      </div>
    );
  }

  if (!quest) {
    return (
      <div className="min-h-screen bg-nothing-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl text-white mb-4">Quest Not Found</h1>
          <button
            onClick={() => router.push('/dashboard')}
            className="nothing-button px-6 py-3"
          >
            BACK TO DASHBOARD
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-nothing-black text-white relative overflow-hidden">
      {/* Background Effects */}
      <RotatingCube />
      <FollowCube />
      <CursorGlow />
      <RedBars />

      {/* Header */}
      <header className="border-b border-white/15 sticky top-0 bg-nothing-black z-40">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-white/60 hover:text-white transition-colors"
          >
            ← BACK
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="nothing-card p-8"
        >
          {/* Quest Image */}
          {quest.beforePhoto && (
            <div className="mb-8 rounded-lg overflow-hidden">
              <img
                src={quest.beforePhoto}
                alt={quest.title}
                className="w-full h-96 object-cover"
              />
            </div>
          )}

          {/* Quest Info */}
          <h1 className="text-4xl font-bold mb-4">{quest.title}</h1>
          <p className="text-white/60 text-lg mb-6">{quest.description}</p>

          <div className="flex items-center gap-6 mb-8">
            <div className="flex items-center gap-2">
              <span className="text-red-500 text-2xl">⚡</span>
              <span className="text-xl font-bold">+{quest.xpReward} XP</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white/40">Status:</span>
              <span className={`font-bold ${
                quest.status === 'open' ? 'text-green-500' :
                quest.status === 'in_progress' ? 'text-yellow-500' :
                'text-white/60'
              }`}>
                {quest.status.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Posted By */}
          <div className="mb-8 pb-8 border-b border-white/10">
            <p className="text-white/40 mb-2">Posted by</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                <span className="text-red-500 font-bold">
                  {quest.postedBy?.displayName?.[0] || quest.postedBy?.username?.[0] || '?'}
                </span>
              </div>
              <span className="font-medium">
                {quest.postedBy?.displayName || quest.postedBy?.username || 'Unknown'}
              </span>
            </div>
          </div>

          {/* Actions */}
          {quest.status === 'open' && (
            <button
              onClick={handleAccept}
              className="nothing-button w-full py-4"
            >
              ACCEPT QUEST
            </button>
          )}

          {quest.status === 'in_progress' && (
            <button
              onClick={() => router.push('/dashboard')}
              className="nothing-button w-full py-4"
            >
              GO TO DASHBOARD
            </button>
          )}

          {quest.status === 'completed' && quest.afterPhoto && (
            <div className="mt-8">
              <h3 className="text-xl font-bold mb-4">After Photo</h3>
              <img
                src={quest.afterPhoto}
                alt="Completed"
                className="w-full h-96 object-cover rounded-lg"
              />
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

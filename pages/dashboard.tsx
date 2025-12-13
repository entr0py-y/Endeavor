import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { useAuthStore } from '@/store';
import { api } from '@/lib/api';
import CursorGlow from '@/components/CursorGlow';
import RotatingCube from '@/components/RotatingCube';
import FollowCube from '@/components/FollowCube';
import RedBars from '@/components/RedBars';
import RotatingPrism from '@/components/RotatingPrism';
import RotatingSmallCube from '@/components/RotatingSmallCube';
import Card from '@/components/Card';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';

const MapComponent = dynamic(() => import('@/components/Map'), { ssr: false });

export default function Dashboard() {
  const router = useRouter();
  const { user, token, isAuthenticated, logout } = useAuthStore();
  const [quests, setQuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPostModal, setShowPostModal] = useState(false);
  const [relocating, setRelocating] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([37.7749, -122.4194]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [chatMessage, setChatMessage] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<Array<{username: string, message: string, timestamp: Date}>>([]);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
      return;
    }
    loadQuests();
  }, [isAuthenticated]);

  const loadQuests = async () => {
    try {
      const result = await api.getQuests(token!, { status: 'open' });
      if (result.quests) {
        setQuests(result.quests);
      }
    } catch (err) {
      console.error('Failed to load quests');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handleRelocate = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setRelocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords: [number, number] = [
          position.coords.latitude,
          position.coords.longitude
        ];
        setMapCenter(coords);
        setUserLocation(coords);
        setRelocating(false);
      },
      (error) => {
        // Silently handle error and use default location
        setMapCenter([37.7749, -122.4194]);
        setUserLocation([37.7749, -122.4194]);
        setRelocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );
  };

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;
    
    // Add message to chat display
    const newMessage = {
      username: user?.username || 'You',
      message: chatMessage,
      timestamp: new Date()
    };
    setChatMessages(prev => [...prev, newMessage]);
    setChatMessage(''); // Clear input after sending
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen w-full bg-nothing-black">
      <RotatingCube />
      <FollowCube />
      <CursorGlow />
      <RedBars />
      
      {/* Header */}
      <header className="border-b border-white/15 sticky top-0 bg-nothing-black z-40">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="relative inline-block">
              <div className="hidden md:block">
                <RotatingSmallCube position="left" scale={0.3} offset={10} />
                <RotatingPrism scale={0.3} />
                <RotatingSmallCube position="right" scale={0.3} offset={10} />
              </div>
              <div className="md:hidden">
                <RotatingSmallCube position="left" scale={0.15} offset={5} />
                <RotatingPrism scale={0.15} />
                <RotatingSmallCube position="right" scale={0.15} offset={5} />
              </div>
              <h1 className="text-lg md:text-2xl font-light tracking-[0.25em] relative z-10" style={{ fontWeight: 300 }}>SWEEPX</h1>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <button
                onClick={() => router.push('/dashboard')}
                className="text-sm tracking-wider text-white/60 hover:text-white transition-colors"
              >
                HOME
              </button>
              <button
                onClick={() => router.push('/leaderboard')}
                className="text-sm tracking-wider text-white/60 hover:text-white transition-colors"
              >
                LEADERBOARD
              </button>
              <button
                onClick={() => router.push('/friends')}
                className="text-sm tracking-wider text-white/60 hover:text-white transition-colors"
              >
                FRIENDS
              </button>
              <button
                onClick={() => router.push('/profile')}
                className="text-sm tracking-wider text-white/60 hover:text-white transition-colors"
              >
                PROFILE
              </button>
              <button
                onClick={() => router.push('/support')}
                className="text-sm tracking-wider text-white/60 hover:text-white transition-colors"
              >
                SUPPORT
              </button>
              <button
                onClick={handleLogout}
                className="nothing-button text-xs px-4 py-2 dot-matrix"
              >
                LOG OUT
              </button>
            </nav>

            {/* Mobile Navigation */}
            <div className="md:hidden flex items-center gap-3">
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="text-white p-2 hover:bg-white/10 rounded transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
              <button
                onClick={handleLogout}
                className="nothing-button text-xs px-3 py-2 dot-matrix"
              >
                LOG OUT
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {showMobileMenu && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden border-t border-white/15 bg-nothing-black"
          >
            <div className="max-w-7xl mx-auto px-6 py-4 space-y-2">
              <button
                onClick={() => { router.push('/dashboard'); setShowMobileMenu(false); }}
                className="block w-full text-left text-sm tracking-wider text-white/60 hover:text-white transition-colors py-2"
              >
                HOME
              </button>
              <button
                onClick={() => { router.push('/leaderboard'); setShowMobileMenu(false); }}
                className="block w-full text-left text-sm tracking-wider text-white/60 hover:text-white transition-colors py-2"
              >
                LEADERBOARD
              </button>
              <button
                onClick={() => { router.push('/friends'); setShowMobileMenu(false); }}
                className="block w-full text-left text-sm tracking-wider text-white/60 hover:text-white transition-colors py-2"
              >
                FRIENDS
              </button>
              <button
                onClick={() => { router.push('/profile'); setShowMobileMenu(false); }}
                className="block w-full text-left text-sm tracking-wider text-white/60 hover:text-white transition-colors py-2"
              >
                PROFILE
              </button>
              <button
                onClick={() => { router.push('/support'); setShowMobileMenu(false); }}
                className="block w-full text-left text-sm tracking-wider text-white/60 hover:text-white transition-colors py-2"
              >
                SUPPORT
              </button>
            </div>
          </motion.div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* User Stats */}
        <div className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.4 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <Card>
                <div className="text-center">
                  <h2 className="text-5xl font-bold text-nothing-red mb-2 dot-matrix">{user?.xp || 0}</h2>
                  <p className="text-white/60 text-sm tracking-wider">TOTAL XP</p>
                </div>
              </Card>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.4 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
            >
              <Card>
                <div className="text-center">
                  <h2 className="text-5xl font-bold text-nothing-red mb-2 dot-matrix">{user?.level || 1}</h2>
                  <p className="text-white/60 text-sm tracking-wider">LEVEL</p>
                </div>
              </Card>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.4 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
            >
              <Card>
                <div className="text-center">
                  <h2 className="text-5xl font-bold text-nothing-red mb-2 dot-matrix">{user?.questsCompleted || 0}</h2>
                  <p className="text-white/60 text-sm tracking-wider">COMPLETED</p>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Actions */}
        <div className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.4 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="cursor-pointer"
            onClick={() => setShowPostModal(true)}
          >
            <Card hover>
              <div className="text-center py-8">
                <div className="mb-4 flex justify-center">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="2" y="6" width="20" height="14" rx="2" stroke="#DC143C" strokeWidth="1.5"/>
                    <circle cx="12" cy="13" r="3" stroke="#DC143C" strokeWidth="1.5"/>
                    <path d="M8 6L9 3H15L16 6" stroke="#DC143C" strokeWidth="1.5"/>
                    <circle cx="17" cy="9" r="0.5" fill="#DC143C"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold dot-matrix tracking-wider mb-2">POST A QUEST</h3>
                <p className="text-white/60 text-sm">Found some trash? Let others help clean it up</p>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Three Column Section: Open Quests, Global Chat, History */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold tracking-wider mb-8">DASHBOARD</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Open Quests Column */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="nothing-card p-6"
            >
              <h3 className="text-xl font-bold tracking-wider mb-6">OPEN QUESTS</h3>
              {loading ? (
                <div className="text-center py-8">
                  <p className="text-white/60 animate-pulse">Loading...</p>
                </div>
              ) : quests.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-white/60 text-sm">No open quests</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[400px] overflow-y-auto">
                  {quests.slice(0, 6).map((quest: any) => (
                    <div 
                      key={quest._id} 
                      onClick={() => router.push(`/quest/${quest._id}`)}
                      className="border border-white/10 rounded-lg p-4 hover:border-red-500/50 cursor-pointer transition-all"
                    >
                      {quest.beforePhoto && (
                        <div className="aspect-video bg-white/5 rounded overflow-hidden mb-3">
                          <img src={quest.beforePhoto} alt={quest.title} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <h4 className="font-bold text-sm mb-2">{quest.title}</h4>
                      <p className="text-white/60 text-xs line-clamp-2 mb-3">{quest.description}</p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-red-500">+{quest.xpReward} XP</span>
                        <span className="text-white/40">by {quest.postedBy?.username}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Global Chat Column */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
              className="nothing-card p-6"
            >
              <h3 className="text-xl font-bold tracking-wider mb-6">GLOBAL CHAT</h3>
              <div className="flex flex-col h-[400px]">
                <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                  {chatMessages.length === 0 ? (
                    <div className="text-center py-8 text-white/40 text-sm">
                      No messages yet. Start a conversation!
                    </div>
                  ) : (
                    chatMessages.map((msg, idx) => (
                      <div key={idx} className="text-sm">
                        <div className="flex items-start gap-2 mb-2">
                          <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-red-500 text-xs">{msg.username[0].toUpperCase()}</span>
                          </div>
                          <div>
                            <p className="text-white/80 text-xs mb-1"><span className="font-bold">{msg.username}</span></p>
                            <p className="text-white/60 text-xs">{msg.message}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="border-t border-white/10 pt-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type a message..."
                      className="flex-1 bg-white/5 border border-white/10 rounded px-4 py-2 text-sm focus:outline-none focus:border-red-500/50"
                    />
                    <button 
                      onClick={handleSendMessage}
                      className="nothing-button px-6 py-2 text-sm"
                    >
                      SEND
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* History Column */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
              className="nothing-card p-6"
            >
              <h3 className="text-xl font-bold tracking-wider mb-6">HISTORY</h3>
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {/* Sample history items - replace with real data */}
                <div className="border border-white/10 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-green-500 text-xs font-bold">✓ COMPLETED</span>
                    <span className="text-white/40 text-xs">2 hours ago</span>
                  </div>
                  <p className="text-white/80 text-sm mb-1">Beach Cleanup</p>
                  <p className="text-red-500 text-xs">+50 XP</p>
                </div>
                
                <div className="border border-white/10 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-yellow-500 text-xs font-bold">⚡ ACCEPTED</span>
                    <span className="text-white/40 text-xs">5 hours ago</span>
                  </div>
                  <p className="text-white/80 text-sm mb-1">Park Trail Cleanup</p>
                  <p className="text-red-500 text-xs">+75 XP</p>
                </div>

                <div className="text-center py-8 text-white/40 text-sm">
                  Your quest history will appear here
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Map Section */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold tracking-wider">EXPLORE NEARBY QUESTS</h2>
            <button
              onClick={handleRelocate}
              disabled={relocating}
              className="nothing-button text-xs px-4 py-2 flex items-center gap-2"
              title="Relocate to current position"
            >
              <span>{relocating ? '📍' : '🎯'}</span>
              {relocating ? 'LOCATING...' : 'RELOCATE'}
            </button>
          </div>
          <div className="nothing-card overflow-hidden" style={{ height: '500px' }}>
            <MapComponent quests={quests} center={mapCenter} userLocation={userLocation} />
          </div>
        </div>
      </main>

      <Footer />

      {/* Modals */}
      {showPostModal && (
        <PostQuestModal onClose={() => setShowPostModal(false)} onSuccess={() => { setShowPostModal(false); loadQuests(); }} />
      )}
    </div>
  );
}

// Post Quest Modal Component
function PostQuestModal({ onClose, onSuccess }: any) {
  const { token } = useAuthStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<any>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        (error) => {
          // If location access is denied or unavailable, use a default location
          console.log('Location access issue:', error.message);
          setLocation({ lat: 37.7749, lng: -122.4194 }); // Default: San Francisco
        },
        {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    } else {
      // Geolocation not supported, use default location
      setLocation({ lat: 37.7749, lng: -122.4194 });
    }
  }, []);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (limit to 2MB to avoid payload issues)
      if (file.size > 2 * 1024 * 1024) {
        alert('Image too large. Please select an image under 2MB.');
        return;
      }
      
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        // Compress image if needed
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Resize if too large
          const maxDimension = 800;
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = (height / width) * maxDimension;
              width = maxDimension;
            } else {
              width = (width / height) * maxDimension;
              height = maxDimension;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Convert to compressed base64
          const compressedData = canvas.toDataURL('image/jpeg', 0.7);
          setPhotoPreview(compressedData);
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location) {
      alert('Please enable location access');
      return;
    }

    setLoading(true);
    try {
      const result = await api.createQuest({
        title,
        description,
        location,
        beforePhoto: photoPreview || 'https://via.placeholder.com/400x300?text=Quest+Photo',
        address: ''
      }, token!);

      if (result && result.quest) {
        alert(result.message || 'Quest posted!');
        onSuccess();
      } else if (result && result.error) {
        alert(result.error);
      } else {
        alert('Quest posted successfully!');
        onSuccess();
      }
    } catch (err: any) {
      console.error('Quest post error:', err);
      alert('Failed to post quest: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center px-6" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="nothing-card p-12 max-w-lg w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold tracking-wider mb-8">POST A QUEST</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs dot-matrix tracking-wider text-white/60 mb-2">
              PHOTO
            </label>
            <div className="border border-white/15 rounded p-4 text-center">
              {photoPreview ? (
                <div className="relative">
                  <img src={photoPreview} alt="Preview" className="w-full h-48 object-cover rounded mb-2" />
                  <button
                    type="button"
                    onClick={() => { setPhoto(null); setPhotoPreview(''); }}
                    className="text-nothing-red text-xs hover:underline"
                  >
                    Remove Photo
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer block">
                  <div className="py-8">
                    <div className="text-4xl mb-2">📸</div>
                    <p className="text-white/60 text-sm">Click to upload photo</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>
          <div>
            <label className="block text-xs dot-matrix tracking-wider text-white/60 mb-2">
              TITLE
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="nothing-input w-full"
              placeholder="What needs cleaning?"
              required
              maxLength={100}
            />
          </div>
          <div>
            <label className="block text-xs dot-matrix tracking-wider text-white/60 mb-2">
              DESCRIPTION
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="nothing-input w-full min-h-[120px] resize-none"
              placeholder="Describe the cleanup needed..."
              required
              maxLength={500}
            />
          </div>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="nothing-button flex-1 py-3"
            >
              CANCEL
            </button>
            <button
              type="submit"
              disabled={loading}
              className="nothing-button-primary flex-1 py-3 disabled:opacity-50"
            >
              {loading ? 'POSTING...' : 'POST QUEST'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

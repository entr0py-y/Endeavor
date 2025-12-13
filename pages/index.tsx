import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store';
import { api } from '@/lib/api';
import CursorGlow from '@/components/CursorGlow';
import CosmicClouds from '@/components/CosmicClouds';
import RotatingCube from '@/components/RotatingCube';
import FollowCube from '@/components/FollowCube';
import RotatingPrism from '@/components/RotatingPrism';
import RotatingSmallCube from '@/components/RotatingSmallCube';

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = mode === 'login'
        ? await api.login(username, password)
        : await api.register(username, password, displayName);

      if (result.token && result.user) {
        login(result.token, result.user);
        router.push('/dashboard');
      } else {
        setError(result.message || 'Something went wrong');
      }
    } catch (err) {
      setError('Connection failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setLoading(true);
    setError('');

    try {
      const result = await api.guestLogin();
      if (result.token && result.user) {
        login(result.token, result.user);
        router.push('/dashboard');
      }
    } catch (err) {
      setError('Could not start guest session');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e as any);
    }
  };

  return (
    <div className="min-h-screen w-full bg-nothing-black flex items-center justify-center px-6">
      <RotatingCube />
      <FollowCube />
      <CursorGlow />
      
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Logo */}
        <div className="text-center mb-16 relative">
          <RotatingSmallCube position="left" scale={1} />
          <RotatingPrism />
          <RotatingSmallCube position="right" scale={1} />
          <h1 className="text-6xl font-light tracking-[0.3em] mb-4 text-white relative z-10" style={{ fontWeight: 300 }}>SWEEPX</h1>
          <p className="text-red-500 text-sm tracking-[0.15em] font-light relative z-10">
            Clean the world, earn rewards
          </p>
        </div>

        {/* Form Card */}
        <div className="nothing-card p-12">
          <div className="space-y-8">
            {/* Mode Toggle */}
            <div className="flex gap-4 mb-8">
              <button
                onClick={() => setMode('login')}
                className={`flex-1 py-3 text-sm tracking-wider transition-all duration-300 ${
                  mode === 'login'
                    ? 'border border-nothing-red text-nothing-red'
                    : 'border border-white/30 text-white/60 hover:border-white/50'
                }`}
              >
                LOG IN
              </button>
              <button
                onClick={() => setMode('register')}
                className={`flex-1 py-3 text-sm tracking-wider transition-all duration-300 ${
                  mode === 'register'
                    ? 'border border-nothing-red text-nothing-red'
                    : 'border border-white/30 text-white/60 hover:border-white/50'
                }`}
              >
                SIGN UP
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs tracking-wider text-white/60 mb-2">
                  USERNAME
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="nothing-input w-full"
                  placeholder="your username"
                  required
                  autoComplete="username"
                />
              </div>

              <div>
                <label className="block text-xs tracking-wider text-white/60 mb-2">
                  PASSWORD
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="nothing-input w-full"
                  placeholder="••••••••"
                  required
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                />
              </div>

              {mode === 'register' && (
                <div>
                  <label className="block text-xs tracking-wider text-white/60 mb-2">
                    DISPLAY NAME (OPTIONAL)
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="nothing-input w-full"
                    placeholder="how others see you"
                    autoComplete="name"
                  />
                </div>
              )}

              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-nothing-red text-sm"
                >
                  {error}
                </motion.p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="nothing-button-primary w-full py-4 disabled:opacity-50"
              >
                {loading ? (
                  <span className="animate-pulse">LOADING...</span>
                ) : mode === 'login' ? (
                  'LOG IN'
                ) : (
                  'CREATE ACCOUNT'
                )}
              </button>
            </form>

            {/* Guest Button */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-4 bg-nothing-black text-white/40 tracking-wider">
                  OR
                </span>
              </div>
            </div>

            <button
              onClick={handleGuestLogin}
              disabled={loading}
              className="nothing-button w-full py-4 disabled:opacity-50"
            >
              CONTINUE AS GUEST
            </button>
          </div>
        </div>

        {/* Copyright */}
        <p className="text-center text-white/40 text-xs mt-8 tracking-wide">
          © SWEEPX
        </p>
      </motion.div>
    </div>
  );
}

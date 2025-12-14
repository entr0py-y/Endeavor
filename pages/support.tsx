import React, { useState } from 'react';
import { useRouter } from 'next/router';
import CursorGlow from '@/components/CursorGlow';
import RotatingCube from '@/components/RotatingCube';
import FollowCube from '@/components/FollowCube';
import RedBars from '@/components/RedBars';
import Card from '@/components/Card';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';

export default function SupportPage() {
  const router = useRouter();

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
          className="space-y-12"
        >
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold dot-matrix tracking-wider mb-4">
              SUPPORT THE DEVELOPER
            </h2>
            <p className="text-white/60 dot-matrix tracking-wide">
              Every contribution helps keep SweepX alive
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-1 gap-8 max-w-xl mx-auto">
            <Card hover>
              <a
                href="https://instagram.com/yeagr.art"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center py-8"
              >
                <div className="text-6xl mb-6">📸</div>
                <h3 className="text-2xl font-bold dot-matrix tracking-wider mb-4">
                  FOLLOW ON INSTAGRAM
                </h3>
                <p className="text-nothing-red text-xl dot-matrix tracking-wider mb-2">
                  @yeagr.art
                </p>
                <p className="text-white/60 text-sm">
                  Connect with the creator and stay updated
                </p>
              </a>
            </Card>
          </div>

          <Card>
            <div className="text-center py-12">
              <h3 className="text-xl font-bold dot-matrix tracking-wider mb-4">
                ABOUT SWEEPX
              </h3>
              <p className="text-white/60 leading-relaxed max-w-2xl mx-auto">
                SweepX was built with a simple mission: to gamify environmental cleanup 
                and make the world a cleaner place. Every quest you post and complete 
                contributes to this mission. Thank you for being part of the movement.
              </p>
            </div>
          </Card>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}

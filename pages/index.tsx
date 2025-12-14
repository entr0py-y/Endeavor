import React from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import CursorGlow from '@/components/CursorGlow';
import RotatingCube from '@/components/RotatingCube';
import FollowCube from '@/components/FollowCube';
import RotatingPrism from '@/components/RotatingPrism';
import RotatingSmallCube from '@/components/RotatingSmallCube';
import RedBars from '@/components/RedBars';

export default function LandingPage() {
  const router = useRouter();

  const handleEnter = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen w-full bg-nothing-black flex items-center justify-center px-6">
      <RotatingCube />
      <FollowCube />
      <CursorGlow />
      <RedBars />

      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Logo */}
        <div className="text-center mb-16 relative">
          <div className="hidden md:block">
            <RotatingSmallCube position="left" scale={0.85} offset={60} />
            <RotatingPrism scale={0.85} />
            <RotatingSmallCube position="right" scale={0.85} offset={60} />
          </div>
          <div className="md:hidden">
            <RotatingSmallCube position="left" scale={0.7} offset={50} />
            <RotatingPrism scale={0.7} />
            <RotatingSmallCube position="right" scale={0.7} offset={50} />
          </div>
          <h1 className="text-4xl md:text-6xl dot-matrix tracking-widest mb-4 text-white relative z-10 whitespace-nowrap">Pushkar Jha</h1>
        </div>

        {/* Enter Card */}
        <div className="nothing-card p-12 hover:border-nothing-red/50 transition-colors duration-500">
          <div className="text-center space-y-8">
            <p className="font-space-mono text-nothing-red text-sm tracking-wide">
              ML DS focused CS Undergraduate
            </p>

            <button
              onClick={handleEnter}
              className="nothing-button-primary w-full py-4 text-sm tracking-[0.2em] hover:scale-[1.02] transition-transform dot-matrix font-bold !bg-white !border-white hover:!bg-nothing-red hover:!border-nothing-red hover:!text-white"
            >
              JUMP IN TO MY RESUME
            </button>
          </div>
        </div>


      </motion.div>
    </div>
  );
}

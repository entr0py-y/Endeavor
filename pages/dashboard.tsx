import React, { useState } from 'react';
import { useRouter } from 'next/router';
import CursorGlow from '@/components/CursorGlow';
import RotatingCube from '@/components/RotatingCube';
import FollowCube from '@/components/FollowCube';
import RedBars from '@/components/RedBars';
import RotatingPrism from '@/components/RotatingPrism';
import RotatingSmallCube from '@/components/RotatingSmallCube';
import Card from '@/components/Card';

import ClickTesseract from '@/components/ClickTesseract';
import { motion } from 'framer-motion';

const RESUME_DATA = {
  name: "PUSHKAR JHA",
  role: "ML & DATA SCIENCE UNDERGRADUATE",
  tagline: "Data-driven developer & researcher in progress",
  education: [
    {
      title: "B.TECH IN COMPUTER SCIENCE (DATA SCIENCE)",
      institution: "Indraprastha University, New Delhi",
      year: "2025 - 2029",
      status: "IN PROGRESS"
    },
    {
      title: "SECONDARY SCHOOLING (10TH & 12TH)",
      institution: "Jawahar Navodaya Vidyalaya (JNV), Delhi-2",
      year: "COMPLETED",
      status: "DONE"
    }
  ],
  skills: [
    "Machine Learning",
    "Data Science",
    "Python",
    "TensorFlow",
    "React / Next.js",
    "Tailwind CSS",
    "Frontend Dev",
    "Responsive Layouts"
  ],
  stats: {
    level: "YR 1",
    focus: "ML & DS",
    status: "ONLINE"
  }
};

export default function Dashboard() {
  const router = useRouter();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [clickEffect, setClickEffect] = useState<{ x: number, y: number, id: number } | null>(null);

  const handleMenuClick = (e: React.MouseEvent, route: string) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setClickEffect({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, id: Date.now() });
    setTimeout(() => setClickEffect(null), 800);
    // For now, since it's a single page app experience, we can just scroll or do nothing for some links
    if (route === '/') router.push('/');
    setShowMobileMenu(false);
  };

  return (
    <div className="min-h-screen w-full bg-nothing-black font-space-mono">
      <RotatingCube />
      <FollowCube />
      <CursorGlow />
      <RedBars />

      {/* Click Effect */}
      {clickEffect && <ClickTesseract key={clickEffect.id} x={clickEffect.x} y={clickEffect.y} />}

      {/* Header */}
      <header className="border-b border-white/15 sticky top-0 bg-nothing-black z-40">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="relative inline-block cursor-pointer" onClick={() => router.push('/')}>
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
              <h1 className="text-lg md:text-2xl font-light tracking-[0.25em] relative z-10 dot-matrix" style={{ fontWeight: 300 }}>MY RESUME</h1>
            </div>

            <nav className="hidden md:flex items-center gap-8">
              <span className="text-sm tracking-widest text-white/40">SYSTEM: ONLINE</span>
              <button
                onClick={(e) => handleMenuClick(e, '/')}
                className="nothing-button text-xs px-4 py-2 dot-matrix"
              >
                EXIT SYSTEM
              </button>
            </nav>

            <div className="md:hidden">
              <span className="text-xs tracking-widest text-white/40">SYS: ONLINE</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* User Stats - Reimagined as Status Indicators */}
        <div className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <Card>
                <div className="text-center">
                  <h2 className="text-5xl font-bold text-nothing-red mb-2 dot-matrix">{RESUME_DATA.stats.level}</h2>
                  <p className="text-white/60 text-sm tracking-wider">CURRENT YEAR</p>
                </div>
              </Card>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15 }}
            >
              <Card>
                <div className="text-center">
                  <h2 className="text-4xl font-bold text-white mb-2 dot-matrix pt-2">{RESUME_DATA.stats.focus}</h2>
                  <p className="text-white/60 text-sm tracking-wider">PRIMARY FOCUS</p>
                </div>
              </Card>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <Card>
                <div className="text-center">
                  <h2 className="text-4xl font-bold text-green-500 mb-2 dot-matrix pt-2">{RESUME_DATA.stats.status}</h2>
                  <p className="text-white/60 text-sm tracking-wider">AVAILABILITY</p>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Primary Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">

          {/* Identity Section (Large) */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="nothing-card p-8 h-full min-h-[400px] flex flex-col justify-center relative overflow-hidden">
              {/* Background decoration */}
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <svg width="200" height="200" viewBox="0 0 100 100" fill="none" stroke="white" strokeWidth="1">
                  <circle cx="50" cy="50" r="40" />
                  <path d="M50 10 V90 M10 50 H90" />
                </svg>
              </div>

              <h2 className="text-xs text-nothing-red tracking-[0.3em] mb-4 font-bold dot-matrix">IDENTITY MODULE</h2>
              <h1 className="text-4xl md:text-6xl font-light tracking-wider mb-6 text-white font-space-mono">
                {RESUME_DATA.name}
              </h1>
              <div className="h-px w-24 bg-nothing-red mb-6" />
              <p className="text-xl text-white/80 tracking-wide font-light mb-2">
                {RESUME_DATA.role}
              </p>
              <p className="text-white/50 tracking-wide max-w-xl">
                {RESUME_DATA.tagline}
              </p>
            </div>
          </motion.div>

          {/* Skills Section */}
          <motion.div
            className="lg:col-span-1"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <div className="nothing-card p-8 h-full bg-white/5">
              <h3 className="text-lg font-bold tracking-wider mb-6 flex items-center gap-2 text-nothing-red dot-matrix">
                <span className="w-2 h-2 bg-nothing-red rounded-full"></span>
                SKILL MATRIX
              </h3>
              <div className="flex flex-wrap gap-3">
                {RESUME_DATA.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 border border-white/20 rounded-full text-xs text-white/70 tracking-wider hover:border-nothing-red hover:text-white transition-colors cursor-default"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              <div className="mt-8 pt-8 border-t border-white/10">
                <p className="text-xs text-white/40 tracking-wider leading-relaxed">
                  Constant learner with a strong intuition for visual hierarchy and user experience. Building polished, human-centric interfaces.
                </p>
              </div>
            </div>
          </motion.div>

        </div>

        {/* Education Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold tracking-wider mb-8 text-nothing-red dot-matrix">EDUCATION LOGS</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {RESUME_DATA.education.map((edu, index) => (
              <div key={index} className="nothing-card p-6 hover:bg-white/5 transition-colors group">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold tracking-wide text-white group-hover:text-nothing-red transition-colors font-space-mono">
                    {edu.institution}
                  </h3>
                  <span className="text-xs border border-white/20 px-2 py-1 rounded text-white/50">
                    {edu.status}
                  </span>
                </div>
                <p className="text-white/80 text-sm tracking-wider mb-2">{edu.title}</p>
                <p className="text-white/40 text-xs font-mono">{edu.year}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Project Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold tracking-wider mb-8 text-nothing-red dot-matrix">PROJECT MODULE</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="nothing-card p-12 flex items-center justify-center md:col-span-2 min-h-[160px]">
              <p className="text-white/60 text-lg tracking-wide">will update later</p>
            </div>
          </div>
        </motion.div>

      </main>

      {/* Connect Section */}
      <div className="max-w-7xl mx-auto px-6 pb-24">
        <h2 className="text-2xl font-bold tracking-wider mb-8 text-nothing-red dot-matrix">CONNECT MODULE</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <a
            href="https://instagram.com/endeavv0r"
            target="_blank"
            rel="noopener noreferrer"
            className="group"
          >
            <Card hover>
              <div className="flex items-center justify-between p-2">
                <div>
                  <h3 className="text-xl font-bold tracking-wider text-white group-hover:text-nothing-red transition-colors">INSTAGRAM</h3>
                  <p className="text-white/40 text-xs">@endeavv0r</p>
                </div>
                <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center group-hover:border-nothing-red transition-colors">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </div>
              </div>
            </Card>
          </a>

          <a
            href="https://www.linkedin.com/in/pushkar-jha-4a1258381"
            target="_blank"
            rel="noopener noreferrer"
            className="group"
          >
            <Card hover>
              <div className="flex items-center justify-between p-2">
                <div>
                  <h3 className="text-xl font-bold tracking-wider text-white group-hover:text-nothing-red transition-colors">LINKEDIN</h3>
                  <p className="text-white/40 text-xs">Connect professionally</p>
                </div>
                <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center group-hover:border-nothing-red transition-colors">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                    <rect x="2" y="9" width="4" height="12"></rect>
                    <circle cx="4" cy="4" r="2"></circle>
                  </svg>
                </div>
              </div>
            </Card>
          </a>
        </div>

        <div className="mt-16 border-t border-white/10 pt-8 text-center">
          <p className="text-nothing-red text-xs tracking-[0.2em] mb-2 dot-matrix">INSPIRATION</p>
          <p className="text-white/20 text-xs tracking-wider">
            UI inspired by iOS 26 liquid glass and Nothing OS 3.0
          </p>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import CursorGlow from '@/components/CursorGlow';
import RotatingCube from '@/components/RotatingCube';
import FollowCube from '@/components/FollowCube';
import RotatingPrism from '@/components/RotatingPrism';
import RotatingSmallCube from '@/components/RotatingSmallCube';
import RedBars from '@/components/RedBars';
import Card from '@/components/Card';
import ClickTesseract from '@/components/ClickTesseract';

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

export default function Home() {
  const router = useRouter();
  const [clickEffect, setClickEffect] = useState<{ x: number, y: number, id: number } | null>(null);
  const [scrollGlow, setScrollGlow] = useState<'top' | 'bottom' | null>(null);

  // Scroll Glow Logic
  useEffect(() => {
    let lastScrollY = window.scrollY;
    let timeoutId: NodeJS.Timeout | null = null;

    const handleScroll = () => {
      const isMobile = window.innerWidth < 768;
      if (!isMobile) return;

      const currentScrollY = window.scrollY;
      const delta = currentScrollY - lastScrollY;

      if (timeoutId) clearTimeout(timeoutId);

      // Threashold > 5
      if (Math.abs(delta) > 5) {
        if (delta > 0) setScrollGlow('top');
        else setScrollGlow('bottom');
      }

      timeoutId = setTimeout(() => {
        setScrollGlow(null);
      }, 150);

      lastScrollY = currentScrollY;
    };

    // Use the container for scrolling events if snap is applied to body/html or a container
    // Since we are using a container for snap, we should verify if window scroll works or if we need to attach to container.
    // Standard window scroll usually works unless container has overflow.
    // For snap-y on a container, the container scrolls, not the window.
    // I will attach to window for now, but might need to adjust if I use a specific container for scrolling.
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="h-screen w-full bg-nothing-black font-space-mono overflow-y-scroll snap-y snap-mandatory scroll-smooth relative no-scrollbar">
      {/* Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <RotatingCube />
        <FollowCube />
        <CursorGlow />
        <RedBars />
      </div>

      {/* Click Effect */}
      {clickEffect && <ClickTesseract key={clickEffect.id} x={clickEffect.x} y={clickEffect.y} />}

      {/* Irregular Scroll Glow Effects (Mobile: Fixed overlay) */}
      <div
        className={`fixed top-0 left-0 right-0 h-40 pointer-events-none z-50 transition-opacity duration-500 ease-out ${scrollGlow === 'top' ? 'opacity-100' : 'opacity-0'}`}
        style={{
          background: 'radial-gradient(ellipse at center top, rgba(220, 20, 60, 0.5) 0%, transparent 70%)',
          maskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)'
        }}
      />
      <div
        className={`fixed bottom-0 left-0 right-0 h-40 pointer-events-none z-50 transition-opacity duration-500 ease-out ${scrollGlow === 'bottom' ? 'opacity-100' : 'opacity-0'}`}
        style={{
          background: 'radial-gradient(ellipse at center bottom, rgba(220, 20, 60, 0.5) 0%, transparent 70%)',
          maskImage: 'linear-gradient(to top, black 50%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to top, black 50%, transparent 100%)'
        }}
      />

      {/* Screen 1: Merged Identity (Hero) */}
      <section id="identity" className="snap-start h-screen w-full flex flex-col items-center justify-center p-6 relative z-10">
        <motion.div
          className="w-full max-w-2xl relative"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-8 relative">
            <div className="hidden md:block">
              <RotatingSmallCube position="left" scale={0.85} offset={100} />
              <RotatingPrism scale={0.85} />
              <RotatingSmallCube position="right" scale={0.85} offset={100} />
            </div>
            <div className="md:hidden">
              <RotatingSmallCube position="left" scale={0.6} offset={40} />
              <RotatingPrism scale={0.6} />
              <RotatingSmallCube position="right" scale={0.6} offset={40} />
            </div>
          </div>

          <div className="nothing-card p-8 md:p-12 flex flex-col justify-center relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <svg width="200" height="200" viewBox="0 0 100 100" fill="none" stroke="white" strokeWidth="1">
                <circle cx="50" cy="50" r="40" />
                <path d="M50 10 V90 M10 50 H90" />
              </svg>
            </div>
            <h2 className="text-xs text-nothing-red tracking-[0.3em] mb-4 font-bold dot-matrix">IDENTITY MODULE</h2>
            <h1 className="text-4xl md:text-6xl font-light tracking-wider mb-6 text-white font-space-mono drop-shadow-[0_0_10px_rgba(255,255,255,0.6)]">
              {RESUME_DATA.name}
            </h1>
            <div className="h-px w-24 bg-nothing-red mb-6" />
            <p className="text-xl text-white/80 tracking-wide font-light mb-2">
              {RESUME_DATA.role}
            </p>
            <p className="text-white/50 tracking-wide max-w-xl mb-8">
              {RESUME_DATA.tagline}
            </p>

            <div className="flex flex-col md:flex-row gap-4">
              <button
                onClick={() => scrollToSection('education')}
                className="nothing-button-primary flex-1 py-4 text-sm tracking-[0.2em] hover:scale-[1.02] transition-transform dot-matrix font-bold !bg-white !border-white hover:!bg-nothing-red hover:!border-nothing-red hover:!text-white"
              >
                VIEW EDUCATION
              </button>
              <button
                onClick={() => scrollToSection('connect')}
                className="nothing-button flex-1 py-4 text-sm tracking-[0.2em] hover:scale-[1.02] transition-transform dot-matrix font-bold !text-white hover:!text-nothing-red hover:!border-nothing-red"
              >
                GET IN TOUCH
              </button>
            </div>
          </div>
        </motion.div>
        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce opacity-50">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
          </svg>
        </div>
      </section>

      {/* Screen 2: Stats */}
      <section className="snap-start h-screen w-full flex flex-col items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
              <Card>
                <div className="text-center py-8">
                  <h2 className="text-5xl font-bold text-nothing-red mb-2 dot-matrix font-space-mono">{RESUME_DATA.stats.level}</h2>
                  <p className="text-white/60 text-sm tracking-wider">CURRENT YEAR</p>
                </div>
              </Card>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
              <Card>
                <div className="text-center py-8">
                  <h2 className="text-4xl font-bold text-white mb-2 dot-matrix pt-2 font-space-mono">{RESUME_DATA.stats.focus}</h2>
                  <p className="text-white/60 text-sm tracking-wider">PRIMARY FOCUS</p>
                </div>
              </Card>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}>
              <Card>
                <div className="text-center py-8">
                  <h2 className="text-4xl font-bold text-green-500 mb-2 dot-matrix pt-2 font-space-mono">{RESUME_DATA.stats.status}</h2>
                  <p className="text-white/60 text-sm tracking-wider">AVAILABILITY</p>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Screen 3: Education */}
      <section id="education" className="snap-start h-screen w-full flex flex-col items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-4xl">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl font-bold tracking-wider mb-12 text-nothing-red dot-matrix text-center">EDUCATION LOGS</h2>
            <div className="grid grid-cols-1 gap-6">
              {RESUME_DATA.education.map((edu, index) => (
                <div key={index} className="nothing-card p-8 hover:bg-white/5 transition-colors group">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold tracking-wide text-white group-hover:text-nothing-red transition-colors font-space-mono">
                      {edu.institution}
                    </h3>
                    <span className="text-xs border border-white/20 px-2 py-1 rounded text-white/50">
                      {edu.status}
                    </span>
                  </div>
                  <p className="text-white/80 text-base tracking-wider mb-2">{edu.title}</p>
                  <p className="text-white/40 text-sm font-mono">{edu.year}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Screen 4: Skills */}
      <section className="snap-start h-screen w-full flex flex-col items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-4xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h3 className="text-3xl font-bold tracking-wider mb-12 flex items-center justify-center gap-2 text-nothing-red dot-matrix">
              <span className="w-3 h-3 bg-nothing-red rounded-full"></span>
              SKILL MATRIX
            </h3>
            <div className="nothing-card p-12 bg-white/5">
              <div className="flex flex-wrap justify-center gap-4">
                {/* Skill Items */}
                {RESUME_DATA.skills.map((skill, index) => (
                  <span key={index} className="px-4 py-2 border border-white/20 rounded-full text-sm text-white/70 tracking-wider hover:border-nothing-red hover:text-white transition-colors cursor-default">
                    {skill}
                  </span>
                ))}
              </div>
              <div className="mt-12 pt-8 border-t border-white/10 text-center">
                <p className="text-sm text-white/40 tracking-wider leading-relaxed max-w-2xl mx-auto">
                  Constant learner with a strong intuition for visual hierarchy and user experience. Building polished, human-centric interfaces.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Screen 5: Projects */}
      <section className="snap-start h-screen w-full flex flex-col items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-4xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl font-bold tracking-wider mb-12 text-nothing-red dot-matrix text-center">PROJECT MODULE</h2>
            <div className="nothing-card p-12 flex items-center justify-center min-h-[300px]">
              <p className="text-white/60 text-xl tracking-wide">will update later</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Screen 6: Connect */}
      <section id="connect" className="snap-start h-screen w-full flex flex-col items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-4xl flex flex-col justify-between h-full py-12">
          <div className="flex-1 flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl font-bold tracking-wider mb-12 text-nothing-red dot-matrix text-center">CONNECT MODULE</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <a href="https://instagram.com/endeavv0r" target="_blank" rel="noopener noreferrer" className="group">
                  <Card hover>
                    <div className="flex items-center justify-between p-6">
                      <div>
                        <h3 className="text-2xl font-bold tracking-wider text-white group-hover:text-nothing-red transition-colors font-space-mono">INSTAGRAM</h3>
                        <p className="text-white/40 text-sm mt-1">@endeavv0r</p>
                      </div>
                      <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center group-hover:border-nothing-red transition-colors">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                        </svg>
                      </div>
                    </div>
                  </Card>
                </a>
                <a href="https://www.linkedin.com/in/pushkar-jha-4a1258381" target="_blank" rel="noopener noreferrer" className="group">
                  <Card hover>
                    <div className="flex items-center justify-between p-6">
                      <div>
                        <h3 className="text-2xl font-bold tracking-wider text-white group-hover:text-nothing-red transition-colors font-space-mono">LINKEDIN</h3>
                        <p className="text-white/40 text-sm mt-1">Connect professionally</p>
                      </div>
                      <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center group-hover:border-nothing-red transition-colors">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                          <rect x="2" y="9" width="4" height="12"></rect>
                          <circle cx="4" cy="4" r="2"></circle>
                        </svg>
                      </div>
                    </div>
                  </Card>
                </a>
              </div>
            </motion.div>
          </div>

          <div className="border-t border-white/10 pt-8 text-center">
            <p className="text-nothing-red text-xs tracking-[0.2em] mb-2 dot-matrix">INSPIRATION</p>
            <p className="text-white/20 text-xs tracking-wider">
              UI inspired by iOS 26 liquid glass and Nothing OS 3.0
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

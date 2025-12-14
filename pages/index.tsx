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

  /* State for Desktop Navigation Lock */
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const sections = ['identity', 'education', 'skills', 'projects', 'connect'];

  /* Smooth Scroll / Glow Logic (Retained for Mobile) */
  const [clickEffect, setClickEffect] = useState<{ x: number, y: number, id: number } | null>(null);
  const [scrollGlow, setScrollGlow] = useState<'top' | 'bottom' | null>(null);

  // Scroll Glow Logic (Mobile Only)
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      if (scrollY < 100) setScrollGlow('top');
      else if (windowHeight + scrollY >= documentHeight - 100) setScrollGlow('bottom');
      else setScrollGlow(null);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleGlobalClick = (e: React.MouseEvent) => {
    setClickEffect({ x: e.clientX, y: e.clientY, id: Date.now() });
  };

  const scrollToSection = (id: string) => {
    const index = sections.indexOf(id);
    if (index !== -1) {
      setCurrentSectionIndex(index);
      // Mobile fallback
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Prevent manual scroll on Desktop
  useEffect(() => {
    const preventDefault = (e: Event) => e.preventDefault();

    // Check on mount and resize
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        window.addEventListener('wheel', preventDefault, { passive: false });
        window.addEventListener('touchmove', preventDefault, { passive: false });
      } else {
        window.removeEventListener('wheel', preventDefault);
        window.removeEventListener('touchmove', preventDefault);
      }
    };

    handleResize(); // Initial check

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('wheel', preventDefault);
      window.removeEventListener('touchmove', preventDefault);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div
      className="h-screen w-full bg-nothing-black font-space-mono relative no-scrollbar cursor-none overflow-y-scroll md:overflow-hidden snap-y snap-mandatory scroll-smooth"
      onClick={handleGlobalClick}
    >
      {/* Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <RotatingCube />
        <FollowCube />
        <CursorGlow />
        <RedBars />
      </div>

      {/* Click Effect */}
      {clickEffect && <ClickTesseract key={clickEffect.id} x={clickEffect.x} y={clickEffect.y} />}

      {/* Irregular Scroll Glow Effects (Mobile Only) */}
      <div
        className={`fixed top-0 left-0 right-0 h-40 pointer-events-none z-50 transition-opacity duration-500 ease-out md:hidden ${scrollGlow === 'top' ? 'opacity-100' : 'opacity-0'}`}
        style={{
          background: 'radial-gradient(ellipse at center top, rgba(220, 20, 60, 0.5) 0%, transparent 70%)',
          maskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)'
        }}
      />
      <div
        className={`fixed bottom-0 left-0 right-0 h-40 pointer-events-none z-50 transition-opacity duration-500 ease-out md:hidden ${scrollGlow === 'bottom' ? 'opacity-100' : 'opacity-0'}`}
        style={{
          background: 'radial-gradient(ellipse at center bottom, rgba(220, 20, 60, 0.5) 0%, transparent 70%)',
          maskImage: 'linear-gradient(to top, black 50%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to top, black 50%, transparent 100%)'
        }}
      />

      {/* Navigation Header */}
      <nav className="fixed top-0 left-0 right-0 z-[100] w-full px-6 md:pl-32 pr-8 py-8 flex justify-between items-start text-white mix-blend-difference pointer-events-none">
        <div className={`font-bold tracking-widest text-5xl md:text-7xl lg:text-8xl leading-none pointer-events-auto cursor-default text-nothing-red transition-opacity duration-500 ${currentSectionIndex === 0 ? 'opacity-100' : 'opacity-0'}`}>
          &lt;PORTFOLIO/&gt;
        </div>
        <div className="hidden md:flex flex-col items-end gap-2 text-sm tracking-wider pt-2 pointer-events-auto">
          {sections.map((item, index) => (
            <button
              key={item}
              onClick={() => scrollToSection(item)}
              className={`hover:text-nothing-red transition-colors relative group uppercase text-right py-1 cursor-pointer ${currentSectionIndex === index ? 'text-nothing-red' : ''}`}
            >
              <span className="opacity-50 mr-2">0{index + 1}.</span>
              {item}
              <span className={`absolute bottom-0 right-0 h-px bg-nothing-red transition-all duration-300 ${currentSectionIndex === index ? 'w-full' : 'w-0 group-hover:w-full'}`} />
            </button>
          ))}
        </div>
      </nav>

      {/* Content Wrapper - Desktop Slider */}
      <div
        className="w-full h-full md:transition-transform md:duration-1000 md:ease-[0.22, 1, 0.36, 1]"
        style={{ transform: typeof window !== 'undefined' && window.innerWidth >= 768 ? `translateY(-${currentSectionIndex * 100}vh)` : 'none' }}
      >

        {/* Screen 1: Identity */}
        <section id="identity" className="snap-start h-screen w-full flex flex-col items-start justify-center p-6 md:pl-32 relative z-10 overflow-hidden">
          {/* 3D Object: Prism on Right for Identity */}
          <div className="absolute right-20 top-1/2 -translate-y-1/2 hidden md:block pointer-events-none">
            <RotatingPrism scale={1.5} />
          </div>

          <motion.div
            className="w-full max-w-5xl relative text-left"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex flex-col justify-center relative items-start">
              <h2 className="text-xs text-nothing-red tracking-[0.3em] mb-2 font-bold dot-matrix">IDENTITY MODULE</h2>
              <h1 className="text-6xl md:text-9xl font-bold tracking-tighter mb-6 text-[#00FFFF] font-space-mono drop-shadow-[0_0_50px_rgba(0,255,255,0.8)]">
                {RESUME_DATA.name}
              </h1>
              <div className="h-px w-24 bg-nothing-red mb-8" />
              <p className="text-2xl text-white/90 tracking-wide font-light mb-4">
                {RESUME_DATA.role}
              </p>
              <p className="text-white/60 tracking-wide max-w-2xl text-lg mb-12 text-left">
                {RESUME_DATA.tagline}
              </p>

              <div className="flex flex-col md:flex-row gap-8 w-full max-w-md">
                <button
                  onClick={() => scrollToSection('education')}
                  className="bg-transparent border border-white text-white w-full py-4 text-sm tracking-[0.2em] hover:bg-white hover:text-black transition-all duration-300 dot-matrix font-bold cursor-pointer"
                >
                  VIEW EDUCATION
                </button>
                <button
                  onClick={() => scrollToSection('connect')}
                  className="bg-transparent border border-nothing-red text-nothing-red w-full py-4 text-sm tracking-[0.2em] transition-all duration-300 dot-matrix font-bold hover:bg-nothing-red hover:text-white cursor-pointer"
                >
                  GET IN TOUCH
                </button>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Screen 2: Education */}
        <section id="education" className="snap-start h-screen w-full flex flex-col items-start justify-center p-6 md:pl-32 relative z-10 overflow-hidden">
          {/* 3D Object: Cube on Right for Others */}
          <div className="absolute right-20 top-1/2 -translate-y-1/2 hidden md:block pointer-events-none opacity-40">
            <RotatingCube />
          </div>

          <div className="w-full max-w-5xl">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl font-bold tracking-wider mb-16 text-nothing-red dot-matrix text-left">EDUCATION LOGS</h2>
              <div className="flex flex-col gap-12">
                {RESUME_DATA.education.map((edu, index) => (
                  <div key={index} className="flex flex-col md:flex-row justify-between items-start border-b border-white/20 pb-8 hover:border-nothing-red transition-colors group w-full">
                    <div className="text-left">
                      <h3 className="text-3xl font-bold tracking-wide text-white group-hover:text-nothing-red transition-colors font-space-mono mb-2">
                        {edu.institution}
                      </h3>
                      <p className="text-white/80 text-lg tracking-wider">{edu.title}</p>
                    </div>
                    <div className="mt-4 md:mt-0 text-left md:text-right w-full md:w-auto">
                      <span className="block text-nothing-red text-sm tracking-widest mb-1">{edu.status}</span>
                      <p className="text-white/40 text-sm font-mono">{edu.year}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Screen 3: Skills */}
        <section id="skills" className="snap-start h-screen w-full flex flex-col items-start justify-center p-6 md:pl-32 relative z-10 overflow-hidden">
          {/* 3D Object: Cube on Right for Others */}
          <div className="absolute right-20 top-1/2 -translate-y-1/2 hidden md:block pointer-events-none opacity-40">
            <RotatingCube />
          </div>

          <div className="w-full max-w-6xl">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-left"
            >
              <h3 className="text-4xl font-bold tracking-wider mb-20 flex items-center justify-start gap-4 text-nothing-red dot-matrix">
                <span className="w-3 h-3 bg-nothing-red rounded-full"></span>
                SKILL MATRIX
              </h3>

              <div className="flex flex-wrap justify-start gap-x-12 gap-y-8 max-w-4xl">
                {/* Skill Items - Just Text */}
                {RESUME_DATA.skills.map((skill, index) => (
                  <span key={index} className="text-2xl md:text-3xl text-white/40 tracking-wider hover:text-white transition-all duration-300 cursor-default hover:translate-x-2 font-light block w-full md:w-auto">
                    {skill}
                  </span>
                ))}
              </div>

              <div className="mt-24 max-w-3xl">
                <p className="text-lg text-white/30 tracking-widest leading-relaxed text-left">
                  "Constant learner with a strong intuition for visual hierarchy and user experience."
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Screen 4: Projects */}
        <section id="projects" className="snap-start h-screen w-full flex flex-col items-start justify-center p-6 md:pl-32 relative z-10 overflow-hidden">
          {/* 3D Object: Cube on Right for Others */}
          <div className="absolute right-20 top-1/2 -translate-y-1/2 hidden md:block pointer-events-none opacity-40">
            <RotatingCube />
          </div>

          <div className="w-full max-w-4xl text-left">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl font-bold tracking-wider mb-12 text-nothing-red dot-matrix">PROJECT MODULE</h2>
              <div className="py-24 border-y border-white/10 w-full text-left">
                <p className="text-white/40 text-2xl tracking-[0.2em] font-light">
                            // DEVELOPMENT IN PROGRESS
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Screen 5: Connect */}
        <section id="connect" className="snap-start h-screen w-full flex flex-col items-start justify-center p-6 md:pl-32 relative z-10 overflow-hidden">
          {/* 3D Object: Cube on Right for Others */}
          <div className="absolute right-20 top-1/2 -translate-y-1/2 hidden md:block pointer-events-none opacity-40">
            <RotatingCube />
          </div>

          <div className="w-full max-w-5xl h-full flex flex-col justify-center py-20">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="flex-1 flex flex-col justify-center items-start"
            >
              <h2 className="text-4xl font-bold tracking-wider mb-24 text-nothing-red dot-matrix text-left">CONNECT MODULE</h2>

              <div className="flex flex-col gap-16 items-start justify-start w-full">
                <a href="https://instagram.com/endeavv0r" target="_blank" rel="noopener noreferrer" className="group text-left flex items-center gap-8">
                  <div className="w-24 h-24 rounded-full border border-white/20 flex items-center justify-center group-hover:border-nothing-red group-hover:bg-nothing-red/10 transition-all duration-500">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold tracking-widest text-white group-hover:text-nothing-red transition-colors font-space-mono">INSTAGRAM</h3>
                    <p className="text-white/40 text-sm mt-2 tracking-wider">@endeavv0r</p>
                  </div>
                </a>

                <a href="https://www.linkedin.com/in/pushkar-jha-4a1258381" target="_blank" rel="noopener noreferrer" className="group text-left flex items-center gap-8">
                  <div className="w-24 h-24 rounded-full border border-white/20 flex items-center justify-center group-hover:border-nothing-red group-hover:bg-nothing-red/10 transition-all duration-500">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                      <rect x="2" y="9" width="4" height="12"></rect>
                      <circle cx="4" cy="4" r="2"></circle>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold tracking-widest text-white group-hover:text-nothing-red transition-colors font-space-mono">LINKEDIN</h3>
                    <p className="text-white/40 text-sm mt-2 tracking-wider">Connect Professionally</p>
                  </div>
                </a>
              </div>
            </motion.div>

            <div className="mt-auto text-left pt-12">
              <p className="text-white/20 text-xs tracking-[0.3em]">
                DESIGNED BY PUSHKAR JHA
              </p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}

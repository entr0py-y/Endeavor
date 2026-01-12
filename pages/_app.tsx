import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { useEffect, useState, useRef } from 'react'
import dynamic from 'next/dynamic'
import { AnimatePresence } from 'framer-motion'
import ClickTesseract from '@/components/ClickTesseract'
import CinematicLoader from '@/components/CinematicLoader'
import BackgroundMusic from '@/components/BackgroundMusic'
import AudioWave from '@/components/AudioWave'

// Dynamic imports for client-side only components
const CursorTrail = dynamic(() => import('@/components/CursorTrail'), { ssr: false });
const DotGridBackground = dynamic(() => import('@/components/DotGridBackground'), { ssr: false });

const SESSION_KEY = 'portfolio_loaded';

export default function App({ Component, pageProps }: AppProps) {
  const [clickEffect, setClickEffect] = useState<{ x: number, y: number, id: number } | null>(null);
  const [hasEntered, setHasEntered] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
  const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);

  // Theme is inverted (light background) for: Identity(0), Projects(2), Connect(4)
  // Dark background for: Skills(1), Education(3)
  const isInverted = currentSection === 0 || currentSection === 2 || currentSection === 4;

  // Check if this is first visit this session
  useEffect(() => {
    setMounted(true);

    // Check session storage for first visit
    const hasLoaded = sessionStorage.getItem(SESSION_KEY);

    if (!hasLoaded) {
      // First visit - show loader
      setShowLoader(true);
    } else {
      // Already visited this session - skip loader
      setHasEntered(true);
    }
  }, []);

  // Handle loader completion
  const handleLoaderComplete = () => {
    sessionStorage.setItem(SESSION_KEY, 'true');
    setShowLoader(false);
    setHasEntered(true);
  };

  // Audio context and click sound refs
  const bufferRef = useRef<AudioBuffer | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (!mounted) return;

    const Ctx = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new Ctx();
    ctxRef.current = ctx;

    fetch('/audio/main-click.mp3')
      .then(res => res.arrayBuffer())
      .then(buf => ctx.decodeAudioData(buf))
      .then(decoded => {
        bufferRef.current = decoded;
      })
      .catch(() => {
        // Silently fail if audio can't load
      });

    const handleGlobalClick = (e: MouseEvent) => {
      setClickEffect({ x: e.clientX, y: e.clientY, id: Date.now() });
      setTimeout(() => setClickEffect(null), 800);

      if (ctxRef.current && bufferRef.current) {
        if (ctxRef.current.state === 'suspended') ctxRef.current.resume();

        const source = ctxRef.current.createBufferSource();
        source.buffer = bufferRef.current;

        const gainNode = ctxRef.current.createGain();
        gainNode.gain.value = 0.4;

        source.connect(gainNode);
        gainNode.connect(ctxRef.current.destination);

        source.start(0);
      }
    };

    // Listen for section changes from index.tsx
    const handleSectionChange = (e: CustomEvent) => {
      setCurrentSection(e.detail);
    };

    document.addEventListener('click', handleGlobalClick, true);
    window.addEventListener('sectionChange', handleSectionChange as EventListener);

    // Font preload
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'font';
    link.type = 'font/otf';
    link.href = '/fonts/ndot-55.otf';
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);

    return () => {
      document.removeEventListener('click', handleGlobalClick, true);
      window.removeEventListener('sectionChange', handleSectionChange as EventListener);
    };
  }, [mounted]);

  if (!mounted) {
    return null;
  }

  return (
    <>
      <DotGridBackground isInverted={isInverted} />

      {/* Main Content - visible immediately but blurred during loader */}
      <div
        className={`relative w-full min-h-screen transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] ${!hasEntered
            ? 'blur-md scale-105 brightness-75 pointer-events-none overflow-hidden h-screen'
            : 'blur-0 scale-100 brightness-100'
          }`}
      >
        <Component {...pageProps} hasEntered={hasEntered} isInverted={isInverted} isTransitioning={false} />
      </div>

      <CursorTrail />
      {clickEffect && <ClickTesseract key={clickEffect.id} x={clickEffect.x} y={clickEffect.y} />}

      {/* Audio Reactive Wave - only visible after entering portfolio */}
      {hasEntered && <AudioWave isPlaying={isMusicPlaying} analyserNode={analyserNode} />}

      {/* Background Music - starts after Enter */}
      <BackgroundMusic
        shouldPlay={hasEntered}
        isInverted={isInverted}
        onAnalyserReady={setAnalyserNode}
        onPlayingChange={setIsMusicPlaying}
      />

      {/* Cinematic Loader - shows only on first visit */}
      <AnimatePresence>
        {showLoader && (
          <CinematicLoader key="cinematic-loader" onComplete={handleLoaderComplete} />
        )}
      </AnimatePresence>
    </>
  )
}

import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { useEffect, useState, useRef, useCallback } from 'react'
import dynamic from 'next/dynamic'
import ClickTesseract from '@/components/ClickTesseract'
import EnterScreen from '@/components/EnterScreen'
import AudioWave from '@/components/AudioWave'

// Dynamic imports for client-side only components
const CursorTrail = dynamic(() => import('@/components/CursorTrail'), { ssr: false });
const DotGridBackground = dynamic(() => import('@/components/DotGridBackground'), { ssr: false });
const AudioJack = dynamic(() => import('@/components/AudioJack'), { ssr: false });

export default function App({ Component, pageProps }: AppProps) {
  const [clickEffect, setClickEffect] = useState<{ x: number, y: number, id: number } | null>(null);
  const [hasEntered, setHasEntered] = useState(false);
  const [showLoader, setShowLoader] = useState(true); // Start with loader visible
  const [mounted, setMounted] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
  const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);

  // Theme is inverted (light background) for: Identity(0), Projects(2), Connect(4)
  // Dark background for: Skills(1), Education(3)
  const isInverted = currentSection === 0 || currentSection === 2 || currentSection === 4;

  // Set mounted on client side
  useEffect(() => {
    setMounted(true);
    // Enter screen always shows on page load/reload
    // showLoader is already true by default
  }, []);

  // Handle loader completion - when user clicks enter
  const handleLoaderComplete = () => {
    setShowLoader(false);
    setHasEntered(true);
  };

  // Audio refs for jack-controlled music
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const audioInitializedRef = useRef(false);

  // Initialize audio element
  useEffect(() => {
    if (!mounted) return;

    const audio = new Audio('/audio/a-dream-about-you.mp3');
    audio.loop = true;
    audio.volume = 0.3;
    audio.preload = 'auto';
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, [mounted]);

  // Setup audio context and analyser
  const setupAudioContext = useCallback(() => {
    if (audioInitializedRef.current || !audioRef.current) return;

    const Ctx = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new Ctx();
    audioContextRef.current = ctx;

    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.8;
    analyserRef.current = analyser;

    const source = ctx.createMediaElementSource(audioRef.current);
    sourceRef.current = source;
    source.connect(analyser);
    analyser.connect(ctx.destination);

    setAnalyserNode(analyser);
    audioInitializedRef.current = true;
  }, []);

  // Handle plug state change from AudioJack
  const handlePlugChange = useCallback((isPlugged: boolean) => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlugged) {
      // Setup audio context on first plug (required by browsers)
      setupAudioContext();

      if (audioContextRef.current?.state === 'suspended') {
        audioContextRef.current.resume();
      }

      // Skip intro, fade in
      if (audio.currentTime < 5) {
        audio.currentTime = 5;
      }

      audio.volume = 0;
      audio.play()
        .then(() => {
          setIsMusicPlaying(true);
          // Fade in
          let vol = 0;
          const fadeIn = setInterval(() => {
            vol += 0.02;
            if (vol >= 0.3) {
              audio.volume = 0.3;
              clearInterval(fadeIn);
            } else {
              audio.volume = vol;
            }
          }, 50);
        })
        .catch(console.error);
    } else {
      // Fade out and pause
      let vol = audio.volume;
      const fadeOut = setInterval(() => {
        vol -= 0.03;
        if (vol <= 0) {
          audio.volume = 0;
          audio.pause();
          setIsMusicPlaying(false);
          clearInterval(fadeOut);
        } else {
          audio.volume = vol;
        }
      }, 30);
    }
  }, [setupAudioContext]);

  // Pre-loaded audio pool for instant click sounds (no lag)
  const audioPoolRef = useRef<HTMLAudioElement[]>([]);
  const audioIndexRef = useRef(0);
  const POOL_SIZE = 5;

  // Initialize audio pool on mount
  useEffect(() => {
    if (!mounted) return;

    // Create pool of pre-loaded audio elements
    const pool: HTMLAudioElement[] = [];
    for (let i = 0; i < POOL_SIZE; i++) {
      const audio = new Audio('/audio/main-click.mp3');
      audio.preload = 'auto';
      audio.volume = 0.4;
      pool.push(audio);
    }
    audioPoolRef.current = pool;

    // Pre-warm the pool by loading all audio
    pool.forEach(audio => {
      audio.load();
    });

    return () => {
      pool.forEach(audio => {
        audio.pause();
        audio.src = '';
      });
    };
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;

    const handleGlobalClick = (e: MouseEvent) => {
      // Click effects only after entering
      if (hasEntered) {
        setClickEffect({ x: e.clientX, y: e.clientY, id: Date.now() });
        setTimeout(() => setClickEffect(null), 800);
      }

      // INSTANT Click Sound - use pre-loaded audio pool
      const pool = audioPoolRef.current;
      if (pool.length > 0) {
        const audio = pool[audioIndexRef.current];
        audioIndexRef.current = (audioIndexRef.current + 1) % POOL_SIZE;
        
        // Reset and play immediately
        audio.currentTime = 0;
        audio.play().catch(() => {});
      }
    };

    // Listen for section changes from index.tsx
    const handleSectionChange = (e: CustomEvent) => {
      setCurrentSection(e.detail);
    };

    document.addEventListener('click', handleGlobalClick, true);
    window.addEventListener('sectionChange', handleSectionChange as EventListener);

    // Font preload during loader
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
  }, [mounted, hasEntered]);

  // Don't render anything until mounted (prevents hydration issues)
  if (!mounted) {
    return (
      <div className="fixed inset-0 bg-neutral-900" />
    );
  }

  return (
    <>
      {/* Background - loads during loader phase */}
      <DotGridBackground isInverted={isInverted} />

      {/* Main Content - COMPLETELY HIDDEN until loader completes */}
      <div
        className={`relative w-full min-h-screen transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] ${!hasEntered
          ? 'blur-md scale-105 brightness-75 pointer-events-none overflow-hidden h-screen'
          : 'blur-0 scale-100 brightness-100'
          }`}
      >
        <Component {...pageProps} hasEntered={hasEntered} isInverted={isInverted} isTransitioning={false} />
      </div>

      {/* Effects - only active after entering */}
      {hasEntered && <CursorTrail />}
      {hasEntered && clickEffect && <ClickTesseract key={clickEffect.id} x={clickEffect.x} y={clickEffect.y} />}

      {/* Audio Reactive Wave - only visible after entering portfolio and only on desktop */}
      {hasEntered && (
        <div className="hidden md:block">
          <AudioWave isPlaying={isMusicPlaying} analyserNode={analyserNode} />
        </div>
      )}

      {/* Audio Jack - interactive music control (desktop only) */}
      {hasEntered && (
        <div className="hidden md:block">
          <AudioJack
            onPlugChange={handlePlugChange}
            isPlaying={isMusicPlaying}
            currentSection={currentSection}
          />
        </div>
      )}

      {/* Mobile Music Button - simple on/off toggle (mobile only) */}
      {hasEntered && (
        <button
          onClick={() => handlePlugChange(!isMusicPlaying)}
          className="md:hidden fixed bottom-6 left-6 z-[70] flex items-center gap-2 px-4 py-2 rounded-full border border-white/30 bg-black/30 backdrop-blur-sm transition-all duration-300 hover:border-white/50 hover:bg-black/50"
          style={{
            fontFamily: '"Space Mono", monospace',
          }}
        >
          {/* Music icon */}
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`text-white transition-opacity duration-300 ${isMusicPlaying ? 'opacity-100' : 'opacity-60'}`}
          >
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
          </svg>
          <span className={`text-xs tracking-wide ${isMusicPlaying ? 'text-white' : 'text-white/60'}`}>
            {isMusicPlaying ? 'ON' : 'OFF'}
          </span>
        </button>
      )}

      {/* Original Enter Screen - Shows on first visit per session */}
      {showLoader && (
        <EnterScreen onEnter={handleLoaderComplete} />
      )}
    </>
  )
}

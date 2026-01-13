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

const SESSION_KEY = 'portfolio_session_loaded';

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

  // Check if this is first visit this session
  useEffect(() => {
    setMounted(true);

    // Check session storage for first visit
    const hasLoaded = sessionStorage.getItem(SESSION_KEY);

    if (hasLoaded) {
      // Already visited this session - skip loader immediately
      setShowLoader(false);
      setHasEntered(true);
    }
    // If first visit, loader stays visible (showLoader is already true)
  }, []);

  // Handle loader completion - ONLY called after 2000ms minimum
  const handleLoaderComplete = () => {
    sessionStorage.setItem(SESSION_KEY, 'true');
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

      {/* Audio Reactive Wave - only visible after entering portfolio */}
      {hasEntered && <AudioWave isPlaying={isMusicPlaying} analyserNode={analyserNode} />}

      {/* Audio Jack - interactive music control */}
      {hasEntered && (
        <AudioJack
          onPlugChange={handlePlugChange}
          isPlaying={isMusicPlaying}
          currentSection={currentSection}
        />
      )}

      {/* Original Enter Screen - Shows on first visit per session */}
      {showLoader && (
        <EnterScreen onEnter={handleLoaderComplete} />
      )}
    </>
  )
}

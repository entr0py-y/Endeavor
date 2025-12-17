import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { useEffect, useState, useRef } from 'react'
import dynamic from 'next/dynamic'
import { AnimatePresence } from 'framer-motion'
import ClickTesseract from '@/components/ClickTesseract'
import EnterScreen from '@/components/EnterScreen'
import BackgroundMusic from '@/components/BackgroundMusic'

// Use lazy loading for EnterScreen to ensure client-side rendering if needed, 
// though standard import is fine. dynamic import used for others.
const CursorTrail = dynamic(() => import('@/components/CursorTrail'), { ssr: false });
const DotGridBackground = dynamic(() => import('@/components/DotGridBackground'), { ssr: false });
const AmbientTorus = dynamic(() => import('@/components/AmbientTorus'), { ssr: false });

export default function App({ Component, pageProps }: AppProps) {
  const [clickEffect, setClickEffect] = useState<{ x: number, y: number, id: number } | null>(null);
  const [hasEntered, setHasEntered] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Correct implementation with Refs to avoid stale closures
  const bufferRef = useRef<AudioBuffer | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    setMounted(true);
    const Ctx = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new Ctx();
    ctxRef.current = ctx;

    fetch('/audio/main-click.mp3')
      .then(res => res.arrayBuffer())
      .then(buf => ctx.decodeAudioData(buf))
      .then(decoded => {
        bufferRef.current = decoded;
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

    document.addEventListener('click', handleGlobalClick, true);

    // Font preload
    if (typeof window !== 'undefined') {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'font';
      link.type = 'font/otf';
      link.href = '/fonts/ndot-55.otf';
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    }

    return () => document.removeEventListener('click', handleGlobalClick, true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <>
      <DotGridBackground />
      {/* Main Content with Blur Transition */}
      <div
        className={`relative w-full min-h-screen transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] ${!hasEntered ? 'blur-md scale-105 brightness-75 pointer-events-none overflow-hidden h-screen' : 'blur-0 scale-100 brightness-100'
          }`}
      >
        <Component {...pageProps} hasEntered={hasEntered} />
      </div>

      <CursorTrail />
      {clickEffect && <ClickTesseract key={clickEffect.id} x={clickEffect.x} y={clickEffect.y} />}

      {/* Background Music - starts after Enter */}
      <BackgroundMusic shouldPlay={hasEntered} />

      {/* Enter Screen Overlay */}
      <AnimatePresence>
        {!hasEntered && <EnterScreen key="enter-screen" onEnter={() => setHasEntered(true)} />}
      </AnimatePresence>
    </>
  )
}

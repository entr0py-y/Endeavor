import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { AnimatePresence } from 'framer-motion'
import ClickTesseract from '@/components/ClickTesseract'
import EnterScreen from '@/components/EnterScreen'
import BackgroundMusic from '@/components/BackgroundMusic'

// Use lazy loading for EnterScreen to ensure client-side rendering if needed, 
// though standard import is fine. dynamic import used for others.
const CursorTrail = dynamic(() => import('@/components/CursorTrail'), { ssr: false });

export default function App({ Component, pageProps }: AppProps) {
  const [clickEffect, setClickEffect] = useState<{ x: number, y: number, id: number } | null>(null);
  const [hasEntered, setHasEntered] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Preload Ndot55 font
    if (typeof window !== 'undefined') {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'font';
      link.type = 'font/otf';
      link.href = '/fonts/ndot-55.otf';
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    }

    // Global click handler for tesseract effect
    const handleClick = (e: MouseEvent) => {
      setClickEffect({ x: e.clientX, y: e.clientY, id: Date.now() });
      setTimeout(() => setClickEffect(null), 800);
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <>
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
